# Múltiplo — Trazabilidad de objetivos a requisitos, issues y activos
**Estado:** matriz de producto pre-implementación, no evidencia de funcionalidad entregada.

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
| RF-02 | Estrella guía, instrucciones voz+texto, repetir/silenciar | D-005, D-006 | [#2](https://github.com/silverberdi/multiplo/issues/2) | Q-01, Q-09 |
| RF-03 | Demostración de grupos, suma y producto | D-002, D-003, D-008 | [#3](https://github.com/silverberdi/multiplo/issues/3) | Q-02 |
| RF-04 | Tres tipos de ejercicio, tres respuestas únicas, pistas | D-009, D-010 | [#4](https://github.com/silverberdi/multiplo/issues/4) | Q-03, Q-04 |
| RF-05 | Reintentos sin sanción y primer intento inmutable | D-010, D-019 | [#4](https://github.com/silverberdi/multiplo/issues/4) | Q-04, Q-06 |
| RF-06 | Cuatro niveles y umbral 3/4 | D-007, D-011 | [#5](https://github.com/silverberdi/multiplo/issues/5) | Q-05, Q-06, Q-07 |
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
