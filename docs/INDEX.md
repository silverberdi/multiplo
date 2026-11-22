# Múltiplo — Índice canónico de contexto

**Estado del producto:** Múltiplo v1.2 está implementado. Los documentos de MVP iniciales conservan decisiones históricas que fueron actualizadas por Requests y Changes OpenSpec posteriores.

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
- [Backlog vigente](https://github.com/silverberdi/multiplo/issues): issues con estado, alcance y Gherkin. V3-01 (#42) es historial local sin transmisión; V3-02 (#43) y V3-03 (#44) son issues separados y etiquetados `disabled`.
- [Catálogo multimedia](ASSETS.md) y directorio [assets/](../assets/): insumos ya versionados.

## Precedencia cuando haya conflicto
1. Contrato del issue y Change OpenSpec autorizado para el trabajo activo, dentro de las decisiones de producto aprobadas.
2. Código y Changes OpenSpec archivados para identificar el comportamiento implementado.
3. Decisiones vigentes de DECISIONS.md y documentación de producto; las reglas iniciales de MVP.md/LEARNING_MODEL.md pueden estar supersedidas.
4. Restricciones de arquitectura y UX que sigan vigentes.
5. Sugerencias técnicas que no alteren el comportamiento aprobado.

Si se detecta contradicción entre fuentes de la misma jerarquía, detener la **decisión de alcance**, documentar el conflicto y resolverlo antes de implementar; no elegir arbitrariamente. Una vez implementado un cambio, las specs canónicas de OpenSpec deben reflejar el comportamiento efectivamente entregado.

## Límites de responsabilidad
Este conjunto es contexto de producto y desarrollo, no prueba por sí solo de implementación, pruebas o despliegue. Confirma el estado en código, Changes archivados y evidencia disponible.
