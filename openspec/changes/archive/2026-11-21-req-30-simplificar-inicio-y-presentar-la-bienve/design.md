# Design

## Context

La motivación y el contrato observable están en `proposal.md` y en los tres delta specs. El repositorio ya contiene una aplicación estática con `index.html`, `css/styles.css`, `js/app.js`, `js/star-guide.js`, `js/progression.js` y `js/fola-catalog.js`, además de pruebas Node/Puppeteer y assets versionados. El diseño debe modificar ese recorrido existente, no crear un motor de navegación paralelo.

La arquitectura vigente separa la coordinación de vistas en `app.js`, la guía multimedia en `star-guide.js`, la resolución de clips en `fola-catalog.js` y el estado de tablas en `progression.js`. La guía ya dispone de cancelación y fallback; el cambio debe completar la coordinación de bienvenida y no convertir la reproducción en una condición de navegación.

## Goals / Non-Goals

**Goals:**

- Hacer explícito un estado inicial de portada simplificada y un estado de bienvenida con transición idempotente a niveles.
- Mantener texto visible desde el gesto de Jugar y seleccionar el clip Fola correcto sin pedir audio antes de una interacción.
- Centralizar la cancelación de audio y la finalización de bienvenida para que continuar, `ended`, `error` y `play()` rechazado converjan en una sola transición.
- Conservar las reglas actuales de disponibilidad, bloqueo, persistencia, tablas 1–10 y comienzo de partida.
- Cubrir la secuencia real en Chromium mediante el ejecutor ya configurado y conservar pruebas unitarias de la guía y del selector de clips.
- Mantener la invitación visual accesible mediante CSS, con `prefers-reduced-motion` y sin depender de la animación para comunicar la acción.

**Non-Goals:**

- No cambiar el modelo matemático, la ronda, el dominio, la persistencia ni la selección de preguntas.
- No descargar, regenerar ni añadir locuciones; se usan los clips y SVG existentes.
- No añadir Playwright, otro framework, backend, API, analítica, datos personales, TTS o pantalla permanente adicional.
- No exigir validación física con un dispositivo o un niño para cerrar la prueba automatizable del navegador; la observación presencial queda como seguimiento posterior.

## Decisions

### 1. Estados de navegación explícitos en el coordinador existente

Se distinguirán al menos `inicio`, `bienvenida` y `niveles` dentro del flujo ya coordinado por `app.js`. Al cargar, `inicio` renderiza solo marca/estrella/Jugar. La transición de `Jugar` a `bienvenida` actualiza texto antes de intentar audio; `mostrarNiveles()` será una operación idempotente que marca el flujo como avanzado, cancela la voz y revela la selección una sola vez.

Alternativa descartada: usar temporizadores ciegos para decidir cuándo mostrar niveles. Un temporizador no representa `ended`, rechazo de `play()` ni el avance voluntario y reproduce la espera observada.

### 2. Una única finalización de bienvenida para todos los caminos

La bienvenida se resolverá por el primer evento entre: acción explícita de Continuar, final normal del clip, error de carga/reproducción, o ausencia/silencio que impida audio. La función de finalización debe ser idempotente y cancelar el recurso activo antes de cambiar de vista. Los callbacks tardíos del clip no podrán volver a navegar ni reabrir la selección.

Alternativa descartada: dejar que cada listener navegue por separado. Eso permite duplicar transiciones cuando el niño pulsa Continuar cerca de `ended`.

### 3. El gesto Jugar habilita audio, pero no condiciona la UI

El handler de Jugar llamará al coordinador de voz después de pintar el saludo. El `play()` se tratará como promesa opcional: un rechazo se convierte en fallback inmediato y no en excepción de navegación. El estado textual se actualiza incluso con sonido deshabilitado, y la preferencia local existente sigue siendo la autoridad para no reproducir.

Alternativa descartada: esperar a que la promesa de audio resuelva antes de mostrar texto o niveles. Contradice la autonomía y hace que un navegador sin reproducción bloquee el juego.

