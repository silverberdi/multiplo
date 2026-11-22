## Context

Ver [proposal.md](proposal.md) y la nueva especificación `learning-history-local-metrics`. `main` ya contiene Múltiplo v1.2: `app.js` inicia/cierra rondas, `question-engine.js` conserva el resumen inmutable y distingue `actual`/`repaso`, y `progression.js` mantiene el progreso de juego. El contexto de `openspec/config.yaml` y algunos documentos aún conservan afirmaciones anteriores de preimplementación; este diseño se basa en el código actual y en el Issue #42.

Restricciones: el juego ya funciona sin backend; `multiplo_progression_v1` contiene las reglas de progreso y no se modifica; los resúmenes disponibles son la fuente de verdad de preguntas/rondas; no se añade interfaz de historial, transmisión, identificadores de niño/dispositivo ni dependencias runtime.

## Goals / Non-Goals

**Goals:**
- Registrar una vez los eventos educativos concluidos y generar métricas repetibles a partir de datos locales.
- Separar la nueva persistencia del estado de desbloqueo y mantener el juego jugable cuando el almacenamiento falle.
- Mantener un tamaño constante para la estructura de agregados y una retención clara del detalle.

**Non-Goals:**
- Enviar métricas, crear cola, API, Worker/D1, analítica de tráfico o informes visibles.
- Cambiar scoring, dominio, estrellas, selección de preguntas, pantallas, navegación o persistencia de `progression.js`.
- Backfill de partidas anteriores, sincronización entre dispositivos, identidad, perfil infantil o medición de usuarios únicos.

## Decisions

### 1. Observar los eventos confirmados del flujo existente

Integrar la captura donde `app.js` inicia una ronda, resuelve una pregunta, avanza la ronda y recibe el cierre de `advanceRound()`/`closeRoundProgression()`. Tomar `firstAttemptCorrect`, `attemptsCount`, pista, `a`, `b`, `source` y el resumen de dominio del motor/progresión; no reconstruirlos leyendo el DOM ni volver a evaluar respuestas. Guardar cada pregunta cuando queda resuelta y marcar la ronda completa únicamente cuando el motor informa `isFinished`.

**Alternativa considerada:** derivar métricas desde la pantalla Fin o desde las estrellas renderizadas. Se descarta porque el render puede repetirse y no contiene todos los datos de pregunta, repaso y reintentos; produciría duplicados o métricas incorrectas.

### 2. Mantener un registro local independiente

Crear una clave `multiplo_learning_history_v1` con versión propia, sesión activa opcional, detalle limitado y agregados. No leer ni reescribir `multiplo_progression_v1` para transformar respuestas previas en eventos; solo consultar el resultado de dominio que ya devuelve la lógica actual al concluir una ronda. No usar identificadores persistentes. Para impedir el doble cierre dentro de una ejecución, usar una marca en memoria asociada a la ronda activa; persistir un único marcador de sesión activa/interrumpida, no un identificador global de jugador.

**Alternativa considerada:** añadir historial detallado al objeto de progreso v1.2. Se descarta para evitar que compactación, cuotas, migraciones o errores del historial afecten los desbloqueos.

### 3. Definir límites locales explícitos y conservar agregados acotados

El límite propio del historial será **256 KiB serializados o 1.200 registros de detalle**, lo que ocurra primero. La retención se aplica por fecha de evento, no por fecha de inicio de sesión: cada pregunta resuelta vence a los 90 días de `occurredAtUtc`; los datos de apertura y duración acumulada de una sesión/ronda vencen a los 90 días de su fecha de inicio; los datos de cierre y resumen de una ronda vencen a los 90 días de su evento de cierre. Por eso una sesión que comenzó hace más de 90 días todavía puede conservar preguntas o rondas recientes, y la compactación no puede descartar todo el contenedor por su fecha de inicio.

Si una sesión sigue activa después de vencer parte de su detalle, conservar solo un sobre operativo acotado para la sesión y su ronda actual: estado activo, tabla/ronda necesaria para continuar y los índices ya agregados necesarios para evitar duplicados. Eliminar de ese sobre los detalles educativos vencidos y las fechas/duraciones antiguas de la sesión/ronda. Los buckets diarios UTC se conservarán por 90 días; al vencer, sus contadores se incorporarán a totales acumulados fijos por tabla y par dirigido (`a×b`, máximo 100 pares), y luego se eliminarán los buckets antiguos. Así la memoria de trabajo y el almacenamiento no crecen con el uso; los datos de calendario quedan disponibles para agregados recientes, mientras que los totales de vida no conservan fechas.

Los contadores se agregan al resolver/cerrar el evento, antes de que expire su detalle; la compactación de detalle no vuelve a sumarlos. Para una pregunta de una ronda aún activa, conservar un marcador de índice acotado aunque se elimine su detalle, de modo que un callback repetido no duplique el agregado. Si la cuota o una escritura falla, mantener la partida y el progreso de reglas; continuar los cálculos en memoria durante la sesión si es posible y descartar solo el registro que no pueda persistirse. Nunca borrar ni resetear el progreso para liberar espacio.

**Alternativas consideradas:** guardar detalle indefinidamente (tamaño no acotado) o limitarse a una denylist de valores del JSON (no garantiza el límite). Se elige cota combinada de tamaño, número y edad, con agregados compactos de dimensión fija.

