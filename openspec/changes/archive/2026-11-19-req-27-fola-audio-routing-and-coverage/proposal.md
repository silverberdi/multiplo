## Why

La portada y la demostración prometen una guía hablada, y la release de 490 clips ya está publicada, pero el flujo actual omite la bienvenida y bloquea las 100 narraciones de Aprende. Además, dos eventos finales apuntan al WAV equivocado y la validación no cubre todos los IDs que el selector puede solicitar; por eso los E2E verdes no aseguran que el niño oiga la instrucción correcta.

## What Changes

- Conectar la bienvenida Fola a la entrada iniciada por el usuario y a sus estados existentes de primera visita/regreso, manteniendo las copias visibles, el silencio y la reproducción posterior a un gesto.
- Corregir la validación de compatibilidad de las narraciones de grupos para permitir los nombres de cantidades acompañados por sus sustantivos y seguir rechazando operaciones invertidas o incompatibles.
- Corregir la asociación entre despedida, cierre de tabla 10 y sus archivos 36/37.
- Extender la cobertura determinista desde los 372 IDs enumerados actualmente a todos los 489 IDs consumibles; registrar `numero_000` como archivo del paquete sin uso válido en el MVP.
- Hacer que los E2E comprueben la URL Fola esperada y el resultado de reproducción para cada tipo de evento cubierto; cualquier otro sonido no satisface la aserción.

Se reutiliza sin cambios la release Fola actual, sus WAV y su manifiesto. No cambia el motor matemático, el flujo de pantallas, el hosting ni los efectos originales.

## Capabilities

### New Capabilities

<!-- No se introduce una capacidad nueva. -->

### Modified Capabilities

- `star-guide-voice-text`: la bienvenida, Aprende y los cierres deben solicitar el clip apropiado tras un gesto, conservar texto equivalente y validar la asociación exacta del evento a la ruta publicada.
- `fola-audio-assets`: la validación de cobertura debe incluir cada ID que el runtime puede resolver, contrastar su ruta/hash contra el manifiesto y distinguir explícitamente los clips empaquetados que el MVP no consume.

## Impact

- Código: `js/app.js`, `js/fola-catalog.js`, `js/star-guide.js` solo si la integración existente lo requiere.
- Pruebas: catálogo/selector Fola y E2E browser de inicio, Aprende, preguntas, ayuda y cierre.
- Recursos: manifiesto, catálogos y WAV de la release `assets-fola-v1.1.0`; no se crean ni regeneran archivos.
- Sin API, dependencia, servicio externo, datos remotos, permiso especial, despliegue ni cambio en la persistencia del juego.
- Evidencia: el SHA publicado `fb37ea87ca0e36888155aa101c2b152a14243d94` reproduce las brechas que motivan el cambio; la implementación deberá fijar los checks al SHA candidato exacto.
