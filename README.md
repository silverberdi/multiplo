# Múltiplo ⭐

**Juego educativo para un niño de 6 años:** aprender a multiplicar mediante grupos de objetos, sumas repetidas y desafíos positivos.

**Estado:** MVP v1.0 de producto **definido; no implementado**. El repositorio contiene documentación, issues y recursos multimedia listos para ser usados por un agente de desarrollo mediante OpenSpec.

## Empezar aquí

- **[Índice canónico de contexto](docs/INDEX.md)** — documentación y orden de lectura.
- [Intención de negocio](docs/PRODUCT_VISION.md) — por qué existe el juego y qué validaremos con el niño.
- [Contrato MVP](docs/MVP.md) — comportamiento acordado.
- [Roadmap](docs/ROADMAP.md) — secuencia de ejecución y criterios de salida.
- [Decisiones](docs/DECISIONS.md) — decisiones aprobadas, sugeridas y pendientes.
- [Transferencia a OpenSpec](docs/OPENSPEC_HANDOFF.md) y [configuración](openspec/config.yaml).
- [Backlog de siete issues](../../issues) y [recursos multimedia](docs/ASSETS.md).

## Alcance del MVP

Cuatro niveles progresivos (tablas del 2 al 5, factores del 1 al 5). Cada ronda tiene una demostración con grupos iguales y suma repetida, dos ejercicios visuales, un desafío de multiplicación y otro de encontrar la operación correcta. Tres opciones por pregunta, una correcta. Se avanza con 3 de 4 aciertos en primer intento; existen pistas y reintentos ilimitados.

Una estrella amarilla guía con voz y texto. El juego será una web responsive/PWA para celular, tablet y computador, con progreso local y sin cuentas, backend, IA, anuncios ni analítica infantil.

**Convención:** `a × b` significa **a grupos de b objetos**; por ejemplo `3×2` son tres grupos de dos, no al revés.

## Reglas para desarrollo

La documentación describe el **producto deseado**, no un producto ya terminado. La implementación solo se inicia mediante una tarea autorizada y usando el workflow nativo de OpenSpec; [AGENTS.md](AGENTS.md) describe las restricciones. No incrementar alcance del MVP sin una decisión explícita.
