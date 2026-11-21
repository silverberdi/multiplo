# Design

## Context

Consulta `proposal.md` para la motivación y las especificaciones delta para el contrato observable. La arquitectura aprobada mantiene la lógica en los módulos locales de progresión, motor de preguntas y aplicación, con `localStorage`, HTML/CSS/JavaScript y assets versionados; no hay backend, cuentas ni sincronización. El contrato v1.2 distingue cuatro estrellas de ronda, dominio acumulado de tablas 1–10 y siete factores `b` distintos, pero el inventario actual de specs contiene requisitos históricos que este Change debe alinear sin reabrir decisiones de producto.

La solicitud incluye UI reproducible en navegador. En Apply/Verify, el ejecutor configurado deberá ejecutar los checks de navegador declarados con Chromium y dejar evidencia observable; la navegación, el viewport y la asincronía no se delegan a validación humana.

## Goals / Non-Goals

**Goals:**

- Mantener separados en el estado y en la interfaz el resultado de la ronda, el dominio pendiente y el desbloqueo, respetando la excepción aprobada de tabla 1 (`>=3/4` en una ronda) y aplicando el dominio acumulado solo a tablas 2–10.
- Hacer que el progreso explique requisitos cumplidos y faltantes con lenguaje breve en español.
- Garantizar que el cierre solo renderice acciones que existen y que la tabla 10 no apunte a una tabla 11.
- Hacer alcanzable la cobertura de factores distintos mediante selección dirigida, conservando primer intento, repaso y reintentos sin penalización.
- Conservar el desbloqueo en el navegador actual y recuperarlo tras recarga cuando la persistencia esté disponible.
- Probar el comportamiento en lógica y en navegador, incluyendo 4/4 con dominio pendiente, 3/4 sin siguiente tabla, cobertura de factores y persistencia.

**Non-Goals:**

- Implementar el cambio durante esta iteración de propuesta.
- Cambiar la convención `a×b = a grupos de b`, el máximo de cuatro estrellas, los umbrales aprobados o el papel del repaso.
- Añadir tablas posteriores a la 10, modos de juego, cuentas, backend, analítica, sincronización o un motor adaptativo complejo.
- Crear una nueva capa de estado, framework de UI o dependencia de automatización no presente.
- Sustituir la validación automatizable del navegador por una decisión humana ni declarar validación presencial con el niño.

## Decisions

### 1. Derivar el estado de cierre desde dos fuentes explícitas

El resultado de ronda conservará `stars`/aciertos iniciales de 0 a 4. La progresión calculará por separado el estado de dominio. Para tabla 1, el requisito de avance será una ronda con `>=3/4`; para tablas 2–10, serán dos de las últimas tres rondas calificadas y siete factores `b` distintos. El render del cierre recibirá ambos resultados y no inferirá «completada» a partir de `stars === 4`.

**Alternativa descartada:** usar 4/4 como sinónimo de desbloqueo. Contradice el dominio acumulado v1.2 y reproduce el defecto de Request #29.

### 2. Exponer un modelo de requisitos, no solo un booleano

La progresión producirá un resumen pequeño y serializable con el conteo actual/objetivo de cada requisito, estado cumplido/pendiente y la acción de avance permitida. La UI mostrará el resumen en el cierre y donde se consulta el progreso. Los textos serán aptos para un niño, sin presentar el dominio como certificación escolar.

**Alternativa descartada:** mostrar solo «bloqueado» o una barra agregada. Oculta si faltan rondas o factores y no permite explicar cómo avanzar.

### 3. Contrato explícito de evidencia para selección dirigida

`progression.js` expondrá para la tabla que se va a jugar un resumen de evidencia con `coveredFactors` y `pendingFactors` (los factores `b` válidos aún no cubiertos; tabla 1 también podrá exponerlos aunque no sean condición de desbloqueo). `startNewRound` pasará ese resumen a `createQuestionRound(level, { pendingFactors, coveredFactors, failedHistory, ... })`. El motor construirá el conjunto de factores elegibles excluyendo parejas ya usadas en la ronda cuando existan alternativas; dentro de ese conjunto priorizará primero `pendingFactors` y después fallos locales priorizables, con desempate variado. Si no quedan pendientes o hay menos candidatos que plazas, completará con factores válidos no repetidos. La aleatoriedad solo variará el orden y no podrá impedir que una secuencia de rondas cubra los factores disponibles.

