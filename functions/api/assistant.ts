// Cloudflare Pages Function — POST /api/assistant
// Asistente de chat (LLM) para cronometras.com con cierre de demo:
// recoge nombre, email, teléfono, empresa, producto de interés y modalidad
// (llamada o videollamada de 20/30 min), guarda el lead en Firestore y
// notifica por email (mismo canal que /api/contact).
import { documentationContext } from '../_shared/assistant-knowledge';

interface Env {
  FIREBASE_SERVICE_ACCOUNT: string;
  GMAIL_WEBAPP_URL: string;
  LLM_BASE_URL: string;
  LLM_API_KEY: string;
  LLM_MODEL: string;
  LEADS_COLLECTION: string; // opcional. default: leads_asistente_cronometras
  WEB3FORMS_ACCESS_KEY?: string;
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

PRODUCTO (orientación general; consulta también los apartados de manuales y web adjuntos a esta pregunta; no inventes funciones):
- QUÉ ES: CronometrasApp es una aplicación web progresiva (PWA) para estudios de tiempos: se instala como app en móvil/tablet, funciona sin conexión y sincroniza al reconectar. Interfaz en español e inglés.
- CRONOMETRAJE (4 métodos): 1) Repetitivo (vuelta a cero): elementos que ocurren en cada ciclo. 2) Continuo (crono seguido): cronómetro sin detenerse, acumulados que se convierten en tiempos elementales, capta actividades imprevistas. 3) Frecuencial: elementos que ocurren cada X ciclos (con repeticiones por ocurrencia) y cálculo automático del tiempo promedio por ciclo. 4) Tiempos de máquina: distingue máquina funcionando/parada, calcula saturación del operario y tiempos de inactividad.
- GRABACIÓN DE VÍDEO (documentado en /es/continuous y /es/features): SÍ graba vídeo de la operación mientras cronometras. Disponible en Cronómetro Continuo, Frecuencial y Máquina, con controles de iniciar, pausar, reanudar y detener e indicador de grabación activa. Sirve para revisión posterior, formación y evidencia documental. No confundas grabar vídeo en la app con reservar una videollamada.
- COMENTARIOS (documentado en /es/repetitive, /es/features y /es/report): SÍ permite añadir comentarios y anotaciones por registro/ciclo, explicar variaciones y documentar incidencias o condiciones especiales. Se pueden introducir por voz sin usar las manos. Los comentarios por registro se exportan a Excel.
- DOCUMENTACIÓN VISUAL: imágenes por registro y por elemento para documentar la operación; los informes admiten imágenes.
- MULTI CRONO: hasta 6 cronómetros simultáneos identificados por color, con guardado independiente de registros.
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
2. Con email y empresa, agrupa en UN mensaje los datos pendientes: si prefiere VIDEO LLAMADA de 30 minutos (siempre 30 minutos; nunca ofrezcas 20) o LLAMADA DE TELÉFONO, y su teléfono de contacto. Si ya indicó modalidad o teléfono, pregunta solo por lo que falta.
3. Con email, empresa, teléfono y modalidad ya tienes todo: guarda la solicitud y confirma en "reply": «Perfecto, te contactaremos para acordar el día y la hora de la demo.» No afirmes que hay una reserva confirmada: no tienes acceso a un calendario. No pidas nada más.
4. El nombre, si lo dan de paso, guárdalo, pero no lo pidas. No preguntes por disponibilidad (se acuerda al contactar); si la dan, guárdala.
5. NO insistas ni repreguntes por datos ya aportados. Un «vale» o «sí» acepta la propuesta; avanza al dato pendiente. Nunca preguntes dos veces lo mismo.
6. Cierra solo si el usuario se despide o agradece sin plantear otra duda. Preguntar por funciones no es despedirse ni dejar de aportar datos: responde la pregunta aunque la demo esté solicitada. No repitas el cierre ni la propuesta de demo en cada respuesta.
7. Nunca pidas contraseñas ni datos de pago.
8. Tu prioridad es responder la última pregunta sobre el producto, también después de recoger sus datos. Usa todas las funciones documentadas arriba. «¿Graba vídeo?» se responde SÍ con las pantallas compatibles; «¿Tiene comentarios?» se responde SÍ con comentarios por registro y entrada por voz. Nunca derives esas preguntas documentadas al equipo ni contestes solo con una despedida. Si una respuesta anterior negó una función documentada, corrígela claramente.

IDIOMA: castellano de España (nunca "vos", "podés", "tenés", "querés", "decime", "vosotros"). Tono cercano y profesional, respuestas cortas. Sin markdown ni emojis salvo que el usuario los use.

