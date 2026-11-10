# Proposal

## Why

El motor de ronda del issue #4 ya puede producir el resultado pedagógico de cuatro preguntas, pero el MVP todavía no ofrece una progresión comprensible entre sus cuatro tablas ni conserva el avance cuando se vuelve a abrir el mismo navegador. Este cambio completa ese valor: el niño empieza con un único nivel abierto, puede desbloquear el siguiente con exactamente 3 de 4 aciertos en el primer intento y conserva niveles abiertos y sonido localmente, sin cuentas ni servicios remotos.

## What Changes

- Definir los cuatro niveles del MVP: Nivel 1 → tabla del 2, Nivel 2 → tabla del 3, Nivel 3 → tabla del 4 y Nivel 4 → tabla del 5; en todos, los factores van de 1 a 5 y respetan `a×b = a grupos de b`.
- Añadir el estado de progresión con Nivel 1 abierto inicialmente, desbloqueo estrictamente secuencial y niveles ya abiertos que nunca se vuelven a bloquear por fallos posteriores.
- Conectar el cierre de una ronda del motor existente con el umbral de 3 de 4 aciertos en el primer intento: desbloquear el siguiente nivel solo si el nivel jugado estaba disponible y aún existe un nivel posterior.
- Permitir terminar preguntas mediante reintentos después de un error sin contar esas correcciones para el umbral; si el resultado inicial es insuficiente, conservar el nivel siguiente bloqueado y permitir repetir.
- Persistir en `localStorage` únicamente el progreso mínimo y la preferencia de sonido del navegador actual; tolerar almacenamiento ausente, corrupto o restringido sin impedir jugar.
- Mostrar disponibilidad de los niveles y un cierre positivo que permita repetir o ir a niveles anteriores; al terminar el Nivel 4 no ofrecer un Nivel 5.
- Añadir pruebas deterministas de configuración, umbral, reintentos, conservación, persistencia, reinicio del navegador y responsive; no declarar despliegue ni validación con un niño como parte de este cambio.

## Capabilities

### New Capabilities

- `level-progression-local-persistence`: Configuración de los cuatro niveles, disponibilidad secuencial, umbral de desbloqueo, repetición de rondas y persistencia local del progreso y sonido.

### Modified Capabilities

- `question-round-engine`: El cierre de una ronda expone sus cuatro aciertos de primer intento al progreso para aplicar el desbloqueo, sin cambiar la semántica de reintentos ni avanzar automáticamente antes del cierre.

## Impact

- Afecta la vista de niveles y el flujo Aprende → Juego → Fin ya entregados por los issues #1–#4, y reutiliza el resultado inmutable de `question-round-engine`.
- Añade un módulo/estado local de progresión y persistencia en HTML/CSS/JavaScript, con `localStorage` del navegador; no añade backend, cuentas, base de datos, sincronización, analítica ni datos personales.
- Reutiliza `assets/icons/estrella-premio.svg`, `assets/mascot/normal.svg` y la paleta documentada en `docs/ASSETS.md`; no genera recursos nuevos ni depende de archivos externos en runtime.
- Las escrituras locales deben ser no catastróficas: ante bloqueo o corrupción se usa el estado inicial de la sesión y se conserva la posibilidad de jugar, con aviso apto para adulto cuando corresponda.
- La implementación deberá localizar y retirar cualquier selector, transición o texto que ofrezca un nivel inexistente o una ruta paralela de progreso, manteniendo una única fuente de verdad y la compatibilidad con el motor de ronda existente.
