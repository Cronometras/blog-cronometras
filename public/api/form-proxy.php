<?php
// Script proxy para redirigir las solicitudes de formularios a los endpoints correctos

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log request for debugging
error_log("Form Proxy endpoint called with method: " . $_SERVER['REQUEST_METHOD']);
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

$logFile = $logDir . '/form-proxy-' . date('Y-m-d-H-i-s') . '.json';
file_put_contents($logFile, json_encode($requestData, JSON_PRETTY_PRINT));

// Registrar en el log de errores
error_log("Form proxy request saved to: " . $logFile);
error_log("Raw data: " . $requestData['raw']);
error_log("JSON data: " . json_encode($jsonData));

// Determinar a qué endpoint redirigir la solicitud
$targetEndpoint = '';

// Obtener la ruta de la solicitud
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Determinar el endpoint basado en la ruta
if ($path === '/api/form-proxy.php') {
    // Si se llama directamente al proxy, usar el parámetro 'endpoint'
    $targetEndpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
} else {
    // Si se llama a través de una redirección, determinar el endpoint basado en la ruta
    if (strpos($path, '/api/contact') !== false) {
        $targetEndpoint = '/api/contact/';
    } elseif (strpos($path, '/api/information-request') !== false) {
        $targetEndpoint = '/api/information-request/';
    }
}

// Redirigir la solicitud al endpoint correcto
if (!empty($targetEndpoint)) {
    error_log("Redirecting request to: " . $targetEndpoint);
    
    // Construir la URL completa
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $url = "$protocol://$host$targetEndpoint";
    
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
    // Si no se puede determinar el endpoint, devolver un mensaje de error
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo determinar el endpoint',
        'data' => [
            'requestUri' => $_SERVER['REQUEST_URI'],
            'path' => $path,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}
?>
