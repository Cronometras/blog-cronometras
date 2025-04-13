// Utility function to get client information from request
exports.getClientInfo = function(event) {
  // Get client IP
  const ip = event.headers['x-forwarded-for'] || 
             event.headers['client-ip'] || 
             'Unknown IP';
  
  // Get user agent
  const userAgent = event.headers['user-agent'] || 'Unknown Device';
  
  // Get country from Netlify headers
  const country = event.headers['x-country'] || 'Unknown Country';
  
  // Determine device type based on user agent
  let deviceType = 'Desktop';
  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    deviceType = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceType = 'Tablet';
  }
  
  return {
    dispositivo: `${deviceType} (${userAgent.substring(0, 50)}...)`,
    pais: country,
    ip: ip
  };
};