**Alternativa descartada:** volver a sortear hasta que aparezcan siete factores o dejar que `selectRoundBValues` consulte solo `Math.random`. Puede repetir indefinidamente y no es evidencia determinista de que el requisito sea alcanzable.

### 4. Persistencia defensiva del resumen mínimo

Se reutilizará el estado local versionado existente. La migración conservará por identidad `multiplo_progression_v1` (1→tablas 1–2, 2→1–3, 3→1–4, 4→1–5), `multiplo_sound_enabled`, silencio y entradas válidas de `multiplo_failed_operations`; nunca convertirá respuestas antiguas en evidencia de dominio. Al cerrar una ronda se persistirán solo métricas ya autorizadas: niveles abiertos, rondas válidas recientes, factores cubiertos, errores priorizables y sonido. La escritura será idempotente; si falla, se mantendrá sesión jugable y se mostrará el aviso adulto previsto.

**Alternativa descartada:** introducir servidor o sincronización para garantizar desbloqueos. Contradice privacidad, arquitectura estática y alcance del MVP.

### 5. Evidencia en dos capas

Las pruebas unitarias cubrirán reglas de selección, primer intento, resumen de dominio y transiciones de desbloqueo. El check E2E configurado cubrirá el cierre visible, acciones condicionales, recarga y ausencia de tabla 11 en un navegador real. Se usarán los comandos declarados por `package.json`; no se inventará una dependencia Playwright si el repositorio no la declara. Si el check actual no puede observar el nuevo contrato, Apply deberá ampliarlo dentro de este Change y Verify deberá registrar el resultado.

## Risks / Trade-offs

- **[Riesgo]** La especificación existente puede contener nombres o límites históricos incompatibles con v1.2. → **Mitigación:** tratar los documentos v1.2 y este delta como autoridad, conservar el nombre exacto de la capacidad y actualizar la especificación canónica solo mediante el flujo OpenSpec posterior a implementación.
- **[Riesgo]** Priorizar factores pendientes podría reducir la repetición de errores recientes. → **Mitigación:** ordenar prioridades, no eliminar `multiplo_failed_operations`; mantener variedad y permitir repaso separado.
- **[Riesgo]** Un resumen demasiado técnico puede confundir al niño. → **Mitigación:** separar datos de dominio de copia breve; usar conteos concretos y acción «Repetir» sin lenguaje de fracaso.
- **[Riesgo]** `localStorage` corrupto o bloqueado puede impedir conservar el desbloqueo. → **Mitigación:** fallback de sesión ya aprobado, aviso no bloqueante y pruebas de corrupción/restricción; no prometer recuperación remota.
- **[Riesgo]** Una prueba E2E puede demostrar solo que se renderiza una pantalla. → **Mitigación:** exigir interacción completa, estado observable antes/después y recarga en el mismo contexto, con evidencia del ejecutor configurado.
- **[Riesgo]** La tabla 10 puede recibir una acción de avance por una condición genérica. → **Mitigación:** resolver la acción siguiente contra el catálogo 1–10 y probar explícitamente el cierre final.

## Migration Plan

1. En Apply, inspeccionar callers y escritores actuales de progresión, motor, cierre y almacenamiento, y mapearlos a los escenarios de este Change.
2. Implementar primero el resumen de requisitos y el contrato `pendingFactors`/`coveredFactors` desde progresión hasta `startNewRound` y `createQuestionRound`, manteniendo compatibilidad con el estado local versionado y una migración idempotente si el formato necesita campos nuevos.
3. Conectar el cierre y las tarjetas de progreso al resumen; retirar cualquier indicador o acción que confunda estrellas con dominio o sugiera tabla 11.
4. Ejecutar pruebas unitarias y E2E declaradas, incluyendo recarga, y repetirlas después de retirar rutas sustituidas.
5. Si la implementación cumple y Verify aporta evidencia, sincronizar/archivar la especificación mediante OpenSpec. Si aparece una contradicción de producto, detenerse y usar `openspec-update-change`; no resolverla silenciosamente.

Rollback: revertir el candidato completo del Change manteniendo intactos los datos locales históricos y la versión de almacenamiento; no borrar progreso del navegador ni introducir una migración destructiva. Si un nuevo campo no se puede leer, usar el fallback defensivo existente y conservar el juego jugable.
