# Múltiplo — Registro de decisiones de producto y arquitectura

## D-21 — Catálogo y dominio v1.2

Request #21 sustituye los límites históricos 2–5 por tablas dirigidas 1–10, sin modificar el principio de no castigo. Se conserva `multiplo_progression_v1` como clave de migración idempotente hacia el estado v1.2, junto con sonido y fallos válidos. No se añaden TTS, backend, cuentas, analítica ni assets.
**Propósito:** evitar que un agente reabra acuerdos, rellene vacíos como hechos o introduzca soluciones más complejas de lo necesario.

**Estado de los acuerdos:** «Aprobada» = decidida en la conversación de definición del MVP; «Diseño de apoyo» = guía razonable derivada del alcance, revisable sin alterar la intención; «Pendiente» = todavía no decidida.

| ID | Decisión | Estado | Motivo y consecuencias |
|---|---|---|---|
| D-001 | Usuario objetivo: niño de 6 años | **Aprobada** | Lectura y abstracción en desarrollo; lenguaje simple, controles grandes |
| D-002 | Enseñar multiplicación **jugando** | **Aprobada** | Comprender grupos antes que memorizar respuestas |
| D-003 | Experiencia mixta: aprender + desafíos | **Aprobada** | Alternar ejemplo visual y práctica sin convertirse en una clase larga |
| D-004 | Dispositivos: celular, tablet y computador | **Aprobada** | Una web responsive, toque o clic |
| D-005 | Instrucciones con voz y texto | **Aprobada** | Autonomía aunque el niño lea poco |
| D-006 | Mascota: estrella amarilla | **Aprobada** | Guía cercana, cuatro estados expresivos simples |
| D-007 | Tablas 1–10 con factores 1–10 y dominio acumulado | **Aprobada por Request #21** | Sustituye los límites históricos v1.0; progresión gradual sin tabla 11 |
| D-008 | Cinco actividades por ronda: 1 ejemplo y 4 preguntas | **Aprobada** | Partidas breves, demostración no evaluable |
| D-009 | Tres modalidades de ejercicio | **Aprobada** | Variedad suficiente sin minijuegos adicionales |
| D-010 | Tres opciones por pregunta; pistas y reintentos ilimitados | **Aprobada** | Aprendizaje sin castigos |
| D-011 | Tabla 1 con `>=3/4`; tablas 2–10 con dos de tres rondas y siete factores | **Aprobada por Request #21** | Regla de juego, no certificación pedagógica |
| D-012 | Guardar progreso local sin cuentas ni backend | **Aprobada** | Velocidad, privacidad y baja infraestructura |
| D-013 | Diseño infantil, alegre, limpio y de botones grandes | **Aprobada** | Claridad y facilidad de uso en todas las pantallas |
| D-014 | HTML/CSS/JS, hosting estático y PWA | **Aprobada como solución para MVP** | Una sola aplicación, sencilla y sin tiendas nativas |
| D-015 | Voz del navegador y fallback escrito | **Diseño de apoyo** | Evita servicios externos y tolera diferencias entre plataformas |
| D-016 | Animaciones/efectos breves, sin música elaborada | **Diseño de apoyo** | No distraer de la operación, reducir tamaño/alcance |
| D-017 | No añadir backend de juego, IA, anuncios, monedas, ranking o paneles | **Aprobada con excepción técnica V3-02** | Evitar ingeniería ajena al objetivo inicial. #43 permite únicamente un receptor Worker/D1 de escritura agregada, separado y apagado para datos reales; no modifica el juego ni autoriza su conexión |
| D-018 | Recursos versionados en `assets/` y ligados a issues | **Diseño de apoyo** | Permite que el agente use material reproducible; evita adjuntos temporales |
| D-019 | Aciertos iniciales inmutables después de errores | **Aprobada (precisión de D-011)** | No permitir avanzar por ensayo repetido sin demostrar reconocimiento inicial |
| D-020 | Sin telemetría infantil ni identificadores del niño | **Diseño de apoyo con gate V3** | No recoger identidad ni presentar eventos como usuarios únicos o evidencia de aprendizaje. #43 permite probar un receptor aislado solo con datos sintéticos; ninguna actividad real sale del navegador hasta una evaluación de privacidad infantil y autorización operativa posteriores |
| D-021 | No exigir offline total ni notificaciones push | **Diseño de apoyo** | PWA no equivale a requisitos de caché avanzada o mensajería |
| D-022 | Modelo de negocio/comercialización | **Pendiente** | No asumir monetización, lanzamiento público ni SaaS |
| D-023 | Proveedor de hosting y URL final | **Pendiente** | Elegir al desplegar; mantener plataforma estática |
| D-024 | Framework de pruebas y empaquetado interno | **Pendiente para implementador** | La forma no debe introducir complejidad desproporcionada |
| D-025 | Ampliaciones posteriores a tablas 1–10 | **Pendiente de evidencia** | No ampliar catálogo ni mecánicas sin nuevo Change |

