<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

echo "=== RESEND API KEY DEBUG ===\n\n";

// Paths to check for .env (including correct path for this server)
$paths = [
    __DIR__ . '/../.env',                    // public_html/.env (desde api/)
    __DIR__ . '/../../.env',                 // cronometras.com/.env
    '/home/micaot/web/cronometras.com/public_html/.env',  // Absolute path
    '/home/micaot/web/cronometras.com/.env', // Outside public_html
];

echo "Current dir: " . __DIR__ . "\n\n";

echo "Checking .env locations:\n";
foreach ($paths as $i => $path) {
    $exists = file_exists($path);
    echo "[$i] $path\n";
    echo "    Exists: " . ($exists ? "YES" : "NO") . "\n";
    if ($exists) {
        echo "    Real path: " . realpath($path) . "\n";
    }
    echo "\n";
}

// Find and read API key
echo "Looking for RESEND_API_KEY:\n";
$found = false;
foreach ($paths as $path) {
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            if (strpos($line, 'RESEND_API_KEY') === 0) {
                $parts = explode('=', $line, 2);
                if (count($parts) == 2) {
                    $key = trim($parts[1], " \t\n\r\0\x0B\"'");
                    echo "FOUND in: " . realpath($path) . "\n";
                    echo "Key starts with: " . substr($key, 0, 15) . "\n";
                    echo "Key ends with: " . substr($key, -10) . "\n";
                    echo "Key length: " . strlen($key) . " chars\n";
                    echo "\nExpected start: re_TbpjtUfE_oZw\n";
                    echo "Match: " . (strpos($key, 'TbpjtUfE') !== false ? "YES" : "NO - DIFFERENT KEY!") . "\n";
                    $found = true;
                }
                break 2;
            }
        }
        if (!$found) {
            echo "RESEND_API_KEY not found in: " . realpath($path) . "\n";
        }
        break;
    }
}

if (!$found) {
    echo "ERROR: Could not find RESEND_API_KEY in any .env file!\n";
}
?>
