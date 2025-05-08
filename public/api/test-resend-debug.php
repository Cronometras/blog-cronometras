<?php
// Test script for Resend API with detailed debugging

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Resend API Test (Depuración Detallada)</h1>";

// Display configuration
echo "<h2>Configuración</h2>";
echo "<p>API Key: " . substr($resendApiKey, 0, 5) . "..." . substr($resendApiKey, -5) . "</p>";
echo "<p>From Email: " . $resendFromEmail . "</p>";
echo "<p>From Name: " . $resendFromName . "</p>";

// Test sending an email
echo "<h2>Test Email</h2>";

// Opciones de destinatario
$to = isset($_GET['to']) ? $_GET['to'] : "info@cronometras.com";
$cc = isset($_GET['cc']) ? $_GET['cc'] : "";
$bcc = isset($_GET['bcc']) ? $_GET['bcc'] : "";

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
        <p>IP: " . $_SERVER['SERVER_ADDR'] . "</p>
        <p>User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "</p>
    </div>
</body>
</html>
";

// Formulario para enviar a diferentes direcciones
echo "<form method='get'>";
echo "<p><label>Enviar a: <input type='email' name='to' value='" . htmlspecialchars($to) . "' required></label></p>";
echo "<p><label>CC: <input type='email' name='cc' value='" . htmlspecialchars($cc) . "'></label></p>";
echo "<p><label>BCC: <input type='email' name='bcc' value='" . htmlspecialchars($bcc) . "'></label></p>";
echo "<p><input type='submit' value='Enviar Email de Prueba'></p>";
echo "</form>";

// Si se ha enviado el formulario, enviar el email
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_GET['to'])) {
    try {
        echo "<p>Attempting to send email to: " . htmlspecialchars($to) . "</p>";
        if (!empty($cc)) echo "<p>CC: " . htmlspecialchars($cc) . "</p>";
        if (!empty($bcc)) echo "<p>BCC: " . htmlspecialchars($bcc) . "</p>";
        
        // Preparar datos para la API de Resend
        $data = [
            'from' => "$resendFromName <$resendFromEmail>",
            'to' => [$to],
            'subject' => $subject,
            'html' => $htmlContent
        ];
        
        // Añadir CC y BCC si se han proporcionado
        if (!empty($cc)) $data['cc'] = [$cc];
        if (!empty($bcc)) $data['bcc'] = [$bcc];
        
        // Inicializar cURL
        $ch = curl_init('https://api.resend.com/emails');
        
        // Configurar opciones de cURL
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $resendApiKey,
            'Content-Type: application/json'
        ]);
        
        // Habilitar información detallada
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        $verbose = fopen('php://temp', 'w+');
        curl_setopt($ch, CURLOPT_STDERR, $verbose);
        
        // Ejecutar solicitud
        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        
        // Obtener información detallada
        rewind($verbose);
        $verboseLog = stream_get_contents($verbose);
        
        curl_close($ch);
        
        echo "<h3>Result</h3>";
        echo "<pre>";
        print_r([
            'success' => ($statusCode >= 200 && $statusCode < 300),
            'response' => $response,
            'statusCode' => $statusCode,
            'error' => $curlError
        ]);
        echo "</pre>";
        
        if ($statusCode >= 200 && $statusCode < 300) {
            echo "<p style='color: green;'>Email sent successfully!</p>";
            
            // Mostrar ID del email
            $responseData = json_decode($response, true);
            if (isset($responseData['id'])) {
                echo "<p>Email ID: " . $responseData['id'] . "</p>";
                echo "<p>Puedes verificar el estado del email en el panel de Resend con este ID.</p>";
            }
            
            echo "<h3>Recomendaciones si no recibes el email:</h3>";
            echo "<ol>";
            echo "<li>Verifica la carpeta de spam/correo no deseado.</li>";
            echo "<li>Asegúrate de que el dominio 'cronometras.com' esté verificado en Resend.</li>";
            echo "<li>Verifica que la dirección de correo 'no-reply@cronometras.com' esté configurada correctamente.</li>";
            echo "<li>Prueba con otra dirección de correo (Gmail, Outlook, etc.).</li>";
            echo "</ol>";
        } else {
            echo "<p style='color: red;'>Failed to send email.</p>";
            
            // Mostrar más detalles del error
            if (!empty($response)) {
                $responseData = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($responseData['message'])) {
                    echo "<p style='color: red;'>Error message: " . $responseData['message'] . "</p>";
                } else {
                    echo "<p style='color: red;'>Raw response: " . $response . "</p>";
                }
            }
            
            if (!empty($curlError)) {
                echo "<p style='color: red;'>cURL error: " . $curlError . "</p>";
            }
        }
        
        // Mostrar información detallada de cURL
        echo "<h3>cURL Verbose Log</h3>";
        echo "<pre>" . htmlspecialchars($verboseLog) . "</pre>";
        
        // Mostrar datos enviados
        echo "<h3>Data Sent</h3>";
        echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT)) . "</pre>";
        
    } catch (Exception $e) {
        echo "<h3>Error</h3>";
        echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
    }
}
?>
