# Tasks

## 1. Integración de recursos y estado de guía

- [x] 1.1 Inventariar y enlazar los cuatro SVG de `assets/mascot/` y los cuatro WAV de `assets/audio/` según `docs/ASSETS.md`, verificando que cada ruta exista y que no se añada una dependencia multimedia externa (issue #2, escenario «Recursos multimedia vinculados»).
- [x] 1.2 Definir el estado mínimo de la guía —`normal`, `hablando`, `celebrando`, `pensando`, última instrucción y sonido habilitado— e integrarlo en las vistas del issue #1, verificando que los estados visuales se distingan con texto o iconografía además del color (escenarios «Estados visuales de la mascota» y «Retroalimentación empática»).
- [x] 1.3 Implementar lectura y escritura tolerantes de la preferencia local de sonido, verificando que una sesión nueva respete el silencio conservado y que un `localStorage` ausente o corrupto no bloquee el juego (escenario «Conservar la preferencia local de silencio»; RF-02, RNF-02).

## 2. Narración y efectos no bloqueantes

- [x] 2.1 Implementar el coordinador de instrucciones en español usando la API nativa disponible, con texto siempre visible, selección de voz española cuando exista y fallback sin voz, verificando los escenarios «Guía en español con voz habilitada», «Instrucciones habladas y texto simultáneamente disponible», «Ausencia de voz» y «No se requiere una guía bilingüe».
- [x] 2.2 Implementar repetición de la última instrucción y ciclo de cancelación, verificando con una prueba que repetir no cambie la pregunta/progreso, que una instrucción nueva cancele la anterior y que cambiar de actividad detenga la voz previa (escenarios «Repetir la última instrucción», «No solapar discursos» y «Detener la voz anterior al cambiar la actividad»).
- [x] 2.3 Conectar la síntesis al gesto inicial permitido por el navegador y manejar rechazos de autoplay, verificando que Jugar/Continuar/repetir puedan iniciar la narración sin exigir reproducción automática y que el texto mantenga el flujo (escenario «Disparar síntesis tras un gesto del usuario»).
- [x] 2.4 Implementar el modo silencioso como interruptor único para voz y efectos, verificando que silenciar detenga una reproducción vigente, impida nueva voz/sonido al avanzar y permita reanudar al habilitarlo (escenarios «Modo silencioso» y «El silencio aplica a todos los sonidos»).
- [x] 2.5 Asociar los WAV originales a clic, acierto, intento y celebración con reproducción discreta y errores absorbidos, verificando cada asociación y que un archivo ausente o una reproducción rechazada no interrumpa la interacción (escenarios «Sonidos originales discretos» y «Fallo de un efecto sonoro»).

## 3. Guion y experiencia de la actividad

- [x] 3.1 Añadir el catálogo de frases breves de bienvenida, demostración, pregunta, acierto, reintento y cierre, verificando que el guion pueda presentar «¡Hola! Vamos a jugar», «Mira: tres grupos de dos», «¿Cuántos hay en total?», «¡Muy bien!», «Cuenta otra vez» y «¡Terminaste la aventura!» en texto y voz disponible (escenario «Guion de ejemplo»).
- [x] 3.2 Conectar las reacciones de acierto, error, pista y cierre con los estados de mascota y mensajes empáticos, verificando que un error conserve la actividad, invite a reintentar y no altere las reglas de primer intento ni la puntuación del motor de ejercicios del MVP (escenario «Retroalimentación empática»; RF-02/RNF-07, sin modificar RF-05).
- [x] 3.3 Añadir controles grandes y etiquetados para repetir y sonido en las vistas existentes, verificando toque y clic en celular, tablet y computador sin desbordamiento horizontal ni pantalla nueva fuera del MVP (RNF-01, RNF-07; dependencia issue #1).

## 4. Verificación proporcional del change

- [x] 4.1 Crear pruebas automatizadas o de navegador para API de voz disponible/ausente, voz no española, cancelación/no solapamiento, gesto inicial, repetición y modo silencioso persistido, verificando los escenarios de voz del spec sin afirmar soporte uniforme entre navegadores.
- [x] 4.2 Crear pruebas de efectos y fallback para acierto, intento, celebración, clic, archivos faltantes y errores de reproducción, verificando que todos respeten `soundEnabled` y no bloqueen la actividad.
- [x] 4.3 Ejecutar una prueba de flujo completo desde iniciar actividad hasta acierto, error/reintento y cierre en los tres tamaños de viewport, verificando texto visible, estados de estrella, controles funcionales y que no se alteren las invariantes matemáticas o el conteo de primer intento de los changes dependientes.
- [x] 4.4 Revisar trazabilidad contra issue #2, RF-02, RNF-02, RNF-07, D-005/D-006/D-015/D-016/D-018, Q-01/Q-09 y `docs/ASSETS.md`, verificando que no se hayan introducido backend, cuentas, telemetría, audio externo, guía bilingüe o funcionalidades fuera de alcance.
