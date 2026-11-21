# Tasks

## 1. Inventario y política de celebración

- [x] 1.1 Inventariar en `js/app.js` y `js/star-guide.js` todos los callers de `speakInstruction`, `playEffect`, cancelación y actualización de estado para acierto, bienvenida, Aprende, pista, hitos y cierre; verificar que el inventario cubre los escenarios de `star-guide-voice-text` y no altera la evaluación del primer intento (Request #33, RF-02/RF-08).
- [x] 1.2 Implementar la política de eventos del design: acierto ordinario = feedback textual/visual + `assets/audio/acierto.wav` sin felicitación hablada repetitiva; voz conservada solo para contenido o hitos valiosos; verificar con una prueba unitaria determinista de solicitudes y orden de audio.

## 2. Coordinación de audio y feedback accesible

- [x] 2.1 Ajustar la coordinación en `js/star-guide.js` para cancelar narraciones obsoletas, evitar solapamiento voz/efecto y tratar fallos de `play()` como no bloqueantes; verificar con mocks que callbacks tardíos no reaniman una narración cancelada.
- [x] 2.2 Ajustar el flujo de respuesta correcta en `js/app.js` para mostrar feedback textual inmediato, activar el estado/animación breve de la estrella y revelar `#btn-juego-continue` sin esperar audio; verificar que estrellas, primer intento y navegación siguen intactos.
- [x] 2.3 Actualizar `css/styles.css` para que la celebración ordinaria no dependa solo del color y respete `prefers-reduced-motion: reduce`; verificar mediante inspección de DOM/estilos que texto/estado semántico y Continuar permanecen disponibles con movimiento reducido.

## 3. Pruebas unitarias y de solicitudes

- [x] 3.1 Añadir o actualizar pruebas unitarias de guía/celebración para aciertos ordinarios, voz reservada, silencio persistido, cancelación y fallos de audio; verificar `acierto.wav` por acierto y ausencia de la misma felicitación hablada repetitiva.
- [x] 3.2 Mantener pruebas del motor para cuatro preguntas, alternativas, primer intento, reintentos, estrellas y cierre; verificar que el cambio de celebración no modifica las invariantes matemáticas ni la progresión local.

## 4. Verificación E2E en navegador

- [x] 4.1 Extender el check E2E configurado para servir la aplicación y observar solicitudes de audio Fola/WAV durante varios aciertos; verificar número y orden esperados, ausencia de narraciones solapadas y continuidad rápida mediante Chromium configurado.
- [x] 4.2 Verificar en E2E el modo silenciado durante aciertos y navegación, manteniendo feedback visual/textual y acceso a Continuar; verificar también `prefers-reduced-motion` y ausencia de overflow en los viewports declarados.
- [x] 4.3 Ejecutar con el ejecutor configurado `npm run test:unit`, `npm run test:e2e` y `npm run test`; registrar comandos, exit codes y observaciones reales, sin declarar éxito antes de obtener evidencia.

## 5. Retiro seguro y trazabilidad

- [x] 5.1 Retirar únicamente la ruta/caller de felicitación hablada ordinaria que quede obsoleta, preservar las rutas de bienvenida, explicación, pista, hito y cierre, y repetir las pruebas afectadas después del retiro.
- [x] 5.2 Actualizar `docs/TRACEABILITY.md` y los artefactos del change con la evidencia real de Request #33, RF-02/RF-08, RNF-02/RNF-07 y escenarios de audio, silencio, movimiento reducido y continuidad rápida; verificar que no se afirma despliegue, Verify ni validación humana no realizada.

## Evidencia de Apply

- `npm run test:unit` — exit code 0; 30 tests passed.
- `npm run test:e2e` — exit code 0; 15 tests passed.
- `npm run test` — exit code 0; 55 tests passed, 33 skipped preexistentes.
- El retiro se limita al caller `guide.speakInstruction(... event: 'acierto')` de `js/app.js`; permanecen bienvenida, Aprende, consignas, alternativas, pistas y cierre. La evidencia no certifica Verify, revisión independiente, validación humana, publicación ni despliegue.
- Inventario de callers: bienvenida (`bienvenida`/`bienvenidaRegreso`), Aprende (`aprende`), consignas y alternativas (`pregunta`/`preguntaResultado`/`inversa`/`operacion`), pista (`pistaPasoPaso`), contexto de grupos (`mostrarGrupos`), reintento (`ayudaReintentar`) y cierre (`finRonda`) conservan narración; acierto ordinario conserva `playEffect('acierto')` + estado/texto y ya no llama `speakInstruction`.
