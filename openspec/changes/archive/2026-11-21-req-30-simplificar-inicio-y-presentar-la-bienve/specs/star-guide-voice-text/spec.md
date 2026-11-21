# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL seleccionar el clip Fola preparado apropiado para la bienvenida según sea primera visita o regreso. Al pulsar Jugar, SHALL mostrar inmediatamente el saludo textual y mantenerlo visible durante la bienvenida; el gesto SHALL habilitar el intento de reproducción de audio. No SHALL intentar una reproducción audible automática al cargar Inicio. El texto, la navegación y las imágenes equivalentes SHALL permanecer disponibles y el audio no SHALL bloquear.

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

La guía SHALL permitir avanzar desde la bienvenida mientras el clip está sonando, cancelar el audio anterior al cambiar a la selección o a una partida y evitar navegaciones duplicadas. SHALL respetar la preferencia `multiplo_sound_enabled`; silenciar SHALL detener voz y efectos sin alterar las preguntas, estrellas, niveles ni dominio.

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
