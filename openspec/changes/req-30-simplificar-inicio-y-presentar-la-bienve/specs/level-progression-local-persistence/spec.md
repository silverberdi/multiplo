# Spec Delta

## ADDED Requirements

### Requirement: Presentar la selección después de la bienvenida sin alterar la progresión

La aplicación SHALL diferir la presentación visible de la selección de niveles hasta que la bienvenida haya terminado o el jugador la haya adelantado explícitamente. Una vez visible, SHALL reutilizar las reglas existentes de disponibilidad, persistencia y bloqueo: una tabla disponible inicia su partida y una tabla bloqueada no puede seleccionarse.

#### Scenario: Selection follows an explicit continue action
- **GIVEN** el jugador ha iniciado la bienvenida desde Inicio
- **WHEN** pulsa Continuar antes de que termine el audio
- **THEN** aparece la selección de niveles, la voz se cancela y la navegación no se duplica

#### Scenario: Selection follows natural completion
- **GIVEN** el jugador inició la bienvenida y no la adelantó
- **WHEN** termina la bienvenida o el audio no está disponible
- **THEN** aparece la selección de niveles sin exigir espera adicional

#### Scenario: Preserve available and blocked tables
- **GIVEN** la selección de niveles está visible
- **WHEN** el jugador intenta elegir una tabla
- **THEN** una tabla disponible inicia su partida y una tabla bloqueada sigue sin poder seleccionarse
