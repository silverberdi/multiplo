## Why

Múltiplo v1.2 ya calcula resultados de preguntas y resúmenes inmutables de ronda, pero no conserva un historial educativo que permita obtener métricas coherentes sin leer la interfaz ni alterar la progresión. El Issue [#42](https://github.com/silverberdi/multiplo/issues/42) autoriza añadir ese historial únicamente en el navegador para preparar agregados locales; no autoriza telemetría, sincronización ni transmisión.

## What Changes

- Añadir una capacidad local versionada para registrar sesiones de práctica, rondas y preguntas concluidas, incluida la distinción entre actividad actual y repaso, primer intento, pistas, reintentos y tiempo activo.
- Producir métricas y deltas agregados mediante funciones puras, agrupados por fecha UTC y tabla, con desgloses dirigidos `a×b` cuando apliquen. Los denominadores vacíos se representan como «sin datos»/`null`.
- Mantener el historial separado de `multiplo_progression_v1`; los fallos de persistencia, datos inválidos y límites de almacenamiento no deben impedir jugar ni cambiar el progreso.
- Limitar a 90 días el detalle de cada evento educativo según su propia fecha, incluso dentro de sesiones largas; conservar solo el estado operativo mínimo de una sesión activa y los agregados permitidos.
- Actualizar D-020 y la trazabilidad documental para autorizar solo este historial local agregado, dejando explícito que no se envían datos ni se crean identificadores persistentes de niño o dispositivo.
- Corregir los documentos de entrada que aún afirman que el juego no está implementado, que el MVP es v1.0 o que el backlog vigente termina en #7; dejar claro que el repositorio ya contiene Múltiplo v1.2 y que el Issue #42 es una extensión local sin telemetría.
- Probar registro único de actividades concluidas, sesiones con varias rondas, abandono explícito, interrupción, tiempo activo con la pestaña oculta, límites/retención, migración independiente, aritmética y ausencia de solicitudes de métricas.

## Capabilities

### New Capabilities
- `learning-history-local-metrics`: historial educativo local, métricas derivadas y agregación reproducible por fecha UTC, tabla y operación, sin transmisión.

### Modified Capabilities

## Impact

- **Issue:** #42 — V3-01, historial educativo local y métricas derivadas sin telemetría.
- **Trazabilidad:** RF-07 (persistencia local), RNF-03 (privacidad) y RNF-06 (persistencia sin sincronización); se deberá extender la matriz para identificar el nuevo comportamiento sin presentar el historial como telemetría.
- **Código previsto:** integración acotada en `js/app.js`, consumo de los resúmenes de `js/question-engine.js` y `js/progression.js`, y un módulo pequeño de historial/métricas si resulta necesario.
- **Persistencia:** nueva clave versionada `multiplo_learning_history_v1`; `multiplo_progression_v1` y las reglas de juego permanecen intactos.
- **Red e infraestructura:** sin endpoint, cola de envío, llamadas HTTP, backend, Worker, D1, dependencias runtime ni nuevos servicios.
- **Documentación:** alinear de forma acotada `README.md`, `docs/INDEX.md`, `docs/OPENSPEC_HANDOFF.md`, `AGENTS.md` y `openspec/config.yaml` con el estado real de `main` y el backlog actual; registrar la excepción local del Issue #42 en D-020 y actualizar trazabilidad/calidad relacionadas. Los archivos de cambios archivados siguen siendo historia y no se reescriben.
