# Proposal

## Why

Request #29 identifica una ambigüedad de producto: una ronda puede mostrar 4/4 estrellas aunque la tabla siguiente siga bloqueada por dominio acumulado pendiente, y el cierre puede no explicar qué hacer cuando no existe otra tabla disponible. La siguiente iteración debe hacer explícita la diferencia entre resultado de ronda, progreso de dominio y desbloqueo, además de permitir seleccionar suficientes factores distintos para completar el dominio sin depender de repeticiones aleatorias.

El cambio se planifica ahora como corrección vertical de la progresión y del cierre, pero su implementación queda reservada para la siguiente iteración; esta propuesta no afirma que el comportamiento actual esté corregido ni validado.

## What Changes

- Definir en la especificación canónica que las estrellas representan únicamente aciertos iniciales de la ronda (0–4), mientras que el desbloqueo depende por separado de las reglas vigentes: una ronda `>=3/4` para pasar desde tabla 1 y, únicamente para tablas 2–10, dos de las últimas tres rondas calificadas más siete factores `b` distintos.
- Mostrar en el progreso y en el cierre los requisitos de dominio cumplidos y pendientes, sin presentar la tabla como terminada mientras falte una condición.
- Ajustar el cierre para ofrecer únicamente acciones existentes: repetir la tabla, volver a niveles o avanzar solo cuando la siguiente tabla exista y esté desbloqueada; no sugerir una tabla inexistente.
- Hacer determinista y verificable la selección de preguntas/factores para que una ronda y sus rondas sucesivas puedan cubrir los factores `b` distintos requeridos por dominio, evitando depender de repeticiones indefinidas.
- Conservar la persistencia local del desbloqueo y verificarla al recargar o volver a abrir la aplicación.
- Añadir pruebas automatizadas para rondas perfectas con factores repetidos, progreso pendiente, cierres 3/4 sin siguiente tabla y desbloqueo tras completar los requisitos.
- Mantener fuera de alcance la implementación en esta iteración actual, la creación de nuevas tablas, el backend, las cuentas, la analítica, la sincronización y cualquier cambio a la regla pedagógica aprobada por D-011.

## Capabilities

### New Capabilities

Ninguna. El cambio corrige requisitos de capacidades existentes.

### Modified Capabilities

- `level-progression-local-persistence`: separar semánticamente estrellas de ronda, dominio pendiente, estado de tabla terminada y acciones de cierre; desbloquear y conservar acceso solo al completar todos los requisitos mostrados.
- `question-round-engine`: seleccionar preguntas con cobertura suficiente de factores distintos, conservar la evaluación de primer intento y exponer al progreso la evidencia necesaria sin convertir repeticiones aleatorias en una estrategia de dominio.

## Impact

- **Producto y UX:** cierre de ronda, tarjetas/progreso de tablas y mensajes de avance en español; debe distinguir «ganaste 4 estrellas» de «aún faltan requisitos para desbloquear». La tabla 10 sigue sin tabla 11.
- **Lógica local:** estado de dominio acumulado, cálculo de desbloqueo, selección de factores y persistencia en `localStorage`; no se añaden servicios remotos ni datos personales.
- **Pruebas:** suites unitarias del motor/progresión y checks de navegador declarados (`npm run test`, `npm run test:unit`, `npm run test:e2e`) en Apply/Verify; los checks UI reproducibles deben ejecutarse con el Chromium configurado y dejar evidencia observable.
- **Trazabilidad:** Request #29, RF-06/RF-07/RF-08, RNF-05/RNF-06/RNF-07, D-007/D-011/D-012/D-019 y Q-05–Q-08, con nuevos escenarios Gherkin del cambio.
- **Dependencias y límites:** reutilizar los módulos existentes de progresión, motor de preguntas, app y assets versionados. No se autoriza framework, API, backend, migración remota ni modificación de la convención `a×b = a grupos de b`.
