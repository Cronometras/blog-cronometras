const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(name, firestoreFetch) {
  let source = fs.readFileSync(`${__dirname}/../functions/api/${name}.ts`, 'utf8');
  if (name === 'assistant') source += '\nexport { saveLead };';
  const sandbox = { exports: {}, require: () => ({ documentationContext: () => '' }),
    console, TextEncoder, Response, URL, Date, setTimeout,
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    crypto: { subtle: { importKey: async () => ({}), sign: async () => new Uint8Array([1]) } },
    fetch: async (url, options) => url.includes('oauth2.googleapis.com')
      ? { json: async () => ({ access_token: 'fake' }) } : firestoreFetch(url, options),
  };
  vm.createContext(sandbox);
  vm.runInContext(ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, sandbox);
  return sandbox.exports;
}
const sa = { private_key: 'AQ==', project_id: 'test', client_email: 'test@example.com' };

for (const name of ['contact', 'information-request', 'newsletter']) {
  test(`${name} atomically saves a pending notification with the lead`, async () => {
    let saved;
    const handler = load(name, async (_, options) => {
      saved = JSON.parse(options.body).fields;
      return { ok: true };
    });
    const request = { json: async () => ({ nombre: 'Test', email: 'test@example.com', privacyPolicy: true }) };
    const response = await handler.onRequestPost({ request, env: { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(sa) } });
    assert.equal(response.status, 200);
    assert.equal(saved.notificationStatus.stringValue, 'pending');
    assert.equal(saved.notificado.booleanValue, false);
    assert.equal(saved.email.stringValue, 'test@example.com');
  });
}

test('assistant queues first request and preserves notification metadata on later turns', async () => {
  let existed = false, saved, updateURL;
  const handler = load('assistant', async (url, options) => {
    if (!options?.method) return { ok: existed, status: existed ? 200 : 404,
      json: async () => ({ fields: { estado: { stringValue: 'parcial' }, createdAt: { stringValue: '2026-01-01' } } }) };
    saved = JSON.parse(options.body).fields; updateURL = url;
    return { ok: true };
  });
  await handler.saveLead({}, sa, 'session', { email: 'test@example.com' }, 'Hola', 'Hola', '/es/', 'cronometras.com');
  assert.equal(saved.notificationStatus.stringValue, 'pending');
  assert.equal(saved.notificado.booleanValue, false);
  existed = true;
  await handler.saveLead({}, sa, 'session', { email: 'test@example.com' }, 'Más información', 'Más información', '/es/', 'cronometras.com');
  assert(!saved.notificationStatus);
  assert(!saved.notificado);
  assert(updateURL.includes('updateMask.fieldPaths='));
  assert(!updateURL.includes('updateMask.fieldPaths=notificado'));
});
