<?php
// Script para depurar los datos enviados por los formularios del sitio web

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set headers to allow cross-origin requests and specify JSON content type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log request for debugging
error_log("Debug Form Data endpoint called with method: " . $_SERVER['REQUEST_METHOD']);
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

$logFile = $logDir . '/form-data-' . date('Y-m-d-H-i-s') . '.json';
file_put_contents($logFile, json_encode($requestData, JSON_PRETTY_PRINT));

// Registrar en el log de errores
error_log("Form data saved to: " . $logFile);
error_log("Raw data: " . $requestData['raw']);
error_log("JSON data: " . json_encode($jsonData));

// Devolver una respuesta exitosa con los datos recibidos
echo json_encode([
    'success' => true,
    'message' => 'Datos recibidos y guardados correctamente',
    'data' => $requestData,
    'logFile' => $logFile
]);
?>
