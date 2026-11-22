# Tasks

## 1. Retirar el control anidado de respuestas

- [x] 1.1 En `js/app.js`, eliminar de `renderCurrentQuestion()` la creación de `.btn-option-listen`, su icono, atributos `role`/`tabindex`/`aria-label` y listeners de clic/teclado, verificando que cada `.btn-option` conserva únicamente el listener de `handleOptionSelect(alt, btn)` y sus etiquetas visibles/ARIA (Request #46; escenarios de control único y selección inequívoca).
- [x] 1.2 En `css/styles.css`, retirar solo `.btn-option-listen` y `.btn-option-listen:focus-visible`, verificando mediante búsqueda y revisión de diff que permanecen intactas las reglas de `.btn-option`, foco, estados, grid, contraste y media queries (Request #46; escenario de retiro limitado de CSS).

## 2. Regresión de interacción y voz

- [x] 2.1 Revisar las pruebas existentes afectadas y añadir o ajustar una prueba pequeña de navegador en `tests/` que inicie una ronda real y verifique en las cuatro modalidades exactamente tres `.btn-option`, cero `.btn-option-listen`, ningún control interactivo descendiente y una sola transición al activar una respuesta por clic/toque (escenarios de alternativas sin interacción anidada y selección única).
- [x] 2.2 Extender la prueba de navegador para verificar `aria-label`/texto de operaciones, navegación Tab/Enter/Espacio, error y reintento, primer intento, estrellas, feedback, pista y progresión sin cambios; comprobar que `#btn-juego-sound` repite sin seleccionar y que `#btn-aprende-sound`/`#btn-sound-toggle` conservan sus contratos (RF-02/RF-04/RF-05; escenarios de reintento, voz y fallback).
- [x] 2.3 Hacer que el executor configurado ejecute las comprobaciones declaradas de navegador en Chromium real, incluyendo viewports móvil estrecho, tablet y escritorio, y verifique foco visible, áreas táctiles, legibilidad y ausencia de overflow; registrar comando, exit code, viewports y resultado observable sin delegar estas comprobaciones a human_validation (RNF-01/RNF-02/RNF-07; escenario responsive).

## 3. Verificación del alcance

- [x] 3.1 Ejecutar las pruebas pertinentes declaradas por el repositorio (`npm run test`, `npm run test:unit` y `npm run test:e2e`, según el alcance aprobado), verificando que pasan las invariantes de alternativas, matemáticas, cuatro modalidades, audio/fallback y responsive sin introducir dependencias runtime (Definition of Done de Request #46).
- [x] 3.2 Inspeccionar el diff y los consumidores para confirmar que no se modifican `question-engine.js`, `handleOptionSelect()` salvo necesidad demostrada por la prueba, assets, pipelines, telemetría V3, audio global o layout general; registrar evidencia de retiro seguro y actualizar documentación/trazabilidad solo si el cambio realmente la afecta.
- [x] 3.3 Entregar evidencia visual reproducible de la vista Juego en móvil y escritorio y dejar como seguimiento post-merge cualquier validación física de dispositivo, sin usarla para bloquear la evidencia automatizable de navegador (alcance limitado de Request #46).

## Apply evidence

- `npm run test:unit` → exit 0; 30 passed.
- `npm run test:e2e` → exit 0; 18 passed, Chromium real, serializado con `--test-concurrency=1`.
- `npm run test` → exit 0; 60 passed, 0 failed, 33 pre-existing skipped.
- Source search confirms no `.btn-option-listen` or `listenAlternative` remains in `js/` or `css/`; protected consumers have no diff.
- Chromium screenshots: `/tmp/multiplo-request-46-mobile.png`, `/tmp/multiplo-request-46-tablet.png`, `/tmp/multiplo-request-46-desktop.png` and `/tmp/multiplo-request-46-desktop.png` from the full game view. Physical-device validation remains post-merge follow-up.
