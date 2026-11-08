# Instrucciones para agentes — Múltiplo
**Proyecto:** `silverberdi/multiplo` · **Estado:** juego aún no implementado.

## Antes de modificar algo
1. Leer [guía de transferencia OpenSpec](docs/OPENSPEC_HANDOFF.md).
2. Leer [visión](docs/PRODUCT_VISION.md), [MVP](docs/MVP.md), [aprendizaje](docs/LEARNING_MODEL.md), [UX](docs/USER_EXPERIENCE.md), [decisiones](docs/DECISIONS.md) y [arquitectura](docs/ARCHITECTURE.md).
3. Identificar issue(s) GitHub #1–#7, las dependencias y los recursos en [ASSETS](docs/ASSETS.md).
4. Utilizar **OpenSpec nativo** para proponer/especificar cambios autorizados. No improvisar un proceso paralelo ni tratar specs de producto como código ya construido.

## Autoridad y límites
- Priorizar comprensión de un niño de seis años, exactitud matemática y experiencia breve.
- No introducir funciones, datos personales, backend, cuentas, analítica, tablas adicionales o frameworks pesados sin autorización explícita.
- No afirmar que el juego está probado, desplegado o terminado sin evidencia.
- Reutilizar primero los SVG/WAV versionados, sin depender del historial de chat.
- Si hay contradicción entre documentos, issues y decisiones, exponerla y resolverla con decisión de producto; no ocultarla.

## Entrega
- Criterios Gherkin Given/When/Then para cada comportamiento nuevo.
- Pruebas proporcionales al producto, en especial generador de ejercicios, 3/4, voz/fallback y responsive.
- Trazabilidad del trabajo a issues y [matriz de requisitos](docs/TRACEABILITY.md).
- Actualizar artefactos de OpenSpec según el flujo de la versión instalada, reflejando comportamiento realmente implementado.

**Estas instrucciones no son una solicitud de implementación inmediata.**
