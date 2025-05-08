<?php
// Script para probar los formularios con datos específicos

// Desactivar warnings para evitar mensajes de error
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Prueba con Datos Específicos</title>
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
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        textarea {
            height: 100px;
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
        .result {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }
        pre {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .success {
            color: green;
        }
        .error {
            color: red;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 15px;
            cursor: pointer;
            border: 1px solid transparent;
            border-bottom: none;
            margin-bottom: -1px;
        }
        .tab.active {
            background-color: #f9f9f9;
            border-color: #ddd;
            border-radius: 4px 4px 0 0;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .code-block {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-family: monospace;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>Prueba con Datos Específicos</h1>
        
        <div class='tabs'>
            <div class='tab active' data-tab='test-form'>Probar Formulario</div>
            <div class='tab' data-tab='view-data'>Ver Datos Capturados</div>
            <div class='tab' data-tab='instructions'>Instrucciones</div>
        </div>
        
        <div class='tab-content active' id='test-form-tab'>
            <div class='card'>
                <div class='card-header'>
                    <h2>Probar Formulario</h2>
                </div>
                
                <form id='test-form'>
                    <div class='form-group'>
                        <label for='endpoint'>Endpoint:</label>
                        <select id='endpoint' name='endpoint'>
                            <option value='/api/contact'>/api/contact (sin slash)</option>
                            <option value='/api/contact/'>/api/contact/ (con slash)</option>
                            <option value='/api/information-request'>/api/information-request (sin slash)</option>
                            <option value='/api/information-request/'>/api/information-request/ (con slash)</option>
                            <option value='/api/debug-form-data.php'>/api/debug-form-data.php (depuración)</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='content-type'>Content-Type:</label>
                        <select id='content-type' name='content_type'>
                            <option value='application/json'>application/json</option>
                            <option value='application/x-www-form-urlencoded'>application/x-www-form-urlencoded</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='data-format'>Formato de Datos:</label>
                        <select id='data-format' name='data_format'>
                            <option value='json'>JSON</option>
                            <option value='form'>Form Data</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='field-format'>Formato de Campos:</label>
                        <select id='field-format' name='field_format'>
                            <option value='es'>Español (nombre, email, mensaje)</option>
                            <option value='en'>Inglés (name, email, message)</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='data-json'>Datos JSON:</label>
                        <textarea id='data-json' name='data_json'>{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"mensaje\": \"Este es un mensaje de prueba para el formulario de contacto.\",
  \"lang\": \"es\"
}</textarea>
                    </div>
                    
                    <div class='form-group'>
                        <label for='data-form' style='display: none;'>Datos Form:</label>
                        <textarea id='data-form' name='data_form' style='display: none;'>nombre=Usuario de Prueba&email=test@example.com&mensaje=Este es un mensaje de prueba para el formulario de contacto.&lang=es</textarea>
                    </div>
                    
                    <button type='button' class='btn' onclick='sendTestRequest()'>Enviar Prueba</button>
                </form>
                
                <div id='result' class='result' style='display: none;'>
                    <h3>Resultado</h3>
                    <div id='response'></div>
                </div>
            </div>
        </div>
        
        <div class='tab-content' id='view-data-tab'>
            <div class='card'>
                <div class='card-header'>
                    <h2>Datos Capturados</h2>
                </div>
                <p>Para ver los datos capturados, visita <a href='view-form-data.php' target='_blank'>view-form-data.php</a>.</p>
            </div>
        </div>
        
        <div class='tab-content' id='instructions-tab'>
            <div class='card'>
                <div class='card-header'>
                    <h2>Instrucciones</h2>
                </div>
                <p>Este script te permite probar los formularios con datos específicos para identificar problemas.</p>
                
                <h3>Pasos para probar:</h3>
                <ol>
                    <li>Selecciona el endpoint que quieres probar</li>
                    <li>Elige el formato de contenido (Content-Type)</li>
                    <li>Selecciona el formato de datos (JSON o Form Data)</li>
                    <li>Selecciona el formato de campos (Español o Inglés)</li>
                    <li>Modifica los datos según sea necesario</li>
                    <li>Haz clic en 'Enviar Prueba'</li>
                </ol>
                
                <h3>Ejemplos de datos para formulario de contacto:</h3>
                <div class='code-block'>// Español
{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"mensaje\": \"Este es un mensaje de prueba para el formulario de contacto.\",
  \"lang\": \"es\"
}

// Inglés
{
  \"name\": \"Test User\",
  \"email\": \"test@example.com\",
  \"message\": \"This is a test message for the contact form.\",
  \"lang\": \"en\"
}</div>
                
                <h3>Ejemplos de datos para solicitud de información:</h3>
                <div class='code-block'>// Español
{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"empresa\": \"Empresa de Prueba\",
  \"telefono\": \"123456789\",
  \"mensaje\": \"Este es un mensaje de prueba para la solicitud de información.\",
  \"lang\": \"es\"
}

// Inglés
{
  \"name\": \"Test User\",
  \"email\": \"test@example.com\",
  \"company\": \"Test Company\",
  \"phone\": \"123456789\",
  \"message\": \"This is a test message for the information request.\",
  \"lang\": \"en\"
}</div>
            </div>
        </div>
    </div>
    
    <script>
        // Función para cambiar entre pestañas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Desactivar todas las pestañas
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activar la pestaña seleccionada
                this.classList.add('active');
                document.getElementById(this.dataset.tab + '-tab').classList.add('active');
            });
        });
        
        // Función para cambiar entre formatos de datos
        document.getElementById('data-format').addEventListener('change', function() {
            const format = this.value;
            const jsonInput = document.getElementById('data-json');
            const formInput = document.getElementById('data-form');
            const jsonLabel = document.querySelector('label[for=\"data-json\"]');
            const formLabel = document.querySelector('label[for=\"data-form\"]');
            
            if (format === 'json') {
                jsonInput.style.display = 'block';
                jsonLabel.style.display = 'block';
                formInput.style.display = 'none';
                formLabel.style.display = 'none';
            } else {
                jsonInput.style.display = 'none';
                jsonLabel.style.display = 'none';
                formInput.style.display = 'block';
                formLabel.style.display = 'block';
            }
        });
        
        // Función para cambiar el formato de campos
        document.getElementById('field-format').addEventListener('change', function() {
            const format = this.value;
            const jsonInput = document.getElementById('data-json');
            const formInput = document.getElementById('data-form');
            const endpoint = document.getElementById('endpoint').value;
            
            if (format === 'es') {
                if (endpoint.includes('contact')) {
                    jsonInput.value = `{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"mensaje\": \"Este es un mensaje de prueba para el formulario de contacto.\",
  \"lang\": \"es\"
}`;
                    formInput.value = 'nombre=Usuario de Prueba&email=test@example.com&mensaje=Este es un mensaje de prueba para el formulario de contacto.&lang=es';
                } else {
                    jsonInput.value = `{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"empresa\": \"Empresa de Prueba\",
  \"telefono\": \"123456789\",
  \"mensaje\": \"Este es un mensaje de prueba para la solicitud de información.\",
  \"lang\": \"es\"
}`;
                    formInput.value = 'nombre=Usuario de Prueba&email=test@example.com&empresa=Empresa de Prueba&telefono=123456789&mensaje=Este es un mensaje de prueba para la solicitud de información.&lang=es';
                }
            } else {
                if (endpoint.includes('contact')) {
                    jsonInput.value = `{
  \"name\": \"Test User\",
  \"email\": \"test@example.com\",
  \"message\": \"This is a test message for the contact form.\",
  \"lang\": \"en\"
}`;
                    formInput.value = 'name=Test User&email=test@example.com&message=This is a test message for the contact form.&lang=en';
                } else {
                    jsonInput.value = `{
  \"name\": \"Test User\",
  \"email\": \"test@example.com\",
  \"company\": \"Test Company\",
  \"phone\": \"123456789\",
  \"message\": \"This is a test message for the information request.\",
  \"lang\": \"en\"
}`;
                    formInput.value = 'name=Test User&email=test@example.com&company=Test Company&phone=123456789&message=This is a test message for the information request.&lang=en';
                }
            }
        });
        
        // Función para cambiar el endpoint
        document.getElementById('endpoint').addEventListener('change', function() {
            const endpoint = this.value;
            const fieldFormat = document.getElementById('field-format').value;
            
            // Actualizar los datos según el endpoint y el formato de campos
            if (fieldFormat === 'es') {
                if (endpoint.includes('contact')) {
                    document.getElementById('data-json').value = `{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"mensaje\": \"Este es un mensaje de prueba para el formulario de contacto.\",
  \"lang\": \"es\"
}`;
                    document.getElementById('data-form').value = 'nombre=Usuario de Prueba&email=test@example.com&mensaje=Este es un mensaje de prueba para el formulario de contacto.&lang=es';
                } else {
                    document.getElementById('data-json').value = `{
  \"nombre\": \"Usuario de Prueba\",
  \"email\": \"test@example.com\",
  \"empresa\": \"Empresa de Prueba\",
  \"telefono\": \"123456789\",
  \"mensaje\": \"Este es un mensaje de prueba para la solicitud de información.\",
  \"lang\": \"es\"
}`;
                    document.getElementById('data-form').value = 'nombre=Usuario de Prueba&email=test@example.com&empresa=Empresa de Prueba&telefono=123456789&mensaje=Este es un mensaje de prueba para la solicitud de información.&lang=es';
                }
            } else {
                if (endpoint.includes('contact')) {
                    document.getElementById('data-json').value = `{
  \"name\": \"Test User\",
  \"email\": \"test@example.com\",
  \"message\": \"This is a test message for the contact form.\",
  \"lang\": \"en\"
}`;
                    document.getElementById('data-form').value = 'name=Test User&email=test@example.com&message=This is a test message for the contact form.&lang=en';
                } else {
                    document.getElementById('data-json').value = `{
  \"name\": \"Test User\",
  \"email\": \"test@example.com\",
  \"company\": \"Test Company\",
  \"phone\": \"123456789\",
  \"message\": \"This is a test message for the information request.\",
  \"lang\": \"en\"
}`;
                    document.getElementById('data-form').value = 'name=Test User&email=test@example.com&company=Test Company&phone=123456789&message=This is a test message for the information request.&lang=en';
                }
            }
        });
        
        // Función para enviar la solicitud de prueba
        function sendTestRequest() {
            const endpoint = document.getElementById('endpoint').value;
            const contentType = document.getElementById('content-type').value;
            const dataFormat = document.getElementById('data-format').value;
            
            let data;
            let headers = {
                'Content-Type': contentType
            };
            
            if (dataFormat === 'json') {
                try {
                    data = JSON.parse(document.getElementById('data-json').value);
                } catch (e) {
                    alert('Error al parsear JSON: ' + e.message);
                    return;
                }
            } else {
                data = document.getElementById('data-form').value;
            }
            
            // Mostrar datos que se van a enviar
            const resultDiv = document.getElementById('result');
            const responseDiv = document.getElementById('response');
            
            resultDiv.style.display = 'block';
            responseDiv.innerHTML = '<p>Enviando datos a <strong>' + endpoint + '</strong> con Content-Type <strong>' + contentType + '</strong>...</p>';
            responseDiv.innerHTML += '<h4>Datos enviados:</h4>';
            
            if (dataFormat === 'json') {
                responseDiv.innerHTML += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } else {
                responseDiv.innerHTML += '<pre>' + data + '</pre>';
            }
            
            // Enviar solicitud
            fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: dataFormat === 'json' ? JSON.stringify(data) : data
            })
            .then(response => {
                responseDiv.innerHTML += '<h4>Estado de la respuesta:</h4>';
                responseDiv.innerHTML += '<p>' + response.status + ' ' + response.statusText + '</p>';
                return response.json();
            })
            .then(data => {
                responseDiv.innerHTML += '<h4>Respuesta:</h4>';
                responseDiv.innerHTML += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                
                if (data.success) {
                    responseDiv.innerHTML += '<p class=\"success\">✓ La solicitud se procesó correctamente.</p>';
                    
                    if (data.debug && data.debug.emailId) {
                        responseDiv.innerHTML += '<p class=\"success\">✓ El email se envió correctamente (ID: ' + data.debug.emailId + ').</p>';
                    } else if (data.debug && data.debug.actualSuccess === false) {
                        responseDiv.innerHTML += '<p class=\"error\">✗ Hubo un problema al enviar el email:</p>';
                        if (data.debug.exception) {
                            responseDiv.innerHTML += '<p class=\"error\">Error: ' + data.debug.exception + '</p>';
                        }
                        if (data.debug.error) {
                            responseDiv.innerHTML += '<p class=\"error\">Error: ' + data.debug.error + '</p>';
                        }
                        if (data.debug.apiError && data.debug.apiError !== 'No API error message') {
                            responseDiv.innerHTML += '<p class=\"error\">Error de API: ' + data.debug.apiError + '</p>';
                        }
                    }
                } else {
                    responseDiv.innerHTML += '<p class=\"error\">✗ La solicitud no se procesó correctamente.</p>';
                }
            })
            .catch(error => {
                responseDiv.innerHTML += '<h4>Error:</h4>';
                responseDiv.innerHTML += '<p class=\"error\">' + error + '</p>';
            });
        }
    </script>
</body>
</html>";
?>
