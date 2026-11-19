# Proposal

## Why

El juego ya cuenta con la base jugable y la preparación de voz Fola de Request #20, pero su contrato de progresión todavía limita las tablas a 2–5 y desbloquea con una sola ronda. Request #21 amplía ese valor a las tablas 1–10 con operaciones dirigidas completas, microdesafíos intercalados y evidencia acumulada de dominio, manteniendo la comprensión por grupos, la experiencia sin castigo y el progreso local.

La dependencia estricta está satisfecha: el change y PR de #20 fueron fusionados en `main` y archivados en OpenSpec antes de esta propuesta. La documentación MVP v1.0 aún contiene límites históricos; este change define la sustitución v1.2 en su alcance y deja la actualización de la documentación canónica como trabajo de implementación/documentación del mismo change.

## What Changes

- Ampliar el catálogo a tablas `1..10`, con las 100 parejas dirigidas `a×b`, `a` grupos de `b`, y representaciones visuales legibles para factores altos hasta `10×10`.
- Mantener una ronda de una actividad Aprende no evaluable y cuatro preguntas evaluables, pero variar modalidad, posición y orden; en tablas 2–10 usar tres preguntas actuales y un repaso de una tabla anterior disponible.
- Evitar duplicados dentro de una ronda, priorizar operaciones falladas con el historial local existente y favorecer cobertura de factores sin crear un sistema adaptativo complejo.
- Sustituir el desbloqueo único 3/4 por dominio determinista: mínimo en al menos 2 de las últimas 3 rondas de la tabla actual y aciertos iniciales en al menos 7 factores `b` distintos; el repaso no cuenta para ese dominio.
- Conservar cuatro estrellas máximas por ronda, primer intento inmutable, reintentos ilimitados, pistas y cierre positivo; los errores de repaso no afectan el dominio ni revocan progreso.
- Migrar una vez e idempotentemente `multiplo_progression_v1` por identidad de tabla, preservando desbloqueos, sonido y `multiplo_failed_operations`; definir un estado v1.2 tolerante a corrupción, bloqueo o cuota excedida de `localStorage` y permitir jugar en memoria.
- Reutilizar la preparación, catálogo y reproducción Fola de #20, los SVG/WAV existentes y la guía visual; no crear audios, backend, cuentas, IA, analítica, sincronización, tabla 11 ni assets gráficos nuevos.
- Actualizar las especificaciones/documentación canónica afectadas para retirar contradicciones del MVP v1.0, conservar trazabilidad a Request #21 y cubrir pruebas deterministas de matemáticas, dominio, migración, voz/fallback, almacenamiento y responsive.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `visual-group-multiplication-learning`: ampliar factores a tablas 1–10 y representar arreglos/grupos de hasta `10×10` sin perder orientación ni legibilidad.
- `question-round-engine`: introducir microdesafíos intercalados, selección no secuencial, cobertura de las 100 parejas, repaso y modalidades mezcladas sin distractores ambiguos.
- `level-progression-local-persistence`: reemplazar niveles 1–4 por disponibilidad de tablas 1–10, dominio acumulado, migración legacy idempotente y estado local v1.2 tolerante.
- `star-guide-voice-text`: conservar el contrato Fola de #20 para introducciones y eventos de las operaciones nuevas, con fallback textual y sin regenerar audio.
- `web-base-responsive-pwa`: adaptar la composición responsive a grupos y números de `10×10` en móviles estándar sin desbordamiento horizontal.

## Impact

- Código a evolucionar: `js/progression.js`, `js/question-engine.js`, `js/aprende.js`, `js/app.js`, `js/star-guide.js` y estilos responsive; se retirarán rutas/assumptions del límite v1.0 solo cuando queden sustituidas y verificadas.
- Tests: ampliar las suites unitarias y browser declaradas en `package.json` para las invariantes de 100 operaciones, modalidades, dominio, repaso, migración, persistencia, responsive y regresión de Fola #20. Las comprobaciones de UI navegable deben ejecutarse en Apply/Verify mediante el executor configurado.
- Datos: solo `localStorage` y memoria de sesión; no hay API pública, backend, base de datos ni cambio de identidad de usuario.
- Recursos: consumir `assets/objects/manzana.svg`, mascota, estrella de premio, efectos existentes y el catálogo Fola preparado por #20. La release de 490 clips se reutiliza con SHA-256 ya documentado; no se generan clips nuevos.
- Trazabilidad: Request #21, la matriz `docs/TRACEABILITY.md`, las decisiones/UX/modelo pedagógico afectados y los escenarios Gherkin entregados por la solicitud. La ejecución no incluye despliegue ni validación presencial con un niño.
