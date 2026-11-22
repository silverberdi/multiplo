## MODIFIED Requirements

### Requirement: Mantener la ingesta apagada y limitada por defecto

El servicio SHALL iniciar con `METRICS_INGEST_ENABLED=false`. Cuando esté desactivado SHALL rechazar controladamente toda petición válida y efectuar cero lecturas/escrituras de métricas. Cuando esté habilitado tras autorización explícita, SHALL aplicar límites de tamaño y trabajo por solicitud y el binding de rate limiting del Worker configurado para el endpoint. El binding actual limita aproximadamente 120 solicitudes por minuto por IP y puede permitir excesos durante sincronización; su disponibilidad y respuestas SHALL documentarse. Una regla WAF perimetral exacta puede añadirse cuando el plan lo permita, pero no SHALL ampliarse una regla a otros hosts ni será requisito para la activación autorizada. El agotamiento de cuota o fallo de D1 SHALL fallar cerrado; el juego SHALL seguir funcionando de forma independiente.

#### Scenario: Kill switch apagado
- **GIVEN** `METRICS_INGEST_ENABLED=false`
- **WHEN** se recibe un lote válido
- **THEN** se rechaza de forma controlada y D1 permanece sin cambios

#### Scenario: Rate limit aproximado
- **GIVEN** el binding está configurado a 120 solicitudes por minuto por IP
- **WHEN** el límite local de Cloudflare rechaza una solicitud
- **THEN** el servicio responde 429 antes de leer o escribir D1, y los reportes no presentan los eventos rechazados como datos recibidos

#### Scenario: Cuota, D1 o protección no disponible
- **WHEN** se agota una cuota, falla D1 o falta el binding de rate limiting
- **THEN** la ingesta no confirma una escritura no realizada, no hace fallback a Pages y no afecta el juego

#### Scenario: Cuota, D1 o protección perimetral no disponible
- **WHEN** se agota una cuota, falla D1 o la ruta/binding de rate limiting requerido no está disponible
- **THEN** la ingesta no confirma una escritura no realizada, no hace fallback a Pages, no amplía el impacto a otros hosts y no afecta el juego
