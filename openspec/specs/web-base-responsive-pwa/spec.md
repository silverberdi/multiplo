# web-base-responsive-pwa Specification

## Purpose

Define the responsive, visual and installable web foundation that lets a child reach Múltiplo on common screen sizes with clear base views, approved identity and graceful browser fallbacks.

## Requirements

### Requirement: Base views expose the approved MVP structure

The web experience SHALL expose an understandable static skeleton for inicio/niveles, aprende, juego and fin de ronda, with Spanish labels and primary controls visible even though the learning and scoring logic belongs to later changes.

#### Scenario: Render the four base views
- **GIVEN** a user opens the Múltiplo web experience before game logic is integrated
- **WHEN** the base experience is rendered and the user follows its primary navigation actions
- **THEN** the user can reach the inicio/niveles, aprende, juego and fin de ronda skeletons without encountering an unapproved additional screen

### Requirement: Base views are responsive and usable by touch or click

The base views SHALL adapt to cellular, tablet and desktop widths without horizontal overflow. Primary controls, numbers and essential text SHALL remain legible and comfortably targetable by touch or pointer.

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
