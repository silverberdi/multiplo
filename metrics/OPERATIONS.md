# Operación de métricas V3-03 (#44)

Este servicio es opcional. El juego y su historial local funcionan aunque el Worker, D1, red o cuota fallen.

## Privacidad y acceso

- El público previsto incluye niños desde los seis años. La evaluación de privacidad infantil, el aviso aplicable y la autorización operativa deben quedar aprobados antes de conectar usuarios reales; este Change no determina requisitos legales por país.
- El cliente solo puede transmitir agregados diarios por tabla/operación, sin nombre, cuenta, identificador de dispositivo, historial individual ni contenido libre. Los UUID de lote son técnicos y no autentican personas.
- Cloudflare puede procesar IP, `Origin`, hora y otros metadatos de red/logs. Revisar la configuración y retención de Cloudflare antes de habilitar datos reales. D1 recibe solo agregados y clave de deduplicación.
- Acceso administrativo a D1 e informes se limita a operadores autorizados mediante Cloudflare/GitHub; no existe endpoint público de lectura. El Environment `multiplo-metrics-production` existe, permite despliegues desde `main`, requiere aprobación de `silverberdi` y no permite bypass de administradores. Sus variables y `CLOUDFLARE_API_TOKEN` están configurados en GitHub; el valor del secreto no se lee ni se guarda en el repositorio.
- La retención D1 de agregados y claves se define en #43 (24 meses para agregados; 30 días para claves). El cliente descarta lotes a los 7 días o tres intentos. La supresión de celdas menores de 10 eventos reduce granularidad, no garantiza anonimato.

## Interruptores, despliegue y recuperación

- `METRICS_TRANSMISSION_ENABLED` en `js/app.js` queda `false`; la variable del Worker `METRICS_INGEST_ENABLED` también se despliega como `false`. No cambiar ninguna hasta completar gates de privacidad/operación y una autorización explícita.
- La PWA publica solo el artefacto allowlisted `dist/pages`. El Worker usa `multiplo.silverman.pro/api/metrics*` solo para que Cloudflare incluya query strings en el despacho; el handler acepta únicamente `POST /api/metrics` sin query y devuelve 404 para sufijos, antes de tocar D1. No intercepta `/`, assets ni hosts hermanos. El workflow no configura reglas WAF amplias.
- `.github/workflows/metrics-worker-deploy.yml` es manual y protegido por GitHub Environment. La operación usa bindings de production provistos por variables protegidas y despliega con la ingesta apagada.
- `.github/workflows/metrics-d1-migrate.yml` es una operación manual distinta. Requiere referencia de respaldo/aprobación, exporta la D1 remota, verifica que el SQL pueda importarse localmente y adjunta el snapshot al run antes de migrar; después consulta el esquema esperado. El rollback restaura el snapshot verificado en una operación revisada, no borra tablas automáticamente.
- Los workflows están preparados. GitHub tiene configuradas las variables de cuenta/zona/D1/namespace y el Environment protegido. El despliegue Worker y la migración D1 siguen sin ejecutarse; la ruta exacta y los permisos efectivos del token rotado deben comprobarse mediante la primera operación manual aprobada. No se ejecutan desde un push.
- Costos/cuotas se observan manualmente en Cloudflare. No se habilita billing automático; si el proveedor rechaza cuota/red, la PWA sigue jugando sin mensaje técnico infantil.

## Informe mensual

`metrics/queries/monthly.sql` contiene solo consultas `SELECT` con límites de mes UTC. Sustituir los dos marcadores de fecha con valores validados, ejecutarla con acceso autenticado de solo lectura y combinar sus resultados con una exportación de Cloudflare Traffic Analytics del mismo host/periodo. Guardar la entrada normalizada en un archivo JSON local, no en Pages ni en el repositorio si contiene resultados reales. Ejecutar:

```sh
node scripts/generate-monthly-report.mjs --month=YYYY-MM --input=/ruta/privada/entrada.json --out-dir=/ruta/privada/salida
```

El informe produce Markdown y CSV, deja explícitos periodo/extracción/fórmulas/denominadores, periodos no comparables y `Sin datos`. El fixture `metrics/report/synthetic-fixture.json` permite probar el formato sin producción. No inferir usuarios únicos, cohortes, DAU/MAU ni causalidad educativa.
