# Tasks

## 1. Modelo de demostración y ronda

- [x] 1.1 Definir el modelo local de Aprende para validar `a` en 2–5 y `b` en 1–5, derivando grupos, suma repetida y producto desde el mismo par; verificar automáticamente todos los pares 2–5 × 1–5 y la convención `a×b = a grupos de b` (RF-03, RNF-05; escenarios de límites y variación).
- [x] 1.2 Integrar Aprende como el único estado inicial de cada ronda, antes de las cuatro preguntas, con transición explícita mediante Continuar y sin invocar evaluación ni modificar estrellas; verificar el flujo completo de una ronda y que la demostración no se repite (D-008; escenarios de una demostración y Continuar).

## 2. Renderizado visual y recursos

- [x] 2.1 Retirar del shell existente el markup estático de Aprende en `index.html` —grupos, suma, producto, instrucción y etiquetas `aria-label` fijas— y reemplazarlo por un contenedor/selector semántico para la demo generada; verificar que no queda una segunda demo estática y que el caso determinista `3×2` muestra exactamente tres grupos de dos, `2+2+2=6` y `3×2=6`.
- [x] 2.2 Añadir composición CSS responsive para hasta 5 grupos de 5 objetos, con entrada breve no distractora y soporte de `prefers-reduced-motion`; verificar Aprender en celular, tablet y computador sin desbordamiento horizontal ni pérdida de texto (RNF-01, RNF-07; escenario de movimiento reducido).
- [x] 2.3 Mostrar `assets/mascot/hablando.svg` durante la narración y comprobar que las rutas de `manzana.svg` y `hablando.svg` se cargan desde los assets versionados sin biblioteca gráfica pesada ni servicio externo (D-018; escenario de recursos reutilizados).

## 3. Narración y degradación

- [x] 3.1 Sustituir en `js/app.js` la llamada estática a `GUIDE_SCRIPT.demostracion` por una instrucción derivada del modelo/nivel actual, conectada a la guía existente para narrar grupos, suma y producto en español después del gesto permitido, cancelando locuciones anteriores y manteniendo la mascota hablando; verificar con un `b` distinto que texto visible y última instrucción de voz comunican las mismas cantidades (issue #2; escenario de narración).
- [x] 3.2 Implementar el fallback no bloqueante para ausencia, error o silencio de `speechSynthesis`, manteniendo Continuar disponible y el texto visible; verificar una ejecución completa sin voz y otra con voz silenciada (RNF-02; escenarios de guía y ausencia de voz).

## 4. Verificación de integración

- [x] 4.1 Actualizar o retirar las aserciones heredadas de `tests/star-guide-e2e.test.js` y `tests/star-guide.test.js` que esperan `Tres grupos de dos manzanas` o `Mira: tres grupos de dos`, usando el selector determinista de la demo; ejecutar la suite completa después del retiro y verificar generación matemática, factores, suma, recursos, texto/voz equivalente y transición Aprende → primera pregunta, incluyendo `3×2`, sin declarar pruebas de funcionalidades aún no implementadas (issue #3; Q-02 y escenarios de la spec).
- [x] 4.2 Realizar validación manual de los estados Aprende, Continuar, voz/fallback y responsive en un celular, una tablet y un computador, registrando navegador y cualquier hallazgo reproducible conforme a `docs/QUALITY_AND_VALIDATION.md` (Q-09, Q-10; sin datos personales).