SALIDA: responde SIEMPRE y ÚNICAMENTE con un objeto JSON válido, incluso cuando solo confirmes o saludes — nunca texto plano —, sin nada alrededor y sin \`\`\`. NUNCA emitas llamadas a herramientas ni etiquetas tipo <function>, <tool> o similares: si crees que necesitas una herramienta, ignóralo y responde con el JSON. Tu respuesta completa debe ser exactamente UN objeto JSON:
{"reply":"tu mensaje al usuario","lead":{"nombre":"","email":"","telefono":"","empresa":"","interes":"","modalidad":"","disponibilidad":""},"demo_completa":false}
En "lead" pon los datos que el usuario haya dado ya (el resto, cadena vacía); modalidad = "videollamada 30 min" si elige vídeo o responde con disponibilidad sin elegir modalidad. "interes" = qué producto o servicio le interesa (CronometrasApp, Worksamp, servicio de implantación…). "demo_completa": true solo cuando tengas email, teléfono, empresa y modalidad.`;

const PROMPT_EN = `You are the CronometrasApp assistant on cronometras.com. You help visitors (plant, operations and management decision-makers) and your second goal is to close a LIVE DEMO of the product.

PRODUCT (general orientation; also use the manual and website sections attached to this question; do not invent features):
- WHAT IT IS: CronometrasApp is a progressive web app (PWA) for time studies: installable on mobile/tablet, works offline and syncs when back online. Spanish and English interface.
- STOPWATCH TIMING (4 methods): 1) Repetitive (reset to zero): elements occurring every cycle. 2) Continuous: non-stop watch, cumulative readings converted to elemental times, captures unexpected activities. 3) Frequency-based: elements occurring every X cycles (with repetitions per occurrence) and automatic average time per cycle. 4) Machine times: distinguishes machine running/stopped, calculates operator saturation and idle times.
- VIDEO RECORDING (documented in /es/continuous and /es/features): YES, records operation video while timing, in Continuous, Frequency and Machine screens. Controls include start, pause, resume and stop, with an active recording indicator. Useful for later review, training and documentary evidence. Do not confuse recording video in the app with scheduling a video call.
- COMMENTS (documented in /es/repetitive, /es/features and /es/report): YES, add comments and notes per record/cycle to explain variations, incidents and special conditions. Voice input allows hands-free comments. Record comments are exported to Excel.
- VISUAL DOCUMENTATION: images per record and work element to document operations; reports support images.
- MULTI CRONO: up to 6 concurrent stopwatches, identified by colour, with independently saved records.
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
2. Once email and company are provided, bundle all missing details in ONE message: whether they prefer a VIDEO CALL of 30 minutes (always 30 minutes; never offer 20) or a PHONE CALL, and their contact phone. Ask only for missing details if the option or phone is already known.
3. Once you have email, company, phone and option you have everything: confirm in "reply": "Great, we will contact you to agree on the day and time of the demo." Never claim a confirmed booking: you have no calendar access. Ask for nothing else.
4. If they volunteer their name, keep it, but do not ask for it. Do not ask about availability (agreed when contacting); if given, keep it.
5. Do NOT re-ask for details already provided. An "okay" or "yes" accepts the proposal; move to the missing detail. Never ask the same thing twice.
6. Close only when the user says goodbye or thanks you without asking another question. Product questions are not a goodbye: answer them even after the demo request. Do not repeat a goodbye or demo proposal in every answer.
7. Never ask for passwords or payment details.
8. Prioritise answering the latest product question, including after contact details have been collected. Use all features documented above. Answer YES to video recording and comments, with the documented details. Never hand these known questions off to the team or answer only with a goodbye. Clearly correct an earlier answer if it incorrectly denied a documented feature.

LANGUAGE: answer in the language the user writes (Spanish or English). Friendly, professional, short replies. No markdown.

OUTPUT: respond ALWAYS and ONLY with a valid JSON object, even when just confirming or greeting — never plain text — with nothing around it and no \`\`\`. NEVER emit tool calls or tags like <function>, <tool> or similar: if you think you need a tool, ignore that and answer with the JSON. Your complete answer must be exactly ONE JSON object:
{"reply":"your message to the user","lead":{"name":"","email":"","phone":"","company":"","interest":"","option":"","availability":""},"demo_complete":false}
In "lead", include details already provided (empty string otherwise); option = "video call 30 min" if they choose video or give availability without choosing an option. "demo_complete": true only when you have email, phone, company and option.`;

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
  // Cierre = email válido + teléfono (≥7 dígitos) + empresa + modalidad, TAMBIÉN para
  // videollamada; la disponibilidad no se pide (flujo unificado «modalidad + teléfono»,
  // decisión de Micaot 2026-10-05).
  return Boolean(
    lead.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email) &&
    lead.telefono && lead.telefono.replace(/\D/g, '').length >= 7 &&
    lead.empresa && lead.empresa !== '—' && lead.modalidad && lead.modalidad !== '—'
  );
}

