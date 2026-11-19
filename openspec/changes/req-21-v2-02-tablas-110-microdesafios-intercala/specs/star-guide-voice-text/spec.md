# Spec Delta

## MODIFIED Requirements

### Requirement: La estrella presenta instrucciones en español con texto y voz opcional

La experiencia SHALL seleccionar el clip Fola preparado apropiado para introducción de tabla, Aprende, pregunta, pista, acierto, error y cierre según el evento y la operación real `a×b`, incluyendo tablas 1–10. No SHALL generar audio nuevo, usar TTS/IA ni describir una orientación distinta. El texto e imágenes equivalentes SHALL permanecer disponibles y el audio no SHALL bloquear.

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
- **WHEN** comienza la actividad tras ese gesto
- **THEN** se intenta el clip Fola apropiado y el texto permanece visible

#### Scenario: Narración de la demostración Aprende
- **GIVEN** se presenta la operación `3 × 2` como tres grupos de dos
- **WHEN** la estrella narra la demostración
- **THEN** el clip y el texto describen `3 × 2` y tres grupos de dos, sin invertir la orientación

#### Scenario: Instrucciones habladas y texto simultáneamente disponible
- **GIVEN** ocurre un evento de Aprende, pregunta, pista, acierto, error o cierre
- **WHEN** la guía responde
- **THEN** ofrece el clip Fola correspondiente cuando está disponible y conserva texto e imágenes equivalentes

#### Scenario: Ausencia de voz
- **GIVEN** falta o falla el clip requerido
- **WHEN** el jugador inicia o continúa una actividad
- **THEN** texto, imágenes, alternativas y navegación siguen disponibles sin bloqueo ni voz robótica

#### Scenario: No se requiere una guía bilingüe
- **GIVEN** la actividad del MVP está en español
- **WHEN** se presenta una instrucción
- **THEN** la guía se ofrece en español sin exigir traducción o locución bilingüe

### Requirement: La guía controla repetición, silencio y ciclo de voz sin solapamientos

La guía SHALL permitir repetir la instrucción relevante, cancelar audio previo al cambiar de actividad y respetar la preferencia `multiplo_sound_enabled`; silenciar SHALL detener voz y efectos sin alterar preguntas, estrellas ni dominio.

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
- **WHEN** el jugador pulsa Repetir
- **THEN** se reproduce una vez el clip relevante sin cambiar la pregunta, intentos, estrellas ni progreso

#### Scenario: No solapar discursos
- **GIVEN** se está reproduciendo una locución Fola
- **WHEN** se presenta otra instrucción
- **THEN** la locución anterior se cancela o termina antes de iniciar la nueva

#### Scenario: Detener la voz anterior al cambiar la actividad
- **GIVEN** se está reproduciendo una instrucción hablada
- **WHEN** cambia la pantalla o la pregunta
- **THEN** se detiene la locución anterior antes de presentar la nueva

#### Scenario: Disparar síntesis tras un gesto del usuario
- **GIVEN** el navegador puede restringir la reproducción automática
- **WHEN** ocurre el gesto que inicia o continúa la actividad
- **THEN** se intenta la narración después del gesto y el flujo no depende del audio

#### Scenario: Modo silencioso
- **GIVEN** el jugador silencia el sonido
- **WHEN** hay una locución, efecto o navegación
- **THEN** voz y efectos cesan y no se reproducen nuevos sonidos

#### Scenario: Conservar la preferencia local de silencio
- **GIVEN** el jugador silencia el sonido
- **WHEN** recarga el mismo navegador o inicia una nueva sesión
- **THEN** `multiplo_sound_enabled` permanece deshabilitada hasta reactivación explícita
