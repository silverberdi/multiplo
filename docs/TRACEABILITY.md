# Múltiplo — Trazabilidad de objetivos a requisitos, issues y activos
**Estado:** matriz actualizada con trazabilidad técnica de v1.2; no sustituye la evidencia de Verify.

## Request #33 — celebraciones breves y variadas

| Comportamiento | Implementación | Evidencia Apply |
|---|---|---|
| Acierto ordinario: feedback textual/semántico inmediato, estado celebrando y `acierto.wav`, sin felicitación Fola repetitiva | `js/app.js`, `js/star-guide.js`, `css/styles.css` | `tests/request-33-celebration.test.js`, `tests/fola-audio-routing-e2e.test.js` |
| Voz reservada para bienvenida, Aprende, consigna, pista y cierre; cancelación de voz/efectos obsoletos | `js/app.js`, `js/star-guide.js` | `tests/request-33-celebration.test.js`, `tests/fola-audio-routing-e2e.test.js` |
| Silencio, fallback de reproducción, reduced-motion y continuidad rápida | `js/star-guide.js`, `css/styles.css` | `tests/request-33-celebration.test.js`, `tests/fola-audio-routing-e2e.test.js` |

La evidencia de Apply de Request #33 se ejecuta en el worktree candidato con los comandos y exit codes registrados en sus tareas OpenSpec. No afirma Verify, revisión independiente, validación humana, publicación ni despliegue.

## Request #32 — concordancia singular/plural en grupos dirigidos

| Comportamiento | Implementación | Evidencia Apply |
|---|---|---|
| Composición común `a×b`, con `a=1` en singular y `b=1` como «una manzana» | `js/aprende.js`, `js/question-engine.js` | `tests/request-32-singular-plural.test.js` |
| Aprende, pistas y narración conservan la orientación dirigida y los assets existentes | `js/aprende.js`, `js/question-engine.js`, `js/star-guide.js` | `tests/request-32-singular-plural.test.js`, `tests/request-32-singular-plural-e2e.test.js` |
| Fallback no bloqueante ante fallo de reproducción Fola | `js/star-guide.js` | `tests/request-32-singular-plural.test.js`, suite Fola de `npm test` |
| Responsive y producto alto sin regresión | `tests/request-32-singular-plural-e2e.test.js`, `tests/v12-e2e.test.js` | `npm run test:e2e` |

La evidencia de Apply de este cambio se ejecutó en el worktree activo con `npm run test:unit`, `npm run test:e2e` y `npm test`, todos con exit code 0. La búsqueda de plantillas no encontró formas discordantes en código ni recorridos afectados. Esta sección no certifica Verify, revisión independiente, publicación ni despliegue.

Cobertura de requisitos: Request #32 afecta RF-02, RF-03 y RF-04, además de RNF-02, RNF-05 y RNF-07; los escenarios de singular/plural, orientación `a×b`, pista, fallback y responsive están cubiertos por las pruebas citadas arriba.

## Request #29 — estrellas, dominio y cierre condicionado

| Comportamiento | Implementación | Evidencia Apply |
|---|---|---|
| Estrellas separadas del dominio; tabla 1 avanza con >=3/4 y tablas 2–10 requieren rondas + 7 factores | `js/progression.js`, `js/app.js` | `tests/v12-change.test.js`, `tests/v12-e2e.test.js` |
| Factores pendientes dirigidos, primer intento y repaso separados | `js/question-engine.js`, `js/app.js` | `tests/v12-change.test.js` |
| Cierre muestra rondas/factores pendientes y no ofrece tabla inexistente | `index.html`, `js/app.js` | `tests/v12-e2e.test.js` |
| Persistencia local defensiva y acceso tras recarga | `js/progression.js` | `tests/v12-change.test.js`, `tests/v12-e2e.test.js` |

La evidencia candidata se obtuvo con `npm run test`, `npm run test:unit` y `npm run test:e2e`, todos con salida 0. El paquete Fola ignorado se preparó con SHA-256 `202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929` según `docs/ASSETS.md`; no forma parte del candidato Git.

## Request #21

| Requisito | Implementación | Evidencia |
|---|---|---|
| Catálogo de 100 parejas dirigidas | `js/progression.js`, `js/question-engine.js` | `tests/v12-change.test.js` |
| Aprende y pistas hasta 10×10 | `js/aprende.js`, `css/styles.css`, `js/app.js` | `tests/v12-change.test.js`, `tests/v12-e2e.test.js` |
| Dominio, migración y tolerancia local | `js/progression.js` | `tests/v12-change.test.js` |
| Voz Fola/fallback y recursos existentes | `js/star-guide.js`, `js/fola-catalog.js` | suites Fola existentes y E2E |

## 1. Convenciones
- **OBJ:** objetivo de producto o aprendizaje.
- **RF:** requisito funcional.
- **RNF:** restricción no funcional.
- **D:** decisión documentada en [DECISIONS.md](DECISIONS.md).
- **Issue:** unidad de entrega planificada en GitHub (no representa implementación terminada).
- **Q:** escenario transversal verificable en [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md).

