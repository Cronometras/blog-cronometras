# Despliegue en Netlify

Este documento proporciona instrucciones para desplegar este sitio web en Netlify.

## Pasos para el despliegue

### 1. Crear una cuenta en Netlify

Si aún no tienes una cuenta en Netlify, regístrate en [https://app.netlify.com/signup](https://app.netlify.com/signup).

### 2. Conectar con GitHub

1. Inicia sesión en tu cuenta de Netlify.
2. Haz clic en "Add new site" y selecciona "Import an existing project".
3. Elige "GitHub" como proveedor de Git.
4. Autoriza a Netlify para acceder a tus repositorios de GitHub si es necesario.
5. Busca y selecciona el repositorio `blog-cronometras`.

### 3. Configurar opciones de despliegue

La configuración ya está definida en el archivo `netlify.toml`, pero puedes verificar y ajustar lo siguiente:

- **Build command**: `npm run build` (ya configurado)
- **Publish directory**: `dist` (ya configurado)
- **Versión de Node.js**: 18 (ya configurado)

### 4. Configurar variables de entorno (si es necesario)

Si necesitas agregar variables de entorno, como claves de API o configuraciones específicas:

1. Ve a "Site settings" > "Environment variables".
2. Agrega las variables necesarias según las especificadas en `.env.example`.

### 5. Desplegar el sitio

1. Haz clic en "Deploy site".
2. Espera a que se complete el proceso de construcción y despliegue.
3. Una vez completado, Netlify te proporcionará una URL para tu sitio (por ejemplo, `https://blog-cronometras.netlify.app`).

### 6. Configurar dominio personalizado (opcional)

Si deseas usar un dominio personalizado:

1. Ve a "Site settings" > "Domain management".
2. Haz clic en "Add custom domain".
3. Sigue las instrucciones para configurar tu dominio.

## Solución de problemas

Si encuentras problemas durante el despliegue:

1. Revisa los logs de construcción en Netlify para identificar errores.
2. Verifica que todas las dependencias estén correctamente instaladas.
3. Asegúrate de que el archivo `netlify.toml` esté correctamente configurado.
4. Comprueba que las variables de entorno necesarias estén configuradas.

## Actualización del sitio

Para actualizar el sitio después de hacer cambios:

1. Realiza los cambios en tu repositorio local.
2. Haz commit y push a GitHub.
3. Netlify detectará automáticamente los cambios y desplegará la nueva versión del sitio. 