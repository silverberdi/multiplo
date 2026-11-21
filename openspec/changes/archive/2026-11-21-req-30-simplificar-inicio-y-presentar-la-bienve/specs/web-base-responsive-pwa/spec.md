# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Invite the initial Jugar gesture without forcing motion

The initial Jugar action SHALL have a subtle visual invitation that does not obstruct or delay its use. The invitation SHALL be reduced or disabled when the system preference is `prefers-reduced-motion: reduce`.

#### Scenario: Show a discreet invitation
- **GIVEN** the player is on the simplified Inicio
- **WHEN** the player observes the Jugar button
- **THEN** the button has a subtle, non-blocking invitation animation and remains immediately usable by touch or click

#### Scenario: Respect reduced motion
- **GIVEN** the system reports `prefers-reduced-motion: reduce`
- **WHEN** the simplified Inicio is rendered
- **THEN** the Jugar invitation is reduced or disabled and no essential state or action depends on animation
