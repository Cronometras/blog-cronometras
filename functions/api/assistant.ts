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
  // Extrae el cuerpo base64 del PEM sin depender de literales (que pueden
  // venir censurados en copias): el segmento más largo entre '-----' es la clave.
  const pemContents = sa.private_key
    .split('-----')
    .map((s: string) => s.replace(/[\s\r\n]+/g, ''))
    .reduce((a: string, b: string) => (b.length > a.length ? b : a), '');
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

PRODUCTO (fuente: manual de usuario; no inventes nada fuera de esto):
- QUÉ ES: CronometrasApp es una aplicación web progresiva (PWA) para estudios de tiempos: se instala como app en móvil/tablet, funciona sin conexión y sincroniza al reconectar. Interfaz en español e inglés.
- CRONOMETRAJE (4 métodos): 1) Repetitivo (vuelta a cero): elementos que ocurren en cada ciclo. 2) Continuo (crono seguido): cronómetro sin detenerse, acumulados que se convierten en tiempos elementales, capta actividades imprevistas. 3) Frecuencial: elementos que ocurren cada X ciclos (con repeticiones por ocurrencia) y cálculo automático del tiempo promedio por ciclo. 4) Tiempos de máquina: distingue máquina funcionando/parada, calcula saturación del operario y tiempos de inactividad.
- MÉTODO: el proceso se descompone en elementos de trabajo con inicio/fin definidos y repetibles, clasificados en repetitivos, frecuenciales y de máquina (máquina funcionando / parada / total), con diagrama de flujo de símbolos ASME (operación, transporte, inspección, demora, almacenamiento).
- TIEMPOS: tiempo observado → calificación de actividad → tiempo normal → suplementos → tiempo estándar. Valoración sintética del ritmo (el técnico asigna la actividad directamente); escala centesimal 100 normal → 133 óptimo (configurable por empresa).
- FIABILIDAD: la app implementa un sistema de cálculo del número de observaciones necesario para una fiabilidad del 95 % («control estadístico de la fiabilidad»). Nunca des cifras fijas de tomas u observaciones. Valida la consistencia con estadística (media, mediana, desviación estándar, coeficiente de variación, detección de tiempos atípicos).
- SUPLEMENTOS OIT y TAL (Tribunal de Arbitraje Laboral): constantes (necesidades personales 5 %, fatiga básica 4 %) más factores variables de esfuerzo físico y postura, ambiente (temperatura, humedad, iluminación, ruido) y carga mental (concentración, monotonía, tensión). Admite suplementos forzados con justificación documentada y plantillas de suplementos compartibles en la organización.
- CONFIGURACIÓN DEL ESTUDIO: proceso, operario, máquina/equipo, herramientas, sección, fecha y técnico; unidades de producción especializadas (m², m lineales, m³, kg, perímetro); turno (minutos por turno, contingencia configurable y descansos); unidades de tiempo configurables (minutos, centésimas de minuto CMM, segundos, horas, DMH y TMU — la TMU solo como unidad de visualización; la app NO implementa sistemas de tiempos predeterminados).
- REPORTES: informe técnico completo (portada con logo de la empresa, resumen ejecutivo, metodología, análisis estadístico, cálculo de tiempos y recomendaciones), hoja de operaciones estándar y resumen ejecutivo. Exportación a PDF (opcionalmente con contraseña), Excel (con fórmulas y tablas dinámicas) e impresión optimizada.
- BIBLIOTECA DE ELEMENTOS: elementos personales y compartidos por organización, con estadísticas históricas (tiempo promedio, desviación, uso), reutilización entre estudios e import/export en Excel y CSV.
- ORGANIZACIONES: multiusuario con roles (los administradores gestionan miembros), estudios compartidos con permisos de solo lectura y biblioteca organizacional común. Panel de estudios con carpetas, filtros por empresa/cliente y fecha, plantillas, duplicado e import/export masivo por Excel. Registro con email y contraseña o con cuenta de Google.
- EL MUESTREO DEL TRABAJO (work sampling) lo hace Worksamp (worksamp.com), un producto hermano, NO un módulo de Cronometras. Si preguntan por muestreo del trabajo, explícalo y deriva a Worksamp.
- LICENCIAS: MFA, dispositivos de confianza, hasta 3 sesiones concurrentes. Nunca digas «1 licencia = 1 dispositivo».
- SERVICIO: estudio de tiempos e implantación hechos por nosotros desde 800 €.

PROHIBIDO: mencionar Westinghouse o Bedaux; decir que la app usa MTM, MOST, MTU, UAS, MODAPTS, GSD, WF o tiempos predeterminados; inventar funciones, precios (salvo los 800 €), integraciones o estadísticas sin fuente. Si no lo sabes, dilo y ofrece pasar el contacto a una persona.

