<?php
// Test script for Resend API (versión simplificada sin logs)

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Resend API Test (Versión Simplificada)</h1>";

// Display configuration
echo "<h2>Configuración</h2>";
echo "<p>API Key: " . substr($resendApiKey, 0, 5) . "..." . substr($resendApiKey, -5) . "</p>";
echo "<p>From Email: " . $resendFromEmail . "</p>";
echo "<p>From Name: " . $resendFromName . "</p>";

// Test sending an email
echo "<h2>Test Email</h2>";

$to = "info@cronometras.com"; // Change this to your email for testing
$subject = "Test Email from Resend API - " . date('Y-m-d H:i:s');
$htmlContent = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>Test Email</h1>
        <p>This is a test email sent from the Resend API.</p>
        <p>Time: " . date('Y-m-d H:i:s') . "</p>
        <p>Server: " . $_SERVER['SERVER_NAME'] . "</p>
    </div>
</body>
</html>
";

try {
    echo "<p>Attempting to send email to: " . $to . "</p>";
    
    $result = sendEmailWithResend($to, $subject, $htmlContent);
    
    echo "<h3>Result</h3>";
    echo "<pre>";
    print_r($result);
    echo "</pre>";
    
    if ($result['success']) {
        echo "<p style='color: green;'>Email sent successfully!</p>";
        echo "<p>El email se ha enviado correctamente. Esto confirma que la API de Resend está funcionando.</p>";
        echo "<p>Los warnings sobre permisos de archivo son normales y no afectan el envío de emails.</p>";
    } else {
        echo "<p style='color: red;'>Failed to send email.</p>";
        
        // Mostrar más detalles del error
        if (isset($result['response'])) {
            $responseData = json_decode($result['response'], true);
            if (json_last_error() === JSON_ERROR_NONE && isset($responseData['message'])) {
                echo "<p style='color: red;'>Error message: " . $responseData['message'] . "</p>";
            } else {
                echo "<p style='color: red;'>Raw response: " . $result['response'] . "</p>";
            }
        }
        
        if (!empty($result['error'])) {
            echo "<p style='color: red;'>cURL error: " . $result['error'] . "</p>";
        }
    }
} catch (Exception $e) {
    echo "<h3>Error</h3>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?>
