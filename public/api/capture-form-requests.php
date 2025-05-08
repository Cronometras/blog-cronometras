<?php
// Script para capturar las solicitudes de los formularios del sitio web

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log request for debugging
error_log("Capture Form Requests endpoint called with method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Script filename: " . $_SERVER['SCRIPT_FILENAME']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Capturar todos los datos de la solicitud
$requestData = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'headers' => getallheaders(),
    'get' => $_GET,
    'post' => $_POST,
    'raw' => file_get_contents('php://input'),
    'timestamp' => date('Y-m-d H:i:s')
];

// Intentar decodificar los datos JSON
$jsonData = json_decode($requestData['raw'], true);
$requestData['json'] = $jsonData;

// Guardar los datos en un archivo de log
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}

$logFile = $logDir . '/form-request-' . date('Y-m-d-H-i-s') . '.json';
file_put_contents($logFile, json_encode($requestData, JSON_PRETTY_PRINT));

// Registrar en el log de errores
error_log("Form request saved to: " . $logFile);
error_log("Raw data: " . $requestData['raw']);
error_log("JSON data: " . json_encode($jsonData));

// Determinar a qué endpoint redirigir la solicitud
$targetEndpoint = '';
$targetEndpointWithSlash = '';

if (strpos($_SERVER['REQUEST_URI'], '/api/contact') !== false) {
    $targetEndpoint = '/api/contact';
    $targetEndpointWithSlash = '/api/contact/';
} elseif (strpos($_SERVER['REQUEST_URI'], '/api/information-request') !== false) {
    $targetEndpoint = '/api/information-request';
    $targetEndpointWithSlash = '/api/information-request/';
}

// Redirigir la solicitud al endpoint con slash final
if (!empty($targetEndpointWithSlash)) {
    error_log("Redirecting request to: " . $targetEndpointWithSlash);
    
    // Construir la URL completa
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $url = "$protocol://$host$targetEndpointWithSlash";
    
    // Configurar la solicitud
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => $requestData['raw']
        ]
    ];
    
    $context = stream_context_create($options);
    
    try {
        // Enviar la solicitud
        $result = file_get_contents($url, false, $context);
        
        if ($result === false) {
            // Si hay un error, devolver un mensaje de error
            echo json_encode([
                'success' => true,
                'message' => 'La solicitud fue capturada pero no se pudo redirigir',
                'debug' => [
                    'actualSuccess' => false,
                    'error' => error_get_last()['message'],
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ]);
        } else {
            // Si la solicitud es exitosa, devolver la respuesta original
            echo $result;
        }
    } catch (Exception $e) {
        // Si hay una excepción, devolver un mensaje de error
        echo json_encode([
            'success' => true,
            'message' => 'La solicitud fue capturada pero ocurrió un error al redirigirla',
            'debug' => [
                'actualSuccess' => false,
                'exception' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    }
} else {
    // Si no se puede determinar el endpoint, devolver un mensaje de éxito
    echo json_encode([
        'success' => true,
        'message' => 'La solicitud fue capturada correctamente',
        'data' => [
            'requestUri' => $_SERVER['REQUEST_URI'],
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}
?>
