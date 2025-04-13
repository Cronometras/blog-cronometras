// Netlify serverless function for information request form
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

    // Get fields regardless of language (ES or EN)
    const nombre = data.nombre || data.name || '';
    const email = data.email || '';
    const empresa = data.empresa || data.company || '';
    const sector = data.sector || ''; // Optional now
    const mensaje = data.mensaje || data.message || '';
    const lang = data.lang || 'es';

    console.log("Datos recibidos:", { nombre, email, empresa, sector, mensaje, lang });

    // Validate required fields - same fields for both languages
    if (!nombre || !email || !empresa) {
      const errorMessage = lang === 'en'
        ? "Name, email and company are required fields"
        : "El nombre, email y empresa son campos obligatorios";

      console.log("Error de validación:", errorMessage);

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: errorMessage
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

    // Títulos y textos según el idioma
    const emailTitle = lang === 'en' ? 'Information request about Cronometras App' : 'Solicitud de información sobre Cronometras App';
    const newRequestText = lang === 'en'
      ? `You have received a new information request about Cronometras App from <strong>${nombre}</strong>.`
      : `Has recibido una nueva solicitud de información sobre Cronometras App de <strong>${nombre}</strong>.`;
    const requestorInfoTitle = lang === 'en' ? 'Requestor Information:' : 'Información del solicitante:';
    const companyInfoTitle = lang === 'en' ? 'Company Information:' : 'Información de la empresa:';
    const additionalMessageTitle = lang === 'en' ? 'Additional Message:' : 'Mensaje adicional:';
    const sentFromText = lang === 'en' ? 'Sent from:' : 'Enviado desde:';
    const countryText = lang === 'en' ? 'Country:' : 'País:';
    const rightsReserved = lang === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.';
    const nameLabel = lang === 'en' ? 'Name:' : 'Nombre:';
    const companyLabel = lang === 'en' ? 'Company:' : 'Empresa:';
    const sectorLabel = lang === 'en' ? 'Sector:' : 'Sector:';

    // Crear HTML manualmente para el email
    const emailHtml = `
      <html>
        <head>
          <title>${emailTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #4f46e5; color: white; padding: 20px;">
              <h1 style="margin: 0; font-size: 24px;">${emailTitle}</h1>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px; line-height: 1.5;">
                ${newRequestText}
              </p>

              <div style="background-color: #f9f9f9; border-radius: 4px; padding: 15px; margin: 15px 0;">
                <h3 style="margin-top: 0; font-size: 18px;">${requestorInfoTitle}</h3>
                <p style="margin: 5px 0;">${nameLabel} ${nombre}</p>
                <p style="margin: 5px 0;">Email: <a href="mailto:${email}" style="color: #4f46e5;">${email}</a></p>

                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 15px 0;" />

                <h3 style="margin-top: 0; font-size: 18px;">${companyInfoTitle}</h3>
                <p style="margin: 5px 0;">${companyLabel} <strong>${empresa}</strong></p>
                ${sector ? `<p style="margin: 5px 0;">${sectorLabel} <strong>${sector}</strong></p>` : ''}

                ${mensaje ? `
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 15px 0;" />
                <h3 style="margin-top: 0; font-size: 18px;">${additionalMessageTitle}</h3>
                <p style="white-space: pre-line;">${mensaje}</p>
                ` : ''}
              </div>

              <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; margin-top: 20px; font-size: 14px; color: #666;">
                <p style="margin: 5px 0;">${sentFromText} ${dispositivo}</p>
                <p style="margin: 5px 0;">${countryText} ${pais}</p>
              </div>
            </div>

            <div style="background-color: #f6f6f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Cronometras App. ${rightsReserved}</p>
              <p style="margin: 5px 0;"><a href="https://cronometras.com" style="color: #4f46e5;">cronometras.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Crear asunto del correo según el idioma
    const subject = lang === 'en'
      ? `Information request from ${nombre} (${empresa})`
      : `Solicitud de información de ${nombre} (${empresa})`;

    console.log("Enviando email a:", recipient);

    try {
      // Enviar correo usando Resend
      const { data: emailData, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient,
        subject: subject,
        html: emailHtml,
        reply_to: email,
      });

      if (error) {
        console.error('Error al enviar el email con Resend:', error);
        throw new Error(error.message);
      }

      const successMessage = lang === 'en' ? "Request sent successfully" : "Solicitud enviada correctamente";
      console.log("Email enviado correctamente:", emailData?.id);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: successMessage,
          id: emailData?.id || ("demo-" + Date.now())
        })
      };
    } catch (emailError) {
      console.error('Error al enviar el email:', emailError);
      const errorMessage = lang === 'en'
        ? `An error occurred while sending the email: ${emailError.message}`
        : `Ha ocurrido un error al enviar el email: ${emailError.message}`;

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: errorMessage
        })
      };
    }
  } catch (error) {
    console.error("Error al procesar la solicitud de información:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Ha ocurrido un error al enviar la solicitud: " + error.message
      })
    };
  }
};
