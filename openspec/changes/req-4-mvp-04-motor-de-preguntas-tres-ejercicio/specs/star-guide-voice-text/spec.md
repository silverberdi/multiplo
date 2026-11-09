# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella refleja estados y retroalimentación empática

La experiencia SHALL representar los estados normal, hablando, celebrando y pensando con los SVG aprobados de la mascota. Ante un error de una pregunta evaluable SHALL invitar a otro intento con lenguaje amable, SHALL conservar la actividad y SHALL poder mostrar una pista sin regaño, castigo, pérdida de progreso ni dependencia exclusiva del color. Ante un acierto SHALL comunicarlo con feedback breve y permitir continuar sin convertir un reintento correcto en un acierto de primer intento.

#### Scenario: Estados visuales de la mascota
- **GIVEN** la estrella guía una pregunta del motor
- **WHEN** espera una respuesta, ofrece una pista, reacciona a un error o celebra un acierto/cierre
- **THEN** puede mostrarse normal, pensando, pensando o celebrando respectivamente, usando los SVG versionados y manteniendo texto comprensible

#### Scenario: Retroalimentación empática ante un error
- **GIVEN** el niño da una respuesta fallida
- **WHEN** la estrella reacciona
- **THEN** invita a intentarlo otra vez, puede ofrecer Pista, conserva la pregunta y no regaña, castiga ni descuenta progreso

#### Scenario: Retroalimentación empática
- **GIVEN** el niño da una respuesta fallida
- **WHEN** la estrella reacciona
- **THEN** invita a otro intento con lenguaje amable, conserva la actividad y no regaña ni castiga

#### Scenario: Feedback de acierto tardío
- **GIVEN** el niño falló el primer intento y después selecciona la respuesta correcta
- **WHEN** el motor confirma el acierto
- **THEN** la estrella celebra y permite continuar, pero la evaluación conserva que no fue acertada al primer intento

### Requirement: Los sonidos originales se reproducen de forma discreta y respetan el silencio

La experiencia SHALL asociar acierto, intento, celebración y clic con sus respectivos WAV versionados, SHALL evitar superponer efectos innecesarios con la voz y SHALL tratar un error de carga o reproducción como no bloqueante. Cuando el sonido está silenciado no SHALL reproducir ninguno de esos efectos. En el motor de preguntas, un fallo SHALL asociarse a `intento.wav` y un acierto SHALL asociarse a `acierto.wav`.

#### Scenario: Sonidos originales discretos
- **GIVEN** el sonido está habilitado
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** se reproduce, si está disponible, el efecto original discreto correspondiente a `acierto.wav`, `intento.wav`, `celebracion.wav` o `clic.wav`

#### Scenario: El silencio aplica a todos los sonidos
- **GIVEN** el jugador ha silenciado el sonido
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** no se reproduce ningún sonido hasta habilitar el sonido nuevamente

#### Scenario: Fallo de un efecto sonoro
- **GIVEN** un archivo de efecto falta, no carga o el navegador rechaza su reproducción
- **WHEN** ocurre el evento asociado
- **THEN** el texto, la voz disponible y la interacción continúan sin bloqueo ni error que obligue a abandonar la actividad
