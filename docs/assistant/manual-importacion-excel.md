# Manual de Importación Visual desde Excel

## Índice
1. [Introducción](#introducción)
2. [Acceso a la Funcionalidad](#acceso-a-la-funcionalidad)
3. [Preparación del Archivo Excel](#preparación-del-archivo-excel)
4. [Flujo de Importación Visual](#flujo-de-importación-visual)
5. [Importación en Lote (Múltiples Archivos)](#importación-en-lote-múltiples-archivos)
6. [Sistema de Plantillas](#sistema-de-plantillas)
7. [Mapeo de Columnas](#mapeo-de-columnas)
8. [Tipos de Elementos Soportados](#tipos-de-elementos-soportados)
9. [Configuración del Estudio](#configuración-del-estudio)
10. [Validación y Errores](#validación-y-errores)

---

## Introducción

La nueva **Importación Visual desde Excel** revoluciona la forma de cargar estudios en Cronometras, permitiéndote **ver e interactuar** con tus datos antes de importarlos. Esta funcionalidad combina la potencia de la migración de datos con una experiencia de usuario intuitiva y visual.

### Nuevas Características Visuales
- 👁️ **Visualización Interactiva**: Ve tus datos de Excel directamente en la pantalla.
- 👆 **Selección "Point & Click"**: Selecciona la fila de encabezados y celdas de metadatos (nombre, fecha) simplemente haciendo clic.
- ⚡ **Vista Previa en Tiempo Real**: Observa cómo quedarán tus datos procesados mientras ajustas la configuración.
- 📚 **Importación en Lote**: Carga decenas de archivos simultáneamente con una sola configuración.

---

## Acceso a la Funcionalidad

### Ubicación
- **Desde**: Biblioteca de Elementos → Botón "Importar desde Excel"
- **Icono**: 📊 FileSpreadsheet
- **Alternativa**: Dashboard → Crear Estudio → Importar desde Excel

### Requisitos Previos
- **Usuario autenticado**: Sesión válida
- **Créditos disponibles**: 1 crédito por estudio importado
- **Archivo Excel**: Formato .xlsx o .xls

---

## Preparación del Archivo Excel

### Estructura Básica
Aunque el importador es flexible, se recomienda una estructura limpia:
- **Fila de Encabezados**: Una fila clara con los nombres de las columnas (Descripción, Tiempo, etc.).
- **Datos**: Filas consecutivas con los elementos del estudio.

**Ejemplo ideal**:
```
Descripción | Tipo | Frecuencia | Tiempo Observado | Actividad
Elemento A  | MP   | 1/1        | 10.5             | 100
Elemento B  | MM   | 1/1        | 35.2             | 100
```

> **Nota**: El importador puede ignorar filas vacías o metadata al principio del archivo gracias al **selector de filas visual**.

---

## Flujo de Importación Visual

El proceso ahora sigue 4 pasos intuitivos: `Subir` → `Visualizar` → `Mapear` → `Confirmar`.

### Paso 1: Carga de Archivos
1. Arrastra tu archivo Excel o haz clic en **"Seleccionar Archivos Excel"**.
2. **Soporte Múltiple**: Puedes seleccionar **uno o varios** archivos a la vez.

### Paso 2: Visualización Interactiva (NUEVO)
En este paso, verás una cuadrícula (Grid) idéntica a tu Excel. Aquí configuras cómo leer el archivo:

#### **1. Definir Fila de Encabezados**
- Observa la cuadrícula y localiza la fila que contiene los títulos de las columnas.
- Haz clic en el **número de fila** a la izquierda.
- **Resultado**: Esa fila se marca en **azul** (Encabezados) y las anteriores en **gris** (Ignoradas). El sistema leerá los datos a partir de la siguiente fila.

#### **2. Captura de Metadatos (Picking Mode)**
Puedes extraer información del estudio directamente de celdas específicas:
- **Nombre del Estudio**: 
    1. Haz clic en el icono de puntero (👆) junto al campo "Nombre del Estudio".
    2. Haz clic en la celda del Excel que contiene el nombre.
    3. El valor se copiará automáticamente y la celda se resaltará en **verde**.
- **Fecha**:
    1. Haz clic en el puntero junto al campo "Fecha".
    2. Selecciona la celda de la fecha.
    3. El sistema reconoce fechas de Excel y textos, resaltando la celda en **naranja**.

### Paso 3: Mapeo de Columnas
Asocia las columnas de tu Excel con los campos de Cronometras.
- El sistema intentará **automapear** basado en los nombres de los encabezados.
- **Vista Previa en Tiempo Real**: En la parte inferior, verás una tabla que se actualiza al instante según tu mapeo. Verifica aquí que los tiempos y descripciones se vean correctos.

### Paso 4: Confirmación
- Revisa el resumen final.
- Si cargaste un solo archivo, verás los detalles finales antes de importar.

---

## Importación en Lote (Múltiples Archivos)

¡Ahorra tiempo cargando múltiples estudios a la vez!

### Cómo Funciona
1. En el **Paso 1**, selecciona varios archivos Excel.
2. Verás un indicador: **"📚 Importación en Lote: X archivos seleccionados"**.
3. Realiza la configuración (Visualización y Mapeo) basándote en el **primer archivo** (archivo maestro).
4. **Importante**: Todos los archivos del lote deben tener la **misma estructura** (mismo número de fila para encabezados y mismas columnas).

### Proceso de Importación
Al confirmar, el sistema iniciará una cola de procesamiento:
- **Barra de Progreso**: Muestra el avance total.
- **Lista de Estado**: Verás archivo por archivo marcarse como ✅ Completado o ❌ Error.
- **Resumen Final**: Al terminar, te dirá cuántos archivos se importaron con éxito.

---

## Sistema de Plantillas

Guarda tu configuración para futuros estudios. Una plantilla almacena:
- Fila de encabezados (skipRows).
- Mapeo de columnas.
- Configuración de unidades y tiempos.

> **Tip**: Si siempre usas el mismo formato de Excel, guarda una plantilla por defecto para saltar directamente a la importación con un solo clic.

---

## Mapeo de Columnas

### Campos Reconocidos
| Campo Cronometras | Identificación Automática (Keywords) |
|-------------------|--------------------------------------|
| **Descripción*** | descripci, description, elemento |
| **Tipo** | tipo, type, class |
| **Frecuencia** | frecuencia, frequency, freq (ej: 1/10) |
| **Tiempo** | tiempo, time, observado |
| **Actividad** | actividad, activity, performance |
| **Suplementos** | suplemento, supplement, % |
| **Comentarios** | comentario, comment, obs |

> *Campo obligatorio.

---

## Tipos de Elementos Soportados

El importador reconoce y convierte automáticamente códigos comunes:

| Código | Tipo en Cronometras |
|--------|---------------------|
| `MP`, `Máquina Parada` | **Manual** (Machine Stopped) |
| `MM`, `Máquina Marcha` | **Máquina en Marcha** (Machine Running) |
| `TM`, `Tiempo Máquina` | **Tiempo Máquina** (Machine Time) |

**Detección de Frecuencia**: Si una columna de frecuencia contiene "1/100", el elemento se configurará automáticamente como **frecuencial**.

---

## Configuración del Estudio
Puedes predefinir valores globales para los estudios importados:
- **Unidad de Tiempo**: ¿Tus datos vienen en segundos, minutos, cmm? Selecciónalo para conversión automática.
- **Factores de Suplementos**: Configura si los valores de tu Excel son porcentajes (15 = 15%) o factores (1.15 = 15%).

---

## Validación y Errores
- **Filas Incompletas**: Si una fila no tiene datos suficientes, se omite automáticamente.
- **Errores en Lote**: Si un archivo del lote falla (ej: estructura diferente), la importación continúa con los demás y te muestra un reporte de error al final.

*Manual actualizado para la versión Visual Importer 2.0*