# Design

## Context

La propuesta modifica una interacción ya localizada en la vista Juego. `renderCurrentQuestion()` crea los botones `.btn-option` y, actualmente, añade dentro de cada uno un `span.btn-option-listen` con rol, foco, icono y listeners propios. `handleOptionSelect()` ya es el punto de entrada de la respuesta; la guía de estrella y los controles de `index.html` ya cubren repetición, explicación, pistas y sonido global. Ver `proposal.md` para la motivación y las deltas de comportamiento.

Restricciones: HTML/CSS/JavaScript estático, sin dependencias nuevas, sin cambios al motor matemático, sin assets o servicios de voz adicionales, y sin tocar telemetría ni progreso local.

## Goals / Non-Goals

**Goals:**

- Hacer que cada alternativa tenga una única acción de respuesta y un único foco semántico.
- Retirar de forma segura el consumidor obsoleto: creación del elemento, listeners asociados y CSS específico.
- Mantener intactos texto/ARIA de la respuesta, `handleOptionSelect()`, reintentos, feedback, cuatro modalidades y controles de voz externos.
- Probar el resultado en un navegador real con teclado, interacción de respuesta, repetición/pista y viewports móvil, tablet y escritorio.

**Non-Goals:**

- No crear «Escuchar opciones», reproducción automática o secuencial de alternativas.
- No refactorizar audio, motor de preguntas, scoring, progresión, assets, telemetría, PWA o layout general.
- No añadir una validación física con dispositivo como sustituto de la prueba automatizable de Chromium; cualquier observación física queda como seguimiento post-merge.

## Decisions

### Mantener el botón existente como frontera de interacción

Se conserva el listener existente que delega en `handleOptionSelect(alt, btn)` y se elimina únicamente la rama que crea y conecta el altavoz anidado. Esto mantiene el contrato de selección y evita duplicar lógica o añadir un wrapper nuevo.

Alternativas consideradas: convertir el altavoz en botón hermano (rechazada porque ampliaría la decisión de producto con una acción de audio); mover la escucha a un botón «Escuchar opciones» (rechazada explícitamente por Request #46); cambiar `handleOptionSelect()` (innecesario y aumenta el riesgo sobre scoring/reintentos).

### Retirar solo el CSS demostrado obsoleto

Se borrarán las reglas `.btn-option-listen` y `.btn-option-listen:focus-visible`. Se conservarán `.btn-option`, sus estados `hover/focus-visible/active`, tamaños, grid y media queries. La prueba de navegador medirá foco y geometría en los tres factores de forma.

### Validación de navegador asignada al executor configurado

Apply/Verify deberán extender o añadir una prueba E2E usando el Chromium disponible y los comandos declarados por el repositorio. La prueba debe iniciar una ronda real, comprobar tres `.btn-option` sin `.btn-option-listen`, activar una opción por teclado y toque/clic, verificar que una activación produce una sola transición, y recorrer las cuatro modalidades con error, reintento, acierto, pista y repetición de consigna. También debe comprobar ausencia de overflow y foco visible en móvil, tablet y escritorio.

La evidencia debe registrar comando, exit code, viewport y observaciones. No se delegan navegación, asincronía, viewport ni concurrencia a operador/human_validation. La validación humana física de tamaño táctil puede programarse después del merge, pero no bloquea la cobertura automatizable.

### Censo de consumidores y retiro seguro

| Elemento | Acción | Evidencia esperada |
|---|---|---|
| `renderCurrentQuestion()` | Modificar | No crea `.btn-option-listen` ni listeners de audio anidados |
| `handleOptionSelect()` / `question-engine.js` | Reutilizar sin cambio funcional | Ronda, primer intento, reintentos y cuatro modalidades pasan |
| `#btn-juego-sound`, `#btn-aprende-sound`, `#btn-sound-toggle` | Retener | Repetición, explicación, silencio y fallback siguen disponibles |
| CSS `.btn-option-listen*` | Retirar | Búsqueda y prueba no encuentran regla o elemento residual |
| CSS `.btn-option*` y media queries | Retener | Foco, contraste, dimensiones y responsive permanecen |

## Risks / Trade-offs

- [Riesgo] Una prueba existente podría asumir que cada opción contiene un altavoz. → [Mitigación] Actualizar solo aserciones obsoletas y añadir la regresión explícita de controles anidados; no cambiar contratos del motor.
- [Riesgo] El selector o el foco podrían perderse al simplificar el DOM. → [Mitigación] Verificar `aria-label`, orden de Tab, activación Enter/Espacio y `:focus-visible` en Chromium.
- [Riesgo] Una eliminación amplia de CSS alteraría responsive. → [Mitigación] Retirar únicamente dos reglas identificadas y comparar geometría/overflow en los tres viewports.
- [Riesgo] Una alternativa podría seguir generando audio por una ruta indirecta. → [Mitigación] Observar la guía y la respuesta durante las acciones; confirmar que solo los controles externos y la narración de pregunta emiten audio.

## Migration Plan

1. Apply implementa la eliminación DOM/CSS y la prueba de regresión dentro de este Change.
2. El executor configurado corre las pruebas declaradas pertinentes y la prueba E2E real en Chromium, con evidencia reproducible.
3. Verify compara spec → design → código → pruebas → evidencia y confirma que el código retirado no tiene consumidores.
4. Rollback: revertir el commit candidato restaura el comportamiento anterior; no hay migración de datos ni cambios de despliegue.
