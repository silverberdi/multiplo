# question-round-engine Specification

## Purpose
Define el motor de preguntas que convierte una ronda del MVP en cuatro actividades evaluables, con alternativas matemáticamente correctas, pistas, reintentos y evaluación pedagógica del primer intento.

## Requirements

### Requirement: La ronda presenta cuatro preguntas evaluables en el orden del MVP

Después de Aprende, el motor SHALL presentar exactamente cuatro preguntas evaluables. En tabla 1 las cuatro pertenecerán a la tabla actual; en tablas 2–10 exactamente tres pertenecerán a la tabla actual y una será repaso de una tabla anterior disponible. SHALL mezclar orden, modalidad y posición de alternativas sin rotular el repaso como examen, y no SHALL repetir una pareja dirigida dentro de la ronda si existe otra válida. La selección SHALL registrar los factores `b` de las preguntas actuales acertadas inicialmente para que la progresión pueda mostrar y completar el dominio acumulado. Tras confirmar un acierto, el motor SHALL ofrecer una celebración breve y no bloqueante antes de continuar. Al cerrar la cuarta pregunta, SHALL entregar los aciertos de primer intento y el resultado de repaso por separado.

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

### Requirement: Genera factores y alternativas válidas

El catálogo SHALL contener las 100 parejas `a×b` para `a=1..10` y `b=1..10`. Cada alternativa SHALL ser distinta, exactamente una SHALL ser correcta y los distractores no SHALL producir el producto objetivo, incluso por conmutatividad. Las tres modalidades evaluables SHALL seguir siendo contar grupos visuales, resolver multiplicación con pista visual y escoger la operación que corresponde a un resultado.

#### Scenario: Cobertura matemática total
- **GIVEN** el catálogo de tablas 1 a 10
- **WHEN** se generan todas las operaciones dirigidas
- **THEN** existen exactamente 100 pares válidos y cada uno tiene producto `a*b`

#### Scenario: No hay distractor ambiguo
- **GIVEN** una pregunta de cualquier modalidad
- **WHEN** se presentan tres alternativas
- **THEN** son distintas y solo una corresponde al producto objetivo; `2×3` no puede ser distractor de `3×2` cuando ambos dan el objetivo

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

La progresión SHALL exponer para la tabla objetivo `coveredFactors` y `pendingFactors`, y `startNewRound` SHALL pasar ambos valores a `createQuestionRound`. La selección SHALL aceptar ese contrato, evitar secuencias fijas, favorecer primero factores `b` pendientes y después reutilizar la priorización limitada de `multiplo_failed_operations`, sin repetir parejas dentro de la ronda cuando existan alternativas. Para una tabla con suficientes factores disponibles, el motor SHALL producir una selección que avance la cobertura de factores distintos requerida por dominio antes de repetir factores no prioritarios. Una operación fallada podrá reaparecer, pero la estrategia no SHALL depender de repeticiones aleatorias indefinidas ni convertirse en un sistema adaptativo complejo.

#### Scenario: Cobertura variada
- **GIVEN** existen varias operaciones de la tabla
- **WHEN** se generan rondas sucesivas
- **THEN** el orden no es secuencial fijo y se evita repetir `a,b` dentro de una ronda

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
- **THEN** esa operación recibe prioridad frente a operaciones no falladas, sin salir de tablas 1–10 ni de factores 1–10

#### Scenario: Permite completar el conjunto de factores
- **GIVEN** faltan factores `b` distintos para cumplir el requisito de dominio
- **WHEN** progresión pasa `pendingFactors` a `startNewRound` y este lo entrega a `createQuestionRound` en rondas sucesivas
- **THEN** la selección ofrece los factores pendientes de forma alcanzable, cubre siete factores distintos en la evidencia de primer intento cuando se responden correctamente y no exige que el mismo factor se repita indefinidamente

#### Scenario: La selección consume el contrato de cobertura
- **GIVEN** progresión informa `coveredFactors=[1,2,3]` y `pendingFactors=[4,5,6,7]` para la tabla actual
- **WHEN** `startNewRound` crea una ronda
- **THEN** `createQuestionRound` recibe esa evidencia y prioriza factores de `pendingFactors` en las preguntas actuales, dejando el repaso fuera de la cobertura de la tabla

### Requirement: Evalúa solo el primer intento y permite reintentos sin sanción

El motor SHALL registrar de forma inmutable el acierto del primer intento de cada pregunta. Los reintentos SHALL permitir terminar sin sanción, pero no modificar estrellas ni el resultado inicial. La progresión SHALL recibir por separado los aciertos de la tabla actual, sus factores `b` distintos y los de repaso.

#### Scenario: Error de repaso
- **GIVEN** falla la pregunta de repaso
- **WHEN** finaliza la ronda
- **THEN** conserva la operación para futuros repasos y ese fallo no reduce el dominio ni el desbloqueo de la tabla actual

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

La pista SHALL mostrar exactamente `a` grupos de `b` objetos de la operación activa, sin mutar operación, alternativas ni resultado. La modalidad de operación por resultado SHALL evaluar por producto, nunca por posición visual.

#### Scenario: Pista de 10 por 10
- **GIVEN** se presenta `10×10`
- **WHEN** el niño pulsa Pista
- **THEN** ve agrupaciones ordenadas de diez grupos de diez, con el mismo producto y sin desborde horizontal

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
