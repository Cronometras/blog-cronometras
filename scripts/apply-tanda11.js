#!/usr/bin/env node
// Aplica las correcciones de tanda 11 (plan 90-95) a articulos_cronometras (assert-then-replace por fix).
// Backup previo: /home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda11-2026-10-17.json
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

// ---- 1. SMED (es-6c8468fcce6eeb55) ----
const SMED = 'es-6c8468fcce6eeb55';
const SMED_FIXES = [
  { field: 'topic', old: 'Cambio de Maquina', new: 'Cambio de Máquina' },
  { old: 'Desde la perspectiva de **Cronometras**, el SMED es un desafío matemático y biomecánico: se trata de la reducción sistemática de TMUs (*Time Measurement Units*) y de la eliminación de movimientos innecesarios en el cambio de referencia de una máquina.',
    new: 'En ingeniería de métodos, el SMED es un desafío de medición y de método: reducir sistemáticamente el tiempo de cada elemento del cambio de referencia y eliminar movimientos innecesarios. Medir ese cambio puede hacerse por cronoanálisis con cronómetro —el enfoque de **Cronometras**, con valoración del ritmo y suplementos OIT y TAL— o con sistemas de tiempos predeterminados del sector como MTM, que expresa cada elemento en TMU (*Time Measurement Units*).' },
  { old: '- No descomponen el cambio en elementos MTM medibles.', new: '- No descomponen el cambio en elementos medibles.' },
  { old: '### Fase 1: Observación y descomposición MTM\nCronometrar el cambio actual descomponiéndolo en elementos MTM. Cada elemento se mide en TMU. Resultado: un estándar de 800-2000 TMU por cambio.',
    new: '### Fase 1: Observación y descomposición\nCronometrar el cambio actual descomponiéndolo en elementos medibles (cada uno con su tiempo observado y valorado). Si se trabaja con MTM, los elementos se expresan en TMU (1 TMU = 0,036 s; una hora equivale a 100.000 TMU).' },
  { old: '### Fase 4: Establecer el nuevo estándar MTM\nEl nuevo tiempo de cambio se calcula con los TMU de los elementos optimizados. Típicamente se reduce de 60-90 min a 8-15 min.',
    new: '### Fase 4: Establecer el nuevo estándar\nEl nuevo tiempo de cambio se calcula a partir de los tiempos de los elementos optimizados. Reducciones del orden de 60-90 min a 8-15 min son habituales en proyectos bien ejecutados (ejemplo orientativo).' },
  { old: '- **-50% a -80% en tiempo de cambio** (de 60 min a 10-12 min es habitual).\n- **+10-25% en OEE** al poder hacer lotes más pequeños.\n- **-30% en inventario** de producto en curso.',
    new: '- **Reducciones del 50-80 % en tiempo de cambio** (ejemplo orientativo; depende del punto de partida y del tipo de máquina).\n- **Mejoras de dos dígitos en OEE** al poder hacer lotes más pequeños (ejemplo orientativo).\n- **Menos inventario** de producto en curso.' },
  { old: '## Caso típico\n\nUna planta de inyección de plástico con cambios de molde de 45 minutos logró reducirlos a 8 minutos tras un proyecto SMED técnico (MTM-based). Resultado:\n- Lote económico reducido de 800 a 150 unidades.\n- Inventario de producto en curso: -35%.\n- OEE global: de 62% a 79%.\n- ROI: 5 meses.',
    new: '## Caso práctico simulado\n\nEjemplo construido con fines didácticos a partir de parámetros plausibles del sector; no corresponde a una implantación real ni a un cliente concreto. Una planta de inyección de plástico con cambios de molde de 45 minutos los reduce a 8 minutos tras un proyecto SMED técnico:\n- Lote económico reducido de 800 a ≈150 unidades (proporcional a la reducción del cambio).\n- Inventario de producto en curso: -35 %.\n- OEE global: de 62 % a 79 % (+17 puntos).\n- ROI: 5 meses.' },
  { old: '> **Nota**: La versión completa de este artículo, con la metodología MTM-SMED paso a paso, está disponible en inglés en el siguiente enlace: [SMED: Changeover Time Reduction – OEE Optimization via Methods Engineering and MTM](/en/smed-changeover-time-reduction-oee-optimization-via-methods-engineering-and-mtm/).',
    new: 'Si quieres aplicar esta metodología a tu planta con tiempos medidos y defendibles, en [ProdCont](https://prodcont.com/) te ayudamos a poner en marcha el proyecto.\n\nEste artículo también está disponible en inglés: [SMED: Changeover Time Reduction – OEE Optimization via Methods Engineering and MTM](/en/blog/smed-changeover-time-reduction-oee-optimization-via-methods-engineering-and-mtm/).' },
];

