## Por qué

El Issue #44 entregó el Worker/D1 agregado y la cola del cliente, pero la recolección productiva quedó apagada porque Cloudflare Free no permite definir la regla WAF exacta de host y ruta que se había exigido. El operador ya autorizó las métricas agregadas descritas y aceptó el procesamiento de metadatos de red de Cloudflare y el rate limit aproximado del Worker; corresponde habilitar la capacidad desplegada sin servicios pagos ni reglas amplias.

## Qué cambia

- Se reemplaza la condición de activación basada en un WAF exacto por el binding de rate limiting del Worker, ya implementado para la ruta, con límite aproximado de 120 solicitudes por minuto por IP.
- Se documenta que este límite y los reintentos agotados pueden causar subregistro; los informes describen solo eventos agregados aceptados.
- Se habilita primero el Worker de producción, se verifica y después se activa la cola del cliente y se publica Pages.

## Capabilities

### Capacidades nuevas

Ninguna.

### Capacidades modificadas

- `metrics-integration-operations`: permite activar con el rate limiter del Worker limitado a la ruta cuando no exista una regla WAF exacta; mantiene prohibidas las reglas amplias y los servicios pagos.
- `anonymous-metrics-ingestion`: registra el riesgo aceptado del límite aproximado y exige que los rechazos no bloqueen el juego.

## Impacto

Issue #44; `metrics/src/index.js`; `scripts/create-metrics-production-config.mjs`; `js/app.js`; `metrics/OPERATIONS.md`; workflow protegido del Worker y despliegue de Pages. No cambian el esquema, el payload, el endpoint ni las dependencias.
