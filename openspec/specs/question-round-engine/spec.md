# question-round-engine Specification

## Purpose
Define el motor de preguntas que convierte una ronda del MVP en cuatro actividades evaluables, con alternativas matemáticamente correctas, pistas, reintentos y evaluación pedagógica del primer intento.

## Requirements

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

### Requirement: Genera factores y alternativas válidas

Para cada pregunta de multiplicación, el motor SHALL usar exactamente cuatro niveles numerados del 1 al 4, con la correspondencia Nivel 1 → `a=2`, Nivel 2 → `a=3`, Nivel 3 → `a=4` y Nivel 4 → `a=5`; el segundo factor `b` SHALL estar entre 1 y 5 inclusive, interpretando `a×b` como `a` grupos de `b`. Esto define 5 parejas por nivel y 20 parejas evaluables en total. Cada pregunta SHALL mostrar exactamente tres respuestas distintas, una correcta y dos distractores matemáticamente válidos. En la modalidad 4, las tres alternativas SHALL ser resultados numéricos distintos: uno SHALL ser el producto correcto y los otros dos SHALL ser productos distintos del resultado solicitado y distintos entre sí. En la modalidad 5, las tres alternativas SHALL ser operaciones con el mismo primer factor `a` del nivel y con segundos factores `b` distintos; exactamente una SHALL producir el total objetivo.

#### Scenario: Mantiene los factores permitidos
- **GIVEN** se genera una pregunta para un nivel del MVP
- **WHEN** el motor prepara sus factores
- **THEN** para Nivel 1 `a=2`, para Nivel 2 `a=3`, para Nivel 3 `a=4` y para Nivel 4 `a=5`; `b` está entre 1 y 5 inclusive

#### Scenario: Genera alternativas únicas y válidas
- **GIVEN** se muestra una pregunta evaluable
- **WHEN** se presentan sus alternativas
- **THEN** hay exactamente tres respuestas distintas, una coincide con el resultado correcto y dos son distractores matemáticamente válidos

#### Scenario: Presenta productos numéricos distintos en la modalidad 4
- **GIVEN** la pregunta 4 solicita resolver `a×b` y su resultado es `p`
- **WHEN** se generan sus tres alternativas
- **THEN** se presentan exactamente tres números, uno igual a `p` y dos productos numéricos válidos diferentes entre sí y de `p`, sin mostrar operaciones como alternativas

#### Scenario: Mantiene un único producto correcto en la modalidad 5
- **GIVEN** la pregunta 5 solicita encontrar la multiplicación que produce un total objetivo `p`
- **WHEN** se generan sus tres operaciones candidatas
- **THEN** las tres comparten el primer factor `a` del nivel, sus segundos factores `b` son distintos y exactamente una produce `p`

### Requirement: Varía operaciones sin romper las prioridades del aprendizaje

La selección de operaciones SHALL evitar repetir la misma operación dentro de una ronda cuando exista otra combinación válida, SHALL variar la operación cuando una repetición sea inevitable y SHALL priorizar en rondas futuras las operaciones marcadas como falladas, usando únicamente el estado local previsto por el MVP.

#### Scenario: Evita repetir operaciones cuando es posible
- **GIVEN** existen varias operaciones válidas para completar las preguntas de una ronda
- **WHEN** el motor selecciona sus operaciones
- **THEN** no repite una operación ya seleccionada mientras quede otra combinación válida

#### Scenario: Varía una repetición inevitable
- **GIVEN** el conjunto de operaciones disponible obliga a repetir un producto o una combinación
- **WHEN** el motor selecciona la repetición
- **THEN** varía la orientación u operación concreta cuando sea posible y no presenta dos veces seguidas la misma combinación `a×b` si existe alternativa válida

#### Scenario: Prioriza operaciones falladas en otra ronda
- **GIVEN** una operación fue fallada en el primer intento de una ronda anterior y existe progreso local de esa ronda
- **WHEN** se genera una ronda futura del mismo nivel
- **THEN** esa operación recibe prioridad frente a operaciones no falladas, sin salir de los cuatro niveles 1–4, sus tablas `a=2..5` y `b=1..5`, ni prometer sincronización entre dispositivos

### Requirement: Evalúa solo el primer intento y permite reintentos sin sanción