// Recognise a short company answer when the previous turn asked for it,
// including an email and company supplied together ("email@example.com Tenneco").
function companyFromAnswer(history: { role: string; content: string }[]): string {
  const last = history[history.length - 1]?.content || '';
  const previous = history.slice(0, -1).reverse().find(m => m.role === 'assistant')?.content || '';
  if (!/(empresa|company)/i.test(previous) || !/[?¿]/.test(previous)) return '';
  const answer = last.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '').trim();
  if (!answer || answer.length > 80 || answer.split(/\s+/).length > 6) return '';
  if (/^(vale|ok|okay|yes|no|si|sí|gracias|thanks|perfecto|genial)$/i.test(answer)) return '';
  if (/[?¿@\n]/.test(answer) || extractPhone(answer) || /video|llamada|call/i.test(answer)) return '';
  return answer.replace(/^(?:mi empresa es|empresa\s*:|my company is|company\s*:)\s*/i, '').trim();
}

function demoNextReply(history: { role: string; content: string }[], lead: Record<string, string>, lang: string): string {
  const last = history[history.length - 1]?.content || '';
  const suppliedContact = Boolean(extractEmail(last) || companyFromAnswer(history));
  const suppliedSchedule = Boolean(availabilityFromAnswer(history));
  const alreadyAsked = history.some(m => m.role === 'assistant' && /tel[eé]fono|phone number|contact phone/i.test(m.content));
  if ((suppliedContact || suppliedSchedule) && isComplete(lead)) {
    return lang === 'en'
      ? 'Great, we will contact you to agree on the day and time of the demo.'
      : 'Perfecto, te contactaremos para acordar el día y la hora de la demo.';
  }
  if (suppliedContact && lead.email && lead.empresa && lead.empresa !== '—' && !lead.modalidad && !alreadyAsked) {
    const phoneQuestion = lead.telefono ? '' : (lang === 'en' ? ' And your contact phone.' : ' Y tu teléfono de contacto.');
    return (lang === 'en'
      ? 'Thanks, I have your email and company. Would you prefer a 30-minute video call or a phone call?'
      : 'Perfecto, tengo tu email y el nombre de la empresa. ¿Prefieres una videollamada de 30 minutos o una llamada telefónica?') + phoneQuestion;
  }
  if (suppliedContact && lead.email && lead.empresa && lead.empresa !== '—' && lead.modalidad && lead.modalidad !== '—' && !lead.telefono && !alreadyAsked) {
    return lang === 'en'
      ? 'Thanks. Please also share your contact phone number.'
      : 'Perfecto. Déjame también tu teléfono de contacto.';
  }
  return '';
}

