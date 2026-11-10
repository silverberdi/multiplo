# Design

## Context

El shell actual ya contiene las vistas aprobadas y la guía de estrella, y `js/app.js` mantiene una ronda con factores de Aprende, estrellas y handlers de Juego. Sin embargo, el Juego todavía usa markup fijo en `index.html` y compara la respuesta literal `6`; no existe un modelo de cuatro preguntas, selección de operaciones ni registro de primer intento. `js/aprende.js` ya es la fuente de la convención de grupos, `js/star-guide.js` ya abstrae voz, silencio, estados y efectos, y los tests Node/Puppeteer existentes cubren la base, Aprende y la guía. Véase `proposal.md` para la motivación y las specs delta para el contrato observable.

La implementación debe permanecer en HTML/CSS/JS estático, respetar los issues previos #1–#3, conservar la única vista Juego y no introducir backend, framework, almacenamiento remoto ni una segunda ruta de preguntas.

## Goals / Non-Goals

**Goals:**

- Modelar una ronda de cuatro preguntas como datos derivados de un nivel y de una selección reproducible de operaciones.
- Hacer que grupos, productos, alternativas, pista y evaluación dependan de la misma operación matemática, evitando respuestas hardcodeadas.
- Integrar la transición pregunta → feedback/reintento → siguiente pregunta → cierre de ronda con primer intento inmutable.
- Mantener el texto visible, la síntesis opcional y los efectos originales como capacidades no bloqueantes.
- Dejar selectores y puntos de inyección deterministas para probar factores, orden, alternativas, primer intento, pistas y navegación.
- Retirar el contenido de pregunta estático y sus handlers sustituidos, sin conservar consumidores duplicados.

**Non-Goals:**

- No implementar aquí el desbloqueo/persistencia completa de niveles del issue #5 ni la pantalla de recompensas del issue #6. El motor solo expondrá a Fin el resumen inmutable de 0 a 4 aciertos de primer intento y retirará el texto/markup estático de recompensa; el renderizado de estrellas, animaciones y textos de recompensa queda estrictamente reservado al Change #6 (MVP-06).
- No cambiar el contrato de Aprende, la orientación `a×b = a grupos de b`, las cuatro vistas, la guía general ni la PWA.
- No añadir un motor adaptativo inteligente, aleatoriedad no reproducible, cuentas, telemetría, base de datos, API, audio de voz pregrabado ni dependencias nuevas.
- No reanudar una ronda interrumpida a mitad: la persistencia de dificultades, si se usa, será mínima y local, mientras la sesión activa permanece en memoria.

## Decisions

### Modelo local único para la ronda

Se añadirá un módulo local de dominio (o una separación equivalente dentro del JS existente) que produzca una estructura de ronda con nivel, preguntas, operaciones, alternativas, estado de intento y resultado. El MVP tendrá exactamente cuatro niveles numerados del 1 al 4: Nivel 1 usa `a=2`, Nivel 2 `a=3`, Nivel 3 `a=4` y Nivel 4 `a=5`; cada nivel admite `b=1..5`, para 5 parejas por nivel y 20 parejas evaluables en total. Cada pregunta conservará `a`, `b`, producto, modalidad y si tiene objetos visibles; el render no calculará un resultado independiente. La pregunta 2 y 3 derivarán grupos de la misma utilidad matemática de Aprende; la 4 usará la misma operación sin grupos inicialmente; la 5 derivará tres operaciones de la tabla actual y evaluará por producto.

Alternativa descartada: ampliar `handleOptionClick` con condicionales sobre el texto o sobre el valor literal de cada botón. Es el estado actual, pero permite que la interfaz, la validación y la pista se desincronicen y no escala a cuatro preguntas.

### Dominio pequeño y selección determinista

El dominio será la matriz de cuatro niveles numerados 1–4, con `a` fijo según la correspondencia Nivel 1→2, Nivel 2→3, Nivel 3→4 y Nivel 4→5, y `b` 1–5. Un selector recibirá una fuente de aleatoriedad/orden inyectable para pruebas, excluirá parejas ya usadas mientras existan candidatas, barajará la posición de la correcta y aceptará un historial local de errores para priorizarlo suavemente en la siguiente ronda. El historial no guardará identidad ni texto libre y deberá tolerar `localStorage` ausente, corrupto o restringido.

