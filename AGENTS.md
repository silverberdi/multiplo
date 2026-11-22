# Instrucciones para agentes — Múltiplo
**Proyecto:** `silverberdi/multiplo` · **Estado:** juego v1.2 implementado; consulta el código y Changes OpenSpec archivados para el comportamiento vigente.

## Antes de modificar algo
1. Leer [guía de transferencia OpenSpec](docs/OPENSPEC_HANDOFF.md).
2. Leer [visión](docs/PRODUCT_VISION.md), [MVP](docs/MVP.md), [aprendizaje](docs/LEARNING_MODEL.md), [UX](docs/USER_EXPERIENCE.md), [decisiones](docs/DECISIONS.md) y [arquitectura](docs/ARCHITECTURE.md).
3. Identificar el Issue GitHub y Change OpenSpec autorizados, sus dependencias y recursos en [ASSETS](docs/ASSETS.md). No tratar issues `disabled` ni dependencias futuras como autorización.
4. Utilizar **OpenSpec nativo** para proponer/especificar cambios autorizados. No improvisar un proceso paralelo ni tratar specs de producto como código ya construido.

## Autoridad y límites
- Priorizar comprensión de un niño de seis años, exactitud matemática y experiencia breve.
- No introducir funciones, datos personales, cuentas, transmisión/telemetría o frameworks pesados fuera del Change autorizado. #42 conserva historial local; #43/#44 añaden un receptor agregado separado y operación protegida. La transmisión agregada de #44 fue autorizada y está activa en producción desde 2026-11-22; cualquier cambio de activación requiere los gates de privacidad y autorización operativa explícita.
- No afirmar que una versión está probada, desplegada o terminada sin evidencia.
- Reutilizar primero los SVG/WAV versionados, sin depender del historial de chat.
- Si hay contradicción entre documentos, issues y decisiones, exponerla y resolverla con decisión de producto; no ocultarla.

## Entrega
- Criterios Gherkin Given/When/Then para cada comportamiento nuevo.
- Pruebas proporcionales al producto, en especial generador de ejercicios, 3/4, voz/fallback y responsive.
- Trazabilidad del trabajo a issues y [matriz de requisitos](docs/TRACEABILITY.md).
- Actualizar artefactos de OpenSpec según el flujo de la versión instalada, reflejando comportamiento realmente implementado.
- Pages debe publicar solo `dist/pages` desde su allowlist. Cambios de Worker, SQL, docs o tests no deben disparar el deploy Pages.
- Probar Worker/D1 solo localmente con Wrangler `--local` y datos sintéticos; no añadir credenciales ni usar `--remote` en validaciones de PR.

La tarea autorizada actual es la única fuente de alcance de implementación; sigue el workflow nativo OpenSpec instalado.
