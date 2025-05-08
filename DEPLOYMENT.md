# Instrucciones de Despliegue

Este documento contiene las instrucciones para desplegar el sitio web en tu propio hosting en https://cronometras.com/.

## Requisitos del Servidor

- Servidor web Apache (recomendado) o Nginx
- Soporte para PHP (opcional, solo si planeas añadir funcionalidades dinámicas en el futuro)
- Soporte para .htaccess y mod_rewrite (para las redirecciones y reglas de URL)

## Pasos para el Despliegue

### 1. Preparar el Entorno de Desarrollo

1. Asegúrate de tener Node.js instalado (versión 18 o superior)
2. Instala las dependencias del proyecto:
   ```
   npm install
   ```
   o si usas pnpm:
   ```
   pnpm install
   ```

### 2. Configurar Variables de Entorno

1. Crea un archivo `.env.production` basado en `.env.example`
2. Actualiza las variables con tus propios valores:
   - `RESEND_API_KEY`: Tu clave API de Resend para enviar emails
   - `RESEND_FROM_EMAIL`: Dirección de correo desde la que se enviarán los emails (debe ser no-reply@cronometras.com)
   - `EMAIL_RECIPIENT`: Dirección de correo donde recibirás los mensajes de contacto
   - `GOOGLE_ANALYTICS_ID`: Tu ID de Google Analytics

### 3. Compilar el Sitio

En Windows:
```
.\build.ps1
```

En Linux/Mac:
```
chmod +x build.sh
./build.sh
```

Esto generará una carpeta `dist` con todos los archivos estáticos necesarios para el despliegue.

### 4. Subir los Archivos al Servidor

1. Conecta a tu servidor mediante FTP o SFTP
2. Sube todo el contenido de la carpeta `dist` a la carpeta raíz de tu dominio (public_html, www, htdocs, etc.)
3. Asegúrate de que el archivo `.htaccess` se haya subido correctamente (a veces los archivos que comienzan con punto se ocultan)

### 5. Configurar el Servidor

#### Para Apache:

El archivo `.htaccess` ya contiene todas las reglas necesarias para:
- Redirecciones de URLs
- Compresión de archivos
- Caché de recursos estáticos
- Manejo de rutas SPA

#### Para Nginx:

Si usas Nginx, necesitarás crear una configuración similar a la siguiente:

```nginx
server {
    listen 80;
    server_name cronometras.com;
    root /ruta/a/tu/carpeta/dist;
    index index.html;

    # Compresión gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Caché para recursos estáticos
    location ~* \.(jpg|jpeg|png|webp|gif|ico|css|js|woff|woff2)$ {
        expires 1M;
        add_header Cache-Control "public";
    }

    # Redirección de la raíz a /es/
    location = / {
        return 302 /es/;
    }

    # Redirecciones para páginas comunes
    location = /about {
        return 302 /es/about/;
    }
    location = /blog {
        return 302 /es/blog/;
    }
    location = /features {
        return 302 /es/features/;
    }
    location = /contact {
        return 302 /es/contact/;
    }
    location = /privacy {
        return 302 /es/privacy/;
    }
    location = /terms {
        return 302 /es/terms/;
    }

    # Redirecciones para artículos del blog antiguos
    location ~ ^/balanceo-de-lineas-optimizando-la-eficiencia-en-procesos-de-manufactura {
        return 301 /es/blog/balanceo-de-lineas-optimizando-la-eficiencia-en-procesos-de-manufactura/;
    }
    location ~ ^/calculo-de-saturacion-en-un-estudio-de-tiempos {
        return 301 /es/blog/calculo-de-saturacion-en-un-estudio-de-tiempos/;
    }
    location ~ ^/que-es-el-cronometraje-industrial {
        return 301 /es/blog/que-es-el-cronometraje-industrial/;
    }
    location ~ ^/cuales-son-las-tecnicas-de-cronometraje-industrial {
        return 301 /es/blog/cuales-son-las-tecnicas-de-cronometraje-industrial/;
    }

    # Redirección para lecciones antiguas
    location ~ ^/leccion/(.*) {
        return 301 /es/blog/$1/;
    }

    # Manejo de rutas SPA
    location / {
        try_files $uri $uri/ /es/404/index.html;
    }
}
```

### 6. Verificar el Despliegue

1. Visita https://cronometras.com/ para asegurarte de que el sitio se carga correctamente
2. Prueba las siguientes funcionalidades:
   - Navegación entre páginas
   - Formularios de contacto
   - Cambio de idioma
   - Visualización de artículos del blog

### 7. Configurar SSL/TLS (HTTPS)

Si tu hosting no proporciona SSL automáticamente:

1. Obtén un certificado SSL (Let's Encrypt es gratuito)
2. Configura tu servidor web para usar HTTPS
3. Asegúrate de que todas las URLs en el sitio usen https://

## Solución de Problemas

### Problema: Las redirecciones no funcionan

- Verifica que el archivo `.htaccess` se haya subido correctamente
- Asegúrate de que `mod_rewrite` esté habilitado en tu servidor Apache
- Comprueba los permisos del archivo `.htaccess` (644)

### Problema: Los formularios no envían emails

- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que la API de Resend esté funcionando
- Revisa los logs del servidor para ver si hay errores

### Problema: Recursos no encontrados (404)

- Asegúrate de que todos los archivos se hayan subido correctamente
- Verifica que las rutas en el código sean relativas y no absolutas
- Comprueba que la estructura de carpetas en el servidor coincida con la estructura local

## Mantenimiento

Para actualizar el sitio después de realizar cambios:

1. Realiza los cambios en el código fuente
2. Ejecuta el script de compilación nuevamente
3. Sube los archivos actualizados al servidor

Recuerda hacer copias de seguridad regulares de tu sitio y mantener actualizado el software del servidor.
