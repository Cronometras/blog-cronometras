const test = require('node:test');
const assert = require('node:assert/strict');
const { renderMessage, deliver } = require('./send-lead-notifications.cjs');

function fixture() {
  let data = { nombre: 'Ana', email: 'ana@example.com', createdAt: new Date().toISOString(), notificationStatus: 'pending' };
  const ref = { path: 'contactos_cronometras/test', parent: { id: 'contactos_cronometras' } };
  const doc = { ref, id: 'test' };
  const db = { runTransaction: async fn => fn({
    get: async () => ({ data: () => ({ ...data }) }),
    update: (_, patch) => Object.assign(data, patch),
  }) };
  return { db, doc, data };
}

test('all notices use the central inbox and safe reply address', () => {
  const p = renderMessage('solicitudes_cronometras', 'id', { nombre: 'Ana\nB', email: 'ana@example.com', telefono: '123', mensaje: '<b>Hola</b>' });
  assert.deepEqual(p.to, ['info@cronometras.com']);
  assert.equal(p.reply_to, 'ana@example.com');
  assert.equal(renderMessage('contactos_cronometras', 'id', { email: 'ana@example.com.' }).reply_to, 'ana@example.com');
  assert(!p.subject.includes('\n'));
  assert(p.text.includes('123'));
  assert(!('html' in p));
  assert(!renderMessage('contactos_cronometras', 'id', { email: 'x@y.com\nBcc:z@y.com' }).reply_to);
});

test('success is recorded only after provider acceptance; second run skips', async () => {
  const { db, doc, data } = fixture();
  let calls = 0;
  global.fetch = async () => { calls++; assert.equal(data.notificado, undefined); return { ok: true, json: async () => ({ id: 'provider-id' }) }; };
  assert.equal(await deliver(db, doc, 'fake', new Date(0)), 'accepted');
  assert.equal(data.notificado, true);
  assert.equal(data.notificationProviderId, 'provider-id');
  assert.equal(await deliver(db, doc, 'fake', new Date(0)), 'skipped');
  assert.equal(calls, 1);
});

test('provider failure retries identical payload with the same idempotency key', async () => {
  const { db, doc, data } = fixture();
  const requests = [];
  global.fetch = async (_, options) => { requests.push(options); return { ok: false, status: 503, json: async () => ({ name: 'unavailable' }) }; };
  assert.equal(await deliver(db, doc, 'fake', new Date(0)), 'retry');
  assert.equal(data.notificado, false);
  data.nombre = 'Changed during retry';
  data.notificationNextAttempt = null;
  global.fetch = async (_, options) => { requests.push(options); return { ok: true, json: async () => ({ id: 'provider-id' }) }; };
  await deliver(db, doc, 'fake', new Date(0));
  assert.equal(requests[0].body, requests[1].body);
  assert.equal(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key']);
});

test('an in-flight old notice cannot mark a new completed request as sent', async () => {
  const { db, doc, data } = fixture();
  global.fetch = async () => {
    data.notificationRevision = 'complete'; data.notificationStatus = 'pending'; data.notificado = false;
    return { ok: true, json: async () => ({ id: 'old-id' }) };
  };
  await deliver(db, doc, 'fake', new Date(0));
  assert.equal(data.notificationStatus, 'pending');
  assert.equal(data.notificado, false);
});

test('legacy records and active leases do not send', async () => {
  const { db, doc, data } = fixture();
  global.fetch = async () => { throw new Error('should not send'); };
  delete data.notificationStatus;
  assert.equal(await deliver(db, doc, 'fake', new Date(Date.now() + 10000)), 'skipped');
  data.notificationLeaseUntil = { toMillis: () => Date.now() + 10000 };
  assert.equal(await deliver(db, doc, 'fake', new Date(0)), 'skipped');
});
