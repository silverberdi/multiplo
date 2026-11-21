# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL seleccionar el clip Fola preparado apropiado para la bienvenida según sea primera visita o regreso, y para introducción de tabla, Aprende, pregunta, pista, acierto, error y cierre según el evento y la operación real `a×b`, incluyendo tablas 1–10. Las frases visibles y habladas de Aprende y sus pistas SHALL concordar con la operación: `a=1` usa «Un grupo de …», `a>1` usa «[n] grupos de …», `b=1` usa «una manzana» y `b>1` usa «N manzanas». Al pulsar Jugar, SHALL mostrar inmediatamente el saludo textual y mantenerlo visible durante la bienvenida; el gesto SHALL habilitar el intento de reproducción de audio. No SHALL intentar una reproducción audible automática al cargar Inicio. No SHALL generar audio nuevo, usar TTS/IA ni describir una orientación distinta. El texto, la navegación y las imágenes equivalentes SHALL permanecer disponibles y el audio no SHALL bloquear.

#### Scenario: Narración singular alineada
- **GIVEN** se presenta Aprende con `1 × 8`
- **WHEN** se solicita o reproduce la narración Fola
- **THEN** el texto y la narración expresan «Un grupo de ocho manzanas» y no «Uno grupos de ocho manzanas»

#### Scenario: Narración singular de una manzana
- **GIVEN** se presenta Aprende con `1 × 1`
- **WHEN** se solicita o reproduce la narración Fola
- **THEN** el texto y la narración expresan «Un grupo de una manzana»

#### Scenario: Narración plural alineada
- **GIVEN** se presenta Aprende con `2 × 8` o una operación con `a>1`
- **WHEN** se solicita o reproduce la narración Fola
- **THEN** el texto y la narración expresan «Dos grupos de ocho manzanas» o la forma plural correspondiente y describen la misma operación dirigida

#### Scenario: Narración de la demostración conserva la orientación
- **GIVEN** se presenta `3 × 2` como tres grupos de dos
- **WHEN** la estrella narra la explicación
- **THEN** el clip y el texto comunican tres grupos de dos, no dos grupos de tres, con concordancia gramatical

#### Scenario: Fallback de clip ausente o discordante
- **GIVEN** falta, falla o no corresponde un clip Fola requerido
- **WHEN** se solicita la narración
- **THEN** permanece disponible el texto correcto, la imagen y la navegación, sin voz robótica ni bloqueo de la actividad

#### Scenario: Pista derivada mantiene la concordancia
- **GIVEN** una pista se genera para una operación con `a=1` o `a>1`
- **WHEN** se muestra la pista
- **THEN** usa «Un grupo de …» en singular o la forma «… grupos de …» en plural, conserva `a×b` y no produce «uno grupos»

#### Scenario: Introducción automática de tabla
- **GIVEN** el niño selecciona una tabla disponible y el sonido está habilitado
- **WHEN** termina la interacción de selección
- **THEN** se intenta automáticamente la introducción Fola correspondiente y el texto sigue visible

#### Scenario: Voz correcta para 3 por 2
- **GIVEN** la pantalla muestra `3×2`
- **WHEN** se reproduce Aprende o una pista
- **THEN** el clip y el texto comunican tres grupos de dos, no dos grupos de tres

#### Scenario: Fallback de clip ausente
- **GIVEN** falta o falla un clip requerido
- **WHEN** ocurre el evento
- **THEN** permanece el texto, la navegación y la interacción, sin voz robótica ni bloqueo

#### Scenario: Guía en español con voz habilitada
- **GIVEN** el audio está habilitado y el niño selecciona una tabla desbloqueada
- **WHEN** comienza la actividad tras ese gesto de entrada
- **THEN** se reproduce automáticamente el clip Fola de bienvenida/introducción apropiado sin segundo botón de inicio y el texto permanece visible

#### Scenario: Narración de la demostración Aprende
- **GIVEN** se presenta la operación `3 × 2` como tres grupos de dos
- **WHEN** la estrella narra la pregunta o explicación
- **THEN** el clip describe `3 × 2` y tres grupos de dos cuando corresponda, sin describir cantidades distintas y sin síntesis del navegador

#### Scenario: Instrucciones habladas y texto simultáneamente disponible
- **GIVEN** el niño avanza por Aprende, instrucciones, preguntas, alternativas, pistas, aciertos, errores y cierre
- **WHEN** ocurre cada evento de la actividad
- **THEN** la estrella ofrece el clip Fola correspondiente al evento y operación activa, mientras conserva texto e imágenes equivalentes

#### Scenario: Ausencia de voz
- **GIVEN** el clip requerido falta, está corrupto o el navegador rechaza su reproducción
- **WHEN** el jugador inicia o continúa una actividad
- **THEN** el texto legible, las imágenes, alternativas y navegación permanecen disponibles, no se bloquea el ejercicio y no aparece voz robótica

#### Scenario: No se requiere una guía bilingüe
- **GIVEN** la actividad del MVP está en español
- **WHEN** se presenta una instrucción
- **THEN** la guía se ofrece en español y no exige una traducción o locución bilingüe

#### Scenario: Bienvenida al iniciar desde la portada
- **GIVEN** el sonido está habilitado y el jugador pulsa Jugar
- **WHEN** la aplicación entra al recorrido guiado por primera vez o en una visita posterior
- **THEN** reproduce, después del gesto, el clip de bienvenida correspondiente al estado de visita y mantiene visible el saludo equivalente

#### Scenario: Aprende reproduce una narración compatible
- **GIVEN** se presenta cualquiera de las 100 operaciones del MVP en Aprende
- **WHEN** se solicita la narración Fola
- **THEN** se permite reproducir la narración que expresa el número de grupos y objetos por grupo, aunque la frase incluya el sustantivo de los objetos

#### Scenario: Bienvenida tras el gesto de Jugar
- **GIVEN** el jugador está en el Inicio simplificado
- **WHEN** pulsa Jugar
- **THEN** aparece inmediatamente el saludo textual, permanece visible durante la bienvenida y se solicita el clip de primera visita o regreso después de ese gesto

#### Scenario: No reproducir al cargar
- **GIVEN** el jugador carga Inicio sin haber pulsado Jugar
- **WHEN** termina de cargar la página
- **THEN** no se intenta una reproducción audible automática

#### Scenario: Fallback inmediato de clip ausente
- **GIVEN** el jugador inició la bienvenida y el audio está silenciado, falta o falla
- **WHEN** el sistema detecta que no puede reproducir el clip
- **THEN** la selección de niveles aparece inmediatamente y el texto y la navegación permanecen disponibles sin voz robótica ni bloqueo
