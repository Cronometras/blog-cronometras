<?php
// Script para depurar las rutas de API

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Depuración de Rutas de API</h1>";

// Obtener información del servidor
$serverInfo = [
    'SERVER_NAME' => $_SERVER['SERVER_NAME'],
    'REQUEST_URI' => $_SERVER['REQUEST_URI'],
    'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'],
    'DOCUMENT_ROOT' => $_SERVER['DOCUMENT_ROOT'],
    'PHP_SELF' => $_SERVER['PHP_SELF'],
    'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'],
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
    'QUERY_STRING' => $_SERVER['QUERY_STRING'] ?? '',
    'HTTP_HOST' => $_SERVER['HTTP_HOST'],
    'HTTPS' => isset($_SERVER['HTTPS']) ? $_SERVER['HTTPS'] : 'off',
    'SERVER_PORT' => $_SERVER['SERVER_PORT'],
    'SERVER_PROTOCOL' => $_SERVER['SERVER_PROTOCOL'],
    'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'],
    'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'],
    'HTTP_USER_AGENT' => $_SERVER['HTTP_USER_AGENT'] ?? '',
];

// Mostrar información del servidor
echo "<h2>Información del Servidor</h2>";
echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Variable</th><th>Valor</th></tr>";
foreach ($serverInfo as $key => $value) {
    echo "<tr><td>$key</td><td>$value</td></tr>";
}
echo "</table>";

// Verificar rutas de API
$apiRoutes = [
    '/api/contact',
    '/api/contact/',
    '/api/information-request',
    '/api/information-request/',
    '/api/newsletter',
    '/api/newsletter/',
];

echo "<h2>Verificación de Rutas de API</h2>";
echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Ruta</th><th>Método</th><th>Estado</th><th>Archivo</th></tr>";

foreach ($apiRoutes as $route) {
    $filePath = $_SERVER['DOCUMENT_ROOT'] . $route;
    
    // Verificar si es un directorio
    if (is_dir($filePath)) {
        $indexFile = $filePath . '/index.php';
        $fileExists = file_exists($indexFile);
        $status = $fileExists ? 'Disponible' : 'No disponible';
        $file = $fileExists ? $indexFile : 'N/A';
    } else {
        // Verificar si es un archivo PHP
        $phpFile = $filePath . '.php';
        $fileExists = file_exists($phpFile);
        $status = $fileExists ? 'Disponible' : 'No disponible';
        $file = $fileExists ? $phpFile : 'N/A';
    }
    
    echo "<tr>";
    echo "<td>$route</td>";
    echo "<td>POST</td>";
    echo "<td>" . ($fileExists ? "<span style='color: green;'>$status</span>" : "<span style='color: red;'>$status</span>") . "</td>";
    echo "<td>" . ($fileExists ? $file : "<span style='color: red;'>$file</span>") . "</td>";
    echo "</tr>";
}

echo "</table>";

// Probar rutas de API
echo "<h2>Prueba de Rutas de API</h2>";
echo "<p>Selecciona una ruta para probar:</p>";

echo "<form method='post' action=''>";
echo "<select name='route'>";
foreach ($apiRoutes as $route) {
    echo "<option value='$route'>$route</option>";
}
echo "</select>";
echo "<input type='submit' value='Probar Ruta'>";
echo "</form>";

// Si se ha enviado el formulario, probar la ruta
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['route'])) {
    $route = $_POST['route'];
    
    echo "<h3>Resultado para la ruta: $route</h3>";
    
    // Construir la URL completa
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $url = "$protocol://$host$route";
    
    echo "<p>URL: $url</p>";
    
    // Datos de prueba
    $testData = [
        'name' => 'Usuario de Prueba',
        'nombre' => 'Usuario de Prueba (ES)',
        'email' => 'test@example.com',
        'message' => 'Este es un mensaje de prueba',
        'mensaje' => 'Este es un mensaje de prueba (ES)',
        'company' => 'Empresa de Prueba',
        'empresa' => 'Empresa de Prueba (ES)',
        'phone' => '123456789',
        'telefono' => '123456789 (ES)',
        'lang' => 'es'
    ];
    
    // Enviar solicitud POST
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($testData)
        ]
    ];
    
    $context = stream_context_create($options);
    
    try {
        $result = file_get_contents($url, false, $context);
        
        if ($result === false) {
            echo "<p style='color: red;'>Error al enviar la solicitud</p>";
            echo "<p>Error: " . error_get_last()['message'] . "</p>";
        } else {
            echo "<p style='color: green;'>Solicitud enviada correctamente</p>";
            echo "<h4>Respuesta:</h4>";
            echo "<pre>" . htmlspecialchars($result) . "</pre>";
            
            // Analizar la respuesta JSON
            $responseData = json_decode($result, true);
            if ($responseData) {
                echo "<h4>Datos de la respuesta:</h4>";
                echo "<pre>";
                print_r($responseData);
                echo "</pre>";
            }
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>Excepción: " . $e->getMessage() . "</p>";
    }
}

// Verificar archivos de configuración
echo "<h2>Archivos de Configuración</h2>";
$configFiles = [
    '/api/resend-config.php',
    '/.env',
];

echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Archivo</th><th>Estado</th><th>Tamaño</th><th>Última modificación</th></tr>";

foreach ($configFiles as $file) {
    $filePath = $_SERVER['DOCUMENT_ROOT'] . $file;
    $fileExists = file_exists($filePath);
    $fileSize = $fileExists ? filesize($filePath) : 'N/A';
    $fileModified = $fileExists ? date("Y-m-d H:i:s", filemtime($filePath)) : 'N/A';
    
    echo "<tr>";
    echo "<td>$file</td>";
    echo "<td>" . ($fileExists ? "<span style='color: green;'>Disponible</span>" : "<span style='color: red;'>No disponible</span>") . "</td>";
    echo "<td>" . ($fileExists ? $fileSize . " bytes" : "N/A") . "</td>";
    echo "<td>" . ($fileExists ? $fileModified : "N/A") . "</td>";
    echo "</tr>";
}

echo "</table>";

// Información adicional
echo "<h2>Información Adicional</h2>";
echo "<p>Este script te ayuda a depurar las rutas de API y verificar que los endpoints están correctamente configurados.</p>";
echo "<p>Si los formularios del sitio web no funcionan pero los scripts de prueba sí, puede haber un problema con las rutas o con la forma en que los formularios envían los datos.</p>";
echo "<p>Recomendaciones:</p>";
echo "<ol>";
echo "<li>Verifica que las rutas de API estén correctamente configuradas</li>";
echo "<li>Asegúrate de que los archivos de configuración estén presentes y sean accesibles</li>";
echo "<li>Comprueba los logs del servidor para ver si hay errores</li>";
echo "<li>Verifica que los formularios estén enviando los datos a las rutas correctas</li>";
echo "</ol>";
?>
