# Configuración de Búsqueda con Algolia en Cronometras

Este documento explica cómo configurar y utilizar la funcionalidad de búsqueda con Algolia en el sitio web de Cronometras.

## Requisitos Previos

1. Crear una cuenta en [Algolia](https://www.algolia.com/)
2. Crear una aplicación en Algolia
3. Crear un índice para el blog de Cronometras

## Configuración de Variables de Entorno

1. Copia el archivo `.env.example` a `.env` si aún no lo has hecho
2. Completa las siguientes variables en el archivo `.env`:

```
# Algolia Search
ALGOLIA_APP_ID=tu_app_id
ALGOLIA_ADMIN_API_KEY=tu_admin_api_key
ALGOLIA_SEARCH_API_KEY=tu_search_api_key
ALGOLIA_INDEX_NAME=cronometras_blog

# Variables públicas para el cliente
PUBLIC_ALGOLIA_APP_ID=tu_app_id
PUBLIC_ALGOLIA_SEARCH_API_KEY=tu_search_api_key
PUBLIC_ALGOLIA_INDEX_NAME=cronometras_blog
```

Donde:
- `ALGOLIA_APP_ID`: ID de tu aplicación en Algolia
- `ALGOLIA_ADMIN_API_KEY`: Clave de API de administrador (¡mantén esta clave segura!)
- `ALGOLIA_SEARCH_API_KEY`: Clave de API de búsqueda (puede ser pública)
- `ALGOLIA_INDEX_NAME`: Nombre del índice en Algolia

Las variables con prefijo `PUBLIC_` son accesibles desde el cliente y deben contener solo información que pueda ser pública.

## Generación del Índice

Para indexar los artículos del blog en Algolia, ejecuta el siguiente comando:

```bash
npm run algolia:index
```

Este comando procesará todos los archivos MDX en el directorio `src/content/blog` y los indexará en Algolia.

**Nota**: Debes ejecutar este comando cada vez que añadas o actualices artículos en el blog para mantener el índice actualizado.

## Uso del Buscador

El buscador está integrado en la barra de navegación del sitio. Al hacer clic en el icono de búsqueda, se abrirá un modal con un campo de búsqueda que permite buscar artículos del blog.

### Características del Buscador

- Búsqueda en tiempo real mientras se escribe
- Resaltado de coincidencias en los resultados
- Filtrado por idioma (español o inglés) según la página actual
- Visualización de imagen, título, descripción y categoría en los resultados
- Navegación directa al hacer clic en un resultado

## Personalización

### Estilos

Los estilos del buscador se pueden personalizar en el archivo `src/components/search/SearchModal.astro`. Se utilizan clases de Tailwind CSS para la mayoría de los estilos, y hay algunas personalizaciones adicionales en la sección `<style is:global>`.

### Comportamiento

El comportamiento del buscador se puede personalizar modificando la configuración de Algolia en el script del componente `SearchModal.astro`. Puedes ajustar parámetros como:

- Número de resultados por página (`hitsPerPage`)
- Atributos a buscar
- Formato de visualización de los resultados

## Solución de Problemas

### El buscador no muestra resultados

1. Verifica que las variables de entorno estén configuradas correctamente
2. Asegúrate de haber ejecutado el comando `npm run algolia:index` para generar el índice
3. Comprueba en el dashboard de Algolia que los registros se hayan indexado correctamente
4. Verifica en la consola del navegador si hay errores relacionados con Algolia

### Errores al generar el índice

1. Verifica que las dependencias necesarias estén instaladas (`npm install`)
2. Asegúrate de que la clave de API de administrador tenga permisos suficientes
3. Comprueba que el formato de los archivos MDX sea correcto

## Recursos Adicionales

- [Documentación de Algolia](https://www.algolia.com/doc/)
- [Documentación de Autocomplete.js](https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/)
