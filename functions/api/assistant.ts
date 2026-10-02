// Cloudflare Pages Function — POST /api/assistant
// Asistente de chat (LLM) para cronometras.com con cierre de demo:
// recoge nombre, email, teléfono, empresa, producto de interés y modalidad
// (llamada o videollamada de 20/30 min), guarda el lead en Firestore y
// notifica por email (mismo canal que /api/contact).

interface Env {
  FIREBASE_SERVICE_ACCOUNT: string;
  GMAIL_WEBAPP_URL: string;
  LLM_BASE_URL: string;
  LLM_API_KEY: string;
  LLM_MODEL: string;
  LEADS_COLLECTION: string; // opcional. default: leads_asistente_cronometras
}

const LEAD_FIELDS = ['nombre', 'email', 'telefono', 'empresa', 'interes', 'modalidad', 'disponibilidad'] as const;

// ---------- JWT / Firestore (mismo patrón que contact.ts) ----------

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
    .replace(/[REDACTED PRIVATE KEY]/, '')
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

// ---------- Prompts ----------

const PROMPT_ES = `Eres el asistente de CronometrasApp en la web cronometras.com. Ayudas a visitantes (responsables de planta, producción, dirección) y tu segundo objetivo es cerrar una DEMO EN VIVO del producto.

PRODUCTO (no inventes nada fuera de esto):
- CronometrasApp: app de estudios de tiempos con cronómetro (cronometrajes) y muestreo del trabajo (Worksamp).
- Calcula el número de observaciones necesario para una fiabilidad del 95 % («control estadístico de la fiabilidad»). Nunca des cifras fijas de tomas u observaciones.
- Valoración sintética del ritmo: el técnico asigna la actividad directamente. Escala centesimal: 100 normal → 133 óptimo.
- Suplementos OIT y TAL (Tribunal de Arbitraje Laboral).
- Licencias: MFA, dispositivos de confianza, hasta 3 sesiones concurrentes. Nunca digas «1 licencia = 1 dispositivo».
- Servicio de estudio/implantación hecho por nosotros desde 800 €.
- Worksamp (worksamp.com) es un producto hermano de muestreo del trabajo, NO un módulo de Cronometras.

PROHIBIDO: mencionar Westinghouse o Bedaux; decir que la app usa MTM, MOST, MTU, UAS, MODAPTS, GSD, WF o tiempos predeterminados; inventar funciones, precios (salvo los 800 €), integraciones o estadísticas sin fuente. Si no lo sabes, dilo y ofrece pasar el contacto a una persona.

OBJETIVO COMERCIAL (importante): resuelve la duda en 2-4 frases y propón una demo en vivo de la app. Para cerrarla:
1. Pregunta si prefiere que le contactemos por LLAMADA DE TELÉFONO o por VIDEO LLAMADA de 20 o 30 minutos para ver la app en vivo.
2. Recoge los datos UNO POR MENSAJE (solo pregunta lo que falte): nombre, empresa, email, teléfono, modalidad elegida ("llamada" | "videollamada 20 min" | "videollamada 30 min") y franja de disponibilidad.
3. Cuando tengas nombre, email, teléfono, empresa y modalidad, confirma en "reply": «Perfecto, te contactaremos para acordar el día y la hora de la demo.» y NO vuelvas a pedir datos.
4. Nunca pidas contraseñas ni datos de pago.

IDIOMA: castellano de España (nunca "vos", "podés", "tenés", "querés", "decime", "vosotros"). Tono cercano y profesional, respuestas cortas. Sin markdown ni emojis salvo que el usuario los use.

SALIDA: responde SIEMPRE y ÚNICAMENTE con un objeto JSON válido, incluso cuando solo confirmes o saludes — nunca texto plano —, sin nada alrededor y sin \`\`\`:
{"reply":"tu mensaje al usuario","lead":{"nombre":"","email":"","telefono":"","empresa":"","interes":"","modalidad":"","disponibilidad":""},"demo_completa":false}
En "lead" pon solo los datos que el usuario haya dado ya (el resto, cadena vacía). "interes" = qué producto o servicio le interesa (CronometrasApp, Worksamp, servicio de implantación…). "demo_completa": true solo cuando tengas nombre, email, teléfono, empresa y modalidad.`;

