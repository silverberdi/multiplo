# Spec Delta

## MODIFIED Requirements

### Requirement: La guía controla repetición, silencio y ciclo de voz sin solapamientos

La guía SHALL permitir avanzar desde la bienvenida mientras el clip está sonando, repetir la instrucción relevante, cancelar audio previo al cambiar a la selección o a una partida y respetar la preferencia `multiplo_sound_enabled`; silenciar SHALL detener voz y efectos sin alterar preguntas, estrellas, niveles ni dominio. Un acierto ordinario SHALL reproducir el efecto de acierto y feedback visual/textual sin iniciar la misma felicitación hablada en cada acierto; la voz SHALL reservarse para bienvenida, explicación, pista, hito o cierre, y cualquier narración iniciada SHALL cancelarse o terminar antes de que comience otra.

#### Scenario: Repaso de voz sin mutar progreso
- **GIVEN** existe una instrucción visible
- **WHEN** se pulsa Repetir
- **THEN** se reproduce una vez el clip relevante sin cambiar pregunta, intento, estrella o progreso

#### Scenario: Regresión de silencio
- **GIVEN** el sonido está silenciado
- **WHEN** se inicia una introducción, pista, acierto o cierre
- **THEN** no se reproduce audio y el flujo textual continúa

#### Scenario: Repetir la última instrucción
- **GIVEN** existe una instrucción o pregunta visible
- **WHEN** el jugador usa el control independiente de Repetir
- **THEN** se vuelve a reproducir el clip relevante una vez sin cambiar la pregunta, respuestas, intentos, estrellas ni progreso

#### Scenario: Aciertos ordinarios no repiten la misma voz
- **GIVEN** el niño obtiene varios aciertos ordinarios en una ronda
- **WHEN** se procesa cada acierto
- **THEN** se mantiene el feedback visual/textual y el efecto de acierto, pero no se solicita la misma felicitación hablada para cada acierto ordinario

#### Scenario: Voz reservada para contenido valioso
- **GIVEN** ocurre la bienvenida, una explicación, una pista, un hito o el cierre de la ronda
- **WHEN** la guía determina que la voz aporta contenido o valor de celebración
- **THEN** puede solicitar el clip Fola correspondiente, sin convertir los aciertos ordinarios en una narración repetitiva

#### Scenario: No solapar discursos ni efectos
- **GIVEN** se está reproduciendo una locución Fola o un efecto
- **WHEN** se presenta otra instrucción o evento sonoro
- **THEN** el audio anterior se cancela o termina antes de iniciar el nuevo, y nunca se reproducen dos locuciones ni una locución y un efecto incompatible simultáneamente

#### Scenario: No solapar discursos
- **GIVEN** se está reproduciendo una locución Fola
- **WHEN** se presenta otra instrucción
- **THEN** la locución anterior se cancela o termina antes de iniciar la nueva y nunca se reproducen dos locuciones simultáneamente

#### Scenario: Detener la voz anterior al cambiar la actividad
- **GIVEN** se está reproduciendo una instrucción hablada
- **WHEN** cambia la pantalla o la pregunta
- **THEN** se detiene la locución anterior antes de presentar la de la nueva actividad

#### Scenario: Disparar síntesis tras un gesto del usuario
- **GIVEN** el navegador puede restringir reproducción automática
- **WHEN** ocurre el gesto del usuario que inicia o continúa la actividad
- **THEN** la narración se intenta después de ese gesto y el flujo no depende de audio audible previo

#### Scenario: Modo silencioso
- **GIVEN** el jugador silencia el sonido
- **WHEN** hay una locución, un efecto, un acierto o una navegación
- **THEN** voz y efectos cesan, no se reproducen nuevos sonidos, y el texto, feedback visual, preguntas, estrellas y navegación permanecen disponibles

#### Scenario: Conservar la preferencia local de silencio
- **GIVEN** el jugador silencia el sonido
- **WHEN** se recarga el mismo navegador o se inicia una nueva sesión
- **THEN** la preferencia `multiplo_sound_enabled` o estado equivalente permanece deshabilitada hasta reactivación explícita

#### Scenario: Continuar antes del final del clip
- **GIVEN** la bienvenida o una narración está reproduciendo su clip
- **WHEN** el jugador continúa hacia la selección o la siguiente actividad
- **THEN** se cancela la voz anterior, la navegación ocurre sin esperar al final y no queda una narración solapada