## Detalle de decisiones con riesgo de reinterpretación

### D-003 / D-008: modo mixto no significa varios juegos
La ronda aprobada contiene **un único recorrido**: ejemplo de grupos → dos ejercicios con objetos → un ejercicio de multiplicación → uno de selección de operación → resultado. No construir mundos ni selector de modos.

### D-007 / D-011 / D-019: tabla no es dominio escolar
La tabla 1 usa `>=3/4`; las tablas 2–10 requieren dominio acumulado. Una corrección posterior no suma ese acierto. Aun si no obtiene el umbral, puede completar la ronda y repetir.

Los límites 2–5, factores 1–5 y umbral único 3/4 de v1.0 quedan conservados sólo como historia supersedida.

### D-004 / D-014: web y PWA
Se utiliza una web adaptable y la opción de agregar a la pantalla de inicio cuando el navegador lo admita. No se promete paridad perfecta de instalación en todos los dispositivos ni desarrollo de apps en tiendas.

### D-005 / D-015: voz
El requisito firme es **voz + texto**. La síntesis nativa es la decisión de diseño más económica. Si falla en un navegador, conservar texto y permitir jugar; no asumir que una voz descargada ni una API externa estén autorizadas.

### D-012 / D-020: privacidad y progreso
Progreso solo en el navegador actual. No enviar datos del niño a servidores, sincronización ni analítica. Si se borran los datos del sitio, no hay restauración de progreso como parte del MVP.

**V3-01 (#42):** conserva en el mismo navegador historial educativo y agregados/deltas locales, sin identificadores persistentes ni transmisión; detalle de 90 días y límites definidos por su Change.

**V3-02 (#43):** excepción de arquitectura solo para un Worker/D1 separado, write-only, con ingestión apagada por defecto y pruebas sintéticas. El cliente no envía datos; UUID, CORS y `Origin` no autentican jugadores. La fuente es falsificable y no prueba niños únicos ni impacto causal. D1 conserva únicamente agregados, pero el proveedor puede procesar metadatos de red/logs: revisar esos metadatos, accesos, retención y supresión de celdas pequeñas antes de habilitar datos reales. Cualquier conexión desde el cliente o activación requiere V3-03 (#44), evaluación de privacidad infantil y autorización operativa explícita.

**V3-03 (#44):** la publicación Pages usa artefacto allowlisted; la outbox está separada y apagada; CI del Worker corre local con datos sintéticos. Deploy y migraciones D1 productivos son manuales y protegidos. El informe mensual es manual y combina D1 de solo lectura con una exportación de Cloudflare del mismo periodo. Estos cambios no autorizan transmisión real, route/WAF amplio ni billing. Ver [operación de métricas](../metrics/OPERATIONS.md).

### D-018: assets vs implementación
Los SVG y WAV son insumos aprobados para implementar. El rol de elaboración documental y multimedia es distinto del agente que construye la aplicación. No exigir regenerar recursos que ya existen sin motivo.

## Protocolo para cambiar una decisión
1. Enunciar el problema observado y la evidencia.
2. Identificar ID(s) afectados.
3. Comparar el beneficio con el costo de alcance, complejidad, experiencia infantil y privacidad.
4. Obtener aprobación de producto antes de modificar comportamiento comprometido.
5. Actualizar este registro y documentos relacionados.
6. Reflejar el cambio en issue(s) y artefactos OpenSpec.

**No convertir decisiones pendientes en requisitos silenciosos.**

## Documentos de soporte
[PRODUCT_VISION.md](PRODUCT_VISION.md) · [LEARNING_MODEL.md](LEARNING_MODEL.md) · [USER_EXPERIENCE.md](USER_EXPERIENCE.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [ROADMAP.md](ROADMAP.md).
