<?php
// Test script for Resend API with different configurations

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Resend API Test (Configuraciones Alternativas)</h1>";

// Display configuration
echo "<h2>Configuración Actual</h2>";
echo "<p>API Key: " . substr($resendApiKey, 0, 5) . "..." . substr($resendApiKey, -5) . "</p>";
echo "<p>From Email: " . $resendFromEmail . "</p>";
echo "<p>From Name: " . $resendFromName . "</p>";

// Función para enviar email con configuración personalizada
function sendTestEmail($to, $fromEmail, $fromName, $subject, $htmlContent) {
    global $resendApiKey;
    
    // Preparar datos para la API de Resend
    $data = [
        'from' => "$fromName <$fromEmail>",
        'to' => [$to],
        'subject' => $subject,
        'html' => $htmlContent,
        'tags' => [
            ['name' => 'source', 'value' => 'test-config']
        ]
    ];
    
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
    
    return [
        'success' => ($statusCode >= 200 && $statusCode < 300),
        'response' => $response,
        'statusCode' => $statusCode,
        'error' => $curlError,
        'verboseLog' => $verboseLog
    ];
}

// Configuraciones alternativas para probar
$configurations = [
    'default' => [
        'name' => 'Configuración Predeterminada',
        'fromEmail' => $resendFromEmail,
        'fromName' => $resendFromName
    ],
    'noreply' => [
        'name' => 'No-Reply sin nombre',
        'fromEmail' => 'no-reply@cronometras.com',
        'fromName' => ''
    ],
    'info' => [
        'name' => 'Dirección Info',
        'fromEmail' => 'info@cronometras.com',
        'fromName' => 'Cronometras Info'
    ],
    'domain' => [
        'name' => 'Solo Dominio',
        'fromEmail' => 'cronometras@resend.dev',
        'fromName' => 'Cronometras via Resend'
    ]
];

// Formulario para probar diferentes configuraciones
echo "<h2>Probar Diferentes Configuraciones</h2>";
echo "<form method='get'>";
echo "<p><label>Enviar a: <input type='email' name='to' value='" . (isset($_GET['to']) ? htmlspecialchars($_GET['to']) : 'info@cronometras.com') . "' required></label></p>";

echo "<p><label>Configuración: <select name='config'>";
foreach ($configurations as $key => $config) {
    $selected = (isset($_GET['config']) && $_GET['config'] === $key) ? 'selected' : '';
    echo "<option value='$key' $selected>{$config['name']} ({$config['fromEmail']})</option>";
}
echo "</select></label></p>";

echo "<p><input type='submit' value='Enviar Email de Prueba'></p>";
echo "</form>";

// Si se ha enviado el formulario, enviar el email
if (isset($_GET['to']) && !empty($_GET['to'])) {
    $to = $_GET['to'];
    $configKey = isset($_GET['config']) ? $_GET['config'] : 'default';
    
    if (!isset($configurations[$configKey])) {
        $configKey = 'default';
    }
    
    $config = $configurations[$configKey];
    
    echo "<h2>Resultado</h2>";
    echo "<p>Enviando email a: " . htmlspecialchars($to) . "</p>";
    echo "<p>Usando configuración: " . htmlspecialchars($config['name']) . "</p>";
    echo "<p>De: " . htmlspecialchars($config['fromName']) . " &lt;" . htmlspecialchars($config['fromEmail']) . "&gt;</p>";
    
    $subject = "Test Email from Resend API (Config: {$config['name']}) - " . date('Y-m-d H:i:s');
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
            <h1>Test Email (Configuración Alternativa)</h1>
            <p>Este es un email de prueba enviado desde la API de Resend con una configuración alternativa.</p>
            <p><strong>Configuración:</strong> {$config['name']}</p>
            <p><strong>De:</strong> {$config['fromName']} &lt;{$config['fromEmail']}&gt;</p>
            <p><strong>Fecha/Hora:</strong> " . date('Y-m-d H:i:s') . "</p>
            <p><strong>Servidor:</strong> " . $_SERVER['SERVER_NAME'] . "</p>
            <p><strong>IP:</strong> " . $_SERVER['SERVER_ADDR'] . "</p>
        </div>
    </body>
    </html>
    ";
    
    $result = sendTestEmail($to, $config['fromEmail'], $config['fromName'], $subject, $htmlContent);
    
    echo "<h3>Respuesta de la API</h3>";
    echo "<pre>";
    print_r($result);
    echo "</pre>";
    
    if ($result['success']) {
        $responseData = json_decode($result['response'], true);
        $emailId = isset($responseData['id']) ? $responseData['id'] : 'N/A';
        
        echo "<p style='color: green;'>Email enviado correctamente (ID: {$emailId})</p>";
        echo "<p>Puedes verificar el estado del email usando el script <a href='check-email-status.php?email_id={$emailId}'>check-email-status.php</a></p>";
        
        echo "<h3>Recomendaciones</h3>";
        echo "<ol>";
        echo "<li>Espera unos minutos para que el email sea procesado</li>";
        echo "<li>Revisa la carpeta de spam/correo no deseado</li>";
        echo "<li>Verifica el estado del email con el enlace anterior</li>";
        echo "<li>Prueba con diferentes configuraciones para ver cuál funciona mejor</li>";
        echo "</ol>";
    } else {
        echo "<p style='color: red;'>Error al enviar el email</p>";
        
        if (!empty($result['error'])) {
            echo "<p style='color: red;'>Error de cURL: " . $result['error'] . "</p>";
        }
        
        if (isset($result['response'])) {
            $responseData = json_decode($result['response'], true);
            if (isset($responseData['message'])) {
                echo "<p style='color: red;'>Mensaje de error: " . $responseData['message'] . "</p>";
            }
        }
    }
    
    echo "<h3>Información Detallada de cURL</h3>";
    echo "<pre>" . htmlspecialchars($result['verboseLog']) . "</pre>";
    
    echo "<h3>Datos Enviados</h3>";
    echo "<pre>" . htmlspecialchars(json_encode([
        'from' => "{$config['fromName']} <{$config['fromEmail']}>",
        'to' => [$to],
        'subject' => $subject,
        'html' => $htmlContent
    ], JSON_PRETTY_PRINT)) . "</pre>";
}

// Información adicional
echo "<h2>Información Adicional</h2>";
echo "<p>Este script te permite probar diferentes configuraciones de remitente para identificar cuál funciona mejor para la entrega de emails.</p>";
echo "<p>Si los emails no llegan a tu bandeja de entrada, prueba con diferentes configuraciones y verifica el estado de los emails enviados.</p>";
echo "<p>Recomendaciones generales:</p>";
echo "<ol>";
echo "<li>Verifica que el dominio 'cronometras.com' esté verificado en Resend</li>";
echo "<li>Prueba con diferentes direcciones de correo de remitente</li>";
echo "<li>Prueba con diferentes direcciones de correo de destinatario</li>";
echo "<li>Revisa la carpeta de spam/correo no deseado</li>";
echo "</ol>";
?>
