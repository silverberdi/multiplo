# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL mostrar cada instrucción de la actividad en texto legible y SHALL ofrecerla mediante un clip Fola pregrabado apropiado cuando el sonido esté habilitado y el recurso preparado esté disponible. La selección SHALL depender del evento y de la operación matemática real mostrada, respetando `a×b = a grupos de b`; no SHALL usar `speechSynthesis`, TTS o IA como sustituto. La voz SHALL comunicar únicamente contenido que también esté disponible visualmente y no SHALL ser un requisito para continuar.

#### Scenario: Guía en español con voz habilitada
- **GIVEN** el audio está habilitado y el niño selecciona una tabla desbloqueada
- **WHEN** comienza la actividad tras ese gesto de entrada
- **THEN** se reproduce automáticamente el clip Fola de bienvenida/introducción apropiado sin segundo botón de inicio y el texto permanece visible

#### Scenario: Narración de la demostración Aprende
- **GIVEN** se presenta la operación `3 × 2` como tres grupos de dos
- **WHEN** la estrella narra la pregunta o explicación
- **THEN** el clip describe `3 × 2` y tres grupos de dos cuando corresponda, sin describir cantidades distintas y sin síntesis del navegador

#### Scenario: Instrucciones habladas y texto simultáneamente disponible
- **GIVEN** el niño avanza por Aprende, instrucciones, preguntas, alternativas, pistas, aciertos, errores y cierre
- **WHEN** ocurre cada evento de la actividad
- **THEN** la estrella ofrece el clip Fola correspondiente al evento y operación activa, mientras conserva texto e imágenes equivalentes

#### Scenario: Ausencia de voz
- **GIVEN** el clip requerido falta, está corrupto o el navegador rechaza su reproducción
- **WHEN** el jugador inicia o continúa una actividad
- **THEN** el texto legible, las imágenes, alternativas y navegación permanecen disponibles, no se bloquea el ejercicio y no aparece voz robótica

#### Scenario: No se requiere una guía bilingüe
- **GIVEN** la actividad del MVP está en español
- **WHEN** se presenta una instrucción
- **THEN** la guía se ofrece en español y no exige una traducción o locución bilingüe

### Requirement: La guía controla repetición, silencio y ciclo de voz sin solapamientos

La experiencia SHALL permitir repetir la instrucción o pregunta relevante, SHALL impedir reproducciones simultáneas, SHALL detener la voz anterior cuando cambia la pantalla o pregunta y SHALL iniciar audio únicamente después del gesto inicial permitido por el navegador. El control de repetir SHALL estar separado de las alternativas y escuchar SHALL no modificar pregunta, intentos, estrellas ni progreso. Silenciar SHALL detener inmediatamente voz y efectos, impedir reproducciones posteriores y conservar la preferencia local hasta reactivación explícita.

#### Scenario: Repetir la última instrucción
- **GIVEN** existe una instrucción o pregunta visible
- **WHEN** el jugador usa el control independiente de Repetir
- **THEN** se vuelve a reproducir el clip relevante una vez sin cambiar la pregunta, respuestas, intentos, estrellas ni progreso

#### Scenario: Escuchar una alternativa no selecciona respuesta
- **GIVEN** aparecen tres alternativas y cada una puede tener un control discreto de escucha
- **WHEN** el niño escucha una alternativa
- **THEN** ninguna alternativa queda seleccionada y el contador de intentos y las estrellas no cambian

#### Scenario: No solapar discursos
- **GIVEN** se está reproduciendo una locución Fola
- **WHEN** se presenta otra instrucción
- **THEN** la locución anterior se cancela o termina antes de iniciar la nueva y nunca se reproducen dos locuciones simultáneamente

#### Scenario: Detener la voz anterior al cambiar la actividad
- **GIVEN** se está reproduciendo una locución
- **WHEN** cambia la pantalla o la pregunta
- **THEN** se detiene la locución anterior antes de presentar la de la nueva actividad

#### Scenario: Disparar síntesis tras un gesto del usuario
- **GIVEN** el navegador puede restringir reproducción automática
- **WHEN** ocurre el gesto del usuario que inicia o continúa la actividad
- **THEN** la narración se intenta después de ese gesto y el flujo no depende de audio audible previo

#### Scenario: Modo silencioso
- **GIVEN** el jugador silencia el sonido
- **WHEN** hay una locución, un efecto o una navegación
- **THEN** voz y efectos cesan, y no se reproducen nuevos sonidos

