import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { getClientInfo } from '../../utils/clientInfo';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email } = data;
    
    // Validar campos requeridos
    if (!nombre || !email) {
      return new Response(
        JSON.stringify({
          error: "El nombre y el email son obligatorios"
        }),
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const { dispositivo, pais } = getClientInfo(request);

    // Generar URL de confirmación (ejemplo)
    const confirmUrl = `${import.meta.env.PUBLIC_SITE_URL || 'https://cronometras.com'}/confirmar-suscripcion?email=${encodeURIComponent(email)}`;

    // Inicializar Resend con la API key
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // Obtener datos de configuración de email
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = import.meta.env.RESEND_FROM_NAME || 'Cronometras App';
    
    // Crear HTML manualmente para el email
    const emailHtml = `
      <html>
        <head>
          <title>Confirma tu suscripción a Cronometras App</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Cronometras App</h1>
            </div>
            <div style="padding: 30px 20px; text-align: center;">
              <h2 style="margin-top: 0; color: #333;">¡Hola ${nombre}!</h2>
              
              <p style="font-size: 16px; line-height: 1.5; color: #555; margin-bottom: 30px;">
                Gracias por suscribirte a nuestro boletín. Para confirmar tu suscripción y empezar a recibir nuestras novedades, haz clic en el botón de abajo.
              </p>
              
              <div style="margin: 30px 0;">
                <a href="${confirmUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Confirmar suscripción
                </a>
              </div>
              
              <p style="font-size: 14px; color: #777; margin-top: 30px;">
                Si tú no solicitaste esta suscripción, simplemente ignora este mensaje.
              </p>
            </div>
            
            <div style="background-color: #f6f6f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Cronometras App. Todos los derechos reservados.</p>
              <p style="margin: 5px 0;">
                <a href="https://cronometras.com" style="color: #4f46e5;">cronometras.com</a>
              </p>
              <p style="margin: 5px 0; font-size: 11px; color: #999;">
                Enviado desde: ${dispositivo} | País: ${pais}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar correo usando Resend
    const { data: emailData, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: "Confirma tu suscripción a Cronometras App",
      html: emailHtml,
    });

    if (error) {
      console.error('Error al enviar el email con Resend:', error);
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({
        message: "Por favor, revisa tu email para confirmar tu suscripción",
        id: emailData?.id
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al procesar la suscripción:', error);
    return new Response(
      JSON.stringify({
        error: "Ha ocurrido un error al procesar tu suscripción"
      }),
      { status: 500 }
    );
  }
}; 