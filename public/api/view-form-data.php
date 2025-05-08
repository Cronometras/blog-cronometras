<?php
// Script para ver los datos de los formularios guardados

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Datos de Formularios</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .card {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .card-header {
            background-color: #eee;
            padding: 10px;
            margin: -15px -15px 15px;
            border-bottom: 1px solid #ddd;
            border-radius: 4px 4px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            font-size: 14px;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .btn-danger {
            background-color: #e74c3c;
        }
        .btn-danger:hover {
            background-color: #c0392b;
        }
        .no-data {
            padding: 20px;
            text-align: center;
            background-color: #f5f5f5;
            border-radius: 4px;
        }
        .highlight {
            background-color: #ffffcc;
            padding: 2px 4px;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>Datos de Formularios</h1>
        
        <div class='card'>
            <div class='card-header'>
                <h2 style='margin: 0;'>Archivos de Datos</h2>
                <div>
                    <a href='debug-form-data.php' class='btn' target='_blank'>Endpoint de Depuración</a>
                    <a href='?refresh=true' class='btn'>Actualizar</a>
                    <a href='?clear=true' class='btn btn-danger' onclick='return confirm(\"¿Estás seguro de que quieres eliminar todos los archivos de datos?\")'>Limpiar</a>
                </div>
            </div>";

// Verificar si se debe limpiar los archivos
if (isset($_GET['clear']) && $_GET['clear'] === 'true') {
    $logDir = __DIR__ . '/logs';
    if (is_dir($logDir)) {
        $files = glob($logDir . '/form-data-*.json');
        foreach ($files as $file) {
            unlink($file);
        }
        echo "<p>Todos los archivos de datos han sido eliminados.</p>";
    }
}

// Obtener los archivos de datos
$logDir = __DIR__ . '/logs';
$files = [];

if (is_dir($logDir)) {
    $files = glob($logDir . '/form-data-*.json');
    rsort($files); // Ordenar por fecha (más reciente primero)
}

if (empty($files)) {
    echo "<div class='no-data'>
        <p>No hay archivos de datos disponibles.</p>
        <p>Para generar datos, envía un formulario a <code>debug-form-data.php</code>.</p>
    </div>";
} else {
    // Mostrar los archivos
    foreach ($files as $file) {
        $filename = basename($file);
        $timestamp = substr($filename, 10, 19); // Extraer la fecha del nombre del archivo
        $timestamp = str_replace('-', ':', $timestamp, $count);
        if ($count > 2) {
            $timestamp = substr_replace($timestamp, ' ', 10, 1);
        }
        
        $data = json_decode(file_get_contents($file), true);
        
        echo "<div class='card'>";
        echo "<div class='card-header'>";
        echo "<h3 style='margin: 0;'>$timestamp</h3>";
        echo "<div><a href='?delete=$filename' class='btn btn-danger btn-sm'>Eliminar</a></div>";
        echo "</div>";
        
        // Mostrar método y URI
        echo "<p><strong>Método:</strong> {$data['method']}</p>";
        echo "<p><strong>URI:</strong> {$data['uri']}</p>";
        
        // Mostrar datos JSON
        if (isset($data['json']) && !empty($data['json'])) {
            echo "<h4>Datos JSON</h4>";
            echo "<pre>" . htmlspecialchars(json_encode($data['json'], JSON_PRETTY_PRINT)) . "</pre>";
            
            // Destacar campos importantes
            echo "<h4>Campos Importantes</h4>";
            echo "<ul>";
            
            // Nombre
            $name = isset($data['json']['name']) ? $data['json']['name'] : (isset($data['json']['nombre']) ? $data['json']['nombre'] : 'No encontrado');
            echo "<li><strong>Nombre:</strong> <span class='highlight'>$name</span></li>";
            
            // Email
            $email = isset($data['json']['email']) ? $data['json']['email'] : 'No encontrado';
            echo "<li><strong>Email:</strong> <span class='highlight'>$email</span></li>";
            
            // Mensaje
            $message = isset($data['json']['message']) ? $data['json']['message'] : (isset($data['json']['mensaje']) ? $data['json']['mensaje'] : 'No encontrado');
            echo "<li><strong>Mensaje:</strong> <span class='highlight'>$message</span></li>";
            
            // Empresa (si existe)
            if (isset($data['json']['company']) || isset($data['json']['empresa'])) {
                $company = isset($data['json']['company']) ? $data['json']['company'] : (isset($data['json']['empresa']) ? $data['json']['empresa'] : 'No encontrado');
                echo "<li><strong>Empresa:</strong> <span class='highlight'>$company</span></li>";
            }
            
            // Teléfono (si existe)
            if (isset($data['json']['phone']) || isset($data['json']['telefono'])) {
                $phone = isset($data['json']['phone']) ? $data['json']['phone'] : (isset($data['json']['telefono']) ? $data['json']['telefono'] : 'No encontrado');
                echo "<li><strong>Teléfono:</strong> <span class='highlight'>$phone</span></li>";
            }
            
            echo "</ul>";
        } else {
            echo "<p>No se encontraron datos JSON.</p>";
        }
        
        // Mostrar datos POST
        if (isset($data['post']) && !empty($data['post'])) {
            echo "<h4>Datos POST</h4>";
            echo "<pre>" . htmlspecialchars(json_encode($data['post'], JSON_PRETTY_PRINT)) . "</pre>";
        }
        
        // Mostrar datos RAW
        if (isset($data['raw']) && !empty($data['raw'])) {
            echo "<h4>Datos RAW</h4>";
            echo "<pre>" . htmlspecialchars($data['raw']) . "</pre>";
        }
        
        // Mostrar headers
        if (isset($data['headers']) && !empty($data['headers'])) {
            echo "<h4>Headers</h4>";
            echo "<pre>" . htmlspecialchars(json_encode($data['headers'], JSON_PRETTY_PRINT)) . "</pre>";
        }
        
        echo "</div>";
    }
}

// Eliminar un archivo específico
if (isset($_GET['delete']) && !empty($_GET['delete'])) {
    $filename = $_GET['delete'];
    $file = $logDir . '/' . $filename;
    
    if (file_exists($file) && is_file($file)) {
        unlink($file);
        echo "<script>window.location.href = '?refresh=true';</script>";
    }
}

echo "    </div>
    
    <div class='card'>
        <div class='card-header'>
            <h2 style='margin: 0;'>Instrucciones</h2>
        </div>
        <p>Este script te permite ver los datos enviados por los formularios del sitio web.</p>
        <p>Para capturar los datos de un formulario, modifica temporalmente la URL del endpoint en el componente React para que apunte a <code>/api/debug-form-data.php</code>.</p>
        <p>Ejemplo:</p>
        <pre>// Cambiar esto:
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});

// Por esto:
fetch('/api/debug-form-data.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});</pre>
        <p>Después de enviar el formulario, actualiza esta página para ver los datos capturados.</p>
    </div>
</body>
</html>";
?>
