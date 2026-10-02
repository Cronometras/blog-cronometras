# Documentación del asistente

El asistente consulta apartados del manual y de la web según cada pregunta.
Las instrucciones comerciales siguen en `functions/api/assistant.ts`; el resumen
de producto sirve de orientación, pero ya no es la única fuente de conocimiento.

Fuentes del índice:

- `manual-usuario.md`: copia completa de `1. APP/src/Manual de usuario.md`,
  actualizado el 2 de marzo de 2026, incluidos los apartados finales de vídeo y voz.
- `manual-importacion-excel.md` y `manual-biblioteca-elementos.md`: manuales
  especializados de `1. APP/docs`.
- Todas las páginas funcionales en español de `src/content/pages/es` y
  `src/content/features/es/index.mdx`.
- Datos oficiales de `src/config/config.json` y lectura de las páginas públicas
  de producto: inicio, nosotros, contacto, características, servicio de estudio
  y todas las páginas funcionales solicitadas.
- Página de listado del blog; sus artículos completos quedan excluidos por
  petición del usuario. No se siguen enlaces ni se consulta el sitemap.
  También se excluyen formularios, scripts y datos de la app.

`npm run assistant:knowledge` regenera el índice; también se ejecuta antes de
`npm run build` y `npm run dev`. Si se actualiza el manual en la app, actualizar
su copia aquí y regenerar. Los cambios de las páginas funcionales se incorporan
automáticamente al compilar. Si una página pública no responde, se conserva la
documentación local, incluidos los datos de contacto del código fuente.

El índice se incluye en la función del asistente; no necesita credenciales
adicionales, un servicio externo de búsqueda ni una petición de red por pregunta.
La búsqueda admite preguntas en castellano e inglés y usa las preguntas recientes
para contextualizar seguimientos. Entrega hasta ocho apartados completos al modelo,
con un límite de contexto. La recuperación es por términos, no una búsqueda semántica.

Los documentos son referencias, no instrucciones. Las reglas comerciales y
correcciones de producto prevalecen sobre afirmaciones antiguas de los manuales,
por ejemplo sobre sistemas de tiempos predeterminados o integraciones ERP.
Los artículos del blog aportan teoría; no demuestran que una función esté
implementada en la app. Las páginas de producto y manuales tienen prioridad.

Validación: `node scripts/test-assistant-knowledge.cjs`.
