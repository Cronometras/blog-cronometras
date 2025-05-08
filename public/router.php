<?php
// Simple PHP router for static Astro site

// Get the requested path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Enable error logging
error_log("Router handling request: " . $request_uri);

// Handle API requests
if (strpos($path, '/api/') === 0) {
    // Log API request
    error_log("API request detected: " . $path);

    // Check for endpoints without trailing slash - use proxy
    if ($path === '/api/contact') {
        error_log("Loading contact endpoint without slash - using proxy");
        $_GET['endpoint'] = '/api/contact/';
        include __DIR__ . '/api/form-proxy.php';
        exit;
    }

    if ($path === '/api/information-request') {
        error_log("Loading information-request endpoint without slash - using proxy");
        $_GET['endpoint'] = '/api/information-request/';
        include __DIR__ . '/api/form-proxy.php';
        exit;
    }

    if ($path === '/api/newsletter') {
        error_log("Loading newsletter endpoint without slash");
        include __DIR__ . '/api/newsletter.php';
        exit;
    }

    // Check if there's a PHP file for this API endpoint (with trailing slash)
    $api_file = __DIR__ . $path . '/index.php';

    if (file_exists($api_file)) {
        error_log("Loading API file with trailing slash: " . $api_file);
        // Include the API file and exit
        include $api_file;
        exit;
    }

    // Check if there's a direct PHP file for this API endpoint
    $api_direct_file = __DIR__ . $path . '.php';

    if (file_exists($api_direct_file)) {
        error_log("Loading direct API file: " . $api_direct_file);
        // Include the API file and exit
        include $api_direct_file;
        exit;
    }

    // If we get here, no API endpoint was found
    error_log("API endpoint not found: " . $path);
}

