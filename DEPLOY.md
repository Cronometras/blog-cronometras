# Despliegue en Cloudflare Pages

Este documento explica cómo se despliega este sitio web en **Cloudflare Pages** (no en Netlify).

## Proyecto

- **Proyecto Cloudflare Pages**: `cronometras-blog` (no `blog-cronometras` — el nombre en Pages no siempre coincide con el repo)
- **Custom domain**: `cronometras.com` (también `www.cronometras.com` tras el fix de CNAME flattening de jun-2026)
- **Source**: GitHub `Cronometras/blog-cronometras`, rama `main`
- **Build command**: `npm run build`
- **Build output dir**: `dist`
- **Node version**: 20 (especificada en el entorno del proyecto en Pages)

## Despliegue automático

El proyecto `cronometras-blog` tiene la **integración GitHub conectada**. Cada `git push` a `main` dispara build + deploy automático.

Para forzar un redespliegue sin código nuevo: desde el dashboard de Pages → `cronometras-blog` → Deployments → "Retry deployment" sobre el último.

## Despliegue manual con wrangler

Si la integración Git está caída, o necesitas un deploy urgente sin pasar por GitHub:

```bash
# 1. Cargar token de la bóveda
eval "$(~/.hermes/skills/secret-handling/scripts/load-token.sh CLOUDFLARE_API_TOKEN)"

# 2. Build local (puede tardar varios minutos por el contenido de Firestore)
cd ~/projects/blog-cronometras
npm install --legacy-peer-deps  # solo si cambió package.json
npm run build

# 3. Deploy
~/.local/bin/wrangler pages deploy ./dist \
  --project-name=cronometras-blog \
  --branch=main \
  --commit-dirty=true
```

## Verificación post-deploy

Tras CADA deploy (automático o manual), verificar con `curl` real:

```bash
# 1. Estado del deploy en CF Pages
curl -sS "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/cronometras-blog/deployments?per_page=1" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq '.result[0] | {id, deployment_trigger, latest_commit_sha, created_on}'

# 2. URL en producción
curl -sS -I -A "Mozilla/5.0" "https://cronometras.com/" | head -3

# 3. llms.txt
curl -sS -A "Mozilla/5.0" "https://cronometras.com/llms.txt" | head -10

# 4. Sitemap
curl -sS -A "Mozilla/5.0" "https://cronometras.com/sitemap-0.xml" | head -5

# 5. Un post concreto
curl -sS -I -A "Mozilla/5.0" "https://cronometras.com/es/blog/el-sistema-westinghouse-.../"
```

**Regla de Micaot**: no reportar "desplegado" sin haber hecho `curl` al sitio y verificado con `grep` que el contenido esperado está en producción.

## Purga de caché

Si el deploy no se refleja inmediatamente:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_PURGUE_CACHE" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://cronometras.com/","https://cronometras.com/llms.txt","https://cronometras.com/sitemap-index.xml"]}'
```

`{ZONE_ID}` está en el ledger de Micaot o en el dashboard de Cloudflare → `cronometras.com` → Overview → API.

## Variables de entorno

Las variables de entorno se configuran en el dashboard de Pages → Settings → Environment variables. **Nunca** en el código ni en archivos `.env` commiteados.

| Variable | Uso |
|---|---|
| `GTAG_ID` | Google Analytics 4 measurement ID |
| `FIREBASE_PROJECT_ID` | Proyecto Firestore desde el que se cargan artículos |
| `FIREBASE_CLIENT_EMAIL` | Service account para build-time fetch (server-side) |
| `FIREBASE_PRIVATE_KEY` | Clave privada del service account (cuidado con saltos de línea) |

## Reglas de redirects

Las reglas SEO viven en `public/_redirects` (formato Cloudflare Pages, compatible con la mayoría de reglas de Netlify excepto multi-splat). Tras modificar el archivo, redesplegar para que Pages las recoja.

## Diferencias con Netlify (legacy)

- ~~Netlify Functions~~ → eliminadas. Si en el futuro se necesitan endpoints serverless, usar **Cloudflare Workers** o **Pages Functions** (`functions/` en la raíz del proyecto).
- ~~`netlify.toml`~~ → eliminado. La config de Pages vive en el dashboard.
- ~~`netlify-build.sh`~~ → eliminado. El build command es directamente `npm run build`.
- Multi-splat con `:splat1:splat2` (típico de Netlify) → **no soportado** en Pages. Usar `*` simple al final o reglas más específicas.
