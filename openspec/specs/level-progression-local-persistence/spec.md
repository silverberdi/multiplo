# level-progression-local-persistence Specification

## Purpose

Define la progresión infantil entre las cuatro tablas del MVP y conserva de forma local los niveles abiertos y la preferencia de sonido, sin cuentas, sincronización ni servicios remotos.

## Requirements

### Requirement: Configura los cuatro niveles del MVP

El sistema SHALL ofrecer exactamente diez tablas disponibles progresivamente, identificadas por `a=1..10`, cada una con `b=1..10`, interpretando `a×b` como `a` grupos de `b`. La tabla 1 SHALL estar disponible para un jugador nuevo; tras la tabla 10 no SHALL existir tabla 11.

#### Scenario: Inicio nuevo
- **GIVEN** no existe progreso válido
- **WHEN** se consulta la disponibilidad
- **THEN** solo la tabla 1 está disponible y las tablas 2–10 están bloqueadas

#### Scenario: Configuración de niveles y factores
- **GIVEN** existen las tablas disponibles de la versión ampliada
- **WHEN** se configura el contenido de cada nivel
- **THEN** corresponden a las tablas 1 a 10, sus factores van del 1 al 10 y `a×b` significa `a` grupos de `b`

#### Scenario: Tabla final
- **GIVEN** la tabla 10 está disponible
- **WHEN** termina una ronda
- **THEN** puede repetirse o practicar tablas disponibles y nunca se ofrece una tabla 11

### Requirement: Abre y desbloquea niveles de forma secuencial

El sistema SHALL abrir inicialmente solo la tabla 1. Para desbloquear la tabla 2, una ronda de tabla 1 con al menos 3 de 4 aciertos iniciales SHALL ser suficiente; para desbloquear cada tabla 3–10, SHALL cumplirse el dominio acumulado de la tabla inmediatamente anterior: al menos 2 de las últimas 3 rondas calificadas con el umbral vigente y al menos 7 factores `b` distintos acertados inicialmente. SHALL conservar abiertas las tablas ya desbloqueadas. El resultado de una ronda y el dominio acumulado SHALL ser indicadores distintos para tablas 2–10: obtener 4/4 estrellas no SHALL implicar por sí solo que la tabla esté completamente dominada ni que la siguiente tabla esté desbloqueada.

#### Scenario: Apertura inicial
- **GIVEN** comienza la progresión sin avance previo
- **WHEN** se consulta la disponibilidad de los niveles
- **THEN** la tabla 1 está abierta inicialmente, las tablas 2–10 están bloqueadas y el desbloqueo es secuencial

#### Scenario: Conserva un nivel abierto después de fallos
- **GIVEN** una tabla ya está abierta
- **WHEN** se producen fallos posteriores en una ronda de ese nivel
- **THEN** la tabla sigue disponible y no se bloquea por esos fallos

#### Scenario: Una ronda perfecta no completa el dominio por sí sola en tablas 2 a 10
- **GIVEN** una ronda de las tablas 2–10 obtiene 4/4 aciertos iniciales, pero faltan rondas válidas o factores `b` distintos
- **WHEN** se muestra el resultado y el progreso
- **THEN** se muestran cuatro estrellas, la siguiente tabla permanece bloqueada y la tabla actual no se presenta como completamente terminada

#### Scenario: Tabla 1 avanza con una ronda suficiente
- **GIVEN** la tabla 1 está abierta y una ronda obtiene al menos 3 de 4 aciertos iniciales
- **WHEN** se cierra la ronda
- **THEN** se desbloquea la tabla 2 sin exigir siete factores ni dos de las últimas tres rondas

### Requirement: Desbloquea con tres aciertos del primer intento

El sistema SHALL desbloquear la tabla 2 cuando una ronda de tabla 1 alcance `>=3/4` aciertos iniciales. Para tablas 2–10, SHALL desbloquear solo la tabla siguiente, sin revocar tablas abiertas, cuando ambas condiciones se cumplan: al menos 2 de las últimas 3 rondas completadas de la tabla actual alcanzan `>=2/3` aciertos iniciales de las tres preguntas de la tabla actual y existen al menos 7 factores `b` distintos acertados inicialmente en esa tabla. Los resultados de repaso no cuentan. El progreso SHALL indicar la regla aplicable, cada condición, su avance actual y lo que falta antes de anunciar el desbloqueo.

#### Scenario: Una ronda no basta
- **GIVEN** no existe evidencia acumulada
- **WHEN** se completa una ronda perfecta
- **THEN** la siguiente tabla permanece bloqueada

#### Scenario: Dominio con dos condiciones
- **GIVEN** hay 7 factores distintos acertados y 2 de las últimas 3 rondas cumplen el mínimo actual
- **WHEN** se cierra la tercera ronda relevante
- **THEN** se desbloquea únicamente la tabla siguiente

