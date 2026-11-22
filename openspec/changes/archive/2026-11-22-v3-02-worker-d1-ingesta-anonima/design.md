## Context

Ver [proposal.md](proposal.md) para el motivo y `specs/anonymous-metrics-ingestion/spec.md` para el contrato observable. #42 ya produce datos locales agregables; el cliente público no tiene identidad confiable. El issue separa la integración y activación del cliente (#44), exige Worker+D1 aislados, modo apagado y ninguna activación real de datos antes de revisar privacidad.

La documentación oficial vigente de Cloudflare define `D1Database.batch()` como una secuencia transaccional: las sentencias se ejecutan secuencialmente y un fallo revierte el batch. También indica que el rate limiting de Free permite una regla, pero sus campos de expresión disponibles se limitan a `Path`/`Verified Bot`, no `Host`; esto puede impedir expresar la restricción exacta de subdominio solicitada. Fuentes: [D1 Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/) y [WAF rate limiting availability](https://developers.cloudflare.com/waf/rate-limiting-rules/).

## Goals / Non-Goals

**Goals:**
- Entregar una recepción técnica pequeña, acotada y verificable con fixtures sintéticos y D1 local.
- Hacer deduplicación e incrementos atómicos bajo concurrencia, sin confiar en una secuencia check-then-write fuera de transacción.
- Mantener límites de seguridad y privacidad auditablemente apagados para datos reales.

**Non-Goals:**
- Conectar el navegador, enviar datos reales, activar el servicio, desplegar producción o cambiar Pages (V3-03 #44).
- Probar identidad, usuarios únicos o aprendizaje causal; añadir autenticación infantil, OAuth/JWT, Turnstile obligatorio, panel o lecturas públicas.
- Añadir proveedores pagos, PostgreSQL, Docker, scheduler o servicios nuevos al juego.

## Decisions

### 1. Worker separado del frontend y una sola ruta de escritura

Crear el Worker bajo `metrics/` con configuración Wrangler y una ruta exacta `POST /api/metrics`. En pruebas locales, enlazar solo una D1 de prueba; reservar un binding y base distintos para cualquier configuración de producción, con ingesta desactivada. El Worker no debe compartir el flujo de publicación de Pages ni cambiar el artefacto que el workflow actual publica. Mantener el endpoint enrutado a su handler; no usar fallback de origen cuando la ruta no corresponda o el Worker falle.

**Alternativa considerada:** incorporar el handler al frontend estático o publicar el directorio de métricas con Pages. Se descarta porque el cliente no debe tener acceso directo a D1 y el issue exige aislar el servicio y evitar exponer sus fuentes/configuración como contenido del sitio.

### 2. Validar y limitar antes de cualquier consulta

Leer el cuerpo con límite estricto de 4 KiB, validar UTF-8 y JSON, permitir solo las propiedades del esquema v1 y verificar fecha UTC, UUID v4, rangos, tipos y coherencia antes de preparar sentencias. El contrato distingue deltas por eventos concluidos de snapshots y no suma los buckets por tabla con los de operación. Fijar una antigüedad aceptada de 100 días y ninguna fecha futura: cubre la retención de 90 días de agregados calendario de #42 más el máximo de 7 días de cola local establecido por #44, con margen para el borde UTC; no autentica la fecha declarada. Cada contador del lote está acotado a 1.000.000 y los acumulados a `Number.MAX_SAFE_INTEGER`; las restricciones SQL rechazan overflow al sumar.

**Alternativa considerada:** aceptar JSON extensible y filtrar campos conocidos, o dejar que la base convierta valores. Se descarta porque permitiría datos no previstos y hace ambiguo qué información se captura.

### 3. D1: lotes transaccionales con una sola inserción efectiva

Usar tablas mínimas `daily_metrics` (`date`,`table_number`), `daily_operation_metrics` (`date`,`a`,`b`) y `processed_batches` (`batch_id`, timestamps de recepción/expiración para deduplicación). No guardar payload, IP ni user-agent. Preparar las consultas con parámetros.

En una llamada `DB.batch()` transaccional: insertar primero `batch_id` con conflicto ignorado; hacer que los UPSERT posteriores dependan de que la inserción anterior haya producido un cambio, incluidos todos los pares de operación. D1 procesa el batch en secuencia y revierte el conjunto si falla una sentencia; las pruebas deben demostrar que una carrera con el mismo ID incrementa exactamente una vez y que cualquier error no persiste partes. Usar `batchId` como PK/llave de idempotencia durante una ventana finita de 30 días, superior a la cola/reintentos máximos de 7 días fijados en #44; pasada la expiración, documentar que un reenvío antiguo podría contarse de nuevo. Retener agregados por 24 meses.

La purga se ejecutará como operación de mantenimiento autenticada mediante acceso operativo a D1 (por ejemplo, Wrangler autenticado), no como ruta HTTP ni tarea programada. No habilitar un job permanente.

**Alternativas consideradas:** tres operaciones check-then-write separadas, guardar el lote completo para auditar o prometer exactamente-una-vez sin límite. Se descartan por carreras, recolección de datos innecesaria y garantías falsas.

### 4. Controles perimetrales sin ampliar costo ni impacto

Documentar y, cuando se pueda configurar con alcance exacto, usar rate limiting/WAF de Cloudflare antes del Worker. La documentación Free permite una regla de rate limiting pero solo ofrece `Path`/`Verified Bot` en la expresión; no ofrece `Host`. No aplicar una regla que coincida solo por ruta en una zona compartida: comprobar si el host tiene zona separada y, si no puede aislarse, dejar registrado el bloqueo, mantener apagada la ingesta y no cambiar a un plan pago.

Dentro del Worker usar el binding nativo de Rate Limiting como segunda capa, con límite aproximado de 120 solicitudes por minuto y clave efímera por IP de origen. Las decisiones se distribuyen por ubicación Cloudflare y pueden excederse por consistencia eventual; no constituyen cuota global estricta ni bloquean DDoS distribuido. No guardar ni registrar esa IP. La elección alta de umbral y ventana corta reduce el riesgo de bloquear escuelas que comparten NAT. Si el binding no está disponible en el plan/cuenta sin costo, fallar cerrado y registrar el bloqueo, sin sustituirlo por un Map local ineficaz.

La tasa concreta debe ser prudente con tráfico escolar compartido por NAT; el binding usa 120 solicitudes/minuto por IP y ubicación y responde 429 al superar el umbral. No prometer cobertura frente a ataques distribuidos ni gasto ilimitado. La cuota de Workers/D1 no sustituye un límite de tasa ni se excede deliberadamente para probarla.

**Alternativa considerada:** hacer rate limit por una regla amplia de ruta o contratar funciones/servicios de pago para que la checklist aparezca completa. Se descarta por riesgo de afectar servicios hermanos y por el límite de costo de #43.

### 5. Separar capacidad técnica y autorización de telemetría

Mantener `METRICS_INGEST_ENABLED=false` como valor predeterminado; en apagado, responder rechazo controlado antes de acceder a D1. El cliente permanece sin `fetch`, cola o configuración de envío. Los secretos de Cloudflare solo se usan para operaciones de infraestructura con permisos mínimos y nunca se incluyen en artefactos Pages. La excepción a D-017/D-020 es exclusivamente este receptor técnico inactivo para datos reales; no cambia la regla del juego ni autoriza transmisión. Actualizar la decisión y el contrato de privacidad con: falsificabilidad, retención, metadatos/logs Cloudflare, acceso, supresión de celdas pequeñas y evaluación de datos de menores pendiente antes de #44.

**Alternativa considerada:** confiar en UUID, CORS, `Origin` o una firma guardada en el cliente como autenticación; se descarta porque el cliente público puede falsificarlos.

### 6. Pruebas aisladas y evidencia verificable

Probar endpoint y persistencia en el runtime Worker local con D1 local real y fixtures sintéticos, no con producción. Cubrir validez/acumulación, reenvío, concurrencia, rollback, validación hostil, inyección SQL, no-lectura, kill switch, límites y aislamiento de ruta/hosts. El harness deberá ejecutar la migración real sobre esa base local y consultar los resultados persistidos; stubs que no ejerciten D1 no demuestran atomicidad.

**Alternativa considerada:** afirmar E2E con mocks de DB o desplegar primero a producción. Se descarta porque no prueba transacciones y contradice el límite de activación de #43.

## Risks / Trade-offs

- **La tasa del plan Free quizá no pueda restringirse por host en la zona actual** → comprobar el alcance exacto antes de configurar; no instalar una regla amplia, no pagar ni habilitar ingesta si no satisface el aislamiento.
- **El workflow Pages actual publica la raíz completa, incluyendo `metrics/`** → este Change no cambia Pages ni se fusiona/despliega hasta que #44 aplique una allowlist del artefacto; de lo contrario Worker, SQL y documentación aparecerían como archivos estáticos.
- **Las métricas anónimas pueden ser inventadas y reflejar actividad de un mismo cliente** → denominarlas estadísticas operativas de procedencia no verificada; no atribuirlas a niños únicos ni a resultados de aprendizaje.
- **Una ventana finita no evita replay después de expirar** → documentar el límite; la ventana de 30 días supera los 7 días de cola/reintentos de #44.
- **Reglas WAF por IP pueden afectar escuelas/NAT compartidos** → umbral conservador, mitigación breve disponible en Free y prueba/configuración limitada al host/ruta cuando sea posible.
- **D1 puede fallar o agotar cuota** → rollback transaccional y respuesta de fallo cerrada; la aplicación de juego no depende del endpoint.
- **El plan o límites gratuitos pueden cambiar** → verificar cuotas actuales antes de entregar la configuración y documentar límites reales, sin activar facturación por consumo. Al 22-11-2026 se documentan Workers Free: 100.000 requests/día y CPU 10 ms/invocación; D1 Free: 5 millones de filas leídas/día, 100.000 filas escritas/día, 500 MB por base y 5 GB por cuenta.

## Migration Plan

1. Crear Worker, migración y binding de D1 de prueba; aplicar y validar el esquema con datos sintéticos.
2. Ejecutar las pruebas locales de D1/Worker y comprobar aislamiento de rutas. Mantener el endpoint desligado de Pages y con `METRICS_INGEST_ENABLED=false`.
3. Documentar cómo repetir la migración, restaurar/eliminar solo las tablas de prueba y purgar claves vencidas con acceso autenticado. No modificar D1 productiva ni desplegar Worker a producción en este Change.
4. Cualquier despliegue, unión al host productivo o habilitación de datos reales corresponde a #44 y a su gate explícito de privacidad y operación.

## Open Questions

Ninguna. La regla perimetral queda resuelta en fail-closed: si no puede aislarse al host/ruta previstos con las capacidades disponibles, no se configura una regla amplia y la activación permanece bloqueada.