OBJETIVO COMERCIAL (importante): resuelve la duda en 2-4 frases y propón una demo en vivo de la app. Para cerrarla, recoge la información en MÍNIMAS interacciones (una o dos), agrupando varias preguntas en cada mensaje:
1. PRIMERA pregunta (en un solo mensaje): el email de contacto y el nombre de la empresa donde se implantaría.
2. SEGUNDA pregunta (en un solo mensaje): si prefieren que les contactemos por VIDEO LLAMADA de 30 minutos (siempre 30 minutos; nunca ofrezcas 20) o por LLAMADA DE TELÉFONO, y su teléfono de contacto.
3. Con email, empresa, teléfono y modalidad ya tienes todo: confirma en "reply": «Perfecto, te contactaremos para acordar el día y la hora de la demo.» y NO vuelvas a pedir nada más.
4. El nombre, si lo dan de paso, guárdalo, pero no lo pidas. No preguntes por disponibilidad (se acuerda al contactar); si la dan, guárdala.
5. NO insistas ni repreguntes: si preguntaste por la modalidad y el usuario no la da, no vuelvas a preguntarla. Nunca preguntes dos veces lo mismo.
6. Si el usuario agradece, se despide o deja de aportar datos, cierra en UNA frase: agradece y, si ya hay datos de contacto, confirma que le contactaremos. Si faltan datos pero el usuario cierra, despídete sin volver a pedirlos.
7. Nunca pidas contraseñas ni datos de pago.

IDIOMA: castellano de España (nunca "vos", "podés", "tenés", "querés", "decime", "vosotros"). Tono cercano y profesional, respuestas cortas. Sin markdown ni emojis salvo que el usuario los use.

SALIDA: responde SIEMPRE y ÚNICAMENTE con un objeto JSON válido, incluso cuando solo confirmes o saludes — nunca texto plano —, sin nada alrededor y sin \`\`\`. NUNCA emitas llamadas a herramientas ni etiquetas tipo <function>, <tool> o similares: si crees que necesitas una herramienta, ignóralo y responde con el JSON. Tu respuesta completa debe ser exactamente UN objeto JSON:
{"reply":"tu mensaje al usuario","lead":{"nombre":"","email":"","telefono":"","empresa":"","interes":"","modalidad":"","disponibilidad":""},"demo_completa":false}
En "lead" pon solo los datos que el usuario haya dado ya (el resto, cadena vacía). "interes" = qué producto o servicio le interesa (CronometrasApp, Worksamp, servicio de implantación…). "demo_completa": true solo cuando tengas email, teléfono, empresa y modalidad.`;

