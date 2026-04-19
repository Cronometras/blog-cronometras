// Cloudflare Pages Function — POST /api/contact
// Saves contact form submissions to Firestore and sends email notification

interface Env {
  FIREBASE_SERVICE_ACCOUNT: string;
  GMAIL_WEBAPP_URL: string;
}

function base64url(data: string | Uint8Array): string {
  if (typeof data === 'string') data = new TextEncoder().encode(data);
  let bin = '';
  for (const byte of data) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  }));
  const pemContents = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/[\s\r\n]+/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${payload}`));
  const jwt = `${header}.${payload}.${base64url(new Uint8Array(signature))}`;
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  return (await tokenResp.json() as any).access_token;
}

function firestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  return { stringValue: String(val) };
}

function firestoreDocument(data: Record<string, any>): any {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) fields[key] = firestoreValue(value);
  return { fields };
}

async function sendNotificationEmail(env: Env, data: { site: string; nombre: string; email: string; empresa: string; sector: string; mensaje: string }) {
  if (!env.GMAIL_WEBAPP_URL) return;
  try {
    await fetch(env.GMAIL_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err: any) {
    console.error('Email webhook failed:', err?.message);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    if (!env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('FIREBASE_SERVICE_ACCOUNT env var is missing!');
      return new Response(JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json() as any;
    const { nombre, email, empresa, sector, mensaje, privacyPolicy, lang, site } = body;

    if (!nombre || !email) {
      return new Response(JSON.stringify({ error: 'Nombre y email son obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let sa;
    try {
      sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
      return new Response(JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const token = await getAccessToken(sa);
    const docData = {
      nombre,
      email,
      empresa: empresa || '',
      sector: sector || '',
      mensaje: mensaje || '',
      privacyPolicy: privacyPolicy || false,
      lang: lang || 'es',
      site: site || 'cronometras.com',
      createdAt: new Date().toISOString(),
      source: 'web_contact',
    };

    const resp = await fetch(
      `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/contactos_cronometras`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(firestoreDocument(docData)) });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Firestore error:', resp.status, errText);
      return new Response(JSON.stringify({ error: 'Error al guardar los datos', details: errText.substring(0, 200) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    sendNotificationEmail(env, { site: site || 'cronometras.com', nombre, email, empresa: empresa || '', sector: sector || '', mensaje: mensaje || '' });

    return new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Contact API error:', error?.message || error);
    return new Response(JSON.stringify({ error: 'An error occurred', details: error?.message || 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
