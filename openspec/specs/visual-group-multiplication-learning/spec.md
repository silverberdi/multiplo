# visual-group-multiplication-learning Specification

## Purpose
Define la demostración inicial que hace visible la relación entre grupos iguales, suma repetida y multiplicación para que un niño de seis años pueda comprenderla antes de responder.

## Requirements

### Requirement: La actividad Aprende representa grupos, suma repetida y producto

La ronda SHALL comenzar con una única actividad Aprende no evaluable que represente una multiplicación `a × b` como exactamente `a` grupos visualmente separados de `b` manzanas. SHALL mostrar la suma de `b` repetida `a` veces igual al producto y la igualdad `a × b = producto`, manteniendo la misma orientación matemática en todos los elementos.

#### Scenario: Correspondencia de una demostración de 3 por 2
- **GIVEN** comienza la actividad Aprende con la demostración `3 × 2`
- **WHEN** se presenta el contenido visual
- **THEN** aparecen exactamente tres grupos, cada uno con dos manzanas, la suma `2+2+2=6` y la igualdad `3×2=6`

#### Scenario: Límites válidos de los factores
- **GIVEN** se seleccionan los factores de una demostración
- **WHEN** se prepara la actividad Aprende
- **THEN** `a` está entre 2 y 5 inclusive y `b` está entre 1 y 5 inclusive

#### Scenario: Variación del segundo factor
- **GIVEN** se inicia una nueva ronda del mismo nivel
- **WHEN** se elige una demostración cuyo segundo factor cambia entre 1 y 5
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
