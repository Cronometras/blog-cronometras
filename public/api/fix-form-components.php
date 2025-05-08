<?php
// Script para generar versiones modificadas de los componentes React

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

// Definir los componentes a modificar
$components = [
    'ContactForm.tsx' => [
        'path' => 'src/components/react/ContactForm.tsx',
        'endpoint' => '/api/contact',
        'newEndpoint' => '/api/contact/'
    ],
    'ContactFormEn.tsx' => [
        'path' => 'src/components/react/ContactFormEn.tsx',
        'endpoint' => '/api/contact',
        'newEndpoint' => '/api/contact/'
    ],
    'InformationRequestForm.tsx' => [
        'path' => 'src/components/react/InformationRequestForm.tsx',
        'endpoint' => '/api/information-request',
        'newEndpoint' => '/api/information-request/'
    ],
    'RequestDemoForm.tsx' => [
        'path' => 'src/components/react/RequestDemoForm.tsx',
        'endpoint' => '/api/information-request',
        'newEndpoint' => '/api/information-request/'
    ]
];

// Función para leer el contenido de un archivo
function readFile($path) {
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    return false;
}

// Función para modificar el endpoint en el código
function modifyEndpoint($content, $oldEndpoint, $newEndpoint) {
    // Buscar la línea que contiene el fetch con el endpoint
    $pattern = "/fetch\s*\(\s*['\"]" . preg_quote($oldEndpoint, '/') . "['\"]/";
    
    // Reemplazar el endpoint
    $modified = preg_replace($pattern, "fetch('" . $newEndpoint . "'", $content);
    
    return $modified;
}

// Función para guardar el contenido modificado
function saveModifiedComponent($path, $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    
    return file_put_contents($path, $content);
}

// HTML para la página
echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Modificar Componentes React</title>
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
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .success {
            color: green;
        }
        .error {
            color: red;
        }
        .diff {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
        }
        .diff-old {
            background-color: #ffdddd;
            color: #990000;
            text-decoration: line-through;
        }
        .diff-new {
            background-color: #ddffdd;
            color: #009900;
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
        .code-block {
            font-family: monospace;
            white-space: pre-wrap;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>Modificar Componentes React</h1>
        
        <div class='card'>
            <div class='card-header'>
                <h2>Instrucciones</h2>
            </div>
            <p>Este script modifica los componentes React para que envíen datos a los endpoints con slash final.</p>
            <p>Para cada componente, se muestra:</p>
            <ul>
                <li>El nombre del componente</li>
                <li>El endpoint actual</li>
                <li>El nuevo endpoint</li>
                <li>El resultado de la modificación</li>
            </ul>
            <p>Para aplicar los cambios, debes:</p>
            <ol>
                <li>Copiar los archivos modificados a tu proyecto</li>
                <li>Ejecutar el comando de build para regenerar los archivos JavaScript</li>
                <li>Subir los archivos actualizados a tu servidor</li>
            </ol>
        </div>";

// Procesar cada componente
foreach ($components as $name => $component) {
    echo "<div class='card'>";
    echo "<div class='card-header'>";
    echo "<h2>$name</h2>";
    echo "</div>";
    
    echo "<p><strong>Ruta:</strong> {$component['path']}</p>";
    echo "<p><strong>Endpoint actual:</strong> {$component['endpoint']}</p>";
    echo "<p><strong>Nuevo endpoint:</strong> {$component['newEndpoint']}</p>";
    
    // Leer el contenido del componente
    $content = readFile($component['path']);
    
    if ($content === false) {
        echo "<p class='error'>Error: No se pudo leer el archivo {$component['path']}</p>";
        echo "</div>";
        continue;
    }
    
    // Modificar el endpoint
    $modified = modifyEndpoint($content, $component['endpoint'], $component['newEndpoint']);
    
    // Verificar si se realizó algún cambio
    if ($modified === $content) {
        echo "<p class='error'>No se encontró el endpoint en el componente.</p>";
        echo "</div>";
        continue;
    }
    
    // Guardar el componente modificado
    $modifiedPath = 'modified/' . $component['path'];
    $result = saveModifiedComponent($modifiedPath, $modified);
    
    if ($result === false) {
        echo "<p class='error'>Error: No se pudo guardar el archivo modificado.</p>";
        echo "</div>";
        continue;
    }
    
    echo "<p class='success'>El componente se modificó correctamente.</p>";
    
    // Mostrar la diferencia
    echo "<h3>Diferencia:</h3>";
    echo "<div class='diff'>";
    
    // Buscar la línea que contiene el fetch con el endpoint
    $pattern = "/fetch\s*\(\s*['\"]" . preg_quote($component['endpoint'], '/') . "['\"]/";
    preg_match($pattern, $content, $matches, PREG_OFFSET_CAPTURE);
    
    if (!empty($matches)) {
        $match = $matches[0][0];
        $position = $matches[0][1];
        
        // Obtener el contexto (líneas antes y después)
        $start = max(0, strpos($content, "\n", max(0, $position - 100)) + 1);
        $end = min(strlen($content), strpos($content, "\n", min(strlen($content), $position + 100)));
        
        $context = substr($content, $start, $end - $start);
        $modifiedContext = substr($modified, $start, $end - $start);
        
        // Mostrar el contexto original
        echo "<div class='code-block diff-old'>";
        echo htmlspecialchars($context);
        echo "</div>";
        
        // Mostrar el contexto modificado
        echo "<div class='code-block diff-new'>";
        echo htmlspecialchars($modifiedContext);
        echo "</div>";
    }
    
    echo "</div>";
    
    // Mostrar el código completo modificado
    echo "<h3>Código Modificado:</h3>";
    echo "<pre>";
    echo htmlspecialchars($modified);
    echo "</pre>";
    
    echo "</div>";
}

// Mostrar instrucciones finales
echo "<div class='card'>
    <div class='card-header'>
        <h2>Próximos Pasos</h2>
    </div>
    <p>Para aplicar estos cambios, debes:</p>
    <ol>
        <li>Copiar los archivos modificados a tu proyecto:</li>
        <pre>
// Copiar ContactForm.tsx
cp modified/src/components/react/ContactForm.tsx src/components/react/ContactForm.tsx

// Copiar ContactFormEn.tsx
cp modified/src/components/react/ContactFormEn.tsx src/components/react/ContactFormEn.tsx

// Copiar InformationRequestForm.tsx
cp modified/src/components/react/InformationRequestForm.tsx src/components/react/InformationRequestForm.tsx

// Copiar RequestDemoForm.tsx
cp modified/src/components/react/RequestDemoForm.tsx src/components/react/RequestDemoForm.tsx
</pre>
        <li>Ejecutar el comando de build para regenerar los archivos JavaScript:</li>
        <pre>npm run build</pre>
        <li>Subir los archivos actualizados a tu servidor</li>
    </ol>
    <p>Una vez que hayas aplicado estos cambios, los formularios deberían enviar datos a los endpoints con slash final, lo que debería solucionar el problema.</p>
</div>";

echo "</div>
</body>
</html>";
?>
