# star-guide-voice-text Specification

## Purpose
Define una guía de estrella accesible para acompañar las actividades del MVP con texto breve, voz española opcional y sonidos discretos, sin bloquear el aprendizaje cuando el navegador no soporte alguna capacidad multimedia.

## Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL mostrar cada instrucción de la actividad en texto legible y SHALL ofrecerla también mediante síntesis nativa en español cuando el navegador disponga de ella y el sonido esté habilitado. La voz SHALL comunicar únicamente contenido que también esté disponible visualmente y no SHALL ser un requisito para continuar.

#### Scenario: Guía en español con voz habilitada
- **GIVEN** existe una actividad del MVP en español y el sonido está habilitado
- **WHEN** se presenta una instrucción después de iniciar la interacción
- **THEN** el niño ve la instrucción escrita y la escucha si el navegador soporta síntesis de voz española, con un control disponible para repetirla

#### Scenario: Instrucciones habladas y texto simultáneamente disponible
- **GIVEN** se presenta una instrucción y el navegador dispone de síntesis nativa de voz
- **WHEN** la instrucción se ofrece al jugador
- **THEN** la instrucción permanece visible mientras se ofrece mediante voz española

#### Scenario: Ausencia de voz
- **GIVEN** el navegador no dispone de síntesis de voz, no tiene una voz española utilizable o la síntesis falla
- **WHEN** el jugador inicia o continúa una actividad
- **THEN** el texto legible permanece disponible, la interacción continúa y no se muestra un bloqueo por la ausencia de voz

#### Scenario: No se requiere una guía bilingüe
- **GIVEN** la actividad del MVP está en español
- **WHEN** se presenta una instrucción
- **THEN** la guía se ofrece en español y no exige una traducción o locución bilingüe

### Requirement: La guía controla repetición, silencio y ciclo de voz sin solapamientos

La experiencia SHALL permitir repetir la última instrucción, SHALL impedir discursos simultáneos, SHALL detener la voz anterior cuando cambia la actividad y SHALL iniciar síntesis únicamente como respuesta al gesto inicial permitido por el navegador. Silenciar SHALL detener cualquier voz en curso y evitar nuevas instrucciones habladas y efectos hasta reactivar el sonido.

#### Scenario: Repetir la última instrucción
- **GIVEN** existe una última instrucción disponible
- **WHEN** el jugador usa el control de repetir última instrucción
- **THEN** se vuelve a presentar la misma instrucción una vez sin cambiar la pregunta ni el progreso

#### Scenario: No solapar discursos
- **GIVEN** se está reproduciendo una instrucción hablada
- **WHEN** se presenta otra instrucción
- **THEN** el discurso anterior se cancela o termina antes de iniciar el nuevo y nunca se reproducen dos discursos simultáneamente

#### Scenario: Detener la voz anterior al cambiar la actividad
- **GIVEN** se está reproduciendo una instrucción hablada
- **WHEN** cambia la actividad
- **THEN** se detiene la voz anterior antes de presentar la instrucción de la nueva actividad

#### Scenario: Disparar síntesis tras un gesto del usuario
- **GIVEN** una instrucción requiere síntesis de voz y el navegador puede restringir reproducción automática
- **WHEN** ocurre un gesto del usuario que inicia o continúa la actividad
- **THEN** la síntesis se dispara después de ese gesto y el flujo no depende de reproducción automática previa

#### Scenario: Modo silencioso
- **GIVEN** el jugador silencia el sonido
- **WHEN** avanza a la siguiente actividad
- **THEN** no se emiten instrucciones habladas ni efectos hasta habilitar el sonido nuevamente

#### Scenario: Conservar la preferencia local de silencio
- **GIVEN** el jugador silencia el sonido
- **WHEN** se conserva la preferencia del jugador y se vuelve a abrir la experiencia en el mismo navegador
- **THEN** el sonido permanece deshabilitado hasta que el jugador lo habilite explícitamente

### Requirement: La estrella refleja estados y retroalimentación empática

La experiencia SHALL representar los estados normal, hablando, celebrando y pensando con los SVG aprobados de la mascota. Ante un error SHALL invitar a otro intento y podrá mostrar una pista sin regaño, castigo, pérdida de progreso o dependencia exclusiva del color.

#### Scenario: Estados visuales de la mascota
- **GIVEN** la estrella guía al niño de seis años
- **WHEN** se muestra su estado visual
- **THEN** puede mostrarse normal al esperar, hablando al narrar, celebrando al acertar o cerrar una ronda, y pensando al ofrecer una pista o reaccionar a un intento fallido

#### Scenario: Retroalimentación empática
- **GIVEN** el niño da una respuesta fallida
- **WHEN** la estrella reacciona
- **THEN** invita a otro intento con lenguaje amable, conserva la actividad y no regaña ni castiga

### Requirement: Los sonidos originales se reproducen de forma discreta y respetan el silencio

La experiencia SHALL asociar acierto, intento, celebración y clic con sus respectivos WAV versionados, SHALL evitar superponer efectos innecesarios con la voz y SHALL tratar un error de carga o reproducción como no bloqueante. Cuando el sonido está silenciado no SHALL reproducir ninguno de esos efectos.

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
