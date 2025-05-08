<?php
// Función para registrar solicitudes HTTP
function logRequest($endpoint) {
    // Crear directorio de logs si no existe
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Nombre del archivo de log
    $logFile = $logDir . '/requests.log';
    
    // Obtener datos de la solicitud
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];
    $headers = getallheaders();
    $ip = $_SERVER['REMOTE_ADDR'];
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';
    $timestamp = date('Y-m-d H:i:s');
    
    // Obtener datos del cuerpo de la solicitud
    $rawData = file_get_contents('php://input');
    $jsonData = json_decode($rawData, true);
    
    // Formatear mensaje de log
    $logMessage = "==========================================================\n";
    $logMessage .= "[$timestamp] $method $uri ($endpoint)\n";
    $logMessage .= "IP: $ip\n";
    $logMessage .= "User-Agent: $userAgent\n";
    $logMessage .= "Headers: " . json_encode($headers, JSON_PRETTY_PRINT) . "\n";
    $logMessage .= "Raw Data: $rawData\n";
    $logMessage .= "JSON Data: " . json_encode($jsonData, JSON_PRETTY_PRINT) . "\n";
    $logMessage .= "==========================================================\n\n";
    
    // Escribir en el archivo de log
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    // También escribir en el log de errores de PHP
    error_log("[$endpoint] $method request received from $ip");
    error_log("[$endpoint] Raw data: $rawData");
    
    return $jsonData;
}
?>