// Remove trailing slash if present (except for root)
if ($path != '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

// Default redirect to Spanish version
if ($path === '/') {
    header('Location: /es/');
    exit;
}

// Handle common redirects
$redirects = [
    '/about' => '/es/about/',
    '/blog' => '/es/blog/',
    '/features' => '/es/features/',
    '/contact' => '/es/contact/',
    '/privacy' => '/es/privacy/',
    '/terms' => '/es/terms/',
    '/category/blog' => '/es/blog/',
    '/category/blog/' => '/es/blog/',
    '/sistema-bedaux' => '/es/blog/sistema-bedaux/',
    '/sistema-bedaux/' => '/es/blog/sistema-bedaux/',
    '/obeya-room-lean' => '/es/blog/obeya-room-lean/',
    '/obeya-room-lean/' => '/es/blog/obeya-room-lean/',
    '/articulos/page/3' => '/es/blog/',
    '/articulos/page/3/' => '/es/blog/',
    '/category/cronometraje-industrial' => '/es/blog/',
    '/category/cronometraje-industrial/' => '/es/blog/',
    '/el-estudio-del-trabajo' => '/es/blog/el-estudio-del-trabajo/',
    '/el-estudio-del-trabajo/' => '/es/blog/el-estudio-del-trabajo/',
    '/que-es-gsd-en-ingenieria' => '/es/blog/que-es-gsd-en-ingenieria/',
    '/que-es-gsd-en-ingenieria/' => '/es/blog/que-es-gsd-en-ingenieria/',
    '/cronometraje-y-la-estandarizacion-de-procesos' => '/es/blog/cronometraje-y-la-estandarizacion-de-procesos/',
    '/cronometraje-y-la-estandarizacion-de-procesos/' => '/es/blog/cronometraje-y-la-estandarizacion-de-procesos/',
    '/category/lean-manufacturing-y-metodologias-agiles' => '/es/blog/',
    '/category/lean-manufacturing-y-metodologias-agiles/' => '/es/blog/',
    '/por-que-hay-retrasos-en-la-produccion' => '/es/blog/por-que-hay-retrasos-en-la-produccion/',
    '/por-que-hay-retrasos-en-la-produccion/' => '/es/blog/por-que-hay-retrasos-en-la-produccion/',
    '/herramientas-necesarias-para-realizar-un-estudio-de-tiempos' => '/es/blog/herramientas-necesarias-para-realizar-un-estudio-de-tiempos/',
    '/herramientas-necesarias-para-realizar-un-estudio-de-tiempos/' => '/es/blog/herramientas-necesarias-para-realizar-un-estudio-de-tiempos/',
    '/metodos-y-tiempos-en-la-gestion-empresarial-industrial' => '/es/blog/metodos-y-tiempos-en-la-gestion-empresarial-industrial/',
    '/metodos-y-tiempos-en-la-gestion-empresarial-industrial/' => '/es/blog/metodos-y-tiempos-en-la-gestion-empresarial-industrial/',
    '/la-importancia-del-estudio-de-tiempos-de-trabajo' => '/es/blog/la-importancia-del-estudio-de-tiempos-de-trabajo/',
    '/la-importancia-del-estudio-de-tiempos-de-trabajo/' => '/es/blog/la-importancia-del-estudio-de-tiempos-de-trabajo/',
    '/que-es-el-estudio-de-tiempos-y-movimientos' => '/es/blog/que-es-el-estudio-de-tiempos-y-movimientos/',
    '/que-es-el-estudio-de-tiempos-y-movimientos/' => '/es/blog/que-es-el-estudio-de-tiempos-y-movimientos/',
    '/numero-de-observaciones-a-realizar-en-un-cronometraje-industrial' => '/es/blog/numero-de-observaciones-a-realizar-en-un-cronometraje-industrial/',
    '/numero-de-observaciones-a-realizar-en-un-cronometraje-industrial/' => '/es/blog/numero-de-observaciones-a-realizar-en-un-cronometraje-industrial/',
    '/etapas-del-estudio-de-tiempos-en-un-cronometraje-industrial' => '/es/blog/etapas-del-estudio-de-tiempos-en-un-cronometraje-industrial/',
    '/etapas-del-estudio-de-tiempos-en-un-cronometraje-industrial/' => '/es/blog/etapas-del-estudio-de-tiempos-en-un-cronometraje-industrial/',
    '/productividad-empresarial-con-control-de-tiempos-y-el-cronometraje-industrial' => '/es/blog/optimiza-la-productividad-empresarial-con-el-control-de-tiempos-y-el-cronometraje-industrial/',
    '/productividad-empresarial-con-control-de-tiempos-y-el-cronometraje-industrial/' => '/es/blog/optimiza-la-productividad-empresarial-con-el-control-de-tiempos-y-el-cronometraje-industrial/',
];

if (isset($redirects[$path])) {
    header('Location: ' . $redirects[$path]);
    exit;
}

// Handle old blog URLs
if (preg_match('/^\/balanceo-de-lineas-optimizando-la-eficiencia-en-procesos-de-manufactura/', $path)) {
    header('Location: /es/blog/balanceo-de-lineas-optimizando-la-eficiencia-en-procesos-de-manufactura/');
    exit;
}
if (preg_match('/^\/calculo-de-saturacion-en-un-estudio-de-tiempos/', $path)) {
    header('Location: /es/blog/calculo-de-saturacion-en-un-estudio-de-tiempos/');
    exit;
}
if (preg_match('/^\/que-es-el-cronometraje-industrial/', $path)) {
    header('Location: /es/blog/que-es-el-cronometraje-industrial/');
    exit;
}
if (preg_match('/^\/cuales-son-las-tecnicas-de-cronometraje-industrial/', $path)) {
    header('Location: /es/blog/cuales-son-las-tecnicas-de-cronometraje-industrial/');
    exit;
}

// Handle old lesson URLs
if (preg_match('/^\/leccion\/(.*)/', $path, $matches)) {
    header('Location: /es/blog/' . $matches[1] . '/');
    exit;
}

// Determine the file path to serve
$file_path = __DIR__ . $path;

// If the path doesn't have an extension, try to serve index.html
if (!pathinfo($path, PATHINFO_EXTENSION)) {
    if (substr($file_path, -1) !== '/') {
        $file_path .= '/';
    }
    $file_path .= 'index.html';
}

// Check if the file exists
if (file_exists($file_path) && !is_dir($file_path)) {
    // Determine the content type
    $extension = pathinfo($file_path, PATHINFO_EXTENSION);
    $content_types = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
        'otf' => 'font/otf',
        'xml' => 'application/xml',
        'txt' => 'text/plain',
    ];

    $content_type = isset($content_types[$extension]) ? $content_types[$extension] : 'application/octet-stream';

    // Set the content type header
    header('Content-Type: ' . $content_type);

    // Set caching headers for static assets
    if ($extension !== 'html') {
        header('Cache-Control: public, max-age=31536000'); // 1 year
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    } else {
        header('Cache-Control: no-cache, must-revalidate');
    }

    // Output the file content
    readfile($file_path);
    exit;
}

// If we get here, the file was not found
// Try to serve the 404 page
$not_found_path = __DIR__ . '/es/404/index.html';
if (file_exists($not_found_path)) {
    header('HTTP/1.0 404 Not Found');
    header('Content-Type: text/html');
    readfile($not_found_path);
    exit;
}

// If even the 404 page doesn't exist, show a simple error message
header('HTTP/1.0 404 Not Found');
echo '<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested URL was not found on this server.</p></body></html>';
exit;
?>