// ---- 2. Ashcroft (es-50b8d2f80d3359b6) ----
const ASH = 'es-50b8d2f80d3359b6';
const ASH_FIXES = [
  { old: 'Las **Tablas de Ashcroft** (desarrolladas por James H. Ashcroft en los años 60) son el método matemáticamente riguroso para calcular la asignación óptima de máquinas. Consideran:',
    new: 'Las **Tablas de Ashcroft**, publicadas por H. Ashcroft en 1950 en la *Journal of the Royal Statistical Society* («The Productivity of Several Machines Under the Care of One Operator»), son el método clásico de cálculo riguroso de la asignación de máquinas. Consideran:' },
  { old: '### Fórmula fundamental\n\nPara N máquinas asignadas a un operario:\n\n**P(0) = 1 / Σ (λ^n / n!) para n=0 a N**\n\nDonde λ = T_h / T_m. La tabla de Ashcroft da el **factor de servicio** f(λ, N) que corrige la asignación según la carga real.',
    new: '### Qué calculan las tablas\n\nPara N máquinas asignadas a un operario, las tablas dan el número medio de máquinas paradas (y la pérdida de productividad asociada) a partir de la relación entre el tiempo de atención del operario y el tiempo de marcha de la máquina, aplicando conceptos de teoría de colas al problema de la interferencia entre operario y máquina. La tabla devuelve el factor que corrige la asignación teórica según la carga real.' },
  { old: 'Empresas que aplican las Tablas de Ashcroft reportan:\n\n- **+15-25% en productividad** vs asignación intuitiva.\n- **-10-20% en plantilla** necesaria para el mismo OEE objetivo.\n- **+5-10 puntos de OEE** al eliminar sub-asignaciones o sobre-asignaciones.',
    new: 'Frente a la asignación intuitiva, las tablas permiten dimensionar con criterio estadístico (cifras orientativas según el caso):\n\n- Mejoras de dos dígitos en productividad por hora de operario (ejemplo orientativo).\n- Menos plantilla necesaria para el mismo objetivo de servicio (ejemplo orientativo).\n- Mejoras de OEE al eliminar subasignaciones o sobreasignaciones (ejemplo orientativo).' },
  { old: '## Caso típico\n\nUna planta textil con 20 telares pasó de asignar 6 telares/operario (intuitivo) a 8 telares/operario (Ashcroft), manteniendo el nivel de servicio. Resultado: -25% de plantilla y +18% de OEE. ROI: 3 meses.',
    new: '## Caso práctico simulado\n\nEjemplo construido con fines didácticos a partir de parámetros plausibles del sector; no corresponde a una implantación real ni a un cliente concreto. Una planta textil con 20 telares pasa de asignar 6 telares/operario (intuitivo) a 8 telares/operario (cálculo de Ashcroft), manteniendo el nivel de servicio. Resultado: de 4 a 3 operarios (-25 % de plantilla) y +18 % de OEE. ROI: 3 meses.' },
  { old: '> **Nota**: La versión completa de este artículo, con la tabla de Ashcroft completa y ejemplos numéricos paso a paso, está disponible en inglés en el siguiente enlace: [Ashcroft Tables: The Exact Mathematics to Maximize Machine Assignment (MMS) and Justify Workload](/en/ashcroft-tables-the-exact-mathematics-to-maximize-machine-assignment-mms-and-justify-workload/).',
    new: 'Si necesitas justificar la carga de trabajo de tu planta con cálculo riguroso y datos medidos, en [ProdCont](https://prodcont.com/) te ayudamos a hacerlo.\n\nEste artículo también está disponible en inglés: [Ashcroft Tables: The Exact Mathematics to Maximize Machine Assignment (MMS) and Justify Workload](/en/blog/ashcroft-tables-the-exact-mathematics-to-maximize-machine-assignment-mms-and-justify-workload/).' },
];