#### Scenario: Conservar la preferencia local de silencio
- **GIVEN** el jugador silencia el sonido
- **WHEN** se recarga el mismo navegador o se inicia una nueva sesión
- **THEN** la preferencia `multiplo_sound_enabled` o estado equivalente permanece deshabilitada hasta reactivación explícita

### Requirement: La estrella refleja estados y retroalimentación empática

La experiencia SHALL representar los estados normal, hablando, celebrando y pensando con los SVG aprobados de la mascota. Ante un error de una pregunta evaluable SHALL invitar a otro intento con lenguaje amable, SHALL conservar la actividad y SHALL poder mostrar una pista sin regaño, castigo, pérdida de progreso ni dependencia exclusiva del color. Ante un acierto SHALL comunicarlo con una celebración visual y/o textual breve, SHALL permitir continuar sin convertir un reintento correcto en un acierto de primer intento y SHALL completar la ronda con un estado de celebración diferenciado. Una interacción con objetos o grupos no evaluables SHALL poder ofrecer contexto sin seleccionar respuestas ni iniciar locuciones repetitivas por toques sucesivos.

#### Scenario: Estados visuales de la mascota
- **GIVEN** la estrella guía al niño de seis años
- **WHEN** se muestra su estado visual
- **THEN** puede mostrarse normal al esperar, hablando al narrar, celebrando al acertar o cerrar una ronda, y pensando al ofrecer una pista o reaccionar a un intento fallido

#### Scenario: Retroalimentación empática ante un error
- **GIVEN** el niño da una respuesta fallida
- **WHEN** la estrella reacciona
- **THEN** invita a intentarlo otra vez, puede ofrecer Pista, conserva la pregunta y no regaña, castiga ni descuenta progreso

#### Scenario: Feedback de acierto tardío
- **GIVEN** el niño falló el primer intento y después selecciona la respuesta correcta
- **WHEN** el motor confirma el acierto
- **THEN** la estrella celebra y permite continuar, pero la evaluación conserva que no fue acertada al primer intento

#### Scenario: Contexto de un grupo no evaluable
- **GIVEN** se muestra una actividad visual y el niño toca un grupo que no es una alternativa
- **WHEN** ocurre el toque
- **THEN** puede escucharse una indicación contextual una vez sin seleccionar respuesta, consumir intento ni crear un bucle de narraciones

#### Scenario: Celebración breve de un acierto
- **GIVEN** el niño responde correctamente una pregunta
- **WHEN** la respuesta se confirma
- **THEN** la estrella comunica una felicitación breve mediante `celebrando.svg` y/o texto, y el niño puede continuar a la siguiente actividad sin esperar una pantalla bloqueante

#### Scenario: Cierre de ronda celebrado
- **GIVEN** se completaron las cuatro preguntas evaluables
- **WHEN** aparece el resultado de la ronda
- **THEN** la estrella usa su estado celebrando, se muestran las estrellas obtenidas y se ofrece un mensaje positivo escrito y, si procede, hablado

### Requirement: Los sonidos originales se reproducen de forma discreta y respetan el silencio

La experiencia SHALL asociar acierto, intento, celebración y clic con sus respectivos WAV versionados, SHALL evitar superponer efectos con la voz Fola y SHALL tratar un error de carga o reproducción como no bloqueante. Cuando el sonido está silenciado no SHALL reproducir ninguno de esos efectos ni locuciones. En el motor de preguntas, un fallo SHALL asociarse a `intento.wav`, un acierto SHALL asociarse a `acierto.wav` y el cierre de la ronda SHALL poder asociarse una vez a `celebracion.wav`.

#### Scenario: Sonidos originales discretos
- **GIVEN** el sonido está habilitado
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** se reproduce, si está disponible, el efecto original discreto correspondiente sin bloquear el flujo ni mezclarlo invasivamente con la locución

#### Scenario: El silencio aplica a todos los sonidos
- **GIVEN** el jugador ha silenciado el sonido
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** no se reproduce ningún sonido ni voz hasta habilitar el sonido nuevamente, y el texto y las imágenes siguen visibles

#### Scenario: Fallo de un efecto sonoro
- **GIVEN** un archivo de efecto falta, no carga o el navegador rechaza su reproducción
- **WHEN** ocurre el evento asociado
- **THEN** el texto, la narración Fola si está disponible y la interacción continúan sin bloqueo ni error que obligue a abandonar la actividad