Alternativa descartada: una política adaptativa basada en telemetría o en una puntuación de dificultad externa. Contradiría el MVP sin servidor y no es necesaria para cubrir las veinte operaciones posibles.

### Alternativas generadas con garantías explícitas

Para preguntas de resultado (2, 3 y 4), se escogerán tres resultados numéricos distintos: el producto correcto y dos productos distractores matemáticamente válidos, ambos distintos del objetivo y entre sí. La pregunta 4 mostrará esos tres productos, no operaciones. Para la modalidad 5, las tres opciones serán operaciones con el primer factor del nivel y segundos factores `b` distintos; exactamente una producirá el total objetivo. Se resolverá por `a*b`, no por índice ni por texto.

La generación deberá fallar de forma explícita en una condición imposible de satisfacer, y el flujo de UI mostrará texto seguro sin dejar botones ambiguos; no se ocultará un duplicado para aparentar tres respuestas.

Alternativa descartada: elegir dos números cercanos sin validar productos. Puede producir duplicados, dos correctas o distractores que rompan la tabla del nivel.

### Máquina de estados de interacción

La ronda conservará el índice de pregunta y una bandera de primer intento por pregunta. La primera selección fija `firstAttemptCorrect` una sola vez; un error activa feedback, sonido `intento.wav`, estado `pensando` y pista contextual, pero no cambia el índice. Un acierto activa `acierto.wav` y `celebrando`; solo una acción explícita de continuar/finalizar avanza. Al cerrar la cuarta pregunta, el motor calculará una sola vez el resumen inmutable de 0–4 primeros aciertos y lo entregará a la vista Fin, que únicamente expondrá ese resumen y retirará el texto/markup estático «Ganaste tres estrellas». No renderizará estrellas, animaciones ni textos de recompensa en este Change; esos elementos quedan reservados al Change #6 (MVP-06). La selección de nivel queda fuera de la transición automática; el desbloqueo y la recompensa completa permanecen reservados a los Changes posteriores autorizados.

Alternativa descartada: avanzar inmediatamente al pulsar una respuesta correcta. Reduce la oportunidad de que el niño lea el feedback y puede hacer que el reintento parezca una penalización; además mezcla el cierre de pregunta con el cambio de nivel.

### Renderizado accesible en la vista existente

`index.html` conservará una sola vista Juego, pero sus grupos de opciones, consigna, progreso, feedback y pista pasarán a contenedores/atributos semánticos que `app.js` pueda actualizar por pregunta. Los botones mostrarán números u operaciones grandes, tendrán nombres accesibles y no dependerán solo de color. La pregunta 4 renderizará el contenedor de grupos oculto hasta Pista; la pregunta 5 podrá mostrar la misma representación de `a` grupos de `b` objetos al pedir Pista, sin mutar el total objetivo ni sus tres operaciones; las preguntas visuales lo mostrarán como contenido de la actividad. La vista Fin recibirá y expondrá únicamente el resumen inmutable de 0, 1, 2, 3 o 4 aciertos de primer intento, retirando el contenido estático «Ganaste tres estrellas» y cualquier markup de recompensa. No renderizará estrellas, animaciones ni textos de recompensa en este Change; CSS reutilizará la cuadrícula existente con reflujo para hasta cinco grupos de cinco objetos y sin overflow horizontal.

Alternativa descartada: añadir una vista por modalidad. El UX aprobado especifica una misma pantalla Juego y el cambio aumentaría navegación, estados y superficie de responsive sin valor pedagógico.

### Guía y multimedia como adaptadores no bloqueantes

Se reutilizará `StarGuideCoordinator` para `speakInstruction`, `repeatLastInstruction`, `setState`, `playEffect` y `notifyUserGesture`. Los textos de pregunta, pista, error y acierto serán breves y visibles; al silenciar o fallar voz/WAV, la UI conservará feedback y navegación. La actualización de mascota será genérica para el estado actual y los recursos se resolverán desde `MASCOT_ASSETS`/`AUDIO_ASSETS`, incluyendo `pensando.svg`, `celebrando.svg`, `intento.wav` y `acierto.wav`.