// ---- 3. Therbligs (es-cb24a8fce215dab0) ----
const TH = 'es-cb24a8fce215dab0';
const TH_FIXES = [
  { old: 'El **análisis de Therbligs** —desarrollado por Frank B. Gilbreth en los años 20 y refinado por la ingeniería de métodos moderna— es la herramienta definitiva para descomponer cualquier operación manual en sus 18 movimientos elementales y eliminar el desperdicio invisible.',
    new: 'El **análisis de Therbligs** —desarrollado por Frank y Lillian Gilbreth a principios del siglo XX y refinado por la ingeniería de métodos moderna— es la herramienta clásica para descomponer cualquier operación manual en sus 18 movimientos elementales y eliminar el desperdicio invisible.' },
  { old: 'Un *therblig* (anagrama de Gilbreth) es la unidad mínima de movimiento humano reconocida por la ingeniería de métodos. Los 18 therbligs son:\n\n**Therbligs útiles** (añaden valor):\n- Alcanzar (TL), Mover (T), Coger (G), Soltar (RL), Posicionar (P), Ensamblar (A), Desmontar (D), Usar (U), Buscar (Sh), Seleccionar (St), Planear (Pn).\n\n**Therbligs no útiles** (muda, deben eliminarse):\n- Esperar (H), Retraso inevitable (UD), Retraso evitable (AD), Descanso (R), Posición imposible (IF), Pre-posición (PP), Encontrar (F), Inspeccionar (I).',
    new: 'Un *therblig* (anagrama de «Gilbreth» con las dos letras finales transpuestas) es la unidad básica de movimiento humano en la ingeniería de métodos. La lista clásica recoge 18 therbligs, habitualmente clasificados en dos grupos:\n\n**Efectivos** (contribuyen a avanzar la operación):\n- Alcanzar o transporte en vacío (TE), Mover o transporte con carga (TL), Coger (G), Soltar (RL), Precolocar (PP), Ensamblar (A), Desmontar (DA) y Usar (U).\n\n**Inefectivos** (no aportan valor y deben reducirse):\n- Buscar (Sh), Encontrar (F), Seleccionar (St), Sujetar (H), Posicionar (P), Inspeccionar (I), Planear (Pn), Demora inevitable (UD), Demora evitable (AD) y Descanso (R).' },
  { old: '- **Therbligs identificados en un ciclo**: 47 (32 útiles + 15 no útiles).\n- **TMU por ciclo**: 1.250 TMU.\n- **Porcentaje de valor añadido**: 65%.\n- **Ahorro potencial** eliminando therbligs no útiles: -25% del tiempo.',
    new: '- **Therbligs identificados en un ciclo**: del orden de 45-50 movimientos elementales (ejemplo orientativo).\n- **Duración del ciclo**: equivalente a ≈1.250 TMU (45 s; 1 TMU = 0,036 s).\n- **Porcentaje de valor añadido**: ≈65 % (ejemplo orientativo).\n- **Ahorro potencial** eliminando therbligs inefectivos: del orden del 25 % del tiempo (ejemplo orientativo).' },
  { old: '- **-20% a -35% en tiempo de ciclo** en montaje fino.\n- **-40% en tasa de defectos** (mejor método = menos errores).\n- **-50% en fatiga del operario** (eliminar therbligs inútiles).\n- **+15-25% en productividad** global de la línea.',
    new: '- Reducciones del 20-35 % en tiempo de ciclo en montaje fino (ejemplo orientativo).\n- Menos defectos al mejorar el método (ejemplo orientativo).\n- Menos fatiga del operario al eliminar therbligs inefectivos.\n- Mejoras de dos dígitos en productividad de línea (ejemplo orientativo).' },
  { old: '## Caso típico 2025\n\nUna planta de ensamblaje de microelectrónica en Málaga redujo el tiempo de ciclo de una operación de 8.2s a 5.7s (-30%) tras un proyecto de therbligs de 4 semanas. La inversión se amortizó en 6 semanas gracias al aumento de capacidad.',
    new: '## Caso práctico simulado\n\nEjemplo construido con fines didácticos a partir de parámetros plausibles del sector; no corresponde a una implantación real ni a un cliente concreto. Una planta de ensamblaje de microelectrónica reduce el tiempo de ciclo de una operación de 8,2 s a 5,7 s (-30 %) tras un proyecto de therbligs de 4 semanas. La inversión se amortiza en 6 semanas gracias al aumento de capacidad.' },
  { old: '> **Nota**: La versión completa de este artículo, con la tabla de los 18 therbligs, ejemplos paso a paso y casos prácticos, está disponible en inglés en el siguiente enlace: [Specialized Technique #13: Therblig Analysis to Master Productivity in Fine Assembly (Scenario 2025)](/en/specialized-technique-13-therblig-analysis-to-master-productivity-in-fine-assembly-scenario-2025/).',
    new: 'Si quieres identificar y eliminar estos movimientos improductivos en tus líneas de montaje, en [ProdCont](https://prodcont.com/) te ayudamos a medirlos y corregirlos.\n\nEste artículo también está disponible en inglés: [Specialized Technique #13: Therblig Analysis to Master Productivity in Fine Assembly (Scenario 2025)](/en/blog/specialized-technique-13-therblig-analysis-to-master-productivity-in-fine-assembly-scenario-2025/).' },
];

