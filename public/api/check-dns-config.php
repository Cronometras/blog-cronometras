<?php
// Script para verificar la configuración de DNS para el envío de emails

// Desactivar warnings para evitar mensajes de error en la página
error_reporting(E_ERROR | E_PARSE);

// Set content type to HTML
header('Content-Type: text/html');

echo "<h1>Verificación de Configuración DNS para Emails</h1>";

// Función para verificar registros DNS
function checkDNSRecords($domain, $type) {
    $records = dns_get_record($domain, $type);
    return $records;
}

// Función para verificar registros SPF
function checkSPFRecord($domain) {
    $txtRecords = dns_get_record($domain, DNS_TXT);
    $spfRecords = [];
    
    foreach ($txtRecords as $record) {
        if (isset($record['txt']) && strpos($record['txt'], 'v=spf1') === 0) {
            $spfRecords[] = $record;
        }
    }
    
    return $spfRecords;
}

// Función para verificar registros DKIM
function checkDKIMRecord($selector, $domain) {
    $dkimDomain = $selector . '._domainkey.' . $domain;
    $txtRecords = dns_get_record($dkimDomain, DNS_TXT);
    return $txtRecords;
}

// Función para verificar registros DMARC
function checkDMARCRecord($domain) {
    $dmarcDomain = '_dmarc.' . $domain;
    $txtRecords = dns_get_record($dmarcDomain, DNS_TXT);
    return $txtRecords;
}

// Formulario para verificar la configuración de DNS
echo "<form method='get'>";
echo "<p><label>Dominio: <input type='text' name='domain' value='" . (isset($_GET['domain']) ? htmlspecialchars($_GET['domain']) : 'cronometras.com') . "' required></label></p>";
echo "<p><label>Selector DKIM (opcional): <input type='text' name='selector' value='" . (isset($_GET['selector']) ? htmlspecialchars($_GET['selector']) : 'k1') . "'></label></p>";
echo "<p><input type='submit' value='Verificar Configuración DNS'></p>";
echo "</form>";

