## Contexto

El Issue #44 se reabrió para su paso final de activación. D1 y la ruta exacta del Worker están desplegados; el generador de configuración productiva fija `METRICS_INGEST_ENABLED` en false y el navegador fija `METRICS_TRANSMISSION_ENABLED` en false. El binding de rate limiting existente permite aproximadamente 120 solicitudes por minuto por IP. Cloudflare Free no ofrece la regla WAF separada para host y ruta.

## Objetivos / No objetivos

**Objetivos:** activar el flujo agregado ya construido bajo autorización explícita, conservar el aislamiento de ruta y evitar que el cliente envíe mientras el Worker esté apagado.

**No objetivos:** campos de eventos nuevos, identidad, tableros, facturación, regla WAF amplia, cambio del límite de 120 por minuto o infraestructura de monitoreo propia.

## Decisiones

- Se acepta el binding existente de rate limiting del Worker como control contra abuso. Solo se ejecuta después de validar ruta, host, método y origen; no se añade una regla WAF más amplia. Se conserva el control por ruta disponible sin costo adicional.
- El límite y la política de reintentos no cambian. El límite es aproximado y los eventos rechazados pueden perderse al agotarse los tres intentos de la cola. Los informes describen los conteos aceptados y pueden subcontar; el operador acepta esta limitación para el piloto.
- Despliegue secuencial: primero habilitar y desplegar el Worker con el cliente apagado; verificar su salud y una aceptación controlada; después activar el envío del cliente y desplegar Pages con el workflow habitual.
- Para revertir, apagar primero el envío del cliente y luego la ingesta del Worker mediante su workflow protegido. El historial local permanece intacto.

## Riesgos / compensaciones

- [El límite aproximado por ubicación puede rechazar ráfagas y subcontar] → El juego no se bloquea; revisar respuestas 429 en las métricas del Worker y reconsiderar el límite si el tráfico real demuestra pérdida.
- [Se invierte el orden de activación] → No habilitar el cliente hasta que el despliegue y la comprobación del endpoint del Worker pasen.
- [Falla la cuota del proveedor o D1] → El endpoint falla cerrado; no se agrega facturación ni fallback a Pages.
