# level-progression-local-persistence Specification

## Purpose

Define la progresión infantil entre las cuatro tablas del MVP y conserva de forma local los niveles abiertos y la preferencia de sonido, sin cuentas, sincronización ni servicios remotos.

## Requirements

### Requirement: Configura los cuatro niveles del MVP

El sistema SHALL ofrecer exactamente cuatro niveles numerados del 1 al 4. El Nivel 1 SHALL corresponder a la tabla del 2, el Nivel 2 a la tabla del 3, el Nivel 3 a la tabla del 4 y el Nivel 4 a la tabla del 5; en cada nivel, los factores permitidos SHALL ir del 1 al 5 y SHALL interpretar `a×b` como `a` grupos de `b`.

#### Scenario: Configuración de niveles y factores
- **GIVEN** existen los niveles 1, 2, 3 y 4
- **WHEN** se configura el contenido de cada nivel
- **THEN** corresponden respectivamente a las tablas del 2, 3, 4 y 5 y sus factores van del 1 al 5

### Requirement: Abre y desbloquea niveles de forma secuencial

El sistema SHALL abrir inicialmente solo el Nivel 1. Un nivel posterior SHALL permanecer bloqueado hasta que se alcance el umbral en una ronda completada del nivel inmediatamente anterior, y SHALL conservar abiertos los niveles ya desbloqueados.

#### Scenario: Apertura inicial
- **GIVEN** comienza la progresión sin avance previo
- **WHEN** se consulta la disponibilidad de los niveles
- **THEN** el Nivel 1 está abierto inicialmente, los niveles 2, 3 y 4 están bloqueados y el desbloqueo es secuencial

#### Scenario: Conserva un nivel abierto después de fallos
- **GIVEN** un nivel ya está abierto
- **WHEN** se producen fallos posteriores en una ronda de ese nivel
- **THEN** el nivel sigue disponible y no se bloquea por esos fallos

### Requirement: Desbloquea con tres aciertos del primer intento

Al completar una ronda de un nivel disponible, el sistema SHALL contar únicamente los aciertos del primer intento producidos por el motor de ronda. Si el resultado es exactamente 3 de 4 o 4 de 4, SHALL abrir el siguiente nivel si existe, SHALL mostrar una acción para ir a ese nivel cuando esté disponible y SHALL conservar los niveles ya abiertos. Los reintentos correctos después de errores SHALL permitir terminar la pregunta pero no SHALL contribuir al umbral.

#### Scenario: Umbral correcto
- **GIVEN** el Nivel 1 está disponible
- **WHEN** termina una ronda con exactamente 3 aciertos en el primer intento
- **THEN** se desbloquea el Nivel 2, se muestran tres estrellas y está disponible la acción para jugar el Nivel 2

#### Scenario: Desbloqueo con cuatro aciertos
- **GIVEN** un nivel disponible tiene un nivel posterior
- **WHEN** termina una ronda con 4 de 4 aciertos en el primer intento
- **THEN** se desbloquea el siguiente nivel, se muestran cuatro estrellas y está disponible la acción para jugarlo

#### Scenario: Umbral insuficiente con respuestas corregidas
- **GIVEN** el Nivel 2 está bloqueado
- **WHEN** termina el Nivel 1 con 2 aciertos iniciales y 2 respuestas corregidas
- **THEN** el Nivel 2 permanece bloqueado, se muestran dos estrellas, se felicita la participación y se permite repetir el Nivel 1 sin lenguaje de fracaso

#### Scenario: No ofrece un nivel posterior inexistente
- **GIVEN** la ronda corresponde al Nivel 4 y obtiene el umbral
- **WHEN** aparece el resultado
- **THEN** no se ofrece un Nivel 5 y permanecen disponibles Repetir y volver a niveles abiertos

### Requirement: Permite reintentos y repetición sin penalización adicional

Una respuesta errónea SHALL dejar que el niño responda de nuevo hasta completar la pregunta. El sistema SHALL conservar el resultado del primer intento para el umbral, SHALL permitir repetir una ronda desde el resultado con cualquier cantidad de estrellas y SHALL permitir seleccionar niveles anteriores que estén abiertos. Un resultado inferior al umbral SHALL no cerrar ni revertir niveles previamente desbloqueados.

#### Scenario: Reintento después de una respuesta errónea
- **GIVEN** una pregunta recibe una respuesta errónea
- **WHEN** el niño la responde de nuevo correctamente
- **THEN** el reintento no cuenta para el umbral, pero permite terminar la pregunta

#### Scenario: Repetir desde el cierre
- **GIVEN** aparece el resultado de una ronda
- **WHEN** el niño pulsa Repetir
- **THEN** comienza una nueva ronda del mismo nivel sin modificar las estrellas ni los niveles previamente guardados

#### Scenario: Cierre positivo sin umbral
- **GIVEN** el niño termina una ronda con 0, 1 o 2 aciertos de primer intento
- **WHEN** se muestra el resultado
- **THEN** recibe felicitación por participar, puede repetir la ronda y no pierde ningún nivel abierto previamente

#### Scenario: Cierre del último nivel
- **GIVEN** termina el Nivel 4
- **WHEN** se completa una ronda
- **THEN** se puede repetir o ir a niveles anteriores y no se ofrece un inexistente Nivel 5

### Requirement: Persiste el progreso y el sonido solo en el navegador actual

El sistema SHALL guardar en `localStorage` el avance mínimo necesario para mantener los niveles abiertos y la preferencia de sonido. Los datos SHALL pertenecer al navegador y origen actuales, SHALL no sincronizarse entre navegadores o dispositivos y SHALL tolerar datos corruptos, almacenamiento bloqueado o ausencia de `localStorage` sin impedir jugar.

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
