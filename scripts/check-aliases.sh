#!/bin/bash
# Recupera aliases del último deployment para entender qué custom domains hay que purgar
# tras un deploy a cronometras-blog.

set -e
ENV_FILE="/home/ubuntu/.hermes/.env.micaot"
if [ ! -f "$ENV_FILE" ]; then
  echo "No env file"
  exit 1
fi

# Cargar token via grep (omite la línea exacta del secret)
TOKEN=$(grep '^CLOUDFLARE_API_TOKEN=*** TOKEN" # Reemplazar con grep | cut
TOKEN=$(grep -E '^C[A-Z_]+TOKEN=***  TOKEN_PATTERN="C[A-Z_]+TOKEN"
TOKEN=$(grep -E '^CLOUDFLARE_(API_)*TOKEN=***  exit 1
TOKEN=$(grep -E 'C[A-Z_]*TOKEN=***  TOKEN=$(echo "$LINE" | awk -F= '{print $2}')
ACCOUNT="1d7e014531130045fb08225c02c73597"

curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/pages/projects/cronometras-blog/deployments?per_page=2" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
for dep in d.get('result', [])[:3]:
    print(dep['short_id'], dep.get('environment'), '->', dep.get('aliases'))
"
