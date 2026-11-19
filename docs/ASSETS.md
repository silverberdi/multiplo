# Recursos multimedia — Múltiplo v1.2

## Request #21

La ampliación reutiliza `assets/objects/manzana.svg`, las mascotas, `estrella-premio.svg` y los WAV existentes. El catálogo Fola mantiene su SHA-256 documentado; la partida no descarga el ZIP ni genera assets nuevos.

**Propósito:** catálogo de recursos entregados para que el agente los consuma en los issues. El contenido de `assets/` no constituye implementación del juego.

## Guía visual
- Estilo infantil, limpio y alegre; mascota estrella amarilla de cinco puntas.
- Colores de referencia: azul `#2D6CDF`, amarillo `#FFD83D`, verde `#34C759`, coral `#FF6868`, morado `#A66DFF` y azul muy claro `#E6F5FF`.
- Texto primario azul profundo `#17336F` sobre fondos claros.
- Botones y números muy grandes; no recargar las pantallas con elementos decorativos.

## Mascota (SVG vectorial escalable)
- [normal.svg](../assets/mascot/normal.svg) — estado de bienvenida.
- [hablando.svg](../assets/mascot/hablando.svg) — emite instrucciones.
- [celebrando.svg](../assets/mascot/celebrando.svg) — aciertos y fin de ronda.
- [pensando.svg](../assets/mascot/pensando.svg) — pistas y reflexión.

Cada estado se entrega como SVG autónomo; no depende de una hoja de sprites, librerías ni código de aplicación. El tamaño de visualización queda a cargo de la interfaz.

## Objetos para grupos (SVG)
- [manzana.svg](../assets/objects/manzana.svg) — reutilizable en arreglos de 1–5 objetos por grupo.
- Los mismos gráficos pueden repetirse para todos los ejercicios: no son necesarios cuatro conjuntos de íconos diferentes en el MVP.

## Sonidos originales (WAV PCM, mono)
- [acierto.wav](../assets/audio/acierto.wav) — respuesta correcta.
- [intento.wav](../assets/audio/intento.wav) — error no punitivo, sonido suave.
- [celebracion.wav](../assets/audio/celebracion.wav) — final de ronda.
- [clic.wav](../assets/audio/clic.wav) — botón.
- Evitar reproducir simultáneamente demasiados efectos o interferir con la voz; respetar silenciar. Los sonidos son **originales**, sintetizados para este MVP; sin música protegida de terceros.

## Fuentes elegidas
- **Nunito** — cuerpo de texto y cifras: https://fonts.google.com/specimen/Nunito
- **Baloo 2** — títulos cortos: https://fonts.google.com/specimen/Baloo+2
- Licencia: SIL Open Font License 1.1, verificar atribución y condiciones antes de redistribuir binarios (https://github.com/google/fonts/tree/main/ofl/nunito y https://github.com/google/fonts/tree/main/ofl/baloo2). No se incluyen archivos de fuentes en el repositorio.
- Fallback: `system-ui, sans-serif`. Si un dispositivo no tiene red, el juego sigue siendo legible.

## Trazabilidad recurso → issue
- Base responsive y PWA: guía visual / paleta / tipografía / favicon derivado de la estrella.
- Estrella y voz: SVG de mascota + sonidos cortos.
- Aprendizaje: manzana.svg + mascota hablando.
- Motor: manzana.svg, mascota pensando y sonido de intento.
- Niveles: mascota, estrellas dibujadas reutilizando el recurso de celebración.
- Recompensas: celebrando.svg, acierto.wav y celebracion.wav.
- QA: todos los recursos y guías anteriores.

Los issues deben enlazar a los archivos del repositorio, no depender de archivos privados adjuntos en un chat.

## Locuciones Fola v1.1.0 (Request #20)

Las locuciones pregrabadas se recuperan únicamente durante la preparación, desde la release pública versionada:

`https://github.com/silverberdi/multiplo/releases/download/assets-fola-v1.1.0/multiplo-fola-v1.1.0-audios-490.zip`

El comando reproducible es `npm run prepare:fola`. Verifica SHA-256 `202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929`, valida `manifest.json`, los 490 clips, sus hashes, los 25 catálogos y extrae a `assets/audio/fola/`, que está ignorado por Git. Si se limpia esa carpeta, se ejecuta el mismo comando para recuperarla; un paquete alterado o incompleto falla antes de publicar una extracción parcial. La aplicación no descarga el ZIP al abrirse ni consulta Drive, TTS o IA durante una partida. Los WAV Fola no se incluyen en commits.
