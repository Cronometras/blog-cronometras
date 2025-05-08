<?php
// Script para capturar y mostrar solicitudes HTTP

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Función para guardar la solicitud actual
function captureCurrentRequest() {
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
    
    // Crear array con los datos de la solicitud
    $requestData = [
        'timestamp' => $timestamp,
        'method' => $method,
        'uri' => $uri,
        'ip' => $ip,
        'userAgent' => $userAgent,
        'headers' => $headers,
        'rawData' => $rawData,
        'jsonData' => $jsonData
    ];
    
    // Guardar en sesión
    session_start();
    if (!isset($_SESSION['captured_requests'])) {
        $_SESSION['captured_requests'] = [];
    }
    
    // Limitar a las últimas 10 solicitudes
    $_SESSION['captured_requests'][] = $requestData;
    if (count($_SESSION['captured_requests']) > 10) {
        array_shift($_SESSION['captured_requests']);
    }
    
    session_write_close();
    
    return $requestData;
}

// Verificar si es una solicitud para capturar
if (isset($_GET['capture']) && $_GET['capture'] === 'true') {
    // Capturar la solicitud
    $requestData = captureCurrentRequest();
    
    // Devolver respuesta JSON
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Request captured successfully',
        'request' => $requestData
    ]);
    exit;
}

// Si no es una solicitud para capturar, mostrar la interfaz de usuario
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Captura de Solicitudes</title>
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
        .badge {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        .badge-get {
            background-color: #3498db;
        }
        .badge-post {
            background-color: #2ecc71;
        }
        .badge-put {
            background-color: #f39c12;
        }
        .badge-delete {
            background-color: #e74c3c;
        }
        .badge-options {
            background-color: #9b59b6;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .tab {
            overflow: hidden;
            border: 1px solid #ccc;
            background-color: #f1f1f1;
            border-radius: 4px 4px 0 0;
        }
        .tab button {
            background-color: inherit;
            float: left;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 10px 16px;
            transition: 0.3s;
        }
        .tab button:hover {
            background-color: #ddd;
        }
        .tab button.active {
            background-color: #ccc;
        }
        .tabcontent {
            display: none;
            padding: 15px;
            border: 1px solid #ccc;
            border-top: none;
            border-radius: 0 0 4px 4px;
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
        .endpoint-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        .endpoint-item {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Captura de Solicitudes HTTP</h1>
        
        <div class="card">
            <div class="card-header">
                <h2 style="margin: 0;">Endpoints Disponibles</h2>
            </div>
            <div class="endpoint-list">
                <div class="endpoint-item">
                    <strong>Contacto:</strong> 
                    <a href="#" onclick="testEndpoint('/api/contact', 'contact'); return false;">/api/contact</a> | 
                    <a href="#" onclick="testEndpoint('/api/contact/', 'contact'); return false;">/api/contact/</a>
                </div>
                <div class="endpoint-item">
                    <strong>Solicitud de Información:</strong> 
                    <a href="#" onclick="testEndpoint('/api/information-request', 'information'); return false;">/api/information-request</a> | 
                    <a href="#" onclick="testEndpoint('/api/information-request/', 'information'); return false;">/api/information-request/</a>
                </div>
            </div>
            
            <h3>Enviar Solicitud de Prueba</h3>
            <div class="tab">
                <button class="tablinks active" onclick="openTab(event, 'ContactForm')">Formulario de Contacto</button>
                <button class="tablinks" onclick="openTab(event, 'InfoForm')">Solicitud de Información</button>
            </div>
            
            <div id="ContactForm" class="tabcontent" style="display: block;">
                <form id="contactTestForm">
                    <div style="margin-bottom: 10px;">
                        <label for="contact-nombre">Nombre:</label><br>
                        <input type="text" id="contact-nombre" name="nombre" value="Usuario de Prueba" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="contact-email">Email:</label><br>
                        <input type="email" id="contact-email" name="email" value="test@example.com" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="contact-mensaje">Mensaje:</label><br>
                        <textarea id="contact-mensaje" name="mensaje" rows="4" style="width: 100%; padding: 8px;">Este es un mensaje de prueba</textarea>
                    </div>
                    <div style="margin-top: 10px;">
                        <button type="button" class="btn" onclick="sendTestRequest('contact')">Enviar Prueba</button>
                    </div>
                </form>
            </div>
            
            <div id="InfoForm" class="tabcontent">
                <form id="infoTestForm">
                    <div style="margin-bottom: 10px;">
                        <label for="info-nombre">Nombre:</label><br>
                        <input type="text" id="info-nombre" name="nombre" value="Usuario de Prueba" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="info-email">Email:</label><br>
                        <input type="email" id="info-email" name="email" value="test@example.com" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="info-empresa">Empresa:</label><br>
                        <input type="text" id="info-empresa" name="empresa" value="Empresa de Prueba" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="info-telefono">Teléfono:</label><br>
                        <input type="text" id="info-telefono" name="telefono" value="123456789" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label for="info-mensaje">Mensaje:</label><br>
                        <textarea id="info-mensaje" name="mensaje" rows="4" style="width: 100%; padding: 8px;">Este es un mensaje de prueba</textarea>
                    </div>
                    <div style="margin-top: 10px;">
                        <button type="button" class="btn" onclick="sendTestRequest('information')">Enviar Prueba</button>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 style="margin: 0;">Solicitudes Capturadas</h2>
                <div>
                    <button class="btn" onclick="refreshRequests()">Actualizar</button>
                    <button class="btn btn-danger" onclick="clearRequests()">Limpiar</button>
                </div>
            </div>
            <div id="requests-container">
                <p>No hay solicitudes capturadas.</p>
            </div>
        </div>
    </div>
    
    <script>
        // Función para abrir pestañas
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }
        
        // Función para probar un endpoint
        function testEndpoint(endpoint, formType) {
            if (formType === 'contact') {
                document.querySelector('.tablinks:nth-child(1)').click();
            } else {
                document.querySelector('.tablinks:nth-child(2)').click();
            }
            
            // Guardar el endpoint en el formulario
            document.getElementById(formType === 'contact' ? 'contactTestForm' : 'infoTestForm').dataset.endpoint = endpoint;
            
            alert('Endpoint seleccionado: ' + endpoint + '\nAhora puedes enviar una solicitud de prueba.');
        }
        
        // Función para enviar una solicitud de prueba
        function sendTestRequest(formType) {
            const form = document.getElementById(formType === 'contact' ? 'contactTestForm' : 'infoTestForm');
            const endpoint = form.dataset.endpoint || (formType === 'contact' ? '/api/contact' : '/api/information-request');
            
            // Recopilar datos del formulario
            const formData = {};
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                formData[input.name] = input.value;
            });
            
            // Añadir idioma
            formData.lang = 'es';
            
            // Enviar solicitud
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                alert('Solicitud enviada correctamente.\nRespuesta: ' + JSON.stringify(data, null, 2));
                refreshRequests();
            })
            .catch(error => {
                alert('Error al enviar la solicitud: ' + error);
            });
        }
        
        // Función para actualizar la lista de solicitudes
        function refreshRequests() {
            fetch('?capture=false')
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const requestsContainer = doc.getElementById('requests-container');
                    document.getElementById('requests-container').innerHTML = requestsContainer.innerHTML;
                });
        }
        
        // Función para limpiar las solicitudes
        function clearRequests() {
            if (confirm('¿Estás seguro de que quieres limpiar todas las solicitudes capturadas?')) {
                fetch('?clear=true')
                    .then(() => {
                        document.getElementById('requests-container').innerHTML = '<p>No hay solicitudes capturadas.</p>';
                    });
            }
        }
        
        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            // Establecer endpoints predeterminados
            document.getElementById('contactTestForm').dataset.endpoint = '/api/contact';
            document.getElementById('infoTestForm').dataset.endpoint = '/api/information-request';
            
            // Cargar solicitudes
            refreshRequests();
        });
    </script>
