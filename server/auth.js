import { randomUUID, scrypt as scryptCallback, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const scrypt = promisify(scryptCallback);
const file = process.env.CPM_USERS_FILE || join(dirname(new URL(import.meta.url).pathname), 'data', 'users.json');
const sessions = new Map();
async function load() { try { const value = JSON.parse(await readFile(file, 'utf8')); return Array.isArray(value) ? value : []; } catch { return []; } }
async function save(value) { await mkdir(dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(value, null, 2)); }
async function hash(password) { const salt = randomBytes(16).toString('hex'); const key = (await scrypt(password, salt, 64)).toString('hex'); return `${salt}:${key}`; }
async function verify(password, stored) { const [salt, expected] = String(stored || '').split(':'); if (!salt || !expected) return false; const actual = (await scrypt(password, salt, 64)).toString('hex'); return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected)); }
function publicUser(user) { return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }; }
export async function register(input) { const email = String(input.email || '').trim().toLowerCase(); const password = String(input.password || ''); const name = String(input.name || '').trim(); if (!/^\S+@\S+\.\S+$/.test(email)) throw Object.assign(new Error('valid email is required'), { status: 400 }); if (password.length < 10) throw Object.assign(new Error('password must contain at least 10 characters'), { status: 400 }); const users = await load(); if (users.some((user) => user.email === email)) throw Object.assign(new Error('email already registered'), { status: 409 }); const user = { id: randomUUID(), email, name: name || email.split('@')[0], passwordHash: await hash(password), role: 'client', createdAt: new Date().toISOString() }; users.push(user); await save(users); return publicUser(user); }
export async function login(input) { const email = String(input.email || '').trim().toLowerCase(); const users = await load(); const user = users.find((item) => item.email === email); if (!user || !(await verify(String(input.password || ''), user.passwordHash))) throw Object.assign(new Error('invalid credentials'), { status: 401 }); const token = randomUUID() + randomUUID(); sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }); return { token, user: publicUser(user) }; }
export async function authenticate(req) { const header = String(req.headers.authorization || ''); const token = header.startsWith('Bearer ') ? header.slice(7) : ''; const session = sessions.get(token); if (!session || session.expiresAt < Date.now()) { if (token) sessions.delete(token); return null; } const user = (await load()).find((item) => item.id === session.userId); return user ? { ...publicUser(user), token } : null; }
export function logout(token) { if (token) sessions.delete(token); }
