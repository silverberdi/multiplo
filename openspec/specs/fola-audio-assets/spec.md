# fola-audio-assets Specification

## Purpose

Define cómo se prepara y valida el catálogo Fola versionado para que el juego consuma recursos estáticos íntegros, reproducibles y sin credenciales ni dependencia de servicios externos en tiempo de ejecución.

## Requirements

### Requirement: Prepara y valida el paquete Fola reproducible

La preparación SHALL descargar el ZIP fijo de la release `assets-fola-v1.1.0`, verificar exactamente el SHA-256 `202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929`, extraer `manifest.json`, `audios/*.wav`, `catalogos/paquete_01.json` a `paquete_25.json`, `README.md` y `AUDITORIA.txt` en una ubicación estática generada e ignorada por Git, y validar los 490 registros `clips[]` y sus hashes/rutas.

#### Scenario: Preparación íntegra del paquete
- **GIVEN** existe conectividad al ZIP público de la release y el archivo descargado coincide con el checksum declarado
- **WHEN** se ejecuta el comando estándar de preparación de assets
- **THEN** la preparación extrae los archivos requeridos, valida los 490 IDs/rutas/hashes y termina con éxito sin requerir Drive

#### Scenario: ZIP alterado o incompleto
- **GIVEN** el ZIP descargado no coincide con el SHA-256 esperado o falta un archivo requerido
- **WHEN** se ejecuta la preparación
- **THEN** falla explícitamente con un diagnóstico, no deja una publicación parcial silenciosa ni marca los recursos como disponibles

#### Scenario: Recuperación tras limpiar recursos generados
- **GIVEN** la carpeta generada fue eliminada o no existe
- **WHEN** se ejecuta nuevamente el comando estándar
- **THEN** reconstruye la misma ubicación estática desde la release fija y vuelve a validar su integridad

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
