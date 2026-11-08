# Múltiplo — Roadmap de producto y entrega del MVP
**Versión:** MVP v1.0 · **Estado:** orden propuesto de ejecución a partir del backlog aprobado.

## 1. Objetivo del roadmap
Llegar **rápido a un juego completo que pueda probar un niño real**, evitando entregas que solo prueban infraestructura o pantallas aisladas. El trabajo se coordina con los issues ya creados: **no se necesita abrir nuevas épicas, proyectos, fases técnicas o tickets para reproducir esta tabla**.

No hay fechas ni estimaciones comprometidas. La secuencia expresa **dependencias y evidencia de salida**, no calendario.

## 2. Trayectoria de entrega
| Hito | Issues existentes | Entregable observable | Condición de salida |
|---|---|---|---|
| H0 — Contexto listo | Documentación (sin issue extra) | Visión, MVP, pedagogía, UX, decisiones, arquitectura, activos, trazabilidad, config OpenSpec | Agente puede comprender qué y por qué antes de planificar |
| H1 — Interfaz y guía | [#1](https://github.com/silverberdi/multiplo/issues/1), [#2](https://github.com/silverberdi/multiplo/issues/2) | Navegación adaptable, estrella, texto y voz | Juego abre en los tres factores de forma; voz tiene fallback |
| H2 — Aprendizaje y preguntas | [#3](https://github.com/silverberdi/multiplo/issues/3), [#4](https://github.com/silverberdi/multiplo/issues/4) | Demostración de grupos, tres tipos de ejercicio, feedback y pistas | Una ronda de 4 preguntas produce respuestas correctas verificables |
| H3 — Progresión y emoción | [#5](https://github.com/silverberdi/multiplo/issues/5), [#6](https://github.com/silverberdi/multiplo/issues/6) | Cuatro niveles, 3/4, progreso local, pantalla de celebración | El niño completa una ronda y puede repetir o avanzar según resultado |
| H4 — Validación MVP | [#7](https://github.com/silverberdi/multiplo/issues/7) | Juego probado en móvil, tablet y computador, más observación con niño | Se cumplen las reglas y se registran hallazgos sin datos personales |

### Dependencias reales (de los issues)
- #1 → #2 y #3.
- #1 + #3 → #4.
- #4 → #5.
- #2 + #5 → #6.
- #1–#6 → #7.

La numeración es identificador de backlog, no obligación de abrir siete iniciativas OpenSpec separadas si el implementador puede justificar una agrupación coherente y autorizada. Los cambios deben seguir el contrato de GitHub y no implementarse fuera del proceso establecido.

## 3. Definition of Ready para implementar un issue
- Enlace claro a la intención de producto, contratos y decisión aplicable.
- Alcance explícito, dependencias visibles y recursos disponibles.
- Gherkin suficiente para verificar el resultado sin interpretaciones contradictorias.
- Identificados los casos de error, fallback de voz y reglas matemáticas si aplican.
- Sin requisitos agregados por «comodidad técnica» que cambien la experiencia.

## 4. Definition of Done para el MVP completo
- Las cuatro vistas y el flujo de 5 actividades son jugables de extremo a extremo.
- Los 4 niveles funcionan sin errores de matemáticas ni distractores ambiguos.
- Las 4 preguntas evaluables puntúan correctamente solo en primer intento.
- Los bloqueos/desbloqueos y el progreso local sobreviven al cierre del navegador cuando los datos locales se conservan.
- La estrella y sus estados SVG se usan; la voz en español con texto de respaldo y los efectos no bloquean el juego.
- Compatible con toque/clic y sin desbordamiento horizontal en los tres tipos de dispositivo.
- Si el navegador soporta instalación PWA, la instalación es comprobable; si no, el sitio funciona.
- Prueba exploratoria con un niño, centrada en autonomía y comprensión. No es requisito observar una mejora escolar cuantificada.
- No contiene backend, cuentas, publicidad, telemetría infantil ni módulos fuera del MVP.

## 5. Secuencia de verificación
1. Pruebas automáticas concentradas en generación de problemas, unicidad de opciones, corrección, puntaje inicial y desbloqueo.
2. Prueba del ciclo completo con voz y sin voz en un navegador.
3. Verificación de layout y controles en celular, tablet y escritorio.
4. Sesión observacional con el niño, sin recopilar datos personales.
5. Clasificar problemas en **bloqueantes** (no puede jugar/entender), **importantes** (puede jugar con fricción) y **mejoras futuras** (no impiden validar MVP).
6. Corregir bloqueantes antes de declarar el MVP jugable. Mejoras no críticas pasan a backlog posterior.

Detalle: [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md).

## 6. Roadmap posterior (hipótesis, **no comprometido**)
La primera evaluación con el niño decide si existe valor para ampliar el producto. Posibilidades, solo si evidencia lo justifica:
- Ajustar ritmo, dificultad y diversidad de ejercicios.
- Mejorar ayudas visuales, accesibilidad o voz.
- Agregar tablas 6–10 o actividades de repaso, solo cuando el aprendizaje inicial esté validado.
- Soporte de más de un niño, reportes parentales o sincronización, **solo con una nueva decisión de privacidad y alcance**.
- Distribución más amplia o modelo comercial; **no están definidos**.

**No crear issues de estas hipótesis como si estuvieran aprobadas.**

## 7. Riesgos que pueden cambiar la prioridad
| Señal | Decisión que debe evaluarse |
|---|---|
| Niño no entiende grupos | Reforzar H2, no abrir mundos nuevos |
| Voz móvil falla | Mejorar texto y modo de repetición antes de cambiar el stack |
| Navegador no instala PWA | Verificar soporte y manifest, conservar uso web |
| Más de 3 opciones confunden | No ampliar: el contrato ya fija tres |
| El juego necesita persistir entre dispositivos | Registrar un cambio de visión y privacidad, no introducir backend en silencio |

## 8. Principio de ejecución
**Primero un juego útil; después refinamientos.** Toda desviación del contrato se documenta en [DECISIONS.md](DECISIONS.md) y se tramita mediante OpenSpec. Ver [OPENSPEC_HANDOFF.md](OPENSPEC_HANDOFF.md).
