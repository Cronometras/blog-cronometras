const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const index = require('../functions/_shared/assistant-knowledge.json');
const context = { exports: {}, require: () => index };
vm.createContext(context);
vm.runInContext(ts.transpileModule(fs.readFileSync(path.join(root, 'functions/_shared/assistant-knowledge.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, context);
const { retrieveDocumentation, documentationContext } = context.exports;

const routes = ['', 'blog', 'features', 'about', 'dashboard', 'info', 'method', 'repetitive', 'continuous', 'frequency', 'machine', 'saturation', 'supplements', 'report', 'library', 'security', 'organizations', 'contact'];
const sources = new Set(index.map(chunk => chunk.source.replace(/\/$/, '')));
for (const route of routes) assert(sources.has(`https://cronometras.com/es${route ? '/' + route : ''}`), `Missing requested page: ${route}`);
const blogSources = [...sources].filter(source => /\/es\/blog\/[^/]+$/.test(source));
assert.equal(blogSources.length, 0, 'Individual blog articles must not be indexed');
assert(index.some(chunk => chunk.source === 'docs/assistant/manual-usuario.md' && /Vídeo y Voz/.test(chunk.title)), 'The end of the full manual must be indexed');

const cases = [
  ['graba video', /graba.*v[ií]deo|grabaci[oó]n de v[ií]deo/is],
  ['tiene comentarios', /comentarios.*registro|registro.*comentarios/is],
  ['y sin sonido', /sin sonido|sin audio/i],
  ['puedo comparar estudios', /comparaci[oó]n de estudios/i],
  ['importar varios archivos Excel', /m[uú]ltiples archivos|varios archivos/i],
  ['mover estudios entre carpetas', /arrastrar.*soltar|drag.*drop/is],
  ['códigos de recuperación MFA', /c[oó]digos de (?:recuperaci[oó]n|respaldo)/i],
  ['Does it support voice comments?', /voz.*comentarios|comentarios.*voz/is],
];
for (const [question, expected] of cases) {
  const docs = retrieveDocumentation(question);
  assert(docs.length > 0 && docs.length <= 8, question);
  assert.match(docs.map(doc => doc.title + '\n' + doc.text).join('\n'), expected, question);
  assert(docs.reduce((size, doc) => size + doc.title.length + doc.text.length + doc.source.length, 0) <= 16000);
}
for (const question of ['¿Cuál es vuestro teléfono?', 'What is your phone number?']) {
  const docs = retrieveDocumentation(question);
  assert.match(docs[0].title, /contacto/i, question);
  assert.match(docs.map(doc => doc.text).join('').replace(/\s/g, ''), /\+34619588239/);
}
assert.equal(retrieveDocumentation('zxqvxyz', ['graba video']).length, 0, 'Previous topic must not override an unrelated new question');
assert.match(documentationContext('graba video', []), /NO significa que la app lo implemente/);
assert.match(documentationContext('vuestro teléfono', []), /NO son datos del lead/);
async function handlerCheck() {
  const prompts = [];
  const handler = { exports: {}, require: () => context.exports, console, AbortController, setTimeout, clearTimeout, Response, Request,
    fetch: async (_, options) => {
      const input = JSON.parse(options.body);
      prompts.push(input.messages[0].content);
      // A malformed first response exercises the protocol repair as well.
      const content = prompts.length === 1 ? '{"reply":"Sí.","lead":{""},"demo_completa":false}'
        : '{"reply":"Sí, graba vídeo.","lead":{},"demo_completa":false}';
      return Response.json({ choices: [{ message: { content } }] });
    },
  };
  vm.createContext(handler);
  vm.runInContext(ts.transpileModule(fs.readFileSync(path.join(root, 'functions/api/assistant.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, handler);
  const response = await handler.exports.onRequestPost({ env: { LLM_API_KEY: 'test', LLM_BASE_URL: 'https://llm.test' },
    request: new Request('https://example.test/api/assistant', { method: 'POST', body: JSON.stringify({ messages: [
      { role: 'assistant', content: 'La solicitud de demo está anotada.' }, { role: 'user', content: 'graba video?' },
    ] }) }),
  });
  assert.equal(response.status, 200);
  assert.equal(prompts.length, 2);
  assert.equal(prompts[0], prompts[1], 'Protocol retry must retain retrieved documentation');
  assert.match(prompts[0], /docs\/assistant\/manual-usuario.md/);
  assert.match(prompts[0], /sin sonido/);
  console.log('OK: all 18 requested pages indexed, zero blog articles; feature and public contact retrieval verified; documentation reaches the LLM and survives a protocol retry.');
}
handlerCheck().catch(error => { console.error(error); process.exitCode = 1; });
