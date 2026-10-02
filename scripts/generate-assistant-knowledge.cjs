const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const chunks = [];
const config = JSON.parse(fs.readFileSync(path.join(root, 'src/config/config.json'), 'utf8'));

function plain(text) {
  return text.replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\*\*/g, '').trim();
}

function addDocument(source, markdown) {
  let headings = [];
  let body = [];
  function flush() {
    const title = headings.filter(Boolean).join(' > ');
    const paragraphs = plain(body.join('\n')).split(/\n\s*\n/);
    let text = '';
    function emit() {
      if (text.trim()) chunks.push({ source, title, text: text.trim() });
      text = '';
    }
    for (const paragraph of paragraphs) {
      // Keep every paragraph; split long ones rather than truncating the manual.
      for (let i = 0; i < paragraph.length; i += 2400) {
        const part = paragraph.slice(i, i + 2400);
        if (text.length + part.length > 3000) emit();
        text += part + '\n\n';
      }
    }
    emit();
    body = [];
  }
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush();
      headings = headings.slice(0, heading[1].length - 1);
      headings[heading[1].length - 1] = plain(heading[2]);
    } else body.push(line);
  }
  flush();
}

for (const file of fs.readdirSync(path.join(root, 'docs/assistant')).sort()) {
  if (file.startsWith('manual-') && file.endsWith('.md')) {
    const source = `docs/assistant/${file}`;
    addDocument(source, fs.readFileSync(path.join(root, source), 'utf8'));
  }
}

// MDX Section props contain the published feature documentation. Extract only
// text literals, without executing JSX or passing implementation code to the LLM.
const pages = fs.readdirSync(path.join(root, 'src/content/pages/es')).filter(f => f.endsWith('.mdx')).sort();
for (const source of [...pages.map(f => `src/content/pages/es/${f}`), 'src/content/features/es/index.mdx']) {
  const raw = fs.readFileSync(path.join(root, source), 'utf8');
  let markdown = '';
  for (const match of raw.matchAll(/\b(title|content):\s*("(?:\\.|[^"\\])*")/g)) {
    const value = plain(JSON.parse(match[2]));
    markdown += (match[1] === 'title' ? '\n## ' : '\n\n') + value;
  }
  addDocument(source, markdown);
}

if (!chunks.length) throw new Error('Assistant documentation index is empty');
addDocument('src/config/config.json', `# Contacto oficial de Cronometras: teléfono, email y ubicación\n\nTeléfono: ${config.params.phone}. Email: ${config.params.email}. Ubicación: ${config.params.location}. Página de contacto: ${config.site.base_url}/es/contact/. Son los datos de Cronometras, no del visitante.`);

async function finish() {
  // Scan the requested public pages only. The blog listing is included, but
  // individual articles and linked pages are explicitly excluded.
  // Source documentation remains available if a page cannot be reached.
  const routes = ['', 'blog', 'about', 'contact', 'features', 'estudio-metodos-tiempos', ...pages.filter(file => file !== 'screens.mdx').map(file => file.replace('.mdx', ''))];
  const urls = new Set(routes.map(route => new URL(`/es/${route ? route + '/' : ''}`, config.site.base_url).href));
  const publicUrls = [...urls];
  let scanned = 0;
  for (let offset = 0; offset < publicUrls.length; offset += 6) {
    const results = await Promise.all(publicUrls.slice(offset, offset + 6).map(async url => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
        if (!main) throw new Error('No main content found');
        const text = plain(main.replace(/<(script|style|svg|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
          .replace(/<img\b[^>]*\balt="([^"]+)"[^>]*>/gi, (_, alt) => `\nImagen: ${alt}\n`)
          .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, title) => `\n${'#'.repeat(Number(level))} ${plain(title)}\n`)
          .replace(/<\/(?:p|div|section|li)>/gi, '\n'));
        return { url, text };
      } catch (error) {
        console.warn(`Website scan unavailable for ${url} (${error.message}); using local documentation.`);
        return null;
      }
    }));
    for (const result of results) if (result) { addDocument(result.url, result.text); scanned++; }
  }
  const output = path.join(root, 'functions/_shared/assistant-knowledge.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(chunks, null, 2) + '\n');
  console.log(`Assistant knowledge: ${new Set(chunks.map(c => c.source)).size} documents, ${chunks.length} sections, ${fs.statSync(output).size} bytes; ${scanned}/${publicUrls.length} public pages scanned.`);
}
finish().catch(error => { console.error(error); process.exitCode = 1; });