#### Scenario: Requisito pendiente visible
- **GIVEN** una ronda obtiene 4/4 estrellas, pero faltan factores distintos o rondas válidas
- **WHEN** el jugador consulta el progreso de la tabla
- **THEN** ve las estrellas de la ronda separadas del conteo de dominio y un mensaje concreto de los requisitos pendientes

#### Scenario: Umbral correcto
- **GIVEN** una tabla disponible tiene una tabla posterior
- **WHEN** se cumplen las condiciones de dominio de la tabla actual
- **THEN** se desbloquea solo la tabla siguiente y se conserva la evidencia de primer intento

#### Scenario: Desbloqueo con cuatro aciertos
- **GIVEN** una ronda de una tabla disponible obtiene el umbral requerido
- **WHEN** se cierra la ronda
- **THEN** se habilita la acción para jugar la tabla siguiente si existe

#### Scenario: Umbral insuficiente con respuestas corregidas
- **GIVEN** la tabla siguiente está bloqueada
- **WHEN** la ronda no alcanza el mínimo de aciertos iniciales aunque haya respuestas corregidas
- **THEN** la tabla siguiente permanece bloqueada y se permite repetir sin lenguaje de fracaso

#### Scenario: No ofrece un nivel posterior inexistente
- **GIVEN** está disponible la tabla 10
- **WHEN** termina una ronda con el umbral requerido
- **THEN** no se ofrece una tabla 11 y se conservan las tablas abiertas

#### Scenario: Repaso independiente
- **GIVEN** se falla una pregunta de repaso y la tabla actual cumple sus condiciones
- **WHEN** se cierra la ronda
- **THEN** puede desbloquearse la siguiente tabla, se conserva el fallo para repaso y no se pierde progreso

### Requirement: Permite reintentos y repetición sin penalización adicional

Cada ronda SHALL conservar como máximo cuatro estrellas, una por pregunta acertada en primer intento, incluyendo repaso. Los reintentos SHALL completar preguntas sin alterar métricas retrospectivas; fallar no SHALL bloquear ni deshacer disponibilidad. Cuando no se desbloquee la siguiente tabla, el cierre SHALL ofrecer solo repetir la tabla actual o volver a niveles, además de explicar el progreso pendiente.

#### Scenario: Estrellas de repaso
- **GIVEN** una ronda tiene tres preguntas actuales y una de repaso
- **WHEN** se aciertan inicialmente dos actuales y el repaso
- **THEN** se muestran tres estrellas y el repaso no se usa para dominio actual

#### Scenario: Reintento después de una respuesta errónea
- **GIVEN** una pregunta recibe una respuesta errónea
- **WHEN** el niño la responde de nuevo correctamente
- **THEN** el reintento no cuenta para el umbral, pero permite terminar la pregunta

#### Scenario: Repetir desde el cierre
- **GIVEN** aparece el resultado de una ronda
- **WHEN** el niño pulsa Repetir
- **THEN** comienza una nueva ronda del mismo nivel sin modificar las estrellas ni los niveles previamente guardados

#### Scenario: Cierre con 3/4 y sin siguiente tabla disponible
- **GIVEN** el niño termina con 3/4 estrellas, la tabla siguiente sigue bloqueada y no existe otra tabla disponible para avanzar
- **WHEN** se muestra el cierre
- **THEN** solo aparecen acciones disponibles, el texto invita a repetir o volver a niveles y no sugiere practicar una tabla inexistente

#### Scenario: Cierre positivo sin umbral
- **GIVEN** el niño termina una ronda con 0, 1 o 2 aciertos de primer intento
- **WHEN** se muestra el resultado
- **THEN** recibe felicitación por participar, puede repetir la ronda y no pierde ningún nivel abierto previamente

#### Scenario: Cierre del último nivel
- **GIVEN** termina el Nivel 4
- **WHEN** se completa una ronda
- **THEN** se puede repetir o ir a niveles anteriores y no se ofrece un inexistente Nivel 5

### Requirement: Persiste el progreso y el sonido solo en el navegador actual

En la primera carga, el sistema SHALL migrar idempotentemente `multiplo_progression_v1` por identidad: legacy 1→tablas 1–2, 2→1–3, 3→1–4 y 4→1–5. Sin legacy válido, solo tabla 1. SHALL preservar `multiplo_sound_enabled`, silencio y entradas válidas de `multiplo_failed_operations`, sin convertir respuestas antiguas en evidencia de dominio. El nuevo estado SHALL tener versión explícita y métricas de rondas/factores; repetir migración no duplicará métricas. Ante JSON corrupto, acceso restringido o cuota excedida SHALL usar memoria de sesión y avisar al adulto sin bloquear. Al recargar o volver a abrir la aplicación, un desbloqueo ya conseguido SHALL seguir disponible cuando se conserven los datos locales.

#### Scenario: Migra legacy 4
- **GIVEN** existe `multiplo_progression_v1.highestUnlockedLevel=4`
- **WHEN** se abre la versión v1.2 por primera vez
- **THEN** quedan disponibles las tablas 1–5, se conservan sonido e historial válido y una recarga mantiene la misma disponibilidad

