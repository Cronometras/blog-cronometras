# CRONOMETRAS.COM
# Manual de Usuario

**Última actualización:** 2 de marzo de 2026

## Índice

- [Introducción](#introducción)
- [Primeros Pasos](#primeros-pasos)
- [Gestión de Estudios](#gestión-de-estudios)
- [Métodos de Trabajo](#métodos-de-trabajo)
- [Herramientas de Cronometraje](#herramientas-de-cronometraje)
  - [Multi-Crono Seguido](#multi-crono-seguido-cronometraje-de-múltiples-estaciones)
- [Suplementos y Tolerancias](#suplementos-y-tolerancias)
- [Reportes y Análisis](#reportes-y-análisis)
- [Biblioteca de Elementos](#biblioteca-de-elementos)
- [Organizaciones y Colaboración](#organizaciones-y-colaboración)
- [Configuración y Preferencias](#configuración-y-preferencias)
- [Gestión de Cuenta y Seguridad (MFA)](#gestión-de-cuenta-y-seguridad-mfa)


---

## Introducción

Cronometras es una aplicación web progresiva de última generación, específicamente diseñada para **ingenieros industriales**, **analistas de tiempos y métodos**, **consultores de productividad** y **profesionales de la manufactura** que requieren realizar estudios de tiempo precisos y estandarizados según las mejores prácticas de la ingeniería industrial.

La aplicación implementa metodologías reconocidas internacionalmente para el estudio de tiempos, incluyendo las técnicas de cronometraje desarrolladas por **Frederick Taylor**, **Frank y Lillian Gilbreth**, y los estándares modernos de la **International Labour Organization (ILO)** y la **American Society of Industrial Engineers (ASIE)**.

### ¿Qué es un Estudio de Tiempos?

Un estudio de tiempos es una técnica de medición del trabajo que consiste en registrar los tiempos y ritmos de trabajo de una tarea específica, realizada en condiciones determinadas, para establecer el tiempo requerido para llevar a cabo dicha tarea según un nivel definido de rendimiento.

Los componentes fundamentales de un estudio de tiempos incluyen:

- **Tiempo Observado**: El tiempo real medido durante la ejecución de cada elemento
- **Calificación de Actividad**: Evaluación del ritmo de trabajo del operario (normalmente entre 80% y 120%)
- **Tiempo Normal**: Tiempo observado ajustado por la calificación de actividad
- **Suplementos**: Tolerancias por fatiga, necesidades personales y demoras inevitables
- **Tiempo Estándar**: Tiempo final que incluye todos los suplementos necesarios

### Características Principales

#### Estudios de Tiempo Completos y Profesionales

Cronometras permite crear estudios de tiempo que cumplen con los estándares internacionales de ingeniería industrial. Cada estudio incluye:

- Información detallada del proceso, operario, máquina y condiciones de trabajo
- Definición completa del método de trabajo con elementos individuales
- Múltiples métodos de cronometraje según el tipo de operación
- Cálculo automático de tiempos normales y estándares
- Análisis estadístico de consistencia y variabilidad
- Documentación completa para auditorías y certificaciones

#### Herramientas de Cronometraje Especializadas

La aplicación ofrece cuatro métodos principales de cronometraje, cada uno optimizado para diferentes tipos de operaciones:

**Cronometraje Repetitivo (Vuelta a Cero)**
- Para elementos que se repiten en cada ciclo de trabajo
- Cronómetro que se reinicia automáticamente en cada elemento
- Ideal para operaciones de ensamble, empaque, y procesos manuales repetitivos
- Permite tomar múltiples observaciones de cada elemento para análisis estadístico

**Cronometraje Continuo (Crono Seguido)**
- Cronómetro que funciona continuamente sin detenerse
Registra tiempos acumulativos que se convierten automáticamente a tiempos elementales
Perfecto para procesos complejos con elementos variables
Permite capturar actividades imprevistas y demoras
Cronometraje Frecuencial
Para elementos que no ocurren en cada ciclo
Configurable para elementos que ocurren cada X ciclos
Calcula automáticamente el tiempo promedio por ciclo
Ideal para inspecciones, mantenimiento preventivo, y actividades de supervisión
Tiempos de Máquina
Especializado para operaciones controladas por máquinas
Diferencia entre tiempo de máquina funcionando y parada
Calcula saturación del operario y tiempos de inactividad
Optimiza la utilización de recursos humanos y de máquina
Biblioteca de Elementos Inteligente
Sistema avanzado de gestión de conocimiento que permite:
Almacenar elementos de trabajo con sus tiempos y suplementos históricos
Reutilizar elementos en múltiples estudios para mantener consistencia
Compartir bibliotecas entre equipos y organizaciones
Importar/exportar bibliotecas en formatos estándar (Excel, CSV)
Búsqueda inteligente por descripción, tipo de operación, y características técnicas
Reportes Profesionales y Análisis Avanzado
Generación automática de reportes que incluyen:
Hojas de operación estándar para producción
Análisis estadístico completo (promedios, desviaciones, rangos)
Gráficos de distribución de tiempos y actividades
Cálculos de productividad y capacidad
Documentación completa para auditorías y certificaciones
Exportación a PDF, Excel, y formatos de impresión profesional
Colaboración Empresarial y Multi-Usuario
Sistema robusto de colaboración que permite:
Organizaciones con múltiples usuarios y roles diferenciados
Compartir estudios con permisos de solo lectura para revisión
Bibliotecas compartidas a nivel organizacional
Control de acceso básico por organización
Sincronización de estudios entre miembros, cuando hay conexión a internet
Aplicación Móvil instalable con Capacidades Offline
Tecnología PWA (Progressive Web App) que proporciona:
Instalación como aplicación nativa en dispositivos móviles y tablets
Funcionamiento completo sin conexión a internet
Sincronización automática cuando se restaura la conectividad
Interfaz optimizada para pantallas táctiles
Gestos intuitivos para cronometraje rápido
Interfaz móvil optimizada para uso en planta

Modo Offline - Trabajo Sin Conexión
Cronometras funciona completamente sin conexión a internet gracias a su tecnología PWA (Progressive Web App) y sistema de almacenamiento local inteligente.

¿Cómo Funciona el Modo Offline?
Tecnología de Almacenamiento Local
Service Workers:
Tecnología que permite que la aplicación funcione sin conexión
Se instala automáticamente al usar la aplicación
Cachea recursos estáticos (HTML, CSS, JavaScript, imágenes)
Intercepta peticiones de red para servir contenido local

IndexedDB:
Base de datos local en el navegador de alto rendimiento
Almacena todos tus estudios y datos de forma eficiente
Capacidad de almacenamiento: Hasta varios GB (depende del navegador)
Sin límites de cuota: A diferencia de localStorage, IndexedDB maneja grandes volúmenes de datos sin errores de "Quota Exceeded"
Persistencia: Los datos permanecen incluso si cierras el navegador
Optimizado para estudios grandes: Maneja cientos de estudios sin degradación de rendimiento

Sincronización Inteligente:
Detecta automáticamente cuando recuperas conexión
Sincroniza cambios locales con el servidor
Resuelve conflictos automáticamente
Notifica si hay problemas de sincronización

Datos Disponibles Sin Conexión
Contenido Accesible Offline
✅ Todos tus Estudios:
Estudios creados previamente (sincronizados)
Todos los elementos y tiempos registrados
Configuraciones de suplementos
Reportes generados previamente

✅ Biblioteca de Elementos:
Elementos personales sincronizados
Elementos de organizaciones (si fueron descargados)
Configuraciones y metadatos completos

✅ Configuración de Usuario:
Preferencias de idioma y unidades
Configuración de carpetas
Ajustes de cronómetro

✅ Funcionalidades Completas:
Crear nuevos estudios
Definir métodos de trabajo
Cronometrar (todos los modos)
Configurar suplementos
Generar reportes PDF y Excel
Exportar datos

❌ No Disponible Offline:
Crear nuevas organizaciones
Invitar miembros a organizaciones
Sincronizar estudios compartidos en tiempo real
Acceder a estudios no descargados previamente
Comprar créditos adicionales

Uso del Modo Offline
Preparación para Trabajo Offline
Antes de Perder Conexión:
Abre la aplicación con conexión a internet
Navega por los estudios que necesitarás offline
El sistema los descargará automáticamente
Verifica el indicador de sincronización (✓ verde)

Gestión de Almacenamiento:
Ve a Configuración → Almacenamiento Offline
Verás el espacio usado y disponible
Puedes marcar estudios específicos para mantener offline
Limpia estudios antiguos si necesitas espacio

Indicadores Visuales:
🟢 Verde: Conectado y sincronizado
🟡 Amarillo: Sincronizando cambios
🔴 Rojo: Sin conexión (modo offline activo)
⚠️ Advertencia: Conflictos de sincronización

Trabajar Sin Conexión
Crear y Editar Estudios:
Crea nuevos estudios normalmente
Todos los cambios se guardan localmente
Se sincronizarán automáticamente al recuperar conexión

Cronometraje Offline:
Todos los modos de cronometraje funcionan offline
Los tiempos se guardan en almacenamiento local
Puedes pausar y reanudar sin problemas

Generar Reportes:
Los reportes PDF y Excel se generan localmente
No requieren conexión a internet
Se guardan en tu dispositivo

Sincronización Automática
Proceso de Sincronización
Detección de Conexión:
La aplicación detecta automáticamente cuando recuperas conexión
Aparece una notificación: "Sincronizando cambios..."
El proceso es automático, no requiere acción del usuario

Orden de Sincronización:
1. Configuración de usuario
2. Nuevos estudios creados
3. Modificaciones a estudios existentes
4. Elementos de biblioteca
5. Reportes y exportaciones

Resolución de Conflictos:
Si el mismo estudio fue modificado en otro dispositivo:
Se mantiene la versión más reciente por timestamp
Se notifica al usuario si hay conflictos
Opción de revisar y resolver manualmente

Verificación de Sincronización:
Indicador verde (✓) cuando todo está sincronizado
Lista de cambios pendientes de sincronizar
Opción de forzar sincronización manual

Gestión de Almacenamiento Local
Optimización del Espacio
Ver Uso de Almacenamiento:
Ve a Configuración → Almacenamiento Offline
Gráfico de uso de espacio
Desglose por tipo de contenido:
Estudios: XX MB
Biblioteca: XX MB
Reportes: XX MB
Caché de aplicación: XX MB

Límites de Almacenamiento:
Chrome/Edge: Hasta 60% del espacio libre en disco
Firefox: Hasta 50% del espacio libre
Safari: Hasta 1GB (puede solicitar más)
Advertencia cuando queda poco espacio

Liberar Espacio:
Eliminar estudios antiguos no necesarios
Limpiar caché de reportes generados
Exportar y eliminar estudios archivados
Opción "Limpiar Almacenamiento" para reset completo

Priorización de Contenido:
Marca estudios importantes como "Mantener Offline"
Estudios no marcados se pueden eliminar automáticamente
Configuración de retención automática (7, 30, 90 días)

Mejores Prácticas para Modo Offline
Recomendaciones de Uso
✅ Antes de Trabajar Offline:
Sincroniza todos tus estudios con conexión
Verifica que los estudios necesarios estén descargados
Genera reportes que puedas necesitar
Verifica el espacio de almacenamiento disponible

✅ Durante el Trabajo Offline:
Guarda cambios frecuentemente (se hace automático)
No cierres la aplicación abruptamente
Verifica el indicador de estado offline
Exporta datos importantes localmente

✅ Al Recuperar Conexión:
Espera a que complete la sincronización
Verifica que no haya conflictos
Revisa el log de sincronización
Haz backup de estudios críticos

⚠️ Precauciones:
No trabajes en el mismo estudio desde múltiples dispositivos offline
Sincroniza regularmente para evitar pérdida de datos
Mantén espacio suficiente en el dispositivo
No desinstales la aplicación sin sincronizar primero

Solución de Problemas Offline
Problemas Comunes
Estudios No Disponibles Offline:
Causa: No fueron descargados con conexión
Solución: Conéctate y abre los estudios necesarios
Prevención: Marca estudios como "Mantener Offline"

Sincronización Fallida:
Causa: Conflictos de versión o problemas de red
Solución: Ve a Configuración → Sincronización
Revisa el log de errores
Intenta sincronización manual
Contacta soporte si persiste

Espacio Insuficiente:
Causa: Almacenamiento local lleno
Solución: Limpia estudios antiguos
Exporta y elimina reportes grandes
Aumenta límite de almacenamiento (si el navegador lo permite)

Datos No Sincronizados:
Causa: Aplicación cerrada antes de sincronizar
Solución: Abre la aplicación con conexión
Espera a que sincronice automáticamente
Verifica en el log de sincronización

Beneficios para la Organización
Estandarización de Procesos
Metodología consistente en toda la organización
Reducción de variabilidad entre analistas
Documentación estandarizada y auditable
Cumplimiento con normas internacionales
Mejora de Productividad
Identificación de oportunidades de mejora
Establecimiento de metas realistas y alcanzables
Generación de datos en crudo para Balanceo de líneas de producción
Optimización de recursos humanos y técnicos
Reducción de Costos
Eliminación de tiempos improductivos
Mejor planificación de capacidad
Reducción de desperdicios y retrabajos
Optimización de inventarios en proceso
Toma de Decisiones Basada en Datos
Información precisa para cotizaciones
Datos para evaluación de proyectos
Comparación objetiva de alternativas
Justificación técnica de inversiones

Primeros Pasos
Registro y Configuración de Cuenta
Proceso de Registro Detallado
Crear Nueva Cuenta
Accede a la aplicación desde cualquier navegador web moderno (Chrome, Firefox, Safari, Edge)
Localiza y haz clic en el botón "Registrarse" en la pantalla principal
Recuperación de Contraseña: Si olvidas tu contraseña, usa el enlace "¿Olvidaste tu contraseña?"
Ingresa tu email registrado
Recibirás un enlace para restablecer tu contraseña
Crea una nueva contraseña siguiendo las instrucciones
Revisión Inicial del Perfil
Información Personal
Navega a la sección "Perfil" usando el menú principal
Información Básica:
Email: email del usuario
Empresa/Organización: Nombre de tu empresa o institución
Fecha de registro: cuando te registraste en la app, determina fecha de fin de licencia y reseteo de límites.
Estado de la suscripción: activa / inactiva
Logo Empresarial:
Haz clic en "Subir Logo" para agregar el logo de tu empresa
Formatos aceptados: PNG, JPG, SVG (máximo 2MB)
El logo aparecerá en todos los reportes generados
Idioma de Interfaz: Selecciona entre Español e Inglés
El cambio se aplica inmediatamente en toda la aplicación
Incluye todos los menús, botones, mensajes y reportes
Formato de Fecha: Automático según el idioma seleccionado
Español: DD/MM/AAAA
Inglés: MM/DD/YYYY
Formato Numérico: Configuración regional para decimales y separadores de miles. Automático
Configuración de Unidades de Tiempo
Unidades Principales: Selecciona tu unidad de tiempo preferida
Minutos: Unidad más común, fácil de entender
Centésimas de Minuto (CMM): Estándar industrial, 1 minuto = 100 CMM
Segundos: Para operaciones muy rápidas o precisas
Horas: Para procesos largos o análisis de capacidad
TMU (Time Measurement Units): Para sistemas de tiempos predeterminados
DMH (Diezmilésimas de Hora): Para cálculos de costos por hora
Conversión Automática: La aplicación convierte automáticamente entre unidades en reportes
Navegación y Estructura de la Aplicación
Menú Principal y Secciones
La aplicación utiliza una navegación intuitiva con las siguientes secciones principales:
🏠 Inicio - Panel de Control de Estudios
Vista General: Muestra todos tus estudios de tiempo en una vista de tarjetas
Estadísticas Rápidas: Número total de estudios por carpeta
Filtros Inteligentes:
Por fecha
Por empresa/cliente: Agrupación automática por empresa
Por carpeta: Organización jerárquica de proyectos
Acciones Rápidas:
Crear nuevo estudio con plantilla
Duplicar estudio existente
Importar estudios desde Excel
Exportación masiva de estudios
📚 Biblioteca - Gestión de Elementos de Trabajo
Elementos Personales: Tu biblioteca privada de elementos de trabajo
Elementos Compartidos: Elementos disponibles de tu organización
Categorización Automática: Los elementos se organizan por:
Tipo de operación (Manual, Máquina, Transporte, Inspección)
Estadísticas de Elementos: Para cada elemento se muestra:
Tiempo promedio 
Herramientas de Gestión:
Búsqueda avanzada con filtros múltiples
Selección masiva de elementos
Importar/exportar bibliotecas completas
👤 Perfil - Configuración Personal y Profesional
Información Personal: Datos básicos
Preferencias de Aplicación: Idioma, unidades, carpeta por defecto
Seguridad de Cuenta: Cambio de contraseña
Facturación y Créditos: Estado de suscripción, historial de uso
Respaldos: Exportación e importación de datos personales
🏢 Organizaciones - Colaboración Empresarial
Mis Organizaciones: Lista de organizaciones donde eres miembro
Gestión de Miembros: Invitar, remover, y gestionar roles (solo administradores)
Estudios Compartidos: Vista de todos los estudios compartidos en la organización
Biblioteca Organizacional: Elementos de trabajo compartidos por el equipo
Navegación Contextual
Breadcrumbs (Migas de Pan)
Siempre visible en la parte superior de la pantalla
Muestra tu ubicación actual en la aplicación
Permite navegación rápida a niveles superiores
Ejemplo: Inicio > Empresa 1 > Montaje> Colocar Tornillos
Menú de Acciones Contextuales
Botones de acción específicos según la pantalla actual
Accesos rápidos a funciones frecuentes
Atajos de teclado para usuarios avanzados
Barra de Estado
Indicador de conexión a internet
Notificaciones de sistema
Características de Usabilidad
Diseño Responsivo
Interfaz optimizada para computadoras de escritorio, tablets y smartphones
Reorganización automática de elementos según el tamaño de pantalla
Gestos táctiles intuitivos en dispositivos móviles
Accesibilidad
Cumple con estándares WCAG 2.1 AA
Navegación completa por teclado
Soporte para lectores de pantalla
Alto contraste y texto escalable
Rendimiento
Carga rápida de páginas con lazy loading
Almacenamiento local para funcionamiento offline
Sincronización inteligente de datos

Gestión de Estudios
Crear un Nuevo Estudio de Tiempos
La creación de un estudio de tiempos en Cronometras sigue una metodología estructurada que garantiza la captura de toda la información necesaria para un análisis profesional y completo.
Paso 1: Información Básica del Estudio
Acceso al Formulario de Creación
Desde la página principal, localiza y haz clic en el botón "Nuevo Estudio" (icono +)
Se abrirá el formulario de creación de estudio con múltiples secciones
Campos Obligatorios (Información Mínima Requerida)
Nombre del Estudio
Propósito: Identificación clara y única del proceso a estudiar
Mejores Prácticas:
Usa nombres descriptivos que incluyan el proceso principal
Ejemplo: "Ensamble Final Motor V6 - Línea A"
Evita abreviaciones ambiguas
Máximo 100 caracteres para compatibilidad con reportes
Validación: El sistema verifica que no exista otro estudio con el mismo nombre
Empresa/Cliente
Propósito: Identificación del cliente o empresa donde se realiza el estudio
Funcionalidad:
Campo con autocompletado basado en estudios anteriores
Permite crear nuevas empresas automáticamente
Se usa para agrupación y filtrado de estudios
Formato: Nombre completo de la empresa (ej: "Automotive Parts Manufacturing S.A.")
Fecha del Estudio
Propósito: Registro temporal para trazabilidad y validez del estudio
Opciones:
Fecha actual (por defecto)
Selección manual usando calendario interactivo
Formato automático según configuración regional
Importancia: Crítico para análisis de tendencias y validez temporal de los datos
Paso 2: Información Complementaria (Opcional pero Recomendada)
Campos de Identificación Adicional
Número de Estudio
Propósito: Código interno de referencia para sistemas de gestión
Formato Sugerido:
Secuencial: EST-001, EST-002, etc.
Por fecha: 2024-001, 2024-002, etc.
Por proyecto: PROJ-A-001, PROJ-B-001, etc.
Uso: Facilita la búsqueda y referencia en documentos externos
Operario Observado
Propósito: Identificación del trabajador cuyo desempeño se está midiendo
Consideraciones Éticas:
Obtener consentimiento del operario antes del estudio
Explicar el propósito del estudio (mejora de procesos, no evaluación personal)
Mantener confidencialidad según políticas de la empresa
Información a Registrar:
Nombre o código del empleado
Experiencia en la operación (nuevo, experimentado, experto)
Turno de trabajo habitual
Sección/Departamento
Propósito: Ubicación organizacional del proceso estudiado
Ejemplos: "Ensamble Final", "Soldadura", "Control de Calidad", "Empaque"
Uso: Permite análisis comparativos entre departamentos
Referencia de Producto/Proceso
Propósito: Código específico del producto o proceso analizado
Formatos Comunes:
Código de parte: P/N 12345-ABC
Código de proceso: PROC-ENS-001
Referencia de ingeniería: DWG-A-001
Beneficio: Vincula el estudio con documentación técnica existente
Máquina/Equipo
Propósito: Identificación del equipo principal utilizado en el proceso
Información Detallada:
Marca y modelo del equipo
Número de serie o identificación interna
Año de fabricación o instalación
Estado de mantenimiento
Ejemplo: "Torno CNC Haas VF-2, S/N 123456, Instalado 2020"
Herramientas y Dispositivos
Propósito: Lista de herramientas necesarias para la operación
Formato: Lista separada por comas o puntos
Ejemplo: "Llave inglesa 12mm, Destornillador Phillips #2, Calibrador Vernier"
Importancia: Esencial para replicar el método en otras ubicaciones
Técnico/Analista
Propósito: Identificación de quien realiza el estudio
Información: Nombre completo y credenciales profesionales
Responsabilidad: Garantiza trazabilidad y responsabilidad técnica del estudio
Paso 3: Configuración Avanzada del Estudio
Parámetros de Calificación de Actividad
Escala de Actividad
Actividad Normal (100%):
Representa el ritmo de trabajo estándar esperado
Corresponde al desempeño de un operario calificado trabajando sin prisa excesiva ni lentitud
Valor por defecto: 100% (modificable según estándares de la empresa)
Actividad Óptima:
Representa el mejor ritmo sostenible sin fatiga excesiva
Valor típico: 133% (basado en estándares internacionales)
Algunos sistemas usan 120% o 125% según la industria
Personalización: Permite ajustar según estándares específicos de la empresa
Configuración de Unidades Personalizadas
Unidades de Producción Especializadas
Metros Cuadrados: Para procesos que involucran superficies
Configuración: Largo × Ancho
Uso: Pintura, laminado, corte de materiales planos
Metros Lineales: Para procesos longitudinales
Configuración: Longitud total
Uso: Soldadura de cordones, corte lineal, ensamble de perfiles
Metros Cúbicos: Para procesos volumétricos
Configuración: Largo × Ancho × Alto
Uso: Llenado de contenedores, mezcla de materiales
Kilogramos: Para procesos basados en peso
Configuración: Peso total por ciclo
Uso: Empaque, dosificación, transporte de materiales
Perímetro: Para procesos perimetrales
Configuración: 2 × (Largo + Ancho)
Uso: Sellado, ribeteado, aplicación de adhesivos
Configuración de Turno y Producción
Parámetros de Turno de Trabajo
Minutos por Turno:
Valor típico: 480 minutos (8 horas)
Ajustable según políticas de la empresa
Incluye tiempo neto de trabajo (descontando descansos)
Contingencia del Estudio:
Porcentaje adicional para imprevistos y variaciones del proceso
Rango típico: 5% a 15%
Se aplica al tiempo estándar final
Configuración de Descansos:
Descansos programados (almuerzo, coffee breaks)
Tiempo para cambio de turno
Reuniones de seguridad o calidad

### Importación Visual desde Excel (NUEVO)

Cronometras incluye un potente importador visual que permite crear estudios directamente desde archivos Excel, ahora con soporte para **importación en lote** y **vista previa interactiva**.

#### Flujo de Importación
1. **Carga de Archivos**:
   - Selecciona **uno o múltiples archivos** Excel (.xlsx) simultáneamente.
   - El sistema los procesará en cola secuencialmente.

2. **Visualización Interactiva**:
   - Verás tus datos en una cuadrícula idéntica a Excel.
   - **Selección de Encabezados**: Haz clic en el número de fila para indicar dónde empiezan los títulos de las columnas.
   - **Metadatos Visuales**: Usa el modo "picking" para seleccionar el nombre del estudio y la fecha haciendo clic directamente en las celdas correspondientes.

3. **Mapeo y Vista Previa**:
   - Asocia tus columnas (Descripción, Tiempo, etc.) con los campos de Cronometras.
   - **Preview en Tiempo Real**: Observa cómo quedarán los datos procesados antes de confirmar.
   - Soporte automático para **frecuencias (1/100)** y tipos de elementos (**MP, MM, TM**).

4. **Procesamiento**:
   - Si importas un lote, verás una barra de progreso y el estado de cada archivo.

Organización y Gestión de Estudios
Sistema de Carpetas Jerárquico
Creación y Configuración de Carpetas
Estructura Organizacional
Por Cliente/Empresa: Carpeta principal por cada cliente
Subcarpetas por proyecto o línea de productos
Ejemplo: "Cliente ABC" → "Proyecto Motor V6" → "Línea Ensamble A"
Por Tipo de Proceso: Agrupación por similitud técnica
Ejemplo: "Soldadura", "Ensamble", "Inspección", "Empaque"
Por Fecha/Período: Organización temporal
Ejemplo: "2024", "Q1-2024", "Enero-2024"
Por Estado: Según progreso del estudio
Ejemplo: "En Desarrollo", "Pendiente Revisión", "Aprobados", "Archivados"
Personalización Visual
Colores de Carpeta: 12 colores predefinidos para identificación rápida
Azul: Proyectos activos
Verde: Estudios completados
Amarillo: Pendientes de revisión
Rojo: Urgentes o problemáticos
Iconos Descriptivos: Biblioteca de 50+ iconos profesionales
Industria automotriz, electrónica, textil, alimentaria
Tipos de proceso: ensamble, soldadura, pintura, empaque
Estados: nuevo, en progreso, completado, archivado
Funcionalidades Avanzadas
Mover a Carpeta: Modal para seleccionar carpeta de destino y mover estudios
Operaciones en Lote: Exportación masiva de estudios por carpeta
Jerarquía de Carpetas: Sistema de carpetas y subcarpetas anidadas
Gestión de Contenido: Opciones para mover o eliminar contenido al eliminar carpetas

### Mover Estudios con Arrastrar y Soltar (Drag & Drop)

Cronometras permite reorganizar estudios entre carpetas de forma rápida e intuitiva mediante **arrastrar y soltar** directamente desde el panel lateral de carpetas.

#### Cómo Usar el Drag & Drop

**Paso 1: Abrir el Panel de Carpetas**
- Haz clic en el botón **"Carpetas"** en la barra de navegación para abrir el panel lateral.
- Expande las carpetas que contienen los estudios que deseas mover haciendo clic en el ícono de flecha (▶) junto a cada carpeta.

**Paso 2: Arrastrar un Estudio**
- Localiza el estudio que deseas mover dentro de una carpeta expandida.
- Al pasar el cursor sobre el estudio, aparecerá un **ícono de agarre** (⋮⋮) a la izquierda.
- Haz clic y mantén presionado sobre el estudio para comenzar a arrastrarlo.
- El estudio se mostrará con **opacidad reducida** mientras lo arrastras, indicando que está en movimiento.

**Paso 3: Soltar en el Destino**
- Arrastra el estudio hacia la carpeta de destino o hacia **"Todos los Estudios"** (raíz).
- Al pasar sobre una carpeta válida, verás un **borde verde punteado** que indica que puedes soltar ahí.
- Suelta el estudio para completar el movimiento.
- El estudio se moverá automáticamente y la lista se actualizará.

#### Feedback Visual

| Estado | Indicador Visual |
|--------|------------------|
| Estudio siendo arrastrado | Opacidad reducida (50%) |
| Carpeta válida para soltar | Borde verde punteado con fondo verde claro |
| Raíz (Todos los Estudios) | Mismo indicador verde al pasar sobre ella |

#### Destinos de Drop Válidos

- **Cualquier carpeta**: Mueve el estudio a esa carpeta.
- **Subcarpetas**: Puedes mover estudios a cualquier nivel de la jerarquía.
- **"Todos los Estudios" (Raíz)**: Mueve el estudio fuera de cualquier carpeta, dejándolo sin organizar.

#### Consejos de Uso

- **Múltiples estudios**: Para mover varios estudios a la vez, considera usar la función de **Selección Múltiple** y luego "Mover a carpeta".
- **Carpetas cerradas**: Puedes soltar un estudio sobre una carpeta aunque esté cerrada (no expandida).
- **Permisos**: Solo puedes mover estudios que sean de tu propiedad.
- **Modo offline**: El movimiento funciona offline y se sincronizará cuando recuperes la conexión.

#### Expansión Independiente de Carpetas

Las carpetas en el panel lateral ahora se expanden de forma **independiente**:
- Al expandir una nueva carpeta, las **demás carpetas permanecen abiertas**.
- Esto facilita mover estudios entre múltiples carpetas sin perder la visibilidad.
- Para contraer una carpeta, simplemente haz clic en el ícono de flecha (▼) junto a ella.

Sistema de Búsqueda y Filtrado Avanzado
Motor de Búsqueda Inteligente
Búsqueda de Texto Completo
Campos Indexados: Nombre, empresa, descripción, elementos, comentarios
Búsqueda Difusa: Encuentra resultados incluso con errores tipográficos
Búsqueda por Frases: Usa comillas para búsquedas exactas
Operadores Booleanos: AND, OR, NOT para búsquedas complejas
Ejemplo: "ensamble motor" AND "línea A" NOT "prototipo"
Filtros Múltiples Combinables
Por Estado del Estudio:
Borrador: Solo información básica capturada
Método Definido: Elementos de trabajo establecidos
Tiempos Tomados: Cronometraje completado
Suplementos Aplicados: Tolerancias configuradas
Completado: Listo para generar reportes
Por Rango de Fechas:
Presets rápidos: Hoy, Ayer, Esta semana, Este mes, Este año
Selector de rango personalizado con calendario
Filtro por fecha de creación vs. fecha de estudio
Por Empresa/Cliente:
Lista desplegable con todas las empresas registradas
Contador de estudios por empresa
Opción de selección múltiple
Por Carpeta y Subcarpetas:
Vista de árbol jerárquico
Opción de incluir subcarpetas automáticamente
Filtro por color o icono de carpeta
Ordenamiento Inteligente
Por Relevancia: Basado en criterios de búsqueda
Por Fecha: Creación, modificación, o fecha de estudio
Por Nombre: Alfabético ascendente o descendente
Por Empresa: Agrupación automática por cliente
Por Estado: Progreso del estudio
Por Uso: Estudios más consultados o modificados recientemente

### Selección Múltiple y Comparación de Estudios

Cronometras incluye un potente sistema de selección múltiple que permite realizar operaciones en lote y comparar estudios entre sí para análisis de productividad.

#### Activar el Modo de Selección Múltiple

1. **Localizar el botón de selección**: En la barra de navegación de carpetas, después del nombre de la carpeta actual, verás un icono de checkbox (☑️).
2. **Activar el modo**: Haz clic en el icono para entrar en modo de selección múltiple. El botón se pondrá púrpura cuando esté activo.
3. **Tooltip informativo**: Al pasar el cursor sobre el icono, verás "Selección múltiple de estudios".

#### Seleccionar Estudios

Una vez activado el modo de selección:

- **Selección individual**: Haz clic en el checkbox que aparece en cada tarjeta de estudio.
- **Selección de todos**: Usa el botón "Seleccionar todos" en la barra de acciones.
  - **Indicador de progreso**: Al seleccionar muchos estudios (50+), verás una barra de progreso animada que muestra el avance de la selección.
  - **Cancelación en cualquier momento**: Puedes cancelar la operación de "Seleccionar todos" haciendo clic en el botón de cancelar (X) junto al indicador de progreso.
  - **Procesamiento optimizado**: La selección masiva se realiza en lotes para mantener la interfaz fluida y evitar congelamiento, incluso con cientos de estudios.
- **Deseleccionar**: Haz clic de nuevo en el checkbox para quitar la selección.

#### Barra de Acciones en Lote

Al seleccionar uno o más estudios, aparece una barra de acciones con las siguientes opciones:

| Acción | Descripción | Requisitos |
|--------|-------------|------------|
| **Mover a carpeta** | Mueve los estudios seleccionados a otra carpeta | 1+ estudios |
| **Exportar JSON** | Exporta los datos en formato JSON | 1+ estudios |
| **Comparar estudios** | Abre el modal de comparación | 2+ estudios |
| **Eliminar** | Elimina los estudios seleccionados | 1+ estudios |

#### Comparación de Estudios

La función de comparación permite analizar las diferencias entre múltiples estudios del mismo proceso.

##### Iniciar una Comparación

1. Activa el modo de selección múltiple.
2. Selecciona **2 o más estudios** que desees comparar.
3. Haz clic en el botón **"Comparar"** en la barra de acciones.

##### Modal de Comparación

El modal de comparación se divide en tres pasos:

**Paso 1: Seleccionar Estudio Base**
- Elige qué estudio será la referencia (base) para las comparaciones.
- El estudio base aparecerá destacado en púrpura.
- Los demás estudios mostrarán sus variaciones porcentuales respecto al base.

**Paso 2: Emparejar Elementos**
- El sistema intenta emparejar automáticamente los elementos por nombre.
- Puedes revisar y ajustar los emparejamientos manualmente.
- Los elementos no emparejados se pueden vincular o ignorar.

**Paso 3: Ver Comparación**
- **Tarjetas de resumen**: Cada estudio muestra su tiempo total de ciclo y la variación porcentual.
  - 🟢 Verde: Mejora (reducción de tiempo respecto al base).
  - 🔴 Rojo: Incremento (aumento de tiempo respecto al base).
- **Tabla detallada**: Muestra cada elemento con sus tiempos por estudio.
- **Indicadores de variación**: Cada celda muestra el delta (±%) respecto al estudio base.

##### Exportar Informes de Comparación

Desde el modal de comparación puedes exportar los resultados:

**Exportar a Excel** (botón con icono de hoja de cálculo):
- Genera un archivo `.xlsx` con **2 hojas**:
  - **Resumen**: Información general, fecha, número de estudios y tabla resumen.
  - **Comparación Detallada**: Todos los elementos con tiempos y variaciones.
- **Formato profesional**:
  - Encabezados con fondo púrpura y texto blanco.
  - Deltas coloreados (verde = mejora, rojo = incremento).
  - Filas alternadas para mejor legibilidad.
  - Fila de totales destacada.

**Exportar a PDF** (botón con icono de documento):
- Genera un documento PDF profesional con:
  - **Cabecera**: Título y fecha de generación.
  - **Tarjetas de estudios**: Resumen visual de cada estudio.
  - **Tabla de comparación**: Elementos con tiempos y variaciones.
  - **Indicadores**: `(-)` para mejoras, `(+)` para incrementos.
  - **Leyenda**: Explicación de los símbolos en el pie de página.

##### Interpretación de Resultados

| Símbolo | Significado | Color |
|---------|-------------|-------|
| `(-)` | Mejora: el tiempo se redujo | Verde |
| `(+)` | Incremento: el tiempo aumentó | Rojo |
| `(=)` | Sin cambio | Gris |

##### Casos de Uso

- **Comparar antes/después de mejoras**: Mide el impacto de cambios en el proceso.
- **Comparar operarios**: Analiza diferencias de rendimiento entre operarios.
- **Comparar turnos**: Identifica variaciones entre turnos de trabajo.
- **Análisis de tendencias**: Compara estudios realizados en diferentes fechas.
- **Benchmarking**: Compara procesos similares en diferentes líneas o plantas.

### Operaciones en Lote por Carpeta

Además de la selección múltiple, puedes realizar operaciones a nivel de carpeta:

- **Exportación Masiva**: Generar reportes de todos los estudios en una carpeta.
- **Incluir Subcarpetas**: Opción para incluir estudios de subcarpetas en exportaciones.
- **Múltiples Formatos**: Exportar en Excel, PDF o CSV.
- **Consolidación**: Combinar estudios de una carpeta en un estudio consolidado.

### Exportación e Importación Masiva

**Formatos de Exportación:**
- Excel Consolidado: Todos los estudios en un archivo con múltiples hojas.
- PDF Combinado: Reportes individuales unidos en un documento.
- CSV de Datos: Para análisis estadístico en herramientas externas.
- Formato Cronometras: Para respaldo completo o migración.

**Opciones de Importación:**
- Desde Excel: Importación de estudios individuales desde archivos Excel.
- Desde CSV: Importación de datos básicos de estudios.
- Desde Respaldos: Restauración completa de estudios exportados.
- Desde Otras Herramientas: Conectores para software de ingeniería industrial.

Gestión de Versiones y Auditoría
Control de Cambios
Historial de Modificaciones
Registro Automático: Cada cambio se registra con timestamp y usuario
Comparación de Versiones: Vista lado a lado de cambios realizados
Restauración Selectiva: Volver a versiones anteriores de elementos específicos
Comentarios de Cambio: Documentar el motivo de modificaciones importantes
Colaboración y Revisiones
Comentarios por Elemento: Sistema de anotaciones para revisión
Aprobaciones: Flujo de trabajo para validación de estudios
Notificaciones: Alertas automáticas de cambios en estudios compartidos
Bloqueo de Edición: Prevenir modificaciones simultáneas conflictivas

Métodos de Trabajo
Definición y Estructuración de Elementos de Trabajo
La definición del método de trabajo es el corazón de cualquier estudio de tiempos profesional. Esta sección permite descomponer un proceso complejo en elementos individuales medibles, siguiendo las mejores prácticas de la ingeniería industrial.
Principios Fundamentales del Análisis de Métodos
Descomposición del Proceso
Elemento de Trabajo: La unidad más pequeña de trabajo que puede ser medida de manera práctica y consistente
Criterios de División:
Cada elemento debe tener un punto de inicio y fin claramente definidos
Debe ser lo suficientemente largo para ser cronometrado con precisión (mínimo 0.04 minutos)
Debe ser repetible y observable
Debe representar una actividad homogénea (mismo tipo de movimiento o acción)
Clasificación de Elementos
Elementos Manuales: Controlados completamente por el operario
Elementos de Máquina: Controlados por el equipo, el operario puede estar libre
Elementos Combinados: Trabajo manual durante tiempo de máquina
Proceso Detallado de Definición de Elementos
Paso 1: Acceso a la Sección de Método
Navegación al Método
Desde tu estudio abierto, localiza y haz clic en la pestaña "Método"
Se mostrará una vista limpia para construir el método de trabajo
La interfaz incluye herramientas de edición y visualización del flujo de proceso
Paso 2: Creación de Nuevos Elementos
Agregar Elemento Individual
Botón "Agregar Elemento": Localizado en la parte superior de la sección
Formulario de Elemento: Se abre un modal con los siguientes campos:

 Información Básica del Elemento
Descripción del Elemento:


Formato Recomendado: Verbo + Objeto + Especificación
Ejemplos Correctos:
"Tomar tornillo M6x20 de contenedor"
"Posicionar pieza en fixture usando guías"
"Apretar tornillos con llave dinamométrica a 25 Nm"
Evitar Descripciones Vagas:
❌ "Trabajar con tornillos"
✅ "Insertar 4 tornillos M6x20 en orificios roscados"
Límite de Caracteres: 200 caracteres para compatibilidad con reportes
Clasificación por Tipo de Elemento
Tipos de Elementos Disponibles

 A) Elementos Repetitivos
Definición: Elementos que ocurren exactamente una vez en cada ciclo de trabajo
Características:


Frecuencia fija: 1 vez por ciclo
Tiempo relativamente constante
Fácil de cronometrar y analizar estadísticamente
Ejemplos Típicos:


Tomar pieza del contenedor
Posicionar en fixture
Activar máquina
Retirar pieza terminada
Configuración: No requiere parámetros adicionales de frecuencia

 B) Elementos Frecuenciales
Definición: Elementos que no ocurren en cada ciclo, sino cada cierto número de ciclos
Parámetros de Configuración:


Frecuencia de Ocurrencia: Cada cuántos ciclos ocurre el elemento
Ejemplo: Cada 10 ciclos, cada 25 ciclos, cada 100 ciclos
Repeticiones por Ocurrencia: Cuántas veces se ejecuta cuando ocurre
Ejemplo: Cambiar herramienta (1 vez cada 50 piezas)
Ejemplo: Inspeccionar calidad (3 mediciones cada 20 piezas)
Ejemplos Típicos:


Inspección de calidad (cada 20 piezas)
Reabastecimiento de material (cada 50 ciclos)
Cambio de herramienta (cada 100 piezas)
Limpieza de área de trabajo (cada turno)
Cálculo Automático: El sistema calcula el tiempo promedio por ciclo

 C) Elementos de Máquina
Definición: Elementos controlados por máquinas o equipos automatizados
Subcategorías:


Máquina Funcionando: El operario está libre durante este tiempo
Máquina Parada: El operario debe trabajar (carga, descarga, ajustes)
Tiempo de Máquina Total: Tiempo completo del ciclo de máquina
Características Especiales:


Tiempo más consistente que elementos manuales
Permite cálculo de saturación del operario
Considera tiempos de inactividad y multitarea
Ejemplos por Subcategoría:


Máquina Funcionando: Torneado automático, soldadura robótica
Máquina Parada: Cargar pieza en torno, cambiar programa CNC
Tiempo Total: Ciclo completo de prensa hidráulica
Configuración Avanzada de Frecuencias
Elementos Repetitivos - Configuración Estándar
Frecuencia Fija: 1 ocurrencia por ciclo
Variabilidad: Solo por diferencias en la ejecución del operario
Análisis Estadístico: Cálculo automático de promedios, desviaciones, y rangos
Validación: Detección automática de tiempos atípicos (outliers)
Elementos Frecuenciales - Configuración Detallada
Parámetro 1: Ciclos entre Ocurrencias
Rango: 2 a 1000 ciclos
Ejemplos comunes: 5, 10, 20, 25, 50, 100 ciclos
Validación: Debe ser mayor a 1 para ser considerado frecuencial
Parámetro 2: Repeticiones por Ocurrencia
Rango: 1 a 50 repeticiones
Ejemplo: Inspeccionar 3 dimensiones cada 20 piezas = 3 repeticiones
Cálculo de Tiempo por Ciclo: (Tiempo del elemento × Repeticiones) ÷ Frecuencia
Ejemplo de Cálculo:
Elemento: "Inspeccionar dimensiones críticas"
Tiempo observado: 2.5 minutos
Repeticiones: 3 mediciones
Frecuencia: Cada 20 ciclos
Tiempo por ciclo: (2.5 × 3) ÷ 20 = 0.375 minutos por ciclo
Sistema de Símbolos de Diagrama de Flujo
Simbología Estándar ASME (American Society of Mechanical Engineers)
Símbolos Principales y su Aplicación

 ○ Operación (Círculo)
Definición: Actividad que modifica, transforma o agrega valor al producto
Ejemplos:


Cortar material
Soldar componentes
Ensamblar partes
Pintar superficie
Procesar en máquina
Color en Cronometras: Azul (#2563EB)

 → Transporte (Flecha)
Definición: Movimiento de material, herramientas o personas
Criterio: Distancia mayor a 1 metro o cambio de ubicación significativo
Ejemplos:


Llevar pieza a siguiente estación
Transportar herramientas
Mover material con montacargas
Caminar a área de suministros
Color en Cronometras: Verde (#16A34A)

 □ Inspección (Cuadrado)
Definición: Verificación de calidad, cantidad, o características
No modifica el producto: Solo verifica conformidad
Ejemplos:


Medir dimensiones con calibrador
Verificar acabado superficial
Contar piezas producidas
Revisar funcionamiento de equipo
Color en Cronometras: Amarillo (#CA8A04)

 ▽ Demora (Triángulo Invertido)
Definición: Espera no planificada o retraso en el proceso
Causas Típicas:


Esperar que llegue material
Esperar disponibilidad de máquina
Esperar instrucciones o aprobaciones
Colas en estaciones de trabajo
Color en Cronometras: Naranja (#EA580C)

 ▽ Almacenamiento (Triángulo con Base)
Definición: Almacenamiento temporal o permanente
Diferencia con Demora: Es planificado y controlado
Ejemplos:


Colocar en inventario en proceso
Almacenar en área de cuarentena
Depositar en contenedor de producto terminado
Color en Cronometras: Púrpura (#7C3AED)
Símbolos Combinados
Operación-Inspección (○□): Verificación durante la operación
Operación-Transporte (○→): Procesamiento durante movimiento
Gestión Avanzada de la Biblioteca de Elementos
Sistema de Biblioteca Inteligente
La biblioteca de elementos es una base de conocimiento que permite reutilizar elementos de trabajo previamente estudiados, garantizando consistencia y ahorrando tiempo en futuros estudios.
Agregar Elementos desde la Biblioteca
Proceso de Búsqueda y Selección
Acceso a la Biblioteca
Botón "Agregar desde Biblioteca": Ubicado junto al botón "Agregar Elemento"
Interfaz de Búsqueda: Se abre un modal con herramientas de búsqueda avanzada
Herramientas de Búsqueda
Búsqueda por Texto:
Campo de búsqueda con autocompletado
Busca en descripción, tipo, y metadatos del elemento
Búsqueda difusa que tolera errores tipográficos
Filtros Avanzados:
Por Tipo: Repetitivo, Frecuencial, Máquina
Por Símbolo: Operación, Transporte, Inspección, etc.
Por Industria: Automotriz, Electrónica, Textil, etc.
Por Tiempo Promedio: Rangos de duración
Por Frecuencia de Uso: Más utilizados, recientes, favoritos
Ordenamiento:
Por relevancia de búsqueda
Por tiempo promedio (ascendente/descendente)
Por frecuencia de uso
Por fecha de última actualización
Información Detallada de Elementos
Vista Previa: Muestra información completa antes de agregar
Estadísticas Históricas:
Tiempo promedio basado en múltiples estudios
Desviación estándar (indicador de consistencia)
Número de veces utilizado
Calificación promedio de actividad
Suplementos Predefinidos:
Configuración de tolerancias típicas para ese tipo de elemento
Factores de fatiga comunes
Suplementos por necesidades personales
Metadatos Adicionales:
Industria de origen
Tipo de operación
Herramientas requeridas
Nivel de habilidad necesario
Selección y Personalización
Selección Múltiple: Agregar varios elementos simultáneamente
Personalización Durante Importación:
Modificar descripción para el contexto específico
Ajustar frecuencias si es elemento frecuencial
Cambiar símbolo de diagrama de flujo si es necesario
Copia Inteligente:
Los tiempos históricos se copian como referencia
Los suplementos se aplican automáticamente
Se mantiene trazabilidad del elemento original
Guardar Elementos en la Biblioteca
Proceso de Contribución a la Biblioteca
Criterios para Guardar Elementos
Elementos Completamente Estudiados: Deben tener al menos 5 observaciones de tiempo
Suplementos Configurados: Tolerancias aplicadas y validadas
Descripción Clara: Suficientemente detallada para reutilización
Método Estabilizado: Proceso definido y optimizado
Proceso de Guardado
Selección de Elemento: Desde cualquier elemento con tiempos registrados
Botón "Guardar en Biblioteca": Disponible en el menú contextual del elemento
Formulario de Metadatos:
Categoría: Clasificación por tipo de industria o proceso
Etiquetas: Palabras clave para búsqueda futura
Nivel de Habilidad: Novato, Intermedio, Experto
Herramientas Requeridas: Lista de herramientas necesarias
Condiciones Especiales: Requisitos ambientales o de seguridad
Configuración de Compartir:
Personal: Solo visible para ti
Organización: Visible para todos los miembros de tu organización
Público: Contribución a la biblioteca global (si está habilitado)
Guardado en Biblioteca
Validación Básica: El sistema verifica que el elemento tenga tiempos registrados
Configuración de Visibilidad: Elementos personales vs. compartidos con organización
Preservación de Datos: Se mantienen tiempos, suplementos y configuraciones del elemento
Gestión Avanzada de la Biblioteca Personal
Organización y Mantenimiento
Categorización Automática
Por Tipo de Proceso: Agrupación automática por símbolos de flujo
Por Duración: Elementos cortos (<0.5 min), medios (0.5-2 min), largos (>2 min)
Por Variabilidad: Consistentes (baja desviación) vs. Variables (alta desviación)
Por Uso: Frecuentemente utilizados vs. Especializados
Organización de Elementos
Filtrado por Tipo: Elementos repetitivos, frecuenciales y de máquina
Búsqueda por Texto: Búsqueda en nombres y descripciones de elementos
Agrupación por Estudio: Los elementos se muestran organizados por estudio de origen
Información Contextual: Cada elemento muestra el estudio del que proviene
Gestión de la Biblioteca
Elementos Personales: Biblioteca privada de cada usuario
Elementos Compartidos: Elementos visibles a nivel organizacional
Reutilización: Los elementos pueden agregarse a nuevos estudios con sus configuraciones
Preservación de Configuraciones: Tiempos, actividades y suplementos se mantienen al reutilizar

Herramientas de Cronometraje
Cronometras ofrece cuatro métodos especializados de cronometraje, cada uno diseñado para tipos específicos de operaciones y situaciones de estudio. La selección del método correcto es crucial para obtener datos precisos y representativos del proceso real.
Cronometraje Repetitivo (Método Vuelta a Cero)
El cronometraje repetitivo es el método más tradicional y ampliamente utilizado en estudios de tiempo, especialmente efectivo para operaciones manuales con elementos que se repiten consistentemente en cada ciclo de trabajo.
Principios del Cronometraje Repetitivo
Metodología Vuelta a Cero
Concepto: El cronómetro se reinicia (vuelve a cero) al final de cada elemento
Ventajas:
Lectura directa del tiempo de cada elemento
Fácil identificación de variaciones por elemento
Menor posibilidad de errores de cálculo
Ideal para análisis estadístico detallado
Aplicaciones Ideales:
Operaciones de ensamble manual
Procesos de empaque y embalaje
Operaciones de máquina con ciclos cortos
Trabajos repetitivos con elementos bien definidos
Configuración Detallada del Cronometraje Repetitivo
Paso 1: Preparación del Estudio
Selección de Elementos
Acceso: Navega a la sección "Cronómetro" desde tu estudio
Vista de Elementos: Se muestran todos los elementos marcados como "Repetitivos"
Verificación Previa: Confirma que todos los elementos están correctamente definidos
Orden de Cronometraje: Los elementos aparecen en el orden definido en el método
Configuración de Parámetros
Número de Observaciones:
Mínimo Recomendado: 10 observaciones por elemento
Estándar Industrial: 15-20 observaciones
Para Alta Precisión: 25-30 observaciones
Cálculo Automático: El sistema sugiere el número óptimo basado en variabilidad inicial
Sensibilidad del Cronómetro:
Alta Sensibilidad: Para elementos muy cortos (<0.1 minutos)
Sensibilidad Normal: Para elementos típicos (0.1-2 minutos)
Baja Sensibilidad: Para elementos largos (>2 minutos)
Configuración de Alertas:
Alerta de tiempo excesivo (outliers)
Notificación de número de observaciones completadas
Recordatorio de calificación de actividad
Paso 2: Proceso de Cronometraje
Inicio del Cronometraje
Preparación del Operario:
Explicar el propósito del estudio (mejora de procesos, no evaluación personal)
Solicitar que trabaje a ritmo normal y cómodo
Permitir un período de adaptación (2-3 ciclos sin cronometrar)
Posicionamiento del Analista:
Ubicarse donde se pueda observar claramente todo el proceso
Mantener distancia que no interfiera con el trabajo
Tener visibilidad de puntos de inicio y fin de cada elemento
Operación del Cronómetro Digital
Botón "Iniciar Estudio": Comienza el cronometraje del primer elemento
Interfaz Durante Cronometraje:
Cronómetro Principal: Muestra tiempo transcurrido en tiempo real
Elemento Actual: Descripción del elemento siendo cronometrado
Progreso: Número de observación actual vs. total planificado
Botones de Control: Grandes y accesibles para uso rápido
Controles de Cronometraje
Botón "Siguiente Elemento":
Registra el tiempo del elemento actual
Reinicia automáticamente el cronómetro para el siguiente elemento
Solicita calificación de actividad
Permite agregar comentarios opcionales
Calificación de Actividad:
Escala: Típicamente 80% a 120%
100% = Ritmo Normal: Operario calificado trabajando sin prisa ni lentitud
Criterios de Calificación:
80-85%: Ritmo lento, movimientos vacilantes
90-95%: Ritmo ligeramente por debajo del normal
100%: Ritmo normal estándar
105-110%: Ritmo ligeramente superior al normal
115-120%: Ritmo rápido pero sostenible
Campo de Comentarios:
Registrar condiciones anormales
Documentar interrupciones o variaciones
Notar cambios en el método o herramientas
Paso 3: Controles Avanzados
Funciones de Control Durante el Estudio
Pausa Temporal:


Uso: Interrupciones planificadas (descansos, reuniones)
Funcionamiento: Detiene el cronómetro sin perder datos
Reanudación: Continúa desde donde se pausó
Registro: Se documenta automáticamente la duración de la pausa
Reiniciar Elemento:


Uso: Cuando ocurre una interrupción significativa durante un elemento
Funcionamiento: Descarta la observación actual y reinicia el elemento
Documentación: Se registra el motivo del reinicio
Eliminar Última Observación:


Uso: Corrección de errores de cronometraje
Funcionamiento: Borra la última observación registrada
Confirmación: Requiere confirmación para prevenir eliminaciones accidentales
Límite: Solo se puede eliminar la observación más reciente
Análisis en Tiempo Real
Estadísticas Dinámicas:
Tiempo promedio actualizado con cada observación
Desviación estándar en tiempo real
Identificación automática de valores atípicos (outliers)
Gráfico de tendencia de tiempos
Alertas Inteligentes:
Notificación cuando se detecta un tiempo excesivamente alto o bajo
Sugerencia de número óptimo de observaciones basado en variabilidad
Alerta de consistencia cuando la desviación es muy alta
Cronometraje Continuo (Crono Seguido)
El cronometraje continuo es una técnica avanzada donde el cronómetro funciona ininterrumpidamente, registrando tiempos acumulativos que posteriormente se convierten en tiempos elementales. Es especialmente útil para procesos complejos o variables.
Principios del Cronometraje Continuo
Metodología de Tiempo Acumulativo
Concepto: El cronómetro nunca se detiene, solo se registran lecturas en puntos específicos
Ventajas:
Captura todas las actividades, incluyendo demoras imprevistas
No se pierde tiempo por errores de cronometraje
Ideal para procesos con alta variabilidad
Permite análisis detallado de interrupciones y demoras
Cálculo de Tiempos Elementales: Tiempo del elemento = Lectura actual - Lectura anterior
Configuración y Operación del Crono Seguido
Preparación del Sistema
Acceso a la Herramienta
Navegación: Sección "Crono Seguido" desde el menú del estudio
Interfaz Especializada: Diseñada para captura rápida y continua
Configuración Inicial:
Selección de unidades de tiempo (centésimas de minuto recomendado)
Configuración de alertas de tiempo
Ajuste de sensibilidad de botones para uso rápido
Inicio de Sesión de Cronometraje
Botón "Iniciar Cronometraje Continuo": Activa el cronómetro principal
Cronómetro Principal: Muestra tiempo acumulativo en tiempo real
Estado Visual: Indicador claro de que el cronometraje está activo
Preparación del Operario: Mismo protocolo que cronometraje repetitivo
Proceso de Registro Continuo
Registro de Actividades
Momento de Registro: Al finalizar cada actividad o elemento
Botón "Registrar Actividad": Captura el tiempo acumulativo actual
Formulario Rápido de Registro:
Descripción de Actividad: Campo de texto con autocompletado
Calificación de Actividad: Selector rápido (80-120%)
Símbolo de Flujo: Selección visual de símbolos estándar
Comentarios: Campo opcional para observaciones especiales
Características Avanzadas del Registro
Autocompletado Inteligente:
Sugiere descripciones basadas en elementos del método definido
Aprende de registros anteriores para sugerencias personalizadas
Detecta patrones comunes y los sugiere automáticamente
Registro por Voz (si está habilitado):
Activación por comando de voz
Transcripción automática de descripciones
Confirmación visual antes de guardar
Atajos de Teclado:
Tecla Espacio: Registrar actividad
Teclas numéricas: Calificación rápida de actividad
Tab: Navegar entre campos del formulario
Gestión y Análisis de Registros
Vista de Registros en Tiempo Real
Lista Cronológica: Todos los registros ordenados por tiempo
Información por Registro:
Tiempo acumulativo de registro
Tiempo elemental calculado automáticamente
Descripción de la actividad
Calificación de actividad
Símbolo de diagrama de flujo
Edición en Línea: Modificación rápida de cualquier campo
Herramientas de Gestión Post-Cronometraje
Edición de Registros:


Modificar Descripciones: Clarificar o corregir descripciones
Ajustar Calificaciones: Revisar y ajustar calificaciones de actividad
Cambiar Símbolos: Reclasificar actividades según análisis posterior
Agregar Comentarios: Documentar observaciones adicionales
Agrupación Inteligente:


Detección de Similitudes: Algoritmo que identifica actividades similares
Sugerencias de Agrupación: Propone consolidar registros similares
Creación de Elementos: Convierte grupos de registros en elementos del método
Integración con Método de Trabajo:


Agregar al Método: Convierte registros en elementos formales del método
Actualizar Elementos Existentes: Mejora elementos con nuevos datos
Análisis de Consistencia: Compara con elementos previamente definidos
Cronometraje Frecuencial
El cronometraje frecuencial está diseñado específicamente para elementos que no ocurren en cada ciclo de trabajo, sino que aparecen esporádicamente según una frecuencia determinada.
Principios del Cronometraje Frecuencial
Metodología de Muestreo Estadístico
Concepto: Se cronometra solo cuando el elemento frecuencial ocurre
Cálculo de Impacto: El tiempo se distribuye proporcionalmente entre todos los ciclos
Aplicaciones Típicas:
Inspecciones de calidad (cada 20 piezas)
Reabastecimiento de material (cada 50 ciclos)
Mantenimiento preventivo (cada 100 piezas)
Cambios de herramienta (cada 200 piezas)
Configuración del Cronometraje Frecuencial
Parámetros de Configuración
Definición de Frecuencia
Ciclos entre Ocurrencias: Cada cuántos ciclos normales ocurre el elemento
Ejemplo: Inspección cada 25 piezas = Frecuencia 25
Repeticiones por Ocurrencia: Cuántas veces se ejecuta cuando ocurre
Ejemplo: 3 mediciones por inspección = 3 repeticiones
Validación: El sistema verifica que la configuración sea lógica y consistente
Planificación del Estudio
Número de Ciclos a Observar: Debe ser múltiplo de la frecuencia para capturar ocurrencias completas
Número de Ocurrencias Esperadas: Cálculo automático basado en ciclos totales y frecuencia
Cronograma de Observación: El sistema indica cuándo esperar cada ocurrencia
Proceso de Cronometraje Frecuencial
Operación del Cronómetro
Modo de Espera: El cronómetro permanece inactivo hasta que ocurre el elemento
Detección de Ocurrencia: El analista identifica cuándo ocurre el elemento frecuencial
Cronometraje Activo: Se activa solo durante la ejecución del elemento
Registro de Contexto: Se documenta en qué ciclo ocurrió la actividad
Análisis Estadístico Automático
Tiempo Promedio por Ocurrencia: Cálculo basado en todas las observaciones
Tiempo Promedio por Ciclo: (Tiempo promedio × Repeticiones) ÷ Frecuencia
Variabilidad: Análisis de consistencia entre ocurrencias
Proyección de Impacto: Efecto en el tiempo total del ciclo de trabajo

Cronometraje Continuo (Crono Seguido)
El cronometraje continuo es una técnica avanzada donde el cronómetro nunca se detiene, permitiendo capturar el flujo completo de trabajo sin interrupciones y registrar tiempos acumulativos que luego se convierten en tiempos elementales.

Principios del Cronometraje Continuo
Metodología de Registro Continuo
Concepto Fundamental:
El cronómetro inicia al comenzar el ciclo y continúa corriendo sin detenerse
Cada actividad se registra en el momento exacto en que termina
El tiempo elemental se calcula restando el tiempo anterior del tiempo actual
Permite capturar todo el tiempo del ciclo sin pérdidas

Ventajas del Método Continuo:
✅ No se pierde ningún tiempo del ciclo
✅ Captura tiempos de transición entre elementos
✅ Detecta automáticamente demoras y tiempos muertos
✅ Más preciso para ciclos rápidos
✅ Facilita la identificación de desperdicios
✅ Registro cronológico completo del proceso

Cuándo Usar Cronometraje Continuo:
Ciclos de trabajo muy rápidos (< 30 segundos)
Procesos con muchas transiciones breves
Cuando se necesita capturar TODO el tiempo del ciclo
Estudios de mejora continua (identificar desperdicios)
Análisis detallado de flujo de trabajo
Validación de métodos de trabajo

Configuración del Cronometraje Continuo
Activación del Modo Continuo
Acceso a Configuración:
En la pantalla de cronometraje, localiza el selector de modo
Opciones disponibles:
Modo Estándar (cronómetro se detiene entre elementos)
Modo Continuo (cronómetro nunca se detiene)
Modo Paralelo (múltiples cronómetros simultáneos)

Seleccionar Modo Continuo:
Haz clic en "Modo Continuo" o "Crono Seguido"
El cronómetro cambiará a modo acumulativo
Indicador visual: "CONTINUO" en la interfaz
Color distintivo: Azul para indicar modo activo

Configuración Adicional:
Auto-registro al cambiar de elemento
Alertas de tiempo entre elementos
Visualización de tiempos elementales en tiempo real
Exportación de tiempos acumulativos y elementales

Operación del Cronometraje Continuo
Proceso de Registro Paso a Paso
Paso 1: Iniciar el Cronómetro Continuo:
Presiona "Iniciar" al comenzar el primer elemento del ciclo
El cronómetro comienza a contar desde 00:00.00
No se detendrá hasta finalizar el ciclo completo
Indicador visual muestra tiempo acumulativo

Paso 2: Registrar Finalización de Elementos:
Cuando termina el primer elemento, presiona "Registrar"
El sistema captura el tiempo acumulativo (ej: 00:15.30)
El cronómetro continúa corriendo sin detenerse
Se muestra el tiempo elemental calculado automáticamente

Paso 3: Continuar con Siguientes Elementos:
Al terminar el segundo elemento, presiona "Registrar" nuevamente
Tiempo acumulativo capturado (ej: 00:28.50)
Tiempo elemental = 00:28.50 - 00:15.30 = 00:13.20
El proceso continúa para todos los elementos del ciclo

Paso 4: Finalizar el Ciclo:
Al completar el último elemento, presiona "Finalizar Ciclo"
Se captura el tiempo total del ciclo
El sistema valida que todos los elementos fueron registrados
Opción de iniciar inmediatamente el siguiente ciclo

Interfaz de Registro Continuo
Visualización en Tiempo Real:
Cronómetro Principal: Muestra tiempo acumulativo (grande, destacado)
Último Tiempo Registrado: Tiempo del elemento anterior
Tiempo Elemental Actual: Calculado automáticamente
Elemento Actual: Descripción del elemento en curso
Progreso del Ciclo: Barra visual de elementos completados

Información por Elemento Registrado:
Número de Elemento: Posición en el ciclo
Descripción: Nombre del elemento
Tiempo Acumulativo: Tiempo total hasta ese punto
Tiempo Elemental: Duración específica del elemento
Calificación de Actividad: Evaluación del ritmo
Símbolo de Flujo: Clasificación de la actividad

Cálculo Automático de Tiempos Elementales
Sistema de Cálculo Inteligente
Fórmula Básica:
Tiempo Elemental = Tiempo Acumulativo Actual - Tiempo Acumulativo Anterior
Ejemplo:
Elemento 1: Tiempo acumulativo = 15.30 seg → Tiempo elemental = 15.30 seg
Elemento 2: Tiempo acumulativo = 28.50 seg → Tiempo elemental = 13.20 seg
Elemento 3: Tiempo acumulativo = 45.80 seg → Tiempo elemental = 17.30 seg

Validación Automática:
Detección de tiempos negativos (error de registro)
Identificación de tiempos atípicos (outliers)
Alertas de elementos muy rápidos o muy lentos
Sugerencias de corrección de errores

Análisis de Tiempos Muertos:
Suma de tiempos elementales vs tiempo total del ciclo
Identificación automática de tiempos no registrados
Clasificación de desperdicios y demoras
Recomendaciones de mejora del método

Ventajas y Aplicaciones del Cronometraje Continuo
Beneficios Técnicos
Precisión Mejorada:
Captura el 100% del tiempo del ciclo
No hay pérdidas por reacción del analista
Identifica tiempos de transición ocultos
Detecta automáticamente demoras no planificadas

Análisis Más Completo:
Visión completa del flujo de trabajo
Identificación de desperdicios (Lean Manufacturing)
Análisis de valor agregado vs no agregado
Base para mejora continua

Facilidad de Uso:
Menos interrupciones durante el cronometraje
Ritmo más natural de registro
Menor fatiga del analista
Ideal para ciclos muy rápidos

Aplicaciones Específicas
Manufactura Esbelta (Lean):
Identificación de los 7 desperdicios
Análisis de valor agregado
Mapeo de flujo de valor (VSM)
Estudios de tiempo y movimiento

Mejora Continua:
Línea base para proyectos Kaizen
Medición de impacto de mejoras
Comparación antes/después de cambios
Validación de nuevos métodos

Balanceo de Líneas:
Datos precisos para balanceo
Identificación de cuellos de botella
Optimización de estaciones de trabajo
Cálculo de eficiencia de línea

### Multi-Crono Seguido (Cronometraje de Múltiples Estaciones)

El **Multi-Crono Seguido** es una herramienta especializada que permite cronometrar simultáneamente múltiples estaciones de trabajo o puestos operativos, ideal para estudios de líneas de producción, celdas de manufactura y análisis de balanceo.

#### Concepto y Aplicaciones

**¿Qué es el Multi-Crono Seguido?**
- Interfaz que presenta múltiples cronómetros continuos lado a lado
- Cada cronómetro representa una estación de trabajo independiente
- Permite visualizar y comparar tiempos entre estaciones en tiempo real
- Facilita el análisis de balanceo de líneas de producción

**Casos de Uso Típicos:**
- 🏭 **Líneas de producción**: Cronometrar cada estación de una línea de ensamble
- 🔧 **Celdas de manufactura**: Analizar el flujo de trabajo entre puestos
- 📊 **Estudios de balanceo**: Identificar cuellos de botella y tiempos muertos
- 👥 **Análisis multi-operario**: Comparar rendimiento de diferentes operarios

#### Configuración del Multi-Crono

**Acceso al Módulo:**
1. Desde el menú principal, selecciona **"Crono Seguido"**
2. Activa el modo **"Multi-Crono"** desde la barra de navegación
3. Se mostrará la interfaz de múltiples estaciones

**Gestión de Estaciones de Trabajo:**

| Acción | Descripción |
|--------|-------------|
| **Agregar estación** (+) | Crea una nueva estación de trabajo con nombre personalizable |
| **Editar nombre** (✏️) | Modifica el nombre de una estación existente |
| **Eliminar estación** (🗑️) | Elimina una estación (con confirmación) |
| **Mover estación** (◀ ▶) | Reordena las estaciones arrastrando o con flechas |

**Nombrar Estaciones:**
- Haz clic en el botón **"+"** para añadir una nueva estación
- Ingresa un nombre descriptivo (ej: "Estación 1 - Ensamble", "Puesto A")
- Presiona **Enter** o el botón de confirmar (✓) para guardar
- Presiona **Escape** o el botón cancelar (X) para descartar

#### Operación del Multi-Crono

**Navegación entre Estaciones:**
- Usa las **flechas de navegación** (◀ ▶) para desplazarte entre estaciones
- En dispositivos táctiles, desliza horizontalmente para cambiar de estación
- La estación activa se muestra destacada con borde de color

**Cronometraje Independiente:**
- Cada estación tiene su propio cronómetro continuo
- Los registros de cada estación se guardan de forma independiente
- Puedes iniciar, pausar y registrar tiempos en cualquier estación sin afectar las demás

**Sincronización y Guardado:**
- Los datos se guardan automáticamente en tiempo real
- Los cambios se sincronizan con el estudio principal
- El sistema mantiene la integridad de los datos incluso offline

#### Flujo de Trabajo Típico

1. **Preparación:**
   - Crea las estaciones necesarias según tu línea de producción
   - Asigna nombres descriptivos a cada estación
   - Ordena las estaciones según el flujo del proceso

2. **Durante el Cronometraje:**
   - Navega a la estación correspondiente cuando el operario inicie una actividad
   - Registra los tiempos de cada elemento
   - El sistema mantiene todos los cronómetros funcionando

3. **Análisis Post-Estudio:**
   - Revisa los tiempos registrados en cada estación
   - Compara tiempos entre estaciones para identificar desbalances
   - Exporta los datos para análisis detallado

#### Consejos de Uso

✅ **Recomendaciones:**
- Nombra las estaciones de forma clara y consistente
- Usa la vista de navegación para moverte rápidamente entre estaciones
- Revisa periódicamente que los datos se están guardando correctamente

⚠️ **Precauciones:**
- No elimines estaciones con datos sin antes exportar la información
- Confirma el nombre de la estación antes de empezar a cronometrar
- Sincroniza los datos regularmente si trabajas offline



Cronometraje en Paralelo
El cronometraje en paralelo permite registrar múltiples actividades que ocurren simultáneamente, ideal para operaciones con múltiples operarios, máquinas trabajando en paralelo, o procesos concurrentes.

Principios del Cronometraje en Paralelo
Concepto de Actividades Simultáneas
Definición:
Capacidad de cronometrar 2 o más actividades que ocurren al mismo tiempo
Cada actividad tiene su propio cronómetro independiente
Los tiempos se registran de forma paralela, no secuencial
Permite análisis de saturación y utilización de recursos

Casos de Uso Típicos:
👥 Múltiples Operarios:
Dos operarios trabajando en la misma pieza
Equipo de ensamble colaborativo
Operaciones sincronizadas en línea

🤖 Operario + Máquina:
Operario trabaja manualmente mientras máquina opera
Carga/descarga durante tiempo de máquina
Preparación de siguiente pieza durante mecanizado

🏭 Múltiples Máquinas:
Un operario supervisa varias máquinas
Operaciones paralelas en diferentes estaciones
Procesos batch simultáneos

Ventajas del Cronometraje Paralelo:
✅ Captura trabajo concurrente real
✅ Calcula saturación de operarios
✅ Identifica tiempos muertos y esperas
✅ Optimiza asignación de recursos
✅ Detecta oportunidades de multitarea
✅ Mejora balanceo de cargas de trabajo

Configuración del Cronometraje en Paralelo
Activación del Modo Paralelo
Acceso a Configuración:
En la pantalla de cronometraje, selecciona "Modo Paralelo"
Aparecerá la interfaz de múltiples cronómetros
Configuración de número de cronómetros simultáneos (2-6)

Configuración de Recursos:
Asignar nombre a cada cronómetro:
Operario 1, Operario 2
Máquina A, Máquina B
Estación 1, Estación 2
Asignar color distintivo a cada recurso
Configurar elementos específicos por recurso

Opciones Avanzadas:
Sincronización de inicio de ciclos
Alertas de desbalanceo de tiempos
Visualización de diagrama de Gantt en tiempo real
Cálculo automático de saturación

Operación del Cronometraje en Paralelo
Proceso de Registro Simultáneo
Paso 1: Configurar Recursos:
Define cuántos recursos cronometrarás (ej: 2 operarios)
Asigna nombre y color a cada uno
Verifica que los elementos estén asignados correctamente

Paso 2: Iniciar Cronometraje Paralelo:
Opción A: Inicio Sincronizado
Presiona "Iniciar Todos" para comenzar todos los cronómetros simultáneamente
Todos los recursos comienzan al mismo tiempo
Ideal para operaciones sincronizadas

Opción B: Inicio Independiente
Inicia cada cronómetro individualmente
Permite capturar desfases en el inicio
Ideal para operaciones asíncronas

Paso 3: Registrar Actividades Independientes:
Cada cronómetro se controla de forma independiente
Presiona "Registrar" en el cronómetro correspondiente cuando termina una actividad
Los demás cronómetros continúan corriendo
Sistema registra tiempos y sincronización

Paso 4: Finalizar y Analizar:
Finaliza cada recurso cuando complete su trabajo
El sistema genera análisis de sincronización
Calcula tiempos de espera y saturación
Produce diagrama de Gantt automático

Interfaz de Cronometraje Paralelo
Visualización Multi-Cronómetro:
Panel por Recurso:
Cronómetro individual grande y visible
Nombre y color del recurso
Elemento actual en ejecución
Botones de control independientes
Progreso del ciclo

Vista Sincronizada:
Línea de tiempo compartida
Indicadores de eventos simultáneos
Visualización de solapamientos
Alertas de desbalanceo

Información en Tiempo Real:
Tiempo de cada recurso
Diferencia entre recursos
Saturación calculada en vivo
Tiempos de espera identificados

Análisis de Saturación y Utilización
Cálculos Automáticos del Sistema
Saturación de Operario:
Fórmula: (Tiempo Trabajando ÷ Tiempo Total del Ciclo) × 100%
Ejemplo:
Tiempo total del ciclo: 60 segundos
Operario trabaja: 45 segundos
Operario espera: 15 segundos
Saturación = (45 ÷ 60) × 100% = 75%

Interpretación:
> 90%: Saturación alta (posible sobrecarga)
70-90%: Saturación óptima
50-70%: Saturación moderada (oportunidad de mejora)
< 50%: Baja saturación (ineficiencia)

Utilización de Máquina:
Tiempo de máquina funcionando vs tiempo total
Identifica tiempos muertos de equipo
Calcula OEE (Overall Equipment Effectiveness)
Detecta oportunidades de optimización

Indicadores de Saturación de Máquina (en Reportes):
Cuando un estudio incluye elementos de tipo "Tiempo de Máquina" (TM), el informe calcula automáticamente:
% Trabajo Máquina (Ciclo): Porcentaje del ciclo en que la máquina trabaja. Fórmula: TM / Ciclo Total × 100
Utilización Máquina (Turno): Proporción de la jornada con la máquina operando. Fórmula: TM × Producción Normal / Jornada × 100
Nota: Solo se usa TM (Tiempo de Máquina) para estos cálculos. MM (Máquina en Marcha) es trabajo del operario que se solapa con el tiempo de máquina, no trabajo de la máquina en sí.

Análisis de Sincronización:
Identifica desfases entre recursos
Calcula tiempos de espera mutua
Detecta cuellos de botella
Sugiere rebalanceo de actividades

Diagrama de Gantt Automático
Visualización Temporal de Actividades:
Eje Horizontal: Tiempo del ciclo
Eje Vertical: Recursos (operarios, máquinas)
Barras de Colores: Actividades específicas
Espacios en Blanco: Tiempos de espera

Información Mostrada:
Duración de cada actividad
Solapamientos entre recursos
Tiempos de espera y demoras
Puntos de sincronización
Ruta crítica del proceso

Exportación y Reportes:
Exportar diagrama como imagen (PNG, SVG)
Incluir en reportes PDF
Comparar múltiples ciclos
Análisis de variabilidad

Aplicaciones del Cronometraje en Paralelo
Optimización de Recursos
Balanceo de Cargas de Trabajo:
Identificar operarios sobrecargados o subutilizados
Redistribuir actividades para equilibrar saturación
Optimizar número de operarios necesarios
Mejorar eficiencia global del proceso

Optimización de Multitarea:
Identificar oportunidades de trabajo concurrente
Asignar tareas durante tiempos de máquina
Eliminar tiempos de espera innecesarios
Maximizar productividad por operario

Diseño de Celdas de Trabajo:
Configurar estaciones de trabajo óptimas
Determinar layout más eficiente
Minimizar movimientos y transportes
Sincronizar operaciones para flujo continuo

Análisis de Procesos Complejos
Líneas de Ensamble:
Cronometrar múltiples estaciones simultáneamente
Identificar cuellos de botella en la línea
Balancear tiempos entre estaciones
Optimizar velocidad de línea

Procesos con Máquinas Múltiples:
Analizar saturación de operario multi-máquina
Determinar número óptimo de máquinas por operario
Calcular tiempos de atención vs tiempos de máquina
Maximizar utilización de equipos

Operaciones de Equipo:
Estudiar coordinación entre miembros del equipo
Identificar interferencias y esperas mutuas
Optimizar secuencia de actividades
Mejorar comunicación y sincronización

Mejores Prácticas para Cronometraje Paralelo
Recomendaciones de Uso
✅ Preparación:
Define claramente qué recursos cronometrarás
Asigna nombres descriptivos y colores distintivos
Practica el registro antes del estudio formal
Considera usar dos analistas para procesos muy complejos

✅ Durante el Cronometraje:
Mantén atención en todos los recursos simultáneamente
Usa colores y posiciones para identificar rápidamente
Registra eventos en el momento exacto
Documenta cualquier desviación del método estándar

✅ Análisis:
Revisa el diagrama de Gantt para validar datos
Calcula saturación de todos los recursos
Identifica oportunidades de mejora
Compara múltiples ciclos para validar consistencia

⚠️ Limitaciones:
No intentes cronometrar más de 3-4 recursos simultáneamente solo
Para procesos muy complejos, usa múltiples analistas
Considera grabar en video para análisis posterior
Valida datos con observaciones adicionales

Tiempos de Máquina
El cronometraje de tiempos de máquina es una especialización técnica para operaciones donde el equipo controla parcial o totalmente el ritmo de trabajo, requiriendo análisis específicos de saturación del operario y utilización de recursos.
Principios de los Tiempos de Máquina
Clasificación de Tiempos de Máquina
Tiempo de Máquina Funcionando: Período donde la máquina opera automáticamente
Tiempo de Máquina Parada: Período donde se requiere intervención del operario
Tiempo Total de Ciclo: Tiempo completo desde inicio hasta fin del ciclo de máquina
Configuración Avanzada de Tiempos de Máquina
Tipos de Elementos de Máquina
Máquina Funcionando (Tiempo Libre del Operario)
Características:
El operario puede realizar otras actividades
Tiempo controlado por la máquina, muy consistente
Oportunidad para trabajo concurrente
Ejemplos:
Mecanizado automático en torno CNC
Soldadura automática por robot
Curado en horno industrial
Prensado hidráulico automático
Cronometraje: Se mide el tiempo total de operación automática
Máquina Parada (Trabajo del Operario Requerido)
Características:
El operario debe estar presente y activo
Incluye carga, descarga, ajustes, y supervisión
Tiempo variable según habilidad del operario
Ejemplos:
Cargar pieza en fixture de máquina
Cambiar herramientas o programas
Inspeccionar pieza durante proceso
Descargar producto terminado
Cronometraje: Se mide como elemento manual normal
Tiempo Total de Máquina
Definición: Tiempo completo del ciclo de máquina (funcionando + parada)
Uso: Para cálculos de capacidad y planificación de producción
Importancia: Determina el ritmo máximo posible del proceso
Cálculos Automáticos Especializados
Análisis de Saturación del Operario
Cálculos Realizados Automáticamente
Tiempo Base del Ciclo:


Suma de todos los tiempos de máquina parada (trabajo del operario)
Aplicación de calificaciones de actividad
Cálculo de tiempo normal
Suplementos por Fatiga:


Fatiga Básica: Aplicada a tiempo de trabajo del operario
Fatiga por Inactividad: Suplemento especial por esperas durante tiempo de máquina
Cálculo Diferenciado: Diferentes suplementos para tiempo activo vs. tiempo de espera
Tiempo de Inactividad del Operario:


Tiempo donde el operario está libre durante funcionamiento de máquina
Oportunidad para trabajo concurrente o descanso
Base para cálculo de saturación
Saturación del Operario:


Fórmula: (Tiempo de Trabajo del Operario ÷ Tiempo Total del Ciclo) × 100%
Interpretación:
100%: Operario ocupado todo el tiempo
<100%: Operario tiene tiempo libre, puede manejar múltiples máquinas
>100%: Imposible, indica error en medición o análisis
Análisis de Multimáquina:


Cálculo de cuántas máquinas puede operar un solo operario
Optimización de asignación de recursos humanos
Análisis de costo-beneficio de automatización adicional
Casos de Cálculo Especializados
Escenarios de Análisis Automático
Caso A: Operario Subutilizado:


Saturación <70%: Oportunidad de asignar trabajo adicional
Sugerencias automáticas de optimización
Cálculo de máquinas adicionales que puede operar
Caso B: Operario Saturado:


Saturación 90-100%: Utilización óptima
Análisis de balance de línea
Identificación de cuellos de botella
Caso C: Operario Sobrecargado:


Saturación >100%: Situación imposible que requiere análisis
Identificación de elementos mal clasificados
Sugerencias de redistribución de trabajo
Reportes Especializados para Máquinas
Análisis de Utilización de Equipo:


Tiempo productivo vs. tiempo total disponible
Identificación de oportunidades de mejora
Identificación de áreas de mejora potencial
Análisis de Costos:


Costo por hora de operario vs. costo por hora de máquina
Optimización de la relación costo-beneficio
Datos para análisis de costos básicos
Recomendaciones de Optimización:


Sugerencias de redistribución de trabajo
Oportunidades de automatización
Mejoras en el método de trabajo

Suplementos y Tolerancias
Los suplementos o tolerancias son adiciones porcentuales al tiempo normal que compensan las interrupciones inevitables del trabajo, la fatiga del operario, y las necesidades personales. La correcta aplicación de suplementos es fundamental para establecer tiempos estándar justos y alcanzables.
Fundamentos Teóricos de los Suplementos
Definición y Propósito
¿Qué son los Suplementos?
Definición: Porcentajes adicionales aplicados al tiempo normal para compensar factores que afectan el rendimiento del trabajador
Objetivo: Establecer un tiempo estándar que sea justo, alcanzable y sostenible a largo plazo
Base Científica: Fundamentados en estudios fisiológicos y ergonómicos sobre fatiga y recuperación
Componentes de los Suplementos
Suplementos Constantes: Aplicados a todos los trabajos independientemente de las condiciones
Suplementos Variables: Dependen de las condiciones específicas de trabajo
Suplementos Especiales: Para condiciones excepcionales o políticas de empresa
Clasificación Internacional de Suplementos
Suplementos Básicos (Constantes)
A) Necesidades Personales
Porcentaje Estándar: 5% del tiempo normal
Justificación: Tiempo necesario para atender necesidades fisiológicas básicas
Incluye:
Visitas al sanitario
Beber agua
Ajustes menores de ropa o equipo de protección
Limpieza personal básica
Aplicación: Se aplica a todos los elementos de trabajo sin excepción
Base Temporal: Calculado sobre jornadas de 8 horas de trabajo efectivo
B) Fatiga Básica
Porcentaje Estándar: 4% del tiempo normal
Justificación: Recuperación de la fatiga mínima inherente a cualquier trabajo
Condiciones Base:
Trabajo en posición sentada
Ambiente confortable (18-24°C, 40-60% humedad)
Esfuerzo físico mínimo
Buena iluminación y ventilación
Sin ruido excesivo
Aplicación Universal: Se aplica a todos los elementos independientemente del tipo
Configuración Avanzada de Suplementos
Acceso y Navegación del Sistema
Proceso de Configuración Paso a Paso
Acceso a la Sección de Suplementos
Navegación: Desde tu estudio, selecciona la pestaña "Suplementos"
Prerequisitos:
Método de trabajo completamente definido
Al menos un elemento con tiempos registrados
Calificaciones de actividad aplicadas
Vista General: Interfaz que muestra todos los elementos del estudio con su estado de suplementos
Selección de Elementos para Configuración
Vista de Lista: Todos los elementos organizados por orden de método
Indicadores de Estado:
✅ Verde: Suplementos completamente configurados
⚠️ Amarillo: Configuración parcial o suplementos por defecto
❌ Rojo: Sin configurar (solo suplementos básicos)
Selección Individual: Haz clic en cualquier elemento para configurar sus suplementos específicos
Configuración Masiva: Opción para aplicar la misma configuración a múltiples elementos similares
Sistema de Factores de Fatiga Variable
Categorías Principales de Factores
A) Factores de Esfuerzo Físico

 Fuerza Requerida (Levantamiento de Peso)
Ligero (0-5 kg): 0% adicional


Ejemplos: Ensamble de componentes electrónicos, trabajo de oficina
Mediano (5-15 kg): 2-5% adicional


Ejemplos: Manejo de cajas medianas, herramientas pesadas
Pesado (15-30 kg): 8-15% adicional


Ejemplos: Carga de sacos, manipulación de piezas grandes
Muy Pesado (>30 kg): 15-25% adicional


Ejemplos: Trabajo con maquinaria pesada, construcción
Postura de Trabajo
Sentado Cómodamente: 0% (posición base)
De Pie en Posición Normal: 2%
De Pie Inclinado Ocasionalmente: 3-5%
De Pie Inclinado Frecuentemente: 5-8%
Agachado o en Cuclillas: 8-12%
Acostado o Posiciones Forzadas: 10-15%

 Uso de Músculos
Solo Dedos: 0%
Dedos y Muñeca: 1%
Mano y Brazo: 2-3%
Brazo y Hombro: 4-6%
Cuerpo Completo: 8-12%
B) Factores Ambientales

 Temperatura del Ambiente
Configuración Interactiva: Slider para seleccionar temperatura exacta
Rangos y Suplementos:


18-24°C: 0% (zona de confort)
15-17°C o 25-27°C: 2-3%
10-14°C o 28-32°C: 5-8%
5-9°C o 33-37°C: 10-15%
<5°C o >37°C: 15-25%
Consideraciones Especiales:


Variaciones durante el turno
Exposición directa vs. indirecta
Disponibilidad de equipo de protección
Humedad Relativa
40-60%: 0% (ideal)
30-39% o 61-70%: 1-2%
20-29% o 71-80%: 3-5%
<20% o >80%: 5-10%
Interacción con Temperatura: El sistema calcula automáticamente el índice de calor

 Condiciones de Iluminación
Excelente (>1000 lux): 0%
Buena (500-1000 lux): 1%
Regular (200-500 lux): 2-4%
Deficiente (100-200 lux): 5-8%
Muy Deficiente (<100 lux): 10-15%

 Nivel de Ruido
Silencioso (<50 dB): 0%
Normal (50-70 dB): 1%
Ruidoso (70-85 dB): 2-4%
Muy Ruidoso (85-100 dB): 5-8%
Extremo (>100 dB): 10-15%
C) Factores Mentales y de Concentración

 Concentración Mental Requerida
Rutinario: 0%


Trabajo repetitivo sin decisiones complejas
Atención Normal: 1-2%


Seguimiento de instrucciones estándar
Concentración Moderada: 3-5%


Inspección de calidad, mediciones precisas
Alta Concentración: 6-10%


Trabajo de precisión, programación de máquinas
Concentración Extrema: 10-15%


Cirugía, control de procesos críticos
Monotonía del Trabajo
Trabajo Variado: 0%
Algo Repetitivo: 1-2%
Repetitivo: 3-5%
Muy Monótono: 5-8%

 Tensión Mental
Sin Presión: 0%
Presión Ligera: 1-2%
Presión Moderada: 3-5%
Alta Presión: 6-10%
Presión Extrema: 10-15%
Sistema de Aplicación Inteligente de Suplementos
Proceso de Selección y Configuración
Interfaz de Configuración por Elemento
Panel de Factores: Organizado por categorías con iconos visuales
Selección Múltiple: Permite marcar todos los factores aplicables
Sliders Interactivos: Para factores con valores continuos (temperatura, peso)
Vista Previa en Tiempo Real: Muestra el porcentaje total mientras se configuran los factores
Cálculo Automático de Suplementos
Suma Inteligente: No es una simple suma aritmética
Factores de Interacción: Considera interacciones entre factores (ej: temperatura + humedad)
Límites Máximos: Previene configuraciones irreales (>50% total)
Validación Cruzada: Compara con estándares industriales y alerta sobre valores atípicos
Suplementos Forzados (Override Manual)
Cuándo Usar:
Estándares específicos de la empresa
Estudios previos validados
Políticas sindicales o contractuales
Estándares corporativos específicos
Proceso de Aplicación:
Seleccionar "Suplemento Forzado"
Ingresar porcentaje específico (0-100%)
Documentar justificación en campo de comentarios
El sistema mantiene trazabilidad de la decisión
Análisis y Validación de Suplementos
Herramientas de Análisis Integradas
Comparación con Estándares
Base de Datos de Referencias: Comparación con estándares industriales por sector
Alertas de Desviación: Notificación cuando los suplementos están fuera de rangos típicos
Sugerencias de Optimización: Recomendaciones para ajustar factores específicos
Análisis de Consistencia


Entre Elementos: Verifica que elementos similares tengan suplementos coherentes
Histórico: Compara con estudios anteriores del mismo proceso
Por Operario: Analiza si diferentes operarios requieren suplementos diferentes
Reportes de Suplementos


Desglose Detallado: Muestra contribución de cada factor al total
Justificación Técnica: Documentación completa para auditorías
Comparación Gráfica: Visualización de suplementos por elemento
Análisis de Impacto: Efecto de los suplementos en el tiempo estándar final
Casos Especiales y Configuraciones Avanzadas
Suplementos Especializados por Industria
Industria Automotriz


Factores Específicos: Vibración, exposición a químicos, precisión dimensional
Estándares Típicos: 12-18% total para operaciones de ensamble
Consideraciones Especiales: Cambios de modelo, variabilidad de producto
Industria Alimentaria


Factores Específicos: Higiene, temperatura controlada, humedad
Estándares Típicos: 15-25% total por condiciones sanitarias
Consideraciones Especiales: Limpieza frecuente, cambios de producto
Industria Electrónica


Factores Específicos: Precisión microscópica, electricidad estática, componentes delicados
Estándares Típicos: 10-15% total para ensamble de precisión
Consideraciones Especiales: Obsolescencia rápida, miniaturización
Gestión de Plantillas de Suplementos
Sistema de Plantillas Reutilizables
Crear Plantillas Personalizadas


Configuraciones Frecuentes: Guardar combinaciones de factores comunes
Por Tipo de Operación: Plantillas específicas para soldadura, ensamble, inspección
Por Área de Trabajo: Configuraciones típicas por departamento o línea
Compartir en Organización: Estandarizar suplementos a nivel empresarial
Aplicación Masiva de Plantillas


Selección Múltiple: Aplicar la misma plantilla a varios elementos
Filtros Inteligentes: Aplicar automáticamente según tipo de elemento
Validación Previa: Verificar compatibilidad antes de aplicar
Historial de Cambios: Trazabilidad de modificaciones masivas

Reportes y Análisis
El sistema de reportes de Cronometras genera documentación profesional y análisis técnicos que cumplen con los estándares internacionales de ingeniería industrial. Los reportes son fundamentales para la implementación de mejoras, justificación de inversiones, y establecimiento de estándares de producción.
Fundamentos de los Reportes de Estudios de Tiempo
Propósito y Aplicaciones de los Reportes
Objetivos Principales
Documentación Técnica: Registro formal del método de trabajo y tiempos estándar
Implementación en Producción: Herramienta para supervisores y planificadores
Análisis de Costos: Base para cálculos de costos y presupuestos
Mejora Continua: Identificación de oportunidades de optimización
Documentación Profesional: Reportes formales para uso empresarial
Audiencias Objetivo
Ingenieros Industriales: Análisis técnico detallado y metodología
Supervisores de Producción: Instrucciones operativas y estándares
Gerencia: Resúmenes ejecutivos y análisis de impacto
Operarios: Hojas de instrucción y métodos de trabajo
Auditores: Documentación de cumplimiento y trazabilidad
Generación Avanzada de Reportes
Prerequisitos y Validación del Estudio
Verificación Automática de Completitud
Requisitos Obligatorios para Generar Reportes
Información Básica Completa: Nombre, empresa, fecha, y datos del operario
Método Definido: Al menos un elemento de trabajo configurado
Tiempos Registrados: Cada elemento debe tener observaciones suficientes
Mínimo: 5 observaciones por elemento repetitivo
Recomendado: 10-15 observaciones para precisión estadística
Elementos frecuenciales: Al menos 3 ocurrencias observadas
Calificaciones de Actividad: Todas las observaciones deben tener calificación
Suplementos Configurados: Cada elemento debe tener tolerancias aplicadas
Validación Estadística: Coeficiente de variación <15% (configurable)
Sistema de Validación Inteligente
Verificación Automática: El sistema revisa todos los requisitos antes de generar reportes
Lista de Verificación Visual: Checklist interactivo que muestra el estado de cada requisito
Alertas de Calidad: Notificaciones sobre datos que podrían afectar la precisión
Sugerencias de Mejora: Recomendaciones para optimizar la calidad del estudio
Tipos de Reportes Especializados
A) Reporte Técnico Completo
Contenido del Reporte Técnico
Portada Profesional:


Logo de la empresa (si está configurado)
Título del estudio y código de referencia
Fecha de realización y analista responsable
Información del cliente y proyecto
Resumen Ejecutivo (1-2 páginas):


Objetivo del estudio y metodología utilizada
Tiempo estándar final y producción esperada
Principales hallazgos y recomendaciones
Impacto económico estimado
Información del Estudio:


Datos completos del proceso y operario
Condiciones ambientales y de trabajo
Herramientas y equipos utilizados
Fecha y duración del estudio
Metodología y Procedimiento:


Descripción detallada del método de trabajo
Diagrama de flujo del proceso
Criterios de división en elementos
Método de cronometraje utilizado
Análisis Estadístico Detallado:


Tabla de observaciones por elemento
Estadísticas descriptivas (media, mediana, desviación estándar)
Análisis de outliers y consistencia
Gráficos de distribución de tiempos
Cálculos de Tiempos Estándar:


Tiempo observado promedio por elemento
Calificación de actividad aplicada
Tiempo normal calculado
Desglose detallado de suplementos
Tiempo estándar final por elemento y total
Análisis de Producción:


Tiempo de ciclo normal y óptimo
Producción por hora, turno, y día
Análisis de capacidad y utilización
Comparación con objetivos de producción
Recomendaciones y Mejoras:


Oportunidades de optimización identificadas
Sugerencias de mejora del método
Análisis de inversiones recomendadas
Plan de implementación sugerido
B) Hoja de Operaciones Estándar
Formato de Producción
Diseño Optimizado: Formato de una página para uso en planta
Información Esencial:
Descripción paso a paso del método
Tiempo estándar por elemento
Herramientas y materiales requeridos
Puntos críticos de calidad y seguridad
Elementos Visuales:
Diagramas simples del proceso
Símbolos de flujo estándar
Códigos de colores para diferentes tipos de elementos
Información de Control:
Número de revisión y fecha de vigencia
Aprobaciones requeridas
Frecuencia de revisión programada
C) Resumen Ejecutivo
Contenido Gerencial
Métricas Clave (Dashboard visual):
Tiempo estándar total
Producción esperada por turno
Eficiencia actual vs. potencial
Costo por unidad producida
Análisis de Resultados:
Tiempo estándar calculado y producción esperada
Análisis de eficiencia del proceso estudiado
Identificación de oportunidades de mejora
Impacto Económico:
Ahorro potencial por mejoras
Estimación de beneficios de mejoras
Proyección de beneficios esperados
Recomendaciones Estratégicas:
Prioridades de implementación
Recursos necesarios
Timeline de implementación
Formatos de Exportación y Distribución
Opciones de Formato Avanzadas
Exportación a PDF
Calidad Profesional: Resolución optimizada para impresión y presentación
Configuraciones Personalizables:
Tamaño de página (A4, Carta, Legal)
Orientación (Vertical/Horizontal)
Márgenes y espaciado
Inclusión/exclusión de secciones específicas
Características Avanzadas:
Marcadores navegables
Hipervínculos internos
Metadatos del documento
Protección con contraseña (opcional)
Optimización por Uso:
Versión para pantalla (menor tamaño)
Versión para impresión (alta calidad)
Versión para archivo (compresión optimizada)
Exportación a Excel
Múltiples Hojas de Trabajo:
Resumen: Métricas principales y gráficos
Datos Brutos: Todas las observaciones registradas
Análisis: Cálculos estadísticos detallados
Gráficos: Visualizaciones interactivas
Funcionalidad Avanzada:
Fórmulas activas para análisis adicional
Tablas dinámicas preconfiguradas
Gráficos interactivos con datos actualizables
Macros para análisis automatizado (opcional)
Compatibilidad:
Excel 2016 o superior
LibreOffice Calc
Google Sheets (funcionalidad limitada)
Impresión Optimizada
Configuración de Impresión:
Formato optimizado para papel estándar
Diseño profesional con encabezados y pies de página
Escalado apropiado para impresión
Opciones de Impresión:
Solo texto (para impresoras básicas)
Con gráficos (para impresoras a color)
Versión económica (menos páginas)
Versión completa (documentación total)
Análisis Estadístico y Visualización de Datos
Estadísticas Descriptivas por Elemento
Análisis Individual de Elementos
Métricas Estadísticas Fundamentales
Tiempo Promedio (Media Aritmética):


Cálculo: Suma de observaciones ÷ Número de observaciones
Interpretación: Tiempo típico esperado para el elemento
Consideraciones: Sensible a valores extremos (outliers)
Mediana:


Definición: Valor central cuando las observaciones se ordenan
Ventaja: Menos sensible a outliers que la media
Uso: Comparación con la media para detectar asimetría
Desviación Estándar:


Fórmula: √(Σ(xi - x̄)² / (n-1))
Interpretación: Medida de variabilidad o dispersión
Criterio de Calidad: <10% del tiempo promedio para elementos consistentes
Coeficiente de Variación:


Fórmula: (Desviación Estándar / Media) × 100%
Interpretación: Variabilidad relativa independiente de la unidad
Estándares: <15% aceptable, <10% excelente, >20% requiere investigación
Rango (Máximo - Mínimo):


Uso: Identificación rápida de la dispersión total
Limitación: Muy sensible a valores extremos
Aplicación: Control de calidad del cronometraje
Análisis Estadístico Básico


Estadísticas Descriptivas:
Cálculo automático de promedios y desviaciones estándar
Identificación de valores mínimos y máximos
Conteo de observaciones por elemento
Análisis de Consistencia:
Cálculo del coeficiente de variación
Identificación de elementos con alta variabilidad
Alertas cuando la variabilidad excede límites recomendados
Análisis del Ciclo de Trabajo Completo
Métricas de Rendimiento del Proceso
Tiempos de Ciclo


Tiempo Normal del Ciclo:
Suma de tiempos normales de todos los elementos
Base para cálculos de producción estándar
Incluye elementos repetitivos y frecuenciales prorateados
Tiempo Óptimo del Ciclo:
Tiempo normal ajustado por factor de actividad óptima
Representa el mejor rendimiento sostenible
Usado para establecer metas de mejora
Tiempo Estándar del Ciclo:
Tiempo normal + todos los suplementos aplicados
Tiempo real esperado en condiciones normales de trabajo
Base para planificación de producción y costos
Análisis de Producción


Producción por Hora (Normal):
Fórmula: 60 minutos ÷ Tiempo estándar del ciclo
Interpretación: Unidades esperadas por hora de trabajo
Uso: Planificación de capacidad y mano de obra
Producción por Hora (Óptima):
Fórmula: 60 minutos ÷ Tiempo óptimo del ciclo
Interpretación: Máximo potencial de producción
Uso: Establecimiento de metas y objetivos de mejora
Producción por Turno:
Considera tiempo neto de trabajo por turno
Incluye descansos programados y tiempo de preparación
Ajusta por eficiencia esperada del operario
Análisis de Capacidad Anual:
Proyección basada en días laborables
Considera paros programados y mantenimiento
Incluye factores de estacionalidad si aplican
Análisis de Saturación del Operario


Para Operaciones Manuales:
Saturación = (Tiempo de trabajo activo ÷ Tiempo total del ciclo) × 100%
Identificación de oportunidades de multitarea
Análisis de balance de línea
Para Operaciones con Máquina:
Tiempo libre durante funcionamiento automático
Cálculo de máquinas adicionales que puede operar
Optimización de la relación operario-máquina
Indicadores de Saturación de Máquina (solo se muestran cuando existe Tiempo de Máquina TM > 0):

% Trabajo Máquina (Ciclo):
Fórmula: (Tiempo de Máquina / Ciclo Total) × 100
Interpretación: Qué porcentaje del ciclo está la máquina efectivamente trabajando
Uso: Identificar si la máquina tiene tiempos muertos dentro del ciclo

Utilización Máquina (Turno):
Fórmula: (Tiempo de Máquina × Producción Normal por Turno) / Tiempo de Jornada × 100
Interpretación: Qué proporción de la jornada completa la máquina está operando
Uso: Evaluar si la máquina está infrautilizada y puede asumir más carga de trabajo

Nota importante: Solo se utiliza TM (Tiempo de Máquina) para el cálculo de saturación de máquina. Los elementos MM (Máquina en Marcha) representan trabajo del operario que se solapa con el tiempo de máquina, no tiempo de trabajo de la máquina propiamente dicho.

Estos indicadores aparecen en la pantalla de informes y se incluyen en las exportaciones PDF y Excel cuando existen datos de tiempo de máquina.
Visualizaciones Avanzadas y Gráficos Interactivos
Herramientas de Análisis Visual
Gráficos en Reportes PDF


Gráficos Automáticos en Reportes:
Los reportes PDF incluyen gráficos automáticamente generados
Distribución de tiempos por elemento
Análisis de tipos de operación (símbolos de flujo)
Distribución de suplementos por elemento
Tipos de Gráficos Incluidos:
Gráficos de barras para comparación de tiempos
Gráficos circulares para distribución porcentual
Análisis de saturación para operaciones de máquina
Distribución por tipos de operación (operación, transporte, inspección, etc.)
Información Visual:
Resumen estadístico con métricas clave
Visualización de la composición del ciclo de trabajo
Identificación visual de elementos críticos

Biblioteca de Elementos
La Biblioteca de Elementos es el corazón del sistema de gestión del conocimiento de Cronometras. Funciona como un repositorio inteligente que almacena, organiza y facilita la reutilización de elementos de trabajo previamente estudiados, promoviendo la consistencia, eficiencia y mejora continua en los estudios de tiempo.
Conceptos Fundamentales de la Biblioteca
Filosofía de Gestión del Conocimiento
¿Qué es la Biblioteca de Elementos?
Definición: Base de datos inteligente de elementos de trabajo con sus tiempos, suplementos y metadatos asociados
Propósito: Acelerar la creación de nuevos estudios reutilizando conocimiento validado
Beneficios:
Reducción del tiempo de análisis en 60-80%
Consistencia entre diferentes analistas
Mejora continua basada en datos históricos
Estandarización de métodos a nivel organizacional
Tipos de Bibliotecas
Biblioteca Personal: Elementos creados y utilizados por un analista individual
Biblioteca Organizacional: Elementos compartidos dentro de una empresa u organización
Biblioteca de Referencia: Elementos estándar de la industria (si está disponible)
Estructura y Metadatos de los Elementos
Información Completa por Elemento
Identificación Básica: Descripción, tipo, símbolo de flujo
Datos Estadísticos: Tiempo promedio, desviación estándar, número de observaciones
Configuración de Suplementos: Factores de fatiga y tolerancias aplicadas
Metadatos Contextuales: Industria, herramientas, condiciones de trabajo
Historial de Uso: Frecuencia de utilización, estudios donde se ha aplicado
Información de Calidad: Consistencia, confiabilidad, fecha de última validación
Gestión Avanzada de la Biblioteca Personal
Organización Inteligente y Categorización
Sistema de Clasificación Automática
Organización por Múltiples Criterios
Por Tipo de Proceso:


Operaciones (○): Elementos que transforman o modifican el producto
Transportes (→): Movimientos de materiales o personas
Inspecciones (□): Verificaciones de calidad o cantidad
Demoras (▽): Esperas no planificadas
Almacenamientos (▽): Depósitos temporales o permanentes
Por Duración Típica:


Elementos Micro (<0.1 minutos): Movimientos básicos, alcanzar, soltar
Elementos Cortos (0.1-0.5 minutos): Operaciones simples, posicionar
Elementos Medios (0.5-2 minutos): Operaciones complejas, ensambles
Elementos Largos (2-10 minutos): Procesos completos, inspecciones detalladas
Elementos Macro (>10 minutos): Operaciones de máquina, procesos especiales
Por Variabilidad y Consistencia:


Altamente Consistentes (CV <5%): Operaciones de máquina, procesos automatizados
Consistentes (CV 5-10%): Operaciones manuales bien definidas
Moderadamente Variables (CV 10-15%): Operaciones con cierta complejidad
Variables (CV >15%): Operaciones complejas que requieren análisis adicional
Categorización por Industria y Aplicación
Industria Automotriz: Ensamble, soldadura, pintura, inspección dimensional
Electrónica: Inserción de componentes, soldadura de precisión, pruebas
Textil: Corte, costura, acabados, empaque
Alimentaria: Procesamiento, empaque, control de calidad, higienización
Farmacéutica: Dosificación, encapsulado, control de calidad, documentación
Metalmecánica: Maquinado, soldadura, ensamble, tratamientos térmicos
Herramientas de Búsqueda y Filtrado Avanzado
Sistema de Búsqueda
Búsqueda de Texto Simple
Búsqueda por Coincidencia:


Busca en nombres de estudios y descripciones de elementos
Búsqueda insensible a mayúsculas y minúsculas
Resultados en tiempo real mientras escribes
Filtrado por Contenido:


Si la búsqueda coincide con el nombre del estudio, muestra todos sus elementos
Si coincide con elementos específicos, muestra solo esos elementos
Búsqueda en español e inglés según el idioma configurado
Filtrado de Resultados
Filtros Disponibles:


Búsqueda por texto en tiempo real
Filtrado automático por estudios visibles en biblioteca
Organización por estudio de origen
Separación entre elementos con datos y elementos placeholder
Criterios de Visibilidad:


Solo se muestran estudios marcados como "Visible en Biblioteca"
Incluye estudios propios y de organizaciones donde eres miembro
Los elementos deben tener tiempos registrados para ser útiles
Organización de Resultados
Agrupación por Estudio: Los elementos se muestran organizados por el estudio de origen
Información Contextual: Cada elemento muestra:
Nombre del estudio del que proviene
Descripción del elemento
Tiempos y actividades registradas (si existen)
Configuración de suplementos (si existe)
Selección Múltiple: Posibilidad de seleccionar varios elementos para crear un nuevo estudio
Información Detallada y Análisis de Elementos
Vista Completa de Elementos
Panel de Información Integral
Descripción Técnica Completa:


Descripción detallada del elemento
Método específico de ejecución
Puntos críticos de calidad
Consideraciones de seguridad
Estadísticas Históricas Avanzadas:


Tiempo Promedio Ponderado: Considera la calidad de cada estudio
Tendencia Temporal: Evolución del tiempo a lo largo de múltiples estudios
Análisis de Consistencia: Comparación entre diferentes analistas
Confiabilidad del Elemento: Índice basado en múltiples factores
Análisis de Suplementos:


Configuración típica de suplementos para el elemento
Variaciones según condiciones de trabajo
Comparación con estándares industriales
Recomendaciones de aplicación
Metadatos Contextuales Detallados
Información Técnica:


Herramientas Requeridas: Lista completa con especificaciones
Materiales Involucrados: Tipos y características
Equipos Necesarios: Máquinas, dispositivos, fixtures
Condiciones Ambientales: Temperatura, humedad, iluminación óptimas
Información Operativa:


Nivel de Habilidad Requerido: Detallado por competencias específicas
Tiempo de Entrenamiento: Estimado para alcanzar competencia
Riesgos Asociados: Identificación de peligros potenciales
Medidas de Seguridad: Equipos de protección y procedimientos
Información de Calidad:


Puntos de Control: Aspectos críticos a verificar
Tolerancias Típicas: Rangos aceptables de variación
Criterios de Aceptación: Estándares de calidad aplicables
Frecuencia de Inspección: Recomendaciones de control
Análisis de Consistencia y Validación
Herramientas de Control de Calidad
Selección y Uso de Elementos
Selección Individual: Cada elemento puede seleccionarse independientemente
Información Completa: Al seleccionar un elemento se preservan:
Todos los registros de tiempo del elemento original
Configuración de suplementos aplicada
Tipo de elemento y configuraciones de frecuencia
Creación de Nuevos Estudios: Los elementos seleccionados pueden usarse para crear un nuevo estudio
Preservación de Datos: Los tiempos y configuraciones se mantienen al reutilizar elementos
Gestión de Elementos Compartidos y Colaboración
Sistema de Compartición Organizacional
Niveles de Compartición
Configuración de Visibilidad


Elementos Privados:
Visibles solo para el creador
Útiles para elementos experimentales o específicos
Pueden convertirse a compartidos posteriormente
Elementos Compartidos en Organización:
Visibles para todos los miembros de la organización
Contribuyen a la estandarización de métodos
Sujetos a políticas de calidad organizacional
Elementos de Referencia Global (si está habilitado):
Elementos estándar de la industria
Validados por múltiples organizaciones
Solo lectura, no modificables
Gestión de Permisos y Control de Calidad


Roles de Biblioteca:
Contribuidor: Puede agregar elementos a la biblioteca compartida
Revisor: Puede validar y aprobar elementos compartidos
Administrador: Control total sobre la biblioteca organizacional
Proceso de Aprobación:
Elementos compartidos requieren revisión antes de publicación
Validación técnica por expertos designados
Verificación de completitud y calidad de datos
Documentación de criterios de aprobación
Herramientas de Importación y Exportación
Intercambio de Bibliotecas
Importación desde Excel


Importador de Excel Integrado:
Herramienta para importar elementos desde archivos Excel
Mapeo flexible de columnas de Excel
Mapeo de columnas personalizable
Validación de datos durante la importación
Proceso de Importación:
Selección de archivo Excel
Configuración de mapeo de columnas
Validación de datos importados
Creación de nuevo estudio con elementos importados
Validaciones Incluidas:
Verificación de formato de datos
Detección de duplicados básica
Validación de campos requeridos
Conversión de unidades si es necesario
Mantenimiento y Optimización de la Biblioteca
Gestión del Ciclo de Vida de Elementos
Gestión de Elementos Promediados


Funcionalidad de Promediado:
Capacidad de crear elementos promediados a partir de múltiples observaciones
Los elementos promediados aparecen automáticamente en la biblioteca
Se pueden seleccionar y usar como cualquier otro elemento
Características de Elementos Promediados:
Mantienen estadísticas calculadas automáticamente
Se identifican claramente como elementos promediados
Pueden incluirse en nuevos estudios
Preservan la configuración de suplementos original
Visibilidad y Compartición


Control de Visibilidad:
Los estudios deben marcarse como "Visible en Biblioteca" para aparecer
Solo elementos de estudios visibles están disponibles para reutilización
Respeta permisos de organización para estudios compartidos
Acceso Organizacional:
Miembros de organizaciones pueden ver elementos de estudios compartidos
Preserva la autoría y origen de cada elemento
Facilita la estandarización de métodos a nivel organizacional

Organizaciones y Colaboración
El sistema de organizaciones de Cronometras facilita la colaboración empresarial, permitiendo que equipos de ingenieros industriales, consultores y analistas trabajen de manera coordinada, compartan conocimiento y mantengan estándares consistentes a través de toda la organización.
Fundamentos de la Colaboración Empresarial
Concepto de Organizaciones en Cronometras
¿Qué es una Organización?
Definición: Entidad que agrupa múltiples usuarios bajo una estructura común de colaboración
Propósito: Facilitar el trabajo en equipo, compartir recursos y mantener consistencia metodológica
Beneficios Clave:
Estandarización de métodos y tiempos a nivel empresarial
Compartición de bibliotecas de elementos entre analistas
Colaboración básica mediante compartición de estudios
Estandarización básica de metodologías
Compartición de estudios entre miembros del equipo
Tipos de Organizaciones
Empresas Manufactureras: Departamentos de ingeniería industrial internos
Consultorías: Equipos de consultores que trabajan para múltiples clientes
Instituciones Académicas: Universidades y centros de investigación
Corporaciones Multi-planta: Organizaciones con múltiples ubicaciones
Alianzas Estratégicas: Colaboración entre empresas del mismo sector
Arquitectura de Colaboración
Modelo de Datos Compartidos
Estudios Compartidos: Visibilidad controlada de estudios entre miembros
Biblioteca Organizacional: Elementos de trabajo validados y estandarizados
Plantillas Corporativas: Formatos estándar para reportes y análisis
Políticas de Calidad: Criterios unificados para validación de estudios
Configuraciones Organizacionales: Estándares y políticas unificadas
Creación y Configuración de Organizaciones
Proceso de Establecimiento Organizacional
Paso 1: Creación de la Organización
Acceso al Sistema de Organizaciones
Navegación: Sección "Organizaciones" desde el menú principal
Vista General: Panel que muestra organizaciones existentes y opciones de gestión
Botón "Crear Nueva Organización": Inicia el proceso de configuración
Configuración Básica de la Organización
Información Fundamental:


Nombre de la Organización: Denominación oficial (ej: "Ingeniería Industrial ABC S.A.")
Nombre Corto: Identificador abreviado para uso interno (ej: "ING-ABC")
Descripción: Propósito y alcance de la organización
Tipo de Industria: Clasificación para configuraciones predeterminadas
Ubicación Principal: País y región para configuraciones regionales
Configuración Visual:


Logo Corporativo: Imagen que aparecerá en todos los reportes compartidos
Colores Corporativos: Paleta de colores para personalización de interfaz
Plantilla de Reportes: Formato estándar para documentos organizacionales
Configuración Técnica:


Unidades de Tiempo Estándar: Minutos, CMM, TMU, etc.
Escalas de Actividad: Valores normal y óptimo corporativos
Suplementos Estándar: Configuraciones típicas por tipo de trabajo
Criterios de Calidad: Estándares mínimos para estudios compartidos
Paso 2: Políticas y Configuraciones Avanzadas
Establecimiento de Políticas Organizacionales
Políticas de Compartición:


Qué tipos de estudios pueden compartirse automáticamente
Criterios de calidad mínimos para compartir
Proceso de aprobación para estudios sensibles
Retención y archivado de estudios antiguos
Políticas de Acceso:


Niveles de acceso por departamento o proyecto
Restricciones geográficas si aplican
Políticas de seguridad y confidencialidad
Procedimientos de auditoría y trazabilidad
Estándares de Calidad:


Número mínimo de observaciones por elemento
Coeficiente de variación máximo aceptable
Requisitos de validación cruzada
Procedimientos de revisión y aprobación
Gestión de Membresía y Invitaciones
Sistema de Invitaciones Inteligente
Proceso de Invitación de Miembros
Métodos de Invitación:


Por Email Individual: Invitación personalizada con mensaje
Invitación Masiva: Importar lista de emails desde Excel/CSV
Enlace de Invitación: URL compartible para auto-registro
Integración con Directorio Activo: Sincronización con sistemas corporativos
Configuración de Invitaciones:


Rol Predeterminado: Asignación automática de permisos
Departamento/Proyecto: Clasificación organizacional
Fecha de Expiración: Validez temporal de la invitación
Mensaje Personalizado: Contexto y bienvenida personalizada
Seguimiento de Invitaciones:


Estado de cada invitación (Enviada, Vista, Aceptada, Expirada)
Recordatorios automáticos para invitaciones pendientes
Reenvío automático de invitaciones no respondidas
Análisis de tasas de aceptación
Gestión del Proceso de Incorporación
Onboarding Automatizado:


Tutorial específico para nuevos miembros organizacionales
Asignación automática de bibliotecas y plantillas corporativas
Configuración de preferencias según estándares organizacionales
Acceso a documentación y procedimientos internos
Validación de Nuevos Miembros:


Verificación de identidad y autorización
Confirmación de departamento y rol
Asignación de mentor o supervisor (opcional)
Período de prueba con permisos limitados (configurable)
Compartición y Gestión de Estudios Organizacionales
Sistema de Compartición Inteligente
Configuración de Estudios Compartidos
Niveles de Compartición:


Privado: Solo visible para el creador
Departamental: Visible para miembros del mismo departamento
Organizacional: Visible para toda la organización
Proyecto Específico: Visible para miembros de proyectos designados
Control de Permisos Granular:


Solo Lectura: Ver estudios y generar reportes
Comentarios: Agregar anotaciones y sugerencias
Colaboración: Participar en análisis y mejoras
Edición Limitada: Modificar elementos específicos con aprobación
Configuración Manual:


Selección manual de estudios para compartir
Control individual de visibilidad por estudio
Configuración de permisos por organización
Flujos de Trabajo Colaborativos
Revisión y Aprobación:


Proceso de revisión por pares para estudios críticos
Aprobación multinivel para estudios que afectan estándares
Comentarios y sugerencias integrados en el flujo
Historial completo de revisiones y cambios
Colaboración Básica:


Compartir estudios con miembros de la organización
Acceso de solo lectura a estudios compartidos
Preservación de autoría y trazabilidad de cambios
Estructura de Roles y Permisos Avanzada
Jerarquía de Roles Organizacionales
Roles Principales y sus Responsabilidades
Propietario de Organización
Responsabilidades Administrativas:


Configuración completa de la organización
Gestión de facturación y suscripciones
Definición de políticas y procedimientos
Supervisión de cumplimiento y auditorías
Permisos Técnicos:


Acceso total a todos los estudios y bibliotecas
Configuración de integraciones y APIs
Gestión de respaldos y recuperación de datos
Control de configuraciones de seguridad
Gestión de Personal:


Contratación y remoción de miembros
Asignación y modificación de roles
Definición de estructura organizacional
Gestión de conflictos y resolución de disputas
Administrador de Organización
Gestión Operativa:


Invitación y gestión de nuevos miembros
Supervisión de calidad de estudios compartidos
Gestión de bibliotecas organizacionales
Coordinación de proyectos multi-analista
Permisos de Contenido:


Aprobación de estudios para compartición
Validación de elementos de biblioteca
Gestión de plantillas y estándares
Moderación de comentarios y discusiones
Limitaciones:


No puede eliminar la organización
No puede modificar configuraciones de facturación
No puede remover al propietario
Requiere aprobación para cambios críticos
Supervisor de Proyecto


Responsabilidades de Proyecto:
Coordinación de estudios dentro de proyectos específicos
Revisión y validación de estudios de su equipo
Gestión de cronogramas y entregables
Comunicación con stakeholders del proyecto
Permisos Específicos:
Acceso completo a estudios de su proyecto
Capacidad de asignar tareas a miembros del equipo
Aprobación de estudios dentro de su alcance
Generación de reportes consolidados de proyecto
Analista Senior


Responsabilidades Técnicas:
Mentoría de analistas junior
Revisión técnica de estudios complejos
Desarrollo de metodologías y mejores prácticas
Validación de elementos de biblioteca
Permisos Avanzados:
Acceso a estudios de múltiples proyectos
Capacidad de crear y modificar plantillas
Participación en procesos de aprobación
Acceso a métricas y análisis organizacionales
Analista Regular


Responsabilidades Operativas:
Creación y ejecución de estudios de tiempo
Contribución a bibliotecas organizacionales
Participación en revisiones colaborativas
Cumplimiento de estándares de calidad
Permisos Estándar:
Acceso de lectura a estudios compartidos
Capacidad de crear estudios privados y compartidos
Uso de bibliotecas organizacionales
Participación en comentarios y discusiones
Miembro Observador


Acceso Limitado:
Solo lectura de estudios compartidos públicamente
Acceso a reportes y análisis generales
Participación limitada en discusiones
No puede crear o modificar contenido
Casos de Uso:
Stakeholders externos (clientes, proveedores)
Personal de otras áreas (finanzas, operaciones)
Auditores y consultores externos
Estudiantes en programas de práctica
Gestión Avanzada de Permisos
Sistema de Permisos Granulares
Permisos por Contenido


Estudios:
Crear, leer, actualizar, eliminar
Compartir con diferentes niveles de acceso
Exportar en diferentes formatos
Generar reportes y análisis
Bibliotecas:
Agregar elementos nuevos
Modificar elementos existentes
Validar y aprobar elementos
Exportar/importar bibliotecas completas
Configuraciones:
Modificar configuraciones personales
Cambiar configuraciones de proyecto
Alterar configuraciones organizacionales
Gestionar integraciones y APIs
Permisos por Contexto


Geográficos: Acceso limitado por ubicación o región
Temporales: Permisos con fecha de expiración
Por Proyecto: Acceso específico a proyectos designados
Por Cliente: Segregación de datos por cliente final
Por Departamento: Acceso basado en estructura organizacional
Herramientas de Administración y Monitoreo
Panel de Control Organizacional
Gestión Básica de Organizaciones


Información de Miembros:
Lista de miembros activos de la organización
Roles asignados a cada miembro
Estado de invitaciones pendientes
Gestión de Contenido:
Estudios compartidos dentro de la organización
Biblioteca de elementos organizacional
Control de visibilidad de estudios
Funcionalidades de Administración


Gestión de Invitaciones:
Envío de invitaciones por email
Seguimiento del estado de invitaciones
Reenvío de invitaciones no aceptadas
Control de Acceso:
Asignación de roles (Propietario, Administrador, Miembro)
Permisos diferenciados por rol
Gestión de miembros activos

Configuración y Preferencias
El sistema de configuración de Cronometras permite personalizar completamente la experiencia del usuario, adaptando la aplicación a las necesidades específicas de cada analista, organización e industria. La configuración abarca desde preferencias básicas de interfaz hasta configuraciones técnicas avanzadas para integración empresarial.
Personalización de la Experiencia del Usuario
Configuración de Idioma y Regionalización
Sistema Multiidioma Avanzado
Configuración de Idioma Principal
Idiomas Disponibles:


Español: Español internacional con terminología técnica de ingeniería industrial
Inglés: Inglés técnico con estándares internacionales (ASME, ILO, AIIE)
Cambio Dinámico de Idioma:


Aplicación inmediata en toda la interfaz
Conversión automática de reportes existentes
Mantenimiento de consistencia en terminología técnica
Preservación de datos en idioma original para trazabilidad
Configuración Regional:


Formato de Fecha: DD/MM/AAAA (español) vs MM/DD/YYYY (inglés)
Separadores Decimales: Coma (,) vs punto (.)
Separadores de Miles: Punto (.) vs coma (,)
Formato de Hora: 24 horas vs 12 horas (AM/PM)
Personalización de Terminología
Glosario Personalizable:


Adaptación de términos técnicos según empresa o región
Ejemplo: "Operario" vs "Trabajador" vs "Empleado"
Configuración de abreviaciones corporativas
Integración con estándares específicos de la industria
Plantillas de Idioma por Industria:


Terminología específica para automotriz, electrónica, textil, etc.
Adaptación automática según el tipo de organización
Importación de glosarios corporativos existentes
Configuración Avanzada de Unidades de Tiempo
Sistemas de Medición Especializados
Unidades de Tiempo Principales
Minutos Decimales:


Unidad más intuitiva para la mayoría de usuarios
Fácil conversión a horas (dividir por 60)
Ideal para procesos de duración media (1-30 minutos)
Precisión: 0.01 minutos (0.6 segundos)
Centésimas de Minuto (CMM):


Estándar industrial más utilizado
1 minuto = 100 CMM
Facilita cálculos de productividad
Precisión: 1 CMM = 0.6 segundos
Conversión automática: CMM = Minutos × 100
Segundos:


Máxima precisión para elementos muy cortos
Ideal para movimientos básicos y micromovimientos
Usado en estudios de alta precisión
Conversión automática a otras unidades
Horas Decimales:


Para procesos largos y análisis de capacidad
Facilita cálculos de costos por hora
Ideal para planificación de producción
Precisión: 0.001 horas (3.6 segundos)
TMU (Time Measurement Units):


Unidad estándar para sistemas de tiempos predeterminados
1 TMU = 0.00001 horas = 0.0006 minutos = 0.036 segundos
Compatibilidad con sistemas MTM, MOST, MODAPTS
Conversión automática desde observaciones reales
DMH (Diezmilésimas de Hora):


Unidad especializada para análisis de costos
1 DMH = 0.0001 horas = 0.006 minutos = 0.36 segundos
Facilita cálculos directos de costo por operación
Integración con sistemas ERP y de costos
Configuración de Unidades
Conversión Básica: Los cálculos se realizan en la unidad seleccionada
Visualización Consistente: Todos los datos se muestran en la unidad configurada
Reportes Unificados: Los reportes usan la unidad de tiempo seleccionada
Personalización de la Interfaz de Cronometraje
Configuración de Herramientas de Medición
Configuración del Cronómetro Digital
Sensibilidad de Botones:


Alta Sensibilidad: Respuesta inmediata al toque (ideal para elementos cortos)
Sensibilidad Media: Balance entre precisión y prevención de errores
Baja Sensibilidad: Requiere presión deliberada (previene activaciones accidentales)
Configuración Adaptativa: Ajuste automático según el tipo de elemento
Retroalimentación Sensorial:


Sonidos de Confirmación: Diferentes tonos para diferentes acciones
Inicio de cronometraje: Tono grave
Cambio de elemento: Tono medio
Finalización: Tono agudo
Error o alerta: Tono de advertencia
Vibración Táctil (dispositivos móviles):
Intensidad configurable (suave, media, fuerte)
Patrones diferentes para diferentes acciones
Desactivación para ambientes sensibles al ruido
Configuración Visual:


Tamaño de Botones: Adaptable para diferentes tamaños de pantalla
Contraste de Colores: Optimización para diferentes condiciones de iluminación
Modo Nocturno: Colores oscuros para ambientes de poca luz
Modo Alto Contraste: Para usuarios con dificultades visuales
Configuración de Atajos y Gestos
Atajos de Teclado Personalizables:


Teclas para iniciar/parar cronómetro
Atajos para calificaciones de actividad frecuentes
Navegación rápida entre elementos
Acceso directo a funciones comunes
Gestos Táctiles (dispositivos móviles):


Deslizar para cambiar elementos
Pellizcar para ajustar zoom
Doble toque para funciones rápidas
Gestos personalizables por usuario
Gestión de Cuenta y Seguridad
Información Personal y Profesional
Perfil Profesional Completo
Datos Personales y Profesionales
Información Básica:


Nombre completo y título profesional
Email principal y emails alternativos
Teléfono de contacto y extensión
Ubicación geográfica y zona horaria
Información Profesional:


Cargo y Departamento: Posición actual en la organización
Experiencia: Años de experiencia en estudios de tiempo
Especialización: Industrias o tipos de proceso especializados
Certificaciones: Credenciales profesionales (PE, CIE, etc.)
Idiomas: Idiomas de trabajo y nivel de competencia
Configuración de Firma Digital:


Firma escaneada para reportes oficiales
Sello profesional o corporativo
Información de licencias profesionales
Datos para cumplimiento regulatorio
Configuración de Logo y Branding
Logo Personal/Empresarial:


Formatos soportados: PNG, JPG, SVG (vectorial preferido)
Resolución mínima: 300 DPI para impresión
Tamaño máximo: 5 MB
Optimización automática para diferentes usos
Configuración de Branding:


Colores corporativos primarios y secundarios
Tipografías preferidas para reportes
Plantillas de documentos personalizadas
Elementos gráficos adicionales (marcos, bordes)
Configuración de Notificaciones y Comunicaciones
Sistema de Notificaciones Inteligente
Preferencias de Notificación
Notificaciones por Email:


Estudios Compartidos: Cuando alguien comparte un estudio contigo
Comentarios: Respuestas a tus comentarios o menciones
Aprobaciones: Cuando tus estudios son aprobados o requieren cambios
Actualizaciones de Biblioteca: Nuevos elementos relevantes disponibles
Recordatorios: Estudios pendientes de completar o revisar
Notificaciones en Aplicación:


Notificaciones dentro de la aplicación web
Alertas de cambios en estudios compartidos
Confirmaciones de acciones importantes
Notificaciones en Aplicación:


Alertas en tiempo real durante el uso
Badges de notificación en menús
Centro de notificaciones integrado
Historial de notificaciones recibidas
Configuración de Privacidad y Comunicaciones


Visibilidad del Perfil:
Información visible para otros miembros de la organización
Configuración de disponibilidad para colaboración
Preferencias de contacto directo
Configuración de Compartición:
Nivel de compartición automática de estudios
Aprobación requerida antes de compartir
Configuración de elementos de biblioteca compartidos
Políticas de retención de datos compartidos
Seguridad Avanzada de Cuenta
Protección Multicapa
Gestión de Contraseñas y Autenticación


Políticas de Contraseña:
Longitud mínima: 8 caracteres (recomendado: 12+)
Complejidad: Mayúsculas, minúsculas, números, símbolos
Historial: No reutilizar las últimas 5 contraseñas
Expiración: Opcional, configurable por organización
Seguridad de Contraseña:
Cambio de contraseña desde el perfil de usuario
Validación de fortaleza de contraseña
Confirmación requerida para cambios importantes
Gestión Básica de Sesión


Sesión de Usuario:
Inicio y cierre de sesión estándar
Mantenimiento de sesión durante el uso
Cierre automático por seguridad de Supabase
Seguridad de Acceso:
Autenticación segura con Supabase Auth
Tokens de sesión encriptados
Protección contra accesos no autorizados
Gestión Financiera y Suscripciones
Sistema de Créditos y Facturación
Monitoreo de Créditos y Uso


Dashboard de Créditos:
Créditos Mensuales: Asignación renovable cada mes
Créditos Extra: Compras adicionales que no expiran
Créditos Utilizados: Desglose por tipo de actividad
Proyección de Uso: Estimación basada en patrones históricos
Historial Detallado de Uso:
Consumo por estudio creado
Uso de funciones premium (exportaciones, análisis avanzados)
Comparación mes a mes
Identificación de picos de uso
Alertas de Consumo:
Notificación al 75% de uso mensual
Alerta crítica al 90% de uso
Sugerencias de optimización de uso
Recomendaciones de plan superior si es necesario
Gestión de Suscripciones y Pagos


Planes Disponibles:
Plan Básico: Límite mensual de estudios
Plan Profesional: Estudios ilimitados + funciones avanzadas
Plan Empresarial: Múltiples usuarios + colaboración
Plan Corporativo: Personalización + soporte dedicado
Configuración de Facturación:
Información de facturación y datos fiscales
Métodos de pago (tarjeta, transferencia, PayPal)
Frecuencia de facturación (mensual, anual)
Gestión de métodos de pago
Gestión de Compras Adicionales:
Compra de créditos extra
Funciones premium temporales
Servicios de consultoría especializada
Capacitación y certificación
Configuración de Aplicación y Tecnología
Instalación y Configuración como PWA
Aplicación Web Progresiva
Instalación como Aplicación Nativa


Proceso de Instalación:
Detección automática de compatibilidad PWA
Prompt de instalación inteligente
Instalación desde navegador (Chrome, Edge, Safari)
Instalación como aplicación nativa en el dispositivo
Funcionalidades Nativas:
Funcionamiento Offline: Acceso a estudios descargados sin internet
Sincronización Automática: Actualización cuando se restaura conexión
Notificaciones Push: Alertas nativas del sistema operativo
Integración con Sistema: Aparece en menú de aplicaciones
Configuración de Offline:
Selección de estudios para descarga offline
Gestión de espacio de almacenamiento local
Sincronización básica cuando hay conexión
Almacenamiento local para uso offline
Configuración de Rendimiento y Almacenamiento


Optimización de Rendimiento:
Configuración de caché para elementos frecuentes
Precarga de bibliotecas utilizadas frecuentemente
Compresión de datos para dispositivos con almacenamiento limitado
Optimización de imágenes y recursos gráficos
Gestión de Almacenamiento Local:
Límites de almacenamiento por tipo de contenido
Limpieza automática de datos antiguos
Configuración de retención de datos offline
Herramientas de diagnóstico de espacio utilizado
Respaldos y Recuperación de Datos
Sistema de Protección de Datos
Exportación de Datos


Exportación Manual:
Exportación de estudios individuales
Exportación masiva por carpetas
Múltiples formatos disponibles (Excel, PDF, CSV)
Contenido Exportable:
Estudios Completos: Todos los datos del estudio
Reportes: Documentos formateados para presentación
Datos Brutos: Para análisis en herramientas externas
Herramientas de Importación y Migración


Importación desde Otros Sistemas:
Importación desde Excel con plantillas predefinidas
Importación de datos básicos de tiempo y elementos
Importación de datos de tiempo básicos
Conversión de formatos legacy
Exportación para Migración:
Formato completo de Cronometras (JSON)
Formato Excel para análisis externo
Formato CSV para integración con otros sistemas
Formato PDF para archivo permanente
Validación y Verificación:
Verificación de integridad de datos importados
Detección de duplicados durante importación
Validación de formatos y consistencia
Reportes de errores y correcciones sugeridas
Integraciones y APIs
Conectividad Empresarial
Integración con Servicios de Pago


Stripe Integration:
Procesamiento seguro de pagos para créditos adicionales
Webhooks para confirmación automática de pagos
Gestión de suscripciones y facturación recurrente
Notificaciones por Email:
Sistema de emails automáticos para confirmaciones de pago
Notificaciones de cancelación y reembolsos
Integración con servicios de email (Nodemailer)
APIs Básicas


Vibration API: Para retroalimentación táctil en dispositivos móviles
Supabase APIs: Para todas las operaciones de base de datos
Almacenamiento de Archivos: Gestión básica de logos y archivos de usuario

Gestión de Cuenta y Seguridad (MFA)
El sistema de seguridad de Cronometras incluye Autenticación de Múltiples Factores (MFA), gestión de dispositivos confiables y control avanzado de sesiones para proteger tu cuenta y tus datos profesionales.

¿Qué es MFA (Autenticación de Múltiples Factores)?
Definición y Propósito
La Autenticación de Múltiples Factores (MFA) añade una capa extra de seguridad a tu cuenta. Además de tu contraseña (algo que sabes), necesitarás un código temporal de 6 dígitos generado por una aplicación en tu teléfono móvil (algo que tienes).

Beneficios de Seguridad
🔒 Mayor Seguridad: Protege tu cuenta incluso si alguien obtiene tu contraseña
🚫 Previene Accesos No Autorizados: Nadie puede acceder sin tu dispositivo móvil
✅ Dispositivos Confiables: Marca tus dispositivos para no pedir código cada vez (30 días)
📱 Control Total: Gestiona sesiones activas y dispositivos desde un solo lugar
🔔 Alertas de Seguridad: Notificaciones de intentos de acceso fallidos
📊 Registro de Actividad: Historial completo de accesos a tu cuenta

Configuración Inicial de MFA
Paso 1: Descargar una Aplicación de Autenticación
Aplicaciones Recomendadas
Google Authenticator (iOS/Android):
Aplicación oficial de Google
Interfaz simple y directa
Respaldo en la nube con cuenta Google
Descarga: App Store / Google Play

Microsoft Authenticator (iOS/Android):
Aplicación de Microsoft
Respaldo en la nube
Notificaciones push (opcional)
Descarga: App Store / Google Play

Authy (iOS/Android):
Multi-dispositivo
Respaldo cifrado en la nube
Sincronización entre dispositivos
Descarga: App Store / Google Play

1Password (iOS/Android):
Integrado con gestor de contraseñas
Respaldo automático
Ideal si ya usas 1Password
Descarga: App Store / Google Play

Paso 2: Activar MFA en tu Cuenta
Proceso de Activación
Acceso a Configuración:
Inicia sesión en tu cuenta de Cronometras
Ve a Configuración → Seguridad
Localiza la sección "Autenticación de Múltiples Factores"

Iniciar Configuración:
Haz clic en el botón "Configurar MFA"
Aparecerá un código QR en pantalla
También se mostrará un código secreto alfanumérico

Información de Seguridad:
Guarda el código secreto en un lugar seguro
Este código te permitirá recuperar el acceso si pierdes tu dispositivo
No compartas este código con nadie

Paso 3: Escanear el Código QR
Método 1: Escaneo con Cámara (Recomendado)
Abre tu aplicación de autenticación
Toca el botón + o "Añadir cuenta"
Selecciona "Escanear código QR"
Apunta la cámara al código QR en pantalla
La cuenta se añadirá automáticamente

Método 2: Ingreso Manual
Si no puedes escanear el código QR:
Copia el código secreto que aparece debajo del QR
En tu app de autenticación, selecciona "Ingresar código manualmente"
Pega el código secreto
Ingresa un nombre para la cuenta (ej: "Cronometras - [tu email]")
Guarda la configuración

Paso 4: Verificar y Activar
Verificación del Código TOTP
Tu aplicación mostrará un código de 6 dígitos
El código cambia cada 30 segundos
Ingresa el código actual en la pantalla de verificación de Cronometras
Haz clic en "Verificar y Activar MFA"

Confirmación:
Si el código es correcto, verás un mensaje de confirmación
MFA está ahora activado en tu cuenta
Se te pedirá código en cada inicio de sesión

Códigos de Respaldo:
El sistema generará códigos de respaldo de un solo uso
Guarda estos códigos en un lugar seguro
Úsalos si pierdes acceso a tu dispositivo de autenticación

Uso Diario de MFA
Iniciar Sesión con MFA Activado
Proceso de Inicio de Sesión
Paso 1 - Credenciales Normales:
Ingresa tu email y contraseña como siempre
Haz clic en "Iniciar Sesión"

Paso 2 - Verificación MFA:
Aparecerá una ventana solicitando el código MFA
Abre tu aplicación de autenticación
Localiza la cuenta de Cronometras
Ingresa el código de 6 dígitos que aparece

Paso 3 - Dispositivo Confiable (Opcional):
Marca la casilla "Confiar en este dispositivo por 30 días"
Solo hazlo en tus dispositivos personales
Nunca en computadoras públicas o compartidas

Paso 4 - Acceso Concedido:
Si el código es correcto, accederás a tu cuenta
La sesión quedará registrada en el historial de seguridad

Gestión de Dispositivos Confiables
¿Qué es un Dispositivo Confiable?
Definición: Un dispositivo y navegador específico que has marcado como seguro
Duración: 30 días desde la última verificación MFA
Beneficio: No te pedirá código MFA durante ese período
Seguridad: Solo en ese dispositivo y navegador exacto

Cuándo Marcar como Confiable
✅ Recomendado:
Tu computadora personal de trabajo
Tu laptop personal
Tu tablet personal

❌ Nunca Marcar:
Computadoras públicas (bibliotecas, cibercafés)
Computadoras compartidas (oficinas abiertas)
Dispositivos de otras personas
Navegadores en modo incógnito

Gestión de Dispositivos
Ver Dispositivos Confiables:
Ve a Configuración → Seguridad
Pestaña "Dispositivos Confiables"
Verás una lista con:
Nombre del dispositivo y navegador
Sistema operativo
Fecha de última verificación
Fecha de expiración (30 días)
Ubicación aproximada del último acceso

Revocar Confianza:
Haz clic en "Revocar" junto al dispositivo
La próxima vez que inicies sesión desde ese dispositivo, pedirá código MFA
Útil si perdiste un dispositivo o ya no lo usas

Revocar Todos:
Botón "Revocar Todos los Dispositivos Confiables"
Útil si sospechas que tu cuenta fue comprometida
Requerirá MFA en todos los dispositivos en el próximo inicio de sesión

Control de Sesiones Activas
Sistema de Gestión de Sesiones
Límite de Sesiones Simultáneas
Máximo de Sesiones: 3 sesiones activas simultáneamente
Política de Seguridad: Previene uso no autorizado de la cuenta
Gestión Automática: Si intentas abrir una 4ª sesión, se cerrará la más antigua

Ver Sesiones Activas
Acceso al Panel de Sesiones:
Ve a Configuración → Seguridad
Pestaña "Sesiones Activas"

Información Mostrada por Sesión:
Dispositivo y Navegador: Ej: "Chrome en Windows 10"
Sistema Operativo: Windows, macOS, Linux, iOS, Android
Ubicación Aproximada: Ciudad y país (basado en IP)
Dirección IP: IP pública del dispositivo
Fecha de Inicio: Cuándo se inició la sesión
Última Actividad: Última vez que se usó la sesión
Estado: Activa, Inactiva, o Expirada
Sesión Actual: Marcada claramente para identificarla

Cerrar Sesiones
Cerrar Sesión Específica:
Localiza la sesión en la lista
Haz clic en el botón "Cerrar Sesión"
La sesión se cerrará inmediatamente
El usuario será desconectado de ese dispositivo

Cerrar Todas las Demás Sesiones:
Botón "Cerrar Todas las Demás Sesiones"
Solo tu sesión actual permanecerá activa
Todas las demás se cerrarán inmediatamente
Útil si sospechas acceso no autorizado

Confirmación de Seguridad:
Se solicitará confirmación antes de cerrar sesiones
Se enviará notificación por email de las sesiones cerradas
Se registrará la acción en el log de actividad

Registro de Actividad y Alertas
Sistema de Monitoreo de Seguridad
Registro de Intentos de Acceso
Información Registrada:
Intentos de inicio de sesión exitosos
Intentos de inicio de sesión fallidos
Cambios en configuración de seguridad
Activación/desactivación de MFA
Cambios de contraseña
Dispositivos confiables añadidos/revocados

Datos por Evento:
Fecha y hora exacta
Dirección IP de origen
Ubicación aproximada
Dispositivo y navegador
Resultado (éxito/fallo)
Motivo del fallo (si aplica)

Alertas de Seguridad Automáticas
Alertas por Email
Intentos Fallidos Múltiples:
Se envía alerta después de 3 intentos fallidos consecutivos
Email con detalles del intento (IP, ubicación, hora)
Recomendación de cambiar contraseña si no fuiste tú

Inicio de Sesión desde Nueva Ubicación:
Alerta cuando se detecta acceso desde ubicación no reconocida
Detalles del dispositivo y ubicación
Opción de cerrar sesión si no fuiste tú

Cambios en Configuración de Seguridad:
Notificación cuando se activa/desactiva MFA
Alerta cuando se añade nuevo dispositivo confiable
Confirmación de cambios de contraseña

Configuración de Alertas:
Personaliza qué alertas deseas recibir
Frecuencia de notificaciones
Canales de notificación (email, en-app)

Desactivar MFA
Proceso de Desactivación
Cuándo Desactivar MFA
⚠️ No Recomendado: MFA es una capa crítica de seguridad
Casos Válidos:
Cambio de dispositivo móvil (desactivar y reactivar)
Problemas con la aplicación de autenticación
Pérdida temporal del dispositivo (usar códigos de respaldo primero)

Proceso de Desactivación
Acceso a Configuración:
Ve a Configuración → Seguridad
Sección "Autenticación de Múltiples Factores"

Verificación de Identidad:
Haz clic en "Desactivar MFA"
Se solicitará tu contraseña actual
Se solicitará un código MFA válido (o código de respaldo)

Confirmación:
Confirma que deseas desactivar MFA
Recibirás un email de confirmación
MFA quedará desactivado inmediatamente

Recomendación de Seguridad:
Si desactivas MFA, reactívalo lo antes posible
Considera usar códigos de respaldo en lugar de desactivar
Cambia tu contraseña si sospechas compromiso de seguridad

Códigos de Respaldo
Sistema de Recuperación de Emergencia
¿Qué son los Códigos de Respaldo?
Definición: Códigos de un solo uso para acceder si pierdes tu dispositivo de autenticación
Cantidad: 10 códigos generados automáticamente
Formato: Códigos alfanuméricos de 8 caracteres
Uso: Cada código solo puede usarse una vez

Cuándo Usar Códigos de Respaldo
Pérdida del Dispositivo: Si pierdes tu teléfono con la app de autenticación
Cambio de Dispositivo: Mientras configuras MFA en tu nuevo dispositivo
Problemas con la App: Si la aplicación de autenticación no funciona
Viajes sin Dispositivo: Si viajas sin tu dispositivo habitual

Gestión de Códigos de Respaldo
Ver Códigos de Respaldo:
Ve a Configuración → Seguridad
Sección "Códigos de Respaldo"
Haz clic en "Ver Códigos de Respaldo"
Se solicitará tu contraseña por seguridad

Guardar Códigos:
Descárgalos como archivo de texto
Imprímelos y guárdalos en lugar seguro
Guárdalos en un gestor de contraseñas
NO los guardes en el mismo dispositivo que usas para MFA

Regenerar Códigos:
Opción "Regenerar Códigos de Respaldo"
Los códigos anteriores quedarán inválidos
Se generarán 10 nuevos códigos
Útil si crees que tus códigos fueron comprometidos

Usar un Código de Respaldo:
En la pantalla de verificación MFA, haz clic en "Usar código de respaldo"
Ingresa uno de tus códigos de respaldo
El código se marcará como usado y no podrá reutilizarse
Accederás a tu cuenta normalmente

Mejores Prácticas de Seguridad
Recomendaciones para Máxima Protección
Configuración de Cuenta
✅ Usa una Contraseña Fuerte:
Mínimo 12 caracteres
Combina mayúsculas, minúsculas, números y símbolos
No uses información personal
Usa un gestor de contraseñas

✅ Activa MFA Siempre:
MFA es la mejor protección contra accesos no autorizados
Usa una aplicación de autenticación confiable
Guarda los códigos de respaldo en lugar seguro

✅ Revisa Sesiones Regularmente:
Verifica sesiones activas semanalmente
Cierra sesiones que no reconozcas
Revoca dispositivos confiables que ya no uses

Uso Diario
✅ Marca Dispositivos Confiables Solo en Equipos Personales:
Nunca en computadoras públicas o compartidas
Solo en dispositivos que controlas completamente
Revoca la confianza si vendes o regalas el dispositivo

✅ Cierra Sesión al Terminar:
Especialmente en dispositivos compartidos
Usa "Cerrar Sesión" en lugar de solo cerrar el navegador
Verifica que la sesión se cerró correctamente

✅ Mantén tu Email Seguro:
Tu email es la puerta de entrada a tu cuenta
Activa MFA también en tu cuenta de email
Usa una contraseña diferente para tu email

Monitoreo y Alertas
✅ Revisa Alertas de Seguridad:
Lee todos los emails de alerta de seguridad
Actúa inmediatamente si detectas actividad sospechosa
Reporta accesos no autorizados al soporte

✅ Verifica el Registro de Actividad:
Revisa el log de actividad mensualmente
Busca patrones inusuales de acceso
Verifica que todas las ubicaciones sean reconocidas

✅ Actualiza Información de Contacto:
Mantén tu email actualizado
Configura un email de recuperación alternativo
Verifica que recibes las alertas de seguridad

Recuperación de Cuenta
Qué Hacer si Pierdes Acceso
Pérdida del Dispositivo de Autenticación
Opción 1: Usar Códigos de Respaldo:
Usa uno de tus códigos de respaldo guardados
Accede a tu cuenta normalmente
Ve a Configuración → Seguridad
Desactiva MFA temporalmente
Configura MFA en tu nuevo dispositivo
Reactiva MFA con el nuevo dispositivo

Opción 2: Contactar Soporte:
Si no tienes códigos de respaldo guardados
Contacta a soporte técnico: [email de soporte]
Proporciona información de verificación de identidad
El equipo de soporte te ayudará a recuperar el acceso

Prevención:
Siempre guarda los códigos de respaldo al activar MFA
Considera tener MFA configurado en múltiples dispositivos (si tu app lo permite)
Mantén actualizada tu información de contacto

Sospecha de Cuenta Comprometida
Acciones Inmediatas:
Cambia tu contraseña inmediatamente
Cierra todas las demás sesiones activas
Revoca todos los dispositivos confiables
Revisa el registro de actividad para identificar accesos no autorizados

Verificación de Seguridad:
Verifica que tu email no fue comprometido
Cambia la contraseña de tu email si es necesario
Reactiva MFA si fue desactivado
Genera nuevos códigos de respaldo

Contacto con Soporte:
Reporta el incidente a soporte técnico
Proporciona detalles de la actividad sospechosa
Sigue las recomendaciones del equipo de seguridad

Prevención Futura:
Usa un gestor de contraseñas
Nunca compartas tu contraseña o códigos MFA
Mantén tu software y navegador actualizados
Ten cuidado con correos de phishing

Consejos y Mejores Prácticas
Para Estudios Efectivos
Preparación
Observa el proceso completo antes de cronometrar
Define claramente los elementos de trabajo
Asegúrate de que el operario trabaje a ritmo normal
Durante el Cronometraje
Mantén una posición donde puedas ver claramente
No interrumpas al operario innecesariamente
Registra condiciones anormales en comentarios
Análisis
Revisa tiempos inconsistentes
Verifica que las calificaciones de actividad sean realistas
Documenta cualquier variación del método estándar
Organización de Datos
Nomenclatura Consistente
Usa nombres descriptivos para estudios
Mantén consistencia en descripciones de elementos
Incluye fechas y versiones en nombres de archivo
Respaldos Regulares
Exporta estudios importantes regularmente
Mantén copias de seguridad en ubicaciones separadas
Documenta cambios importantes en estudios

Solución de Problemas
Problemas Comunes
No Puedo Crear Estudios
Verifica que tengas créditos disponibles
Revisa tu conexión a internet
Contacta soporte si el problema persiste
Cronómetro No Responde
Actualiza la página del navegador
Verifica que no haya otras aplicaciones usando el micrófono
Prueba en modo incógnito
Datos No Se Guardan
Verifica tu conexión a internet
No cierres la aplicación durante el guardado
Los datos se guardan automáticamente cada pocos segundos
Contacto y Soporte
Email de Soporte: [email de soporte]
Documentación: Sección "Docs" en la aplicación
Actualizaciones: Revisa el "Changelog" para nuevas características

Este manual se actualiza regularmente. Para la versión más reciente, consulta la sección "Docs" dentro de la aplicación.

# Novedades y Mejoras Recientes

Esta sección detalla las funcionalidades introducidas en las últimas versiones para potenciar la productividad y la precisión de los estudios.

## Gestión de Estudios
- **Selección Masiva**: Opción de seleccionar todos los estudios con barra de progreso y acciones en bloque (borrar, mover, comparar).
- **Auto-guardado y Persistencia**: Las carpetas expandidas mantienen su estado durante toda la sesión.
- **Drag & Drop**: Funcionalidad de arrastrar para mover o copiar estudios en el navegador de carpetas con desplazamiento automático inteligente.

## Herramientas de Cronometraje
- **Monitor de Inconsistencias**: Los tiempos sospechosos (desviación > 20%) se muestran en rojo automáticamente.
- **Control Global de Elementos**: Activa/Desactiva todos los elementos de un ciclo con un solo clic en la pantalla de cronometraje.
- **Protección de Sesión**: Avisos contra recarga accidental de página durante tomas de tiempo o grabaciones.

## Vídeo y Voz
- **Grabación Background**: El vídeo sigue grabando aunque cambies de pantalla o minimices el cronómetro.
- **Audio Independiente**: Vídeos grabados sin sonido para permitir que el micrófono esté siempre disponible para el dictado de descripciones por voz.

## Biblioteca y Métodos
- **Composición Dinámica**: Ajuste de frecuencias directamente en el carrito de la biblioteca.
- **Importación Inteligente**: Elige entre añadir elementos individualmente o generar promedios al importar varios elementos a la vez.

## Seguridad y Organizaciones
- **Solicitudes de Unión**: Nuevo flujo de aprobación para miembros de organizaciones.
- **MFA y Recuperación**: Soporte para autenticación en dos pasos y gestión de códigos de recuperación.