#### Scenario: Pasar al terminar
- **GIVEN** el jugador inició la bienvenida y no la adelantó
- **WHEN** el clip termina
- **THEN** aparece la selección de niveles una sola vez

#### Scenario: No solapar ni reanudar la voz anterior
- **GIVEN** se está reproduciendo la bienvenida
- **WHEN** cambia la pantalla hacia la selección o una partida
- **THEN** la locución de bienvenida se detiene antes de presentar la nueva actividad y no se reproducen dos locuciones simultáneamente

#### Scenario: Audio restringido por el navegador
- **GIVEN** el navegador rechaza una reproducción o falta el clip
- **WHEN** se inicia o continúa una actividad
- **THEN** el flujo textual y visual continúa sin bloqueo ni dependencia de audio audible

### Requirement: La estrella refleja estados y retroalimentación empática

La experiencia SHALL representar los estados normal, hablando, celebrando y pensando con los SVG aprobados de la mascota. Ante un error de una pregunta evaluable SHALL invitar a otro intento con lenguaje amable, SHALL conservar la actividad y SHALL poder mostrar una pista sin regaño, castigo, pérdida de progreso ni dependencia exclusiva del color. Ante un acierto SHALL comunicarlo inmediatamente con feedback textual y una celebración visual breve, SHALL permitir continuar sin esperar una animación o una locución y SHALL conservar un estado de celebración diferenciado para el cierre. Un acierto ordinario no SHALL requerir una felicitación hablada repetida.

#### Scenario: Estados visuales de la mascota
- **GIVEN** la estrella guía al niño de seis años
- **WHEN** se muestra su estado visual
- **THEN** puede mostrarse normal al esperar, hablando al narrar, celebrando al acertar o cerrar una ronda, y pensando al ofrecer una pista o reaccionar a un intento fallido

#### Scenario: Retroalimentación empática ante un error
- **GIVEN** el niño da una respuesta fallida
- **WHEN** la estrella reacciona
- **THEN** invita a intentarlo otra vez, puede ofrecer Pista, conserva la pregunta y no regaña, castiga ni descuenta progreso

#### Scenario: Acierto ordinario inmediato
- **GIVEN** el niño responde correctamente una pregunta evaluable
- **WHEN** el motor confirma el acierto ordinario
- **THEN** aparece feedback textual inmediato, la estrella asociada se anima brevemente y el niño puede usar Continuar sin esperar la animación ni una felicitación hablada

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

La experiencia SHALL asociar acierto, intento, celebración y clic con sus respectivos WAV versionados, SHALL tratar un error de carga o reproducción como no bloqueante y SHALL evitar superponer efectos con la voz Fola. Un acierto ordinario SHALL solicitar `acierto.wav` como efecto breve, no SHALL solicitar una felicitación hablada repetitiva y SHALL dejar disponible Continuar de inmediato. Cuando el sonido está silenciado no SHALL reproducir ninguno de esos efectos ni locuciones. El motor SHALL asociar un fallo a `intento.wav`, un acierto a `acierto.wav` y el cierre de la ronda podrá asociarse una vez a `celebracion.wav`.

#### Scenario: Sonidos originales discretos
- **GIVEN** el sonido está habilitado
- **WHEN** ocurre un acierto, un intento, una celebración o un clic
- **THEN** se reproduce, si está disponible, el efecto original discreto correspondiente sin bloquear el flujo ni mezclarse invasivamente con la locución

#### Scenario: Acierto ordinario sin voz repetitiva
- **GIVEN** el sonido está habilitado y se confirman varios aciertos ordinarios
- **WHEN** se observan las solicitudes de audio
- **THEN** cada acierto solicita su efecto sonoro en el orden esperado y no solicita la misma felicitación hablada ordinaria en cada respuesta

#### Scenario: El silencio aplica a todos los sonidos
- **GIVEN** el jugador ha silenciado el sonido
- **WHEN** ocurre un acierto, una celebración, un fallo o una navegación
- **THEN** no se reproduce ningún sonido ni voz hasta habilitar el sonido nuevamente, y el texto y las imágenes siguen visibles

#### Scenario: Fallo de un efecto sonoro
- **GIVEN** un archivo de efecto falta, no carga o el navegador rechaza su reproducción
- **WHEN** ocurre el evento asociado
- **THEN** el texto, la narración Fola si está disponible y la interacción continúan sin bloqueo ni error que obligue a abandonar la actividad
