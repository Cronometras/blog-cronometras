#!/usr/bin/env python3
"""Recupera los aliases del último deployment de cronometras-blog para poder purgar el dominio cronometras.com después de un deploy.

Pitfall 20 del skill cloudflare-pages-deploy: CF Pages invalida el subdominio *.pages.dev automáticamente,
PERO NO invalida los custom domains. Por eso, después de cambiar el HTML del home en un deploy nuevo,
hay que purgar manualmente la cache del custom domain para que sirva la versión nueva.

Workaround (jun-2026): crear/sobrescribir el alias URL del último deploy contra el custom domain
con la API de Pages. OJO: el endpoint /deployments/{id}/purge_cache NO existe (validado en CF docs).
Solo existe /zones/{zone_id}/purge_cache que requiere scope Zone:Cache Purge.
"""
import urllib.request, urllib.error, json
account = '1d7e014531130045fb08225c02c73597'
deploy_short = '61b9d53f-a582-47e5-9a61-fcdc2e8b3ab1'
token = None
for line in open('/home/ubuntu/.hermes/.env.micaot').read().split('\n'):
    if line.startswith('CLOUDFLARE_API_TOKEN='):
        token = line.split('=', 1)[1].strip()
        break

if not token:
    raise SystemExit('No token')

url = f'https://api.cloudflare.com/client/v4/accounts/{account}/pages/projects/cronometras-blog/deployments/{deploy_short}'
req = urllib.request.Request(url, method='GET', headers={'Authorization': f'Bearer {token}'})
d = json.loads(urllib.request.urlopen(req, timeout=30).read())
result = d['result']
print('deploy id:', result['id'])
print('aliases:', result.get('aliases'))
print('environment:', result.get('environment'))
print('created_on:', result.get('created_on'))
