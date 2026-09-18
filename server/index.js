import http from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.CPM_DATA_FILE || join(root, 'data', 'projects.json');
const port = Number(process.env.PORT || 8787);
const maxBodyBytes = 2 * 1024 * 1024;
const authToken = String(process.env.CPM_AUTH_TOKEN || '');
const origin = process.env.CPM_ALLOWED_ORIGIN || '*';
const plans = new Set(['basic', 'pro', 'ultimate']);
const currencies = { FR:'EUR', BE:'EUR', DE:'EUR', ES:'EUR', IT:'EUR', PT:'EUR', NL:'EUR', MA:'MAD', DZ:'DZD', TN:'TND', EG:'EGP', SN:'XOF', CI:'XOF', CM:'XAF', NG:'NGN', ZA:'ZAR', CH:'CHF', GB:'GBP', US:'USD', CA:'CAD', AU:'AUD', NZ:'NZD', JP:'JPY', CN:'CNY', IN:'INR', KR:'KRW', BR:'BRL', MX:'MXN', AR:'ARS', CL:'CLP', CO:'COP', AE:'AED', SA:'SAR', TR:'TRY', IL:'ILS', SG:'SGD' };
const factors = { EUR:1, CHF:1.12, GBP:1.02, USD:.94, CAD:.76, AUD:.82, NZD:.86, MAD:.34, DZD:.13, TND:.28, EGP:.18, XOF:.22, XAF:.22, NGN:.0011, ZAR:.05, JPY:.88, CNY:.34, INR:.21, KRW:.0008, BRL:.29, MXN:.25, ARS:.16, CLP:.22, COP:.18, AED:.26, SAR:.25, TRY:.03, ILS:.25, SGD:.7 };
const base = { basic:[2900,149], pro:[6900,290], ultimate:[18900,690] };
const rate = new Map();

