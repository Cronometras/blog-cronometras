<?php
// Test script for form submissions with different configurations

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Test de Formularios - Configuraciones</title>
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
    </style>
</head>
<body>
    <div class='container'>
        <h1>Test de Formularios - Configuraciones</h1>
        
        <div class='tabs'>
            <div class='tab active' data-tab='contact'>Formulario de Contacto</div>
            <div class='tab' data-tab='information'>Solicitud de Información</div>
        </div>
        
        <div class='tab-content active' id='contact-tab'>
            <div class='card'>
                <div class='card-header'>
                    <h2>Formulario de Contacto</h2>
                </div>
                
                <form id='contact-form'>
                    <div class='form-group'>
                        <label for='contact-endpoint'>Endpoint:</label>
                        <select id='contact-endpoint' name='endpoint'>
                            <option value='/api/contact'>/api/contact (sin slash)</option>
                            <option value='/api/contact/'>/api/contact/ (con slash)</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='contact-field-format'>Formato de Campos:</label>
                        <select id='contact-field-format' name='field_format'>
                            <option value='es'>Español (nombre, email, mensaje)</option>
                            <option value='en'>Inglés (name, email, message)</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='contact-name'>Nombre:</label>
                        <input type='text' id='contact-name' name='name' value='Usuario de Prueba'>
                    </div>
                    
                    <div class='form-group'>
                        <label for='contact-email'>Email:</label>
                        <input type='email' id='contact-email' name='email' value='test@example.com'>
                    </div>
                    
                    <div class='form-group'>
                        <label for='contact-message'>Mensaje:</label>
                        <textarea id='contact-message' name='message'>Este es un mensaje de prueba para el formulario de contacto.</textarea>
                    </div>
                    
                    <button type='button' class='btn' onclick='submitForm(\"contact\")'>Enviar</button>
                </form>
                
                <div id='contact-result' class='result' style='display: none;'>
                    <h3>Resultado</h3>
                    <div id='contact-response'></div>
                </div>
            </div>
        </div>
        
        <div class='tab-content' id='information-tab'>
            <div class='card'>
                <div class='card-header'>
                    <h2>Solicitud de Información</h2>
                </div>
                
                <form id='information-form'>
                    <div class='form-group'>
                        <label for='information-endpoint'>Endpoint:</label>
                        <select id='information-endpoint' name='endpoint'>
                            <option value='/api/information-request'>/api/information-request (sin slash)</option>
                            <option value='/api/information-request/'>/api/information-request/ (con slash)</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='information-field-format'>Formato de Campos:</label>
                        <select id='information-field-format' name='field_format'>
                            <option value='es'>Español (nombre, email, empresa, telefono, mensaje)</option>
                            <option value='en'>Inglés (name, email, company, phone, message)</option>
                        </select>
                    </div>
                    
                    <div class='form-group'>
                        <label for='information-name'>Nombre:</label>
                        <input type='text' id='information-name' name='name' value='Usuario de Prueba'>
                    </div>
                    
                    <div class='form-group'>
                        <label for='information-email'>Email:</label>
                        <input type='email' id='information-email' name='email' value='test@example.com'>
                    </div>
                    
                    <div class='form-group'>
                        <label for='information-company'>Empresa:</label>
                        <input type='text' id='information-company' name='company' value='Empresa de Prueba'>
                    </div>
                    
                    <div class='form-group'>
                        <label for='information-phone'>Teléfono:</label>
                        <input type='text' id='information-phone' name='phone' value='123456789'>
                    </div>
                    
                    <div class='form-group'>
                        <label for='information-message'>Mensaje:</label>
                        <textarea id='information-message' name='message'>Este es un mensaje de prueba para la solicitud de información.</textarea>
                    </div>
                    
                    <button type='button' class='btn' onclick='submitForm(\"information\")'>Enviar</button>
                </form>
                
                <div id='information-result' class='result' style='display: none;'>
                    <h3>Resultado</h3>
                    <div id='information-response'></div>
                </div>
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
        
        // Función para enviar el formulario
        function submitForm(formType) {
            const form = document.getElementById(formType + '-form');
            const endpoint = document.getElementById(formType + '-endpoint').value;
            const fieldFormat = document.getElementById(formType + '-field-format').value;
            
            // Recopilar datos del formulario
            const formData = {};
            
            // Añadir campos según el formato seleccionado
            if (formType === 'contact') {
                if (fieldFormat === 'es') {
                    formData.nombre = document.getElementById('contact-name').value;
                    formData.email = document.getElementById('contact-email').value;
                    formData.mensaje = document.getElementById('contact-message').value;
                } else {
                    formData.name = document.getElementById('contact-name').value;
                    formData.email = document.getElementById('contact-email').value;
                    formData.message = document.getElementById('contact-message').value;
                }
            } else {
                if (fieldFormat === 'es') {
                    formData.nombre = document.getElementById('information-name').value;
                    formData.email = document.getElementById('information-email').value;
                    formData.empresa = document.getElementById('information-company').value;
                    formData.telefono = document.getElementById('information-phone').value;
                    formData.mensaje = document.getElementById('information-message').value;
                } else {
                    formData.name = document.getElementById('information-name').value;
                    formData.email = document.getElementById('information-email').value;
                    formData.company = document.getElementById('information-company').value;
                    formData.phone = document.getElementById('information-phone').value;
                    formData.message = document.getElementById('information-message').value;
                }
            }
            
            // Añadir idioma
            formData.lang = 'es';
            
            // Mostrar datos que se van a enviar
            const resultDiv = document.getElementById(formType + '-result');
            const responseDiv = document.getElementById(formType + '-response');
            
            resultDiv.style.display = 'block';
            responseDiv.innerHTML = '<p>Enviando datos a <strong>' + endpoint + '</strong> con formato <strong>' + (fieldFormat === 'es' ? 'español' : 'inglés') + '</strong>...</p>';
            responseDiv.innerHTML += '<h4>Datos enviados:</h4>';
            responseDiv.innerHTML += '<pre>' + JSON.stringify(formData, null, 2) + '</pre>';
            
            // Enviar solicitud
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
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
