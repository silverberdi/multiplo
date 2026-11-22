## Why

El Issue [#43 (V3-02)](https://github.com/silverberdi/multiplo/issues/43) necesita un receptor acotado para los agregados locales que ya calcula V3-01 (#42), sin convertir el navegador en una fuente de identidad ni exponer datos en el juego. Un Worker con D1 permitirá probar de forma aislada la ingestión, la deduplicación y sus controles usando datos sintéticos; la recopilación real y la integración con el cliente siguen pendientes del Issue #44 y de su gate de privacidad.

## What Changes

- Añadir un único endpoint público de escritura `POST /api/metrics` con contrato versionado y validación estricta de lotes agregados por fecha UTC y tabla, compatible con los datos calculables por #42.
- Persistir solo contadores agregados y pares dirigidos limitados en D1; aplicar deduplicación de ventana finita y escritura atómica ante reenvíos y concurrencia.
- Limitar superficie, tamaño y costo de cada petición; incorporar controles de tasa disponibles sin servicios pagos, errores compactos, comportamiento fail-closed y un kill switch apagado por defecto.
- Mantener credenciales exclusivamente operativas, D1 accesible solo desde el Worker y sin rutas públicas de lectura, administración o exportación. No afirmar que los datos identifican jugadores ni prueban aprendizaje.
- Añadir migración y pruebas aisladas de Worker/D1, además del contrato, retención, rollback, límites de seguridad y controles operativos.
- Registrar la excepción técnica acotada a D-017/D-020: este receptor no habilita envío desde el juego. No activar telemetría real, desplegar producción ni integrar cliente, Pages o informe mensual.

## Capabilities

### New Capabilities
- `anonymous-metrics-ingestion`: ingestión pública de agregados no autenticados mediante Worker/D1, con validación, deduplicación, atomicidad y límites de seguridad; no ofrece identidad verificable ni lectura pública.

### Modified Capabilities

## Impact

- **Issue:** #43 (V3-02); depende de las dimensiones y métricas locales de #42, ya cerrado. La integración del cliente, Pages, despliegue operativo y reporte mensual pertenecen a #44 y quedan fuera.
- **Código previsto:** `metrics/src/index.js`, migración D1, configuración Worker y pruebas aisladas Worker/D1; documentación de contrato y controles. El frontend y sus claves de progreso/historial no cambian.
- **Datos y seguridad:** solo agregados sintéticos en las pruebas; sin payload persistido, IP, user-agent, identificadores, secretos en cliente ni endpoints de lectura. El modo de ingesta comienza desactivado y la activación real requiere una decisión posterior de privacidad y operación.
