# Spec Delta

## ADDED Requirements

### Requirement: Mostrar la atribución aprobada en el footer existente

El pie de página existente de Múltiplo SHALL conservar su contenido informativo y SHALL mostrar como contenido semántico del mismo footer las frases exactas `Desarrollado por Beastie Studio` y `Juegos hechos con cariño`. La marca SHALL aparecer únicamente como `Beastie Studio`; la atribución SHALL tener jerarquía secundaria, contraste legible y ningún movimiento, control o enlace externo. El lema institucional de referencia `Descubrir. Pensar. Compartir.` SHALL conservarse cuando forme parte del contenido de identidad aprobado, sin sustituir las dos frases de atribución ni exigir que aparezca también en la pantalla del juego.

#### Scenario: Mostrar las frases exactas en cualquier vista

- **GIVEN** cualquier vista de Múltiplo muestra el footer existente con clase `app-footer`
- **WHEN** el pie de página queda visible
- **THEN** el contenido semántico del footer incluye exactamente `Desarrollado por Beastie Studio` y `Juegos hechos con cariño`, con la marca escrita en singular

#### Scenario: Conservar el contenido informativo y el lema de identidad

- **GIVEN** el footer contiene información sobre el carácter educativo, privacidad o seguridad de Múltiplo y la identidad documentada conserva el lema `Descubrir. Pensar. Compartir.`
- **WHEN** se incorpora la atribución
- **THEN** no se elimina ni se cambia innecesariamente el texto informativo existente, el lema no se sustituye por la firma emocional y no es obligatorio repetir el lema en la pantalla del juego

#### Scenario: Reutilizar el footer sin crear una superficie adicional

- **GIVEN** `index.html` ya contiene un footer `app-footer`
- **WHEN** se muestra la atribución
- **THEN** se reutiliza ese footer y no aparece otra pantalla, modal, overlay, splash, banner ni superficie equivalente para el crédito

#### Scenario: Presentar la atribución con jerarquía secundaria

- **GIVEN** el footer y sus estilos existentes están disponibles
- **WHEN** se renderiza la atribución
- **THEN** el crédito aparece debajo o en una línea secundaria discreta, con estilo sobrio subordinado al logo y al contenido de Múltiplo, sin dependencias, fuentes externas, imágenes, logotipos inventados ni recursos visuales nuevos

#### Scenario: Mantener legibilidad responsive

- **GIVEN** el footer se observa en un móvil pequeño, tablet o escritorio
- **WHEN** se renderiza la atribución
- **THEN** las dos frases son visibles y legibles, no cubren controles, no se superponen con botones, no se cortan horizontalmente y no impiden desplazarse o interactuar con el juego

#### Scenario: Exponer texto accesible sin controles ni movimiento

- **GIVEN** un lector de pantalla llega al pie de página
- **WHEN** encuentra la atribución
- **THEN** la anuncia como texto semántico legible del footer, sin controles innecesarios, con contraste legible y sin animación

#### Scenario: Rechazar variantes y metadatos de marca no aprobados

- **GIVEN** se inspecciona el texto renderizado de Múltiplo
- **WHEN** se revisa la atribución
- **THEN** no aparece `Beastie Studios`, ninguna variante no aprobada, enlace externo, dominio inventado, red social, copyright automático ni marca registrada `®`/`™`

#### Scenario: Conservar el funcionamiento general

- **GIVEN** el jugador recorre inicio, aprende, juego y fin
- **WHEN** existe la atribución en el footer
- **THEN** no cambian la navegación, el foco de teclado, el audio, la progresión, las rutas, la PWA, las métricas ni el motor del juego
