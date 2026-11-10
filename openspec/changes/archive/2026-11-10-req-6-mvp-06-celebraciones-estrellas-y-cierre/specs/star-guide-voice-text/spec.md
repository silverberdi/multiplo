# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella refleja estados y retroalimentación empática

La experiencia SHALL representar los estados normal, hablando, celebrando y pensando con los SVG aprobados de la mascota. Ante un error de una pregunta evaluable SHALL invitar a otro intento con lenguaje amable, SHALL conservar la actividad y SHALL poder mostrar una pista sin regaño, castigo, pérdida de progreso ni dependencia exclusiva del color. Ante un acierto SHALL comunicarlo con una celebración visual y/o textual breve, SHALL permitir continuar sin convertir un reintento correcto en un acierto de primer intento y SHALL completar la ronda con un estado de celebración diferenciado.

#### Scenario: Estados visuales de la mascota
- **GIVEN** la estrella guía al niño de seis años
- **WHEN** se muestra su estado visual
- **THEN** puede mostrarse normal al esperar, hablando al narrar, celebrando al acertar o cerrar una ronda, y pensando al ofrecer una pista o reaccionar a un intento fallido

#### Scenario: Retroalimentación empática ante un error
- **GIVEN** el niño da una respuesta fallida
- **WHEN** la estrella reacciona
- **THEN** invita a intentarlo otra vez, puede ofrecer Pista, conserva la pregunta y no regaña, castiga ni descuenta progreso

#### Scenario: Celebración breve de un acierto
- **GIVEN** el niño responde correctamente una pregunta
- **WHEN** la respuesta se confirma
- **THEN** la estrella comunica una felicitación breve mediante `celebrando.svg` y/o texto, y el niño puede continuar a la siguiente actividad sin esperar una pantalla bloqueante

#### Scenario: Feedback de acierto tardío
- **GIVEN** el niño falló el primer intento y después selecciona la respuesta correcta
- **WHEN** el motor confirma el acierto
- **THEN** la estrella celebra y permite continuar, pero la evaluación conserva que no fue acertada al primer intento

#### Scenario: Cierre de ronda celebrado
- **GIVEN** se completaron las cuatro preguntas evaluables
- **WHEN** aparece el resultado de la ronda
- **THEN** la estrella usa su estado celebrando, se muestran las estrellas obtenidas y se ofrece un mensaje positivo escrito y, si procede, hablado

### Requirement: Los sonidos originales se reproducen de forma discreta y respetan el silencio

La experiencia SHALL asociar acierto, intento, celebración y clic con sus respectivos WAV versionados, SHALL evitar superponer efectos innecesarios con la voz y SHALL tratar un error de carga o reproducción como no bloqueante. Cuando el sonido está silenciado no SHALL reproducir ninguno de esos efectos. En el motor de preguntas, un fallo SHALL asociarse a `intento.wav`, un acierto SHALL asociarse a `acierto.wav` y el cierre de la ronda SHALL poder asociarse una vez a `celebracion.wav`.

#### Scenario: Sonidos originales discretos
- **GIVEN** el sonido está habilitado
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** se reproduce, si está disponible, el efecto original discreto correspondiente a `acierto.wav`, `intento.wav`, `celebracion.wav` o `clic.wav`, sin bloquear el flujo

#### Scenario: El silencio aplica a todos los sonidos
- **GIVEN** el jugador ha silenciado el sonido
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** no se reproduce ningún sonido ni voz hasta habilitar el sonido nuevamente, y el texto y las imágenes siguen visibles

#### Scenario: Fallo de un efecto sonoro
- **GIVEN** un archivo de efecto falta, no carga o el navegador rechaza su reproducción
- **WHEN** ocurre el evento asociado
- **THEN** el texto, la voz disponible y la interacción continúan sin bloqueo ni error que obligue a abandonar la actividad
