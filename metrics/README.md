# Ingesta de métricas V3-02

Este Worker recibe exclusivamente métricas agregadas del juego en una ruta aislada. El operador autorizó la transmisión de los agregados descritos y aceptó el procesamiento de metadatos de red por Cloudflare. La activación productiva se hace por etapas: Worker primero y cliente después; Pages publica `dist/pages` desde una allowlist que excluye `metrics/`, SQL y documentos internos.

## Desarrollo local

```sh
npm run metrics:db:migrate
npm run metrics:dev
```

Wrangler crea/usa su almacenamiento local de D1. La configuración usa un identificador ficticio local; no contiene ID de D1 productiva, `route`, `custom_domain`, token ni secreto Cloudflare. No ejecutar migraciones remotas desde esta configuración.

Para revertir únicamente esta base local de prueba, detener `metrics:dev` y ejecutar el SQL destructivo explícito con Wrangler local:

```sh
npx wrangler d1 execute multiplo-metrics-local --local --config metrics/wrangler.jsonc --file metrics/maintenance/rollback-local.sql
```

Esto elimina todos los datos locales de prueba de V3-02 y no revierte ni toca ninguna base remota. La migración no tiene rollback automático; si se necesitara revertir una D1 remota en el futuro, primero haría falta un Change/despliegue autorizado y un respaldo verificado.

El único handler es `POST /api/metrics`. `npm run metrics:dev` permite localmente `127.0.0.1`; por defecto, `METRICS_INGEST_ENABLED=false` responde `503 ingestion_disabled` antes de acceder a D1. La producción solo se cambia mediante `.github/workflows/metrics-worker-deploy.yml`, con GitHub Environment protegido y selección explícita de `enable_ingestion`; no activar con credenciales locales ni mediante #43.

## Contrato y persistencia

- Esquema JSON cerrado v1, máximo 4 KiB, deltas por actividad/fecha UTC, tabla (`a`) y hasta diez factores `b`; véase `openspec/changes/v3-02-worker-d1-ingesta-anonima/specs/anonymous-metrics-ingestion/spec.md`.
- D1 contiene agregados diarios y claves de lote con fecha de recepción/expiración. No almacena payload, IP o user-agent. Las consultas usan parámetros y un `batch()` transaccional.
- Los lotes se deduplican por 30 días; #44 limita su cola local a 7 días y 3 reintentos. Los agregados vencen a los 24 meses. No se promete deduplicación después de expirar un `batchId`.
- La purga manual se hace con Wrangler autenticado y el SQL de `maintenance/purge-expired.sql`. No hay endpoint de purga, cron ni scheduler.
- La tasa Worker configurada es 120 peticiones/minuto por IP y ubicación Cloudflare, mediante binding. Es aproximada, eventualmente consistente y no es una cuota global estricta. La IP se utiliza solo como clave efímera del binding: el Worker no la guarda ni la registra. El proveedor puede procesar metadatos de red según su propia configuración.

## Plan Free y limitaciones perimetrales

Consulta las cuotas vigentes antes de cualquier operación externa. Al 22 de noviembre de 2026, Cloudflare publica para Workers Free 100.000 peticiones/día y 10 ms de CPU por invocación; D1 Free publica 5 millones de filas leídas/día, 100.000 escritas/día, 500 MB por base y 5 GB de almacenamiento total de cuenta. Al exceder límites, las consultas/requests pueden fallar hasta el reinicio diario; los datos existentes no se eliminan. No habilitar cobro por consumo. Fuentes: [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/) y [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/).

**Resultado de comprobación (22-11-2026):** `silverman.pro` responde con nameservers `tess.ns.cloudflare.com` y `ezra.ns.cloudflare.com`; `multiplo.silverman.pro` no tiene delegación NS propia y comparte zona. Cloudflare Free no permite expresar de forma segura una regla WAF exacta para host y ruta. El operador decidió usar el binding de rate limit del Worker como control disponible, aceptar su aproximación y posible subregistro, no crear una regla por path en la zona compartida y no cambiar a un plan pago. Fuente: [disponibilidad de rate limiting por plan](https://developers.cloudflare.com/waf/rate-limiting-rules/).

El binding de rate limit del Worker usa `CF-Connecting-IP` como clave efímera, con 120 solicitudes por minuto y ubicación Cloudflare. Es aproximado, por ubicación y se ejecuta después de iniciar el Worker; no es una cuota global estricta. El operador acepta usarlo en lugar de una regla WAF exacta que el plan Free no ofrece. No se crea una regla amplia ni se habilita facturación. Un 429 y los reintentos agotados pueden causar subregistro; los informes describen solo lotes aceptados. `Origin`, CORS y UUID v4 no autentican al jugador: las estadísticas son falsificables y no prueban identidad ni aprendizaje.

## Activación futura

La autorización del alcance de datos y metadatos fue recibida. Los bindings de prueba/producción, host/ruta, Environment protegido, alcance del token y controles de retención se mantienen separados y verificados. La activación sigue el despliegue secuencial documentado en `metrics/OPERATIONS.md`; Pages conserva la allowlist y su workflow normal.