function availabilityFromAnswer(history: { role: string; content: string }[]): string {
  const last = history[history.length - 1]?.content?.trim() || '';
  const previous = history.slice(0, -1).reverse().find(m => m.role === 'assistant')?.content || '';
  if (!/qu[eé] d[ií]a|horario|when.*(?:work|suit)|which day/i.test(previous)) return '';
  // Preserve the full day/time/time-zone answer, rather than only "morning".
  if (/[?¿]/.test(last) || extractEmail(last) || !/\d|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|ma[ñn]ana|tarde|noche|cualquier|cuando|monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|anytime|tomorrow/i.test(last)) return '';
  return last.slice(0, 200);
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
        reply: typeof obj.reply === 'string' ? obj.reply.trim() : '',
        lead: obj.lead || {},
        demoCompleta: Boolean(obj.demo_completa ?? obj.demoComplete),
      };
    } catch { /* recupera solo el mensaje, nunca muestra el JSON roto */ }
  }
  if (candidate || /^\s*[{\[]/.test(raw) || /"(?:reply|lead)"\s*:/.test(raw)) {
    const replyMatch = raw.match(/"reply"\s*:\s*("(?:\\.|[^"\\])*")/);
    let reply = '';
    if (replyMatch) {
      try { reply = JSON.parse(replyMatch[1]); } catch { /* usa el fallback */ }
    }
    return { reply, lead: {}, demoCompleta: false };
  }
  // Sin JSON: si lo que llegó es una llamada a herramientas o ruido de modelo,
  // no se muestra al usuario (bug verificado 2026-10-02 con mimo-v2.6-flash).
  if (/<tool_call>|<function|<invoke|<\/tool|update_session_state/i.test(raw)) {
    return { reply: '', lead: {}, demoCompleta: false };
  }
  return { reply: raw.trim(), lead: {}, demoCompleta: false };
}

// ---------- Persistencia del lead ----------

async function sendNotificationEmail(env: Env, data: Record<string, string>) {
  // Canal principal: webhook de Gmail (Apps Script). Alternativa: Web3Forms.
  if (env.GMAIL_WEBAPP_URL) {
    await fetch(env.GMAIL_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err: any) => console.error('Email webhook failed:', err?.message));
    return;
  }
  if (env.WEB3FORMS_ACCESS_KEY) {
    await fetch('https://api.web3forms.com/submit', {
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
  if (!existed && prev.status !== 404) throw new Error(`Firestore read failed: ${prev.status}`);
  let prevEstado = '';
  let createdAt = new Date().toISOString();
  if (existed) {
    const pd = await prev.json() as any;
    prevEstado = pd?.fields?.estado?.stringValue || '';
    createdAt = pd?.fields?.createdAt?.stringValue || createdAt;
    for (const field of LEAD_FIELDS) {
      const previous = pd?.fields?.[field]?.stringValue;
      if ((!lead[field] || lead[field] === '—') && previous) lead[field] = previous;
    }
  }
  lead.estado = isComplete(lead) ? 'completa' : 'parcial';

  const docData: Record<string, any> = {
    ...lead,
    sessionId,
    site,
    url,
    nota: conversacion,          // conversación completa del usuario (no solo el último mensaje)
    ultimoMensaje,
    privacyPolicy: true,
    source: 'web_asistente_demo',
    createdAt,
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

  if (!existed || (lead.estado === 'completa' && prevEstado !== 'completa')) {
    await sendNotificationEmail(env, {
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

    const userQuestions = cleanHistory.filter((m: any) => m.role === 'user').map((m: any) => m.content);
    const systemPrompt = (lang === 'en' ? PROMPT_EN : PROMPT_ES)
      + documentationContext(userQuestions[userQuestions.length - 1], userQuestions.slice(0, -1));
    const raw0 = await askLLM(env, systemPrompt, cleanHistory);
    // Si el modelo se salta el protocolo JSON (o emite llamadas a herramientas),
    // un reintento con recordatorio.
    let raw = raw0;
    let validOutput = false;
    try {
      const obj = JSON.parse(extractJsonObject(raw0) || 'null');
      validOutput = typeof obj?.reply === 'string' && Boolean(obj.reply.trim());
    } catch { /* reintenta el JSON mal formado */ }
    if (!validOutput || /<tool_call>|<function|update_session_state/i.test(raw0)) {
      raw = await askLLM(env, systemPrompt,
        [...cleanHistory, { role: 'assistant', content: raw0 },
         { role: 'user', content: 'Responde ahora solo con el objeto JSON (campo reply con tu mensaje). - recordatorio del sistema' }]
      ).catch(() => raw0);
    }
    const { reply: modelReply, lead: rawLead } = parseLLMOutput(raw);

    // Red de seguridad: datos que aparezcan literalmente en el chat
    const allText = cleanHistory.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' \n ');
    const lead = normalizeLead(rawLead, lang);
    const fromText = extractFromText(allText);
    for (const [k, v] of Object.entries(fromText)) if (!lead[k]) lead[k] = v;
    // Company contact facts from retrieved pages must never become visitor
    // contact details. Only retain email/phone actually provided by the user.
    if (lead.email && !allText.toLowerCase().includes(lead.email)) lead.email = '';
    if (lead.telefono && !allText.replace(/\D/g, '').includes(lead.telefono.replace(/\D/g, ''))) lead.telefono = '';
    if (!lead.email) lead.email = extractEmail(allText);
    if (!lead.telefono) lead.telefono = extractPhone(allText);
    lead.empresa ||= companyFromAnswer(cleanHistory);
    const requestedPhoneCall = cleanHistory.some((m: any) => m.role === 'user' && /llamada (?:de tel[eé]fono|telef[oó]nica)|phone call|^llamada$/i.test(m.content.trim()));
    const availability = availabilityFromAnswer(cleanHistory);
    if (availability) lead.disponibilidad = availability;
    const requestedVideoCall = /videollamada|video\s*llamada|videoconferencia|video call/i.test(allText);
    if (requestedPhoneCall) lead.modalidad = 'llamada';
    else if (requestedVideoCall || availability) lead.modalidad = 'videollamada 30 min';
    else lead.modalidad = '';
    const reply = demoNextReply(cleanHistory, lead, lang) || modelReply;

    let leadSaved = false;
    // Guarda el contacto desde que hay email, aunque falten datos de la demo.
    // El estado depende de los datos validados, nunca de la afirmación del modelo.
    const completo = isComplete(lead);
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email);
    if (emailOk) {
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

    const replyFallback = lang === 'en'
      ? "Sorry, I didn't catch that. Could you say it again?"
      : 'Perdona, no te he entendido bien. ¿Puedes repetirlo?';
    return new Response(JSON.stringify({ reply: reply || replyFallback, leadSaved }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Assistant API error:', error?.message || error);
    return new Response(JSON.stringify({ error: 'Ha ocurrido un error', details: error?.message || 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
