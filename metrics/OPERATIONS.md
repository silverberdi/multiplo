# Operación de métricas V3-03 (#44)

Este servicio es opcional. El juego y su historial local funcionan aunque el Worker, D1, red o cuota fallen.

## Privacidad y acceso

- El público previsto incluye niños desde los seis años. La evaluación de privacidad infantil, el aviso aplicable y la autorización operativa deben quedar aprobados antes de conectar usuarios reales; este Change no determina requisitos legales por país.
- El cliente solo puede transmitir agregados diarios por tabla/operación, sin nombre, cuenta, identificador de dispositivo, historial individual ni contenido libre. Los UUID de lote son técnicos y no autentican personas.
- Cloudflare puede procesar IP, `Origin`, hora y otros metadatos de red/logs. Revisar la configuración y retención de Cloudflare antes de habilitar datos reales. D1 recibe solo agregados y clave de deduplicación.
- Acceso administrativo a D1 e informes se limita a operadores autorizados mediante Cloudflare/GitHub; no existe endpoint público de lectura. El Environment `multiplo-metrics-production` existe, permite despliegues desde `main`, requiere aprobación de `silverberdi` y no permite bypass de administradores. Sus variables y los secretos `CLOUDFLARE_API_TOKEN` y `D1_BACKUP_ENCRYPTION_KEY` están configurados en GitHub; sus valores no se leen ni se guardan en el repositorio.
- La retención D1 de agregados y claves se define en #43 (24 meses para agregados; 30 días para claves). El cliente descarta lotes a los 7 días o tres intentos. La supresión de celdas menores de 10 eventos reduce granularidad, no garantiza anonimato.

## Interruptores, despliegue y recuperación

- `METRICS_TRANSMISSION_ENABLED` en `js/app.js` queda `false`; la variable del Worker `METRICS_INGEST_ENABLED` también se despliega como `false`. No cambiar ninguna hasta completar gates de privacidad/operación y una autorización explícita.
- La PWA publica solo el artefacto allowlisted `dist/pages`. El Worker usa `multiplo.silverman.pro/api/metrics*` solo para que Cloudflare incluya query strings en el despacho; el handler acepta únicamente `POST /api/metrics` sin query y devuelve 404 para sufijos, antes de tocar D1. No intercepta `/`, assets ni hosts hermanos. El workflow no configura reglas WAF amplias.
- `.github/workflows/metrics-worker-deploy.yml` es manual y protegido por GitHub Environment. La operación usa bindings de production provistos por variables protegidas y despliega con la ingesta apagada.
- `.github/workflows/metrics-d1-migrate.yml` es una operación manual distinta. Requiere referencia de respaldo/aprobación, exporta la D1 remota con la salida del proveedor suprimida (Wrangler puede imprimir una URL temporal firmada), verifica el SQL en local, lo cifra con AES-256-GCM y autentica el sobre antes de subirlo como artefacto; la migración solo corre después de que el artefacto cifrado quedó guardado. `D1_BACKUP_ENCRYPTION_KEY` vive solo como secreto del Environment y nunca se imprime. No subir respaldos D1 sin cifrar: este repositorio es público y los artefactos de Actions son legibles por quien pueda leer el repo.
- `.github/workflows/metrics-d1-restore.yml` restaura un artefacto autenticado únicamente en una D1 remota vacía, bajo el mismo Environment protegido y con confirmación manual. Para recuperar una base existente, crear una D1 de reemplazo vacía, apuntar temporalmente `METRICS_DATABASE_ID` a ella, ejecutar el restore y luego desplegar el Worker con ese binding; no se sobreescriben tablas existentes.
- **Evidencia de primera operación productiva (2026-11-22):** la migración se ejecutó en Actions run `45057718618`, SHA `257d1a3fa6917680524b6158f898838f1ecb5858`. Antes de aplicarla, el workflow exportó/verificó D1 y conservó el backup cifrado autenticado en el artifact `14768002596`; la consulta remota posterior confirmó `daily_metrics`, `daily_operation_metrics` y `processed_batches`. El Worker se desplegó separadamente en Actions run `45057809920` sobre el mismo SHA, versión `17d92540-9e7f-4261-a7da-f89375e5830f`, con binding `multiplo-metrics-production`, ruta `multiplo.silverman.pro/api/metrics*` y `METRICS_INGEST_ENABLED=false`. El smoke confirmó que Pages sigue sirviendo `/` y el manifest Fola, que rutas internas/documentos no están publicados y que `POST /api/metrics` responde `503 ingestion_disabled` sin procesar datos. La validación confirma despliegue y esquema, no transmisión real ni aprobación de privacidad.
- Estos workflows son manuales y protegidos; no se ejecutan desde un push. Para el estado actual, la migración productiva ya está aplicada, pero transmisión del cliente e ingesta Worker siguen apagadas a la espera de los gates de privacidad/operación.
- Costos/cuotas se observan manualmente en Cloudflare. No se habilita billing automático; si el proveedor rechaza cuota/red, la PWA sigue jugando sin mensaje técnico infantil.

## Informe mensual

`metrics/queries/monthly.sql` contiene solo consultas `SELECT` con límites de mes UTC. Sustituir los dos marcadores de fecha con valores validados, ejecutarla con acceso autenticado de solo lectura y combinar sus resultados con una exportación de Cloudflare Traffic Analytics del mismo host/periodo. Guardar la entrada normalizada en un archivo JSON local, no en Pages ni en el repositorio si contiene resultados reales. Ejecutar:

```sh
node scripts/generate-monthly-report.mjs --month=YYYY-MM --input=/ruta/privada/entrada.json --out-dir=/ruta/privada/salida
```

El informe produce Markdown y CSV, deja explícitos periodo/extracción/fórmulas/denominadores, periodos no comparables y `Sin datos`. El fixture `metrics/report/synthetic-fixture.json` permite probar el formato sin producción. No inferir usuarios únicos, cohortes, DAU/MAU ni causalidad educativa.
