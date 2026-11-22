# Spec Delta

## ADDED Requirements

### Requirement: La voz de la partida permanece fuera de las alternativas

La guía SHALL conservar la narración inicial de la pregunta, `guide.speakInstruction()`, la repetición de consigna desde `#btn-juego-sound`, la repetición de explicación desde `#btn-aprende-sound`, las pistas y el feedback existentes. Ninguna alternativa SHALL iniciar audio individual, secuencial o automático; no SHALL requerirse WAV, TTS, Fola ni servicio de voz adicional.

#### Scenario: Repetir consigna sin seleccionar
- **GIVEN** una pregunta visible y el control `#btn-juego-sound` fuera de las alternativas
- **WHEN** el niño pulsa «Repetir consigna»
- **THEN** se repite la consigna, la pregunta y su progreso permanecen iguales y no se selecciona ninguna alternativa

#### Scenario: Explicación y pista sin respuesta contabilizada
- **GIVEN** una pregunta sin resolver
- **WHEN** el niño pulsa `#btn-aprende-sound` o solicita una pista
- **THEN** se repite la explicación o se muestra/narra la ayuda existente según corresponda, sin contabilizar una respuesta ni crear audio desde una alternativa

#### Scenario: Sonido global y fallback
- **GIVEN** existen `#btn-juego-sound`, `#btn-aprende-sound` y `#btn-sound-toggle`
- **WHEN** el sonido se silencia o la voz no está disponible
- **THEN** los tres controles se conservan, Fola y el texto siguen funcionando según el fallback existente, y las opciones siguen siendo seleccionables sin bloqueo
