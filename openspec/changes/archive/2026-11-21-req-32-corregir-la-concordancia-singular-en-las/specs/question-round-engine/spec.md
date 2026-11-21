# Spec Delta

## MODIFIED Requirements

### Requirement: Las pistas visuales conservan la operación y la modalidad 5 evalúa por producto

La pista SHALL mostrar exactamente `a` grupos de `b` objetos de la operación activa, sin mutar operación, alternativas ni resultado. Todo texto derivado de la cantidad de grupos SHALL concordar gramaticalmente: para `a=1` SHALL usar «Un grupo de …» y para `a>1` SHALL usar la forma plural correspondiente. El complemento SHALL usar «una manzana» cuando `b=1` y «N manzanas» cuando `b>1`. La modalidad de operación por resultado SHALL evaluar por producto, nunca por posición visual.

#### Scenario: Pista singular con varias manzanas
- **GIVEN** se presenta una pregunta o explicación de `1×8`
- **WHEN** el niño pulsa Pista
- **THEN** ve un grupo de ocho objetos y el texto dice «Un grupo de ocho manzanas», sin «uno grupos»

#### Scenario: Pista singular con una manzana
- **GIVEN** se presenta una pregunta o explicación de `1×1`
- **WHEN** el niño pulsa Pista
- **THEN** ve un grupo de una manzana y el texto dice «Un grupo de una manzana»

#### Scenario: Pista plural
- **GIVEN** se presenta una pregunta o explicación con `a>1`, por ejemplo `2×8`
- **WHEN** el niño pulsa Pista
- **THEN** ve dos grupos de ocho objetos y el texto usa «Dos grupos de ocho manzanas» o la forma plural correspondiente

#### Scenario: Pista conserva la operación activa
- **GIVEN** se presenta `10×10` o una pregunta de multiplicación sin dibujo
- **WHEN** el niño pulsa Pista
- **THEN** se representan `a` grupos de `b` objetos, la expresión `a×b`, el total y las alternativas permanecen sin cambios y la concordancia no altera la evaluación

#### Scenario: Pista válida en la modalidad por resultado
- **GIVEN** se presenta una pregunta con total objetivo y tres operaciones candidatas
- **WHEN** el niño pulsa Pista
- **THEN** se muestran los grupos y el texto de la operación objetivo con concordancia correcta, las tres operaciones permanecen sin cambios y la pista no afirma que una distractora sea correcta

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
