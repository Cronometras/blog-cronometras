<?php
// Endpoint for information request form without trailing slash

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log request for debugging
error_log("Information Request API endpoint (no slash) called with method: " . $_SERVER['REQUEST_METHOD']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize variables
$lang = 'es'; // Default language
$name = '';
$email = '';
$company = '';
$phone = '';
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
        $company = isset($jsonData['company']) ? $jsonData['company'] : (isset($jsonData['empresa']) ? $jsonData['empresa'] : '');
        $phone = isset($jsonData['phone']) ? $jsonData['phone'] : (isset($jsonData['telefono']) ? $jsonData['telefono'] : '');
        $message = isset($jsonData['message']) ? $jsonData['message'] : (isset($jsonData['mensaje']) ? $jsonData['mensaje'] : '');
        $lang = isset($jsonData['lang']) ? $jsonData['lang'] : 'es';

        error_log("Processed JSON data: name=$name, email=$email, company=$company, phone=$phone, message=$message, lang=$lang");
    } else {
        // Try to get data from POST
        error_log("No JSON data found, trying POST data");
        error_log("POST data: " . json_encode($_POST));

        // Extract data from POST - support both Spanish and English field names
        $name = isset($_POST['name']) ? $_POST['name'] : (isset($_POST['nombre']) ? $_POST['nombre'] : '');
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $company = isset($_POST['company']) ? $_POST['company'] : (isset($_POST['empresa']) ? $_POST['empresa'] : '');
        $phone = isset($_POST['phone']) ? $_POST['phone'] : (isset($_POST['telefono']) ? $_POST['telefono'] : '');
        $message = isset($_POST['message']) ? $_POST['message'] : (isset($_POST['mensaje']) ? $_POST['mensaje'] : '');
        $lang = isset($_POST['lang']) ? $_POST['lang'] : 'es';

        error_log("Processed POST data: name=$name, email=$email, company=$company, phone=$phone, message=$message, lang=$lang");
    }
}

// Prepare success message
$successMsg = $lang === 'es' ? 'Solicitud enviada correctamente' : 'Request sent successfully';

// Prepare email content
$subject = $lang === 'es' ? 'Nueva solicitud de información desde Cronometras.com' : 'New information request from Cronometras.com';

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
        <h1>" . ($lang === 'es' ? 'Nueva solicitud de información' : 'New information request') . "</h1>
        <div class='info'>
            <p><span class='label'>" . ($lang === 'es' ? 'Nombre:' : 'Name:') . "</span> $name</p>
            <p><span class='label'>" . ($lang === 'es' ? 'Email:' : 'Email:') . "</span> $email</p>
            <p><span class='label'>" . ($lang === 'es' ? 'Empresa:' : 'Company:') . "</span> $company</p>
            <p><span class='label'>" . ($lang === 'es' ? 'Teléfono:' : 'Phone:') . "</span> $phone</p>
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
    error_log("Information request form data: name=$name, email=$email, company=$company, phone=$phone, message=$message");

    // Send email using Resend
    if (!empty($email)) {
        $result = sendEmailWithResend('info@cronometras.com', $subject, $emailBody, null, null);
    } else {
        // Try to get email from POST data directly as a fallback
        if (isset($_POST['email']) && !empty($_POST['email'])) {
            $email = $_POST['email'];
            error_log("Using email from POST data: $email");
            $result = sendEmailWithResend('info@cronometras.com', $subject, $emailBody, null, null);
        } else {
            throw new Exception('Email address is empty');
        }
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
    error_log("Exception in information-request.php: " . $e->getMessage());
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
