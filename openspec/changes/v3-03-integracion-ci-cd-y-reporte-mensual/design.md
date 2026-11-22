## Context

Ver [proposal.md](proposal.md) para la motivación y los contratos en `specs/`. #42 conserva los agregados localmente; #43 define el receptor Worker/D1 y su esquema. El workflow actual de Pages sube `.`; no se debe integrar #43 hasta publicar desde una allowlist.

## Goals / Non-Goals

**Goals:** integrar el formato del #43 sin convertir el envío en requisito del juego; separar los ciclos de publicación; generar informes repetibles con fuentes y periodos explícitos; proteger datos infantiles y servicios hermanos.

**Non-Goals:** datos reales antes de los gates de privacidad; identidad individual; panel web; informes automáticos; despliegue o migración implícitos por push; servicios pagos o nuevas reglas del juego.

## Decisions

### 1. Una cola local independiente y sin actividad cuando está apagada

Mantener el historial de #42 como fuente de deltas calculados y crear una cola versionada separada de `multiplo_progression_v1` y de la clave de historial. En modo apagado no crear lotes para transmisión ni acumular datos que puedan enviarse retroactivamente. Al habilitarse con autorización, persistir un lote agregado por cierre elegible con UUID v4 estable; una transacción local de outbox y un identificador de evento compartido evitan que dos contextos encolen dos veces el mismo cierre. Reusar el `batchId` al reintentar y quitar el lote solo tras confirmación válida. Límite: 100 lotes, 7 días y 3 intentos; los reintentos solo ocurren en eventos normales, con backoff acotado, sin polling ni timer permanente. Un vencimiento/agotamiento descarta el lote sin tocar historial ni progreso.

**Alternativa:** enviar directamente al terminar la ronda o reconstruir deltas desde DOM. Se descarta porque no tolera fallos/offline y mezcla telemetría con UX o duplicaría eventos.

### 2. Allowlist explícita del artefacto Pages

Construir un directorio temporal de publicación copiando solo `index.html`, `css/`, `js/`, `assets/`, manifest, iconos y CNAME tras validar referencias reales. Conservar Node 22, preparación Fola y Pages action existentes. No publicar raíz del repo ni permitir que `metrics/`, tests, docs o archivos internos entren al artefacto.

**Alternativa:** renombrar u ocultar `metrics/` o confiar en que Pages no sirve archivos fuente. Se descarta porque no elimina la exposición del artefacto.

### 3. Pipelines separados con producción manualmente protegida

Usar filtros por rutas para que cambios frontend ejecuten Pages y cambios Worker ejecuten build/tests de Worker sin publicar Pages. PR ejecuta migración y Worker local con D1 sintética, sin secrets. El workflow de producción del Worker usa `workflow_dispatch`, GitHub Environment protegido y token Cloudflare de alcance mínimo. Separar migraciones productivas en paso manual tras backup/revisión. Como el repositorio es público, cifrar el backup D1 con AES-256-GCM mediante una clave del GitHub Environment antes de subirlo como artefacto; abortar antes de migrar si el cifrado o la preservación falla. La recuperación se ejecuta manualmente desde ese artefacto autenticado hacia una D1 de reemplazo vacía, sin sobrescribir tablas existentes. Ningún job habilita `METRICS_INGEST_ENABLED` ni billing.

**Alternativa:** despliegue conjunto en push a main o ejecutar migraciones en cada release. Se descarta por riesgo de alterar producción sin autorización.

### 4. Informe manual, con datos agregados y fuente reproducible

Un script local acepta el periodo UTC, obtiene agregados mediante comandos `SELECT` predefinidos ejecutados con acceso administrativo autenticado a D1 y combina una exportación de Traffic Analytics filtrada por host que proporciona el operador. Produce CSV y Markdown con fecha de extracción, fórmulas, denominadores, celdas suprimidas y advertencias; los fixtures sintéticos generan ejemplo completo sin secretos ni datos reales. El threshold inicial de supresión será **menos de 10 eventos por celda**; este límite reduce granularidad, no prueba anonimato ni cantidad de personas.

**Alternativa:** endpoint público, dashboard, cron o integración con identidad infantil. Se descarta por privacidad, alcance y costo.

### 5. El gate de privacidad controla el envío, no la capacidad local

Los defaults de cliente y Worker permanecen apagados. Un registro de aprobación explícito cubre finalidad, aviso/legal, metadatos/logs Cloudflare, acceso, retención, supresión y responsable; sin ese registro no existe variable/secret que habilite transmisión real. UUID, CORS y Origin no autentican. El fallo de red, cuota o Worker nunca bloquea la experiencia local.

**Alternativa:** confiar en la etiqueta anónima o en la existencia del Worker como consentimiento. Se descarta porque el lote puede ser falsificado y Cloudflare puede procesar metadatos de red.

## Risks / Trade-offs

- **La cola crea riesgo de duplicación o pérdida en dos pestañas** → identidad de cierre estable, escritura serializada local, outbox separado y prueba de recarga/carrera; no prometer exactly-once global.
- **La allowlist omite un asset vigente** → construir el artefacto y validar todas las rutas/recursos requeridos de PWA y Fola antes del deploy.
- **Token GitHub/Cloudflare expuesto** → Environment protegido, permisos mínimos, no imprimir secretos, sin token en páginas/artifact.
- **Métricas escasas o falsificadas** → umbral de celda y explicación explícita; no inferir usuarios únicos ni efecto causal.
- **D1 o Cloudflare Traffic Analytics usan ventanas distintas** → alinear el periodo al mes UTC cuando sea posible; si difieren, exponer fechas y no presentar comparación directa.
- **El Change #43 no está integrado o el host/ruta/WAF no queda aislado** → no habilitar envío; completar precondición con evidencia antes de producción.

## Migration Plan

1. En PR, generar artefacto Pages allowlisted y validar que contiene los recursos del juego y excluye archivos internos; probar Worker/D1 local con datos sintéticos.
2. Fusionar implementación solo después de CI verde y verificación independiente contra SHA inmutable. La publicación de Pages ocurre por su pipeline filtrado.
3. Crear/configurar D1 y route Worker de producción solo desde workflow manual protegido; backup y migración explícitos, comprobación posterior y rollback documentado. Mantener kill switch apagado.
4. Generar ejemplo de informe con fixtures; el primer informe real requiere gate de privacidad y autorización operativa separados.
5. Para rollback Pages/Worker, redeplegar artifact o versión de Worker anterior; D1 requiere restauración desde backup cifrado y autenticado hacia una base vacía de reemplazo, no borrar tablas automáticamente. La clave no aparece en logs ni artefactos.

## Open Questions

Ninguna para la propuesta. El umbral de 10 eventos es una decisión operativa inicial y se informará como protección de granularidad, no como garantía de anonimato. Los gates legales/privacidad son precondiciones para datos reales, no decisiones que el implementador pueda inferir.