Alternativa descartada: introducir un reproductor o proveedor externo. No aporta una capacidad requerida y rompería el fallback estático del MVP.

### Censo de consumidores, retiro y compatibilidad

El implementador deberá localizar y migrar los consumidores actuales: `currentRound`/`startNewRound`, `navigateTo('juego')`, `resetJuegoState`, `handleOptionClick`, `handleHintClick`, `btn-juego-next`, el markup fijo de `index.html`, estilos de `.btn-option` y las aserciones de `tests/star-guide-e2e.test.js`/`tests/e2e-browser.test.js`. El contenido estático que fija `6`, las opciones `4/6/8` o «Ver fin de ronda» como avance directo se retirará o se convertirá en contenedor dinámico; no deben quedar dos fuentes de verdad. Después del retiro se ejecutará la suite completa y el E2E real de una ronda.

No hay cambio de API pública ni migración durable. El rollback de código consiste en revertir el módulo/render del motor y sus consumidores dentro del mismo candidato; no se deben borrar artefactos OpenSpec, historial de rondas ni migraciones de otros Changes.

## Risks / Trade-offs

- [Risk] El dominio pequeño puede no ofrecer dos distractores válidos bajo una restricción concreta → Mitigación: generar desde el conjunto completo permitido, validar cardinalidad antes de renderizar y probar exhaustivamente las 20 parejas totales (5 por nivel); reportar una condición imposible en vez de duplicar opciones.
- [Risk] La prioridad de falladas podría repetir siempre las mismas operaciones → Mitigación: aplicar prioridad limitada con exclusión de usadas y conservar variedad/orden variable en cada ronda.
- [Risk] El markup heredado y tests previos esperan una sola pregunta fija → Mitigación: migrar consumidores al selector dinámico, retirar aserciones obsoletas y ejecutar E2E después del retiro, manteniendo los contratos de Aprende y guía.
- [Risk] Una voz o efecto bloqueado puede dejar la mascota en estado incorrecto → Mitigación: actualizar texto y estado antes de solicitar multimedia, absorber errores de reproducción y probar sin `speechSynthesis` y con audio silenciado.
- [Risk] Cinco grupos de cinco objetos desbordan en móvil → Mitigación: composición flexible, reflujo vertical, tamaños táctiles y pruebas en los tres anchos definidos por QA.
- [Risk] El primer intento se registra dos veces por eventos repetidos → Mitigación: bandera inmutable por pregunta, deshabilitar solo la transición ya procesada y pruebas de doble clic/reintento.

## Migration Plan

1. Crear el modelo/selector local y pruebas unitarias de factores, productos, alternativas, modalidades, historial y primer intento sin tocar aún la UI.
2. Sustituir el estado fijo de `app.js` y el markup de Juego por renderizado desde el modelo; conectar la vista Aprende existente con la primera pregunta.
3. Conectar feedback, pista, sonidos y guía; verificar ausencia de voz, silencio, fallo de WAV y repetición de instrucción.
4. Retirar handlers, textos y opciones estáticos sustituidos; actualizar los tests que afirmaban el contrato anterior.
5. Ejecutar tests unitarios y E2E reales de una ronda completa con respuestas correctas, fallos/reintentos y modalidad 5; después validar manualmente pregunta, pista, acierto, cierre y responsive.

El cambio no requiere migración de datos. Si el estado local de historial no puede leerse o escribirse, el motor funciona con selección base sin bloquear la ronda. El rollback debe conservar la interfaz de guía y Aprende, y nunca reintroducir simultáneamente la ruta estática y la dinámica.

## Open Questions

Ninguna pregunta abierta cambia el contrato, la arquitectura o la descomposición de tareas. La ubicación exacta del módulo del motor queda para el implementador según la organización HTML/CSS/JS existente, siempre que mantenga la fuente única, los selectores deterministas y el retiro indicado.
