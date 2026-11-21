# web-base-responsive-pwa Specification

## Purpose

Define the responsive, visual and installable web foundation that lets a child reach Múltiplo on common screen sizes with clear base views, approved identity and graceful browser fallbacks.

## Requirements

### Requirement: Base views expose the approved MVP structure

The web experience SHALL expose an understandable static skeleton for inicio/niveles, aprende, juego and fin de ronda, with Spanish labels and primary controls visible even though the learning and scoring logic belongs to later changes. Before the player starts the guided flow, Inicio SHALL show only the approved star, the Múltiplo name and the Jugar action; the level grid SHALL remain hidden until the welcome flow is continued or completes.

#### Scenario: Render the four base views
- **GIVEN** a user opens the Múltiplo web experience before game logic is integrated
- **WHEN** the base experience is rendered and the user follows its primary navigation actions
- **THEN** the user can reach the inicio/niveles, aprende, juego and fin de ronda skeletons without encountering an unapproved additional screen

#### Scenario: Render the simplified initial view
- **GIVEN** the player opens the Múltiplo web experience with the page finished loading
- **WHEN** no Jugar gesture has occurred in the current visit
- **THEN** the player sees only the star, the Múltiplo name and the Jugar button, and does not see the level grid

#### Scenario: Reveal levels after the welcome
- **GIVEN** the player has started the welcome from Jugar
- **WHEN** the player continues before the welcome clip ends or the welcome finishes normally
- **THEN** the selection of levels becomes visible exactly once and the player can choose an available table

#### Scenario: Start an available level
- **GIVEN** the level selection is visible and a table is available
- **WHEN** the player chooses that table
- **THEN** the corresponding partida starts, while blocked tables remain unavailable

### Requirement: Invite the initial Jugar gesture without forcing motion

The initial Jugar action SHALL have a subtle visual invitation that does not obstruct or delay its use. The invitation SHALL be reduced or disabled when the system preference is `prefers-reduced-motion: reduce`; the same preference SHALL reduce or disable the ordinary-correct-answer animation without removing its textual or non-color feedback.

#### Scenario: Show a discreet invitation
- **GIVEN** the player is on the simplified Inicio
- **WHEN** the player observes the Jugar button
- **THEN** the button has a subtle, non-blocking invitation animation and remains immediately usable by touch or click

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

### Requirement: Apply the approved visual identity with font fallback

The experience SHALL use the palette and visual guidance from `docs/ASSETS.md`, Nunito for reading text and numbers, Baloo 2 for titles, and a system sans-serif fallback whenever a webfont is unavailable.

#### Scenario: Show the identity when fonts are available
- **GIVEN** the approved font resources can be loaded
- **WHEN** a base view renders its title, instructional text, numbers and controls
- **THEN** titles use Baloo 2, reading text and numbers use Nunito, and the approved Múltiplo palette and large friendly controls are visible

#### Scenario: Remain legible when webfonts fail
- **GIVEN** one or both webfonts cannot be downloaded
- **WHEN** a base view renders
- **THEN** the browser uses the system fallback, text and numbers remain legible, and the view remains usable without an error state blocking the experience

### Requirement: Display levels 1 through 4 with safe locked state

The inicio/niveles view SHALL display exactly the four MVP levels, with level 1 available as the initial entry and levels 2–4 visibly locked until a later progress integration supplies their unlock state. The static base SHALL not claim that progress or scoring has already been implemented.

#### Scenario: Show the initial level state
- **GIVEN** no progress integration is present
- **WHEN** the inicio/niveles view loads
- **THEN** levels 1, 2, 3 and 4 are shown, level 1 is the available starting level, and levels 2–4 are visibly and accessibly marked as locked

### Requirement: Provide progressive PWA installation metadata

The web experience SHALL provide a valid manifest and an install icon derived from the approved star asset, with the minimum metadata needed for a supporting browser to offer adding the application to the home screen. A browser that does not support installation SHALL still be able to open and use the web experience normally.

#### Scenario: Install where the browser supports PWA
- **GIVEN** the experience is served in a browser and environment that supports PWA installation
- **WHEN** the user chooses to install or add Múltiplo to the home screen
- **THEN** the browser has the manifest and star-derived icon metadata needed to create the access, and the installed entry can open the web experience

#### Scenario: Continue as a normal web page without PWA support
- **GIVEN** the browser does not support installation or cannot complete it
- **WHEN** the user opens Múltiplo
- **THEN** the base web experience remains available without requiring an installation prompt or native application

### Requirement: Reuse approved assets and keep the foundation lightweight

The base experience SHALL reference the versioned mascot, reward-star and palette assets described in `docs/ASSETS.md`, and SHALL NOT require a backend, login, personal data, analytics, advertising, heavy framework, native app or unapproved user/settings screen.

#### Scenario: Render with repository assets and no service dependency
- **GIVEN** the versioned assets are available in the repository
- **WHEN** the base identity and views are rendered
- **THEN** the experience can load its approved visual resources from the web application package and does not require a server API, account or third-party runtime service