const PROMPT_EN = `You are the CronometrasApp assistant on cronometras.com. You help visitors (plant, operations and management decision-makers) and your second goal is to close a LIVE DEMO of the product.

PRODUCT (do not invent anything beyond this):
- CronometrasApp: time-study software with a stopwatch (time studies) and work sampling (Worksamp).
- It calculates the number of observations needed for 95 % reliability ("statistical reliability control"). Never give fixed take/observation counts.
- Synthetic pace rating: the technician assigns the activity directly. Centesimal scale: 100 normal → 133 optimum.
- ILO and TAL allowances.
- Licensing: MFA, trusted devices, up to 3 concurrent sessions. Never say "1 licence = 1 device".
- Done-for-you study/implementation service from €800.
- Worksamp (worksamp.com) is a sibling work-sampling product, NOT a Cronometras module.

FORBIDDEN: mentioning Westinghouse or Bedaux; claiming the app uses MTM, MOST, MTU, UAS, MODAPTS, GSD, WF or predetermined time systems; inventing features, prices (beyond €800), integrations or unsourced statistics. If you do not know, say so and offer a human contact.

SALES GOAL (important): answer the question in 2-4 sentences, then propose a live demo of the app. To close it:
1. Ask whether they prefer to be contacted by PHONE CALL or by VIDEO CALL of 20 or 30 minutes to see the app live.
2. Collect the details ONE PER MESSAGE (only ask for what is missing): name, company, email, phone, chosen option ("call" | "video call 20 min" | "video call 30 min") and availability.
3. Once you have name, email, phone, company and option, confirm in "reply": "Great, we will contact you to agree on the day and time of the demo." and do NOT ask again.
4. Never ask for passwords or payment details.

LANGUAGE: answer in the language the user writes (Spanish or English). Friendly, professional, short replies. No markdown.

OUTPUT: respond ALWAYS and ONLY with a valid JSON object, even when just confirming or greeting — never plain text — with nothing around it and no \`\`\`:
{"reply":"your message to the user","lead":{"name":"","email":"","phone":"","company":"","interest":"","option":"","availability":""},"demo_complete":false}
In "lead", include only details the user has already given (empty string otherwise). "demo_complete": true only when you have name, email, phone, company and option.`;

// ---------- Rate limiting (best effort, por aislamiento) ----------

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const win = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (win.length >= 8) { hits.set(ip, win); return true; }
  win.push(now);
  hits.set(ip, win);
  return false;
}

// ---------- Extracción determinista de email/teléfono (red de seguridad) ----------

function extractEmail(text: string): string {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return m ? m[0].toLowerCase() : '';
}

function extractPhone(text: string): string {
  const m = text.match(/\+?\d[\d\s().-]{6,}\d/);
  return m ? m[0].trim() : '';
}

function normalizeLead(raw: any, fallbackLang: string): Record<string, string> {
  const out: Record<string, string> = {};
  const map: Record<string, string[]> = {
    nombre: ['nombre', 'name'],
    email: ['email'],
    telefono: ['telefono', 'phone'],
    empresa: ['empresa', 'company'],
    interes: ['interes', 'interest'],
    modalidad: ['modalidad', 'option'],
    disponibilidad: ['disponibilidad', 'availability'],
  };
  for (const f of LEAD_FIELDS) {
    let v = '';
    for (const key of map[f] || []) {
      if (raw && typeof raw[key] === 'string' && raw[key].trim()) { v = raw[key].trim(); break; }
    }
    out[f] = v.slice(0, 200);
  }
  if (out.email) out.email = out.email.toLowerCase();
  out.lang = fallbackLang;
  return out;
}

function isComplete(lead: Record<string, string>): boolean {
  return Boolean(
    lead.nombre && lead.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email) &&
    lead.telefono && lead.telefono.replace(/\D/g, '').length >= 7 &&
    lead.empresa && lead.modalidad
  );
}

// ---------- LLM ----------