El motor SHALL registrar de forma inmutable si la primera respuesta de cada pregunta fue correcta. Un fallo inicial SHALL dejar la pregunta como no acertada al primer intento aunque un reintento posterior sea correcto. Después de un fallo, el niño SHALL poder pedir una pista y seleccionar respuestas sin límite ni sanción hasta acertar; al acertar podrá continuar o finalizar la pregunta según el flujo visible.

#### Scenario: Registra el primer acierto
- **GIVEN** una pregunta evaluable aún no respondida
- **WHEN** el niño selecciona la respuesta correcta por primera vez
- **THEN** la pregunta queda registrada como acertada al primer intento y el acierto inicial puede contribuir al resultado de la ronda

#### Scenario: Conserva el fallo inicial aunque luego acierte
- **GIVEN** el niño falla la primera respuesta de una pregunta
- **WHEN** obtiene la respuesta correcta en un reintento
- **THEN** avanza, pero la pregunta permanece registrada como no acertada al primer intento y el resumen inmutable de la ronda no incrementa sus aciertos iniciales por ese acierto tardío

#### Scenario: Reintenta con pista sin límite ni sanción
- **GIVEN** la pregunta es `2×4` y el primer intento fue incorrecto
- **WHEN** el niño pide Pista, selecciona `8` y continúa intentando
- **THEN** la pista muestra dos grupos de cuatro objetos, la respuesta `8` permite avanzar, no se resta progreso ni se limita el número de intentos, y el fallo inicial se conserva

### Requirement: Las pistas visuales conservan la operación y la modalidad 5 evalúa por producto

La pregunta 4 SHALL ocultar los objetos al presentarse por defecto y SHALL mostrar, al pulsar Pista, exactamente `a` grupos de `b` objetos sin alterar la operación ni sus alternativas. La pregunta 5 SHALL ofrecer también una Pista opcional que muestre `a` grupos de `b` objetos de la operación objetivo, sin cambiar el total objetivo ni las tres operaciones candidatas y sin presentar una afirmación falsa. En la pregunta 5, el motor SHALL considerar correcta únicamente la operación candidata cuyo producto coincide con el total objetivo, independientemente de la posición de la alternativa.

#### Scenario: Muestra grupos como pista para una respuesta sin objetos
- **GIVEN** se presenta una pregunta de multiplicación sin dibujo
- **WHEN** el niño pulsa Pista
- **THEN** se representan `a` grupos de `b` objetos y la expresión `a×b` permanece sin cambios

#### Scenario: Muestra una pista válida en la pregunta 5
- **GIVEN** se presenta la pregunta 5 con una operación objetivo `a×b`, un total y tres operaciones candidatas
- **WHEN** el niño pulsa Pista
- **THEN** se muestran `a` grupos de `b` objetos de la operación objetivo, el total y las tres operaciones permanecen sin cambios y la pista no afirma que una operación distractora sea correcta

#### Scenario: Evalúa la operación que produce el resultado
- **GIVEN** existe un total objetivo y tres operaciones candidatas
- **WHEN** el niño selecciona una candidata
- **THEN** el motor la marca correcta únicamente si su producto corresponde al total objetivo, no por su orden visual ni por su posición

### Requirement: Usa feedback y multimedia aprobados sin bloquear la experiencia

El motor SHALL mostrar instrucciones y feedback breves en español, usará `pensando.svg` para pistas o reflexión, `celebrando.svg` para aciertos y cierre, `manzana.svg` para grupos visuales, `intento.wav` para fallos y `acierto.wav` para aciertos. La voz y los efectos SHALL ser opcionales y no SHALL impedir continuar si faltan, fallan o están silenciados.

#### Scenario: Vincula los recursos del motor
- **GIVEN** se presenta una pregunta, una pista, un fallo o un acierto
- **WHEN** el motor actualiza la experiencia
- **THEN** consume los SVG/WAV versionados asociados sin depender de recursos externos y conserva el texto equivalente visible

#### Scenario: Continúa cuando multimedia no está disponible
- **GIVEN** la síntesis o un archivo WAV no existe, falla o está silenciado
- **WHEN** ocurre un fallo o acierto durante la pregunta
- **THEN** el feedback textual, las alternativas, la pista y la navegación siguen funcionando sin bloqueo
