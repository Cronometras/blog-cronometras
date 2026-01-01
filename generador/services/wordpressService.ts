
import type { WordPressCredentials, MediaUploadResponse, PostCreateResponse } from '../types';

function base64toBlob(base64Data: string, contentType: string = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64Data);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}

async function handleWordPressError(response: Response, defaultErrorMessage: string): Promise<never> {
    const errorData = await response.json().catch(() => ({ message: 'No se pudo leer la respuesta del error del servidor.', code: '' }));
    
    let detailedMessage = `${defaultErrorMessage}\n\nTu servidor de WordPress respondió con un error ${response.status} (${response.statusText}).`;
    
    if (errorData.message) {
        detailedMessage += `\nMensaje del servidor: "${errorData.message}"`;
    }

    if (errorData.code === 'rest_upload_unknown_error' || (errorData.message && errorData.message.includes('could not be moved'))) {
        detailedMessage += `\n\nEste error específico casi siempre significa que hay un problema de permisos en la carpeta 'wp-content/uploads' de tu servidor. Por favor, contacta a tu proveedor de hosting y asegúrate de que la carpeta tenga los permisos correctos (generalmente 755).`;
    } else if (response.status === 500) {
        detailedMessage += `\n\nUn error '500 Internal Server Error' generalmente indica un problema en tu servidor de WordPress, no en esta aplicación. Las causas comunes son:
1.  **Permisos de archivo/carpeta incorrectos.**
2.  **Conflicto de plugins:** Un plugin de seguridad o de optimización de imágenes podría estar bloqueando la acción.
3.  **Límites del servidor:** Podrías estar excediendo el límite de memoria de PHP.
Revisa los registros de errores de tu servidor para más detalles.`;
    } else if (response.status === 401) {
        detailedMessage += `\n\nError de Autenticación: Las credenciales son incorrectas. Verifica que tu nombre de usuario y tu contraseña de aplicación son correctos y no tienen espacios.`;
    } else if (response.status === 403) {
        detailedMessage += `\n\nError de Permisos: Tus credenciales son correctas, pero el usuario no tiene los permisos necesarios para realizar esta acción (ej. 'edit_posts' o 'upload_files').`;
    }

    throw new Error(detailedMessage);
}


export async function uploadImage(credentials: WordPressCredentials, imageBase64: string, title: string): Promise<MediaUploadResponse> {
    const { siteUrl, username, applicationPassword } = credentials;
    const endpoint = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/media`;

    const imageBlob = base64toBlob(imageBase64);
    const formData = new FormData();
    formData.append('file', imageBlob, `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`);
    formData.append('title', title);
    formData.append('alt_text', title);
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(`${username}:${applicationPassword}`)}`,
        },
        body: formData,
    });

    if (!response.ok) {
        await handleWordPressError(response, 'Error al subir la imagen.');
    }

    return await response.json() as MediaUploadResponse;
}

export async function publishPost(credentials: WordPressCredentials, title: string, content: string, featuredMediaId: number | null): Promise<PostCreateResponse> {
    const { siteUrl, username, applicationPassword } = credentials;
    const endpoint = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
    
    const postData: {
      title: string;
      content: string;
      status: 'publish';
      featured_media?: number;
    } = {
        title,
        content,
        status: 'publish',
    };

    if (featuredMediaId) {
        postData.featured_media = featuredMediaId;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${username}:${applicationPassword}`)}`,
        },
        body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
        await handleWordPressError(response, 'Error al publicar el artículo.');
    }

    return await response.json() as PostCreateResponse;
}