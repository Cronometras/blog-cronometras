import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

/**
 * Renderiza un componente de React Email a HTML.
 * Esta función convierte componentes de React Email a HTML para
 * su envío a través de servicios como Resend.
 * 
 * @param component El componente React a renderizar
 * @returns HTML como string
 */
export function renderEmail(component: ReactElement | null | undefined): string {
  if (!component) {
    return '<div>No se pudo generar el contenido del correo electrónico.</div>';
  }
  
  return renderToString(component);
} 