// ---- 4. Procesos químicos (es-90878dc9750e99ce) ----
const QUIM = 'es-90878dc9750e99ce';
const QUIM_FIXES = [
  { old: 'pero su monitorización evita安全事故).', new: 'pero su monitorización evita accidentes y paradas).' },
  { old: '- Pasa el 70% del tiempo **monitorizando** indicadores (temperatura, presión, caudal).\n- El 20% del tiempo **realizando tareas puntuales** (purgas, toma de muestras, ajustes).\n- El 10% del tiempo **en esperas programadas** (cambio de lote, limpieza CIP).',
    new: '- Pasa la mayor parte del tiempo **monitorizando** indicadores (temperatura, presión, caudal).\n- Una parte menor **realizando tareas puntuales** (purgas, toma de muestras, ajustes).\n- El resto **en esperas programadas** (cambio de lote, limpieza CIP).' },
  { old: '## La solución: cronometraje de procesos con MTM y MOST', new: '## La solución: medir cada componente del proceso con el método adecuado' },
  { old: '### 1. MTM para las tareas puntuales\n- Purgas, calibraciones, tomas de muestra: descomponer en TMU.\n- Establecer frecuencia (cada 2h, cada 8h, etc.) para calcular el tiempo medio por turno.',
    new: '### 1. Tiempos para las tareas puntuales\n- Purgas, calibraciones, tomas de muestra: descomponer en elementos medibles. MTM, un sistema de tiempos predeterminados del sector, los expresa en TMU; el cronoanálisis con cronómetro —el enfoque de **Cronometras**, con valoración del ritmo y suplementos OIT y TAL— los mide sobre el trabajo real.\n- Establecer frecuencia (cada 2h, cada 8h, etc.) para calcular el tiempo medio por turno.' },
  { old: '### 2. MOST para los movimientos de operación\n- Apertura/cierre de válvulas, conexión de mangueras, etc.\n- Secuencia simplificada B para máxima velocidad.',
    new: '### 2. MOST para los movimientos de operación\n- Apertura/cierre de válvulas, conexión de mangueras, etc.\n- MOST (método del sector, de K. B. Zandin) analiza estas tareas con sus modelos de secuencia: movimiento general, movimiento controlado y uso de herramientas.' },
  { old: 'En plantas químicas, el OEE típico es del 60-75% (vs 85% en automoción), lo que indica un potencial de mejora enorme.',
    new: 'En plantas químicas es frecuente encontrar OEE por debajo de los niveles del sector automovilístico (cifra orientativa: 60-75 % frente al 85 % de referencia en automoción), lo que indica un potencial de mejora importante.' },
  { old: '- **Tiempo de respuesta del operario** (MTTR, Mean Time To Repair/Resolve).', new: '- **Tiempo de respuesta del operario** ante una alarma.' },
  { old: '- **+8-15 puntos de OEE** en 6-12 meses.\n- **-20% en variabilidad** del proceso.',
    new: '- Mejoras de OEE de varios puntos en 6-12 meses (ejemplo orientativo: +8 a +15).\n- Menos variabilidad del proceso (ejemplo orientativo: del orden del 20 %).' },
  { old: '## Caso típico\n\nUna planta química con 4 reactores en paralelo (ciclo de 6h por lote) logró:\n- Aumentar el OEE de 58% a 73% (+15 puntos).\n- Reducir el tiempo de cambio de lote de 90 min a 45 min.\n- Aumentar la producción anual de 1.450 a 1.820 lotes/año (+26%).',
    new: '## Caso práctico simulado\n\nEjemplo construido con fines didácticos a partir de parámetros plausibles del sector; no corresponde a una implantación real ni a un cliente concreto. Una planta química con 4 reactores en paralelo (ciclo de 6 h por lote, ≈5.800 lotes/año de capacidad teórica) logra:\n- Aumentar el OEE de 58 % a 73 % (+15 puntos).\n- Reducir el tiempo de cambio de lote de 90 min a 45 min.\n- Aumentar la producción anual de ≈3.360 a ≈4.230 lotes/año (+26 %, en línea con la mejora del OEE).' },
  { old: '> **Nota**: La versión completa de este artículo, con la metodología MTM/MOST para procesos químicos y casos prácticos detallados, está disponible en inglés en el siguiente enlace: [Specialized Technique #14: Timing, OEE and Productivity in Chemical and Continuous Processes (Technical Guide 2025)](/en/specialized-technique-14-timing-oee-and-productivity-in-chemical-and-continuous-processes-technical-guide-2025/).',
    new: 'Si necesitas tiempos fiables para planificar y decidir en un proceso continuo, en [ProdCont](https://prodcont.com/) te ayudamos a medirlos.\n\nEste artículo también está disponible en inglés: [Specialized Technique #14: Timing, OEE and Productivity in Chemical and Continuous Processes (Technical Guide 2025)](/en/blog/specialized-technique-14-timing-oee-and-productivity-in-chemical-and-continuous-processes-technical-guide-2025/).' },
];

