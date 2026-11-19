# Spec Delta

## MODIFIED Requirements

### Requirement: La actividad Aprende representa grupos, suma repetida y producto

La ronda SHALL comenzar con una única actividad Aprende no evaluable que represente cualquier operación `a×b` de las tablas 1 a 10 como exactamente `a` grupos visualmente separados de `b` objetos. SHALL mostrar la suma de `b` repetida `a` veces igual al producto y la igualdad `a × b = producto`, manteniendo la orientación en todos los elementos. Para productos de 25 a 100 SHALL usar arreglos o agrupaciones ordenadas de 5 o 10, con números y sumas legibles, sin exigir 100 íconos diminutos ni scroll horizontal.

#### Scenario: Correspondencia de 3 por 2 y 2 por 3
- **GIVEN** comienza Aprende con `3 × 2` o `2 × 3`
- **WHEN** se presenta el contenido visual
- **THEN** aparecen respectivamente tres grupos de dos o dos grupos de tres, la suma repetida y el producto correcto, sin intercambiar la orientación aunque el resultado coincida

#### Scenario: Correspondencia de una demostración de 3 por 2
- **GIVEN** comienza la actividad Aprende con la demostración `3 × 2`
- **WHEN** se presenta el contenido visual
- **THEN** aparecen exactamente tres grupos, cada uno con dos objetos, la suma `2+2+2=6` y la igualdad `3×2=6`

#### Scenario: Límites válidos de los factores
- **GIVEN** se seleccionan los factores de una demostración
- **WHEN** se prepara la actividad Aprende
- **THEN** `a` y `b` están entre 1 y 10 inclusive y la representación conserva la pareja dirigida

#### Scenario: Variación del segundo factor
- **GIVEN** se inicia una nueva ronda de una tabla disponible
- **WHEN** se elige una demostración cuyo segundo factor cambia entre 1 y 10
- **THEN** la cantidad de grupos, los objetos por grupo, la suma repetida y el producto siguen correspondiendo a `a × b`

#### Scenario: Cobertura completa de factores
- **GIVEN** se selecciona una tabla disponible entre 1 y 10
- **WHEN** se prepara una demostración
- **THEN** `a` y `b` están entre 1 y 10, y los grupos, suma, texto y producto corresponden a la pareja dirigida seleccionada

#### Scenario: Representación de producto alto
- **GIVEN** la demostración es `10 × 10` o produce entre 25 y 100 objetos
- **WHEN** se renderiza en un móvil estándar de 360–412 px
- **THEN** las agrupaciones permanecen completas y legibles, sin desborde horizontal ni scroll innecesario

### Requirement: Aprende ocurre una sola vez y no modifica la evaluación

Cada ronda SHALL presentar exactamente una actividad Aprende antes de cuatro preguntas evaluables. La demostración SHALL no otorgar ni quitar estrellas, no registrar aciertos y permitir Continuar sin temporizador.

#### Scenario: Continuar hacia la primera pregunta
- **GIVEN** se muestra Aprende
- **WHEN** el niño pulsa Continuar
- **THEN** pasa a la primera pregunta evaluable y las estrellas no cambian

#### Scenario: No hay segunda demostración en la ronda
- **GIVEN** una ronda contiene su actividad Aprende inicial
- **WHEN** se completan sus cuatro preguntas
- **THEN** no se presenta otra actividad Aprende dentro de la ronda

### Requirement: La demostración usa una entrada ligera y recursos visuales aprobados

La actividad SHALL reutilizar `assets/objects/manzana.svg` y la mascota aprobada, con una composición CSS ligera que adapte grupos/arreglos hasta `10×10`, respete reducción de movimiento y mantenga texto equivalente visible.

#### Scenario: Recursos reutilizados
- **GIVEN** se renderizan grupos y narración
- **WHEN** la actividad está visible
- **THEN** usa la manzana SVG versionada y la mascota aprobada, sin recursos gráficos nuevos ni externos

#### Scenario: Movimiento reducido
- **GIVEN** el dispositivo solicita reducir movimiento
- **WHEN** se presenta Aprende
- **THEN** conserva la correspondencia visual completa sin animación esencial
