# star-guide-voice-text Specification

## Purpose
Define una guía de estrella accesible para acompañar las actividades del MVP con texto breve, voz española opcional y sonidos discretos, sin bloquear el aprendizaje cuando el navegador no soporte alguna capacidad multimedia.

## Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL seleccionar el clip Fola preparado apropiado para la bienvenida según sea primera visita o regreso, y para introducción de tabla, Aprende, pregunta, pista, acierto, error y cierre según el evento y la operación real `a×b`, incluyendo tablas 1–10. Al pulsar Jugar, SHALL mostrar inmediatamente el saludo textual y mantenerlo visible durante la bienvenida; el gesto SHALL habilitar el intento de reproducción de audio. No SHALL intentar una reproducción audible automática al cargar Inicio. No SHALL generar audio nuevo, usar TTS/IA ni describir una orientación distinta. El texto, la navegación y las imágenes equivalentes SHALL permanecer disponibles y el audio no SHALL bloquear.

#### Scenario: Introducción automática de tabla
- **GIVEN** el niño selecciona una tabla disponible y el sonido está habilitado
- **WHEN** termina la interacción de selección
- **THEN** se intenta automáticamente la introducción Fola correspondiente y el texto sigue visible

#### Scenario: Voz correcta para 3 por 2
- **GIVEN** la pantalla muestra `3×2`
- **WHEN** se reproduce Aprende o una pista
- **THEN** el clip y el texto comunican tres grupos de dos, no dos grupos de tres

#### Scenario: Fallback de clip ausente
- **GIVEN** falta o falla un clip requerido
- **WHEN** ocurre el evento
- **THEN** permanece el texto, la navegación y la interacción, sin voz robótica ni bloqueo

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

#### Scenario: Bienvenida al iniciar desde la portada
- **GIVEN** el sonido está habilitado y el jugador pulsa Jugar
- **WHEN** la aplicación entra al recorrido guiado por primera vez o en una visita posterior
- **THEN** reproduce, después del gesto, el clip de bienvenida correspondiente al estado de visita y mantiene visible el saludo equivalente

#### Scenario: Aprende reproduce una narración compatible
- **GIVEN** se presenta cualquiera de las 100 operaciones del MVP en Aprende
- **WHEN** se solicita la narración Fola
- **THEN** se permite reproducir la narración que expresa el número de grupos y objetos por grupo, aunque la frase incluya el sustantivo de los objetos

#### Scenario: Bienvenida tras el gesto de Jugar
- **GIVEN** el jugador está en el Inicio simplificado
- **WHEN** pulsa Jugar
- **THEN** aparece inmediatamente el saludo textual, permanece visible durante la bienvenida y se solicita el clip de primera visita o regreso después de ese gesto

#### Scenario: No reproducir al cargar
- **GIVEN** el jugador carga Inicio sin haber pulsado Jugar
- **WHEN** termina de cargar la página
- **THEN** no se intenta una reproducción audible automática

#### Scenario: Fallback inmediato de clip ausente
- **GIVEN** el jugador inició la bienvenida y el audio está silenciado, falta o falla
- **WHEN** el sistema detecta que no puede reproducir el clip
- **THEN** la selección de niveles aparece inmediatamente y el texto y la navegación permanecen disponibles sin voz robótica ni bloqueo

### Requirement: La guía controla repetición, silencio y ciclo de voz sin solapamientos

La guía SHALL permitir avanzar desde la bienvenida mientras el clip está sonando, repetir la instrucción relevante, cancelar audio previo al cambiar a la selección o a una partida y respetar la preferencia `multiplo_sound_enabled`; silenciar SHALL detener voz y efectos sin alterar preguntas, estrellas, niveles ni dominio.

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
- **WHEN** hay una locución, un efecto o una navegación
- **THEN** voz y efectos cesan, y no se reproducen nuevos sonidos

#### Scenario: Conservar la preferencia local de silencio
- **GIVEN** el jugador silencia el sonido
- **WHEN** se recarga el mismo navegador o se inicia una nueva sesión
- **THEN** la preferencia `multiplo_sound_enabled` o estado equivalente permanece deshabilitada hasta reactivación explícita

#### Scenario: Continuar antes del final del clip
- **GIVEN** la bienvenida está reproduciendo su clip
- **WHEN** el jugador continúa hacia la selección de niveles
- **THEN** se cancela la voz anterior, la selección aparece sin esperar al final y la navegación ocurre una sola vez

#### Scenario: Pasar al terminar
- **GIVEN** el jugador inició la bienvenida y no la adelantó
- **WHEN** el clip termina
- **THEN** aparece la selección de niveles una sola vez

#### Scenario: Audio restringido por el navegador
- **GIVEN** el navegador rechaza la reproducción aun después del gesto o el sonido está silenciado
- **WHEN** se inicia la bienvenida
- **THEN** el flujo textual continúa y la selección queda disponible sin depender de audio audible

#### Scenario: No solapar ni reanudar la voz anterior
- **GIVEN** se está reproduciendo la bienvenida
- **WHEN** cambia la pantalla hacia la selección o una partida
- **THEN** la locución de bienvenida se detiene antes de presentar la nueva actividad y no se reproducen dos locuciones simultáneamente

### Requirement: La estrella refleja estados y retroalimentación empática

La experiencia SHALL representar los estados normal, hablando, celebrando y pensando con los SVG aprobados de la mascota. Ante un error de una pregunta evaluable SHALL invitar a otro intento con lenguaje amable, SHALL conservar la actividad y SHALL poder mostrar una pista sin regaño, castigo, pérdida de progreso ni dependencia exclusiva del color. Ante un acierto SHALL comunicarlo con una celebración visual y/o textual breve, SHALL permitir continuar sin convertir un reintento correcto en un acierto de primer intento y SHALL completar la ronda con un estado de celebración diferenciado.
Una interacción con objetos o grupos no evaluables SHALL poder ofrecer contexto sin seleccionar respuestas ni iniciar locuciones repetitivas por toques sucesivos.

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

### Requirement: El guion de la estrella cubre el recorrido breve del MVP

La guía SHALL disponer de textos equivalentes a un saludo, una demostración de grupos, una pregunta, un acierto, una invitación a contar otra vez y un cierre de aventura. Las frases podrán adaptarse al contexto matemático, pero SHALL conservar lenguaje breve, positivo y comprensible en español.

#### Scenario: Guion de ejemplo
- **GIVEN** la estrella guía la actividad
- **WHEN** presenta el guion de ejemplo
- **THEN** puede comunicar «¡Hola! Vamos a jugar», «Mira: tres grupos de dos», «¿Cuántos hay en total?», «¡Muy bien!», «Cuenta otra vez» y «¡Terminaste la aventura!» mediante texto y voz cuando esta esté disponible

### Requirement: La guía usa los recursos multimedia versionados del MVP

La experiencia SHALL considerar los cuatro SVG de mascota y los cuatro WAV enumerados en `docs/ASSETS.md`, cargándolos desde los recursos versionados del repositorio sin depender de un servicio multimedia externo.

#### Scenario: Recursos multimedia vinculados
- **GIVEN** se consultan los recursos multimedia vinculados
- **WHEN** se prepara la guía de la estrella
- **THEN** se consideran `normal.svg`, `hablando.svg`, `celebrando.svg`, `pensando.svg`, `acierto.wav`, `intento.wav`, `celebracion.wav`, `clic.wav` y la Guía de recursos de `ASSETS.md`
