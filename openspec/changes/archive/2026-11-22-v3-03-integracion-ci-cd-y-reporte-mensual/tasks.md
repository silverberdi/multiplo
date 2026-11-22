## 1. Cliente: cola agregada y no bloqueante

- [x] 1.1 Reusar solo los deltas calculados por #42; mantener la opción de envío apagada y no crear ni acumular lotes antes de la autorización explícita.
- [x] 1.2 Implementar una outbox versionada separada del progreso/historial con identidad estable de cierre y `batchId` UUID v4, persistencia que tolere dos pestañas/recargas y límites de 100 lotes, 7 días y 3 reintentos.
- [x] 1.3 Reintentar solo ante eventos normales con backoff acotado; quitar lotes solo ante confirmación válida y descartar vencidos/agota-intentos sin alterar UX, audio, historial ni progreso.

## 2. GitHub Pages: artefacto allowlisted

- [x] 2.1 Construir el artefacto de Pages desde allowlist del frontend y verificar manifest, iconos, CNAME, rutas e inventario de assets Fola necesarios.
- [x] 2.2 Cambiar filtros de `deploy.yaml` para que solo cambios frontend publiquen Pages y confirmar que `metrics/`, SQL, tests, docs, OpenSpec, `.github/`, `.minime/`, dependencias y secretos quedan excluidos.

## 3. Worker y migraciones: CI separado y producción protegida

- [x] 3.1 Añadir workflow de PR del Worker con Wrangler fijado, D1 local sintética, pruebas integradas y permisos mínimos, sin secretos ni despliegue productivo.
- [x] 3.2 Añadir despliegue Worker solo manual y con GitHub Environment protegido; limitar el token Cloudflare, bindings y ruta a `multiplo.silverman.pro/api/metrics` y no modificar hosts vecinos. Evidencia productiva: Actions run `45057809920`, SHA `257d1a3fa6917680524b6158f898838f1ecb5858`; Worker version `17d92540-9e7f-4261-a7da-f89375e5830f`, ruta y binding D1 verificados, ingesta `false`.
- [x] 3.3 Mantener migraciones productivas en etapa explícita separada: exportar y verificar backup, cifrarlo antes de conservarlo, aplicar migración solo tras preservarlo, comprobar el esquema y ofrecer restauración manual a D1 vacía de reemplazo; no habilitar telemetría ni billing por push. Evidencia productiva: Actions run `45057718618`, mismo SHA; backup cifrado autenticado como artifact `14768002596`; aplicación y consulta del esquema confirmadas. La ingesta y billing permanecen apagados.

## 4. Informe mensual reproducible

- [x] 4.1 Crear consultas administrativas `SELECT` para D1 y una entrada documentada para las métricas de Traffic Analytics filtradas al host; no crear endpoint HTTP de lectura.
- [x] 4.2 Generar CSV y Markdown para mes UTC con fórmulas, denominadores, fechas de extracción, periodos parciales, costos, salud y límites de calidad/falsificabilidad.
- [x] 4.3 Suprimir celdas con menos de 10 eventos sin atribuir anonimato; producir ejemplo completo con fixtures sintéticos y comprobar periodos sin datos.

## 5. Privacidad, integración y evidencia final

- [x] 5.1 Documentar gates de privacidad infantil y operación, metadatos Cloudflare, accesos, retención, supresión, habilitación, apagado, cuotas y rollback.
- [x] 5.2 Probar en PR los flujos Worker/D1 y cola cliente en entorno aislado; verificar duplicados, fallos/offline, límites, recarga, dos pestañas y que el juego continúa sin telemetría.
- [x] 5.3 Verificar artefacto Pages desplegado y la separación de workflows contra SHA inmutable; la migración se ejecutó solo mediante workflow explícito protegido y con respaldo cifrado previo. Mantener la transmisión del cliente y la ingesta Worker apagadas hasta completar los gates de privacidad/operación.
- [x] 5.4 Actualizar README, AGENTS, arquitectura, decisiones, roadmap y trazabilidad al comportamiento y operación realmente implementados, sin borrar registros históricos.
