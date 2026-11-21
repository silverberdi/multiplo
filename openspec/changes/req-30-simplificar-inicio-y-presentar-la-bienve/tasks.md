# Tasks

## 1. Flujo de Inicio y bienvenida

- [x] 1.1 Actualizar el markup y el estado inicial de `index.html`/`js/app.js` para que Inicio muestre solo estrella, nombre Múltiplo y Jugar, oculte la cuadrícula de niveles hasta la bienvenida y exponga un Continuar accesible durante ella; verificar Q-30.1/Q-30.4 mediante el test de navegador declarado.
- [x] 1.2 Implementar la transición idempotente Inicio → bienvenida → selección en `js/app.js`, preservando los listeners de tablas disponibles/bloqueadas y el inicio de partida; verificar que una tabla disponible inicia y una bloqueada no cambia de vista.
- [x] 1.3 Añadir la invitación visual sutil del botón Jugar en `css/styles.css`, incluyendo `prefers-reduced-motion: reduce`, foco visible y uso sin animación; verificar en Chromium que la animación se reduce o desactiva y no hay overflow en 375×667 y 1280×800.

## 2. Audio y fallback no bloqueante

- [x] 2.1 Ajustar la coordinación de `js/star-guide.js`/`js/fola-catalog.js` para mostrar el saludo antes de solicitar el clip de primera visita o regreso y no solicitar audio durante la carga; verificar que el clip Fola solicitado coincide con el catálogo y que el texto permanece visible.
- [x] 2.2 Unificar la finalización de bienvenida para Continuar, `ended`, error, ausencia de clip, silencio y rechazo de `play()`, cancelando el audio anterior e ignorando callbacks tardíos; verificar que no se duplican navegaciones ni se solapan locuciones.
- [x] 2.3 Verificar que el fallback conserva navegación, tablas, partida y preferencia local de sonido sin introducir TTS, red, backend o nuevos assets; cubrir ausencia de `speechSynthesis`/audio y rechazo de reproducción con tests unitarios o de integración existentes.

## 3. Pruebas automatizadas y retiro seguro

- [x] 3.1 Actualizar o añadir cobertura automatizada para Inicio simplificado, saludo inmediato, cuadrícula oculta, avance antes de `ended`, finalización natural, audio ausente/silenciado y tabla bloqueada; verificar los escenarios de los tres delta specs con el ejecutor Chromium configurado.
- [x] 3.2 Añadir comprobaciones responsive y `prefers-reduced-motion` a los checks de navegador existentes, sin instalar Playwright ni otra dependencia; verificar ausencia de desbordamiento y controles esenciales accesibles por toque/clic.
- [x] 3.3 Inventariar y retirar dentro de este Change únicamente las rutas, listeners, markup o assertions que queden sustituidos por el flujo de bienvenida; verificar después del retiro que no existe doble navegación y que la selección y la partida siguen funcionando.
- [x] 3.4 Ejecutar `npm run test`, `npm run test:unit` y `npm run test:e2e`, además de los checks de navegador específicos, y conservar evidencia observable de la secuencia completa Inicio → bienvenida → selección → partida, sus variantes de audio y responsive; registrar cualquier fallo sin declarar finalización sin resolverlo.
