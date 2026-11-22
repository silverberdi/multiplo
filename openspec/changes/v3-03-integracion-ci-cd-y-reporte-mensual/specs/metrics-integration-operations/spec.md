## Purpose

Integra la telemetría agregada de Múltiplo con infraestructura aislada y permite elaborar informes mensuales reproducibles, manteniendo separadas la publicación estática, la ingesta y la operación administrativa.

## ADDED Requirements

### Requirement: Pages publica solo los archivos del sitio

El workflow de Pages SHALL generar y publicar un artefacto estático por allowlist que contenga solo los archivos frontend requeridos y validados, incluidos recursos Fola, manifest, iconos y CNAME necesarios. El artefacto SHALL excluir `metrics/`, SQL, tests, documentación interna, OpenSpec, `.github/`, `.minime/`, dependencias, tokens y archivos privados. Los cambios solo de Worker SHALL NOT republicar Pages; los cambios del frontend y sus assets SHALL conservar el despliegue del sitio.

#### Scenario: Construcción del artefacto permitido
- **GIVEN** se ejecuta el workflow de Pages
- **WHEN** se inspecciona el artefacto antes de publicarlo
- **THEN** solo contiene archivos estáticos requeridos para el sitio y excluye fuentes y datos internos de Worker/D1

#### Scenario: Cambio solo de Worker
- **GIVEN** un cambio modifica únicamente Worker, D1 o su workflow
- **WHEN** corre CI
- **THEN** se validan los componentes afectados y no se publica Pages

#### Scenario: Recursos del juego conservados
- **GIVEN** el artefacto permitido se despliega
- **WHEN** se prueba el sitio publicado
- **THEN** HTML, rutas, PWA, manifest, iconos y audios Fola requeridos cargan desde la publicación sin exponer otros archivos del repositorio

### Requirement: Worker y Pages usan despliegues independientes y protegidos

El sistema SHALL validar Worker y Pages en PR sin desplegar producción. Los workflows SHALL tener permisos mínimos, secretos Cloudflare solo en un entorno protegido y separación inequívoca de D1 de prueba y producción. El despliegue del Worker de producción SHALL requerir una invocación manual protegida; las migraciones productivas SHALL ser un paso explícito separado con respaldo verificado y comprobación posterior. Como el repositorio es público, un backup D1 SHALL cifrarse y autenticarse antes de preservarse como artefacto; la clave SHALL permanecer como secreto protegido y ausente de logs. Las salidas del proveedor durante export SHALL quedar fuera de logs públicos cuando puedan contener URLs firmadas temporales. La recuperación SHALL ser manual y restaurar solo en una D1 vacía de reemplazo. Ningún push SHALL activar telemetría real, migrar D1 productiva ni habilitar facturación automáticamente.

#### Scenario: Pull request no despliega producción
- **GIVEN** se abre o actualiza un PR con cambios del Worker
- **WHEN** corren las validaciones de CI
- **THEN** se ejecutan pruebas aisladas sin secretos productivos ni despliegue/migración de producción

#### Scenario: Despliegue productivo protegido
- **GIVEN** existe aprobación humana y se solicita explícitamente el workflow de producción
- **WHEN** se ejecuta el despliegue del Worker
- **THEN** usa permisos mínimos y bindings de producción correspondientes sin cambiar Pages ni servicios vecinos

#### Scenario: Migración productiva independiente
- **GIVEN** se solicita una migración D1 productiva autorizada
- **WHEN** la etapa de migración corre
- **THEN** requiere revisión/backup previo explícito, no se activa por un push y deja resultado verificable y una ruta de recuperación documentada

### Requirement: La ruta de Worker queda aislada del sitio y servicios vecinos

La ruta de producción SHALL limitarse exactamente a `multiplo.silverman.pro/api/metrics`. No SHALL interceptar `/`, recursos del frontend, otras rutas ni hosts hermanos. Un fallo, cuota agotada o configuración ausente SHALL fallar cerrado, sin fallback al origen estático ni impacto en el juego. El límite perimetral SHALL cubrir solamente host y ruta previstos; si Cloudflare no permite ese alcance exacto, la ingesta real permanecerá apagada.

