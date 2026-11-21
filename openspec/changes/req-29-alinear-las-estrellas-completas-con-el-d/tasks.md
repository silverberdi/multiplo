# Tasks

## 1. Inventario y contrato de estado

- [x] 1.1 Inspeccionar `js/progression.js`, `js/question-engine.js`, `js/app.js` y sus callers/writers para mapear el estado actual de estrellas, dominio, cierre y `localStorage` a los escenarios del delta; verificar el inventario en el candidato y registrar cualquier ruta histórica que deba retirarse.
- [x] 1.2 Definir el resumen serializable de dominio con conteos actual/objetivo, requisitos cumplidos o pendientes, estado de tabla y acción siguiente; aplicar `>=3/4` en una sola ronda para tabla 1 y el dominio acumulado solo a tablas 2–10; verificar con pruebas unitarias que `4/4` no derive por sí solo en desbloqueo de tablas 2–10 y que la convención `a×b = a grupos de b` permanezca intacta (RF-06/RF-07, D-007/D-011/D-019).
- [x] 1.3 Mantener la migración de progreso local idempotente y defensiva al añadir métricas de dominio; verificar las conversiones legacy 1→1–2, 2→1–3, 3→1–4 y 4→1–5, conservar `multiplo_sound_enabled`/silencio y entradas válidas de `multiplo_failed_operations`, no convertir respuestas antiguas en evidencia, y cubrir recarga, JSON corrupto, `SecurityError`/cuota y ausencia de llamadas remotas (Q-08, RNF-06).

## 2. Selección de factores y evaluación

- [x] 2.1 Definir y conectar el contrato `pendingFactors`/`coveredFactors`: `progression.js` lo expone, `startNewRound` lo pasa y `createQuestionRound`/`selectRoundBValues` lo consume; priorizar factores `b` pendientes, evitar parejas repetidas dentro de una ronda cuando haya alternativas y conservar la prioridad acotada de errores; verificar con una secuencia determinista que siete factores distintos se cubren sin depender de `Math.random` ni sorteo indefinido (Q-03, Q-05, Q-06).
- [x] 2.2 Entregar al progreso únicamente factores de la tabla actual acertados en primer intento, separados del repaso; verificar que los reintentos no aumenten estrellas ni factores y que un factor repetido se cuente una sola vez (Q-04, RF-05/RF-06, D-019).
- [x] 2.3 Verificar exhaustivamente las invariantes matemáticas del catálogo y alternativas: tablas 1–10, factores 1–10, tres opciones distintas, una correcta, orientación de grupos y sin distractores equivalentes por conmutatividad; ejecutar `npm run test:unit` y conservar la salida como evidencia del Apply/Verify.

## 3. Progreso, cierre y acciones UI

- [x] 3.1 Conectar el cierre y la consulta de niveles al resumen de dominio, mostrando por separado estrellas de la ronda, rondas válidas y factores pendientes con texto breve en español; verificar el escenario 4/4 perfecto con dominio incompleto sin etiqueta de tabla terminada.
- [x] 3.2 Condicionar las acciones del cierre a la existencia y disponibilidad de la siguiente tabla; verificar un cierre 3/4 con la siguiente tabla bloqueada y un cierre de tabla 10 sin botón ni sugerencia de tabla 11, ofreciendo solo repetir o volver a niveles (Q-06/Q-07, RF-08).
- [x] 3.3 Mantener texto, pistas, voz/efectos y assets versionados (`celebrando.svg`, `pensando.svg`, `manzana.svg`, WAV existentes) sin bloquear el flujo; verificar que el fallback escrito siga permitiendo completar una ronda cuando la voz falla o está silenciada (Q-09, RNF-02).

## 4. Persistencia y desbloqueo

- [x] 4.1 Aplicar `>=3/4` en una ronda para desbloquear desde tabla 1 y el dominio acumulado únicamente desde tablas 2–10; conservar niveles ya abiertos y verificar una transición de cada regla, además de que el acceso permanezca tras recargar el mismo navegador (Q-05/Q-08, D-012).
- [x] 4.2 Verificar que fallos posteriores, respuestas corregidas y rondas de repaso no revoquen niveles ni satisfagan indebidamente el dominio; cubrir estados 0/4, 3/4 y 4/4 con pruebas automatizadas (Q-04–Q-08).
- [x] 4.3 Retirar de forma segura cualquier indicador, acción o markup sustituido que confunda estrellas con dominio o apunte a una tabla inexistente; verificar ausencia de callers activos de la ruta retirada y repetir la suite relevante después del retiro.

## 5. Verificación integrada y evidencia

- [x] 5.1 Ejecutar `npm run test` y `npm run test:unit`; verificar cobertura de factores repetidos, progreso pendiente, primer intento, cierre limitado y desbloqueo, registrando fallos sin declarar éxito no observado.
- [x] 5.2 Ejecutar `npm run test:e2e` con el Chromium configurado (`/opt/minime/runtime/playwright-browsers/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell`); verificar en un navegador real el cierre, las acciones condicionales, la recarga y cero overflow en los viewports declarados, con evidencia observable de cada escenario UI.
- [x] 5.3 Comparar producto → specs → design → código → pruebas → evidencia y actualizar `docs/TRACEABILITY.md` solo con comportamiento realmente implementado; verificar RF-06/RF-07/RF-08, RNF-05/RNF-06/RNF-07, Q-05–Q-10 y Request #29 antes de solicitar Verify/Archive.

Apply evidence: `npm run test` exit 0 (44 passed, 33 historical skipped), `npm run test:unit` exit 0 (25 passed), and `npm run test:e2e` exit 0 (2 passed). Fola assets are intentionally ignored and were validated with SHA-256 `202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929`.
