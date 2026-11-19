# Spec Delta

## MODIFIED Requirements

### Requirement: La ronda presenta cuatro preguntas evaluables en el orden del MVP

Después de Aprende, el motor SHALL presentar exactamente cuatro preguntas evaluables. En tabla 1 las cuatro pertenecerán a la tabla actual; en tablas 2–10 exactamente tres pertenecerán a la tabla actual y una será repaso de una tabla anterior disponible. SHALL mezclar orden, modalidad y posición de alternativas sin rotular el repaso como examen, y no SHALL repetir una pareja dirigida dentro de la ronda si existe otra válida.

#### Scenario: Ronda de tabla 7 con repaso
- **GIVEN** la tabla 7 y tablas anteriores están disponibles
- **WHEN** se completa una ronda
- **THEN** hay una demostración y cuatro preguntas, tres de tabla 7 y una de una tabla anterior, en orden y modalidades mezclados

#### Scenario: Tabla 1 sin repaso inexistente
- **GIVEN** solo está disponible la tabla 1
- **WHEN** se genera una ronda
- **THEN** sus cuatro preguntas pertenecen a la tabla 1 y no se selecciona una tabla anterior

#### Scenario: Ejecuta las preguntas evaluables de una ronda
- **GIVEN** se completa la actividad Aprende
- **WHEN** comienza la ronda evaluable
- **THEN** se presentan exactamente cuatro preguntas de la distribución de la tabla actual y repaso definida para la ronda

#### Scenario: Celebra un acierto sin bloquear
- **GIVEN** el niño responde correctamente una pregunta
- **WHEN** el motor confirma la respuesta
- **THEN** muestra feedback breve y permite continuar sin una pantalla bloqueante

#### Scenario: Presenta las modalidades en el orden obligatorio
- **GIVEN** se genera una ronda evaluable
- **WHEN** se presentan sus preguntas
- **THEN** las modalidades están disponibles según el contrato de la ronda, sin omitir la variedad visual, de multiplicación y de operación por resultado

#### Scenario: Cierra la ronda antes de cambiar de nivel
- **GIVEN** quedan preguntas evaluables por completar
- **WHEN** el niño responde una pregunta
- **THEN** permanece en la ronda hasta completar las cuatro y no cambia de tabla prematuramente

#### Scenario: Entrega el resultado inicial al cerrar
- **GIVEN** se completaron las cuatro preguntas
- **WHEN** se cierra la ronda
- **THEN** entrega los aciertos de primer intento y el resultado de repaso por separado

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
- **GIVEN** se genera una operación para una tabla disponible
- **WHEN** se prepara la pregunta
- **THEN** `a` y `b` permanecen entre 1 y 10 inclusive

#### Scenario: Genera alternativas únicas y válidas
- **GIVEN** una pregunta requiere tres alternativas
- **WHEN** se presentan las opciones
- **THEN** son distintas y exactamente una es correcta

#### Scenario: Presenta productos numéricos distintos en la modalidad 4
- **GIVEN** se presenta una pregunta de resultado numérico
- **WHEN** se muestran sus alternativas
- **THEN** los productos ofrecidos son distintos y solo uno coincide con el objetivo

#### Scenario: Mantiene un único producto correcto en la modalidad 5
- **GIVEN** se presentan operaciones candidatas para un resultado
- **WHEN** el niño elige una operación
- **THEN** solo es correcta la que produce el resultado objetivo

### Requirement: Varía operaciones sin romper las prioridades del aprendizaje

La selección SHALL evitar secuencias fijas de `b=1,2,3`, favorecer factores diferentes entre rondas y reutilizar la priorización limitada de `multiplo_failed_operations`. Una operación fallada en repaso podrá reaparecer como repaso y no deberá convertir el motor en un sistema adaptativo complejo.

#### Scenario: Cobertura variada
- **GIVEN** existen varias operaciones de la tabla
- **WHEN** se generan rondas sucesivas
- **THEN** el orden no es secuencial fijo y se evita repetir `a,b` dentro de una ronda

