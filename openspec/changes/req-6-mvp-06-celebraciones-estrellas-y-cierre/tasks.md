# Tasks

## 1. Contrato de resultado y coordinación de ronda

- [x] 1.1 Integrar en el flujo de cierre de #5 un resultado único de ronda con nivel, cuatro indicadores `firstAttemptCorrect` y total de 0–4, verificando con pruebas que un reintento correcto nunca muta el indicador inicial (question-round-engine, D-019).
- [x] 1.2 Emitir la celebración breve al confirmar cada acierto y mantener disponible la continuación inmediata, verificando que la ronda conserva exactamente cuatro preguntas y no cambia de nivel durante una respuesta (Q-05/Q-06; question-round-engine).
- [x] 1.3 Entregar el resultado una sola vez al terminar la cuarta pregunta y conectar ese resultado con la vista Fin y la progresión, verificando casos 0/4, 1/4, 2/4, 3/4 y 4/4 (question-round-engine, RF-08).

## 2. Vista de celebración y acciones de cierre

- [x] 2.1 Construir el cierre con cuatro posiciones de `assets/icons/estrella-premio.svg`, conteo visible de estrellas y `assets/mascot/celebrando.svg`, verificando texto/atributos accesibles y ausencia de dependencia exclusiva del color (Q-05–Q-07, RNF-07).
- [x] 2.2 Mostrar `Siguiente nivel` únicamente para 3/4 o 4/4 cuando exista un nivel posterior, y mantener `Repetir` y retorno a niveles abiertos; verificar que el Nivel 4 nunca ofrece Nivel 5 (level-progression-local-persistence, C1/C2).
- [x] 2.3 Definir mensajes positivos para 0/4–2/4 que feliciten la participación, inviten a repetir y no indiquen fracaso ni reviertan niveles abiertos; verificar la persistencia de niveles previos tras una ronda insuficiente (C3, RF-06/RF-07).
- [x] 2.4 Hacer que `Repetir` inicie una ronda limpia del mismo nivel sin alterar el resultado mostrado ni el progreso guardado, verificando que la nueva ronda no hereda aciertos ni estado de respuestas (Q-06/Q-08).

## 3. Voz, efectos y degradación

- [x] 3.1 Conectar `acierto.wav` con el acierto y `celebracion.wav` una sola vez con el cierre, reutilizando la coordinación de audio/voz existente y verificando que no haya reproducción simultánea innecesaria (star-guide-voice-text, D-015/D-016).
- [x] 3.2 Aplicar el estado silenciado a la celebración, voz y efectos, verificando que el texto, las estrellas, la mascota y la navegación siguen disponibles con sonido desactivado (escenario Respeto del estado silenciado, Q-09).
- [x] 3.3 Manejar ausencia, rechazo o fallo de carga de voz/WAV sin bloquear la ronda, verificando el fallback escrito y la posibilidad de completar el cierre sin recursos multimedia (RNF-02, star-guide-voice-text).
- [x] 3.4 Respetar reducción de movimiento y cancelar voz/efectos pendientes al cambiar de actividad, verificando que una animación o audio no obliga a esperar antes de pulsar Continuar (RNF-07).

## 4. Responsive, regresión y retiro seguro

- [x] 4.1 Ajustar el layout del resultado y sus acciones para celular, tablet y computador, verificando `scrollWidth <= clientWidth`, controles táctiles accesibles y ausencia de solapamientos en los estados 0–4 estrellas (Q-10, RNF-01).
- [x] 4.2 Ejecutar pruebas automatizadas de puntuación inicial, desbloqueo 3/4, repetición, nivel 4 y persistencia local, verificando que los escenarios existentes de #5 siguen pasando (Q-05–Q-08).
- [x] 4.3 Ejecutar E2E del recorrido completo con voz disponible, voz ausente y modo silenciado, verificando celebración por acierto, cierre, acciones y continuidad en los tres factores de forma (Q-09/Q-10, #6 y dependencia #2).
- [x] 4.4 Inventariar y retirar dentro de este Change cualquier markup, mensaje o lógica de recompensa estática que quede sustituida por el cierre dinámico, verificando que no quedan dos cierres ni rutas de recompensa activas y repitiendo las pruebas E2E afectadas (safe retirement, D-018).
- [x] 4.5 Revisar el candidato contra la trazabilidad de `docs/TRACEABILITY.md`, RF-08, RNF-02/RNF-07, los activos de `docs/ASSETS.md` y los escenarios Gherkin de estos specs, verificando evidencia antes de declarar el Change implementado (issue #6, roadmap H3).
