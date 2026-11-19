# Tasks

## 1. Preparación reproducible del catálogo Fola

- [x] 1.1 Añadir el script npm estándar para descargar la URL fija de `assets-fola-v1.1.0`, verificar SHA-256 `202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929` y fallar antes de extraer ante checksum incorrecto; verificarlo con fixtures de ZIP válido y alterado (Request #20, `fola-audio-assets`, escenario “ZIP alterado o incompleto”).
  - [PUBLISHED_EVIDENCE source="GitHub release silverberdi/multiplo assets-fola-v1.1.0/multiplo-fola-v1.1.0-audios-490.zip"; sha=202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929]
- [x] 1.2 Implementar extracción segura y validación de `manifest.json`, 490 `clips[]`, rutas, hashes, `audios/*.wav`, catálogos 01–25 y cobertura de IDs usados; verificar éxito y diagnóstico explícito sin descargar en los tests unitarios (Request #20, escenarios de preparación y cobertura).
  - [PUBLISHED_EVIDENCE source="GitHub release silverberdi/multiplo assets-fola-v1.1.0/multiplo-fola-v1.1.0-audios-490.zip"; sha=202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929]
- [x] 1.3 Añadir la carpeta de salida generada al `.gitignore`, documentar regeneración tras limpieza y comprobar que ningún WAV Fola aparece en el diff o en los artefactos versionados (contrato de binarios, RNF-03/RNF-04).

## 2. Catálogo y coordinación de reproducción

- [x] 2.1 Crear el índice/selector Fola por evento y contexto `{a,b,producto,modalidad}`, rechazando IDs inexistentes o texto matemáticamente incompatible; verificar `3×2` como tres grupos de dos y cobertura de eventos sin alterar `question-engine.js` (spec `star-guide-voice-text`, RF-02/RNF-05).
  - [PUBLISHED_EVIDENCE source="GitHub release manifest.json de assets-fola-v1.1.0"; sha=202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929]
- [x] 2.2 Implementar el adaptador de reproducción bajo demanda con dobles inyectables, estado de una narración vigente, cancelación al cambiar pantalla/pregunta y liberación de referencias; verificar ausencia de solapamientos y descarte de callbacks tardíos (escenarios de cancelación y no solapamiento).
- [x] 2.3 Migrar `js/star-guide.js` y sus callers de `speechSynthesis` a Fola, conservando la fachada necesaria para `js/app.js`, `js/aprende.js` y preguntas; retirar rutas de síntesis y verificar que no existe uso runtime de `speechSynthesis` como sustituto (RF-02, no-objetivo TTS).
- [x] 2.4 Coordinar Fola con `acierto.wav`, `intento.wav`, `celebracion.wav`, `clic.wav` y los SVG `normal/hablando/pensando/celebrando`, con fallback no bloqueante ante `load`/`play` fallido; verificar estado visual y que efectos no compiten con la voz (spec de guía).

## 3. Flujo infantil, controles y persistencia

- [x] 3.1 Conectar la narración automática al gesto inicial de `Jugar`/selección de tabla, a Aprende, preguntas, alternativas, pistas, aciertos/errores y cierre, manteniendo texto e imágenes visibles; verificar una ronda completa sin segundo botón de inicio (Q-01/Q-09, escenarios de entrada y recorrido).
- [x] 3.2 Implementar `Repetir` para el contexto relevante y controles de escucha separados de alternativas; verificar que escuchar una alternativa o repetir no cambia selección, intentos, estrellas, ronda ni progreso (escenarios de repetición y escucha no evaluable).
- [x] 3.3 Hacer que toques en grupos no evaluables emitan como máximo una indicación contextual deduplicada, sin seleccionar respuestas ni generar bucles; verificarlo en Aprende y pistas con el motor de cuatro preguntas intacto (RF-03/RF-04).
- [x] 3.4 Integrar silencio inmediato y reactivación con `multiplo_sound_enabled`/estado existente, cancelando voz y efectos y conservando la preferencia tras recarga; verificar que reactivar no duplica narraciones ni altera el progreso (RF-02, RF-07).

## 4. Pruebas automatizadas y regresión

- [x] 4.1 Añadir pruebas unitarias para manifest/selector, correspondencia matemática, IDs/rutas, error de recurso, fallo de reproducción, cancelación, repetición, silencio y fallback con dobles; verificar con `npm run test:unit` sin descargar el ZIP en cada ejecución.
- [x] 4.2 Actualizar las pruebas de `aprende`, `question-engine`, `progression` y cierre para demostrar que siguen vigentes las tablas 2–5, `a×b = a grupos de b`, cuatro preguntas, tres opciones, primer intento y desbloqueo 3/4; verificar con `npm run test`.
- [x] 4.3 Añadir/actualizar checks browser declarados para autoplay tras gesto, navegación, controles separados, cancelación, silencio persistente, fallback y responsive en móvil/tablet/escritorio; el ejecutor configurado verificará con `npm run test:e2e` y conservará evidencia observable.
- [x] 4.4 Ejecutar la revisión final de trazabilidad contra Request/issue #20, issue #2, RF-02, RNF-02, RNF-05, RNF-06, Q-01/Q-09/Q-10 y `docs/ASSETS.md`; verificar que la documentación afectada describe la release, recuperación y ausencia de Drive, sin afirmar despliegue o validación con un niño.
