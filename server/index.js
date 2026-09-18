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
const currencyByCountry = { FR:'EUR', BE:'EUR', DE:'EUR', ES:'EUR', IT:'EUR', PT:'EUR', NL:'EUR', AT:'EUR', IE:'EUR', FI:'EUR', GR:'EUR', LU:'EUR', MA:'MAD', DZ:'DZD', TN:'TND', EG:'EGP', SN:'XOF', CI:'XOF', CM:'XAF', NG:'NGN', GH:'GHS', KE:'KES', ZA:'ZAR', CH:'CHF', GB:'GBP', US:'USD', CA:'CAD', AU:'AUD', NZ:'NZD', JP:'JPY', CN:'CNY', IN:'INR', KR:'KRW', BR:'BRL', MX:'MXN', AR:'ARS', CL:'CLP', CO:'COP', AE:'AED', SA:'SAR', TR:'TRY', IL:'ILS', SG:'SGD' };
const factors = { EUR:1, CHF:1.12, GBP:1.02, USD:.94, CAD:.76, AUD:.82, NZD:.86, MAD:.34, DZD:.13, TND:.28, EGP:.18, XOF:.22, XAF:.22, NGN:.0011, GHS:.06, KES:.006, ZAR:.05, JPY:.88, CNY:.34, INR:.21, KRW:.0008, BRL:.29, MXN:.25, ARS:.16, CLP:.22, COP:.18, AED:.26, SAR:.25, TRY:.03, ILS:.25, SGD:.7 };
const base = { basic:[2900,149], pro:[6900,290], ultimate:[18900,690] };
const rate = new Map();

