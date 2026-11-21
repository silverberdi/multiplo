# Design

## Context

La propuesta modifica el recorrido ya existente de preguntas y la coordinación multimedia descrita en los delta specs. El código actual concentra la respuesta correcta, el efecto y la narración en `js/app.js`, mientras `js/star-guide.js` coordina audio activo, silencio y estados de la estrella. La aplicación ya dispone de `acierto.wav`, `celebracion.wav`, SVG de mascota, catálogo Fola y reglas CSS de `prefers-reduced-motion`; el diseño debe reutilizar esas piezas y mantener el stack estático.

La fuente de comportamiento es el Request #33 y las capacidades canónicas archivadas. La configuración raíz contiene contexto histórico incompatible con la aplicación v1.2, por lo que Apply deberá contrastar el diseño con el código y specs archivados antes de tocar contratos.

## Goals / Non-Goals

**Goals:**

- Separar el feedback inmediato del acierto ordinario de las narraciones de contenido.
- Mantener una única coordinación de audio: cancelar narraciones obsoletas, no solapar voz/efectos y hacer disponible Continuar inmediatamente.
- Hacer observable la política de solicitudes: efecto de acierto por respuesta; voz solo en eventos valiosos definidos por la spec.
- Preservar el primer intento, estrellas, progresión, silencio persistido, fallback textual y navegación.
- Ofrecer feedback redundante (texto/semántica/estado visual) y respetar movimiento reducido.

**Non-Goals:**

- No añadir voces, TTS, IA, audio remoto, backend, telemetría, cuentas ni preferencias nuevas.
- No cambiar la selección de preguntas, las matemáticas, el dominio, el desbloqueo ni el número de estrellas.
- No rediseñar la bienvenida, la demostración ni el cierre más allá de su coordinación con la política de audio.
- No afirmar que el comportamiento está implementado o validado antes de Apply/Verify.

## Decisions

### 1. Política explícita por tipo de evento

`js/app.js` deberá tratar un acierto ordinario como evento visual/sonoro: feedback textual inmediato, estado/animación breve y `acierto.wav`. No llamará al flujo de narración Fola de felicitación para cada acierto. Bienvenida, Aprende, pista, hitos y cierre conservarán sus solicitudes de voz cuando el catálogo las soporte. Esta tabla de política se prefiere a heurísticas basadas en tiempos o en la cantidad de aciertos, porque hace determinista la evidencia E2E.

Alternativa descartada: mantener la voz en todos los aciertos y acortarla. No elimina la repetición ni garantiza continuidad rápida.

### 2. Coordinación centralizada y no bloqueante

`StarGuideCoordinator` seguirá siendo el único dueño de `currentSpeechAudio`, `currentEffectAudio` y la cancelación. La entrada de una nueva narración cancelará la anterior; un efecto de acierto no esperará una promesa de voz. La respuesta correcta actualizará la UI y revelará Continuar en el mismo ciclo de interacción, independientemente del resultado de `play()`.

Alternativa descartada: coordinar audio desde cada handler de pregunta. Duplica cancelación y facilita que callbacks tardíos revivan estado o solapen narraciones.

### 3. Variación limitada sin sistema adaptativo

La variación de celebración ordinaria será visual/textual (estado, animación y texto semántico) y sonora mediante el WAV aprobado; no se inventará un catálogo de felicitaciones ni se añadirá aleatoriedad difícil de probar. Si un hito requiere voz, se disparará por su evento de hito, no por cada acierto ordinario.

Alternativa descartada: seleccionar felicitaciones aleatorias. Añadiría solicitudes, contenido y flakiness sin valor demostrado para el MVP.

### 4. Accesibilidad como contrato redundante

El estado de acierto conservará texto visible o `aria-live`/estado equivalente y no dependerá del color. Las animaciones de feedback usarán una clase/estado que la media query `prefers-reduced-motion: reduce` reduzca o elimine; ocultar la animación no ocultará feedback ni el botón Continuar.

Alternativa descartada: comunicar el acierto solo cambiando color o solo con una animación, porque falla para movimiento reducido y usuarios con diferencias de percepción.

### 5. Evidencia de navegador con el ejecutor configurado

Las pruebas E2E deberán servir la aplicación con el harness ya existente, registrar solicitudes a `assets/audio/fola/` y WAV originales cuando aplique, y observar el DOM después de responder y continuar rápidamente. Se comprobarán silencio y `prefers-reduced-motion` en Chromium; no se asignarán navegación, asincronía, viewport ni concurrencia a validación humana.

## Risks / Trade-offs

- [Riesgo] Un callback tardío de audio restaura el estado `hablando` después de continuar → [Mitigación] invalidar el identificador de narración y probar una secuencia de continuación rápida con callbacks tardíos.
- [Riesgo] La reproducción del efecto se rechaza por autoplay o archivo ausente → [Mitigación] `playAudioEffect` sigue siendo best-effort; el feedback textual y Continuar no dependen de la promesa.
- [Riesgo] La ausencia de voz ordinaria reduce la sensación de celebración → [Mitigación] mantener `celebrando.svg`, texto breve y `acierto.wav` cuando el sonido esté habilitado; reservar voz para eventos de mayor valor.
- [Riesgo] Reutilizar una clase CSS existente puede dejar una animación más larga que el ritmo deseado → [Mitigación] medir/observar duración y garantizar que ninguna transición controle la disponibilidad del botón.
- [Riesgo] Las pruebas existentes pueden codificar la política anterior → [Mitigación] actualizar solo las aserciones afectadas y añadir evidencia de solicitudes; conservar tests de fallback, silencio, primer intento y responsive.

## Migration Plan

1. En Apply, inventariar todos los callers de `speakInstruction`/`playEffect` para acierto, cierre, bienvenida, pista e hitos, y mapearlos a la política de esta propuesta.
2. Implementar el sustituto en el coordinador/app y estilos, retirando la ruta de felicitación hablada ordinaria solo cuando los callers y pruebas demuestren que quedó obsoleta.
3. Ejecutar las suites declaradas `npm run test:unit`, `npm run test:e2e` y `npm run test` con el ejecutor configurado, incluyendo la nueva observación E2E; repetir las pruebas pertinentes después de retirar la ruta antigua.
4. Rollback: revertir el candidato del change completo si la evidencia muestra solapamiento, bloqueo de Continuar, pérdida de silencio o regresión de la evaluación. No requiere migración de datos ni cambios de esquema.

## Open Questions

Ninguna que cambie el contrato: el Request #33 ya define qué eventos pueden conservar voz y que el acierto ordinario debe ser inmediato.
