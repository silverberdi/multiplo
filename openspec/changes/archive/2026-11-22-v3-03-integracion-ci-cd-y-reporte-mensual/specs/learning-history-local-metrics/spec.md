## MODIFIED Requirements

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
