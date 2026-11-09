# Proposal

## Why

El MVP necesita una guía comprensible y emocionalmente segura para que un niño de seis años pueda avanzar con poca ayuda adulta. El issue #2 entrega la estrella, instrucciones breves en español mediante voz y texto, y una degradación clara cuando el navegador no puede sintetizar voz; hacerlo ahora desbloquea la autonomía prevista por el contrato MVP y depende de la base responsive del issue #1.

## What Changes

- Introducir la capacidad de guía de la estrella para presentar instrucciones escritas y, cuando el navegador lo permita y el sonido esté habilitado, mediante `speechSynthesis` en español.
- Mantener simultáneamente el texto legible como fuente de verdad de la instrucción y permitir repetir la última instrucción.
- Gestionar el estado de sonido local: silenciar detiene la voz vigente, evita instrucciones y efectos posteriores, y conserva la preferencia en `localStorage` hasta reactivarla.
- Evitar solapamiento de discursos, cancelar la voz anterior al cambiar de actividad y comenzar síntesis solo después de un gesto del usuario.
- Representar los estados visuales normal, hablando, celebrando y pensando, con retroalimentación empática para errores y un guion breve de bienvenida, demostración, pregunta, acierto, reintento y cierre.
- Reproducir, sin bloquear la interacción, los efectos WAV originales de acierto, intento, celebración y clic cuando el sonido esté habilitado.
- Reutilizar `assets/mascot/{normal,hablando,celebrando,pensando}.svg`, `assets/audio/{acierto,intento,celebracion,clic}.wav` y las reglas de `docs/ASSETS.md`; no crear locuciones, música, recursos externos ni una guía bilingüe.

## Capabilities

### New Capabilities

- `star-guide-voice-text`: guía visual y sonora de la estrella, instrucciones voz+texto en español, fallback sin voz, silencio/repetición, estados de mascota y efectos sonoros del MVP.

### Modified Capabilities

- Ninguna. La capacidad existente `web-base-responsive-pwa` define la base visual y responsive, pero no cambia sus requisitos en este change.

## Impact

- **Producto y trazabilidad:** issue GitHub #2; RF-02, RNF-02 y RNF-07; decisiones D-005, D-006, D-015, D-016 y D-018; escenarios Q-01 y Q-09.
- **Interfaz:** integración con las vistas ya previstas de inicio, Aprende, Juego y fin de ronda, incluyendo controles grandes de repetir y sonido.
- **Runtime:** JavaScript local para orquestar estados de mascota, `speechSynthesis`, reproducción de WAV y preferencia de sonido; la voz debe ser tolerante a API ausente, voz española no disponible o errores de reproducción.
- **Recursos:** consumo directo de los SVG/WAV versionados descritos en `docs/ASSETS.md`; no se añaden dependencias, backend, cuentas, telemetría, datos personales ni servicio remoto.
- **Dependencia:** requiere la estructura responsive y las vistas del change del issue #1; no implementa por sí mismo la generación de preguntas, puntuación, progreso ni desbloqueo de niveles.
- **Validación posterior:** pruebas proporcionales de texto/fallback, repetición, cancelación/no solapamiento, silencio persistido, gesto inicial, efectos y responsive; estos artefactos son planificación y no constituyen evidencia de implementación o prueba.
