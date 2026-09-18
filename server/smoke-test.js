import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const directory = await mkdtemp(join(tmpdir(), 'cpm-test-')); const dataFile = join(directory, 'projects.json');
const child = spawn(process.execPath, ['server/index.js'], { env:{...process.env, PORT:'18787', CPM_DATA_FILE:dataFile}, stdio:['ignore','pipe','pipe'] });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(path, options) { for (let attempt=0; attempt<30; attempt += 1) { try { return await fetch(`http://127.0.0.1:18787${path}`, options); } catch { await wait(50); } } throw new Error('API did not start'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
try {
  assert((await request('/api/health')).status === 200, 'health endpoint failed');
  const createdResponse = await request('/api/projects', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({name:'Test Studio',sector:'restaurant',country:'FR',plan:'pro',language:'fr'}) }); assert(createdResponse.status === 201, 'project creation failed'); const created = await createdResponse.json(); assert(created.pricing.currency === 'EUR', 'pricing currency failed');
  const site = await request(`/api/projects/${created.id}/site`, { method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify({html:'<!doctype html><title>Test</title>'}) }); assert(site.status === 200, 'site save failed');
  const version = await request(`/api/projects/${created.id}/versions`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({name:'Test Studio',html:'<!doctype html><title>Test</title>',project:{plan:'pro'}}) }); assert(version.status === 201, 'version save failed');
  const versions = await (await request(`/api/projects/${created.id}/versions`)).json(); assert(versions.versions.length === 1 && !versions.versions[0].html, 'version listing should hide HTML');
  const list = await (await request('/api/projects')).json(); assert(list.projects.length === 1 && list.projects[0].versionCount === 1, 'project list/version count failed');
  assert((await request(`/api/projects/${created.id}`, {method:'DELETE'})).status === 204, 'project deletion failed'); console.log('API smoke tests passed');
} finally { child.kill('SIGTERM'); await rm(directory, {recursive:true,force:true}); }
