import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.CPM_DATA_FILE || join(root, 'data', 'projects.json');
const port = Number(process.env.PORT || 8787);
const maxBodyBytes = 2 * 1024 * 1024;
const allowedPlans = new Set(['basic', 'pro', 'ultimate']);
const defaultOrigin = process.env.CPM_ALLOWED_ORIGIN || '*';
const currencyByCountry = {
  FR: 'EUR', BE: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
  MA: 'MAD', DZ: 'DZD', TN: 'TND', EG: 'EGP', SN: 'XOF', CI: 'XOF', CM: 'XAF', NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR',
  CH: 'CHF', GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD', JP: 'JPY', CN: 'CNY', IN: 'INR', KR: 'KRW',
  BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', CO: 'COP', AE: 'AED', SA: 'SAR', TR: 'TRY', IL: 'ILS', SG: 'SGD'
};
const factors = { EUR: 1, CHF: 1.12, GBP: 1.02, USD: .94, CAD: .76, AUD: .82, NZD: .86, MAD: .34, DZD: .13, TND: .28, EGP: .18, XOF: .22, XAF: .22, NGN: .0011, GHS: .06, KES: .006, ZAR: .05, JPY: .88, CNY: .34, INR: .21, KRW: .0008, BRL: .29, MXN: .25, ARS: .16, CLP: .22, COP: .18, AED: .26, SAR: .25, TRY: .03, ILS: .25, SGD: .70 };
const base = { basic: [2900, 149], pro: [6900, 290], ultimate: [18900, 690] };
const memoryRate = new Map();

async function loadProjects() {
  try {
    const parsed = JSON.parse(await readFile(dataFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
async function saveProjects(projects) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(projects, null, 2));
}
function headers() {
  return { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': defaultOrigin, 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type', 'x-content-type-options': 'nosniff' };
}
function json(res, status, body) { res.writeHead(status, headers()); if (status !== 204) res.end(JSON.stringify(body)); else res.end(); }
function pricing(country = 'FR', sector = '', plan = 'basic') {
  const code = String(country).toUpperCase().slice(0, 2);
  const currency = currencyByCountry[code] || 'USD';
  const multiplier = 1 + Math.min(String(sector).length, 24) / 240;
  const values = base[plan] || base.basic;
  return { country: code, sector: String(sector || 'general'), plan, currency, setup: Math.round(values[0] * (factors[currency] || 1) * multiplier), monthly: Math.round(values[1] * (factors[currency] || 1) * multiplier) };
}
function validateProject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid JSON object';
  if (!String(body.name || '').trim()) return 'name is required';
  if (!String(body.sector || '').trim()) return 'sector is required';
  if (body.plan && !allowedPlans.has(String(body.plan).toLowerCase())) return 'plan must be basic, pro or ultimate';
  if (body.country && !/^[A-Za-z]{2}$/.test(String(body.country))) return 'country must be an ISO 3166-1 alpha-2 code';
  return null;
}
async function readBody(req) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > maxBodyBytes) throw Object.assign(new Error('payload too large'), { status: 413 }); chunks.push(chunk); }
  if (!size) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('invalid JSON'), { status: 400 }); }
}
function rateLimited(req) {
  const key = req.socket.remoteAddress || 'unknown'; const now = Date.now(); const current = memoryRate.get(key);
  if (!current || now - current.started > 60_000) { memoryRate.set(key, { started: now, count: 1 }); return false; }
  current.count += 1; return current.count > 120;
}
async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204);
  if (rateLimited(req)) return json(res, 429, { error: 'rate limit exceeded' });
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, service: 'cavapasmarcher-api', version: '1.0' });
  if (req.method === 'GET' && url.pathname === '/api/pricing') return json(res, 200, { pricing: pricing(url.searchParams.get('country'), url.searchParams.get('sector'), url.searchParams.get('plan') || 'basic') });
  if (parts[0] !== 'api' || parts[1] !== 'projects') return json(res, 404, { error: 'route not found' });
  const projects = await loadProjects();
  if (req.method === 'GET' && parts.length === 2) return json(res, 200, { projects });
  if (req.method === 'POST' && parts.length === 2) {
    const body = await readBody(req); const error = validateProject(body); if (error) return json(res, 400, { error });
    const now = new Date().toISOString(); const project = { ...body, id: randomUUID(), country: String(body.country || 'FR').toUpperCase(), plan: String(body.plan || 'basic').toLowerCase(), createdAt: now, updatedAt: now, pricing: pricing(body.country, body.sector, String(body.plan || 'basic').toLowerCase()) };
    projects.unshift(project); await saveProjects(projects); return json(res, 201, project);
  }
  const id = parts[2]; const index = projects.findIndex((project) => project.id === id);
  if (index < 0) return json(res, 404, { error: 'project not found' });
  if (req.method === 'GET' && parts.length === 3) return json(res, 200, projects[index]);
  if (req.method === 'DELETE' && parts.length === 3) { projects.splice(index, 1); await saveProjects(projects); return json(res, 204); }
  if (req.method === 'PUT' && parts.length === 3) {
    const body = await readBody(req); const error = validateProject(body); if (error) return json(res, 400, { error });
    projects[index] = { ...projects[index], ...body, id, country: String(body.country || projects[index].country).toUpperCase(), plan: String(body.plan || projects[index].plan).toLowerCase(), updatedAt: new Date().toISOString(), pricing: pricing(body.country || projects[index].country, body.sector || projects[index].sector, String(body.plan || projects[index].plan).toLowerCase()) };
    await saveProjects(projects); return json(res, 200, projects[index]);
  }
  if (parts[3] === 'site' && req.method === 'PUT') {
    const body = await readBody(req); if (typeof body.html !== 'string' || body.html.length > maxBodyBytes) return json(res, 400, { error: 'html must be a string under 2 MB' });
    projects[index].site = { html: body.html, updatedAt: new Date().toISOString() }; projects[index].updatedAt = projects[index].site.updatedAt; await saveProjects(projects); return json(res, 200, projects[index].site);
  }
  if (parts[3] === 'site' && req.method === 'GET') return json(res, 200, projects[index].site || { html: null });
  return json(res, 404, { error: 'route not found' });
}
http.createServer((req, res) => handler(req, res).catch((error) => json(res, error.status || 500, { error: error.status ? error.message : 'internal server error' }))).listen(port, () => console.log(`CavaPasMarcher API listening on http://localhost:${port}`));
