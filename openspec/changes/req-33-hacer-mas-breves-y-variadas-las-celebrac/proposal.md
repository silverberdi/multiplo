# Proposal

## Why

En la versión publicada, cada acierto ordinario dispara el mismo efecto visual, sonido y felicitación hablada. Esa repetición añade espera y, cuando el niño continúa rápidamente, puede dejar narraciones superpuestas o interrumpidas; la celebración pierde así impacto y el ritmo breve de la ronda se resiente.

El cambio busca que un acierto ordinario comunique de inmediato, principalmente con texto, estado visual y efecto sonoro breve, y reserve la voz para bienvenida, explicación, pista, hitos y cierre, manteniendo el valor pedagógico y la navegación autónoma del MVP.

## What Changes

- Sustituir la felicitación hablada repetitiva de cada acierto ordinario por feedback textual inmediato, una animación breve de la estrella y `acierto.wav`, sin bloquear ni retrasar `Continuar`.
- Mantener la voz Fola para contenido o celebraciones con valor —bienvenida, explicación, pista, hitos y cierre— y coordinarla con los efectos para que no se solapen.
- Variar o limitar las solicitudes de voz de acierto ordinario para que una ronda con varios aciertos no reproduzca la misma felicitación hablada en cada respuesta.
- Conservar el silencio como preferencia global: sin voz ni efectos, pero con feedback visual, textual y navegación intactos.
- Hacer explícito el comportamiento bajo `prefers-reduced-motion` y conservar una señal de acierto que no dependa solo del color.
- Añadir cobertura unitaria y E2E observable para el orden/número de solicitudes de audio, la continuidad rápida, el silencio, la preferencia de movimiento reducido y la ausencia de solapamiento.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `star-guide-voice-text`: cambia la política observable de narración y coordinación entre voz, efectos, silencio y feedback de acierto ordinario.
- `question-round-engine`: cambia la celebración observable del acierto y mantiene la disponibilidad inmediata de Continuar sin alterar la evaluación del primer intento.
- `web-base-responsive-pwa`: precisa la señal visual/textual accesible del acierto y su comportamiento con movimiento reducido.

## Impact

- Código afectado previsto: `js/app.js`, `js/star-guide.js` y las reglas/estados visuales relevantes de `css/styles.css`.
- Pruebas afectadas o nuevas: suites unitarias de guía/celebración y checks E2E declarados en `package.json`, incluyendo observación de solicitudes de audio en navegador Chromium.
- Activos reutilizados: `assets/audio/acierto.wav`, `assets/audio/celebracion.wav` y los SVG versionados de la estrella; no se añade backend, dependencia pesada, TTS/IA, cuenta, telemetría ni dato personal.
- Trazabilidad: Request #33; afecta principalmente RF-02, RF-08, RNF-02 y RNF-07 de `docs/TRACEABILITY.md`, con dependencia funcional de los contratos ya archivados de Request #20, #27, #29, #30 y #32.
- Límite: este change no rediseña la progresión, el generador matemático, el catálogo Fola ni el cierre de ronda; solo modifica la política y coordinación de la celebración de aciertos y su evidencia.
- Contexto a resolver durante Apply/Verify: `openspec/config.yaml` todavía contiene contexto histórico de MVP greenfield/tablas 2–5, mientras las especificaciones archivadas y el código reflejan tablas 1–10 y una aplicación existente. La implementación deberá seguir las especificaciones canónicas archivadas y actualizar artefactos solo con comportamiento realmente verificado.
