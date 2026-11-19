# Tasks

## 1. Catálogo y modelo de ronda

- [x] 1.1 Inventariar los consumidores de `js/progression.js`, `js/question-engine.js`, `js/aprende.js`, `js/app.js` y `js/star-guide.js`, y fijar el contrato dirigido `a×b = a grupos de b`; verificar que el inventario se adjunta a Request #21 y no introduce una ruta paralela.
- [x] 1.2 Ampliar el catálogo a `a=1..10`, `b=1..10` y verificar con tests deterministas que existen exactamente 100 parejas, que `2×3` y `3×2` conservan orientación y que ningún producto se omite (spec `visual-group-multiplication-learning`, `question-round-engine`).
- [x] 1.3 Evolucionar el planificador de ronda para producir Aprende + cuatro preguntas, tres actuales y un repaso para tablas 2–10, cuatro actuales para tabla 1, sin parejas repetidas y con orden/modalidad/posición mezclados; verificar escenarios de tabla 1, tabla 7 y mezcla no secuencial.
- [x] 1.4 Reutilizar `multiplo_failed_operations` como prioridad limitada, separar origen actual/repaso y depurar una entrada cuando corresponda a un acierto inicial posterior; verificar que una operación fallada reaparece sin crear adaptación compleja.

## 2. Matemáticas, visualización y UI responsive

- [x] 2.1 Actualizar `js/aprende.js` y el render de pistas para mostrar `a` grupos de `b` con manzana SVG, suma repetida y producto; verificar extremos `1×1`, `3×2`, `2×3`, `5×5` y `10×10` con etiquetas equivalentes.
- [x] 2.2 Adaptar CSS grid/flex y tipografía para arreglos/agrupaciones de 25–100 objetos; verificar en Chromium 360×667, 412×915, tablet y escritorio que no existe `scrollWidth > clientWidth` ni texto ilegible.
- [x] 2.3 Actualizar modalidades y distractores para que haya exactamente tres alternativas distintas y una sola correcta, excluyendo productos equivalentes por conmutatividad; verificar resultados numéricos, operaciones candidatas y posición aleatoria.
- [x] 2.4 Retirar de forma segura las aserciones heredadas que codifiquen límites 2–5/factores 1–5 u orden fijo, conservando sus invariantes válidas; verificar que las suites modificadas y la cobertura `3×2` siguen pasando.

## 3. Dominio, estrellas y persistencia

- [x] 3.1 Definir e implementar el estado v1.2 con versión, tablas abiertas, historial de últimas tres rondas por tabla, factores `b` cubiertos y errores priorizables; verificar límites, monotonicidad y que las estrellas no sustituyen la métrica de dominio.
- [x] 3.2 Implementar el cálculo de dominio con los umbrales conjuntos de tabla 1 (`>=3/4`) y tablas 2–10 (`>=2/3`) más siete factores distintos; verificar que una ronda perfecta no desbloquea sola y que el repaso no cuenta.
- [x] 3.3 Implementar migración idempotente de `multiplo_progression_v1` para legacy 1, 2, 3 y 4, conservando `multiplo_sound_enabled` y entradas válidas de `multiplo_failed_operations`; verificar los cuatro mapeos y recarga sin duplicación.
- [x] 3.4 Implementar recuperación defensiva para JSON corrupto, `SecurityError`, localStorage ausente y cuota excedida; verificar que el juego continúa en memoria, muestra aviso adulto y no hace llamadas remotas.
- [x] 3.5 Actualizar cierre de ronda en `js/app.js` para mostrar hasta cuatro estrellas, no revocar tablas, desbloquear solo la siguiente y ofrecer repetir/practicar tras tabla 10; verificar cierre positivo con fallos actuales, fallo de repaso y ausencia de tabla 11.

## 4. Voz y recursos de #20

- [x] 4.1 Extender la selección de `js/star-guide.js`/catálogo Fola a introducciones, Aprende, preguntas, pistas y cierre de tablas 1–10 usando únicamente IDs/rutas presentes en el manifest preparado; verificar que no se añade TTS ni audio nuevo.
- [x] 4.2 Mantener cancelación, repetir, silencio, fallback textual y reproducción posterior al gesto de selección; verificar regresión de voz Fola #20, clip ausente/rechazado, no solapamiento y preferencia persistida.
- [x] 4.3 Verificar referencias a `manzana.svg`, mascota, `estrella-premio.svg` y efectos WAV existentes; confirmar que no se crean assets gráficos ni se descarga el ZIP durante una partida.

## 5. Documentación y trazabilidad canónica

- [x] 5.1 Actualizar `docs/LEARNING_MODEL.md`, `docs/USER_EXPERIENCE.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/TRACEABILITY.md`, `docs/QUALITY_AND_VALIDATION.md` y, si corresponde, `docs/MVP.md` para que v1.2 sustituya explícitamente los límites históricos sin borrar principios de no castigo.
- [x] 5.2 Registrar Request #21, dependencia fusionada/archivada de #20, recursos Fola y escenarios Gherkin en los documentos afectados; verificar enlaces y que no se afirma despliegue, prueba presencial ni funcionalidad no implementada.

## 6. Verificación integrada

- [x] 6.1 Ejecutar `npm run test:unit` y verificar catálogo, modalidades, grupos, estrellas, dominio, migración, sonido, almacenamiento corrupto y cierre de tabla 10.
- [x] 6.2 Implementar y ejecutar con el executor configurado `npm run test:e2e` para navegación real, mezcla de rondas, primer intento, repaso independiente, Fola/fallback y viewports responsive; conservar resultados observables por escenario.
- [x] 6.3 Ejecutar `npm run test` tras retirar rutas v1.0 y verificar la suite completa sin regresiones de #20; revisar `git diff` para confirmar que solo se modifican código/tests/documentación y artefactos de este Change.
- [x] 6.4 Ejecutar la validación OpenSpec del Change y resolver cualquier inconsistencia entre proposal, specs, design, tasks y comportamiento antes de solicitar Apply/Verify o archive.