</body>
</html>
<?php
// Mostrar las solicitudes capturadas
session_start();
$capturedRequests = isset($_SESSION['captured_requests']) ? $_SESSION['captured_requests'] : [];

// Limpiar las solicitudes si se solicita
if (isset($_GET['clear']) && $_GET['clear'] === 'true') {
    $_SESSION['captured_requests'] = [];
    $capturedRequests = [];
}

// Mostrar las solicitudes
if (!empty($capturedRequests)) {
    echo '<div id="captured-requests">';
    foreach (array_reverse($capturedRequests) as $index => $request) {
        $methodClass = 'badge-' . strtolower($request['method']);
        
        echo '<div class="card">';
        echo '<div class="card-header">';
        echo '<div>';
        echo '<span class="badge ' . $methodClass . '">' . $request['method'] . '</span> ';
        echo '<strong>' . $request['uri'] . '</strong>';
        echo '</div>';
        echo '<div>' . $request['timestamp'] . '</div>';
        echo '</div>';
        
        echo '<div>';
        echo '<h3>Headers</h3>';
        echo '<pre>' . json_encode($request['headers'], JSON_PRETTY_PRINT) . '</pre>';
        
        echo '<h3>Raw Data</h3>';
        echo '<pre>' . htmlspecialchars($request['rawData']) . '</pre>';
        
        echo '<h3>JSON Data</h3>';
        echo '<pre>' . json_encode($request['jsonData'], JSON_PRETTY_PRINT) . '</pre>';
        echo '</div>';
        
        echo '</div>';
    }
    echo '</div>';
} else {
    echo '<p>No hay solicitudes capturadas.</p>';
}
?>
