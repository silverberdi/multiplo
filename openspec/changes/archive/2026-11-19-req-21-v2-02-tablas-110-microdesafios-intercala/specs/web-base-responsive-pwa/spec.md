# Spec Delta

## MODIFIED Requirements

### Requirement: Base views are responsive and usable by touch or click

La interfaz SHALL mostrar tablas, Aprende, preguntas, pistas y cierre en móvil de 360–412 px, tablet y computador, con números y agrupaciones legibles, controles táctiles accesibles y sin desbordamiento horizontal. La aplicación SHALL continuar siendo web estática/PWA progresiva sin introducir backend ni dependencias pesadas.

#### Scenario: Grupos grandes en móvil
- **GIVEN** se presenta o se solicita pista para `10×10` en 360–412 px
- **WHEN** se renderiza la actividad
- **THEN** las agrupaciones y el total son visibles sin scroll horizontal ni íconos ilegibles

#### Scenario: Flujo completo responsive
- **GIVEN** el jugador usa móvil, tablet o computador
- **WHEN** completa Aprende, pregunta, pista y cierre
- **THEN** todos los controles esenciales son accesibles mediante toque/clic y no hay overflow horizontal

#### Scenario: Render without horizontal scrolling
- **GIVEN** una vista base se abre en móvil, tablet o computador
- **WHEN** cambia el ancho o la orientación del viewport
- **THEN** el contenido cabe sin barra horizontal ni controles primarios recortados, y las acciones siguen utilizables con toque o clic
