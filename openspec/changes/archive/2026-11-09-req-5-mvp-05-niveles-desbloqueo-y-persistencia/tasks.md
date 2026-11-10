# Tasks

## 1. Inventario y modelo de niveles

- [x] 1.1 Inventariar en el código y tests reales los consumidores de selección de nivel, `startNewRound`, cierre de Fin y control de sonido, y registrar los puntos que se reutilizarán o retirarán; verificar que el inventario no modifica código ni declara implementado lo que solo existe en artefactos archivados (issue #5, design).
- [x] 1.2 Crear el catálogo único de niveles 1–4 con la correspondencia `2, 3, 4, 5` y factores `1..5`, reutilizable por el generador del issue #4; verificar exhaustivamente las 20 parejas válidas y la convención `a×b = a grupos de b` (RF-06, RNF-05).
- [x] 1.3 Implementar el estado inicial con solo Nivel 1 abierto y derivar la disponibilidad secuencial desde un máximo entre 1 y 4; verificar que nunca se puede construir el estado Nivel 4 abierto con un nivel anterior bloqueado.

## 2. Umbral y transición de progreso

- [x] 2.1 Implementar el cierre idempotente de ronda que consume una sola vez el resumen de 0–4 aciertos del primer intento producido por `question-round-engine`; verificar que una respuesta corregida no incrementa el resumen ni el umbral (RF-06, RF-07; escenarios de reintento).
- [x] 2.2 Aplicar el umbral `>=3` solo al nivel disponible jugado, desbloqueando como máximo el nivel inmediatamente posterior y conservando niveles abiertos ante fallos; verificar los casos 3/4, 4/4, 2 iniciales + 2 corregidos y doble activación del cierre.
- [x] 2.3 Integrar el resumen con Fin de ronda sin avanzar durante una pregunta individual; verificar la secuencia Aprende → cuatro preguntas → Fin → desbloqueo y que una ronda insuficiente puede repetirse.
- [x] 2.4 Implementar las acciones de Repetir y volver a niveles anteriores abiertos, y ocultar la acción de siguiente nivel cuando se termina el Nivel 4; verificar que nunca aparece un Nivel 5 y que la repetición no bloquea niveles ya abiertos (RF-07).

## 3. Persistencia local defensiva

- [x] 3.1 Implementar la serialización mínima versionable de nivel máximo abierto y `soundEnabled` en `localStorage`, sin guardar identidad, respuestas ni datos remotos; verificar que una escritura y lectura conservan Nivel 2 y la preferencia de sonido en el mismo navegador (RF-07, RNF-03, RNF-06).
- [x] 3.2 Validar y normalizar datos cargados, tratando JSON inválido, rangos imposibles, `SecurityError`, cuota excedida y ausencia de `localStorage` como estado de sesión seguro; verificar que el juego continúa y muestra aviso apto para adulto sin llamadas de red.
- [x] 3.3 Verificar aislamiento entre navegadores/orígenes con un E2E o harness de navegador separado: el progreso de un contexto no aparece en el otro, mientras que recargar el mismo contexto sí conserva el Nivel 2.

## 4. Integración de interfaz y assets

- [x] 4.1 Integrar la vista de niveles con la misma fuente de estado, mostrando abierto/bloqueado mediante texto, icono y estado accesible además del color; verificar teclado, toque/clic y controles grandes en móvil, tablet y escritorio (RNF-01, RNF-07).
- [x] 4.2 Reutilizar `assets/icons/estrella-premio.svg`, `assets/mascot/normal.svg` y la paleta de `docs/ASSETS.md` en la disponibilidad y cierre, manteniendo texto/fallback si multimedia o voz no están disponibles; verificar ausencia de dependencias externas en runtime (D-018, RNF-02).
- [x] 4.3 Persistir y restaurar el control de sonido sin impedir la ronda cuando el audio falle; verificar mute, recarga y continuidad textual usando la guía existente del issue #2.

## 5. Pruebas, retiro y evidencia

- [x] 5.1 Añadir pruebas unitarias de catálogo, factores, disponibilidad prefija, umbral, idempotencia, conservación, reintentos y serialización corrupta/restringida; verificar que la suite cubre todos los escenarios de `level-progression-local-persistence`.
- [x] 5.2 Actualizar o añadir E2E real de una ronda completa: Nivel 1 inicial, 3/4 desbloquea Nivel 2, 2/4 con dos correcciones no desbloquea, Nivel 2 persiste tras recarga y Nivel 4 no ofrece Nivel 5; verificar primer intento inmutable y navegación repetible.
- [x] 5.3 Retirar handlers, selectores, literales o rutas duplicadas que creen un desbloqueo paralelo, cuenten reintentos, ofrezcan Nivel 5 o escriban progreso fuera de la fuente única; verificar mediante búsqueda y suite completa después del retiro (safe retirement).
- [x] 5.4 Ejecutar validación manual proporcional en celular, tablet y computador, con almacenamiento disponible/bloqueado, voz disponible/ausente y sonido silenciado; registrar navegadores, comandos, resultados y fallos reproducibles en el formato de `docs/QUALITY_AND_VALIDATION.md`, sin afirmar despliegue ni validación con un niño.
