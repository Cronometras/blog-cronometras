<?php
// API endpoint for information request form

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Include Resend configuration and request logger
require_once __DIR__ . '/../resend-config.php';
require_once __DIR__ . '/../request-logger.php';

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log all requests for debugging
error_log("Information Request API endpoint called with method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request headers: " . json_encode(getallheaders()));
error_log("Request URI: " . $_SERVER['REQUEST_URI']);

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
    // Log the request
    $jsonData = logRequest('information-request');

    if ($jsonData) {
        // Extract data from JSON - support both Spanish and English field names
        $name = isset($jsonData['name']) ? $jsonData['name'] : (isset($jsonData['nombre']) ? $jsonData['nombre'] : '');
        $email = isset($jsonData['email']) ? $jsonData['email'] : '';
        $company = isset($jsonData['company']) ? $jsonData['company'] : (isset($jsonData['empresa']) ? $jsonData['empresa'] : '');
        $phone = isset($jsonData['phone']) ? $jsonData['phone'] : (isset($jsonData['telefono']) ? $jsonData['telefono'] : '');
        $message = isset($jsonData['message']) ? $jsonData['message'] : (isset($jsonData['mensaje']) ? $jsonData['mensaje'] : '');
        $lang = isset($jsonData['lang']) ? $jsonData['lang'] : 'es';

        // Log the received data for debugging
        error_log("Information request form data received: " . json_encode($jsonData));
        error_log("Processed data: name=$name, email=$email, company=$company, phone=$phone, message=$message, lang=$lang");
    } elseif (!empty($_POST)) {
        // Extract data from form POST - support both Spanish and English field names
        $name = isset($_POST['name']) ? $_POST['name'] : (isset($_POST['nombre']) ? $_POST['nombre'] : '');
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $company = isset($_POST['company']) ? $_POST['company'] : (isset($_POST['empresa']) ? $_POST['empresa'] : '');
        $phone = isset($_POST['phone']) ? $_POST['phone'] : (isset($_POST['telefono']) ? $_POST['telefono'] : '');
        $message = isset($_POST['message']) ? $_POST['message'] : (isset($_POST['mensaje']) ? $_POST['mensaje'] : '');
        $lang = isset($_POST['lang']) ? $_POST['lang'] : 'es';
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Extract data from GET (for testing)
    $name = isset($_GET['name']) ? $_GET['name'] : '';
    $email = isset($_GET['email']) ? $_GET['email'] : '';
    $company = isset($_GET['company']) ? $_GET['company'] : '';
    $phone = isset($_GET['phone']) ? $_GET['phone'] : '';
    $message = isset($_GET['message']) ? $_GET['message'] : '';
    $lang = isset($_GET['lang']) ? $_GET['lang'] : 'es';
}

// Prepare success message
$successMsg = $lang === 'es' ? 'Solicitud enviada correctamente' : 'Request sent successfully';

// Prepare email content
$subject = $lang === 'es' ? 'Nueva solicitud de información desde Cronometras.com' : 'New information request from Cronometras.com';

// Obtener información del dispositivo y país
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido';
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

// Determinar el tipo de dispositivo basado en el user-agent
$deviceType = 'Desconocido';
if (strpos($userAgent, 'Android') !== false) {
    $deviceType = 'Android';
} elseif (strpos($userAgent, 'iPhone') !== false || strpos($userAgent, 'iPad') !== false || strpos($userAgent, 'iPod') !== false) {
    $deviceType = 'iOS';
} elseif (strpos($userAgent, 'Windows Phone') !== false) {
    $deviceType = 'Windows Phone';
} elseif (strpos($userAgent, 'Windows NT') !== false) {
    $deviceType = 'Windows';
} elseif (strpos($userAgent, 'Macintosh') !== false || strpos($userAgent, 'Mac OS X') !== false) {
    $deviceType = 'Mac';
} elseif (strpos($userAgent, 'Linux') !== false) {
    $deviceType = 'Linux';
}

// Simplificar el user agent para mostrar
$shortUserAgent = substr($userAgent, 0, 50) . (strlen($userAgent) > 50 ? '...' : '');
$dispositivo = "$deviceType ($shortUserAgent)";

// En un entorno real, aquí se haría una petición a un servicio de geolocalización
// Para este ejemplo, simplemente usamos un país estático
$pais = "España";

$emailBody = "
<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<html xmlns=\"http://www.w3.org/1999/xhtml\">
<head>
    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>" . ($lang === 'es' ? 'Nueva solicitud de información' : 'New information request') . "</title>
</head>
<body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;\">
    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"padding: 20px;\">
        <tr>
            <td align=\"center\">
                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\">
                    <!-- HEADER -->
                    <tr>
                        <td align=\"center\" bgcolor=\"#4f46e5\" style=\"padding: 20px; color: white;\">
                            <h1 style=\"margin: 0; font-size: 24px;\">" . ($lang === 'es' ? 'Nueva solicitud de información' : 'New information request') . "</h1>
                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td style=\"padding: 20px;\">
                            <p style=\"font-size: 16px; line-height: 1.5;\">
                                " . ($lang === 'es' ? 'Has recibido una nueva solicitud de información sobre Cronometras App de' : 'You have received a new information request about Cronometras App from') . " <strong>$name</strong>.
                            </p>

                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-bottom: 20px;\">
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'Nombre:' : 'Name:') . "</span> $name</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'Email:' : 'Email:') . "</span> $email</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'Empresa:' : 'Company:') . "</span> $company</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'Teléfono:' : 'Phone:') . "</span> $phone</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'Mensaje:' : 'Message:') . "</span> $message</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">Fecha:</span> " . date('Y-m-d H:i:s') . "</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">IP:</span> $ip</td>
                                </tr>
                            </table>

                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #f6f6f6; padding: 15px; margin-top: 20px; font-size: 12px; color: #666; border-radius: 4px;\">
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'Enviado desde:' : 'Sent from:') . "</span> $dispositivo</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 5px 0;\"><span style=\"font-weight: bold;\">" . ($lang === 'es' ? 'País:' : 'Country:') . "</span> $pais</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td align=\"center\" bgcolor=\"#f6f6f6\" style=\"padding: 15px; text-align: center; font-size: 12px; color: #666;\">
                            <p style=\"margin: 5px 0;\">© " . date('Y') . " Cronometras App. " . ($lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.') . "</p>
                            <p style=\"margin: 5px 0;\"><a href=\"https://cronometras.com\" style=\"color: #4f46e5; text-decoration: none;\">cronometras.com</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";

// Try to send email
try {
    $result = null;

    // Send email using Resend
    if (!empty($email)) {
        $result = sendEmailWithResend('info@cronometras.com', $subject, $emailBody, null, null);
    } else {
        throw new Exception('Email address is empty');
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
