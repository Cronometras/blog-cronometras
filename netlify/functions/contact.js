// Netlify serverless function for contact form
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
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
        body: JSON.stringify({
          error: "Todos los campos son obligatorios"
        })
      };
    }

    // Here you would normally send an email
    // For now, we'll just return a success response
    console.log("Formulario de contacto recibido:", { nombre, email, mensaje });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Mensaje enviado correctamente",
        id: "demo-" + Date.now()
      })
    };
  } catch (error) {
    console.error("Error al procesar el formulario de contacto:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Ha ocurrido un error al enviar el mensaje"
      })
    };
  }
};
