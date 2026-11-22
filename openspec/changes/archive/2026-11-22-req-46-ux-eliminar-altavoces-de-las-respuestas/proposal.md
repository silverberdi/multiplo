# Proposal

## Why

Request #46 corrige una fricción de accesibilidad y claridad en la vista Juego: cada alternativa debe ser una única acción de respuesta para un niño de seis años, no un botón que contiene otro control de audio. El altavoz anidado puede provocar foco y activaciones ambiguas, por lo que se retira ahora que el contrato de voz ya ofrece repetición de la consigna, explicación, pistas y control global fuera de las alternativas.

El cambio preserva la intención aprobada de voz + texto, las tres opciones matemáticas, los reintentos sin sanción y la navegación táctil/teclado, sin convertir la eliminación en un rediseño pedagógico o visual.

## What Changes

- Eliminar de `renderCurrentQuestion()` la creación de `.btn-option-listen`, incluido su icono, atributos ARIA, foco, listeners de clic/teclado y `stopPropagation()`.
- Mantener cada `.btn-option` como único control semántico y conservar su listener de selección, etiquetas visibles/ARIA, navegación nativa con Tab/Enter/Espacio y áreas táctiles existentes.
- Retirar únicamente las reglas CSS obsoletas de `.btn-option-listen` y `.btn-option-listen:focus-visible`; conservar layout, contraste, foco visible y responsive de `.btn-option`.
- Añadir una regresión automatizable de navegador que compruebe la ausencia de controles anidados, selección única por toque/clic/teclado y continuidad de las cuatro modalidades.
- Verificar que repetir consigna, explicar, pedir pista, feedback, Fola y los controles `#btn-juego-sound`, `#btn-aprende-sound` y `#btn-sound-toggle` permanecen sin nuevas locuciones, WAV, TTS, dependencias o servicios.
- Mantener fuera de alcance el motor de preguntas, `handleOptionSelect()` salvo el contrato necesario para la regresión, puntuación, telemetría V3, assets, pipelines y cualquier botón nuevo para escuchar opciones.

## Capabilities

### New Capabilities

<!-- None. The change modifies requirements of existing capabilities. -->

### Modified Capabilities

- `question-round-engine`: las alternativas de las cuatro modalidades deben ser controles únicos de respuesta, sin controles interactivos secundarios anidados, manteniendo selección, reintentos, puntuación inicial y feedback.
- `star-guide-voice-text`: la repetición de consigna, explicación, pista, feedback y sonido global permanecen disponibles desde sus controles existentes; no se narra ni se reproduce audio desde cada alternativa.
- `web-base-responsive-pwa`: los botones de respuesta conservan legibilidad, foco visible, tamaño táctil y ausencia de overflow en móvil, tablet y escritorio después de retirar el control anidado.

## Impact

- Código afectado: `js/app.js` (`renderCurrentQuestion()`), `css/styles.css` (reglas del altavoz) y las pruebas de navegador pertinentes bajo `tests/`.
- Interfaces preservadas: `handleOptionSelect()`, `question-engine.js`, guía de estrella/Fola, `index.html` y los tres controles de sonido existentes.
- No se agregan dependencias runtime, APIs, assets, servicios de voz, almacenamiento, backend ni cambios de esquema.
- Trazabilidad: issue/Request #46; RF-02, RF-04, RF-05; RNF-01, RNF-02, RNF-04 y RNF-07; escenarios Q-03, Q-04, Q-09 y Q-10. La evidencia de implementación y navegador queda para Apply/Verify; esta propuesta no declara el cambio implementado.
