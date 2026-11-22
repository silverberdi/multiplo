## 1. Worker aislado y contrato de entrada

- [x] 1.1 Añadir Worker mínimo bajo `metrics/`, configuración Wrangler y binding exclusivo de D1 local/de prueba, sin incorporarlo al artefacto o deploy de Pages.
- [x] 1.2 Implementar solo `POST /api/metrics`; limitar cuerpo a 4 KiB y validar UTF-8, Content-Type, esquema v1 cerrado, UUID v4, fecha UTC, rangos, campos extra, overflow y coherencia antes de tocar D1.
- [x] 1.3 Alinear los campos aceptados con los agregados calculables por #42; tratar `table` como `a` del par dirigido y permitir máximo 10 valores `b` por lote, sin mezclar operaciones de distintas tablas.

## 2. Persistencia D1 e idempotencia

- [x] 2.1 Crear la migración D1 mínima para agregados diarios por tabla, agregados por par dirigido y claves/tiempos mínimos de deduplicación, sin payload, IP ni user-agent.
- [x] 2.2 Persistir con consultas parametrizadas y un batch transaccional condicionado a la inserción efectiva del `batchId`; demostrar suma, repetición idempotente, carrera concurrente y rollback de todo el lote ante fallo.
- [x] 2.3 Implementar retención de agregados de 24 meses y deduplicación finita de 30 días, superior a los 7 días de cola/reintentos establecidos en #44; documentar que la garantía de deduplicación no continúa tras expirar.
- [x] 2.4 Documentar y probar la purga de deduplicación como mantenimiento autenticado fuera de HTTP, sin cron, systemd ni scheduler.

## 3. Seguridad, privacidad y límites operativos

- [x] 3.1 Mantener `METRICS_INGEST_ENABLED=false` por defecto y demostrar que apagado rechaza antes de leer/escribir D1; proteger respuestas y logs de payload, SQL, IP y user-agent.
- [x] 3.2 Implementar CORS/Origin limitado sin considerarlo autenticación, sin endpoints de lectura/administración/exportación y sin secretos en el cliente; hacer que cuota, D1 y fallos de ruta fallen cerrados sin fallback a Pages.
- [x] 3.3 Comprobar disponibilidad y alcance real de WAF/rate limiting de Cloudflare Free para aislar host y ruta; solo documentar/configurar una regla si no afecta otros hosts. Si no puede aislarse, dejar constancia del bloqueo y mantener la ingesta apagada; no ampliar la regla ni habilitar facturación.
- [x] 3.4 Definir límites de trabajo/tasa por petición compatibles con recursos Free, respuesta 429 cuando aplique y umbrales prudentes para IP compartidas; documentar cuotas y comportamiento ante agotamiento sin prometer protección ante abuso distribuido.

## 4. Pruebas integradas de Worker y D1

- [x] 4.1 Ejecutar la migración real en D1 local y probar lotes válidos, acumulación por fecha/tabla/par dirigido, repaso, medianoche UTC, fecha antigua/futura y límites de retención.
- [x] 4.2 Probar en Worker local la carrera con batchId repetido, atomicidad ante fallos, payload hostil/inyección SQL, rutas y métodos incorrectos, ausencia de lectura, kill switch, cuotas simuladas y aislamiento del juego/hosts vecinos.
- [x] 4.3 Conservar evidencia reproducible del runtime Worker y filas persistidas en D1 local; no presentar mocks aislados como prueba de atomicidad ni usar D1 productiva.

## 5. Documentación de límites y privacidad

- [x] 5.1 Documentar contrato v1, esquema/migración/rollback, retención, purga, límites del plan y controles WAF/rate limiting realmente disponibles.
- [x] 5.2 Actualizar la decisión que matiza D-017/D-020 para autorizar solo un receptor técnico apagado para datos reales; explicar falsificabilidad, metadatos/logs, acceso, supresión de celdas de bajo volumen y gate de privacidad infantil previo a cualquier activación.
- [x] 5.3 Confirmar que frontend, `multiplo_progression_v1`, historial local de #42, Pages y rutas/servicios vecinos no cambian y que no se añadieron despliegue productivo ni integración de cliente de #44.
