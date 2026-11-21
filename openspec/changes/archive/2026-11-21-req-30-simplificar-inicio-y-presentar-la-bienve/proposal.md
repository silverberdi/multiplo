# Proposal

## Why

La portada mezcla actualmente la bienvenida, la acción de jugar y la selección de niveles, por lo que el primer objetivo del niño no queda claro y la pantalla inicial no coincide con el recorrido de bienvenida. Además, la reproducción del saludo puede dejar al jugador esperando varios segundos sin una acción visible para continuar. Este cambio simplifica Inicio y hace que el gesto de **Jugar** sea el punto explícito de entrada a una bienvenida textual y audible, siempre no bloqueante.

La necesidad responde al objetivo de que un niño de seis años pueda iniciar una ronda con mínima asistencia, con texto siempre disponible y voz opcional, sin añadir cuentas, datos personales, backend ni nuevas mecánicas.

## What Changes

- Mostrar en Inicio únicamente la estrella, el nombre Múltiplo y el botón **Jugar** antes del gesto inicial; ocultar la cuadrícula de niveles durante ese estado.
- Añadir al botón **Jugar** una invitación visual sutil, reducida o desactivada bajo `prefers-reduced-motion`, sin impedir el toque o clic.
- Al pulsar **Jugar**, mostrar inmediatamente el saludo textual, mantenerlo visible durante la bienvenida y solicitar el clip Fola correspondiente a primera visita o regreso usando el gesto como autorización de audio.
- No intentar reproducción audible automática al cargar Inicio; cancelar cualquier locución anterior cuando cambie la actividad.
- Ofrecer una acción visible para continuar desde la bienvenida hacia la selección de niveles sin esperar obligatoriamente al final del clip; el avance cancela la voz y no puede duplicar la navegación.
- Pasar automáticamente a la selección cuando finalice la bienvenida, salvo que el jugador ya haya continuado.
- Si el audio está silenciado, falta o falla, mostrar la selección inmediatamente y conservar texto y navegación operativos.
- Mantener la selección de tablas disponible después de la bienvenida: las tablas abiertas pueden iniciar su partida y las bloqueadas permanecen inaccesibles.
- Añadir pruebas automatizadas de la secuencia Inicio → bienvenida → selección → partida, del avance antes del final del audio y del fallback sin audio, incluyendo comprobaciones de viewport y movimiento reducido en navegador.

Límites: no se cambia la regla matemática, el dominio, el número de tablas, la persistencia local, el catálogo de assets ni la duración de la ronda. No se introduce una pantalla adicional permanente, audio nuevo, TTS, servicio remoto o dependencia de pruebas adicional.

## Capabilities

### New Capabilities

Ninguna. El cambio ajusta requisitos de capacidades ya existentes.

### Modified Capabilities

- `web-base-responsive-pwa`: Inicio se convierte en una portada simplificada con niveles diferidos hasta después de la bienvenida, conserva responsive/touch/click y añade el estado visual de invitación con reducción de movimiento.
- `star-guide-voice-text`: la bienvenida se dispara únicamente tras **Jugar**, mantiene saludo textual, usa el clip de primera visita/regreso, permite continuar mientras suena, cancela la voz al navegar y degrada inmediatamente si el audio no está disponible.
- `level-progression-local-persistence`: la selección de niveles se presenta después de la bienvenida o de un avance explícito, pero las tablas abiertas y bloqueadas conservan sus reglas de disponibilidad e inicio de partida.

## Impact

- Afecta la navegación y el estado inicial de la UI, el coordinador de bienvenida, la cancelación/reproducción de audio y el render de la selección de niveles.
- Reutiliza la estrella SVG, los recursos Fola preparados y la preferencia local de sonido ya descritos en `docs/ASSETS.md` y en las capacidades existentes.
- Añade cobertura al ejecutor de navegador configurado mediante los comandos declarados en `package.json`; no autoriza instalar Playwright ni otro framework.
- La validación UI automatizable debe ejecutarse en Apply/Verify con evidencia observable para Chromium, responsive y `prefers-reduced-motion`. La validación presencial con un niño queda fuera de este Change y no bloquea la prueba de navegador.
- Trazabilidad: Remote Request #30; issues #1, #2 y #7; RF-01, RF-02; RNF-01, RNF-02 y RNF-07; escenarios Q-01, Q-09 y Q-10, ampliados con variantes de bienvenida y ausencia de audio.
