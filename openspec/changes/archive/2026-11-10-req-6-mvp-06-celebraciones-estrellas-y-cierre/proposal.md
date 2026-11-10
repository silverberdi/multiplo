# Proposal

## Why

La ronda necesita un cierre breve y cálido que haga comprensible el esfuerzo del niño: qué logró, cuántas estrellas obtuvo y qué puede hacer después. El MVP ya define cuatro preguntas, puntuación de primer intento y desbloqueo 3/4, pero #6 debe convertir ese resultado en una celebración visible, hablada o escrita, repetible y no punitiva antes de la validación integral de #7.

## What Changes

- Añadir una celebración breve después de cada respuesta correcta que no bloquee el avance a la siguiente pregunta.
- Cerrar la ronda tras cuatro preguntas con hasta cuatro estrellas, calculadas exclusivamente por aciertos en primer intento, la mascota `celebrando.svg`, un mensaje positivo y el control `Repetir`.
- Mostrar una acción para ir al nivel siguiente únicamente cuando el resultado alcance 3/4 o 4/4 y exista un nivel posterior desbloqueable; conservar la posibilidad de repetir o volver a niveles abiertos.
- Mostrar, con 0/4, 1/4 o 2/4, un cierre positivo que invite a una nueva ronda sin lenguaje de fracaso ni pérdida de niveles previos.
- Usar `estrella-premio.svg`, `acierto.wav` y `celebracion.wav` junto con texto equivalente; respetar el estado silenciado para voz y efectos.
- Mantener la voz opcional y el texto visible como fallback; una animación o sonido de celebración nunca debe impedir continuar.

Límites: no se añaden monedas, rankings, vidas, niveles, pantallas extra, datos personales, backend, sincronización ni puntuación por reintentos.

## Capabilities

### New Capabilities

<!-- No new capability path: the behavior is a requirement-level delta to existing MVP contracts. -->

### Modified Capabilities

- `star-guide-voice-text`: amplía la celebración breve de aciertos y el cierre de ronda con mascota, texto/voz y efectos aprobados, respetando el silencio y la degradación no bloqueante.
- `level-progression-local-persistence`: define la presentación del resultado, la acción condicional de siguiente nivel, la repetición y la conservación de niveles previos cuando no se alcanza 3/4.
- `question-round-engine`: define el evento de celebración de cada acierto y la entrega del resumen de cuatro preguntas al cierre sin cambiar la evaluación inmutable de primer intento.

## Impact

- Issue: GitHub #6, dependencias #2 y #5; hito H3 del roadmap.
- Requisitos: RF-08; interacción con RF-06/RF-07 y RNF-02/RNF-07. Escenarios relacionados Q-05 a Q-09.
- Decisiones: D-006, D-008, D-011, D-015, D-016, D-018 y D-019.
- Recursos versionados: `assets/mascot/celebrando.svg`, `assets/icons/estrella-premio.svg`, `assets/audio/acierto.wav` y `assets/audio/celebracion.wav`.
- Afecta la futura UI de Juego/Fin de ronda, la coordinación del estado de ronda, el progreso local y el narrador/sonido. No requiere API, base de datos, migración ni dependencia externa.
- La propuesta es planificación OpenSpec únicamente; no afirma implementación, pruebas ni despliegue.
