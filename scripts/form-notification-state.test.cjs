const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(name, firestoreFetch, llmReply = { reply: 'Respuesta final de prueba', lead: {} }) {
  let source = fs.readFileSync(`${__dirname}/../functions/api/${name}.ts`, 'utf8');
  if (name === 'assistant') source += '\nexport { saveLead };';
  const sandbox = { exports: {}, require: () => ({ documentationContext: () => '' }),
    console, TextEncoder, Response, Request, URL, Date, setTimeout, AbortController, clearTimeout,
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    crypto: { subtle: { importKey: async () => ({}), sign: async () => new Uint8Array([1]) } },
    fetch: async (url, options) => url.includes('oauth2.googleapis.com')
      ? { json: async () => ({ access_token: 'fake' }) }
      : url.startsWith('https://llm.test') ? Response.json({ choices: [{ message: { content: JSON.stringify(llmReply) } }] })
      : firestoreFetch(url, options),
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
test('assistant queues new dialogue and preserves delivery state for unchanged dialogue', async () => {
  let existed = false, saved, updateURL;
  const handler = load('assistant', async (url, options) => {
    if (!options?.method) return { ok: existed, status: existed ? 200 : 404,
      json: async () => ({ fields: { nota: { stringValue: 'Hola' }, estado: { stringValue: 'parcial' }, createdAt: { stringValue: '2026-01-01' } } }) };
    saved = JSON.parse(options.body).fields; updateURL = url;
    return { ok: true };
  });
  await handler.saveLead({}, sa, 'session', { email: 'test@example.com' }, 'Hola', 'Hola', '/es/', 'cronometras.com');
  assert.equal(saved.notificationStatus.stringValue, 'pending');
  assert.equal(saved.notificado.booleanValue, false);
  existed = true;
  await handler.saveLead({}, sa, 'session', { email: 'test@example.com' }, 'Hola', 'Hola', '/es/', 'cronometras.com');
  assert(!saved.notificationStatus);
  assert(!saved.notificado);
  assert(updateURL.includes('updateMask.fieldPaths='));
  assert(!updateURL.includes('updateMask.fieldPaths=notificado'));
  await handler.saveLead({}, sa, 'session', { email: 'test@example.com' }, 'Usuario: Más información\n\nAsistente: Respuesta', 'Más información', '/es/', 'cronometras.com');
  assert.equal(saved.notificationStatus.stringValue, 'pending');
  assert.equal(saved.notificado.booleanValue, false);
});
test('full transcript includes early turns, long messages and the actual final assistant reply', async () => {
  let saved;
  const handler = load('assistant', async (_, options) => {
    if (!options?.method) return { ok: false, status: 404 };
    saved = JSON.parse(options.body).fields;
    return { ok: true };
  });
  const messages = [{ role: 'assistant', content: 'SALUDO INICIAL' },
    { role: 'user', content: 'Mi correo es test@example.com. ' + 'CONTENIDO LARGO '.repeat(150) }];
  for (let n = 0; n < 12; n++) messages.push({ role: 'assistant', content: `Respuesta ${n}` }, { role: 'user', content: `Pregunta ${n}` });
  const response = await handler.onRequestPost({ env: { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(sa), LLM_API_KEY: 'fake', LLM_BASE_URL: 'https://llm.test' },
    request: new Request('https://example.test/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: 'full-transcript', messages }) }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  const transcript = saved.nota.stringValue;
  assert(transcript.startsWith('Asistente: SALUDO INICIAL'));
  assert(transcript.includes(messages[1].content));
  assert(transcript.endsWith(`Asistente: ${result.reply}`));
  assert(transcript.indexOf('Asistente: Respuesta 0') < transcript.indexOf('Usuario: Pregunta 0'));
  assert(transcript.length > 2000);
});
