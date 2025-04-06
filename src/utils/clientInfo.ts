import type { Request } from 'astro';

export interface ClientInfo {
  dispositivo: string;
  pais: string;
}

/**
 * Extrae información del cliente a partir de la solicitud HTTP
 */
export function getClientInfo(request: Request): ClientInfo {
  const userAgent = request.headers.get('user-agent') || 'Desconocido';
  const ipAddress = getClientIP(request);
  const country = getCountryFromIP(ipAddress) || 'Desconocido';
  
  // Determinamos el tipo de dispositivo basado en el user-agent
  let deviceType = 'Desconocido';
  
  if (userAgent.match(/Android/i)) {
    deviceType = 'Android';
  } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
    deviceType = 'iOS';
  } else if (userAgent.match(/Windows Phone/i)) {
    deviceType = 'Windows Phone';
  } else if (userAgent.match(/Windows NT/i)) {
    deviceType = 'Windows';
  } else if (userAgent.match(/Macintosh|Mac OS X/i)) {
    deviceType = 'Mac';
  } else if (userAgent.match(/Linux/i)) {
    deviceType = 'Linux';
  }
  
  return {
    dispositivo: `${deviceType} (${userAgent.split(')')[0]})`,
    pais: country
  };
}

/**
 * Obtiene la dirección IP del cliente a partir de la solicitud
 */
function getClientIP(request: Request): string {
  // Intenta obtener la IP desde X-Forwarded-For que suelen agregar los proxies
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // La primera IP en la lista es la del cliente
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  // Como alternativa, extrae la IP de la conexión remota si está disponible
  // Nota: En producción, normalmente se recomienda usar los encabezados de X-Forwarded-For
  return "0.0.0.0"; // IP de ejemplo, en un entorno real se extraería de la conexión
}

/**
 * Obtiene el país a partir de la dirección IP
 * Nota: En un entorno real, se usaría un servicio de geolocalización de IP
 */
function getCountryFromIP(ip: string): string {
  // En un entorno real, aquí se haría una petición a un servicio de geolocalización
  // Para este ejemplo, simplemente devolvemos un país estático
  return "España"; // País de ejemplo
} 