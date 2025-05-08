<?php
// API endpoint for newsletter subscription

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration
require_once __DIR__ . '/../resend-config.php';

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize variables
$lang = 'es'; // Default language
$email = '';

// Process request data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Try to get data from raw POST input (JSON)
    $rawData = file_get_contents('php://input');
    $jsonData = json_decode($rawData, true);

    if ($jsonData) {
        // Extract data from JSON
        $email = isset($jsonData['email']) ? $jsonData['email'] : '';
        $lang = isset($jsonData['lang']) ? $jsonData['lang'] : 'es';
    } elseif (!empty($_POST)) {
        // Extract data from form POST
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $lang = isset($_POST['lang']) ? $_POST['lang'] : 'es';
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Extract data from GET (for testing)
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    $lang = isset($_GET['lang']) ? $_GET['lang'] : 'es';
}

// Prepare success message
$successMsg = $lang === 'es' ? 'Suscripción realizada correctamente' : 'Subscription successful';

// Try to send email
try {
    $result = null;

    // Validate email format
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Prepare email content
        $subject = $lang === 'es' ? 'Nueva suscripción al newsletter de Cronometras.com' : 'New newsletter subscription from Cronometras.com';

        $emailBody = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                h1 { color: #333; }
                .info { margin-bottom: 20px; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h1>" . ($lang === 'es' ? 'Nueva suscripción al newsletter' : 'New newsletter subscription') . "</h1>
                <div class='info'>
                    <p><span class='label'>" . ($lang === 'es' ? 'Email:' : 'Email:') . "</span> $email</p>
                    <p><span class='label'>Fecha:</span> " . date('Y-m-d H:i:s') . "</p>
                    <p><span class='label'>IP:</span> " . $_SERVER['REMOTE_ADDR'] . "</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // Send email using Resend
        $result = sendEmailWithResend('info@cronometras.com', $subject, $emailBody, null, null);
    } else {
        throw new Exception('Email address is empty or invalid');
    }

    // Check result and return appropriate response
    if ($result && isset($result['success']) && $result['success']) {
        echo json_encode([
            'success' => true,
            'message' => $successMsg,
            'debug' => [
                'emailId' => json_decode($result['response'], true)['id'] ?? null,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        // Log error but still return success to user
        $errorMsg = isset($result['error']) && !empty($result['error']) ? $result['error'] : 'Unknown error';
        $responseData = isset($result['response']) ? json_decode($result['response'], true) : null;
        $apiErrorMsg = isset($responseData['message']) ? $responseData['message'] : 'No API error message';

        // Return success to user but include debug info
        echo json_encode([
            'success' => true, // Still return success to user
            'message' => $successMsg,
            'debug' => [
                'actualSuccess' => false,
                'error' => $errorMsg,
                'apiError' => $apiErrorMsg,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    }
} catch (Exception $e) {
    // Log error but still return success to user
    echo json_encode([
        'success' => true, // Still return success to user
        'message' => $successMsg,
        'debug' => [
            'actualSuccess' => false,
            'exception' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}
?>