const json = (res, status, body) => { res.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'access-control-allow-origin':origin, 'access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers':'content-type,authorization', 'x-content-type-options':'nosniff' }); status === 204 ? res.end() : res.end(JSON.stringify(body)); };
const same = (a, b) => { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); };
function authorized(req) { if (!authToken) return true; const value = String(req.headers.authorization || ''); return value.startsWith('Bearer ') && same(value.slice(7), authToken); }
function limited(req) { const key = req.socket.remoteAddress || 'unknown'; const now = Date.now(); const item = rate.get(key); if (!item || now - item.started > 60000) { rate.set(key, { started:now, count:1 }); return false; } item.count += 1; return item.count > 120; }
async function load() { try { const value = JSON.parse(await readFile(dataFile, 'utf8')); return Array.isArray(value) ? value : []; } catch { return []; } }
async function save(value) { await mkdir(dirname(dataFile), { recursive:true }); await writeFile(dataFile, JSON.stringify(value, null, 2)); }
async function body(req) { let size = 0; const chunks = []; for await (const chunk of req) { size += chunk.length; if (size > maxBodyBytes) throw Object.assign(new Error('payload too large'), { status:413 }); chunks.push(chunk); } if (!size) return {}; try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw Object.assign(new Error('invalid JSON'), { status:400 }); } }
function pricing(country = 'FR', sector = '', plan = 'basic') { const code = String(country).toUpperCase().slice(0,2); const currency = currencies[code] || 'USD'; const values = base[plan] || base.basic; const boost = /restaurant|hotel|hôtel|beauty|salon|automobile|garage|dent|clinique|cabinet|jurid|immobilier|finance/i.test(String(sector)) ? 1.18 : 1.08; const factor = factors[currency] || 1; return { country:code, sector:String(sector || 'general'), plan, currency, setup:Math.round(values[0] * factor * boost), monthly:Math.round(values[1] * factor * boost) }; }
function valid(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Invalid JSON object'; if (!String(value.name || '').trim()) return 'name is required'; if (!String(value.sector || '').trim()) return 'sector is required'; if (value.plan && !plans.has(String(value.plan).toLowerCase())) return 'plan must be basic, pro or ultimate'; if (value.country && !/^[A-Za-z]{2}$/.test(String(value.country))) return 'country must be an ISO alpha-2 code'; return null; }
function project(input, previous = {}) { const now = new Date().toISOString(); const plan = String(input.plan || previous.plan || 'basic').toLowerCase(); const country = String(input.country || previous.country || 'FR').toUpperCase(); return { ...previous, ...input, id:previous.id || randomUUID(), country, plan, createdAt:previous.createdAt || now, updatedAt:now, pricing:pricing(country, input.sector || previous.sector, plan), versions:Array.isArray(previous.versions) ? previous.versions : [] }; }
function publicProject(value) { const { versions, ...rest } = value; return { ...rest, versionCount:Array.isArray(versions) ? versions.length : 0 }; }
async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204);
  if (req.method === 'GET' && new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname === '/api/health') return json(res, 200, { ok:true, service:'cavapasmarcher-api', version:'1.2', authRequired:Boolean(authToken) });
  if (!authorized(req)) return json(res, 401, { error:'authentication required' });
  if (limited(req)) return json(res, 429, { error:'rate limit exceeded' });
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); const parts = url.pathname.split('/').filter(Boolean);
  if (req.method === 'GET' && url.pathname === '/api/pricing') return json(res, 200, { pricing:pricing(url.searchParams.get('country'), url.searchParams.get('sector'), url.searchParams.get('plan') || 'basic') });
  if (parts[0] !== 'api' || parts[1] !== 'projects') return json(res, 404, { error:'route not found' });
  const projects = await load();
  if (req.method === 'GET' && parts.length === 2) return json(res, 200, { projects:projects.map(publicProject) });
  if (req.method === 'POST' && parts.length === 2) { const input = await body(req); const error = valid(input); if (error) return json(res, 400, { error }); const created = project(input); projects.unshift(created); await save(projects); return json(res, 201, publicProject(created)); }
  const index = projects.findIndex((item) => item.id === parts[2]); if (index < 0) return json(res, 404, { error:'project not found' }); const current = projects[index];
  if (req.method === 'GET' && parts.length === 3) return json(res, 200, publicProject(current));
  if (req.method === 'PUT' && parts.length === 3) { const input = await body(req); const error = valid(input); if (error) return json(res, 400, { error }); projects[index] = project(input, current); await save(projects); return json(res, 200, publicProject(projects[index])); }
  if (req.method === 'DELETE' && parts.length === 3) { projects.splice(index, 1); await save(projects); return json(res, 204); }
  if (parts[3] === 'site' && req.method === 'GET') return json(res, 200, current.site || { html:null });
  if (parts[3] === 'site' && req.method === 'PUT') { const input = await body(req); if (typeof input.html !== 'string' || input.html.length > maxBodyBytes) return json(res, 400, { error:'html must be a string under 2 MB' }); current.site = { html:input.html, updatedAt:new Date().toISOString() }; current.updatedAt = current.site.updatedAt; await save(projects); return json(res, 200, current.site); }
  if (parts[3] === 'versions' && req.method === 'GET') return json(res, 200, { versions:(current.versions || []).map(({ html, ...item }) => item) });
  if (parts[3] === 'versions' && req.method === 'POST') { const input = await body(req); if (typeof input.html !== 'string' || !input.html.trim() || input.html.length > maxBodyBytes) return json(res, 400, { error:'html is required and must be under 2 MB' }); const versions = current.versions || []; if (versions[0]?.html === input.html) return json(res, 200, versions[0]); const item = { id:randomUUID(), createdAt:new Date().toISOString(), name:String(input.name || current.name), project:input.project || {}, html:input.html }; versions.unshift(item); current.versions = versions.slice(0, 30); current.updatedAt = item.createdAt; await save(projects); return json(res, 201, item); }
  if (parts[3] === 'versions' && parts[4] && req.method === 'GET') { const item = (current.versions || []).find((version) => version.id === parts[4]); return item ? json(res, 200, item) : json(res, 404, { error:'version not found' }); }
  return json(res, 404, { error:'route not found' });
}
http.createServer((req, res) => handler(req, res).catch((error) => json(res, error.status || 500, { error:error.status ? error.message : 'internal server error' }))).listen(port, () => console.log(`CavaPasMarcher API listening on http://localhost:${port}`));
