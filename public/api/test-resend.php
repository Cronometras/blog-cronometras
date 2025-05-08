<?php
// Test script for Resend API

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Resend API Test</h1>";

// Verificar si PHP tiene cURL habilitado
echo "<h2>PHP Environment</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>cURL Enabled: " . (function_exists('curl_version') ? 'Yes' : 'No') . "</p>";
if (function_exists('curl_version')) {
    $curlInfo = curl_version();
    echo "<p>cURL Version: " . $curlInfo['version'] . "</p>";
    echo "<p>SSL Version: " . $curlInfo['ssl_version'] . "</p>";
}

// Verificar permisos de escritura
echo "<h2>File Permissions</h2>";
$logFile = __DIR__ . '/resend-log.txt';
$isWritable = is_writable(__DIR__);
echo "<p>Directory Writable: " . ($isWritable ? 'Yes' : 'No') . "</p>";

// Intentar crear archivo de log
try {
    file_put_contents($logFile, "Test log entry: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
    echo "<p>Log File Created: Yes</p>";
    echo "<p>Log File Path: " . $logFile . "</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>Error creating log file: " . $e->getMessage() . "</p>";
}

// Display configuration
echo "<h2>Resend Configuration</h2>";
echo "<p>API Key: " . substr($resendApiKey, 0, 5) . "..." . substr($resendApiKey, -5) . "</p>";
echo "<p>From Email: " . $resendFromEmail . "</p>";
echo "<p>From Name: " . $resendFromName . "</p>";

// Verificar variables de entorno
echo "<h2>Environment Variables</h2>";
echo "<p>RESEND_API_KEY from ENV: " . (getenv('RESEND_API_KEY') ? 'Set' : 'Not Set') . "</p>";
echo "<p>RESEND_FROM_EMAIL from ENV: " . (getenv('RESEND_FROM_EMAIL') ? 'Set' : 'Not Set') . "</p>";
echo "<p>RESEND_FROM_NAME from ENV: " . (getenv('RESEND_FROM_NAME') ? 'Set' : 'Not Set') . "</p>";

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

    // Mostrar contenido del log si existe
    if (file_exists($logFile)) {
        echo "<h3>Log File Content</h3>";
        echo "<pre>" . htmlspecialchars(file_get_contents($logFile)) . "</pre>";
    }

} catch (Exception $e) {
    echo "<h3>Error</h3>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?>