async function askLLM(env: Env, system: string, messages: any[]): Promise<string> {
  const base = (env.LLM_BASE_URL || '').replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.LLM_API_KEY}`,
        'api-key': env.LLM_API_KEY,
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        temperature: 0.2,
        max_tokens: 700,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json() as any;
    const msg = data?.choices?.[0]?.message || {};
    // Pitfall MiMo: el texto útil puede ir en reasoning_content
    const text = (msg.content || msg.reasoning_content || '').trim();
    if (!text) throw new Error('LLM devolvió respuesta vacía');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function parseLLMOutput(raw: string): { reply: string; lead: any; demoCompleta: boolean } {
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]);
      return {
        reply: String(obj.reply || '').trim() || raw.trim(),
        lead: obj.lead || {},
        demoCompleta: Boolean(obj.demo_completa ?? obj.demoComplete),
      };
    } catch { /* cae al texto crudo */ }
  }
  return { reply: raw.trim(), lead: {}, demoCompleta: false };
}

// ---------- Persistencia del lead ----------

function sendNotificationEmail(env: Env, data: Record<string, string>) {
  // Canal principal: webhook de Gmail (Apps Script). Alternativa: Web3Forms.
  if (env.GMAIL_WEBAPP_URL) {
    fetch(env.GMAIL_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err: any) => console.error('Email webhook failed:', err?.message));
    return;
  }
  if (env.WEB3FORMS_ACCESS_KEY) {
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY,
        subject: `Nueva solicitud de demo — ${data.site}`,
        from_name: 'Asistente web',
        ...data,
      }),
    }).catch((err: any) => console.error('Web3Forms failed:', err?.message));
  }
}

async function saveLead(env: Env, sa: any, sessionId: string, lead: Record<string, string>, nota: string, url: string, site: string) {
  const token = await getAccessToken(sa);
  const collection = env.LEADS_COLLECTION || 'leads_asistente_cronometras';
  const docUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${collection}/${sessionId}`;

  // ¿Existe ya? (para notificar solo una vez)
  const prev = await fetch(docUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  const existed = prev.ok;

  const docData: Record<string, any> = {
    ...lead,
    sessionId,
    site,
    url,
    nota,
    privacyPolicy: true,
    source: 'web_asistente_demo',
    createdAt: new Date().toISOString(),
    notificado: true,
  };

  const resp = await fetch(docUrl, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(firestoreDocument(docData)),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error('Firestore error:', resp.status, errText.slice(0, 200));
    return false;
  }

  if (!existed) {
    sendNotificationEmail(env, {
      site,
      nombre: lead.nombre,
      email: lead.email,
      empresa: lead.empresa,
      telefono: lead.telefono,
      sector: `Demo: ${lead.modalidad} | Interés: ${lead.interes}`,
      plan: `Disponibilidad: ${lead.disponibilidad}`,
      mensaje: `Solicitud de demo vía asistente web (lead ${lead.estado || 'parcial'}). Nota: ${nota || '—'}`,
    });
  }
  return true;
}

// ---------- Handler ----------

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (rateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un minuto.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    if (!env.LLM_API_KEY || !env.LLM_BASE_URL) {
      return new Response(JSON.stringify({ error: 'Asistente no configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json() as any;
    const lang = body.lang === 'en' ? 'en' : 'es';
    const sessionId = String(body.sessionId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `s_${Date.now()}`;
    const pageUrl = String(body.url || '').slice(0, 300);
    const site = 'cronometras.com';

    const history = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
    const cleanHistory = history
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!cleanHistory.length || cleanHistory[cleanHistory.length - 1].role !== 'user') {
      return new Response(JSON.stringify({ error: 'Falta el mensaje del usuario' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const raw = await askLLM(env, lang === 'en' ? PROMPT_EN : PROMPT_ES, cleanHistory);
    const { reply, lead: rawLead, demoCompleta } = parseLLMOutput(raw);

    // Red de seguridad: email/teléfono que aparezcan literalmente en el chat
    const allText = cleanHistory.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' \n ');
    const lead = normalizeLead(rawLead, lang);
    if (!lead.email) lead.email = extractEmail(allText);
    if (!lead.telefono) lead.telefono = extractPhone(allText);

    let leadSaved = false;
    // Captura aunque el modelo se salte el protocolo: basta email + teléfono válidos.
    const completo = isComplete(lead) || demoCompleta;
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email);
    const telOk = lead.telefono.replace(/\D/g, '').length >= 7;
    if (emailOk && telOk) {
      if (!completo) {
        // guarda parcial para no perder el lead si el usuario se va a medias
        lead.nombre ||= '—';
        lead.empresa ||= '—';
        lead.modalidad ||= '—';
      }
      lead.estado = completo ? 'completa' : 'parcial';
      const lastUser = cleanHistory[cleanHistory.length - 1].content;
      leadSaved = await saveLead(env, JSON.parse(env.FIREBASE_SERVICE_ACCOUNT), sessionId, lead, lastUser.slice(0, 400), pageUrl, site).catch((err) => {
        console.error('saveLead error:', err?.message || err);
        return false;
      });
    }

    return new Response(JSON.stringify({ reply, leadSaved }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Assistant API error:', error?.message || error);
    return new Response(JSON.stringify({ error: 'Ha ocurrido un error', details: error?.message || 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