const PROMPT_EN = `You are the CronometrasApp assistant on cronometras.com. You help visitors (plant, operations and management decision-makers) and your second goal is to close a LIVE DEMO of the product.

PRODUCT (source: user manual; do not invent anything beyond this):
- WHAT IT IS: CronometrasApp is a progressive web app (PWA) for time studies: installable on mobile/tablet, works offline and syncs when back online. Spanish and English interface.
- STOPWATCH TIMING (4 methods): 1) Repetitive (reset to zero): elements occurring every cycle. 2) Continuous: non-stop watch, cumulative readings converted to elemental times, captures unexpected activities. 3) Frequency-based: elements occurring every X cycles (with repetitions per occurrence) and automatic average time per cycle. 4) Machine times: distinguishes machine running/stopped, calculates operator saturation and idle times.
- METHOD: the process is broken down into work elements with clear start/end points, classified as repetitive, frequency-based and machine (running / stopped / total), with an ASME flow diagram (operation, transport, inspection, delay, storage).
- TIMES: observed time → activity rating → normal time → allowances → standard time. Synthetic pace rating (the technician assigns the activity directly); centesimal scale 100 normal → 133 optimum (configurable per company).
- RELIABILITY: the app implements a system that calculates the number of observations needed for 95 % reliability ("statistical reliability control"). Never give fixed take/observation counts. It validates consistency with statistics (mean, median, standard deviation, coefficient of variation, outlier detection).
- ALLOWANCES (ILO and TAL): fixed (personal needs 5 %, basic fatigue 4 %) plus variable factors for physical effort and posture, environment (temperature, humidity, lighting, noise) and mental load (concentration, monotony, pressure). It supports forced allowances with documented justification and allowance templates shared across the organisation.
- STUDY SETUP: process, operator, machine/equipment, tools, department, date and technician; specialised production units (m², linear m, m³, kg, perimeter); shift settings (minutes per shift, configurable contingency and breaks); configurable time units (minutes, hundredths of a minute, seconds, hours, DMH and TMU — TMU as a display unit only; the app does NOT implement predetermined time systems).
- REPORTS: full technical report (cover with company logo, executive summary, methodology, statistical analysis, standard time calculations and recommendations), standard operations sheet and executive summary. Export to PDF (optionally password-protected), Excel (with live formulas and pivot tables) and optimised printing.
- ELEMENT LIBRARY: personal and organisation-shared elements, with historical statistics (average time, deviation, usage), reuse across studies and Excel/CSV import/export.
- ORGANISATIONS: multi-user with roles (admins manage members), studies shared with read-only permissions and a common organisation library. Study dashboard with folders, filters by company/customer and date, templates, duplication and bulk Excel import/export. Sign-up with email and password or a Google account.
- WORK SAMPLING is what Worksamp (worksamp.com) does — a sibling product, NOT a Cronometras module. If they ask about work sampling, explain it and point them to Worksamp.
- LICENSING: MFA, trusted devices, up to 3 concurrent sessions. Never say "1 licence = 1 device".
- SERVICE: done-for-you time study and implementation from €800.

FORBIDDEN: mentioning Westinghouse or Bedaux; claiming the app uses MTM, MOST, MTU, UAS, MODAPTS, GSD, WF or predetermined time systems; inventing features, prices (beyond €800), integrations or unsourced statistics. If you do not know, say so and offer a human contact.

SALES GOAL (important): answer the question in 2-4 sentences, then propose a live demo of the app. Collect the details in MINIMAL interactions (one or two), bundling several questions per message:
1. FIRST question (single message): contact email and the name of the company where it would be deployed.
2. SECOND question (single message): whether they prefer to be contacted by VIDEO CALL of 30 minutes (always 30 minutes; never offer 20) or by PHONE CALL, and their contact phone.
3. Once you have email, company, phone and option you have everything: confirm in "reply": "Great, we will contact you to agree on the day and time of the demo." and do NOT ask for anything else.
4. If they volunteer their name, keep it, but do not ask for it. Do not ask about availability (agreed when contacting); if given, keep it.
5. Do NOT insist or re-ask: if you asked for the option and the user does not give it, do not ask again. Never ask the same thing twice.
6. If the user thanks you, says goodbye or stops providing details, close in ONE sentence: thank them and, if contact details exist, confirm we will contact them. If details are missing but the user closes, say goodbye without asking again.
7. Never ask for passwords or payment details.

LANGUAGE: answer in the language the user writes (Spanish or English). Friendly, professional, short replies. No markdown.

OUTPUT: respond ALWAYS and ONLY with a valid JSON object, even when just confirming or greeting — never plain text — with nothing around it and no \`\`\`. NEVER emit tool calls or tags like <function>, <tool> or similar: if you think you need a tool, ignore that and answer with the JSON. Your complete answer must be exactly ONE JSON object:
{"reply":"your message to the user","lead":{"name":"","email":"","phone":"","company":"","interest":"","option":"","availability":""},"demo_complete":false}
In "lead", include only details the user has already given (empty string otherwise). "demo_complete": true only when you have email, phone, company and option.`;

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

