## 1. Cliente: cola agregada y no bloqueante

- [x] 1.1 Reusar solo los deltas calculados por #42; mantener la opción de envío apagada y no crear ni acumular lotes antes de la autorización explícita.
- [x] 1.2 Implementar una outbox versionada separada del progreso/historial con identidad estable de cierre y `batchId` UUID v4, persistencia que tolere dos pestañas/recargas y límites de 100 lotes, 7 días y 3 reintentos.
- [x] 1.3 Reintentar solo ante eventos normales con backoff acotado; quitar lotes solo ante confirmación válida y descartar vencidos/agota-intentos sin alterar UX, audio, historial ni progreso.

## 2. GitHub Pages: artefacto allowlisted

- [x] 2.1 Construir el artefacto de Pages desde allowlist del frontend y verificar manifest, iconos, CNAME, rutas e inventario de assets Fola necesarios.
- [x] 2.2 Cambiar filtros de `deploy.yaml` para que solo cambios frontend publiquen Pages y confirmar que `metrics/`, SQL, tests, docs, OpenSpec, `.github/`, `.minime/`, dependencias y secretos quedan excluidos.

## 3. Worker y migraciones: CI separado y producción protegida

- [x] 3.1 Añadir workflow de PR del Worker con Wrangler fijado, D1 local sintética, pruebas integradas y permisos mínimos, sin secretos ni despliegue productivo.
- [ ] 3.2 Añadir despliegue Worker solo manual y con GitHub Environment protegido; limitar el token Cloudflare, bindings y ruta a `multiplo.silverman.pro/api/metrics` y no modificar hosts vecinos.
- [ ] 3.3 Ejecutar migraciones productivas solo en etapa explícita separada con backup verificado, comprobación posterior y recuperación documentada; no habilitar telemetría ni billing por push.

## 4. Informe mensual reproducible

- [x] 4.1 Crear consultas administrativas `SELECT` para D1 y una entrada documentada para las métricas de Traffic Analytics filtradas al host; no crear endpoint HTTP de lectura.
- [x] 4.2 Generar CSV y Markdown para mes UTC con fórmulas, denominadores, fechas de extracción, periodos parciales, costos, salud y límites de calidad/falsificabilidad.
- [x] 4.3 Suprimir celdas con menos de 10 eventos sin atribuir anonimato; producir ejemplo completo con fixtures sintéticos y comprobar periodos sin datos.

## 5. Privacidad, integración y evidencia final

- [x] 5.1 Documentar gates de privacidad infantil y operación, metadatos Cloudflare, accesos, retención, supresión, habilitación, apagado, cuotas y rollback.
- [ ] 5.2 Probar en PR los flujos Worker/D1 y cola cliente en entorno aislado; verificar duplicados, fallos/offline, límites, recarga, dos pestañas y que el juego continúa sin telemetría.
- [ ] 5.3 Verificar artefacto Pages desplegable y la separación de workflows con evidencia contra SHA inmutable; mantener ingestión y migraciones productivas apagadas mientras falten aprobaciones.
- [x] 5.4 Actualizar README, AGENTS, arquitectura, decisiones, roadmap y trazabilidad al comportamiento y operación realmente implementados, sin borrar registros históricos.
