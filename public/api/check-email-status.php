<?php
// Script para verificar el estado de los emails enviados a través de Resend

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Verificación de Estado de Emails</h1>";

// Función para verificar el estado de un email
function checkEmailStatus($emailId) {
    global $resendApiKey;
    
    // Inicializar cURL
    $ch = curl_init("https://api.resend.com/emails/$emailId");
    
    // Configurar opciones de cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $resendApiKey,
        'Content-Type: application/json'
    ]);
    
    // Ejecutar solicitud
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => ($statusCode >= 200 && $statusCode < 300),
        'response' => $response,
        'statusCode' => $statusCode,
        'error' => $curlError
    ];
}

// Formulario para verificar el estado de un email
echo "<form method='get'>";
echo "<p><label>ID del Email: <input type='text' name='email_id' value='" . (isset($_GET['email_id']) ? htmlspecialchars($_GET['email_id']) : '') . "' size='40' required></label></p>";
echo "<p><input type='submit' value='Verificar Estado'></p>";
echo "</form>";

// Si se ha enviado el formulario, verificar el estado del email
if (isset($_GET['email_id']) && !empty($_GET['email_id'])) {
    $emailId = $_GET['email_id'];
    
    echo "<h2>Resultado</h2>";
    echo "<p>Verificando estado del email con ID: " . htmlspecialchars($emailId) . "</p>";
    
    $result = checkEmailStatus($emailId);
    
    echo "<pre>";
    print_r($result);
    echo "</pre>";
    
    if ($result['success']) {
        $emailData = json_decode($result['response'], true);
        
        echo "<h3>Detalles del Email</h3>";
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        
        // Mostrar información general
        echo "<tr><th colspan='2'>Información General</th></tr>";
        echo "<tr><td>ID</td><td>" . ($emailData['id'] ?? 'N/A') . "</td></tr>";
        echo "<tr><td>Objeto</td><td>" . ($emailData['object'] ?? 'N/A') . "</td></tr>";
        echo "<tr><td>Creado</td><td>" . ($emailData['created_at'] ? date('Y-m-d H:i:s', strtotime($emailData['created_at'])) : 'N/A') . "</td></tr>";
        
        // Mostrar información del remitente
        echo "<tr><th colspan='2'>Remitente</th></tr>";
        echo "<tr><td>De</td><td>" . ($emailData['from'] ?? 'N/A') . "</td></tr>";
        
        // Mostrar información del destinatario
        echo "<tr><th colspan='2'>Destinatario</th></tr>";
        echo "<tr><td>Para</td><td>" . (isset($emailData['to']) && is_array($emailData['to']) ? implode(', ', $emailData['to']) : 'N/A') . "</td></tr>";
        
        if (isset($emailData['cc']) && !empty($emailData['cc'])) {
            echo "<tr><td>CC</td><td>" . (is_array($emailData['cc']) ? implode(', ', $emailData['cc']) : $emailData['cc']) . "</td></tr>";
        }
        
        if (isset($emailData['bcc']) && !empty($emailData['bcc'])) {
            echo "<tr><td>BCC</td><td>" . (is_array($emailData['bcc']) ? implode(', ', $emailData['bcc']) : $emailData['bcc']) . "</td></tr>";
        }
        
        // Mostrar información del contenido
        echo "<tr><th colspan='2'>Contenido</th></tr>";
        echo "<tr><td>Asunto</td><td>" . ($emailData['subject'] ?? 'N/A') . "</td></tr>";
        
        // Mostrar información de entrega
        if (isset($emailData['last_event']) && !empty($emailData['last_event'])) {
            echo "<tr><th colspan='2'>Estado de Entrega</th></tr>";
            echo "<tr><td>Último Evento</td><td>" . $emailData['last_event'] . "</td></tr>";
        }
        
        echo "</table>";
        
        // Mostrar explicación del estado
        if (isset($emailData['last_event'])) {
            echo "<h3>Explicación del Estado</h3>";
            
            switch ($emailData['last_event']) {
                case 'delivered':
                    echo "<p style='color: green;'>El email ha sido entregado correctamente al servidor de correo del destinatario.</p>";
                    echo "<p>Esto significa que el email ha llegado al servidor de correo del destinatario, pero no garantiza que el usuario lo haya visto o que no esté en la carpeta de spam.</p>";
                    break;
                case 'sent':
                    echo "<p style='color: blue;'>El email ha sido enviado, pero aún no se ha confirmado la entrega.</p>";
                    echo "<p>Esto significa que Resend ha enviado el email, pero aún no ha recibido confirmación de entrega del servidor de correo del destinatario.</p>";
                    break;
                case 'bounced':
                    echo "<p style='color: red;'>El email ha rebotado. Esto significa que no se pudo entregar al destinatario.</p>";
                    echo "<p>Posibles causas:</p>";
                    echo "<ul>";
                    echo "<li>La dirección de correo del destinatario no existe</li>";
                    echo "<li>El servidor de correo del destinatario rechazó el email</li>";
                    echo "<li>El buzón del destinatario está lleno</li>";
                    echo "</ul>";
                    break;
                case 'complained':
                    echo "<p style='color: red;'>El destinatario ha marcado el email como spam.</p>";
                    break;
                case 'opened':
                    echo "<p style='color: green;'>El destinatario ha abierto el email.</p>";
                    break;
                case 'clicked':
                    echo "<p style='color: green;'>El destinatario ha hecho clic en un enlace del email.</p>";
                    break;
                default:
                    echo "<p>Estado desconocido: " . $emailData['last_event'] . "</p>";
            }
        }
        
        // Recomendaciones
        echo "<h3>Recomendaciones</h3>";
        echo "<p>Si el email muestra como 'delivered' pero no lo encuentras en tu bandeja de entrada:</p>";
        echo "<ol>";
        echo "<li>Revisa la carpeta de spam/correo no deseado</li>";
        echo "<li>Verifica que el dominio 'cronometras.com' esté verificado en Resend</li>";
        echo "<li>Añade no-reply@cronometras.com a tu lista de contactos</li>";
        echo "<li>Prueba con otra dirección de correo (Gmail, Outlook, etc.)</li>";
        echo "</ol>";
    } else {
        echo "<p style='color: red;'>Error al verificar el estado del email.</p>";
        
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
}

// Información adicional
echo "<h2>Información Adicional</h2>";
echo "<p>Este script te permite verificar el estado de un email enviado a través de Resend.</p>";
echo "<p>Para usar este script, necesitas el ID del email que se muestra en la respuesta cuando envías un formulario o en los resultados de las pruebas.</p>";
echo "<p>Los estados posibles son:</p>";
echo "<ul>";
echo "<li><strong>delivered</strong>: El email ha sido entregado al servidor de correo del destinatario</li>";
echo "<li><strong>sent</strong>: El email ha sido enviado, pero aún no se ha confirmado la entrega</li>";
echo "<li><strong>bounced</strong>: El email ha rebotado y no se pudo entregar</li>";
echo "<li><strong>complained</strong>: El destinatario ha marcado el email como spam</li>";
echo "<li><strong>opened</strong>: El destinatario ha abierto el email</li>";
echo "<li><strong>clicked</strong>: El destinatario ha hecho clic en un enlace del email</li>";
echo "</ul>";
?>
