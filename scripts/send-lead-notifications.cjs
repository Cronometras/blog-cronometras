// Run every fifteen minutes on the existing Oracle host. Secrets stay outside the repository.
// Default is read-only audit; delivery requires --send and NOTIFICATIONS_SINCE.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const projectRequire = require('node:module').createRequire(path.join(
  process.env.CRONOMETRAS_PROJECT_DIR || path.join(__dirname, '..'), 'package.json'));
const { initializeApp, cert } = projectRequire('firebase-admin/app');
const { getFirestore, Timestamp } = projectRequire('firebase-admin/firestore');

const COLLECTIONS = {
  contactos_cronometras: 'Contacto',
  solicitudes_cronometras: 'Información / demo',
  leads_asistente_cronometras: 'Asistente',
  newsletter_cronometras: 'Suscripción al boletín',
};
const RECIPIENT = 'info@cronometras.com';
const FROM = 'Cronometras <no-reply@cronometras.com>';
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function createdAt(data) {
  const value = data.createdAt || data.fecha || data.timestamp;
  return value?.toDate ? value.toDate() : new Date(value || 0);
}

function renderMessage(collection, id, data, recovered = false) {
  const name = String(data.nombre || data.name || 'Sin nombre').replace(/[\r\n]+/g, ' ');
  const subject = `[Cronometras] ${recovered ? 'Pendiente anterior · ' : ''}${COLLECTIONS[collection]}: ${name}`;
  const rows = {
    Nombre: name, Email: data.email, Empresa: data.empresa || data.company,
    Teléfono: data.telefono || data.phone, Sector: data.sector,
    'Producto de interés': data.interes, Modalidad: data.modalidad,
    Disponibilidad: data.disponibilidad, Mensaje: data.mensaje || data.message,
    Conversación: data.nota, Origen: data.source || collection,
    Web: data.site || 'cronometras.com', Página: data.url,
    Fecha: String(data.createdAt || data.fecha || ''), Referencia: `${collection}/${id}`,
  };
  const text = Object.entries(rows).filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${String(v)}`).join('\n\n');
  // A chat may capture the sentence's final punctuation after an email address.
  const reply = String(data.email || '').trim().replace(/[.,;:!?]+$/, '');
  return { from: FROM, to: [RECIPIENT], subject, text,
    ...(emailPattern.test(reply) ? { reply_to: reply } : {}) };
}

async function resend(key, payload, idempotencyKey) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result.id) throw new Error(`Resend ${response.status}: ${result.name || 'no message id'}`);
  return result.id;
}

async function deliver(db, doc, key, since) {
  const owner = crypto.randomUUID();
  const claimed = await db.runTransaction(async transaction => {
    const snap = await transaction.get(doc.ref);
    const data = snap.data();
    if (!data || (createdAt(data) < since && !data.notificationStatus)) return null;
    if (['accepted', 'manual_review'].includes(data.notificationStatus)) return null;
    if (data.notificationLeaseUntil?.toMillis?.() > Date.now()) return null;
    const revision = data.notificationRevision || 'initial';
    const previous = data.notificationDeliveryRevision === revision;
    if (previous && data.notificationNextAttempt?.toMillis?.() > Date.now()) return null;
    const firstAttempt = previous && data.notificationFirstAttempt?.toMillis?.();
    // Resend retains idempotency keys for 24h. Never blindly resend an ambiguous old attempt.
    if (firstAttempt && Date.now() - firstAttempt > 23 * 3600000) {
      transaction.update(doc.ref, { notificationStatus: 'manual_review',
        notificationError: 'Retry window exceeded; check provider before resending.' });
      return null;
    }
    const payload = previous && data.notificationPayload || renderMessage(doc.ref.parent.id, doc.id, data);
    const attempts = previous ? Number(data.notificationAttempts || 0) + 1 : 1;
    transaction.update(doc.ref, {
      notificationStatus: 'sending', notificationLeaseOwner: owner,
      notificationLeaseUntil: Timestamp.fromMillis(Date.now() + 120000),
      notificationFirstAttempt: Timestamp.fromMillis(firstAttempt || Date.now()),
      notificationDeliveryRevision: revision, notificationPayload: payload,
      notificationAttempts: attempts, notificationRecipient: RECIPIENT,
    });
    return { revision, payload, attempts };
  });
  if (!claimed) return 'skipped';
  const idempotencyKey = crypto.createHash('sha256').update(`${doc.ref.path}:${claimed.revision}`).digest('hex');
  let providerId, error;
  try { providerId = await resend(key, claimed.payload, idempotencyKey); }
  catch (err) { error = err; }
  await db.runTransaction(async transaction => {
    const current = (await transaction.get(doc.ref)).data();
    // A newly completed assistant request may have arrived during the send.
    if (current?.notificationLeaseOwner !== owner ||
        (current.notificationRevision || 'initial') !== claimed.revision) return;
    transaction.update(doc.ref, {
      notificationStatus: error ? 'retry' : 'accepted', notificado: !error,
      notificationProviderId: providerId || '', notificationError: error ? error.message : '',
      notificationAcceptedAt: error ? null : Timestamp.now(),
      notificationLeaseUntil: Timestamp.fromMillis(0),
      notificationNextAttempt: Timestamp.fromMillis(Date.now() + Math.min(3600000, 60000 * 2 ** Math.min(claimed.attempts, 6))),
    });
  });
  // Log IDs and status only, never personal details or secrets.
  console.log(JSON.stringify({ document: doc.ref.path, status: error ? 'retry' : 'accepted', providerId }));
  return error ? 'retry' : 'accepted';
}

async function main() {
  const send = process.argv.includes('--send');
  const since = new Date(process.env.NOTIFICATIONS_SINCE || '');
  if (send && (!Number.isFinite(+since) || !process.env.RESEND_API_KEY)) throw new Error('Missing sender configuration');
  const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../sa.json'), 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();
  const report = [];
  for (const collection of Object.keys(COLLECTIONS)) {
    const snapshot = await db.collection(collection).get();
    const docs = snapshot.docs.sort((a, b) => +createdAt(b.data()) - +createdAt(a.data()));
    report.push({ collection, count: docs.length,
      recent: docs.slice(0, 8).map(d => ({ id: d.id, createdAt: String(d.data().createdAt || ''),
        status: d.data().notificationStatus || 'legacy_unknown', notificado: d.data().notificado ?? null })) });
    if (send) for (const doc of docs) {
      if (doc.data().notificationStatus || createdAt(doc.data()) >= since) {
        await deliver(db, doc, process.env.RESEND_API_KEY, since);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
  }
  if (!send) console.log(JSON.stringify(report, null, 2));
}

module.exports = { renderMessage, resend, deliver, createdAt, COLLECTIONS, main };
if (require.main === module) main().catch(err => { console.error(err.message); process.exitCode = 1; });
