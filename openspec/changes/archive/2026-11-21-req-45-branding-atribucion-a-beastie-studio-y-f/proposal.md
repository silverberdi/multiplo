# Proposal

## Why

Múltiplo necesita reconocer de forma visible y discreta a Beastie Studio como marca creadora, sin diluir la identidad propia del juego ni añadir una superficie nueva. El footer informativo existente ofrece el lugar adecuado para incorporar las dos frases aprobadas y conservar el lema institucional de referencia sin convertirlo en un tercer eslogan obligatorio de la pantalla de juego.

## What Changes

- Modificar el footer existente `app-footer` de `index.html` para mostrar exactamente `Desarrollado por Beastie Studio` y `Juegos hechos con cariño`.
- Mantener el texto informativo existente sobre el carácter educativo de Múltiplo y el lema institucional de referencia `Descubrir. Pensar. Compartir.` cuando ya corresponda a la identidad documentada, sin sustituir la firma emocional.
- Presentar la atribución como contenido semántico de footer, debajo o en una línea secundaria, con jerarquía visual sobria y legible.
- Reutilizar los estilos CSS existentes de `app-footer` y `footer-note`, sin enlaces externos, dominios, redes sociales, logotipos, imágenes, fuentes, dependencias ni recursos nuevos.
- Mantener la disposición responsive, el contraste, el desplazamiento y la interacción del juego en móvil pequeño, tablet y escritorio, sin solapar controles ni reducir significativamente el área de juego.
- Mantener fuera de alcance el rediseño visual, una splash screen, banner, modal, overlay, nueva página, animación de créditos, copyright, marcas registradas y cualquier variante de `Beastie Studio`.

## Capabilities

### New Capabilities

<!-- No se introduce una capacidad independiente; la atribución modifica el contrato de la base web existente. -->

### Modified Capabilities

- `web-base-responsive-pwa`: ampliar el contrato del footer existente para incluir la atribución exacta aprobada, su jerarquía secundaria, semántica accesible y comportamiento responsive sin alterar la estructura general del MVP.

## Impact

- **Trazabilidad:** Remote Request #45; issue operativo relacionado con la base web #1 y la validación responsive #7; RF-01/RNF-01/RNF-03/RNF-04/RNF-07; identidad y recursos de `docs/ASSETS.md`, con referencia al lema institucional documentado en la identidad de marca.
- **Archivos previsiblemente afectados en Apply:** `index.html` y, solo si resulta necesario, reglas existentes en `css/styles.css`; pruebas ligeras de DOM/renderizado responsive y documentación de identidad/atribución únicamente donde corresponda.
- No se modifican APIs, lógica del motor, flujo inicio → aprende → juego → fin, foco de teclado, audio Fola, métricas, PWA, rutas, CI/CD, privacidad ni estructura general.
- La verificación de UI reproducible en navegador deberá ejecutarse mediante el executor configurado durante Apply/Verify; la inspección física de dispositivos queda como seguimiento posterior y no bloquea la comprobación automatizable.
