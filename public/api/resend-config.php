<?php
// Configuración para Resend API

// Cargar variables de entorno desde .env
function loadEnv() {
    $envFile = __DIR__ . '/../../.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Ignorar comentarios
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parsear líneas con formato KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Eliminar comentarios al final de la línea
                if (strpos($value, '#') !== false) {
                    $value = trim(explode('#', $value, 2)[0]);
                }

                // Eliminar comillas si existen
                if (strpos($value, '"') === 0 || strpos($value, "'") === 0) {
                    $value = trim($value, '"\'');
                }

                // Establecer variable de entorno
                putenv("$key=$value");
                $_ENV[$key] = $value;
            }
        }
    }
}

// Cargar variables de entorno
loadEnv();

// Obtener configuración de Resend
$resendApiKey = getenv('RESEND_API_KEY') ?: 're_AamXWQKc_2GCs1Motoc7rZFjqwVndgG8p';
$resendFromEmail = getenv('RESEND_FROM_EMAIL') ?: 'no-reply@cronometras.com';
$resendFromName = getenv('RESEND_FROM_NAME') ?: 'Cronometras App';

// Función para enviar email usando Resend API
function sendEmailWithResend($to, $subject, $htmlContent, $fromEmail = null, $fromName = null) {
    global $resendApiKey, $resendFromEmail, $resendFromName;

    // Desactivar warnings para evitar mensajes de error en la página
    $oldErrorReporting = error_reporting();
    error_reporting(E_ERROR | E_PARSE);

    // Crear archivo de log con manejo de errores
    try {
        $logDir = __DIR__;
        $logFile = $logDir . '/resend-log.txt';

        // Verificar si podemos escribir en el directorio
        if (!is_writable($logDir)) {
            // Intentar crear el archivo con permisos amplios
            touch($logFile);
            chmod($logFile, 0666); // Permisos de lectura/escritura para todos
        }

        // Intentar escribir en el log
        $logMessage = "\n\n[" . date('Y-m-d H:i:s') . "] Sending email to: $to\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    } catch (Exception $e) {
        // Si no podemos escribir en el log, continuamos sin él
        // pero guardamos el error para devolverlo
        $logError = $e->getMessage();
    }

    // Usar valores predeterminados si no se proporcionan
    $fromEmail = $fromEmail ?: $resendFromEmail;
    $fromName = $fromName ?: $resendFromName;

    // Preparar datos para la API de Resend
    $data = [
        'from' => "$fromName <$fromEmail>",
        'to' => [$to],
        'subject' => $subject,
        'html' => $htmlContent,
        'text' => null // Asegurarnos de que no se envíe una versión de texto plano
    ];

    // Registrar datos en el log
    try {
        if (isset($logFile) && is_writable($logFile)) {
            $logData = "API Key: " . substr($resendApiKey, 0, 5) . "..." . substr($resendApiKey, -5) . "\n";
            $logData .= "From: $fromName <$fromEmail>\n";
            $logData .= "To: $to\n";
            $logData .= "Subject: $subject\n";
            file_put_contents($logFile, $logData, FILE_APPEND | LOCK_EX);
        }
    } catch (Exception $e) {
        // Ignorar errores de escritura en el log
    }

    // Verificar que cURL esté disponible
    if (!function_exists('curl_init')) {
        return [
            'success' => false,
            'response' => 'cURL no está disponible en este servidor',
            'statusCode' => 500,
            'error' => 'cURL extension not available'
        ];
    }

    // Inicializar cURL
    $ch = curl_init('https://api.resend.com/emails');

    // Configurar opciones de cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $resendApiKey,
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    // Asegurar que se envíe el contenido HTML correctamente
    curl_setopt($ch, CURLOPT_ENCODING, '');

    // Ejecutar solicitud
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // Registrar respuesta en el log
    try {
        if (isset($logFile) && is_writable($logFile)) {
            $logResponse = "Status Code: $statusCode\n";
            $logResponse .= "Response: $response\n";
            if ($curlError) {
                $logResponse .= "cURL Error: $curlError\n";
            }
            file_put_contents($logFile, $logResponse, FILE_APPEND | LOCK_EX);
        }
    } catch (Exception $e) {
        // Ignorar errores de escritura en el log
    }

    // Restaurar el nivel de error original
    error_reporting($oldErrorReporting);

    // Devolver resultado
    return [
        'success' => ($statusCode >= 200 && $statusCode < 300),
        'response' => $response,
        'statusCode' => $statusCode,
        'error' => $curlError,
        'logError' => isset($logError) ? $logError : null
    ];
}
?>
