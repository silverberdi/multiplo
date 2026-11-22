# Spec Delta

## ADDED Requirements

### Requirement: Cada alternativa evaluable es un único control de respuesta

La vista Juego SHALL presentar cada una de las tres alternativas de cada pregunta evaluable como un único botón semántico de respuesta. Una alternativa SHALL conservar su texto visible, su `aria-label` comprensible para números u operaciones, y su activación por toque, clic, Tab, Enter y Espacio. No SHALL contener un control interactivo secundario, un altavoz individual ni una acción de audio.

#### Scenario: Alternativas sin interacción anidada
- **GIVEN** se renderiza una pregunta de cualquiera de las cuatro modalidades evaluables
- **WHEN** el niño observa las tres alternativas
- **THEN** cada alternativa es un único `.btn-option`, no existe `.btn-option-listen` y no hay descendientes con `role=button`, `tabindex` interactivo o listeners de audio individual

#### Scenario: Selección única desde cualquier zona
- **GIVEN** una pregunta tiene exactamente tres alternativas y cada botón representa una respuesta
- **WHEN** el niño toca o hace clic en el borde o texto de una alternativa
- **THEN** se procesa una sola selección de esa alternativa mediante el flujo de respuesta, sin acción secundaria ni doble contabilización

#### Scenario: Operaciones y etiquetas accesibles
- **GIVEN** la modalidad muestra tres operaciones como `3 × 4`
- **WHEN** se renderizan los botones
- **THEN** el texto visible y el `aria-label` identifican la operación de forma comprensible, las tres opciones son seleccionables y ninguna contiene controles interactivos secundarios

#### Scenario: Reintento conserva la evaluación
- **GIVEN** el niño falla una alternativa y la pregunta permanece sin resolver
- **WHEN** selecciona otra alternativa correcta después de pedir una pista o reintentarlo
- **THEN** la pregunta avanza sin sanción, el primer intento conserva su resultado y la eliminación del control anidado no cambia estrellas, progresión ni puntuación
