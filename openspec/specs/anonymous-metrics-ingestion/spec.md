# anonymous-metrics-ingestion Specification

## Purpose
Recibe lotes de actividad educativa agregada con límites verificables y sin identidad autenticada. La capacidad sirve como integración técnica aislada; por sí sola no habilita el envío desde Múltiplo ni demuestra identidad o aprendizaje.

## Requirements

### Requirement: Exponer solo el endpoint de escritura previsto
El servicio SHALL aceptar únicamente `POST /api/metrics` sin query string en el host de Múltiplo. Las rutas no previstas SHALL responder 404 y los métodos no admitidos en la ruta SHALL responder 405. La ruta de API SHALL fallar cerrada y nunca devolver contenido del origen estático ante errores, cuota agotada o ruta mal configurada. Los demás hosts y rutas del sitio SHALL permanecer fuera de su ámbito.

#### Scenario: Ingesta en ruta prevista
- **WHEN** llega un `POST` al endpoint exacto
- **THEN** el servicio procesa el lote según este contrato y devuelve una respuesta compacta que no refleja el payload

#### Scenario: Ruta, query string o método no previsto
- **WHEN** llega una petición a otra ruta, con query string o con método distinto de `POST`
- **THEN** el servicio devuelve 404 o 405, no consulta D1 ni entrega contenido de Pages

### Requirement: Validar un contrato de lote agregado y acotado
El servicio SHALL aceptar solo JSON UTF-8 con `Content-Type: application/json` y esquema v1 cerrado. Los campos obligatorios SHALL ser `schemaVersion`, `batchId`, `date`, `table`, `roundsStarted`, `roundsCompleted`, `roundsAbandoned`, `questionsAnswered`, `firstAttemptCorrect`, `questionsWithHints`, `additionalAttempts`, `practiceSeconds` y `operations`. `schemaVersion` SHALL ser `1`; `batchId` SHALL tener formato UUID v4 único por lote lógico; `date` SHALL ser una fecha UTC real no futura y dentro de los últimos 100 días, para cubrir los 90 días de agregados locales de #42 más la cola de 7 días definida en #44; `table` SHALL estar entre 1 y 10. Cada entrada de `operations` SHALL contener únicamente `b`, `questionsAnswered` y `firstAttemptCorrect`, con `b` entre 1 y 10 y `table` como el factor dirigido `a`; habrá como máximo 10 valores `b` distintos por lote. El cuerpo SHALL medir como máximo 4 KiB. Cada contador SHALL ser un entero finito entre 0 y 1.000.000 inclusive por lote, seguro para JavaScript; los acumulados en D1 SHALL mantenerse dentro del máximo entero seguro de JavaScript. Los aciertos iniciales y preguntas con pistas no SHALL superar preguntas contestadas, también por operación. El lote SHALL representar deltas por eventos, no snapshots. No se impondrá `roundsCompleted + roundsAbandoned <= roundsStarted` cuando el lote por fecha pueda contener inicios y cierres no comparables. El servidor SHALL rechazar campos extra, datos personales o libres, números fraccionarios, negativos, NaN/Infinity, overflow y relaciones incoherentes sin registrar valores recibidos. El servidor valida el formato del UUID, pero no SHALL afirmar que puede verificar su aleatoriedad ni el origen del lote.

#### Scenario: Lote agregado válido
- **WHEN** llega un lote dentro del esquema y límites definidos
- **THEN** se interpreta como delta UTC por tabla y, cuando haya evidencia, por par dirigido `a×b`; los agregados por tabla y operación permanecen dimensiones separadas

#### Scenario: Rechazo previo a escritura
- **WHEN** el cuerpo excede 4 KiB, no es JSON UTF-8 válido, incluye campos o datos no permitidos, fechas inválidas o contadores fuera de límites
- **THEN** el servicio responde 4xx sin escribir en D1 ni reflejar el payload en respuesta o logs de aplicación

#### Scenario: Repaso atribuido a su tabla real
- **WHEN** el lote incluye resultados de una pregunta de repaso
- **THEN** el agregado por operación conserva su par dirigido real y no atribuye esa pregunta a la tabla actual por conveniencia

### Requirement: Persistir agregados con deduplicación atómica
El servicio SHALL guardar únicamente contadores diarios por tabla, contadores por par dirigido y la clave/tiempos mínimos de deduplicación. La escritura de la clave de lote y todos sus incrementos SHALL ser atómica ante fallos y peticiones concurrentes. Un `batchId` ya aceptado SHALL producir cero incrementos dentro de la ventana finita documentada de 30 días; una repetición posterior a su expiración no SHALL presentarse como garantizada exactamente una vez. Esta ventana SHALL superar la cola/reintentos máximos de 7 días especificados en #44. Los lotes nuevos SHALL sumar contadores existentes sin sustituirlos.

#### Scenario: Acumulación de lote nuevo
- **GIVEN** hay contadores agregados para una fecha y dimensión
- **WHEN** se acepta un lote nuevo con otro `batchId` para esa dimensión
- **THEN** sus deltas se suman una sola vez a los contadores existentes

