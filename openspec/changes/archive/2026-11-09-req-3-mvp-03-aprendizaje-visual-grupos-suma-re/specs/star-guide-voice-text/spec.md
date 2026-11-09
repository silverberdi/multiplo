# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL mostrar cada instrucción de la actividad en texto legible y SHALL ofrecerla también mediante síntesis nativa en español cuando el navegador disponga de ella y el sonido esté habilitado. En la actividad Aprende, la estrella SHALL narrar una explicación breve y equivalente a la demostración visible, incluyendo grupos, suma repetida y producto, usando el estado visual `hablando.svg`. La voz SHALL comunicar únicamente contenido que también esté disponible visualmente y no SHALL ser un requisito para continuar.

#### Scenario: Guía en español con voz habilitada
- **GIVEN** existe una actividad del MVP en español y el sonido está habilitado
- **WHEN** se presenta una instrucción después de iniciar la interacción
- **THEN** el niño ve la instrucción escrita y la escucha si el navegador soporta síntesis de voz española, con un control disponible para repetirla

#### Scenario: Narración de la demostración Aprende
- **GIVEN** se presenta la actividad Aprende con `a × b`
- **WHEN** aparece la demostración visual
- **THEN** la estrella usa `hablando.svg` y narra en español una explicación equivalente a los grupos, la suma repetida y el producto que el niño puede ver

#### Scenario: Instrucciones habladas y texto simultáneamente disponible
- **GIVEN** se presenta una instrucción y el navegador dispone de síntesis nativa de voz
- **WHEN** la instrucción se ofrece al jugador
- **THEN** la instrucción permanece visible mientras se ofrece mediante voz española

#### Scenario: Ausencia de voz
- **GIVEN** el navegador no dispone de síntesis de voz, no tiene una voz española utilizable o la síntesis falla
- **WHEN** el jugador inicia o continúa una actividad, incluida Aprende
- **THEN** el texto legible permanece disponible, la demostración y la interacción continúan y no se muestra un bloqueo por la ausencia de voz

#### Scenario: No se requiere una guía bilingüe
- **GIVEN** la actividad del MVP está en español
- **WHEN** se presenta una instrucción
- **THEN** la guía se ofrece en español y no exige una traducción o locución bilingüe
