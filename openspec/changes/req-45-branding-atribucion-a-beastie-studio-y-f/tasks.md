# Tasks

## 1. Footer semántico y atribución aprobada

- [x] 1.1 Actualizar el footer existente de `index.html` para conservar el texto educativo/informativo y añadir exactamente `Desarrollado por Beastie Studio` y `Juegos hechos con cariño` como texto semántico secundario; verificar con una prueba DOM que cada frase aparece una vez, `Beastie Studio` está en singular y no aparecen `Beastie Studios`, `®`, `™` ni enlaces externos (Request #45, RF-01/RNF-03).
- [x] 1.2 Reutilizar las reglas existentes de `.app-footer` y `.footer-note` en `css/styles.css` para separar visualmente la atribución sin introducir fuentes, imágenes, logos, dependencias, animaciones ni una nueva superficie; verificar por inspección de diff y DOM que solo existe el footer existente (RNF-04/RNF-07).

## 2. Responsive y accesibilidad

- [x] 2.1 Ajustar únicamente el CSS local necesario para que el footer y sus dos frases hagan wrapping natural y conserven contraste, sin overflow, clipping, solapamiento o bloqueo de controles en 360×667, 768×1024 y 1280×800; verificarlo en Chromium mediante el executor configurado con `scrollWidth <= clientWidth` y comprobaciones observables de bounding boxes.
- [x] 2.2 Verificar que el crédito permanece como texto estático accesible dentro de `footer.app-footer`, sin controles innecesarios ni movimiento, y que el foco, teclado, desplazamiento y navegación inicio → aprende → juego → fin no cambian; cubrirlo con DOM/renderizado y una comprobación de flujo browser existente, sin ejecutar validación física como sustituto.

## 3. Evidencia, trazabilidad y regresión

- [x] 3.1 Añadir o ajustar la prueba ligera de DOM/renderizado responsive que corresponda al harness existente, manteniendo el alcance sin dependencias nuevas; verificar el caso positivo de las frases exactas, el caso negativo de variantes no aprobadas y los viewports estrecho/escritorio con el comando declarado por el repositorio.
- [x] 3.2 Ejecutar las pruebas pertinentes declaradas por el repositorio (`npm run test`, `npm run test:unit` y `npm run test:e2e` cuando el cambio esté implementado) y registrar comandos, resultados y cualquier limitación sin afirmar evidencia no obtenida; verificar que no cambian motor, audio Fola, PWA, rutas, métricas ni progresión.
- [x] 3.3 Actualizar únicamente la documentación de identidad/atribución o `docs/TRACEABILITY.md` si el repositorio tiene una ubicación canónica para este dato; verificar que la referencia queda ligada a Request #45, RF/RNF afectados y escenarios del delta, sin declarar implementación, Verify, despliegue o validación humana antes de contar con esa evidencia.
- [x] 3.4 Preparar evidencia visual de viewport estrecho y escritorio para el PR pequeño, generada por el executor browser durante Apply/Verify; verificar que las capturas muestran las dos frases, la jerarquía secundaria y ausencia de solapamiento, dejando la inspección de dispositivo físico como seguimiento posterior.