// ---- 5. Interferencias textil (es-30426082d9951457) ----
const TEX = 'es-30426082d9951457';
const TEX_FIXES = [
  { old: '1. Caracterizar la distribución del tiempo de máquina (medir al menos 100 ciclos).',
    new: '1. Caracterizar la distribución del tiempo de máquina (con ciclos suficientes para estabilizar la media y la desviación).' },
  { old: '- **T_h** típico: 1.5-3 min (cambio de bobina, enhebrado, inspección).\n- **T_m** típico: 8-25 min (tejido de una pieza).\n- **Asignación óptima**: 4-8 máquinas por operario (depende del CV).',
    new: '- **T_h** típico: 1,5-3 min (cambio de bobina, enhebrado, inspección) (ejemplo orientativo).\n- **T_m** típico: 8-25 min (tejido de una pieza) (ejemplo orientativo).\n- **Asignación óptima**: del orden de 4-8 máquinas por operario según el CV (ejemplo orientativo).' },
  { old: '- **ISO 10075**: principios ergonómicos relativos a la carga de trabajo mental.\n- **OIT**: recomendaciones sobre asignación multi-máquina y fatiga acumulada.\n- **RD 486/1997**: disposiciones mínimas de seguridad y salud en puestos con pantallas (cuando aplique a controles textiles).',
    new: '- **ISO 10075**: principios ergonómicos relativos a la carga de trabajo mental.\n- **OIT**: convenios y recomendaciones sobre tiempo de trabajo, descansos y fatiga.\n- **RD 486/1997**: disposiciones mínimas de seguridad y salud en los lugares de trabajo (condiciones ambientales y de los puestos).' },
  { old: '- **+12-20% en OEE** vs asignación intuitiva.\n- **-30% en paradas por interferencia** (operario llega a tiempo a la máquina).\n- **Cumplimiento normativo** ante la Inspección de Trabajo.',
    new: '- Mejoras de OEE frente a la asignación intuitiva (ejemplo orientativo: +12-20 %).\n- Menos paradas por interferencia, porque el operario llega a tiempo a la máquina (ejemplo orientativo: del orden del 30 %).\n- Criterio documentado ante la Inspección de Trabajo.' },
  { old: '> **Nota**: La versión completa de este artículo, con la formulación matemática y un caso de estudio de 30 telares, está disponible en inglés en el siguiente enlace: [Specialized Technique #18: Mastering Interference Calculation in Textile Multi-Machine Assignment](/en/specialized-technique-18-mastering-interference-calculation-in-textile-multi-machine-assignment/).',
    new: 'Si quieres calcular la asignación óptima de tus equipos con datos medidos, en [ProdCont](https://prodcont.com/) te ayudamos a hacer el análisis.\n\nEste artículo también está disponible en inglés: [Specialized Technique #18: Mastering Interference Calculation in Textile Multi-Machine Assignment](/en/blog/specialized-technique-18-mastering-interference-calculation-in-textile-multi-machine-assignment/).' },
];

