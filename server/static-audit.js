import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url).pathname;
const ignored = new Set(['node_modules', '.git']);
const failures = [];
const exists = async (path) => { try { await readFile(path); return true; } catch { return false; } };
async function filesIn(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes:true })) {
    if (ignored.has(entry.name) || entry.name.startsWith('.')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(path));
    else if (entry.name.endsWith('.js')) result.push(path);
  }
  return result;
}
function checkSyntax(path) { return new Promise((resolve) => { const child = spawn(process.execPath, ['--check', path], { stdio:['ignore','pipe','pipe'] }); let stderr = ''; child.stderr.on('data', (chunk) => { stderr += chunk; }); child.on('close', (code) => resolve({ code, stderr })); }); }
const index = await readFile(join(root, 'index.html'), 'utf8');
const references = [...index.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]).filter((path) => !/^(https?:)?\/\//.test(path));
for (const reference of references) if (!await exists(join(root, reference))) failures.push(`missing asset: ${reference}`);
for (const path of await filesIn(root)) { const result = await checkSyntax(path); if (result.code !== 0) failures.push(`syntax error in ${relative(root, path)}\n${result.stderr.trim()}`); }
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; } else console.log(`Static audit passed: ${references.length} referenced assets and JavaScript syntax checks are valid.`);