### 4. Niveles conservan su contrato actual y solo cambia su momento de visibilidad

Los listeners de tablas y la consulta de disponibilidad de `progression.js` seguirán siendo la única fuente para iniciar partidas y marcar bloqueos. El cambio solo difiere el render de la cuadrícula hasta la finalización de bienvenida; no duplicará la lógica de selección ni creará niveles adicionales.

### 5. Animación CSS reducida como mejora de invitación

La invitación de Jugar se implementará con una regla CSS breve y sutil, y una media query `prefers-reduced-motion: reduce` que elimina o reduce la animación. El foco, el tamaño táctil y el texto del botón funcionan sin animación.

Alternativa descartada: animar todo el contenedor o usar JavaScript para el pulso. Aumenta el acoplamiento, puede distraer y hace más difícil respetar la preferencia del sistema.

### 6. Evidencia con el ejecutor declarado, sin dependencia nueva

Se ampliarán los checks existentes de `tests/e2e-browser.test.js` y/o un archivo E2E de alcance equivalente, reutilizando Chromium disponible y los helpers actuales. La cobertura debe observar: ausencia de la cuadrícula al cargar, texto inmediato tras Jugar, solicitud de clip después del gesto, avance antes de `ended`, ausencia de audio y `prefers-reduced-motion` en al menos un viewport móvil y uno de escritorio. No se ejecutan pruebas durante Propose.

## Risks / Trade-offs

- [Riesgo] Un clip Fola preparado puede no estar presente en el entorno local → [Mitigación] conservar el saludo y llamar a la misma finalización no bloqueante ante `error`, `play()` rechazado o ruta ausente.
- [Riesgo] `ended` y Continuar ocurren casi simultáneamente → [Mitigación] token/estado de bienvenida y finalizador idempotente que invalida callbacks viejos.
- [Riesgo] El código existente puede asumir que Jugar abre Aprende directamente → [Mitigación] actualizar consumidores y pruebas de navegación para pasar por bienvenida sin alterar la transición posterior a Aprende/partida.
- [Riesgo] Tests anteriores esperan la cuadrícula o Aprender inmediatamente → [Mitigación] migrar esas expectativas dentro del mismo Change y retirar solo assertions/rutas demostradas obsoletas; repetir la suite relevante después del retiro en Apply/Verify.
- [Riesgo] La portada podría quedar visualmente vacía en un viewport pequeño o con fuentes ausentes → [Mitigación] validar identidad, foco visible, controles táctiles y ausencia de overflow en Chromium con fallback de fuente.
- [Riesgo] La especificación histórica/configuración contiene límites antiguos de niveles → [Mitigación] seguir las capacidades canónicas actuales y el contrato v1.2 de tablas 1–10; no reabrir ni reducir el alcance matemático en este Change.

## Migration Plan

1. Implementar el estado de bienvenida y la operación de finalización única en los módulos actuales, manteniendo la API pública de progreso y guía salvo extensiones necesarias para la navegación.
2. Ajustar el markup/CSS de Inicio, ocultar la cuadrícula solo en el estado inicial y añadir el control Continuar accesible durante la bienvenida.
3. Migrar las expectativas de las pruebas de navegación y añadir los escenarios de audio activo, avance temprano, ausencia de audio, responsive y movimiento reducido.
4. Ejecutar la suite declarada y los checks de navegador en Apply/Verify; inspeccionar evidencia observable y repetir después de retirar cualquier ruta duplicada.

Rollback: revertir el candidato del Change restaura la navegación anterior; no hay migración de datos ni cambios de esquema porque el estado local de progreso y sonido no cambia.

## Open Questions

Ninguna que cambie el contrato o el enfoque. El nombre exacto del clip de primera visita/regreso y las convenciones de selectors deben resolverse usando el catálogo y markup existentes durante Apply, sin alterar los escenarios aprobados.
