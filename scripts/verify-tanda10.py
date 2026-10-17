#!/usr/bin/env python3
# Verificación post-deploy tanda 10: URLs (derivadas de doc.slug), marcadores nuevos,
# ausencia de patrones corregidos, imágenes y presencia en el índice del blog.
import json, re, time, urllib.request

BASE = "https://cronometras.com"
CHECKS = [
    ("es-d6fca30a900d697d", "Los tres impulsores del cambio", ["1.847 empresas", "segundo año más cálido"]),
    ("x7BYen963Eirnxld4diC", "9,51 segundos", ["8,774", "H.B. Carey", "(v4)"]),
    ("es-28ef1c9d714c4e4b", "Un programa de ergonomía bien planteado", ["multiplica la fatiga lumbar por 3", "+8 a +12 puntos de OEE"]),
    ("es-ca9dd8ac5b12900a", "400.000", ["800.000-1.200.000", "9-15% mínimo"]),
    ("es-4b6b36c70025a52c", "Caso práctico simulado", ["±3% de precisión", "55% y el 65% del OPEX"]),
    ("es-8e755e8e4d0ce262", "100.000 TMU = 1 hora", ["5000 MOST TMU", "900+ códigos", "A (Activity"]),
    ("es-42b337b47452f0c3", "Girar (T)", ["Boeing, Airbus", "práctica arcaica"]),
    ("es-0ab1469a4870e1eb", "no fija un número mínimo de observaciones", ["(Norma OIT)", "CronometrasApp Work Sampling", "Mínimo de 384 observaciones"]),
    ("es-6f7f676a93cfe11c", "la experiencia de planta cuenta una historia diferente", ["Departamento de Inteligencia de Mercado", "+200% en productividad"]),
    ("es-84ab36a51096a354", "K. B. Zandin", ["cuarta generación", "movimientos del cuerpo", "32 países"]),
]

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except Exception as e:
        return 0, str(e)

def main():
    time.sleep(45)
    index_status, index_html = get(BASE + "/es/blog/")
    print("indice /es/blog/ ->", index_status)
    ok = fail = 0
    for doc_id, marker, forbiddens in CHECKS:
        d = json.load(open(f"/tmp/tanda10/{doc_id}.json"))
        slug = d.get("slug", "")
        slugpart = slug.split("/", 1)[1] if "/" in slug else slug
        url = f"{BASE}/es/blog/{slugpart}/"
        status, html = get(url)
        problems = []
        if status != 200:
            problems.append(f"HTTP {status}")
        if marker not in html:
            problems.append("marcador ausente")
        for fb in forbiddens:
            if fb in html:
                problems.append(f"patrón residual: {fb!r}")
        img = d.get("imageUrl") or d.get("coverImage") or ""
        img_status = "-"
        if img.startswith("http"):
            img_status, _ = get(img)
        elif img.startswith("/"):
            img_status, _ = get(BASE + img)
        if img_status not in (200, "-"):
            problems.append(f"imagen {img_status}")
        in_index = slugpart in index_html
        if not in_index:
            problems.append("no listado en /es/blog/")
        if problems:
            fail += 1
            print("FAIL", doc_id, url, "|", "; ".join(problems))
        else:
            ok += 1
            print("OK  ", doc_id, url, "| img:", img_status, "| indice: si")
    print(f"\nRESUMEN: OK={ok} FAIL={fail}")
    # paginación del índice
    n_listed = 0
    for doc_id, _, _ in CHECKS:
        d = json.load(open(f"/tmp/tanda10/{doc_id}.json"))
        slugpart = d.get("slug", "").split("/", 1)[1]
        if slugpart in index_html:
            n_listed += 1
    print("listados en primera página del índice:", n_listed, "/ 10")

if __name__ == "__main__":
    main()
