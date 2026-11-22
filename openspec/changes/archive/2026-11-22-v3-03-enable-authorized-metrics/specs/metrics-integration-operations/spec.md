## MODIFIED Requirements

### Requirement: La ruta de Worker queda aislada del sitio y servicios vecinos

La ruta de producción SHALL aceptar únicamente `POST /api/metrics` en `multiplo.silverman.pro`, sin query string, y no SHALL interceptar `/`, recursos del frontend, otras rutas ni hosts hermanos. Un fallo, cuota agotada o configuración ausente SHALL fallar cerrado, sin fallback al origen estático ni impacto en el juego. La protección SHALL aplicar el binding de rate limiting del Worker solo después de validar host, ruta, método y origen. Una regla WAF perimetral exacta puede añadirse si el plan la permite, pero su ausencia no bloquea la ingesta autorizada. No SHALL aplicarse una regla amplia ni habilitarse facturación para este fin.

#### Scenario: Ruta prevista y ruta vecina
- **GIVEN** se prueban `/api/metrics`, `/`, `/assets/*`, `/js/*` y hosts hermanos
- **WHEN** se envían solicitudes de prueba
- **THEN** solo la ruta exacta de API llega al handler de métricas y los demás recursos conservan su comportamiento

#### Scenario: Límite Worker disponible sin WAF exacto
- **GIVEN** Cloudflare no permite una regla WAF limitada al host y ruta exactos
- **AND** el binding de rate limiting del Worker está configurado para el endpoint y el límite aprobado de 120 solicitudes por minuto por IP
- **WHEN** el operador autoriza explícitamente la ingesta
- **THEN** puede habilitarse sin regla WAF amplia ni servicios pagos, y la documentación declara que el límite es aproximado y que rechazos/reintentos agotados pueden causar subregistro

#### Scenario: Fallo de rate limiter o falta de aislamiento de ruta
- **GIVEN** falta el binding de rate limiting, la ruta no coincide exactamente o una solicitud supera el límite
- **WHEN** se procesa la petición
- **THEN** el handler rechaza la solicitud antes de escribir D1, sin afectar Pages, otros hosts o el juego

#### Scenario: Falta de aislamiento perimetral
- **GIVEN** Cloudflare no permite una regla WAF limitada al host y ruta exactos
- **AND** el binding de rate limiting del Worker está configurado para la ruta exacta
- **WHEN** el operador autoriza explícitamente la ingesta
- **THEN** no se aplica una regla amplia ni se habilita facturación; la ingesta autorizada puede funcionar con el límite Worker documentado y su riesgo de subregistro aceptado

### Requirement: Privacidad y activación real permanecen bajo gates explícitos

El envío desde cliente y Worker SHALL permanecer apagado hasta que consten la revisión del alcance de datos, procesamiento de metadatos de Cloudflare, accesos, retención y supresión de celdas pequeñas, junto con autorización operativa explícita. La activación SHALL usar únicamente los agregados descritos en el contrato, no SHALL habilitar identificación de jugadores y no SHALL bloquear el juego. CORS, `Origin` o UUID SHALL NOT considerarse autenticación.

#### Scenario: Sin aprobación
- **GIVEN** falta cualquiera de los gates de privacidad u operación
- **WHEN** se despliega o ejecuta el código
- **THEN** no se envían datos reales y la ingesta permanece apagada

#### Scenario: Operador aprueba las métricas agregadas y el límite documentado
- **GIVEN** el operador autorizó expresamente las métricas agregadas y los metadatos descritos, y el rate limiter Worker está disponible
- **WHEN** se habilitan los interruptores de cliente y servidor
- **THEN** la transmisión usa la ruta prevista, respeta los límites del esquema y cualquier rechazo o fallo deja el juego y el historial local funcionando

#### Scenario: Fallo de telemetría
- **GIVEN** el Worker está inactivo, rechaza el lote o agota cuota
- **WHEN** el niño continúa jugando
- **THEN** rondas, navegación, audio e historial local siguen funcionando sin interrupción ni mensaje técnico infantil
