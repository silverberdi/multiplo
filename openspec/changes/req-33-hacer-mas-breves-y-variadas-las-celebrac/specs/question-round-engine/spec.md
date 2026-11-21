# Spec Delta

## MODIFIED Requirements

### Requirement: La ronda presenta cuatro preguntas evaluables en el orden del MVP

Después de Aprende, el motor SHALL presentar exactamente cuatro preguntas evaluables. En tabla 1 las cuatro pertenecerán a la tabla actual; en tablas 2–10 exactamente tres pertenecerán a la tabla actual y una será repaso de una tabla anterior disponible. SHALL mezclar orden, modalidad y posición de alternativas sin rotular el repaso como examen, y no SHALL repetir una pareja dirigida dentro de la ronda si existe otra válida. La selección SHALL registrar los factores `b` de las preguntas actuales acertadas inicialmente para que la progresión pueda mostrar y completar el dominio acumulado. Tras confirmar un acierto, el motor SHALL mostrar feedback textual inmediato, activar una celebración visual breve y ofrecer `Continuar` sin exigir esperar una animación o una narración. Al cerrar la cuarta pregunta, SHALL entregar los aciertos de primer intento y el resultado de repaso por separado.

#### Scenario: Ronda de tabla 7 con repaso
- **GIVEN** la tabla 7 y tablas anteriores están disponibles
- **WHEN** se completa una ronda
- **THEN** hay una demostración y cuatro preguntas, tres de tabla 7 y una de una tabla anterior, en orden y modalidades mezclados

#### Scenario: Tabla 1 sin repaso inexistente
- **GIVEN** solo está disponible la tabla 1
- **WHEN** se genera una ronda
- **THEN** sus cuatro preguntas pertenecen a la tabla 1 y no se selecciona una tabla anterior

#### Scenario: Ejecuta las preguntas evaluables de una ronda
- **GIVEN** una ronda tiene una demostración no evaluable y cuatro preguntas evaluables
- **WHEN** el niño continúa desde Aprende y responde las preguntas
- **THEN** el motor ofrece las cuatro preguntas con tres alternativas, pistas disponibles y feedback pedagógico, sin añadir una quinta pregunta evaluable

#### Scenario: Celebra un acierto sin bloquear
- **GIVEN** el niño responde correctamente una pregunta evaluable
- **WHEN** el motor confirma la respuesta
- **THEN** muestra feedback textual inmediato, anima brevemente la estrella y permite pulsar Continuar sin esperar audio o animación

#### Scenario: Presenta las modalidades en el orden obligatorio
- **GIVEN** comienza la secuencia evaluable de una ronda
- **WHEN** se presentan las preguntas 2, 3, 4 y 5
- **THEN** la 2 y la 3 muestran grupos para elegir el total, la 4 muestra `a×b` sin objetos por defecto con Pista, y la 5 muestra tres multiplicaciones para elegir la que da el total

#### Scenario: Cierra la ronda antes de cambiar de nivel
- **GIVEN** el niño termina una pregunta o alcanza el final de la ronda
- **WHEN** el motor procesa la respuesta correcta y la navegación siguiente
- **THEN** permanece en la pregunta siguiente o en el cierre de ronda y nunca pasa automáticamente al nivel posterior sin cerrar la ronda

#### Scenario: Entrega el resultado inicial al cerrar
- **GIVEN** se completa la cuarta pregunta de una ronda
- **WHEN** el motor cierra la ronda
- **THEN** entrega una sola vez el resumen de 0 a 4 aciertos del primer intento y la progresión puede usarlo para evaluar el umbral de desbloqueo

#### Scenario: Entrega el resultado de repaso por separado
- **GIVEN** se completaron las cuatro preguntas
- **WHEN** se cierra la ronda
- **THEN** entrega los aciertos de primer intento y el resultado de repaso por separado

#### Scenario: Entrega factores de dominio sin contar repaso
- **GIVEN** una ronda contiene preguntas actuales y una pregunta de repaso
- **WHEN** el niño responde las preguntas
- **THEN** solo los factores `b` de preguntas actuales acertadas inicialmente se entregan al progreso y un factor repetido no aumenta el conjunto de factores distintos

#### Scenario: Celebra un acierto sin bloquear
- **GIVEN** el niño responde correctamente una pregunta evaluable
- **WHEN** el motor confirma la respuesta
- **THEN** muestra una felicitación breve y permite continuar a la siguiente pregunta sin exigir esperar una animación o audio

### Requirement: Usa feedback y multimedia aprobados sin bloquear la experiencia

El motor SHALL mostrar instrucciones y feedback breves en español, usará `pensando.svg` para pistas o reflexión, `celebrando.svg` para aciertos y cierre, `manzana.svg` para grupos visuales, `intento.wav` para fallos y `acierto.wav` para aciertos. Los aciertos ordinarios SHALL recibir feedback textual inmediato y una animación visual breve, sin depender del color ni de una felicitación hablada repetida. La voz y los efectos SHALL ser opcionales y no SHALL impedir continuar si faltan, fallan o están silenciados.

#### Scenario: Vincula los recursos del motor
- **GIVEN** se presenta una pregunta, una pista, un fallo o un acierto
- **WHEN** el motor actualiza la experiencia
- **THEN** consume los SVG/WAV versionados asociados sin depender de recursos externos y conserva el texto equivalente visible

#### Scenario: Continúa cuando multimedia no está disponible
- **GIVEN** la síntesis o un archivo WAV no existe, falla o está silenciado
- **WHEN** ocurre un fallo o acierto durante la pregunta
- **THEN** el feedback textual, las alternativas, la pista y la navegación siguen funcionando sin bloqueo

#### Scenario: Observa solicitudes y continuidad rápida
- **GIVEN** se ejecuta una ronda con varios aciertos y el jugador continúa rápidamente
- **WHEN** una prueba de navegador observa las solicitudes de audio y la navegación
- **THEN** verifica el número y orden de los efectos y no quedan narraciones solapadas ni una espera artificial antes de Continuar