#### Scenario: Reenvío y concurrencia
- **GIVEN** un lote fue aceptado o dos peticiones simultáneas presentan el mismo `batchId`
- **WHEN** D1 procesa las peticiones
- **THEN** exactamente una petición incrementa los agregados y las demás no producen cambios

#### Scenario: Fallo durante persistencia
- **GIVEN** falla cualquiera de las escrituras que componen el lote
- **WHEN** se procesa la petición
- **THEN** no queda confirmación ni persistencia parcial del lote

### Requirement: Restringir lectura, secretos y afirmaciones de autenticidad
El servicio SHALL ser de solo escritura pública: no SHALL exponer lectura, exportación, administración, consulta SQL ni secretos por HTTP. D1 SHALL ser accesible únicamente mediante el binding del Worker. Los secretos operativos SHALL permanecer fuera de Pages y del código cliente, con permisos mínimos. CORS y `Origin` podrán restringir navegador esperado pero no SHALL considerarse autenticación. Las cifras SHALL documentarse como agregados anónimos de procedencia no verificable, susceptibles de falsificación y no probatorios de identidad única ni de efecto causal de aprendizaje.

#### Scenario: Intento de lectura o administración
- **WHEN** se solicita un endpoint GET, administración, exportación o estado que revele datos
- **THEN** no se leen ni revelan estadísticas y no se exponen secretos ni información interna

#### Scenario: Origen o lote falsificado
- **WHEN** el cliente envía un `Origin`, UUID o lote sintácticamente válido
- **THEN** el servicio no lo interpreta como prueba de identidad, autenticidad del jugador ni evidencia de aprendizaje

### Requirement: Mantener la ingesta apagada y limitada por defecto

El servicio SHALL iniciar con `METRICS_INGEST_ENABLED=false`. Cuando esté desactivado SHALL rechazar controladamente toda petición válida y efectuar cero lecturas/escrituras de métricas. Cuando esté habilitado tras autorización explícita, SHALL aplicar límites de tamaño y trabajo por solicitud y el binding de rate limiting del Worker configurado para el endpoint. El binding actual limita aproximadamente 120 solicitudes por minuto por IP y puede permitir excesos durante sincronización; su disponibilidad y respuestas SHALL documentarse. Una regla WAF perimetral exacta puede añadirse cuando el plan lo permita, pero no SHALL ampliarse una regla a otros hosts ni será requisito para la activación autorizada. El agotamiento de cuota o fallo de D1 SHALL fallar cerrado; el juego SHALL seguir funcionando de forma independiente.

#### Scenario: Kill switch apagado
- **GIVEN** `METRICS_INGEST_ENABLED=false`
- **WHEN** se recibe un lote válido
- **THEN** se rechaza de forma controlada y D1 permanece sin cambios

#### Scenario: Rate limit aproximado
- **GIVEN** el binding está configurado a 120 solicitudes por minuto por IP
- **WHEN** el límite local de Cloudflare rechaza una solicitud
- **THEN** el servicio responde 429 antes de leer o escribir D1, y los reportes no presentan los eventos rechazados como datos recibidos

#### Scenario: Cuota, D1 o protección perimetral no disponible
- **WHEN** se agota una cuota, falla D1 o la ruta/binding de rate limiting requerido no está disponible
- **THEN** la ingesta no confirma una escritura no realizada, no hace fallback a Pages, no amplía el impacto a otros hosts y no afecta el juego

### Requirement: Retener solo los agregados y registros operativos mínimos
El servicio SHALL conservar los contadores diarios por hasta 24 meses y SHALL expirar las claves de lote tras la ventana finita elegida, que no será menor que la retención máxima de reintentos que defina #44. La purga de claves expiradas SHALL requerir operación de mantenimiento autenticada y no expuesta por HTTP. No se SHALL introducir cron, systemd ni scheduler para esta versión.

#### Scenario: Retención de agregados
- **WHEN** un agregado diario cumple 24 meses
- **THEN** deja de estar disponible según la política documentada de retención

#### Scenario: Purga de deduplicación
- **WHEN** vence la ventana de una clave procesada
- **THEN** solo una operación de mantenimiento autenticada puede purgarla; no existe endpoint público de purga

### Requirement: Aplicar límites de operación y proteger servicios vecinos
La solución SHALL usar recursos Workers Free y D1 Free sin habilitar facturación por consumo ni añadir servicios pagos. SHALL documentar límites, comportamiento ante cuotas y controles perimetrales realmente disponibles. Toda ruta, regla y configuración SHALL quedar limitada al endpoint de Múltiplo; SHALL evitar alterar `silverman.pro`, `mini-me.silverman.pro` o los recursos estáticos de Pages. La protección perimetral SHALL quedar activa antes de cualquier activación autorizada de ingesta.

#### Scenario: Aislamiento de la ruta
- **WHEN** se verifica una regla o enrutamiento de API
- **THEN** solo coincide con `multiplo.silverman.pro/api/metrics` y no intercepta archivos del juego ni servicios vecinos

#### Scenario: Plan o límites no compatibles
- **WHEN** los límites disponibles del plan no satisfacen el aislamiento requerido sin costo adicional
- **THEN** la propuesta de activación permanece bloqueada y documenta la capacidad faltante sin fingir protección ni habilitar cobros
