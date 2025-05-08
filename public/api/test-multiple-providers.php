<?php
// Test script for Resend API with multiple email providers

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Resend API Test (Múltiples Proveedores)</h1>";

// Display configuration
echo "<h2>Configuración</h2>";
echo "<p>API Key: " . substr($resendApiKey, 0, 5) . "..." . substr($resendApiKey, -5) . "</p>";
echo "<p>From Email: " . $resendFromEmail . "</p>";
echo "<p>From Name: " . $resendFromName . "</p>";

// Test sending an email to multiple providers
echo "<h2>Test Email a Múltiples Proveedores</h2>";

// Lista de proveedores de email comunes para pruebas
$providers = [
    'Gmail' => isset($_GET['gmail']) ? $_GET['gmail'] : '',
    'Outlook/Hotmail' => isset($_GET['outlook']) ? $_GET['outlook'] : '',
    'Yahoo' => isset($_GET['yahoo']) ? $_GET['yahoo'] : '',
    'Otro' => isset($_GET['other']) ? $_GET['other'] : ''
];

// Formulario para configurar direcciones de email
echo "<form method='get'>";
foreach ($providers as $name => $email) {
    echo "<p><label>{$name}: <input type='email' name='" . strtolower($name) . "' value='" . htmlspecialchars($email) . "' placeholder='email@" . strtolower($name) . ".com'></label></p>";
}
echo "<p><input type='submit' value='Enviar Emails de Prueba'></p>";
echo "</form>";

// Si se ha enviado el formulario, enviar los emails
if ($_SERVER['REQUEST_METHOD'] === 'GET' && (!empty($_GET['gmail']) || !empty($_GET['outlook']) || !empty($_GET['yahoo']) || !empty($_GET['other']))) {
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
    
    echo "<h3>Resultados</h3>";
    echo "<table border='1' cellpadding='5' cellspacing='0'>";
    echo "<tr><th>Proveedor</th><th>Email</th><th>Resultado</th></tr>";
    
    foreach ($providers as $name => $email) {
        if (empty($email)) continue;
        
        try {
            // Enviar email
            $result = sendEmailWithResend($email, $subject, $htmlContent);
            
            echo "<tr>";
            echo "<td>" . htmlspecialchars($name) . "</td>";
            echo "<td>" . htmlspecialchars($email) . "</td>";
            
            if ($result['success']) {
                $responseData = json_decode($result['response'], true);
                $emailId = isset($responseData['id']) ? $responseData['id'] : 'N/A';
                echo "<td style='color: green;'>Enviado correctamente (ID: {$emailId})</td>";
            } else {
                echo "<td style='color: red;'>Error: ";
                if (!empty($result['error'])) {
                    echo htmlspecialchars($result['error']);
                } else {
                    $responseData = json_decode($result['response'], true);
                    if (isset($responseData['message'])) {
                        echo htmlspecialchars($responseData['message']);
                    } else {
                        echo "Desconocido";
                    }
                }
                echo "</td>";
            }
            
            echo "</tr>";
        } catch (Exception $e) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($name) . "</td>";
            echo "<td>" . htmlspecialchars($email) . "</td>";
            echo "<td style='color: red;'>Excepción: " . htmlspecialchars($e->getMessage()) . "</td>";
            echo "</tr>";
        }
    }
    
    echo "</table>";
    
    echo "<h3>Recomendaciones</h3>";
    echo "<ol>";
    echo "<li>Verifica la carpeta de spam/correo no deseado en cada proveedor.</li>";
    echo "<li>Asegúrate de que el dominio 'cronometras.com' esté verificado en Resend.</li>";
    echo "<li>Algunos proveedores pueden tener filtros más estrictos que otros.</li>";
    echo "<li>Si ningún proveedor recibe los emails, verifica la configuración de Resend.</li>";
    echo "</ol>";
}
?>