#### Scenario: Prioridad de una operación fallada
- **GIVEN** una operación fue fallada en primer intento y está en el historial local
- **WHEN** se genera una ronda futura compatible
- **THEN** recibe prioridad frente a operaciones no falladas, sin salir de tablas 1–10 ni de factores 1–10

#### Scenario: Evita repetir operaciones cuando es posible
- **GIVEN** existen varias operaciones válidas para la tabla
- **WHEN** se genera una ronda
- **THEN** no se repite una pareja dirigida mientras haya otra opción válida

#### Scenario: Varía una repetición inevitable
- **GIVEN** quedan menos operaciones válidas que preguntas necesarias
- **WHEN** se genera la ronda
- **THEN** las repeticiones inevitables se distribuyen sin romper la orientación ni la corrección matemática

#### Scenario: Prioriza operaciones falladas en otra ronda
- **GIVEN** una operación fue fallada en primer intento y está en el historial local
- **WHEN** se genera una ronda futura compatible
- **THEN** puede recibir prioridad sin salir de las tablas y factores permitidos

### Requirement: Evalúa solo el primer intento y permite reintentos sin sanción

El motor SHALL registrar de forma inmutable el acierto del primer intento de cada pregunta. Los reintentos SHALL permitir terminar sin sanción, pero no modificar estrellas ni el resultado inicial. La progresión SHALL recibir por separado los aciertos de la tabla actual y los de repaso.

#### Scenario: Reintento no retroactivo
- **GIVEN** el niño falla primero y acierta después
- **WHEN** termina la pregunta
- **THEN** puede continuar, pero la pregunta no cuenta como acierto inicial

#### Scenario: Error de repaso
- **GIVEN** falla la pregunta de repaso
- **WHEN** finaliza la ronda
- **THEN** conserva la operación para futuros repasos y ese fallo no reduce el dominio ni el desbloqueo de la tabla actual

#### Scenario: Registra el primer acierto
- **GIVEN** el niño acierta una pregunta en su primer intento
- **WHEN** el motor confirma la respuesta
- **THEN** registra el acierto inicial y lo incluye en las estrellas y métricas correspondientes

#### Scenario: Conserva el fallo inicial aunque luego acierte
- **GIVEN** el niño falla el primer intento y después acierta
- **WHEN** termina la pregunta
- **THEN** conserva el fallo inicial para la evaluación y permite continuar

#### Scenario: Reintenta con pista sin límite ni sanción
- **GIVEN** el niño solicita una pista después de un intento fallido
- **WHEN** responde nuevamente
- **THEN** puede completar la pregunta sin límite ni sanción adicional, sin alterar el primer intento

### Requirement: Las pistas visuales conservan la operación y la modalidad 5 evalúa por producto

La pista SHALL mostrar exactamente `a` grupos de `b` objetos de la operación activa, sin mutar operación, alternativas ni resultado. La modalidad de operación por resultado SHALL evaluar por producto, nunca por posición visual.

#### Scenario: Pista de 10 por 10
- **GIVEN** se presenta `10×10`
- **WHEN** el niño pulsa Pista
- **THEN** ve agrupaciones ordenadas de diez grupos de diez, con el mismo producto y sin desborde horizontal

#### Scenario: Operación por producto
- **GIVEN** hay tres operaciones candidatas
- **WHEN** el niño selecciona una
- **THEN** solo es correcta la que produce el total objetivo, independientemente de su posición

#### Scenario: Muestra grupos como pista para una respuesta sin objetos
- **GIVEN** una pregunta requiere resolver una multiplicación
- **WHEN** el niño solicita Pista
- **THEN** ve grupos visuales de la operación activa sin cambiar la pregunta ni sus alternativas

#### Scenario: Muestra una pista válida en la pregunta 5
- **GIVEN** se presenta la modalidad de operación por resultado
- **WHEN** el niño solicita Pista
- **THEN** la ayuda conserva el resultado objetivo y las operaciones candidatas

#### Scenario: Evalúa la operación que produce el resultado
- **GIVEN** se presentan tres operaciones candidatas
- **WHEN** el niño selecciona una
- **THEN** solo es correcta la que produce el total objetivo, independientemente de su posición visual
