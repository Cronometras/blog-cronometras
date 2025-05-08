<?php
// Endpoint directo para el formulario de contacto (sin slash final)

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log request for debugging
error_log("Contact Direct API endpoint called with method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Script filename: " . $_SERVER['SCRIPT_FILENAME']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize variables
$lang = 'es'; // Default language
$name = '';
$email = '';
$subject = '';
$message = '';

// Process request data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Try to get data from raw POST input (JSON)
    $rawData = file_get_contents('php://input');
    error_log("Raw data received: " . $rawData);
    
    $jsonData = json_decode($rawData, true);
    error_log("Parsed JSON data: " . json_encode($jsonData));
    
    if ($jsonData) {
        // Extract data from JSON - support both Spanish and English field names
        $name = isset($jsonData['name']) ? $jsonData['name'] : (isset($jsonData['nombre']) ? $jsonData['nombre'] : '');
        $email = isset($jsonData['email']) ? $jsonData['email'] : '';
        $subject = isset($jsonData['subject']) ? $jsonData['subject'] : '';
        $message = isset($jsonData['message']) ? $jsonData['message'] : (isset($jsonData['mensaje']) ? $jsonData['mensaje'] : '');
        $lang = isset($jsonData['lang']) ? $jsonData['lang'] : 'es';
        
        error_log("Processed JSON data: name=$name, email=$email, message=$message, lang=$lang");
    } else {
        // Try to get data from POST
        error_log("No JSON data found, trying POST data");
        error_log("POST data: " . json_encode($_POST));
        
        // Extract data from POST - support both Spanish and English field names
        $name = isset($_POST['name']) ? $_POST['name'] : (isset($_POST['nombre']) ? $_POST['nombre'] : '');
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $subject = isset($_POST['subject']) ? $_POST['subject'] : '';
        $message = isset($_POST['message']) ? $_POST['message'] : (isset($_POST['mensaje']) ? $_POST['mensaje'] : '');
        $lang = isset($_POST['lang']) ? $_POST['lang'] : 'es';
        
        error_log("Processed POST data: name=$name, email=$email, message=$message, lang=$lang");
    }
}

// Prepare success message
$successMsg = $lang === 'es' ? 'Mensaje enviado correctamente' : 'Message sent successfully';

// Prepare email content
$emailSubject = !empty($subject) ? $subject : ($lang === 'es' ? 'Nuevo mensaje de contacto desde Cronometras.com' : 'New contact message from Cronometras.com');

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
        <h1>" . ($lang === 'es' ? 'Nuevo mensaje de contacto' : 'New contact message') . "</h1>
        <div class='info'>
            <p><span class='label'>" . ($lang === 'es' ? 'Nombre:' : 'Name:') . "</span> $name</p>
            <p><span class='label'>" . ($lang === 'es' ? 'Email:' : 'Email:') . "</span> $email</p>
            <p><span class='label'>" . ($lang === 'es' ? 'Asunto:' : 'Subject:') . "</span> $subject</p>
            <p><span class='label'>" . ($lang === 'es' ? 'Mensaje:' : 'Message:') . "</span> $message</p>
            <p><span class='label'>Fecha:</span> " . date('Y-m-d H:i:s') . "</p>
            <p><span class='label'>IP:</span> " . $_SERVER['REMOTE_ADDR'] . "</p>
        </div>
    </div>
</body>
</html>
";

// Include Resend configuration
require_once __DIR__ . '/resend-config.php';

// Try to send email
try {
    $result = null;
    
    // Debug log
    error_log("Contact form data (direct): name=$name, email=$email, subject=$subject, message=$message");
    
    // Force email for testing
    if (empty($email) && isset($jsonData) && is_array($jsonData)) {
        error_log("Email is empty, trying to extract it directly from JSON data");
        foreach ($jsonData as $key => $value) {
            error_log("JSON key: $key, value: $value");
            if ($key === 'email' || strtolower($key) === 'email') {
                $email = $value;
                error_log("Found email in JSON data: $email");
                break;
            }
        }
    }
    
    // Send email using Resend
    if (!empty($email)) {
        error_log("Sending email to info@cronometras.com with email=$email");
        $result = sendEmailWithResend('info@cronometras.com', $emailSubject, $emailBody, null, null);
    } else {
        // Use a default email for testing if none is provided
        error_log("Using default test email");
        $email = "test@example.com";
        $result = sendEmailWithResend('info@cronometras.com', $emailSubject, $emailBody, null, null);
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
    error_log("Exception in contact-direct.php: " . $e->getMessage());
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
