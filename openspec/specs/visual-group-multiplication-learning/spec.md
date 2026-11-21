# visual-group-multiplication-learning Specification

## Purpose
Define la demostración inicial que hace visible la relación entre grupos iguales, suma repetida y multiplicación para que un niño de seis años pueda comprenderla antes de responder.

## Requirements

### Requirement: La actividad Aprende representa grupos, suma repetida y producto

La ronda SHALL comenzar con una única actividad Aprende no evaluable que represente cualquier operación `a×b` de las tablas 1 a 10 como exactamente `a` grupos visualmente separados de `b` objetos. SHALL mostrar la suma de `b` repetida `a` veces igual al producto y la igualdad `a × b = producto`, manteniendo la orientación en todos los elementos. La explicación textual SHALL concordar con las cantidades: cuando `a=1` SHALL usar «Un grupo de …» y cuando `a>1` SHALL usar «[n en palabras] grupos de …». El complemento SHALL usar «una manzana» cuando `b=1` y «N manzanas» cuando `b>1`; por tanto `1×1` se expresa como «Un grupo de una manzana». Para productos de 25 a 100 SHALL usar arreglos o agrupaciones ordenadas de 5 o 10, con números y sumas legibles, sin exigir 100 íconos diminutos ni scroll horizontal.

#### Scenario: Demostración singular con varias manzanas
- **GIVEN** comienza Aprende con `1 × 8`
- **WHEN** se presenta el contenido visible
- **THEN** aparece un grupo de ocho manzanas y la explicación usa «Un grupo de ocho manzanas», sin «uno grupos» ni «un grupos»

#### Scenario: Demostración singular con una manzana
- **GIVEN** comienza Aprende con `1 × 1`
- **WHEN** se presenta el contenido visible
- **THEN** la explicación usa «Un grupo de una manzana» y la representación contiene una sola manzana

#### Scenario: Demostración plural
- **GIVEN** comienza Aprende con `2 × 8` o con cualquier `a × b` donde `a>1`
- **WHEN** se presenta el contenido visible
- **THEN** la explicación usa «Dos grupos de ocho manzanas» o la forma plural correspondiente a `a` y `b`, sin discordancia singular

#### Scenario: Correspondencia de grupos, suma y producto
- **GIVEN** comienza Aprende con `3 × 2` o `2 × 3`
- **WHEN** se presenta el contenido visual y textual
- **THEN** aparecen respectivamente tres grupos de dos o dos grupos de tres, la suma repetida, el producto correcto y la frase conserva la orientación `a grupos de b`

#### Scenario: Cobertura completa de factores y texto
- **GIVEN** se selecciona una pareja dirigida con `a` y `b` entre 1 y 10 inclusive
- **WHEN** se prepara una demostración
- **THEN** los grupos, la suma, el texto y el producto corresponden a la pareja dirigida, incluyendo las formas singulares cuando alguno de los factores vale uno

#### Scenario: Correspondencia de 3 por 2 y 2 por 3
- **GIVEN** comienza Aprende con `3 × 2` o `2 × 3`
- **WHEN** se presenta el contenido visual
- **THEN** aparecen respectivamente tres grupos de dos o dos grupos de tres, la suma repetida y el producto correcto, sin intercambiar la orientación aunque el resultado coincida

#### Scenario: Correspondencia de una demostración de 3 por 2
- **GIVEN** comienza la actividad Aprende con la demostración `3 × 2`
- **WHEN** se presenta el contenido visual
- **THEN** aparecen exactamente tres grupos, cada uno con dos manzanas, la suma `2+2+2=6` y la igualdad `3×2=6`

#### Scenario: Límites válidos de los factores
- **GIVEN** se seleccionan los factores de una demostración
- **WHEN** se prepara la actividad Aprende
- **THEN** `a` y `b` están entre 1 y 10 inclusive y la representación conserva la pareja dirigida

#### Scenario: Cobertura completa de factores
- **GIVEN** se selecciona una tabla disponible entre 1 y 10
- **WHEN** se prepara una demostración
- **THEN** `a` y `b` están entre 1 y 10, y los grupos, suma, texto y producto corresponden a la pareja dirigida seleccionada

#### Scenario: Representación de producto alto
- **GIVEN** la demostración es `10 × 10` o produce entre 25 y 100 objetos
- **WHEN** se renderiza en un móvil estándar de 360–412 px
- **THEN** las agrupaciones permanecen completas y legibles, sin desborde horizontal ni scroll innecesario

#### Scenario: Variación del segundo factor
- **GIVEN** se inicia una nueva ronda del mismo nivel
- **WHEN** se elige una demostración cuyo segundo factor cambia entre 1 y 10
- **THEN** la cantidad de grupos, las manzanas por grupo, la suma repetida y el producto siguen correspondiendo a `a × b`

### Requirement: Aprende ocurre una sola vez y no modifica la evaluación

Cada ronda SHALL presentar exactamente una actividad Aprende antes de las cuatro preguntas evaluables. La demostración SHALL no otorgar ni quitar estrellas, SHALL no registrar un acierto de pregunta y SHALL permitir pulsar Continuar sin temporizador ni restricción de tiempo para llegar a la primera pregunta.

#### Scenario: Continuar hacia la primera pregunta
- **GIVEN** se muestra la demostración visual de Aprende
- **WHEN** el niño pulsa Continuar
- **THEN** pasa a la primera pregunta evaluable y el total de estrellas permanece sin cambios

#### Scenario: No hay segunda demostración en la ronda
- **GIVEN** una ronda contiene su actividad Aprende inicial
- **WHEN** el niño avanza por las cuatro preguntas y completa la ronda
- **THEN** no se presenta otra actividad Aprende dentro de esa misma ronda

### Requirement: La demostración usa una entrada ligera y recursos visuales aprobados

La entrada visual SHALL ser breve, clara y no distractora, y SHALL respetar la preferencia de reducción de movimiento cuando aplique. Las manzanas SHALL reutilizar `assets/objects/manzana.svg` como el mismo objeto vectorial repetido por grupo, y la estrella que narra SHALL reutilizar `assets/mascot/hablando.svg`; no SHALL depender de una biblioteca gráfica pesada ni de recursos externos en tiempo de ejecución.

#### Scenario: Recursos reutilizados
- **GIVEN** se renderizan los grupos y la narración de Aprende
- **WHEN** la actividad está visible
- **THEN** las manzanas provienen del SVG versionado `manzana.svg`, la estrella narradora del SVG `hablando.svg` y la composición sigue la Guía visual y de voz de `docs/ASSETS.md`

#### Scenario: Movimiento reducido
- **GIVEN** el dispositivo solicita reducir el movimiento
- **WHEN** se presenta Aprende
- **THEN** se conserva la correspondencia visual completa sin animaciones esenciales que impidan comprender o continuar