#### Scenario: Migración idempotente
- **GIVEN** el estado v1.2 ya fue migrado
- **WHEN** se reabre la aplicación
- **THEN** no se duplican rondas/factores ni se cambia la disponibilidad

#### Scenario: Guarda progreso local y preferencia de sonido
- **GIVEN** existen niveles accesibles, un avance mínimo y una preferencia de sonido
- **WHEN** se guardan los datos del progreso
- **THEN** se almacenan en `localStorage` y no se sincronizan entre navegadores

#### Scenario: Conserva un nivel tras reabrir
- **GIVEN** el Nivel 2 fue desbloqueado
- **WHEN** se cierra y se abre la aplicación en el mismo navegador manteniendo sus datos
- **THEN** el Nivel 2 sigue disponible

#### Scenario: Continúa si la persistencia falla
- **GIVEN** `localStorage` está bloqueado, ausente o contiene datos inválidos
- **WHEN** se carga o guarda el progreso
- **THEN** la aplicación usa un estado de sesión seguro, permite jugar y no envía los datos a un servicio remoto

#### Scenario: Migra cada nivel legacy por identidad
- **GIVEN** existe `multiplo_progression_v1.highestUnlockedLevel` válido con valor 1, 2 o 3
- **WHEN** se abre la versión v1.2 por primera vez
- **THEN** quedan disponibles respectivamente las tablas 1–2, 1–3 o 1–4, sin reinterpretar respuestas antiguas como evidencia de dominio

#### Scenario: Conserva sonido y fallos legacy sin crear dominio
- **GIVEN** existen `multiplo_sound_enabled` y entradas válidas en `multiplo_failed_operations`, junto con respuestas o avance legacy
- **WHEN** se migra el progreso local
- **THEN** se conservan la preferencia de sonido, el silencio y las entradas válidas de fallos, pero ninguna respuesta antigua se convierte en ronda válida ni factor cubierto

#### Scenario: Guarda y restaura un desbloqueo completo
- **GIVEN** se han cumplido todos los requisitos mostrados y se desbloquea la tabla siguiente
- **WHEN** se recarga o se vuelve a abrir la aplicación en el mismo navegador sin borrar datos
- **THEN** la tabla desbloqueada continúa disponible y sus requisitos no reaparecen como pendientes

#### Scenario: Conserva un nivel tras reabrir
- **GIVEN** el Nivel 2 fue desbloqueado
- **WHEN** se cierra y se abre la aplicación en el mismo navegador manteniendo sus datos
- **THEN** el Nivel 2 sigue disponible

### Requirement: Expone un resumen coherente de ronda y dominio

El sistema SHALL mostrar en el cierre y en la consulta de progreso dos estados legibles: estrellas ganadas en la ronda actual y dominio acumulado de la tabla. El estado de una tabla SHALL ser «en progreso» mientras falte cualquier requisito de dominio, aunque la ronda actual sea perfecta.

#### Scenario: Distingue resultado perfecto de dominio pendiente
- **GIVEN** la ronda actual tiene 4/4 aciertos iniciales y la tabla siguiente está bloqueada
- **WHEN** se renderiza el cierre
- **THEN** el jugador ve 4/4 estrellas y, por separado, el avance y los requisitos pendientes del dominio; no se muestra «tabla terminada»

#### Scenario: Declara la tabla lista al completar todos los requisitos
- **GIVEN** todos los requisitos visibles de dominio están cumplidos
- **WHEN** se renderiza el progreso
- **THEN** la tabla se muestra como completada para desbloqueo, se habilita la acción de la siguiente tabla si existe y el estado se conserva localmente

### Requirement: Presentar la selección después de la bienvenida sin alterar la progresión

La aplicación SHALL diferir la presentación visible de la selección de niveles hasta que la bienvenida haya terminado o el jugador la haya adelantado explícitamente. Una vez visible, SHALL reutilizar las reglas existentes de disponibilidad, persistencia y bloqueo: una tabla disponible inicia su partida y una tabla bloqueada no puede seleccionarse.

#### Scenario: Selection follows an explicit continue action
- **GIVEN** el jugador ha iniciado la bienvenida desde Inicio
- **WHEN** pulsa Continuar antes de que termine el audio
- **THEN** aparece la selección de niveles, la voz se cancela y la navegación no se duplica

#### Scenario: Selection follows natural completion
- **GIVEN** el jugador inició la bienvenida y no la adelantó
- **WHEN** termina la bienvenida o el audio no está disponible
- **THEN** aparece la selección de niveles sin exigir espera adicional

#### Scenario: Preserve available and blocked tables
- **GIVEN** la selección de niveles está visible
- **WHEN** el jugador intenta elegir una tabla
- **THEN** una tabla disponible inicia su partida y una tabla bloqueada sigue sin poder seleccionarse
