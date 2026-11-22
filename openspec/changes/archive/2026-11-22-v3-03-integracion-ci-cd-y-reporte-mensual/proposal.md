## Why

Los agregados de actividad de V3-01 permanecen locales y el receptor de V3-02 no está conectado; por eso aún no se puede generar un informe operativo mensual. Además, el workflow de Pages publica la raíz completa del repositorio, lo que expondría los archivos del Worker. V3-03 integra estas piezas con publicación aislada y mantiene la telemetría real apagada hasta aprobar privacidad y operación.

## What Changes

- Conectar los deltas agregados de #42 con el endpoint de #43 mediante una cola local acotada, lotes idempotentes y reintentos limitados; por defecto no enviar ni acumular datos para transmisión futura.
- Publicar Pages desde una allowlist estática y ejecutar Pages y Worker en workflows independientes. Probar en PR sin despliegue productivo; reservar despliegue de Worker y migraciones productivas a pasos explícitos protegidos.
- Generar bajo demanda un informe mensual UTC reproducible, CSV y Markdown, usando D1 por acceso administrativo autenticado y métricas de tráfico Cloudflare; incluir una versión sintética y documentar límites de procedencia y muestras pequeñas.
- Actualizar la documentación operativa, privacidad, permisos de secretos, migración/rollback, límites y gates de activación.

La integración no cambia las reglas ni el progreso del juego. Sin aprobación de privacidad infantil y autorización operativa explícitas, no hay transmisión de actividad real ni despliegue o migración productivos automáticos.

## Capabilities

### New Capabilities

- `metrics-integration-operations`: despliegues aislados de Pages/Worker, controles de privacidad y operación, y generación manual de informes mensuales reproducibles.

### Modified Capabilities

- `learning-history-local-metrics`: permitir la transmisión opcional y explícitamente autorizada de deltas ya agregados, manteniendo recolección local, juego y progreso independientes cuando la transmisión está apagada.

## Impact

Cliente HTML/CSS/JS y almacenamiento local de #42; Worker/D1 separado de #43; workflows de GitHub Actions para Pages y Cloudflare; scripts administrativos de solo lectura, documentación y reportes. Depende del contrato y esquema implementados en #43. No añade cuentas, identidad de jugadores, servicios pagos, cron, panel web, servidor propio ni despliegue automático a producción.
