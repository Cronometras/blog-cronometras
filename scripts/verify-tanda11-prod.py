#!/usr/bin/env python3
# Verificación post-deploy tanda 11: 6 URLs (marcadores nuevos, patrones viejos a 0, imagen),
# índice reparado (page/9+ = 200 y los 4 artículos antes ausentes ya listados).
import time, urllib.request

BASE = 'https://cronometras.com'
ARTICLES = [
    ('smed-reduccion-del-tiempo-de-cambio-de-maquina-optimizacion-del-oee-via-ingenieria-de-metodos-y-mtm',
     ['Caso práctico simulado', '1 TMU = 0,036 s', '/en/blog/smed-', 'prodcont.com'],
     ['800-2000 TMU', '/en/smed-']),
    ('tablas-de-ashcroft-las-matematicas-exactas-para-maximizar-la-asignacion-de-maquinas-mms-y-justificar-la-carga-de-trabajo',
     ['H. Ashcroft en 1950', 'Caso práctico simulado', 'prodcont.com'],
     ['James H. Ashcroft', 'años 60']),
    ('tecnica-especializada-13-analisis-de-therbligs-para-dominar-la-productividad-en-el-montaje-fino-escenario-2025',
     ['Sujetar (H)', 'Caso práctico simulado', 'prodcont.com'],
     ['Posición imposible', 'Málaga']),
    ('tecnica-especializada-14-cronometraje-oee-y-productividad-en-procesos-quimicos-y-continuos-guia-tecnica-2025',
     ['evita accidentes y paradas', 'Caso práctico simulado', '≈5.800 lotes', 'prodcont.com'],
     ['安全事故', 'Secuencia simplificada B']),
    ('tecnica-especializada-18-dominio-del-calculo-de-interferencias-en-la-asignacion-multi-maquina-textil',
     ['RD 486/1997', 'lugares de trabajo', 'prodcont.com'],
     ['puestos con pantallas', 'asignación multi-máquina y fatiga acumulada']),
    ('tecnicas-de-balanceo-de-linea-de-ensamblaje-del-cronometraje-estatico-al-oee-mayor-85-con-mtm',
     ['Takt efectivo', 'Caso práctico simulado', 'prodcont.com'],
     ['e-motion', 'objetivos y defendibles']),
]
T10_AUSENTES = [
    'el-nuevo-paradigma-del-cronometraje-industrial-en-2025-prl-y-productividad',
    'impacto-de-la-ergonomia-en-los-tiempos-de-ciclo-de-la-fatiga-variable-al-oee-maximizado-horizonte-2025',
    'ingenieria-de-tiempos-en-logistica-y-picking-mas-alla-del-cronometro-con-mtm-y-most',
    'introduccion-a-los-sistemas-de-tiempos-predeterminados-mtm-y-most-metodologias-avanzadas',
]

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode('utf-8', 'ignore')
    except Exception as e:
        return 0, str(e)

time.sleep(60)
ok = fail = 0
for slug, markers, forbiddens in ARTICLES:
    url = f'{BASE}/es/blog/{slug}/'
    st, html = get(url)
    probs = []
    if st != 200:
        probs.append(f'HTTP {st}')
    for m in markers:
        if m not in html:
            probs.append(f'marcador ausente: {m}')
    for f in forbiddens:
        if f in html:
            probs.append(f'patron residual: {f}')
    img_st, _ = get(f'{BASE}/images/webp/og-default.png')
    if img_st != 200:
        probs.append(f'imagen {img_st}')
    if probs:
        fail += 1
        print('FAIL', url, '|', '; '.join(probs))
    else:
        ok += 1
        print('OK  ', url, '| img:', img_st)

print('\n--- indice ---')
idx_pages = {}
all_index = ''
for p in ['', 'page/2/', 'page/3/', 'page/4/', 'page/5/', 'page/6/', 'page/7/', 'page/8/', 'page/9/', 'page/10/', 'page/11/']:
    st, h = get(f'{BASE}/es/blog/{p}')
    idx_pages[p or '1'] = st
    if st == 200:
        all_index += h
print('paginas del indice:', idx_pages)
for slug in T10_AUSENTES:
    if slug in all_index:
        ok += 1
        print('OK   listado tras fix de paginacion:', slug[:60])
    else:
        fail += 1
        print('FAIL sigue sin listar:', slug[:60])
print(f'\nRESUMEN: OK={ok} FAIL={fail}')
