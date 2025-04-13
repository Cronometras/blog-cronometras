// Netlify serverless function for information request form
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
        body: JSON.stringify({
          error: errorMessage
        })
      };
    }

    // Here you would normally send an email
    // For now, we'll just return a success response
    const successMessage = lang === 'en' ? "Request sent successfully" : "Solicitud enviada correctamente";
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: successMessage,
        id: "demo-" + Date.now()
      })
    };
  } catch (error) {
    console.error("Error al procesar la solicitud de información:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Ha ocurrido un error al enviar la solicitud"
      })
    };
  }
};
