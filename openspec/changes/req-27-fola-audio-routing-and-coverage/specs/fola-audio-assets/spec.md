## MODIFIED Requirements

### Requirement: Expone únicamente recursos Fola preparados y no versiona los WAV

El juego SHALL resolver clips Fola únicamente desde la ubicación estática preparada y SHALL comprobar que cada ID usado por una actividad corresponde a un archivo existente. La carpeta generada y los 490 WAV SHALL estar explícitamente ignorados por Git y no SHALL requerir memoria masiva ni descarga completa al abrir la página.

#### Scenario: Cobertura de un clip usado
- **GIVEN** una actividad solicita un ID de clip del manifiesto
- **WHEN** se resuelve su recurso
- **THEN** la ruta corresponde a un archivo preparado existente y su contenido coincide con el hash del manifiesto

#### Scenario: No hay recursos de Drive ni carga masiva inicial
- **GIVEN** se abre la aplicación sin ejecutar preparación o con una actividad que usa un bloque limitado
- **WHEN** comienza el juego
- **THEN** la aplicación no consulta Drive ni TTS/IA, no descarga los 490 WAV al abrir y conserva fallback textual si el clip no está disponible

#### Scenario: Cobertura del catálogo consumible
- **GIVEN** el runtime puede solicitar un ID Fola durante el MVP
- **WHEN** se ejecutan las validaciones de catálogo
- **THEN** se comprueba la ruta y el hash del manifiesto para cada uno de los 489 IDs consumibles, y `numero_000` queda identificado como empaquetado pero no consumible

#### Scenario: Asociación correcta de eventos finales
- **GIVEN** ocurre la despedida o el cierre de la tabla del diez
- **WHEN** se resuelve el clip
- **THEN** cada evento solicita el WAV que corresponde a su texto en el catálogo y manifiesto, sin intercambiar los clips 36 y 37

#### Scenario: E2E comprueba la locución solicitada
- **GIVEN** el navegador tiene audio habilitado y concede la reproducción tras gesto del usuario
- **WHEN** el E2E activa bienvenida, Aprende y los eventos finales
- **THEN** comprueba la URL Fola exacta solicitada y que su reproducción se inició; un efecto de clic u otro audio no satisface la comprobación

