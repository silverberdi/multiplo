# Spec Delta

## ADDED Requirements

### Requirement: Las opciones conservan layout, foco y área táctil sin altavoz individual

La vista Juego SHALL conservar las dimensiones táctiles, espaciado, alineación, contraste, legibilidad y foco visible de `.btn-option` después de retirar el altavoz individual. Las tres opciones SHALL permanecer utilizables en móvil estrecho, tablet y escritorio, sin texto recortado, superposición ni desbordamiento horizontal.

#### Scenario: Retiro limitado del CSS obsoleto
- **GIVEN** existen reglas específicas para `.btn-option-listen` y su foco
- **WHEN** se elimina el control individual
- **THEN** se retiran solo esas reglas huérfanas y se conservan las reglas de layout, estado, foco y tamaño de `.btn-option`

#### Scenario: Responsive y foco visible
- **GIVEN** el niño visualiza una pregunta en móvil, tablet o escritorio y navega con teclado
- **WHEN** recorre y activa las tres alternativas
- **THEN** las áreas táctiles siguen siendo suficientes, cada botón recibe foco visible, Tab/Enter/Espacio funcionan y ningún texto se recorta o superpone
