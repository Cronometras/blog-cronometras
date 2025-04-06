import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { getClientInfo } from '../../utils/clientInfo';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email, mensaje } = data;
    
    // Validar campos requeridos
    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({
          error: "Todos los campos son obligatorios"
        }),
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const { dispositivo, pais } = getClientInfo(request);

    // Inicializar Resend con la API key
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // Obtener datos de configuración de email
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = import.meta.env.RESEND_FROM_NAME || 'Cronometras App';
    const recipient = import.meta.env.EMAIL_RECIPIENT || 'info@cronometras.com';
    
    // Crear HTML manualmente para el email
    const emailHtml = `
      <html>
        <head>
          <title>Nuevo mensaje de contacto</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #4f46e5; color: white; padding: 20px;">
              <h1 style="margin: 0; font-size: 24px;">Nuevo mensaje de contacto</h1>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px; line-height: 1.5;">
                Has recibido un nuevo mensaje de contacto de <strong>${nombre}</strong>.
              </p>
              
              <div style="background-color: #f9f9f9; border-radius: 4px; padding: 15px; margin: 15px 0;">
                <p style="margin-bottom: 10px;"><strong>Información del remitente:</strong></p>
                <p style="margin: 5px 0;">Nombre: ${nombre}</p>
                <p style="margin: 5px 0;">Email: <a href="mailto:${email}" style="color: #4f46e5;">${email}</a></p>
                
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 15px 0;" />
                
                <p style="margin-bottom: 10px;"><strong>Mensaje:</strong></p>
                <p style="white-space: pre-line;">${mensaje}</p>
              </div>
              
              <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; margin-top: 20px; font-size: 14px; color: #666;">
                <p style="margin: 5px 0;">Enviado desde: ${dispositivo}</p>
                <p style="margin: 5px 0;">País: ${pais}</p>
              </div>
            </div>
            
            <div style="background-color: #f6f6f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Cronometras App. Todos los derechos reservados.</p>
              <p style="margin: 5px 0;"><a href="https://cronometras.com" style="color: #4f46e5;">cronometras.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar correo usando Resend
    const { data: emailData, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: recipient,
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      html: emailHtml,
      replyTo: email,
    });

    if (error) {
      console.error('Error al enviar el email con Resend:', error);
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({
        message: "Mensaje enviado correctamente",
        id: emailData?.id
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al enviar el formulario de contacto:', error);
    return new Response(
      JSON.stringify({
        error: "Ha ocurrido un error al enviar el mensaje"
      }),
      { status: 500 }
    );
  }
}; 