// Extracción determinista de datos del lead en el texto del usuario (red de
// seguridad: el modelo a veces se salta el protocolo JSON).
function extractFromText(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const nombre = text.match(/(?:soy|me llamo|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+){0,2})/)
    || text.match(/(?:my name is|i am|i'm)\s+([A-Z][\w'-]+(?:\s+[A-Z][\w'-]+){0,2})/);
  if (nombre) out.nombre = nombre[1].trim();
  const empresa = text.match(/(?:de|en|para)\s+(?:la\s+)?empresa\s+([\wÁÉÍÓÚÑáéíóúñ .&'-]{2,40})/i)
    || text.match(/(?:company|from)\s+([\w&.,' -]{2,40})/);
  if (empresa) out.empresa = empresa[1].trim().replace(/[.,;]$/, '');
  if (/(videollamada|video\s*llamada|videoconferencia|video call)/i.test(text)) {
    out.modalidad = 'videollamada 30 min'; // la demo en vídeo es siempre de 30 min
  } else if (/(llamada\s*(telefónica|de\s*teléfono)?|phone call|\bcall\b)/i.test(text)) {
    out.modalidad = 'llamada';
  }
  const disp = text.match(/\b(mañana|tarde|noche|morning|afternoon|evening)\b/i);
  if (disp) out.disponibilidad = disp[1].toLowerCase();
  // Interés del lead por palabras clave (si el modelo no lo ha capturado)
  if (/precio|precios|presupuesto|cotiza/i.test(text)) out.interes = 'precios';
  else if (/muestreo|work\s?sampling/i.test(text)) out.interes = 'Worksamp';
  else if (/implantaci[oó]n|lo hacemos por ti|servicio de estudio/i.test(text)) out.interes = 'servicio de implantación';
  else if (/\bdemo\b/i.test(text)) out.interes = 'demo';
  return out;
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
  // Canoniza modalidad: la demo en vídeo es siempre de 30 minutos
  if (/video/i.test(out.modalidad)) out.modalidad = 'videollamada 30 min';
  else if (out.modalidad && /llamada|call/i.test(out.modalidad)) out.modalidad = 'llamada';
  out.lang = fallbackLang;
  return out;
}

function isComplete(lead: Record<string, string>): boolean {
  // El nombre es opcional: lo esencial para contactar es email, teléfono,
  // empresa y modalidad (regla de Micaot 2026-10-02: cerrar en 1-2 interacciones).
  return Boolean(
    lead.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email) &&
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

// Extrae el objeto JSON completo (llaves balanceadas): el regex codicioso de
// "{" a la última "}" se rompe cuando el modelo añade texto o llamadas a
// herramientas después del JSON (verificado 2026-10-02 con mimo-v2.6-flash).
function extractJsonObject(raw: string): string | null {
  let start = raw.indexOf('{');
  while (start !== -1) {
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return raw.slice(start, i + 1);
      }
    }
    start = raw.indexOf('{', start + 1);
  }
  return null;
}

function parseLLMOutput(raw: string): { reply: string; lead: any; demoCompleta: boolean } {
  const candidate = extractJsonObject(raw);
  if (candidate) {
    try {
      const obj = JSON.parse(candidate);
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

async function saveLead(env: Env, sa: any, sessionId: string, lead: Record<string, string>, conversacion: string, ultimoMensaje: string, url: string, site: string) {
  const token = await getAccessToken(sa);
  const collection = env.LEADS_COLLECTION || 'leads_asistente_cronometras';
  const docUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/${collection}/${sessionId}`;

  // ¿Existe ya? (para notificar solo una vez y saber si el lead ya estaba cerrado)
  const prev = await fetch(docUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  const existed = prev.ok;
  let prevEstado = '';
  if (existed) {
    try {
      const pd = await prev.json() as any;
      prevEstado = pd?.fields?.estado?.stringValue || '';
    } catch { /* noop */ }
  }

  const docData: Record<string, any> = {
    ...lead,
    sessionId,
    site,
    url,
    nota: conversacion,          // conversación completa del usuario (no solo el último mensaje)
    ultimoMensaje,
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
      mensaje: `Solicitud de demo vía asistente web (lead ${lead.estado || 'parcial'}). Conversación: ${conversacion || '—'}`,
    });
  }
  // La tarjeta «✓ Demo solicitada» solo se muestra UNA vez, al cerrar el lead:
  // si ya estaba completa, no se vuelve a avisar (bug «vuelve a solicitar», 2026-10-02).
  if (lead.estado === 'completa' && prevEstado !== 'completa') return 'completa-nueva';
  return lead.estado || 'parcial';
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

    const raw0 = await askLLM(env, lang === 'en' ? PROMPT_EN : PROMPT_ES, cleanHistory);
    // Si el modelo se salta el protocolo JSON, un reintento con recordatorio.
    let raw = raw0;
    if (!/\{[\s\S]*\}/.test(raw0)) {
      raw = await askLLM(env, lang === 'en' ? PROMPT_EN : PROMPT_ES,
        [...cleanHistory, { role: 'assistant', content: raw0 },
         { role: 'user', content: 'Responde ahora solo con el objeto JSON (campo reply con tu mensaje). - recordatorio del sistema' }]
      ).catch(() => raw0);
    }
    const { reply, lead: rawLead, demoCompleta } = parseLLMOutput(raw);

    // Red de seguridad: datos que aparezcan literalmente en el chat
    const allText = cleanHistory.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' \n ');
    const lead = normalizeLead(rawLead, lang);
    const fromText = extractFromText(allText);
    for (const [k, v] of Object.entries(fromText)) if (!lead[k]) lead[k] = v;
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
      if (!lead.nombre) lead.nombre = '—';
      if (!lead.interes) lead.interes = '—';
      lead.estado = completo ? 'completa' : 'parcial';
      const userMsgs = cleanHistory.filter((m: any) => m.role === 'user').map((m: any) => m.content.slice(0, 300));
      const ultimoMensaje = userMsgs[userMsgs.length - 1] || '';
      const conversacion = userMsgs.join(' | ').slice(0, 800);
      const saveStatus = await saveLead(env, JSON.parse(env.FIREBASE_SERVICE_ACCOUNT), sessionId, lead, conversacion, ultimoMensaje, pageUrl, site).catch((err) => {
        console.error('saveLead error:', err?.message || err);
        return 'error';
      });
      leadSaved = saveStatus === 'completa-nueva';
    }

    return new Response(JSON.stringify({ reply, leadSaved }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Assistant API error:', error?.message || error);
    return new Response(JSON.stringify({ error: 'Ha ocurrido un error', details: error?.message || 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
