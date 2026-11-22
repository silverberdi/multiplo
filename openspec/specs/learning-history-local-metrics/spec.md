# learning-history-local-metrics Specification

## Purpose

Conserva en el navegador un historial educativo acotado y obtiene métricas agregadas reproducibles de la actividad concluida, sin identificar al niño ni transmitir datos. La capacidad observa el juego v1.2 sin cambiar sus reglas, interfaz o progreso.

## Requirements

### Requirement: Registra actividad educativa concluida sin alterar el juego

El sistema SHALL registrar localmente las sesiones de práctica, rondas iniciadas/completadas/abandonadas y preguntas evaluables resueltas. Cada pregunta SHALL conservar tabla y par dirigidos `a×b`, origen actual/repaso, resultado inmutable del primer intento, número de intentos, uso de pista, tiempo activo confiable y fecha UTC del evento. Una pregunta SHALL registrarse una sola vez al resolverse; una ronda SHALL contarse completada solo cuando sus cuatro preguntas estén resueltas y `advanceRound()` confirme el cierre. Los resultados de repaso SHALL poder distinguirse de los de la tabla actual.

#### Scenario: Conserva el primer intento después de corregir
- **GIVEN** una pregunta recibe una respuesta incorrecta y luego se resuelve correctamente
- **WHEN** se cierra la actividad
- **THEN** el historial registra una pregunta, un primer intento incorrecto, el total real de intentos y el uso de pista, sin convertir la corrección en acierto inicial

#### Scenario: Cierra una ronda una sola vez
- **GIVEN** las cuatro preguntas de una ronda fueron resueltas
- **WHEN** se ejecuta más de una vez el cierre o se vuelve a renderizar el resultado
- **THEN** la ronda y sus cuatro preguntas aparecen una sola vez en el historial

#### Scenario: No cuenta preguntas sin resolver
- **GIVEN** una pregunta está abierta y la ronda aún no terminó
- **WHEN** se registra o agrega la actividad
- **THEN** la pregunta no se cuenta como respondida hasta que se resuelva

#### Scenario: Separa el repaso de la tabla actual
- **GIVEN** una ronda contiene preguntas de la tabla actual y una pregunta de repaso
- **WHEN** el sistema registra y agrega sus resultados
- **THEN** cada pregunta conserva su origen y el par dirigido real `a×b`; el repaso no se atribuye a la tabla actual por conveniencia

### Requirement: Delimita sesiones, abandonos e interrupciones

Una sesión SHALL comenzar cuando inicia una actividad real del juego, no al cargar la página, y SHALL poder incluir varias rondas consecutivas. Repetir o avanzar a otra ronda SHALL mantener la sesión abierta; volver explícitamente a Inicio SHALL cerrarla. Volver explícitamente a Inicio antes de resolver la ronda SHALL marcarla como abandonada, nunca completada. Una recarga o cierre inesperado con estado activo SHALL marcar la sesión/ronda como interrumpida al siguiente inicio si existe evidencia guardada, sin inventar hora de cierre ni clasificarla como abandono explícito.

#### Scenario: La carga inicial no crea una sesión
- **GIVEN** el jugador abre la página sin iniciar una actividad
- **WHEN** se carga Inicio
- **THEN** no se crea una sesión ni se registra tiempo de práctica

#### Scenario: Varias rondas forman una sesión
- **GIVEN** el jugador inicia una ronda y después la repite o avanza a otra
- **WHEN** completa ambas sin volver a Inicio
- **THEN** el historial conserva una sesión con dos rondas concluidas

#### Scenario: El retorno explícito abandona una ronda incompleta
- **GIVEN** una ronda tiene preguntas pendientes
- **WHEN** el jugador vuelve explícitamente a Inicio
- **THEN** la ronda se cuenta como iniciada y abandonada, no como completada, y la sesión se cierra

#### Scenario: Una interrupción no se convierte en abandono
- **GIVEN** hay una sesión o ronda activa con evidencia local suficiente
- **WHEN** la página se recarga o se cierra inesperadamente y vuelve a abrirse
- **THEN** el sistema marca la actividad anterior como interrumpida sin inventar hora de fin ni incrementar el conteo de abandonos explícitos

### Requirement: Mide tiempo activo con reloj monotónico