## 2. Objetivos y cobertura
| Objetivo | Resultado observable esperado | Requisitos | Issues | Evidencia |
|---|---|---|---|---|
| OBJ-01 Comprender multiplicaciones | Relaciona grupos + suma + producto | RF-03, RF-04 | #3, #4 | Q-02, Q-03 |
| OBJ-02 Jugar autónomamente | Puede usar voz, texto y controles simples | RF-01, RF-02 | #1, #2 | Q-01, Q-09, Q-10 |
| OBJ-03 Practicar sin miedo al error | Pide pistas, reintenta sin castigo | RF-04, RF-05 | #4, #6 | Q-04 |
| OBJ-04 Avanzar gradualmente | Desbloqueo comprobable según aciertos iniciales | RF-06, RF-07 | #5, #6 | Q-05–Q-08 |
| OBJ-05 Validar un MVP rápido | Una ronda jugable en 3 factores de forma | RNF-01–RNF-05 | #1–#7 | Q-01–Q-12 + observación |

## 3. Requisitos funcionales
| ID | Descripción | Decisión | Issue principal | Escenario(s) |
|---|---|---|---|---|
| RF-01 | Inicio y cuatro vistas con acciones claras | D-004, D-013 | [#1](https://github.com/silverberdi/multiplo/issues/1) | Q-01, Q-10 |
| RF-02 | Estrella guía, instrucciones voz+texto, repetir/silenciar y clips Fola preparados | D-005, D-006 | [#2](https://github.com/silverberdi/multiplo/issues/2), Request #20 | Q-01, Q-09, Q-10 |
| RF-03 | Demostración de grupos, suma y producto | D-002, D-003, D-008 | [#3](https://github.com/silverberdi/multiplo/issues/3) | Q-02 |
| RF-04 | Tres tipos de ejercicio, tres respuestas únicas, pistas | D-009, D-010 | [#4](https://github.com/silverberdi/multiplo/issues/4) | Q-03, Q-04 |
| RF-05 | Reintentos sin sanción y primer intento inmutable | D-010, D-019 | [#4](https://github.com/silverberdi/multiplo/issues/4) | Q-04, Q-06 |
| RF-06 | Tablas 1–10, dominio acumulado y cierre sin tabla 11 | D-007, D-011, Request #21 | [#5](https://github.com/silverberdi/multiplo/issues/5) | Q-05, Q-06, Q-07 |
| RF-07 | Progreso local y repetición de niveles | D-012 | [#5](https://github.com/silverberdi/multiplo/issues/5) | Q-08 |
| RF-08 | Recompensas y cierre positivo | D-006, D-008 | [#6](https://github.com/silverberdi/multiplo/issues/6) | Q-05–Q-07 |
| RF-09 | PWA cuando soporte exista | D-014 | [#1](https://github.com/silverberdi/multiplo/issues/1) | Q-11 |

## 4. Requisitos no funcionales
| ID | Restricción | Issues | Validación |
|---|---|---|---|
| RNF-01 | Web responsive: celular, tablet y PC, toque/clic | #1, #7 | Q-10 |
| RNF-02 | Voz degradable a texto; audio no bloqueante | #2, #7 | Q-09 |
| RNF-03 | Privacidad: sin datos personales, cuentas, telemetría infantil | #1–#7 | Q-12 |
| RNF-04 | Stack estático ligero, sin backend ni IA | #1–#7 | Inspección de dependencias |
| RNF-05 | Reglas matemáticas correctas | #3, #4, #5, #7 | Q-02–Q-07 |
| RNF-06 | Persistencia local sin sincronización | #5, #7 | Q-08 |
| RNF-07 | Controles grandes, texto breve, feedback no dependiente solo de color | #1, #2, #7 | Q-01, Q-10 |

La implementación de Request #20 añade la preparación reproducible de Fola v1.1.0, sin versionar sus WAV; la evidencia publicada del ZIP se conserva en las tareas OpenSpec y no se considera por sí sola evidencia de candidate SHA.

## 5. Activos ya disponibles
| Recurso | Issues consumidores |
|---|---|
| [Estrella normal](../assets/mascot/normal.svg) | #1, #2, #5 |
| [Estrella hablando](../assets/mascot/hablando.svg) | #2, #3 |
| [Estrella pensando](../assets/mascot/pensando.svg) | #2, #4 |
| [Estrella celebrando](../assets/mascot/celebrando.svg) | #2, #4, #6 |
| [Manzana](../assets/objects/manzana.svg) | #3, #4 |
| [Estrella premio](../assets/icons/estrella-premio.svg) | #1, #5, #6 |
| [Acierto](../assets/audio/acierto.wav), [Intento](../assets/audio/intento.wav), [Celebración](../assets/audio/celebracion.wav), [Clic](../assets/audio/clic.wav) | #2, #4, #6 |
| [Paleta y tipografías](ASSETS.md) | #1, #2, #7 |

## 6. Comprobación de cobertura para un agente
Para cada propuesta OpenSpec:
1. Identificar el issue y uno o más RF/RNF relacionados.
2. Verificar decisiones D aplicables.
3. Referenciar los activos existentes cuando resuelven la necesidad.
4. Formular escenarios Gherkin para cada comportamiento observable.
5. Asegurar que no modifica silenciosamente los invariantes del modelo pedagógico.
6. Mantener las especificaciones canónicas de OpenSpec alineadas al comportamiento **efectivamente implementado**; no declararlas cumplidas solo por haber escrito estos documentos.

**Fuentes principales:** [PRODUCT_VISION.md](PRODUCT_VISION.md), [MVP.md](MVP.md), [LEARNING_MODEL.md](LEARNING_MODEL.md), [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md).
