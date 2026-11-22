## 1. Alinear autoridad y contexto operativo

- [x] 1.1 Alinear `README.md`, `docs/INDEX.md`, `docs/OPENSPEC_HANDOFF.md`, `AGENTS.md` y `openspec/config.yaml` con el estado real del juego v1.2 y el backlog V3 vigente; limitar la autorización del #42 a historial local, sin reescribir cambios archivados.
- [x] 1.2 Actualizar D-020 sin borrar su antecedente: autorizar exclusivamente historial y agregados locales del Issue #42, con retención/límites, sin identificadores persistentes ni transmisión.
- [x] 1.3 Actualizar `docs/TRACEABILITY.md` y `docs/QUALITY_AND_VALIDATION.md` para cubrir RF-07/RNF-03/RNF-06, escenarios del historial, aislamiento de progreso y ausencia de red; corregir solo referencias directamente afectadas.

## 2. Registro local de sesiones y actividad

- [x] 2.1 Añadir el modelo versionado `multiplo_learning_history_v1`, lectura/escritura defensiva y límites de 256 KiB/1.200 registros, independiente de `multiplo_progression_v1`.
- [x] 2.2 Conectar `app.js` al inicio real de ronda, resolución de pregunta, cierre confirmado, retorno explícito a Inicio y recuperación de interrupción; mantener una sola sesión al repetir/avanzar y evitar duplicar cierres.
- [x] 2.3 Registrar por pregunta los datos del motor (`a`, `b`, `source`, primer intento, intentos, pista y resultado de dominio), sin leer el DOM ni incluir actividad sin resolver.
- [x] 2.4 Medir tiempo de sesión y resolución con reloj monotónico; pausar al ocultarse la pestaña y guardar por separado la fecha UTC de cada evento.

## 3. Métricas y retención acotada

- [x] 3.1 Crear funciones puras de métricas con denominadores correctos, cero como `null`/«Sin datos», separación actual/repaso y deltas por fecha UTC, tabla real y par dirigido cuando corresponda.
- [x] 3.2 Aplicar retención por fecha de evento a preguntas, rondas y sesiones, incluso dentro de sesiones largas/activas; mantener solo el sobre operativo mínimo de una ronda activa y compactar agregados una sola vez sin perder ni duplicar contadores.
- [x] 3.3 Degradar a memoria o descartar solo historial ante JSON inválido, versión desconocida, almacenamiento bloqueado, cuota excedida o compactación fallida; preservar siempre el progreso v1.2.

## 4. Verificación automatizada de los escenarios

- [x] 4.1 Añadir pruebas unitarias de fórmulas, cero denominador, primer intento tras reintentos, pista, actual/repaso, tabla/par dirigidos y fechas UTC.
- [x] 4.2 Añadir E2E sobre el flujo real para sesión con varias rondas, cierre único, abandono explícito, recarga interrumpida, tiempo pausado al ocultar la pestaña y continuidad sin conexión tras cargar.
- [x] 4.3 Probar migración sin cambios a `multiplo_progression_v1`, JSON corrupto/versión desconocida, `SecurityError`, `QuotaExceededError`, límites y expiración por evento dentro de una sesión larga/activa; confirmar idempotencia de marcadores y ausencia de solicitudes de métricas.
