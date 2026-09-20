import { readFile, readdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const root = dirname(serverDirectory);
const ignored = new Set(['node_modules', '.git']);
const failures = [];
const exists = async (filePath) => { try { await readFile(filePath); return true; } catch { return false; } };

async function filesIn(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.startsWith('.')) continue;
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(filePath));
    else if (entry.name.endsWith('.js')) result.push(filePath);
  }
  return result;
}

function checkSyntax(filePath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--check', filePath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolve({ code, stderr }));
  });
}

const index = await readFile(join(root, 'index.html'), 'utf8');
const references = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => path !== '#' && !/^(https?:)?\/\//.test(path));

for (const reference of references) {
  if (!await exists(join(root, reference))) failures.push(`missing asset: ${reference}`);
}
for (const filePath of await filesIn(root)) {
  const result = await checkSyntax(filePath);
  if (result.code !== 0) failures.push(`syntax error in ${relative(root, filePath)}\n${result.stderr.trim()}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Static audit passed: ${references.length} referenced assets and JavaScript syntax checks are valid.`);
}
