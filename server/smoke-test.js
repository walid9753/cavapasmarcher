import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = await mkdtemp(join(tmpdir(), 'cpm-test-'));
const dataFile = join(directory, 'projects.json');
const child = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, PORT: '18787', CPM_DATA_FILE: dataFile }, stdio: ['ignore', 'pipe', 'pipe'] });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(path, options) { for (let attempt = 0; attempt < 30; attempt += 1) { try { return await fetch(`http://127.0.0.1:18787${path}`, options); } catch { await wait(50); } } throw new Error('API did not start'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
try {
  assert((await request('/api/health')).status === 200, 'health endpoint failed');
  const response = await request('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Test Studio', sector: 'restaurant', country: 'FR', plan: 'pro', language: 'fr' }) });
  assert(response.status === 201, 'project creation failed'); const project = await response.json(); assert(project.pricing.currency === 'EUR', 'pricing currency failed');
  const update = await request(`/api/projects/${project.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Updated Studio', sector: 'restaurant', country: 'MA', plan: 'ultimate' }) });
  assert(update.status === 200 && (await update.json()).pricing.currency === 'MAD', 'project update failed');
  const savedSite = await request(`/api/projects/${project.id}/site`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ html: '<!doctype html><title>Studio</title>' }) });
  assert(savedSite.status === 200, 'site artifact save failed'); assert((await (await request(`/api/projects/${project.id}/site`)).json()).html.includes('Studio'), 'site artifact read failed');
  assert((await (await request('/api/projects')).json()).projects.length === 1, 'project list failed');
  assert((await request(`/api/projects/${project.id}`, { method: 'DELETE' })).status === 204, 'project deletion failed');
  console.log('API smoke tests passed');
} finally { child.kill('SIGTERM'); await rm(directory, { recursive: true, force: true }); }
