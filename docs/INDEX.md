# Múltiplo — Índice canónico de contexto

**Estado del producto:** MVP v1.0 definido y documentado; **implementación del juego aún no iniciada**.

## Orientación para agentes y personas

| Lectura | Documento | Responde |
|---|---|---|
| 1 | [PRODUCT_VISION.md](PRODUCT_VISION.md) | ¿Por qué se crea, para quién y cómo sabremos que aporta valor? |
| 2 | [MVP.md](MVP.md) | ¿Qué comportamiento está aprobado para el MVP? |
| 3 | [LEARNING_MODEL.md](LEARNING_MODEL.md) | ¿Cómo aprende el niño? ¿Qué reglas matemáticas son inmutables? |
| 4 | [USER_EXPERIENCE.md](USER_EXPERIENCE.md) | ¿Qué ve, toca y escucha el niño en cada paso? |
| 5 | [DECISIONS.md](DECISIONS.md) | ¿Qué está aprobado, sugerido o pendiente? |
| 6 | [ARCHITECTURE.md](ARCHITECTURE.md) | ¿Cómo mantener el producto simple y qué no construir? |
| 7 | [ROADMAP.md](ROADMAP.md) | ¿En qué orden se entrega y cómo se valida cada hito? |
| 8 | [TRACEABILITY.md](TRACEABILITY.md) | ¿Qué objetivo/requisito corresponde a cada issue y prueba? |
| 9 | [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md) | ¿Cómo demostrar que el juego funciona y sirve al niño? |
| 10 | [ASSETS.md](ASSETS.md) | ¿Qué gráficos, sonidos y tipografías ya existen? |
| 11 | [OPENSPEC_HANDOFF.md](OPENSPEC_HANDOFF.md) | ¿Cómo consumir este contexto mediante OpenSpec? |

## Entradas para OpenSpec

- [Configuración de proyecto](../openspec/config.yaml): contexto corto e instrucciones por artefacto; **no representa ejecución previa del CLI**.
- [AGENTS.md](../AGENTS.md): instrucciones generales al agente.
- [Backlog de issues #1–#7](https://github.com/silverberdi/multiplo/issues): entregables y Gherkin.
- [Catálogo multimedia](ASSETS.md) y directorio [assets/](../assets/): insumos ya versionados.

## Precedencia cuando haya conflicto
1. Decisión expresa de producto que actualiza este conjunto documental (registrada en DECISIONS.md).
2. Reglas aprobadas en MVP.md y LEARNING_MODEL.md.
3. Restricciones de arquitectura y UX registradas.
4. Issues, que concretan la entrega pero no deben ampliar el MVP por omisión.
5. Sugerencias técnicas de implementación que no afecten comportamiento aprobado.

Si se detecta contradicción entre fuentes de la misma jerarquía, detener la **decisión de alcance**, documentar el conflicto y resolverlo antes de implementar; no elegir arbitrariamente. Una vez implementado un cambio, las specs canónicas de OpenSpec deben reflejar el comportamiento efectivamente entregado.

## Límites de responsabilidad
Este conjunto es una **base de conocimiento para desarrollo**. No incluye código del juego, resultados de pruebas con el niño ni despliegues. Las propuestas OpenSpec y la implementación serán trabajo autorizado por separado.
