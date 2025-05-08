<?php
// Test script for form submissions without trailing slash

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Test de Formularios (Sin Slash Final)</h1>";

// Función para hacer solicitudes HTTP
function makeHttpRequest($url, $data, $method = 'POST') {
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => $method,
            'content' => json_encode($data)
        ]
    ];
    
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    return $result;
}

// Determinar la URL base
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$baseUrl = "$protocol://$host";

// Formularios disponibles
$forms = [
    'contact' => [
        'name' => 'Formulario de Contacto',
        'endpoint' => '/api/contact', // Sin slash final
        'fields' => [
            'nombre' => 'Nombre',
            'email' => 'Email',
            'mensaje' => 'Mensaje'
        ]
    ],
    'information' => [
        'name' => 'Solicitud de Información',
        'endpoint' => '/api/information-request', // Sin slash final
        'fields' => [
            'nombre' => 'Nombre',
            'email' => 'Email',
            'empresa' => 'Empresa',
            'telefono' => 'Teléfono',
            'mensaje' => 'Mensaje'
        ]
    ]
];

// Determinar qué formulario mostrar
$formType = isset($_GET['form']) ? $_GET['form'] : 'contact';
if (!isset($forms[$formType])) {
    $formType = 'contact';
}

$form = $forms[$formType];

// Procesar el formulario
$result = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = [];
    foreach ($form['fields'] as $field => $label) {
        $data[$field] = isset($_POST[$field]) ? $_POST[$field] : '';
    }
    $data['lang'] = 'es';
    
    $endpoint = $baseUrl . $form['endpoint'];
    $result = makeHttpRequest($endpoint, $data);
}

// Mostrar enlaces a los diferentes formularios
echo "<div style='margin-bottom: 20px;'>";
foreach ($forms as $key => $formInfo) {
    echo "<a href='?form=$key' style='margin-right: 10px; " . ($formType === $key ? 'font-weight: bold;' : '') . "'>{$formInfo['name']}</a>";
}
echo "</div>";

// Mostrar el formulario
echo "<h2>{$form['name']} (Sin Slash Final)</h2>";
echo "<p style='color: blue;'>Nota: Este formulario envía datos a <strong>{$form['endpoint']}</strong> (sin slash final)</p>";
echo "<form method='post' action='?form=$formType'>";
foreach ($form['fields'] as $field => $label) {
    $value = isset($_POST[$field]) ? htmlspecialchars($_POST[$field]) : '';
    if ($field === 'mensaje') {
        echo "<div style='margin-bottom: 10px;'>";
        echo "<label for='$field'>$label:</label><br>";
        echo "<textarea name='$field' id='$field' rows='5' cols='40'>$value</textarea>";
        echo "</div>";
    } else {
        echo "<div style='margin-bottom: 10px;'>";
        echo "<label for='$field'>$label:</label><br>";
        echo "<input type='".($field === 'email' ? 'email' : 'text')."' name='$field' id='$field' value='$value' size='40'>";
        echo "</div>";
    }
}
echo "<div style='margin-top: 20px;'>";
echo "<input type='submit' value='Enviar'>";
echo "</div>";
echo "</form>";

// Mostrar resultado
if ($result !== null) {
    echo "<h2>Resultado</h2>";
    echo "<pre>";
    $resultData = json_decode($result, true);
    print_r($resultData);
    echo "</pre>";
    
    if (isset($resultData['success']) && $resultData['success']) {
        echo "<p style='color: green;'>El formulario se envió correctamente.</p>";
        
        if (isset($resultData['debug'])) {
            echo "<h3>Información de Depuración</h3>";
            echo "<pre>";
            print_r($resultData['debug']);
            echo "</pre>";
            
            if (isset($resultData['debug']['emailId'])) {
                echo "<p>ID del Email: " . $resultData['debug']['emailId'] . "</p>";
                echo "<p>Este ID confirma que el email se envió correctamente a través de Resend.</p>";
            }
            
            if (isset($resultData['debug']['actualSuccess']) && $resultData['debug']['actualSuccess'] === false) {
                echo "<p style='color: red;'>ADVERTENCIA: Aunque el formulario se procesó, hubo un problema al enviar el email.</p>";
                
                if (isset($resultData['debug']['error']) && !empty($resultData['debug']['error'])) {
                    echo "<p style='color: red;'>Error: " . $resultData['debug']['error'] . "</p>";
                }
                
                if (isset($resultData['debug']['apiError']) && !empty($resultData['debug']['apiError']) && $resultData['debug']['apiError'] !== 'No API error message') {
                    echo "<p style='color: red;'>Error de API: " . $resultData['debug']['apiError'] . "</p>";
                }
                
                if (isset($resultData['debug']['exception']) && !empty($resultData['debug']['exception'])) {
                    echo "<p style='color: red;'>Excepción: " . $resultData['debug']['exception'] . "</p>";
                }
            }
        }
    } else {
        echo "<p style='color: red;'>Hubo un problema al enviar el formulario.</p>";
    }
}

// Mostrar información adicional
echo "<h2>Información Adicional</h2>";
echo "<p>Este script te permite probar los formularios sin slash final en la URL, tal como los envían los componentes React.</p>";
echo "<p>Si los formularios reales del sitio web no funcionan pero este script sí, es posible que el problema sea que los componentes React están enviando a rutas sin slash final.</p>";
echo "<p>Soluciones posibles:</p>";
echo "<ol>";
echo "<li>Modificar el router para que redirija las rutas sin slash final a las rutas con slash final</li>";
echo "<li>Modificar los componentes React para que envíen a rutas con slash final</li>";
echo "<li>Crear endpoints adicionales sin slash final</li>";
echo "</ol>";
?>
