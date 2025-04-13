// Netlify serverless function for contact form
const { Resend } = require('resend');
const { getClientInfo } = require('./utils/clientInfo');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { nombre, email, mensaje } = data;

    // Validate required fields
    if (!nombre || !email || !mensaje) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Todos los campos son obligatorios"
        })
      };
    }

    // Obtener información del cliente
    const { dispositivo, pais } = getClientInfo(event);

    // Inicializar Resend con la API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Obtener datos de configuración de email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Cronometras App';
    const recipient = process.env.EMAIL_RECIPIENT || 'info@cronometras.com';

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

    console.log("Enviando email a:", recipient);

    try {
      // Enviar correo usando Resend
      const { data: emailData, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient,
        subject: `Nuevo mensaje de contacto de ${nombre}`,
        html: emailHtml,
        reply_to: email,
      });

      if (error) {
        console.error('Error al enviar el email con Resend:', error);
        throw new Error(error.message);
      }

      console.log("Email enviado correctamente:", emailData?.id);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Mensaje enviado correctamente",
          id: emailData?.id || ("demo-" + Date.now())
        })
      };
    } catch (emailError) {
      console.error('Error al enviar el email:', emailError);
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Ha ocurrido un error al enviar el email: " + emailError.message
        })
      };
    }
  } catch (error) {
    console.error("Error al procesar el formulario de contacto:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Ha ocurrido un error al enviar el mensaje: " + error.message
      })
    };
  }
};
