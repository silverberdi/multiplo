# Proposal

## Why

El MVP necesita que un niño de seis años entienda el significado de una multiplicación antes de responder preguntas. La primera actividad de cada ronda debe convertir `a × b` en grupos visibles de `b` manzanas y una suma repetida, con una explicación breve que conecte los objetos, la suma y el producto.

Este cambio corresponde al issue GitHub #3 ([MVP-03]) y desbloquea el hito H2 del roadmap, dependiendo de la base de navegación del issue #1. Atiende RF-03 y RNF-05, y aplica D-002, D-003, D-008, D-016 y D-018.

## What Changes

- Añadir la actividad Aprende como una única demostración no evaluable al inicio de cada ronda.
- Representar siempre `a × b` como exactamente `a` grupos de `b` manzanas, junto con `b+b+...+b=producto` y `a×b=producto`.
- Seleccionar demostraciones con `a` entre 2 y 5 y `b` entre 1 y 5, permitiendo variar `b` entre rondas sin romper la correspondencia matemática.
- Mostrar una entrada visual ligera y no distractora, con botón Continuar sin temporizador ni restricción, que lleva a la primera pregunta sin modificar estrellas.
- Narrar la demostración con la estrella en estado `hablando.svg`, manteniendo texto visible y el fallback de voz definido por la capacidad existente de guía.
- Reutilizar `assets/objects/manzana.svg` para todas las manzanas y `assets/mascot/hablando.svg` para la narración, sin introducir una biblioteca gráfica pesada ni recursos externos.
- Cubrir con pruebas la generación de factores, la correspondencia grupo/suma/producto, la singularidad de la demostración por ronda, la navegación y la degradación de voz.

## Capabilities

### New Capabilities

- `visual-group-multiplication-learning`: Demostración visual de grupos iguales, suma repetida y multiplicación al comenzar una ronda.

### Modified Capabilities

- `star-guide-voice-text`: La guía existente amplía su contrato para narrar la demostración de Aprende con el recurso `hablando.svg`, texto equivalente y fallback no bloqueante.

## Impact

- Afectará la lógica local de ronda y el shell base ya existente: el cambio debe reemplazar la demo Aprende estática actualmente embebida en `index.html`, su contenido accesible fijo y la llamada estática a `GUIDE_SCRIPT.demostracion` en `js/app.js`; no debe añadirse una segunda demo junto a la existente.
- Consumirá los SVG versionados `assets/objects/manzana.svg` y `assets/mascot/hablando.svg`, respetando `docs/ASSETS.md`.
- Requiere retirar o actualizar las aserciones heredadas que fijan `3×2` y las frases estáticas, usando un selector determinista de la demo para comprobar que el DOM, el texto visible y la voz corresponden al mismo par de factores; no añade backend, cuentas, persistencia nueva, analítica, IA ni dependencias pesadas.
- No cambia el contrato de cuatro preguntas evaluables, estrellas por primer intento, desbloqueo 3/4, niveles 2–5 ni las capacidades generales de PWA.