### 4. Separar tiempo monotónico de calendario UTC

Medir duración con `performance.now()` y acumular segmentos al cambiar de etapa, resolver pregunta, ocultarse la pestaña, cerrar sesión o abandonar. `visibilitychange` pausa/reanuda el segmento; no usar sondeo continuo. Capturar aparte `occurredAtUtc` al confirmar cada evento y asignar cada pregunta resuelta a la fecha UTC de resolución, y los contadores de inicio/cierre a la fecha de su propio evento. Si un mismo juego atraviesa medianoche, sus eventos quedan en sus días respectivos y no se duplica una pregunta/ronda. No calcular duración restando timestamps de pared.

**Alternativa considerada:** usar `Date.now()` como reloj de duración o registrar un evento por segundo. Se descarta por cambios del reloj y complejidad/actividad innecesaria en segundo plano.

### 5. Mantener los cálculos puros y no conectar red

El agregado recibe el historial local y devuelve contadores/deltas por día UTC, tabla real de la pregunta y opcionalmente par `a×b`, con separación actual/repaso. Las tasas se calculan con numeradores y denominadores explícitos; denominador cero produce `null`. Los agregados calendarios atribuyen inicios, resoluciones y cierres a sus respectivas fechas, por lo que la razón completadas/iniciadas puede superar 100% en una ventana corta cuando una ronda comenzó en una fecha anterior; no se limita artificialmente. No se añade `fetch`, cola, endpoint ni servicio de analítica.

**Alternativa considerada:** calcular métricas al vuelo desde la UI o llamar un endpoint futuro. Se descarta para evitar acoplar la lógica al DOM y porque el Issue #42 excluye conexión HTTP; la integración con los issues V3 posteriores queda como contrato de deltas, no como código de envío.

### 6. Delimitar el ciclo de sesión sin temporizadores de inactividad

La sesión empieza con la primera ronda real y continúa con Repetir/Siguiente. Un retorno explícito a Inicio cierra la sesión y, si deja una ronda incompleta, la marca abandonada. `pagehide`/recarga inesperada deja la marca activa para señalar interrupción en la próxima carga; no se inventa el momento de fin. No introducir timeout de inactividad ni sesión por carga de página. La retención no cierra automáticamente una sesión activa: al vencer sus eventos, la compactación reduce el registro al sobre operativo mínimo definido en la Decisión 3 y conserva los agregados por evento.

**Alternativa considerada:** cerrar una sesión después de un intervalo de inactividad. Se descarta porque el Issue #42 no define ese umbral y un timer añadiría comportamiento no solicitado.

### 7. Corregir solo el contexto operativo vigente

Actualizar `README.md`, `docs/INDEX.md`, `docs/OPENSPEC_HANDOFF.md`, `AGENTS.md` y `openspec/config.yaml` donde hoy afirman que el juego no está implementado, que el alcance activo es el MVP v1.0/tablas 2–5 o que el único backlog son los issues #1–#7. Reflejar el juego v1.2 ya implementado y el backlog V3 vigente; conservar los documentos y cambios archivados como historia. El contexto del #42 debe permitir únicamente historial local agregado, sin transmisión, y no debe generalizar esa autorización a los issues V3-02/03.

**Alternativa considerada:** dejar los textos falsos para evitar tocar documentación previa. Se descarta porque esos archivos son instrucciones activas para OpenSpec y agentes y contradicen el código desplegado, lo que puede invalidar la propuesta y Apply.

## Risks / Trade-offs

- **[El almacenamiento local puede estar bloqueado, lleno o ser eliminado por el navegador]** → captura tolerante, límite antes de serializar, compactación acotada y continuidad independiente del progreso.
- **[Las métricas del cliente pueden estar incompletas, modificadas o perderse]** → reportarlas solo como agregados locales observados, nunca como usuarios únicos ni evidencia educativa verificada; no afirmar persistencia cuando el navegador la niega.
- **[Rondas iniciadas y concluidas pueden caer en periodos distintos]** → atribuir cada contador a la fecha UTC de su evento y documentar que tasas calendarias no son tasas de cohorte y pueden exceder 100%.
- **[Cerrar el registro desde dos callbacks podría duplicar una ronda]** → una sola ruta de captura de cierre, marca en memoria y prueba de cierre/render repetido.

## Migration Plan

- No hay migración de base de datos ni sincronización. Crear la clave nueva al comenzar actividad; no convertir progreso v1.2 pasado en historial.
- Mantener lectura y escritura de `multiplo_progression_v1` sin cambios. Una versión anterior del juego ignorará la clave nueva; una reversión del frontend no requiere borrar datos ni toca el progreso.
- En la próxima escritura, compactar datos preexistentes por fecha de cada evento, incluso dentro de una sesión activa; conservar los agregados y solo el sobre operativo requerido. Las pruebas deben comprobar que progreso legado conserva exactamente sus niveles y dominio, y que la ausencia del historial no bloquea el juego.

## Open Questions

Ninguna. El alcance se fija en el Issue #42; los límites 256 KiB/1.200 detalles, retención diaria de 90 días y agregados fijos por par son elecciones técnicas acotadas de este diseño.
