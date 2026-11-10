# Spec Delta

## MODIFIED Requirements

### Requirement: La ronda presenta cuatro preguntas evaluables en el orden del MVP

El motor SHALL presentar, después de la única demostración Aprende, exactamente cuatro preguntas evaluables y SHALL respetar la numeración y modalidad obligatorias: la pregunta 2 cuenta grupos visuales y elige el total; la pregunta 3 cuenta grupos visuales y elige el total; la pregunta 4 resuelve `a×b` sin objetos visibles por defecto y ofrece una pista; la pregunta 5 elige cuál de tres multiplicaciones produce el total indicado. Tras confirmar un acierto, el motor SHALL ofrecer una celebración breve y no bloqueante antes de continuar. Completar una pregunta SHALL cerrar únicamente esa pregunta y no cambiar automáticamente de nivel. Al cerrar la cuarta pregunta, el motor SHALL entregar una sola vez el resumen inmutable de 0 a 4 aciertos del primer intento para que la progresión determine si corresponde desbloquear el siguiente nivel; esa decisión SHALL ocurrir después del cierre de ronda y no durante una respuesta individual.

#### Scenario: Ejecuta las preguntas evaluables de una ronda
- **GIVEN** una ronda tiene una demostración no evaluable y cuatro preguntas evaluables
- **WHEN** el niño continúa desde Aprende y responde las preguntas
- **THEN** el motor ofrece las cuatro preguntas con tres alternativas, pistas disponibles y feedback pedagógico, sin añadir una quinta pregunta evaluable

#### Scenario: Celebra un acierto sin bloquear
- **GIVEN** el niño responde correctamente una pregunta evaluable
- **WHEN** el motor confirma la respuesta
- **THEN** muestra una felicitación breve y permite continuar a la siguiente pregunta sin exigir esperar una animación o audio

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
