# Design

## Context

El repositorio sigue en estado de planificación; los artefactos archivados de los issues #1–#4 describen el shell, la guía y el motor, pero no constituyen código implementado en este worktree. Véanse `proposal.md` y las dos specs delta para el contrato observable. La arquitectura aprobada limita la solución a HTML/CSS/JavaScript estático, `localStorage` y assets versionados, sin backend ni sincronización.

## Goals / Non-Goals

**Goals:**

- Mantener una única fuente de verdad para la matriz de niveles, disponibilidad y preferencia de sonido.
- Conectar el resultado inmutable de cierre de `question-round-engine` con una transición idempotente de desbloqueo posterior a la ronda.
- Hacer que la carga y escritura local sean tolerantes a ausencia, corrupción y excepciones de almacenamiento.
- Proporcionar controles y estados responsive que hagan visible qué niveles están abiertos, permitan repetir y no sugieran un Nivel 5.
- Dejar puntos deterministas para probar las 20 combinaciones permitidas, el umbral 3/4, la persistencia y el aislamiento entre navegadores.

**Non-Goals:**

- No reanudar una ronda interrumpida ni persistir respuestas, nombre, identidad o historial detallado del niño.
- No añadir servidor, cuentas, base de datos, sincronización, analítica, ranking, monedas, niveles 5–10 ni una segunda experiencia de juego.
- No cambiar la semántica matemática, las cuatro preguntas, las pistas o el registro de primer intento ya definido por el motor.
- No introducir una dependencia externa, un framework pesado, una migración durable o un despliegue como parte de la planificación.

## Decisions

### Estado mínimo y fuente única

Se modelará un catálogo constante de cuatro niveles con su primer factor (`2..5`) y factores permitidos `1..5`. El estado durable contendrá solo un equivalente a `highestUnlockedLevel` entre 1 y 4 y `soundEnabled`; un equivalente de conjunto de niveles abiertos solo podrá derivarse de ese máximo para conservar el desbloqueo secuencial. Se rechaza guardar cuatro banderas independientes porque permitiría estados imposibles (por ejemplo, Nivel 4 abierto con Nivel 2 bloqueado).

El motor de ronda recibirá el nivel seleccionado y, al cerrar, publicará una única transición con el resumen de 0–4 aciertos de primer intento. El progreso validará que el nivel era accesible, aplicará el umbral `>=3`, abrirá como máximo `nivel + 1` y conservará el máximo anterior. Repetir una ronda ya superada será idempotente.

### Persistencia local defensiva

Se usará una única clave de aplicación versionable con un objeto pequeño y validado. La lectura aceptará solo enteros 1–4 y booleanos; cualquier otro valor volverá al estado inicial sin lanzar al flujo de juego. La escritura se encapsulará para absorber `SecurityError`, cuota excedida y entornos sin almacenamiento. Si no puede persistir, la sesión continúa con memoria y muestra un aviso breve para adulto, sin intentar una ruta remota.

Alternativa descartada: cookies, IndexedDB o un endpoint. Añaden superficie y/o sincronización no autorizada para el MVP y no son necesarias para conservar dos preferencias locales.

### Integración con el flujo existente

La pantalla de niveles consultará el mismo estado que usa el selector de ronda; los botones bloqueados no iniciarán una ronda y expondrán texto/estado accesible además del color. Fin de ronda procesará el desbloqueo únicamente después de que el niño haya visto el resumen, y ofrecerá Repetir y niveles abiertos anteriores. En Nivel 4 se omitirá el CTA de siguiente nivel mediante la misma regla de catálogo, no mediante un texto especial duplicado.

Se reutilizarán `estrella-premio.svg`, `normal.svg` y la paleta de `docs/ASSETS.md`. La voz y los efectos seguirán siendo adaptadores no bloqueantes del Change #4; este cambio solo persistirá su preferencia.

### Censo de consumidores, escritores y retiro

Durante apply, el implementador deberá localizar los consumidores de `startNewRound`/selección de nivel, el resumen de Fin, el control de sonido, la guía y cualquier estado de ronda. Se modificará la ruta única existente para leer/escribir el progreso y se retirarán selectores, handlers o literales que creen un desbloqueo paralelo, un Nivel 5 o una puntuación basada en reintentos. No se retirará código del motor de preguntas que siga siendo consumidor válido. La suite unitaria y el E2E se ejecutarán después del retiro para demostrar que no quedan rutas duplicadas.

### Seguridad, privacidad y rollback

La serialización no incluirá datos personales ni texto introducido por el niño. No habrá llamadas de red para progreso. Un rollback de código consiste en revertir la integración de niveles manteniendo los artefactos OpenSpec; la clave local puede ignorarse por una versión posterior sin borrar datos de otros cambios.

## Risks / Trade-offs

- [Risk] El estado local puede ser borrado o no estar disponible → Mitigación: iniciar en Nivel 1, permitir jugar en memoria y no presentar la pérdida como error del niño.
- [Risk] Eventos repetidos al cerrar una ronda podrían saltar más de un nivel → Mitigación: transición idempotente, máximo incremento de un nivel por ronda y prueba de doble activación.
- [Risk] Un estado manipulado puede habilitar niveles imposibles → Mitigación: validar rango, normalizar a una progresión prefija y tratar datos inválidos como estado inicial.
- [Risk] La interfaz puede sugerir un nivel bloqueado o inexistente en pantallas pequeñas → Mitigación: estados textuales accesibles, catálogo de cuatro elementos, reflujo responsive y E2E en móvil/tablet/escritorio.
- [Risk] Se confunda una corrección con un acierto inicial → Mitigación: consumir únicamente el resumen inmutable del motor y probar 2 aciertos iniciales + 2 corregidos como caso negativo.

## Migration Plan

1. Inventariar el código y tests entregados por #1–#4, confirmar callers/writers reales y fijar el contrato de la matriz de niveles.
2. Implementar y probar el estado de progresión/persistencia en aislamiento, incluidos datos inválidos y almacenamiento restringido.
3. Integrar selección, cierre de ronda, desbloqueo y preferencia de sonido en la ruta existente; añadir UI accesible y responsive.
4. Retirar rutas paralelas, Nivel 5, puntuación por reintento y handlers obsoletos; ejecutar de nuevo la suite completa y E2E real.
5. Validar manualmente reinicio en el mismo navegador, aislamiento entre navegadores, Nivel 4 y fallos de `localStorage`; documentar evidencia según `docs/QUALITY_AND_VALIDATION.md`.

El cambio no requiere migración de datos previa. Si existiera un formato local anterior, solo se aceptará si pasa la validación del estado mínimo; de lo contrario se usará el estado inicial sin bloquear.

## Open Questions

Ninguna. La elección exacta de nombres de módulos, clave de `localStorage` y selectores queda abierta al implementador porque no cambia el contrato ni la descomposición aprobada.
