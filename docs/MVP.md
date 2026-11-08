# Múltiplo — Contrato funcional MVP v1.0

**Estado:** diseño aprobado; no se implementa en esta fase de preparación. **Público:** niño de 6 años. **Propósito:** comprender multiplicaciones mediante grupos y suma repetida, con una experiencia divertida y autónoma.

## Reglas de producto
- Web responsive en español para celular, tablet y computador; control por toque/clic, sin cronómetro.
- Mascota estrella amarilla; guía mediante voz y texto breve, felicitaciones y pistas. Acciones de repetir audio y silenciar. El texto funciona incluso si la voz no está disponible.
- Cuatro niveles secuenciales: tabla del 2, del 3, del 4 y del 5; cada una incluye factores 1–5. Inicialmente solo nivel 1 está disponible.
- Convención matemática: `a × b` = **a grupos de b objetos**. Ejemplo: `3 × 2` es `2+2+2=6`.
- Una ronda dura aproximadamente 3–5 minutos: una demostración visual no evaluable + cuatro preguntas.
- Preguntas 2 y 3: contar grupos y elegir resultado. Pregunta 4: resolver multiplicación sin objetos inicialmente (pista visual disponible). Pregunta 5: encontrar cuál de tres multiplicaciones da el total; opciones pertenecen a la tabla actual y solo una puede ser correcta.
- Cada pregunta ofrece exactamente tres respuestas distintas, una correcta. Todas deben ser matemáticamente válidas; dos son distractores. Evitar la repetición inmediata de operaciones y variar rondas; priorizar en sesiones siguientes las operaciones falladas.
- Si falla, se invita a intentar otra vez y se ofrecen grupos de objetos. Reintentos ilimitados y sin sanciones. Contabilizar una pregunta como acierto inicial **solo si la primera respuesta es correcta**.
- Cada acierto inicial otorga una estrella, máximo 4. Desbloqueo de siguiente nivel con al menos 3/4 aciertos iniciales al terminar la ronda. Con 2/4 o menos, invitar a repetir. Último nivel sigue siendo rejugable.
- Pantallas mínimas: Inicio / niveles, Aprende, Juego y Fin de ronda. Feedback de aciertos/errores dentro de Juego, no en una pantalla adicional.
- Guardar niveles desbloqueados, progreso mínimo y sonido habilitado/deshabilitado en `localStorage`; sin sincronización ni promesa de persistencia si se borran datos del navegador.

## Voz, accesibilidad y aspectos técnicos
- Síntesis de voz integrada del navegador (`speechSynthesis`) en español: empezar después del gesto inicial del usuario, evitar voces simultáneas, permitir repetir/silenciar, fallback a instrucciones escritas.
- Tipografía legible, números grandes, blancos táctiles amplios, contrastes suficientes y sin dependencia exclusiva de color.
- PWA instalable cuando lo admita el dispositivo/navegador. Hosting estático; HTML, CSS y JavaScript. Sin backend, cuentas, IA, telemetría infantil, pagos ni anuncios.
- Recursos multimedia y su vinculación con los issues: ver [ASSETS.md](ASSETS.md).

## Aceptación funcional global (Given/When/Then)
**Given** un primer acceso al juego **When** el niño pulsa Jugar **Then** se abre el nivel 1 y puede escucharse o leerse la instrucción.

**Given** el ejemplo de aprendizaje **When** se presenta `3 × 2` **Then** aparecen tres grupos de dos, `2+2+2=6` y `3×2=6`.

**Given** una pregunta con tres alternativas **When** el niño elige una errónea **Then** recibe ayuda y puede reintentar sin perder avance; no suma acierto de primer intento.

**Given** 3 aciertos de primer intento de 4 preguntas **When** termina la ronda **Then** se desbloquea el siguiente nivel y el cambio se conserva al reabrir el mismo navegador.

**Given** que no existe voz disponible **When** se inicia el juego **Then** el texto permite completar la ronda.

**Given** un celular, una tablet o un computador **When** se juega la ronda **Then** todos los controles son accesibles mediante toque/clic y no hay desbordamientos horizontales.

## Exclusiones
Tablas del 6 al 10, usuarios, sincronización, clasificaciones, monedas, pantallas extra, mundos complejos, minijuegos, backend, IA, aplicaciones nativas y paneles administrativos.

**Validación con el niño:** poder iniciar y terminar una ronda con mínima asistencia, asociar grupos con la multiplicación y mostrar disposición a repetir.