El sistema SHALL medir duración activa con un reloj monotónico y pausar la medición mientras el documento esté oculto. SHALL medir tiempo de práctica y tiempo de resolución solo en los periodos en que la actividad correspondiente está visible y activa. SHALL conservar por separado la fecha/hora UTC necesaria para asignar eventos a periodos, sin usar el reloj de pared para calcular duración.

#### Scenario: La pestaña oculta pausa el tiempo
- **GIVEN** hay una actividad visible en curso
- **WHEN** el documento permanece oculto durante cinco minutos
- **THEN** ese periodo oculto no se suma al tiempo de práctica ni al tiempo de resolución

#### Scenario: La duración usa tiempo monotónico
- **GIVEN** se registra el inicio y fin de un periodo activo
- **WHEN** se calcula su duración
- **THEN** la duración proviene del reloj monotónico y los cambios del reloj de pared solo pueden afectar la fecha UTC del evento

### Requirement: Calcula métricas y deltas agregados sin identificar jugadores

El sistema SHALL calcular, mediante funciones puras, precisión de primer intento, finalización de rondas, preguntas con pista, reintentos adicionales, tiempo activo y resultados por tabla y par dirigido. Un denominador vacío SHALL producir `null`/«Sin datos», nunca un porcentaje cero ficticio. Los datos actuales y de repaso SHALL poder agregarse por separado. El sistema SHALL producir deltas agregados por fecha UTC y tabla, con desgloses por par `a×b` cuando correspondan; cada evento SHALL atribuirse una sola vez a su fecha de ocurrencia, incluso si la sesión abarca más de un día. Los datos no SHALL incluir nombre, edad, escuela, correo, IP, ubicación, identificador persistente de niño/dispositivo, ni métricas de usuarios únicos. Los deltas podrán transmitirse únicamente al endpoint de V3-02 cuando la opción de envío esté habilitada expresamente por una autorización de privacidad y operación documentada; por defecto estará deshabilitada. La transmisión SHALL ser independiente de la persistencia local y no SHALL bloquear el juego, el audio ni el progreso.

#### Scenario: Calcula métricas de una pregunta corregida
- **GIVEN** una pregunta tuvo primer intento incorrecto, tres intentos totales y una pista
- **WHEN** se generan las métricas
- **THEN** la precisión inicial suma cero aciertos, los reintentos adicionales suman dos y una pregunta cuenta con pista

#### Scenario: Denominador vacío
- **GIVEN** no hay preguntas resueltas en el periodo
- **WHEN** se calcula la precisión
- **THEN** el resultado es `null`/«Sin datos», no `0%`

#### Scenario: Atribución UTC al cruzar de día
- **GIVEN** una sesión contiene preguntas resueltas en dos fechas UTC distintas
- **WHEN** se producen sus deltas
- **THEN** cada pregunta y sus contadores se atribuyen una vez a la fecha UTC de su resolución, sin duplicar la sesión ni mover el repaso a otra tabla

#### Scenario: El agregado no permite métricas individuales
- **GIVEN** se genera un resumen local para una fecha y tabla
- **WHEN** se inspeccionan sus datos
- **THEN** contiene contadores y agregados por operación, pero no un perfil, identificador o historial individual exportable

#### Scenario: Envío apagado no crea cola transmisible
- **GIVEN** la opción de telemetría no ha recibido autorización explícita
- **WHEN** termina una ronda
- **THEN** los agregados permanecen locales y no se crea ni conserva un lote para transmisión posterior

#### Scenario: Envío autorizado conserva juego y progreso independientes
- **GIVEN** privacidad y operación aprobaron la transmisión y la opción está habilitada
- **WHEN** se cierra una ronda
- **THEN** se encola como máximo un lote agregado con UUID v4 estable y fecha UTC, sin datos personales, y cualquier fallo de transmisión deja intactos el progreso, audio y navegación

#### Scenario: Reintento usa el mismo lote sin sondeo continuo
- **GIVEN** un lote elegible no recibió confirmación válida del endpoint de V3-02
- **WHEN** ocurre un evento normal de ejecución que permite reintentar
- **THEN** el cliente reusa el mismo `batchId`, aplica backoff acotado, limita la cola a 100 lotes/7 días y a 3 intentos por lote, sin timer permanente ni polling continuo

#### Scenario: Lote vencido o agotado
- **GIVEN** un lote expiró o agotó sus tres intentos
- **WHEN** se procesa la cola
- **THEN** se descarta conforme a la política documentada sin alterar el historial ni el progreso y sin crear un lote nuevo que duplique sus eventos