// ---- 6. Balanceo de línea (es-d6b19578b49a9a2e) ----
const BAL = 'es-d6b19578b49a9a2e';
const BAL_FIXES = [
  { old: 'En el escenario industrial español actual, marcado por la transición hacia la Industria 4.0, el balanceo de líneas basado en simples promedios aritméticos es la **causa raíz del OEE (Overall Equipment Effectiveness) estancado por debajo del 70%**. La mayoría de plantas manufactureras tienen líneas de ensamblaje con un potencial de mejora del 20-40% en productividad simplemente aplicando técnicas modernas de balanceo.',
    new: 'En el escenario industrial español actual, marcado por la transición hacia la Industria 4.0, el balanceo de líneas basado en simples promedios aritméticos es una de las causas habituales del OEE (Overall Equipment Effectiveness) estancado. Muchas plantas manufactureras tienen líneas de ensamblaje con potencial de mejora de dos dígitos en productividad aplicando técnicas modernas de balanceo (ejemplo orientativo: 20-40 %).' },
  { old: '### Paso 1: Descomposición MTM\nAplicar MTM-1 o MTM-2 a cada elemento de la operación. Esto da tiempos **objetivos y defendibles** (no dependen del operario que cronometremos).',
    new: '### Paso 1: Tiempos por elemento\nAplicar un sistema de tiempos predeterminados del sector como MTM-1 o MTM-2 a cada elemento de la operación, u observar el trabajo real con cronoanálisis —el enfoque de **Cronometras**: cronómetro, valoración del ritmo y suplementos OIT y TAL—, que llega a tiempos estándar igualmente defendibles valorando el ritmo del operario.' },
  { old: '**Takt = (Tiempo disponible × % de OEE objetivo) / Demanda diaria**', new: '**Takt efectivo = (Tiempo disponible × % de OEE objetivo) / Demanda diaria**' },
  { old: '- La suma de TMU por estación ≤ Takt.', new: '- La suma de los tiempos por estación no supere el Takt (en TMU si se trabaja con MTM).' },
  { old: '- **OEE de 70% a 85%** (sin inversión en maquinaria).\n- **+20% en throughput** (más unidades con la misma línea).\n- **-30% en WIP** (work-in-progress, stock entre estaciones).\n- **Calidad +15%** (estaciones equilibradas = menos errores por prisa).',
    new: '- OEE de hasta el 85 % sin inversión en maquinaria (ejemplo orientativo).\n- Más throughput con la misma línea (ejemplo orientativo: +20 %).\n- Menos WIP (work-in-progress, stock entre estaciones) (ejemplo orientativo: -30 %).\n- Menos errores por prisa al equilibrar las estaciones (ejemplo orientativo).' },
  { old: '## Caso típico\n\nUna planta de ensamblaje de electrodomésticos con 12 estaciones logró:\n\n- Aumentar la producción de 240 a 320 unidades/día (+33%).\n- Reducir el WIP de 85 a 30 unidades (-65%).\n- Aumentar el OEE de 68% a 87% (+19 puntos).\n- ROI del proyecto: 4 meses.',
    new: '## Caso práctico simulado\n\nEjemplo construido con fines didácticos a partir de parámetros plausibles del sector; no corresponde a una implantación real ni a un cliente concreto. Una planta de ensamblaje de electrodomésticos con 12 estaciones logra:\n\n- Aumentar la producción de 240 a 320 unidades/día (+33 %).\n- Reducir el WIP de 85 a 30 unidades (-65 %).\n- Aumentar el OEE de 68 % a 87 % (+19 puntos).\n- ROI del proyecto: 4 meses.' },
  { old: '- **MTM-UAS** (e-motion): software oficial de análisis MTM.', new: '- **MTM-UAS**: sistema de tiempos predeterminados del sector para producción por lotes, con sus herramientas de análisis asociadas.' },
  { old: '> **Nota**: La versión completa de este artículo, con la metodología MTM-balanceo y un caso de estudio completo, está disponible en inglés en el siguiente enlace: [Assembly Line Balancing Techniques: From Static Timing to >85% OEE Efficiency with MTM](/en/assembly-line-balancing-techniques-from-static-timing-to-85-percent-oee-efficiency-with-mtm/).',
    new: 'Si tu línea de ensamblaje necesita un balanceo con tiempos medidos y verificables, en [ProdCont](https://prodcont.com/) te ayudamos a hacerlo.\n\nEste artículo también está disponible en inglés: [Assembly Line Balancing Techniques: From Static Timing to >85% OEE Efficiency with MTM](/en/blog/assembly-line-balancing-techniques-from-static-timing-to-85-percent-oee-efficiency-with-mtm/).' },
];

