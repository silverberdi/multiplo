# Proposal

## Why

El MVP ya define una demostración de grupos, pero todavía necesita convertir esa comprensión en una ronda breve de cuatro preguntas evaluables que un niño de seis años pueda terminar sin miedo a equivocarse. Este cambio entrega el motor que presenta las modalidades obligatorias, genera alternativas matemáticamente válidas, conserva la evaluación del primer intento y permite pistas y reintentos ilimitados sin sanción.

Corresponde al issue GitHub #4 ([MVP-04]), es de prioridad Alta y depende de los issues #1 y #3. Atiende RF-04 y RF-05, RNF-01, RNF-02, RNF-05 y RNF-07; aplica las decisiones D-009, D-010 y D-019, además de los contratos del MVP y del modelo de aprendizaje.

## What Changes

- Añadir un motor de ronda con cuatro preguntas evaluables después de la única demostración Aprende, en el orden obligatorio: contar grupos para la pregunta 2, contar grupos para la pregunta 3, resolver `a×b` sin objetos visibles por defecto con pista en la pregunta 4 y elegir entre tres multiplicaciones en la pregunta 5.
- Generar factores para los cuatro niveles del MVP: Nivel 1 → `a=2`, Nivel 2 → `a=3`, Nivel 3 → `a=4` y Nivel 4 → `a=5`; en todos los casos `b` estará entre 1 y 5 inclusive y se respetará `a×b = a grupos de b`. Esto define 5 parejas por nivel y 20 parejas evaluables en total.
- Presentar exactamente tres alternativas distintas por pregunta, con una correcta y dos distractores válidos; en la modalidad 4 son tres resultados numéricos distintos, y en la modalidad 5 son tres operaciones con el mismo primer factor y segundos factores distintos, de modo que solo una produce el total objetivo.
- Evitar repetir operaciones dentro de una ronda cuando sea posible, variar la operación en rondas posteriores y priorizar operaciones falladas en selecciones futuras sin añadir datos personales ni sincronización.
- Registrar para evaluación únicamente si la primera respuesta fue correcta; mantener la pregunta como no acertada al primer intento después de un fallo, aunque el niño pueda reintentar sin límite hasta acertar.
- Mostrar feedback pedagógico, estados de la estrella y pistas visuales sin castigo; las pistas de las modalidades 4 y 5 representarán `a` grupos de `b` objetos sin cambiar la operación objetivo, el total ni las alternativas.
- Integrar los sonidos versionados `intento.wav` y `acierto.wav`, y mantener texto/voz con fallback no bloqueante mediante la guía existente.
- Mantener el cierre explícito de la ronda antes de cualquier cambio de nivel: completar una pregunta no avanza automáticamente de nivel.
- Añadir pruebas del generador, alternativas, orientación matemática, primer intento, pistas, reintentos, voz/fallback, recursos y flujo responsive; no declarar validación con un niño ni despliegue como parte de este Change.

## Capabilities

### New Capabilities

- `question-round-engine`: Motor local de cuatro preguntas evaluables con modalidades, factores, alternativas, pistas, reintentos, feedback y registro inmutable del primer intento.

### Modified Capabilities

- `star-guide-voice-text`: La guía existente amplía sus requisitos para asociar feedback de error/acierto y estados `pensando`/`celebrando` con el motor, usando los sonidos `intento.wav` y `acierto.wav` sin bloquear el flujo ni romper el fallback textual.

## Impact

- Afectará el estado local de ronda y la vista Juego ya preparada por los issues #1–#3; el motor debe reemplazar cualquier contenido de pregunta estático o duplicado, no añadir una ruta paralela.
- Consumirá `assets/objects/manzana.svg`, `assets/mascot/pensando.svg`, `assets/mascot/celebrando.svg`, `assets/audio/intento.wav` y `assets/audio/acierto.wav`, además de la guía de voz/texto existente.
- Requiere pruebas deterministas para fijar factores y operaciones, incluida la comprobación de que la evaluación de la modalidad 5 se hace por producto y no por la posición de la opción.
- No añade backend, cuentas, base de datos, analítica, IA, datos personales, nuevas tablas, niveles fuera de los cuatro niveles 1–4 (tablas `a=2..5`), alternativas adicionales ni cambio automático de nivel.
- En la vista Fin solo entregará el resumen inmutable de 0 a 4 aciertos de primer intento y retirará cualquier texto o markup estático de recompensa; el renderizado de estrellas, animaciones y textos de recompensa queda reservado al Change #6 (MVP-06).
- La selección de prioridad de operaciones falladas se limitará al progreso local ya previsto por el MVP; si el estado de aprendizaje o persistencia no está disponible en los cambios predecesores, el implementador deberá conservar el contrato mediante una interfaz local pequeña y documentar la dependencia, sin inventar almacenamiento remoto.
- No hay migración durable ni API pública prevista. Cualquier markup, guion, handler o aserción heredada que represente una pregunta estática y quede sustituida deberá retirarse dentro del mismo Change, conservando los contratos de Aprende, guía y responsive que siguen vigentes.
