# Múltiplo ⭐

**Juego educativo para un niño de 6 años:** aprender a multiplicar mediante grupos de objetos, sumas repetidas y desafíos positivos.

**Estado:** el juego Múltiplo v1.2 está implementado en este repositorio. La documentación original del MVP conserva decisiones históricas; para el comportamiento vigente, consulta también los Changes OpenSpec archivados y el código actual. El Issue #42 conserva historial local. #43/#44 incorporaron Worker/D1 agregado, outbox, publicación Pages allowlisted y workflows protegidos; migración y Worker están desplegados. El operador autorizó métricas agregadas y el Change de activación secuencial está en curso. Consulta [operación de métricas](metrics/OPERATIONS.md).

## Empezar aquí

- **[Índice canónico de contexto](docs/INDEX.md)** — documentación y orden de lectura.
- [Intención de negocio](docs/PRODUCT_VISION.md) — por qué existe el juego y qué validaremos con el niño.
- [Contrato MVP](docs/MVP.md) — comportamiento acordado.
- [Roadmap](docs/ROADMAP.md) — secuencia de ejecución y criterios de salida.
- [Decisiones](docs/DECISIONS.md) — decisiones aprobadas, sugeridas y pendientes.
- [Transferencia a OpenSpec](docs/OPENSPEC_HANDOFF.md) y [configuración](openspec/config.yaml).
- [Backlog vigente](https://github.com/silverberdi/multiplo/issues) y [recursos multimedia](docs/ASSETS.md).

## Alcance del MVP

El juego actual incluye tablas y factores del 1 al 10, dominio acumulado y progreso local. Cada ronda conserva una demostración y cuatro preguntas evaluables, con pistas y reintentos ilimitados; la evaluación usa el primer intento. La convención es `a × b` = **a grupos de b objetos**.

Una estrella amarilla guía con voz y texto. Es una web responsive/PWA para celular, tablet y computador, con progreso local. No incluye cuentas ni backend de juego. La transmisión de agregados está autorizada y se habilita por etapas; consulta el estado y los límites en [operación de métricas](metrics/OPERATIONS.md).

**Convención:** `a × b` significa **a grupos de b objetos**; por ejemplo `3×2` son tres grupos de dos, no al revés.

## Reglas para desarrollo

Los documentos de producto describen decisiones, algunas ya sustituidas por Requests posteriores. Antes de implementar, consulta [AGENTS.md](AGENTS.md), `docs/INDEX.md` y el Change OpenSpec autorizado; no uses como estado actual las afirmaciones históricas de preimplementación. No amplíes el alcance autorizado.
