# Proposal

## Why

El MVP acompaña al niño con síntesis de voz del navegador, pero una voz robótica o ausente reduce la autonomía de un niño de seis años que todavía no lee fluidamente. La release versionada Fola v1.1.0 permite sustituir esa dependencia por locuciones pregrabadas, con correspondencia matemática verificable y fallback visual/textual, sin añadir backend ni servicios de voz en tiempo de juego.

## What Changes

- Preparar de forma reproducible el ZIP público `multiplo-fola-v1.1.0-audios-490.zip`, verificando exactamente su SHA-256, manifiesto, rutas, hashes y cobertura de IDs usados; extraerlo a una ubicación estática generada e ignorada por Git.
- Incorporar un catálogo/selector de locuciones Fola que elija por evento y operación matemática real, cargue audio bajo demanda o por bloque activo y cancele narraciones obsoletas.
- Sustituir la narración de `speechSynthesis` por Fola pregrabada en bienvenida, Aprende, instrucciones, preguntas, alternativas, pistas, aciertos/errores y cierre; mantener texto, imágenes y controles utilizables si falta o falla audio.
- Habilitar la narración inicial tras la única interacción permitida por autoplay, con Repetir independiente de seleccionar respuestas y sin contar la escucha como intento.
- Coordinar voz, efectos WAV existentes, estados SVG de la mascota, navegación y silencio persistente sin solapamientos ni reproducciones en bucle.
- Mantener intactas las tablas 2–5, la convención `a×b = a grupos de b`, las cuatro preguntas, el primer intento, las pistas, el progreso local y la navegación responsive.
- Documentar la preparación/recuperación del recurso y actualizar únicamente la documentación afectada; no incluir los 490 WAV en commits ni en el historial Git.

## Capabilities

### New Capabilities

- `fola-audio-assets`: preparación reproducible, validación de integridad y disponibilidad del catálogo Fola desde la release versionada, sin credenciales de Drive ni publicación parcial silenciosa.

### Modified Capabilities

- `star-guide-voice-text`: cambia la fuente de narración de síntesis nativa a clips Fola pregrabados, amplía la cobertura automática por evento/operación y precisa cancelación, fallback, repetición, silencio y coordinación con efectos.

## Impact

- Afecta el coordinador existente de guía/voz (`js/star-guide.js`), el flujo de pantallas (`js/app.js`), Aprende, motor de preguntas y progresión solo donde deban emitir o cancelar narración; no crea un segundo coordinador.
- Añade un script estándar de npm para descargar/verificar/extraer/validar el ZIP y una carpeta estática generada explícitamente ignorada por Git; los WAV no se versionan.
- Reutiliza `normal.svg`, `hablando.svg`, `pensando.svg`, `celebrando.svg`, los cuatro efectos WAV y las rutas existentes; consume Fola desde recursos estáticos preparados, nunca desde Drive, TTS o IA en runtime.
- Requiere pruebas unitarias/integración con dobles de reproducción para catálogo, preparación, selección, cancelación, silencio, repetición, fallback y regresión del motor/progreso, además de checks browser declarados para los flujos UI responsive.
- Trazabilidad principal: Request/issue #20 (V2-01), issue MVP #2, RF-02, RNF-02, RNF-05, RNF-06 y escenarios Q-01/Q-09/Q-10; no modifica el alcance pedagógico de V2-02.
