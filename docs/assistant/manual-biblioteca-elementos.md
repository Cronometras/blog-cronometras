# Manual de Usuario - Biblioteca de Elementos

## Índice
1. [Introducción](#introducción)
2. [Acceso a la Biblioteca](#acceso-a-la-biblioteca)
3. [Interfaz Principal](#interfaz-principal)
4. [Búsqueda y Filtros](#búsqueda-y-filtros)
5. [Navegación por Estudios](#navegación-por-estudios)
6. [Selección de Elementos](#selección-de-elementos)
7. [Creación de Nuevos Estudios](#creación-de-nuevos-estudios)
8. [Importación desde Excel](#importación-desde-excel)
9. [Funcionalidades Avanzadas](#funcionalidades-avanzadas)

---

## Introducción

La **Biblioteca de Elementos** es una funcionalidad que permite reutilizar elementos de estudios existentes para crear nuevos estudios de manera rápida y eficiente. Esta herramienta facilita el trabajo con elementos estandarizados y mejora la consistencia entre estudios.

### Beneficios Principales
- **Reutilización**: Aprovecha elementos de estudios previos
- **Consistencia**: Mantiene estándares en elementos similares
- **Eficiencia**: Reduce el tiempo de creación de nuevos estudios
- **Colaboración**: Accede a elementos de estudios compartidos

---

## Acceso a la Biblioteca

### Ubicación
La biblioteca se encuentra en el menú principal de la aplicación:
- **Ruta**: Dashboard → Biblioteca de Elementos
- **Icono**: 📚 (BookOpen)

### Requisitos
- Usuario autenticado
- Acceso a al menos un estudio (propio o compartido)

---

## Interfaz Principal

### Diseño Responsivo
La biblioteca se adapta a diferentes dispositivos:

#### **Desktop (Pantallas grandes)**
- Vista completa con panel lateral de elementos seleccionados
- Filtros expandidos
- Búsqueda en tiempo real

#### **Tablet (Pantallas medianas)**
- Panel lateral colapsable
- Navegación optimizada
- Filtros compactos

#### **Mobile (Móviles)**
- Navegación por pestañas
- Vista de estudios / Vista de selección
- Interfaz táctil optimizada

### Componentes Principales

#### Header
- **Título**: "Biblioteca de Elementos"
- **Botón Volver**: Regresa al dashboard
- **Botón Excel**: Importar desde Excel
- **Contador**: Elementos seleccionados

#### Barra de Búsqueda
- Campo de texto para búsqueda general
- Botón de filtros avanzados
- Botón de ordenamiento
- Filtros activos (chips removibles)

#### Lista de Estudios
- Tarjetas expandibles por estudio
- Información del estudio (nombre, empresa, fecha)
- Contador de elementos disponibles
- Lista de elementos dentro de cada estudio

#### Panel de Selección
- Elementos seleccionados organizados por estudio
- Botones para remover elementos individuales
- Botón "Limpiar todo"
- Botón "Crear Estudio"

---

## Búsqueda y Filtros

### Búsqueda Principal
- **Tipo**: Búsqueda semántica en tiempo real
- **Alcance**: Nombres de estudios y descripciones de elementos
- **Tiempo de respuesta**: 300ms de debounce
- **Coincidencias**: Resalta términos encontrados

### Filtros Avanzados

#### **Por Empresa**
- Lista desplegable con todas las empresas disponibles
- Opción "Todas las empresas"
- Filtro por empresa específica

#### **Por Fecha**
- **Fecha desde**: Filtro de fecha inicial
- **Fecha hasta**: Filtro de fecha final
- **Formato**: DD/MM/YYYY
- **Comportamiento**: Rango inclusivo

#### **Por Contenido**
- **Checkbox**: "Solo estudios con elementos"
- **Función**: Oculta estudios vacíos
- **Estado**: Persistente durante la sesión

#### **Ordenamiento**
Opciones disponibles:
- **Por Nombre** (A-Z / Z-A)
- **Por Fecha** (Más reciente / Más antiguo)
- **Por Empresa** (A-Z / Z-A)
- **Por Cantidad de Elementos** (Más / Menos)

### Filtros Activos
- **Visualización**: Chips removibles
- **Interacción**: Click para eliminar filtro específico
- **Contador**: Número total de filtros activos
- **Limpieza**: Botón para remover todos los filtros

---

## Navegación por Estudios

### Vista de Tarjetas

#### **Estado Colapsado**
Información mostrada:
- **Nombre del estudio**
- **Empresa**
- **Fecha de creación**
- **Número total de elementos**
- **Número de elementos seleccionados** (si aplica)
- **Botón expandir/colapsar**

#### **Estado Expandido**
Funcionalidades adicionales:
- **Lista completa de elementos**
- **Barra de búsqueda interna** (para estudios con +5 elementos)
- **Información detallada de cada elemento**
- **Checkboxes de selección**

### Información de Elementos

Para cada elemento se muestra:
- **Número de posición**
- **Descripción completa**
- **Tipo de elemento**:
  - Máquina Parada (MP)
  - Máquina en Marcha (MM)
  - Tiempo Máquina (TM)
- **Tipo de repetición**:
  - Repetitivo
  - Frecuencial
  - Máquina
- **Frecuencia**: (ej. 1x1, 1x150)
- **Tiempo base** (si disponible)
- **Estado de selección** (checkbox + resaltado)

### Comportamiento de Expansión
- **Un estudio a la vez**: Al expandir uno se colapsan los demás
- **Animaciones suaves**: Transiciones de 300ms
- **Estado persistente**: Se mantiene durante la sesión de navegación

---

## Selección de Elementos

### Métodos de Selección

#### **Selección Individual**
- **Acción**: Click en checkbox o área del elemento
- **Feedback visual**: 
  - Checkbox marcado (✓)
  - Fondo coloreado (purple-50)
  - Borde resaltado (purple-200)
- **Contador**: Se actualiza automáticamente

#### **Búsqueda Interna**
- **Disponible en**: Estudios con más de 5 elementos
- **Funcionalidad**: Filtro en tiempo real
- **Alcance**: Descripción, nombre y tipo de elemento
- **Botón limpiar**: X para resetear búsqueda

### Panel de Elementos Seleccionados

#### **Información Mostrada**
- **Origen**: Nombre del estudio fuente
- **Elemento**: Descripción y detalles
- **Acciones**: Botón remover (X)

#### **Organización**
- **Agrupación**: Por estudio de origen
- **Ordenamiento**: Por orden de selección
- **Contador global**: Total de elementos seleccionados

#### **Gestión de Selección**
- **Remover individual**: Click en X junto al elemento
- **Limpiar todo**: Botón para deseleccionar todos
- **Límites**: Sin límite de elementos seleccionados

### Estados Visuales

#### **Elemento No Seleccionado**
- Fondo blanco
- Borde gris claro
- Checkbox vacío (○)
- Hover: Fondo gris muy claro

#### **Elemento Seleccionado**
- Fondo púrpura claro (bg-purple-50)
- Borde púrpura (border-purple-200)
- Checkbox marcado (✓) en púrpura
- Sombra sutil

#### **Estudio con Elementos Seleccionados**
- **Contador destacado**: Número en púrpura
- **Indicador visual**: En el header de la tarjeta
- **Persistencia**: Se mantiene al colapsar/expandir

---

## Creación de Nuevos Estudios

### Requisitos Previos
- **Mínimo**: Al menos 1 elemento seleccionado
- **Créditos**: 1 crédito disponible (consume 1 crédito por estudio)
- **Autenticación**: Usuario válido

### Proceso de Creación

#### **Paso 1: Validación**
El sistema verifica:
- Elementos seleccionados > 0
- Usuario autenticado
- Créditos disponibles

#### **Paso 2: Formulario de Estudio**
Campos requeridos:
- **Nombre del estudio**: Texto libre
- **Empresa**: Texto libre
- **Fecha**: Selector de fecha (por defecto: hoy)

Campos opcionales:
- **Actividad Normal**: Por defecto 100
- **Actividad Óptima**: Por defecto 133 (debe ser > normal)

#### **Paso 3: Procesamiento**
El sistema:
1. **Crea el estudio** con la información básica
2. **Copia los elementos** manteniendo:
   - Descripción original
   - Tipo de elemento
   - Tipo de repetición
   - Frecuencia
   - Tiempos base (si existen)
   - Suplementos (si existen)
3. **Asigna nuevas posiciones** (secuencial desde 1)
4. **Genera nuevos IDs** para evitar conflictos
5. **Consume 1 crédito** del usuario

#### **Paso 4: Navegación**
- **Cierre del modal** de selección
- **Redirección automática** al dashboard
- **Nuevo estudio disponible** para edición

### Manejo de Errores

#### **Errores Comunes**
- **Sin elementos seleccionados**: "Selecciona al menos un elemento"
- **Campos vacíos**: "Completa todos los campos requeridos"
- **Sin créditos**: "No tienes créditos suficientes"
- **Error de conexión**: "Error al crear el estudio, intenta nuevamente"

#### **Estados de Carga**
- **Botón "Creando..."**: Durante el proceso
- **Spinner**: Indicador visual de progreso
- **Deshabilitación**: Previene múltiples envíos

---

## Importación desde Excel

*Ver documentación detallada en: [Manual de Importación desde Excel](./manual-importacion-excel.md)*

### Acceso Rápido
- **Botón**: "Importar desde Excel" en el header
- **Icono**: 📊 (FileSpreadsheet)
- **Modal**: Proceso guiado paso a paso

### Características Principales
- **Plantillas predefinidas**: Para diferentes tipos de estudio
- **Mapeo automático**: Detección inteligente de columnas
- **Vista previa**: Verificación antes de importar
- **Validación**: Errores y advertencias en tiempo real

---

## Funcionalidades Avanzadas

### Sistema de Plantillas
- **Plantillas guardadas**: Para importaciones recurrentes
- **Configuraciones por defecto**: Valores estándar para estudios
- **Plantilla estándar**: Configuración recomendada
- **Plantillas personalizadas**: Creadas por el usuario

### Responsividad Móvil

#### **Navegación por Pestañas**
- **Pestaña 1**: "Biblioteca" - Lista de estudios
- **Pestaña 2**: "Selección" - Elementos seleccionados
- **Indicador**: Contador de elementos en pestaña de selección

#### **Optimizaciones Táctiles**
- **Áreas de toque amplias**: Mínimo 44x44px
- **Gestos intuitivos**: Tap para seleccionar
- **Feedback háptico**: En selecciones (si está disponible)

### Persistencia de Datos
- **Sesión activa**: Selecciones se mantienen al navegar
- **Cierre/apertura**: Se pierden las selecciones
- **Filtros**: Se mantienen durante la sesión
- **Estado de expansión**: Persistente en la sesión

### Rendimiento
- **Búsqueda con debounce**: 300ms para evitar sobrecarga
- **Carga bajo demanda**: Elementos se cargan al expandir
- **Memoización**: Componentes optimizados con React.memo
- **Límite de resultados**: Paginación implícita para grandes volúmenes

### Accesibilidad
- **Navegación por teclado**: Tab, Enter, Escape
- **Lectores de pantalla**: ARIA labels y roles
- **Contraste**: Cumple WCAG 2.1 AA
- **Tamaños de fuente**: Escalables

---

## Casos de Uso Comunes

### 1. Crear Estudio con Elementos Estándar
1. Buscar "operaciones básicas"
2. Expandir estudio relevante
3. Seleccionar elementos comunes
4. Crear nuevo estudio
5. Personalizar según necesidades

### 2. Reutilizar Elementos de Proyecto Anterior
1. Filtrar por empresa específica
2. Ordenar por fecha (más reciente)
3. Revisar estudios del proyecto
4. Seleccionar elementos aplicables
5. Crear estudio base para nuevo proyecto

### 3. Importar Datos desde Sistema Externo
1. Preparar archivo Excel con formato estándar
2. Usar "Importar desde Excel"
3. Seleccionar plantilla apropiada
4. Mapear columnas según datos
5. Revisar vista previa e importar

### 4. Crear Plantilla de Elementos Frecuentes
1. Seleccionar elementos comúnmente usados
2. Crear estudio base
3. Guardar como "Plantilla - [Tipo de Proceso]"
4. Marcar como visible en biblioteca
5. Reutilizar en futuros proyectos

---

## Solución de Problemas

### Problemas Comunes

#### **No aparecen estudios**
- Verificar que tienes estudios creados o compartidos
- Revisar filtros activos (pueden estar ocultando resultados)
- Verificar conexión a internet

#### **Elementos no se seleccionan**
- Asegurar que el estudio esté expandido
- Verificar que el elemento no esté ya seleccionado
- Intentar refrescar la página

#### **Error al crear estudio**
- Verificar que tienes créditos disponibles
- Completar todos los campos requeridos
- Verificar conexión a internet
- Contactar soporte si persiste

#### **Búsqueda no encuentra elementos**
- Usar términos más generales
- Verificar ortografía
- Probar búsqueda por empresa o fecha
- Limpiar filtros activos

### Contacto de Soporte
Para problemas técnicos o dudas adicionales:
- **Email**: soporte@cronometras.com
- **Documentación**: [docs.cronometras.com](https://docs.cronometras.com)
- **FAQ**: [Preguntas Frecuentes](./faq.md)

---

*Última actualización: Enero 2024*
*Versión del manual: 1.0* 