# Design

## Context

El change parte de las vistas responsive del issue #1 y añade la guía del issue #2. El producto es una web estática en español para un niño de seis años: el texto debe seguir siendo suficiente, `speechSynthesis` es opcional y los SVG/WAV ya están versionados. La motivación y los límites de producto están en `proposal.md`; el contrato observable está en `specs/star-guide-voice-text/spec.md`.

## Goals / Non-Goals

**Goals:**

- Mantener una única fuente de texto para que voz y pantalla estén sincronizadas.
- Encapsular en una pequeña coordinación local el estado de mascota, síntesis, repetición, cancelación y reproducción de efectos.
- Hacer que sonido, voz ausente, archivos faltantes y restricciones de autoplay degraden con elegancia.
- Persistir solo la preferencia local de sonido, sin cuentas, backend ni datos de identidad.
- Integrar los estados y controles en las vistas existentes, con etiquetas y objetivos táctiles claros.

**Non-Goals:**

- No crear locuciones pregrabadas, guía bilingüe, música, servicio de audio, reconocimiento de voz ni audio remoto.
- No implementar aquí generador de ejercicios, reglas matemáticas, puntuación, progreso, desbloqueo o una nueva pantalla.
- No exigir reproducción automática al cargar una página ni reanudación de voz tras cerrar la pestaña.

## Decisions

1. **Usar la API nativa `speechSynthesis` con fallback textual.** Es la solución aprobada para hosting estático y evita una dependencia externa. Se comprobará la existencia de la API y de una voz española utilizable; si no es posible, el texto sigue siendo el contrato. Una locución descargada o un proveedor externo ofrecería mayor uniformidad, pero contradice el MVP y añade peso y dependencia.

2. **Centralizar el ciclo de narración en un coordinador pequeño.** El coordinador conservará la última instrucción, cancelará la utterance anterior antes de narrar otra, marcará el estado `hablando` mientras corresponda y expondrá repetir/silenciar a la UI. Evita que cada vista cree colas independientes que puedan solaparse. La organización exacta de archivos queda abierta al implementador mientras no cambie el contrato.

3. **Tratar el sonido como una preferencia única.** `soundEnabled` se inicializa de forma segura, se persiste en `localStorage` y gobierna tanto síntesis como efectos. La lectura/escritura de almacenamiento se protegerá contra excepciones: si no está disponible, la sesión aún se puede jugar y el estado se mantiene en memoria.

4. **Reproducir efectos mediante los WAV existentes y de forma no bloqueante.** Cada evento dispara como máximo su efecto asociado; errores de carga, autoplay o reproducción se absorben. La voz tiene prioridad práctica sobre efectos largos y no se crean mezclas ni música. Alternativas como Web Audio para sintetizar sonidos nuevos no aportan valor y duplicarían recursos aprobados.

5. **Mapear estado visual a los SVG existentes.** `normal`, `hablando`, `celebrando` y `pensando` serán estados de presentación, no estados adicionales de aprendizaje. El texto y los iconos acompañarán el color para que una reacción no dependa de percepción cromática.

6. **Iniciar voz en un gesto que ya forma parte del flujo.** Jugar, Continuar, responder o repetir pueden habilitar la síntesis según la actividad. No se intentará saltar la política del navegador; si la llamada es rechazada, se conserva el texto y el juego sigue.

## Risks / Trade-offs

- **[Riesgo]** Las voces españolas, pronunciaciones y eventos de `speechSynthesis` varían por navegador. **→ Mitigación:** seleccionar una voz española cuando exista, mantener texto equivalente, cancelar antes de hablar y validar con navegadores representativos.
- **[Riesgo]** El autoplay o una reproducción WAV puede ser bloqueado. **→ Mitigación:** disparar tras gesto, capturar el fallo y no bloquear navegación ni respuestas.
- **[Riesgo]** Una instrucción nueva durante una utterance puede dejar callbacks tardíos. **→ Mitigación:** cancelar la anterior, invalidar su estado al cambiar actividad y aceptar solo el ciclo vigente para actualizar la mascota.
- **[Riesgo]** `localStorage` puede estar deshabilitado o contener un valor corrupto. **→ Mitigación:** usar el valor seguro habilitado por defecto, validar el booleano y continuar en memoria si la persistencia falla.
- **[Riesgo]** Demasiados efectos distraen o interfieren con la voz. **→ Mitigación:** sonidos cortos, uno por evento, sin música y respetando inmediatamente el silencio.

## Migration Plan

No hay migración de datos ni API. Durante la implementación se añadirán los controles y el coordinador a las vistas del issue #1, se conservará cualquier estructura base no relacionada y se usará una clave local versionable para la preferencia de sonido. Para revertir, se retira la integración de la guía y se mantienen las vistas base; no se requiere transformación remota.

## Open Questions

No quedan preguntas abiertas que cambien el contrato o el enfoque: la elección de organización concreta de JavaScript y la clave exacta de almacenamiento pueden resolverse durante la implementación sin alterar el comportamiento especificado.