async function loadProjects() { try { const data = JSON.parse(await readFile(dataFile, 'utf8')); return Array.isArray(data) ? data : []; } catch { return []; } }
async function saveProjects(projects) { await mkdir(dirname(dataFile), { recursive:true }); await writeFile(dataFile, JSON.stringify(projects, null, 2)); }
function headers() { return { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'access-control-allow-origin':defaultOrigin, 'access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers':'content-type', 'x-content-type-options':'nosniff' }; }
function json(res, status, body) { res.writeHead(status, headers()); if (status !== 204) res.end(JSON.stringify(body)); else res.end(); }
function pricing(country = 'FR', sector = '', plan = 'basic') { const code = String(country).toUpperCase().slice(0,2); const currency = currencyByCountry[code] || 'USD'; const values = base[plan] || base.basic; const boost = /restaurant|hotel|hôtel|beauty|salon|automobile|garage|dent|clinique|cabinet|jurid|immobilier|finance/i.test(String(sector)) ? 1.18 : 1.08; const factor = factors[currency] || 1; return { country:code, sector:String(sector || 'general'), plan, currency, setup:Math.round(values[0] * factor * boost), monthly:Math.round(values[1] * factor * boost) }; }
function validateProject(body) { if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid JSON object'; if (!String(body.name || '').trim()) return 'name is required'; if (!String(body.sector || '').trim()) return 'sector is required'; if (body.plan && !allowedPlans.has(String(body.plan).toLowerCase())) return 'plan must be basic, pro or ultimate'; if (body.country && !/^[A-Za-z]{2}$/.test(String(body.country))) return 'country must be an ISO alpha-2 code'; return null; }
async function readBody(req) { let size = 0; const chunks = []; for await (const chunk of req) { size += chunk.length; if (size > maxBodyBytes) throw Object.assign(new Error('payload too large'), { status:413 }); chunks.push(chunk); } if (!size) return {}; try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('invalid JSON'), { status:400 }); } }
function limited(req) { const key = req.socket.remoteAddress || 'unknown'; const now = Date.now(); const item = rate.get(key); if (!item || now - item.started > 60000) { rate.set(key, { started:now, count:1 }); return false; } item.count += 1; return item.count > 120; }
function projectWithDefaults(body, previous = {}) { const plan = String(body.plan || previous.plan || 'basic').toLowerCase(); const country = String(body.country || previous.country || 'FR').toUpperCase(); const now = new Date().toISOString(); return { ...previous, ...body, id:previous.id || randomUUID(), country, plan, createdAt:previous.createdAt || now, updatedAt:now, pricing:pricing(country, body.sector || previous.sector, plan), versions:Array.isArray(previous.versions) ? previous.versions : [] }; }
function cleanProject(project) { const { versions, ...publicProject } = project; return { ...publicProject, versionCount:Array.isArray(versions) ? versions.length : 0 }; }
async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204);
  if (limited(req)) return json(res, 429, { error:'rate limit exceeded' });
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); const parts = url.pathname.split('/').filter(Boolean);
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok:true, service:'cavapasmarcher-api', version:'1.1' });
  if (req.method === 'GET' && url.pathname === '/api/pricing') return json(res, 200, { pricing:pricing(url.searchParams.get('country'), url.searchParams.get('sector'), url.searchParams.get('plan') || 'basic') });
  if (parts[0] !== 'api' || parts[1] !== 'projects') return json(res, 404, { error:'route not found' });
  const projects = await loadProjects();
  if (req.method === 'GET' && parts.length === 2) return json(res, 200, { projects:projects.map(cleanProject) });
  if (req.method === 'POST' && parts.length === 2) { const body = await readBody(req); const error = validateProject(body); if (error) return json(res, 400, { error }); const project = projectWithDefaults(body); projects.unshift(project); await saveProjects(projects); return json(res, 201, cleanProject(project)); }
  const index = projects.findIndex((project) => project.id === parts[2]); if (index < 0) return json(res, 404, { error:'project not found' }); const project = projects[index];
  if (req.method === 'GET' && parts.length === 3) return json(res, 200, cleanProject(project));
  if (req.method === 'PUT' && parts.length === 3) { const body = await readBody(req); const error = validateProject(body); if (error) return json(res, 400, { error }); projects[index] = projectWithDefaults(body, project); await saveProjects(projects); return json(res, 200, cleanProject(projects[index])); }
  if (req.method === 'DELETE' && parts.length === 3) { projects.splice(index, 1); await saveProjects(projects); return json(res, 204); }
  if (parts[3] === 'site' && req.method === 'GET') return json(res, 200, project.site || { html:null });
  if (parts[3] === 'site' && req.method === 'PUT') { const body = await readBody(req); if (typeof body.html !== 'string' || body.html.length > maxBodyBytes) return json(res, 400, { error:'html must be a string under 2 MB' }); project.site = { html:body.html, updatedAt:new Date().toISOString() }; project.updatedAt = project.site.updatedAt; await saveProjects(projects); return json(res, 200, project.site); }
  if (parts[3] === 'versions' && req.method === 'GET') return json(res, 200, { versions:(project.versions || []).map(({ html, ...version }) => version) });
  if (parts[3] === 'versions' && req.method === 'POST') { const body = await readBody(req); if (typeof body.html !== 'string' || !body.html.trim() || body.html.length > maxBodyBytes) return json(res, 400, { error:'html is required and must be under 2 MB' }); const version = { id:randomUUID(), createdAt:new Date().toISOString(), name:String(body.name || project.name), project:body.project || {}, html:body.html }; const versions = project.versions || []; if (versions[0]?.html === version.html) return json(res, 200, versions[0]); versions.unshift(version); project.versions = versions.slice(0, 30); project.updatedAt = version.createdAt; await saveProjects(projects); return json(res, 201, version); }
  if (parts[3] === 'versions' && parts[4] && req.method === 'GET') { const version = (project.versions || []).find((item) => item.id === parts[4]); return version ? json(res, 200, version) : json(res, 404, { error:'version not found' }); }
  return json(res, 404, { error:'route not found' });
}
http.createServer((req,res) => handler(req,res).catch((error) => json(res, error.status || 500, { error:error.status ? error.message : 'internal server error' }))).listen(port, () => console.log(`CavaPasMarcher API listening on http://localhost:${port}`));