#### Scenario: Ruta prevista y ruta vecina
- **GIVEN** se prueban `/api/metrics`, `/`, `/assets/*`, `/js/*` y hosts hermanos
- **WHEN** se envían solicitudes de prueba
- **THEN** solo la ruta exacta de API llega al Worker y los demás recursos conservan su comportamiento estático y sus hosts

#### Scenario: Falta de aislamiento perimetral
- **GIVEN** el plan o zona Cloudflare no permite limitar una protección al host/ruta indicados
- **WHEN** se evalúa la activación
- **THEN** no se aplica una regla amplia, no se habilitan pagos y la ingesta permanece apagada

### Requirement: Informe mensual reproducible sin API pública de lectura

El sistema SHALL permitir generar bajo demanda, para un mes calendario UTC, un informe Markdown y exportación CSV reproducibles a partir de D1 mediante acceso administrativo autenticado de solo lectura y métricas del host consultadas en Cloudflare. No SHALL crear endpoint público de lectura/exportación, dashboard, cron ni scheduler. El informe SHALL incluir periodo, fecha de extracción, fórmulas, denominadores, periodos parciales, calidad/pérdida potencial de datos, límites de autenticidad, operación/costos y una muestra sintética reproducible. SHALL suprimir desgloses de bajo volumen según la política documentada y no SHALL afirmar niños únicos, retención individual, concurrencia exacta ni efecto causal.

Precisión inicial SHALL ser `Σ firstAttemptCorrect / Σ questionsAnswered`; con denominador cero se muestra `null`/«Sin datos». Finalización SHALL ser `Σ roundsCompleted / Σ roundsStarted`, indicando que deltas de eventos por fecha pueden superar 100% cuando una ronda cruza periodos y no constituyen una tasa de cohorte. Tiempo SHALL presentarse como segundos acumulados, nunca promedio por jugador. Tasa de error por operación SHALL exponer denominador y suprimir celdas bajo 10 eventos; ese umbral no representa cantidad de personas ni garantiza anonimato. Comparación mensual solo SHALL aparecer entre ventanas completas/comparables; audiencia y dispositivo SHALL atribuirse a las definiciones de Cloudflare, no a niños únicos o DAU/MAU reales.

#### Scenario: Generación manual para periodo UTC
- **GIVEN** un operador autenticado selecciona un mes calendario UTC
- **WHEN** ejecuta las herramientas de informe
- **THEN** obtiene CSV y Markdown reproducibles con periodo, extracción, fórmulas y denominadores explícitos, sin habilitar una lectura HTTP pública

#### Scenario: Datos parciales o ausentes
- **GIVEN** una fuente no cubre todo el periodo o su denominador es cero
- **WHEN** el informe presenta el resultado
- **THEN** marca la ventana parcial o muestra «Sin datos», sin inventar cero, cohorte, usuario único o comparación no homologable

#### Scenario: Protección de celdas pequeñas y afirmaciones
- **GIVEN** un desglose podría exponer actividad de bajo volumen o confundirse con identidad individual
- **WHEN** se produce el informe
- **THEN** se suprime o agrupa según el umbral documentado y se explicita que los eventos son falsificables y no prueban identidad ni efecto educativo

#### Scenario: Ejemplo sin telemetría real
- **GIVEN** no existe aprobación para datos reales
- **WHEN** se demuestra el formato del informe
- **THEN** se usan fixtures sintéticos identificados como tales, sin consultar ni publicar datos de producción

### Requirement: Privacidad y activación real permanecen bajo gates explícitos

El envío desde cliente y Worker SHALL permanecer apagado hasta que consten la revisión de privacidad infantil, metadatos/procesamiento de Cloudflare, accesos, retención y supresión de celdas pequeñas, junto con autorización operativa explícita. CORS, `Origin` o UUID SHALL NOT considerarse autenticación. Sin esos gates, CI y reportes SHALL usar datos sintéticos; el fallo de telemetría SHALL NOT bloquear el juego.

#### Scenario: Sin aprobación
- **GIVEN** falta cualquiera de los gates de privacidad u operación
- **WHEN** se despliega o ejecuta el código
- **THEN** no se envían datos reales y la ingesta permanece apagada

#### Scenario: Fallo de telemetría
- **GIVEN** el Worker está inactivo, rechaza el lote o agota cuota
- **WHEN** el niño continúa jugando
- **THEN** rondas, navegación, audio e historial local siguen funcionando sin interrupción ni mensaje técnico infantil