const ALL = [
  [SMED, SMED_FIXES], [ASH, ASH_FIXES], [TH, TH_FIXES],
  [QUIM, QUIM_FIXES], [TEX, TEX_FIXES], [BAL, BAL_FIXES],
];

(async () => {
  const report = [];
  let applied = 0, failed = 0;
  for (const [id, fixes] of ALL) {
    const ref = db.collection('articulos_cronometras').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING DOC', id); failed++; continue; }
    const doc = snap.data();
    const perField = {};
    for (const fx of fixes) {
      const field = fx.field || 'content';
      const cur = perField[field] !== undefined ? perField[field] : (doc[field] || '');
      const cnt = cur.split(fx.old).length - 1;
      if (cnt !== 1) {
        report.push({ id, field, status: `SKIP count=${cnt}`, old: fx.old.slice(0, 90) });
        failed++;
        continue;
      }
      perField[field] = cur.replace(fx.old, fx.new);
      applied++;
    }
    const updates = { ...perField };
    updates.correctionNote = '2026-10-17: revisión de rigor tanda 11 — crédito Ashcroft (H. Ashcroft, 1950) y fórmula inventada eliminada, 18 therbligs canónicos (codes verificados), artefacto de traducción eliminado, RD 486/1997 corregido, casos simulados con disclaimer, cifras sin fuente marcadas orientativas, enlaces EN /en/blog/ reparados, CTA ProdCont.';
    await ref.update(updates);
    console.log('UPDATED', id, Object.keys(perField).join(','));
  }
  fs.writeFileSync('/tmp/tanda11/apply_report.json', JSON.stringify(report, null, 2));
  console.log('applied=', applied, 'failed=', failed);
  for (const r of report) console.log('FAIL:', r.id, r.field, r.status, '|', r.old);
  process.exit(0);
})();
