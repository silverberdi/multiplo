# Spec Delta

## MODIFIED Requirements

### Requirement: Invite the initial Jugar gesture without forcing motion

The initial Jugar action SHALL have a subtle visual invitation that does not obstruct or delay its use. The invitation SHALL be reduced or disabled when the system preference is `prefers-reduced-motion: reduce`; the same preference SHALL reduce or disable the ordinary-correct-answer animation without removing its textual or non-color feedback.

#### Scenario: Show a discreet invitation
- **GIVEN** the player is on the simplified Inicio
- **WHEN** the player observes the Jugar button
- **THEN** the button has a subtle, non-blocking invitation animation and remains immediately usable by touch or click

#### Scenario: Respect reduced motion on entry
- **GIVEN** the system reports `prefers-reduced-motion: reduce`
- **WHEN** the simplified Inicio is rendered
- **THEN** the Jugar invitation is reduced or disabled and no essential state or action depends on animation

#### Scenario: Respect reduced motion
- **GIVEN** the system reports `prefers-reduced-motion: reduce`
- **WHEN** the simplified Inicio is rendered
- **THEN** the Jugar invitation is reduced or disabled and no essential state or action depends on animation

#### Scenario: Respect reduced motion on an ordinary success
- **GIVEN** the system reports `prefers-reduced-motion: reduce`
- **WHEN** the player answers correctly
- **THEN** the success animation is reduced or disabled, feedback text remains immediate and the success is communicated by more than color alone

### Requirement: Base views are responsive and usable by touch or click

La interfaz SHALL mostrar tablas, Aprende, preguntas, pistas y cierre en móvil de 360–412 px, tablet y computador, con números y agrupaciones legibles, controles táctiles accesibles y sin desbordamiento horizontal. Los aciertos SHALL conservar feedback textual y visual accesible, incluso si la animación se reduce. La aplicación SHALL continuar siendo web estática/PWA progresiva sin introducir backend ni dependencias pesadas.

#### Scenario: Grupos grandes en móvil
- **GIVEN** se presenta o se solicita pista para `10×10` en 360–412 px
- **WHEN** se renderiza la actividad
- **THEN** las agrupaciones y el total son visibles sin scroll horizontal ni íconos ilegibles

#### Scenario: Flujo completo responsive
- **GIVEN** el jugador usa móvil, tablet o computador
- **WHEN** completa Aprende, pregunta, pista y cierre
- **THEN** todos los controles esenciales son accesibles mediante toque/clic y no hay overflow horizontal

#### Scenario: Feedback de acierto no depende solo del color
- **GIVEN** el jugador responde correctamente
- **WHEN** se actualiza la vista de la pregunta
- **THEN** aparece una señal textual y/o semántica además del color, la estrella puede animarse brevemente y Continuar permanece accesible

#### Scenario: Render without horizontal scrolling
- **GIVEN** a base view is opened at a supported mobile, tablet or desktop viewport
- **WHEN** the viewport width or orientation changes
- **THEN** the content fits the viewport, no horizontal scrollbar or clipped primary control appears, and the main actions remain usable with touch or click
