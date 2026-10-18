import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { BlobsServer } from '@netlify/blobs/server';
import { setEnvironmentContext } from '@netlify/blobs';
import auth from '../netlify/functions/owner-auth.mts';
import content from '../netlify/functions/portfolio-content.mts';
import upload from '../netlify/functions/portfolio-upload.mts';
import files from '../netlify/functions/portfolio-files.mts';
import { sessionToken, credentials, storeName } from '../netlify/lib/auth.mts';

const directory = await mkdtemp(join(tmpdir(), 'portfolio-owner-test-'));
const server = new BlobsServer({ directory, token: 'local-test-token', logger() {} });
const address = await server.start();
setEnvironmentContext({ siteID: 'local-test-site', token: 'local-test-token', edgeURL: `http://localhost:${address.port}`, uncachedEdgeURL: `http://localhost:${address.port}` });
process.env.CONTEXT = 'dev';
process.env.OWNER_SETUP_TOKEN = randomBytes(32).toString('hex');
process.env.OWNER_SESSION_SECRET = randomBytes(48).toString('hex');
const base = 'https://portfolio.example';
const password = 'test-only-strong-passphrase';
let cookie = '';
function req(path, method = 'GET', data, options = {}) {
  return new Request(base + path, { method, headers: { origin: base, cookie, ...(data ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, body: data ? JSON.stringify(data) : options.body });
}
async function login(data) { return auth(req('/api/owner/auth', 'POST', data)); }
try {
  assert.equal((await (await auth(req('/api/owner/auth'))).json()).setupRequired, true);
  assert.equal((await content(req('/api/portfolio', 'PUT', {}))).status, 401);
  assert.equal((await upload(req('/api/owner/upload', 'POST', {}))).status, 401);
  assert.equal((await login({ action: 'setup', username: 'owner', password, token: 'wrong' })).status, 403);
  assert.equal((await login({ action: 'setup', username: 'owner', password: 'short', token: process.env.OWNER_SETUP_TOKEN })).status, 400);
  let response = await login({ action: 'setup', username: 'owner', password, token: process.env.OWNER_SETUP_TOKEN });
  assert.equal(response.status, 201);
  assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.match(response.headers.get('set-cookie'), /Secure/);
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.equal((await (await auth(req('/api/owner/auth'))).json()).authenticated, true);
  assert.equal((await login({ action: 'setup', username: 'attacker', password, token: process.env.OWNER_SETUP_TOKEN })).status, 409);
  assert.equal((await login({ action: 'login', username: 'owner', password: 'wrong' })).status, 401);
  const initial = JSON.parse(await readFile(new URL('../src/data/portfolio.json', import.meta.url), 'utf8'));
  const changed = structuredClone(initial); changed.profile.name = 'Integration test owner';
  assert.equal((await content(req('/api/portfolio', 'PUT', changed, { headers: { origin: 'https://evil.example' } }))).status, 401);
  const malicious = structuredClone(initial); malicious.profile.resume = 'javascript:alert(1)';
  assert.equal((await content(req('/api/portfolio', 'PUT', malicious))).status, 400);
  assert.equal((await content(req('/api/portfolio', 'PUT', changed))).status, 200);
  assert.equal((await (await content(req('/api/portfolio'))).json()).content.profile.name, changed.profile.name);
  const badUpload = await upload(req('/api/owner/upload', 'POST', null, { headers: { 'Content-Type': 'application/pdf' }, body: 'not a PDF' }));
  assert.equal(badUpload.status, 400);
  const pdf = '%PDF-1.7\nlocal integration test';
  response = await upload(req('/api/owner/upload', 'POST', null, { headers: { 'Content-Type': 'application/pdf' }, body: pdf }));
  assert.equal(response.status, 201); const { url } = await response.json();
  response = await files(req(url), { params: { key: url.split('/').pop() } });
  assert.equal(response.status, 200); assert.equal(await response.text(), pdf);
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.equal((await files(req('/api/files/credentials'), { params: { key: 'credentials' } })).status, 404);
  const oldCookie = cookie;
  response = await login({ action: 'password', username: 'owner', currentPassword: password, password: 'updated-test-only-password' });
  assert.equal(response.status, 200);
  assert.equal((await (await auth(req('/api/owner/auth'))).json()).authenticated, false);
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.equal((await (await auth(req('/api/owner/auth'))).json()).authenticated, true);
  cookie = oldCookie + 'tampered';
  assert.equal((await content(req('/api/portfolio', 'PUT', changed))).status, 401);
  cookie = '';
  response = await login({ action: 'login', username: 'owner', password: 'updated-test-only-password' });
  assert.equal(response.status, 200);
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.match((await login({ action: 'logout' })).headers.get('set-cookie'), /Max-Age=0/);
  assert.equal(storeName('content'), 'portfolio-content-local');
  process.env.CONTEXT = 'deploy-preview'; assert.equal(storeName('content'), 'portfolio-content-preview');
  console.log('PASS: owner authentication, setup replay protection, protected publishing, origin checks, validation, uploads, public file serving, password rotation, tampered sessions, and context isolation.');
} finally {
  await server.stop();
  assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep) && basename(directory).startsWith('portfolio-owner-test-'), 'Cleanup must stay within the generated temporary test directory.');
  await rm(directory, { recursive: true, force: true });
}