### Requirement: Persiste y limita el historial de manera independiente y tolerante

El historial SHALL usar la clave local versionada `multiplo_learning_history_v1` y SHALL permanecer separado de `multiplo_progression_v1`; cargar, migrar, compactar o descartar historial SHALL preservar los niveles, dominio, sonido y fallos válidos de v1.2. El detalle de cada evento educativo SHALL expirar como máximo 90 días después de la fecha de ese evento, sin usar el inicio de la sesión como sustituto. La regla aplica también a sesiones activas o largas: las preguntas resueltas vencen según `occurredAtUtc`; los datos de apertura y duración acumulada de una sesión/ronda vencen según su respectiva fecha de inicio; y los datos de cierre y resumen de una ronda vencen según su fecha de cierre; los eventos recientes dentro de una sesión antigua se conservan hasta cumplir su propio plazo. Una sesión activa puede conservar únicamente un sobre operativo acotado —estado activo, ronda actual y marcadores acotados de preguntas ya agregadas para evitar duplicados—, sin detalle educativo vencido ni fechas/duraciones antiguas de sesión o ronda. Los agregados diarios se conservan 90 días y luego se compactan en los acumulados permitidos, sujetos a límites documentados de bytes/registros. La compactación SHALL preservar contadores válidos y no duplicarlos. Ante JSON corrupto, versión desconocida, `SecurityError`, almacenamiento bloqueado o `QuotaExceededError`, el sistema SHALL continuar el juego y preservar el progreso de reglas; el historial podrá continuar solo en memoria si no puede persistirse.

#### Scenario: La migración de historial no cambia el progreso
- **GIVEN** hay progreso v1.2 válido y no existe historial local
- **WHEN** se inicia la capacidad de historial
- **THEN** se crea o inicializa su clave independiente y el progreso de niveles, dominio, sonido y errores permanece idéntico

#### Scenario: Retiene y compacta detalle de manera acotada
- **GIVEN** el detalle supera 90 días o los límites documentados de bytes/registros
- **WHEN** se compacta el historial
- **THEN** se elimina detalle vencido o más antiguo, se conservan los acumulados permitidos y el tamaño total no supera los límites definidos

#### Scenario: Expira detalle por evento dentro de una sesión larga
- **GIVEN** una sesión activa o recién cerrada comenzó hace más de 90 días y contiene preguntas o rondas de distintas fechas
- **WHEN** se compacta el historial
- **THEN** se eliminan los detalles de preguntas y rondas cuyo propio evento superó 90 días, se conservan los detalles recientes hasta que cumplan su plazo, y los contadores ya agregados no se pierden ni se duplican

#### Scenario: Conserva solo el estado mínimo de una sesión activa antigua
- **GIVEN** una sesión permanece activa después de vencer el detalle de una pregunta ya agregada
- **WHEN** se compacta el historial y vuelve a presentarse el callback de esa pregunta
- **THEN** el sistema conserva el estado necesario para continuar la ronda, descarta los datos educativos vencidos y evita agregar la misma respuesta por segunda vez

#### Scenario: Storage corrupto o bloqueado
- **GIVEN** el historial contiene JSON corrupto, una versión desconocida o el almacenamiento arroja un error
- **WHEN** se inicia o continúa una partida
- **THEN** no ocurre una excepción no controlada, el juego y su progresión siguen funcionando y el historial no corrompe `multiplo_progression_v1`

### Requirement: El historial permanece local y no depende de conectividad

El sistema SHALL escribir y consultar este historial exclusivamente en el almacenamiento local del navegador. La captura, persistencia y agregación SHALL funcionar sin conexión de red una vez cargada la aplicación. Este Change SHALL NOT añadir solicitudes, colas, endpoints, servicios de analítica ni transmisión de datos.

#### Scenario: Actividad durante una desconexión
- **GIVEN** la aplicación ya está cargada y el navegador pierde conectividad
- **WHEN** se completa una pregunta o una ronda
- **THEN** el historial local se registra y el juego continúa sin intentar enviar métricas

#### Scenario: No hay transmisión en una partida normal
- **GIVEN** el jugador inicia, completa, abandona o reanuda una actividad
- **WHEN** se registra y agrega su historial
- **THEN** no se envía ninguna solicitud de red con actividad educativa