// Si se ha enviado el formulario, verificar la configuración de DNS
if (isset($_GET['domain']) && !empty($_GET['domain'])) {
    $domain = $_GET['domain'];
    $selector = isset($_GET['selector']) ? $_GET['selector'] : 'k1';
    
    echo "<h2>Resultados para el dominio: " . htmlspecialchars($domain) . "</h2>";
    
    // Verificar registros MX
    echo "<h3>Registros MX</h3>";
    $mxRecords = checkDNSRecords($domain, DNS_MX);
    
    if (!empty($mxRecords)) {
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>Host</th><th>Prioridad</th><th>Target</th></tr>";
        
        foreach ($mxRecords as $record) {
            echo "<tr>";
            echo "<td>" . $record['host'] . "</td>";
            echo "<td>" . $record['pri'] . "</td>";
            echo "<td>" . $record['target'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<p style='color: red;'>No se encontraron registros MX para el dominio.</p>";
    }
    
    // Verificar registros SPF
    echo "<h3>Registros SPF</h3>";
    $spfRecords = checkSPFRecord($domain);
    
    if (!empty($spfRecords)) {
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>Host</th><th>TTL</th><th>Registro SPF</th></tr>";
        
        foreach ($spfRecords as $record) {
            echo "<tr>";
            echo "<td>" . $record['host'] . "</td>";
            echo "<td>" . $record['ttl'] . "</td>";
            echo "<td>" . $record['txt'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Verificar si el registro SPF incluye Resend
        $resendIncluded = false;
        foreach ($spfRecords as $record) {
            if (strpos($record['txt'], 'include:spf.resend.com') !== false || 
                strpos($record['txt'], 'include:_spf.resend.com') !== false) {
                $resendIncluded = true;
                break;
            }
        }
        
        if ($resendIncluded) {
            echo "<p style='color: green;'>✓ El registro SPF incluye Resend.</p>";
        } else {
            echo "<p style='color: red;'>✗ El registro SPF no incluye Resend. Deberías añadir 'include:spf.resend.com' a tu registro SPF.</p>";
        }
    } else {
        echo "<p style='color: red;'>No se encontraron registros SPF para el dominio.</p>";
        echo "<p>Deberías añadir un registro SPF para mejorar la entregabilidad de tus emails.</p>";
        echo "<p>Ejemplo: <code>v=spf1 include:spf.resend.com ~all</code></p>";
    }
    
    // Verificar registros DKIM
    echo "<h3>Registros DKIM (selector: " . htmlspecialchars($selector) . ")</h3>";
    $dkimRecords = checkDKIMRecord($selector, $domain);
    
    if (!empty($dkimRecords)) {
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>Host</th><th>TTL</th><th>Registro DKIM</th></tr>";
        
        foreach ($dkimRecords as $record) {
            echo "<tr>";
            echo "<td>" . $record['host'] . "</td>";
            echo "<td>" . $record['ttl'] . "</td>";
            echo "<td>" . (strlen($record['txt']) > 100 ? substr($record['txt'], 0, 100) . '...' : $record['txt']) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Verificar si el registro DKIM parece válido
        $dkimValid = false;
        foreach ($dkimRecords as $record) {
            if (strpos($record['txt'], 'v=DKIM1') !== false && strpos($record['txt'], 'p=') !== false) {
                $dkimValid = true;
                break;
            }
        }
        
        if ($dkimValid) {
            echo "<p style='color: green;'>✓ El registro DKIM parece válido.</p>";
        } else {
            echo "<p style='color: red;'>✗ El registro DKIM no parece válido. Verifica la configuración en Resend.</p>";
        }
    } else {
        echo "<p style='color: red;'>No se encontraron registros DKIM para el selector '" . htmlspecialchars($selector) . "'.</p>";
        echo "<p>Deberías configurar DKIM en Resend y añadir el registro DNS correspondiente.</p>";
    }
    
    // Verificar registros DMARC
    echo "<h3>Registros DMARC</h3>";
    $dmarcRecords = checkDMARCRecord($domain);
    
    if (!empty($dmarcRecords)) {
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>Host</th><th>TTL</th><th>Registro DMARC</th></tr>";
        
        foreach ($dmarcRecords as $record) {
            echo "<tr>";
            echo "<td>" . $record['host'] . "</td>";
            echo "<td>" . $record['ttl'] . "</td>";
            echo "<td>" . $record['txt'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Verificar si el registro DMARC parece válido
        $dmarcValid = false;
        foreach ($dmarcRecords as $record) {
            if (strpos($record['txt'], 'v=DMARC1') !== false) {
                $dmarcValid = true;
                break;
            }
        }
        
        if ($dmarcValid) {
            echo "<p style='color: green;'>✓ El registro DMARC parece válido.</p>";
        } else {
            echo "<p style='color: red;'>✗ El registro DMARC no parece válido.</p>";
        }
    } else {
        echo "<p style='color: red;'>No se encontraron registros DMARC para el dominio.</p>";
        echo "<p>Deberías añadir un registro DMARC para mejorar la entregabilidad de tus emails.</p>";
        echo "<p>Ejemplo: <code>v=DMARC1; p=none; rua=mailto:dmarc@" . htmlspecialchars($domain) . "</code></p>";
    }
    
    // Recomendaciones
    echo "<h3>Recomendaciones</h3>";
    echo "<ol>";
    echo "<li>Verifica que el dominio '" . htmlspecialchars($domain) . "' esté verificado en Resend</li>";
    echo "<li>Configura SPF, DKIM y DMARC correctamente para mejorar la entregabilidad de tus emails</li>";
    echo "<li>Asegúrate de que los registros DNS estén correctamente configurados según las instrucciones de Resend</li>";
    echo "<li>Si los emails siguen sin llegar, contacta con el soporte de Resend para obtener ayuda</li>";
    echo "</ol>";
}

// Información adicional
echo "<h2>Información Adicional</h2>";
echo "<p>Este script verifica la configuración de DNS para el envío de emails desde tu dominio.</p>";
echo "<p>Para que los emails se entreguen correctamente, debes configurar los siguientes registros DNS:</p>";
echo "<ul>";
echo "<li><strong>SPF</strong>: Permite a los servidores de correo verificar que los emails enviados desde tu dominio provienen de servidores autorizados</li>";
echo "<li><strong>DKIM</strong>: Firma digitalmente los emails para verificar que no han sido modificados en tránsito</li>";
echo "<li><strong>DMARC</strong>: Define qué hacer con los emails que no pasan las verificaciones SPF o DKIM</li>";
echo "</ul>";
echo "<p>Para configurar estos registros, sigue las instrucciones de Resend en su panel de control.</p>";
?>
