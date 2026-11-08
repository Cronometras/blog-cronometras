# Avisos centralizados de Cronometras

Contacto, información/demo, asistente y boletín conservan sus colecciones actuales
en Firestore. Cada alta guarda `notificationStatus: pending`,
`notificationRevision` y `notificado: false` junto con los datos, en la misma escritura.
El asistente conserva el diálogo completo de la sesión: mensajes del usuario y
respuestas del asistente, en orden e incluida la última respuesta mostrada.
Cada cambio del diálogo deja pendiente su versión actualizada. Los turnos que
lleguen antes de la revisión se agrupan en un único aviso; si la conversación
continúa después del envío, se envía una actualización en la siguiente revisión.
No se recuperan respuestas antiguas que el sistema anterior nunca guardó.

El proceso `scripts/send-lead-notifications.cjs` se ejecuta cada quince minutos en Oracle
mediante cron y `flock`. Envía exclusivamente a **info@cronometras.com**, con
Resend y el remitente verificado **no-reply@cronometras.com**. El `Reply-To` es
el email del interesado si tiene formato válido. Los avisos de boletín están
identificados como tales: no se cuentan como solicitudes de demo.

El registro pasa por `pending`, `sending`, `accepted` o `retry`. `accepted` y
`notificado: true` significan que Resend aceptó el mensaje, no que el usuario lo
haya leído ni que la entrega final esté garantizada. Se guarda el identificador
del proveedor para comprobar la entrega. Los fallos se reintentan con espera
creciente. Una transacción reserva el registro y una clave de idempotencia
estable evita duplicar un intento; los reintentos conservan exactamente el
mismo contenido. Tras 23 horas de incertidumbre se marca `manual_review` para
comprobar Resend antes de reenviar (la idempotencia del proveedor dura 24 horas).

## Operación

En Oracle, la configuración está fuera del repositorio:
`/home/ubuntu/.hermes/cronometras-notifications/config.json` (0600), dentro de
un directorio 0700. El lanzador `run.cjs` carga esa configuración. La cuenta de
servicio es la que ya utiliza el blog. No copiar secretos a este documento.

```sh
# Auditoría sin enviar
/home/ubuntu/.local/bin/node /home/ubuntu/.hermes/cronometras-notifications/run.cjs
# Procesar pendientes
/home/ubuntu/.local/bin/node /home/ubuntu/.hermes/cronometras-notifications/run.cjs --send
```

Cron (`*/15 * * * *`) conserva los trabajos anteriores. El log está en `sender.log` en el mismo
directorio privado y solo contiene referencias de documentos y estados.
`NOTIFICATIONS_SINCE` evita enviar automáticamente todos los registros antiguos
sin estado de aviso. Un registro antiguo que reciba un nuevo estado `pending`
(por ejemplo, una conversación completada) sí se procesa. No se elimina ningún
contacto ni se modifica su seguimiento comercial.

La auditoría del 8 de noviembre de 2026 encontró 54 registros históricos:
15 contactos, 32 solicitudes, 6 del asistente y 1 del boletín. Incluyen duplicados
y consultas académicas: no son 54 clientes potenciales cualificados. El campo
antiguo `notificado: true` del asistente no demuestra que se enviara el aviso.

## Validación y recuperación

`node --test scripts/form-notification-state.test.cjs scripts/send-lead-notifications.test.cjs` comprueba dirección,
Reply-To, aceptación, errores, idempotencia, reservas y cambios concurrentes.
Para una entrega en producción comprobar primero el registro en Firestore,
después el ID y estado en Resend y finalmente el correo recibido. Nunca enviar
pruebas a direcciones de interesados reales.

Si Oracle o cron están parados, los pendientes se conservan y se procesan al
recuperar el servicio. Para retirar el proceso, eliminar únicamente la línea
de cron etiquetada `cronometras-lead-notifications`. Los formularios seguirán
guardando solicitudes, pero los avisos quedarán pendientes.
