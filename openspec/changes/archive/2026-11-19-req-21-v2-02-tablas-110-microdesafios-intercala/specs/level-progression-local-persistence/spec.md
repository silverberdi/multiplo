# Spec Delta

## MODIFIED Requirements

### Requirement: Configura los cuatro niveles del MVP

El sistema SHALL ofrecer exactamente diez tablas disponibles progresivamente, identificadas por `a=1..10`, cada una con `b=1..10`, interpretando `a×b` como `a` grupos de `b`. La tabla 1 SHALL estar disponible para un jugador nuevo; tras la tabla 10 no SHALL existir tabla 11.

#### Scenario: Inicio nuevo
- **GIVEN** no existe progreso válido
- **WHEN** se consulta la disponibilidad
- **THEN** solo la tabla 1 está disponible y las tablas 2–10 están bloqueadas

#### Scenario: Configuración de niveles y factores
- **GIVEN** existen las tablas disponibles de la versión ampliada
- **WHEN** se configura el contenido de cada tabla
- **THEN** corresponden a las tablas 1 a 10, sus factores van del 1 al 10 y `a×b` significa `a` grupos de `b`

#### Scenario: Tabla final
- **GIVEN** la tabla 10 está disponible
- **WHEN** termina una ronda
- **THEN** puede repetirse o practicar tablas disponibles y nunca se ofrece una tabla 11

### Requirement: Desbloquea con tres aciertos del primer intento

El sistema SHALL desbloquear solo la tabla siguiente, sin revocar tablas abiertas, cuando ambas condiciones se cumplan: al menos 2 de las últimas 3 rondas completadas de la tabla actual alcanzan `>=3/4` aciertos iniciales en tabla 1 o `>=2/3` aciertos iniciales de tabla actual en tablas 2–10; y existen al menos 7 factores `b` distintos acertados inicialmente en esa tabla. Los resultados de repaso no cuentan.

#### Scenario: Una ronda no basta
- **GIVEN** no existe evidencia acumulada
- **WHEN** se completa una ronda perfecta
- **THEN** la siguiente tabla permanece bloqueada

#### Scenario: Dominio con dos condiciones
- **GIVEN** hay 7 factores distintos acertados y 2 de las últimas 3 rondas cumplen el mínimo actual
- **WHEN** se cierra la tercera ronda relevante
- **THEN** se desbloquea únicamente la tabla siguiente

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

Cada ronda SHALL conservar como máximo cuatro estrellas, una por pregunta acertada en primer intento, incluyendo repaso. Los reintentos SHALL completar preguntas sin alterar métricas retrospectivas; fallar no SHALL bloquear ni deshacer disponibilidad.

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
- **THEN** comienza una nueva ronda de la misma tabla sin modificar estrellas ni tablas previamente guardadas

#### Scenario: Cierre positivo sin umbral
- **GIVEN** el niño termina una ronda sin alcanzar el mínimo de aciertos iniciales
- **WHEN** se muestra el resultado
- **THEN** recibe felicitación por participar, puede repetir y no pierde tablas abiertas

#### Scenario: Cierre del último nivel
- **GIVEN** termina una ronda de la tabla 10
- **WHEN** se completa la ronda
- **THEN** puede repetir o ir a tablas anteriores y no se ofrece una tabla 11

### Requirement: Persiste el progreso y el sonido solo en el navegador actual

En la primera carga, el sistema SHALL migrar idempotentemente `multiplo_progression_v1` por identidad: legacy 1→tablas 1–2, 2→1–3, 3→1–4 y 4→1–5. Sin legacy válido, solo tabla 1. SHALL preservar `multiplo_sound_enabled`, silencio y entradas válidas de `multiplo_failed_operations`, sin convertir respuestas antiguas en evidencia de dominio. El nuevo estado SHALL tener versión explícita y métricas de rondas/factores; repetir migración no duplicará métricas. Ante JSON corrupto, acceso restringido o cuota excedida SHALL usar memoria de sesión y avisar al adulto sin bloquear.

#### Scenario: Migra legacy 4
- **GIVEN** existe `multiplo_progression_v1.highestUnlockedLevel=4`
- **WHEN** se abre la versión v1.2 por primera vez
- **THEN** quedan disponibles las tablas 1–5, se conservan sonido e historial válido y una recarga mantiene la misma disponibilidad

#### Scenario: Migración idempotente
- **GIVEN** el estado v1.2 ya fue migrado
- **WHEN** se reabre la aplicación
- **THEN** no se duplican rondas/factores ni se cambia la disponibilidad

#### Scenario: Almacenamiento no disponible
- **GIVEN** localStorage lanza error o contiene JSON inválido
- **WHEN** inicia o guarda una ronda
- **THEN** el niño puede aprender y jugar en memoria y el adulto recibe un aviso apropiado

#### Scenario: Guarda progreso local y preferencia de sonido
- **GIVEN** se completa una ronda o cambia el sonido
- **WHEN** se guarda el estado
- **THEN** se conserva localmente la disponibilidad y la preferencia de sonido sin sincronización remota

#### Scenario: Conserva un nivel tras reabrir
- **GIVEN** una tabla está disponible y el navegador conserva el almacenamiento
- **WHEN** se cierra y reabre la aplicación
- **THEN** la misma tabla continúa disponible

#### Scenario: Continúa si la persistencia falla
- **GIVEN** el almacenamiento local no está disponible
- **WHEN** se inicia o guarda una ronda
- **THEN** el juego continúa en memoria y avisa al adulto sin bloquear al niño
