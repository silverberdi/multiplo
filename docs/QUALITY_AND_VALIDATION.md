# Múltiplo — Calidad, aceptación y validación con usuario
**Alcance:** MVP v1.2. El objetivo es probar un juego completo y comprensible para un niño de 6 años, no una infraestructura compleja.

## Registro técnico v1.2 — Request #21

Las pruebas deterministas cubren 100 parejas, orientación 2×3/3×2, rondas actual/repaso, alternativas, dominio, migración y almacenamiento defensivo. Chromium cubre 360×667 y el caso visual 10×10 sin overflow. Esto no declara despliegue ni validación presencial.

## 1. Calidad mínima exigible
- **Matemáticas correctas**: grupos, sumas, operaciones y opciones corresponden exactamente.
- **Autonomía**: la navegación es reconocible sin depender de leer instrucciones largas.
- **Accesibilidad funcional**: voz y texto, botones grandes, pantallas adaptadas y feedback que no depende solo de colores.
- **Ausencia de castigos**: errores no bloquean el progreso ni eliminan oportunidades de practicar.
- **Fiabilidad**: puntaje de primer intento, desbloqueo y datos locales consistentes.
- **Privacidad**: sin cuentas, nombres de menores, anuncios, identificadores persistentes ni transmisión de actividad.
- **V3-01 (#42)**: el historial educativo es local, acotado, separado del progreso y nunca transmite eventos.
- **Sencillez técnica**: sin dependencias ni servicios que no aporten valor directo.

## 2. Escenarios transversales de aceptación
### Q-01 — Primer inicio
**Given** un navegador sin progreso anterior
**When** el jugador pulsa Jugar
**Then** entra a la tabla 1 y la estrella presenta la experiencia mediante texto y voz si está disponible.

### Q-02 — Relación matemática
**Given** la demostración de `3×2`
**When** la pantalla Aprender se presenta
**Then** existen tres grupos con dos manzanas cada uno, la suma `2+2+2=6` y la multiplicación `3×2=6`.

### Q-03 — Preguntas inequívocas
**Given** cualquiera de las cuatro preguntas de una ronda
**When** aparecen las tres alternativas
**Then** son tres opciones diferentes y exactamente una es correcta; su orden no es siempre igual.

### Q-04 — Error con reintento
**Given** una primera respuesta incorrecta
**When** el jugador pide pista y luego acierta
**Then** la ronda continúa sin castigo, pero esa pregunta no cuenta como acierto de primer intento.

### Q-05 — Puntaje y desbloqueo
**Given** cuatro preguntas evaluables
**When** tres son correctas al primer intento
**Then** se muestran tres estrellas y se desbloquea el nivel siguiente, si existe.

### Q-06 — Umbral insuficiente
**Given** cuatro preguntas evaluables
**When** dos son correctas al primer intento y dos se corrigen después
**Then** solo obtiene dos estrellas y no se desbloquea un nivel nuevo.

### Q-07 — Fin de la tabla 10
**Given** que la ronda corresponde a la tabla 10
**When** finaliza
**Then** puede repetirla o volver a tablas y nunca se presenta una tabla 11.

### Q-08 — Persistencia local
**Given** que se desbloqueó la tabla 2
**When** se cierra y reabre el mismo navegador sin borrar datos
**Then** la tabla 2 continúa disponible.

### Q-09 — Fallback de voz
**Given** que no se puede usar voz del navegador o está silenciada
**When** se completa el juego
**Then** las instrucciones escritas y las pistas siguen permitiendo terminar la ronda.

### Q-10 — Responsive
**Given** que el juego se abre en celular, tablet o computador
**When** se completan los cuatro tipos de estado (Aprender, pregunta, pista y resultado)
**Then** no existe desbordamiento horizontal ni controles esenciales inaccesibles.

### Q-11 — PWA progresiva
**Given** un navegador que soporta instalación PWA
**When** el usuario agrega Múltiplo como aplicación
**Then** el acceso instalado abre el juego; donde no hay soporte, funciona en el navegador web.

### Q-12 — Sin recolección infantil
**Given** cualquier ronda normal
**When** el usuario juega, acierta, se equivoca y reabre
**Then** no se solicita ni transmite nombre, ubicación, escuela, foto, identificador, credenciales ni perfil.

### V3-01 — historial educativo local
#### Q-13 — No inicia historial al abrir Inicio
**Given** la aplicación se carga sin iniciar una ronda
**When** se consulta `multiplo_learning_history_v1`
**Then** no se ha creado una sesión de juego ni sumado tiempo activo.

#### Q-14 — Primer intento y repaso
**Given** una respuesta se corrige tras un error o la pregunta pertenece a repaso
**When** la actividad se resuelve
**Then** el historial conserva el primer resultado, intentos, pista, origen y par dirigido real una sola vez.

#### Q-15 — Ronda y sesión
**Given** cuatro preguntas completadas y luego otra ronda iniciada antes de volver a Inicio
**When** se confirma el cierre de cada ronda
**Then** ambas rondas pertenecen a una sesión; cada cierre ocurre una sola vez y una ronda incompleta solo se abandona al volver explícitamente a Inicio.

#### Q-16 — Interrupción y tiempo activo
**Given** una actividad guardada queda activa
**When** se oculta la pestaña o se recarga/cierra inesperadamente
**Then** no se suma el periodo oculto ni se inventa hora de fin; la actividad se marca interrumpida al próximo inicio si hay evidencia guardada.

#### Q-17 — Métricas y denominadores
**Given** hay actividad local de varias fechas UTC, tablas y pares dirigidos
**When** se calculan métricas
**Then** se aplican las fórmulas del Issue #42 y los denominadores vacíos producen `null`/«Sin datos».

#### Q-18 — Retención acotada
**Given** hay detalle vencido o el historial excede sus límites
**When** se compacta
**Then** conserva acumulados permitidos en dimensiones fijas y elimina detalle antiguo sin tocar el progreso.

#### Q-19 — Aislamiento, degradación y ausencia de red
**Given** storage está bloqueado, corrupto, lleno o el navegador está desconectado tras cargar
**When** se juega y se registra historial
**Then** el juego/progreso siguen funcionando, `multiplo_progression_v1` permanece intacto y no sale ninguna solicitud con métricas.

**Evidencia de Apply V3-01:** `tests/learning-history.test.js` cubre métricas, fechas UTC, retención, almacenamiento y aislamiento; `tests/learning-history-e2e.test.js` recorre varias rondas reales de UI, reintento/pista, offline, interrupción y documento oculto. `npm test` terminó con 68 aprobadas, 33 omitidas y 0 fallidas. Esta evidencia técnica no declara despliegue ni validación con un niño.

## 3. Matriz de pruebas funcionales
| Área | Pruebas mínimas | Modalidad |
|---|---|---|
| Matemáticas | Todas las combinaciones 1–10 × 1–10; sumas y grupos; distractores únicos | Automatizada prioritaria |
| Generador | Variedad, ausencia de duplicados en ronda si es posible, única correcta | Automatizada |
| Estado | Primer intento correcto; error corregido; 0/4, 2/4, 3/4 y 4/4 | Automatizada |
| Progreso | Primer acceso; secuencia de desbloqueo; repetir niveles; nivel final | Automatizada + manual |
| Voz | Iniciar tras gesto, repetir, silenciar, falta de API | Manual o simulación de API |
| UI | Botones, texto, pistas, animaciones no bloqueantes | Navegador |
| Persistencia | Recarga normal, almacenamiento denegado, datos eliminados | Navegador |
| PWA | Manifiesto, iconos, apertura instalada, fallback web | Dispositivo compatible |
| Recursos | SVG legibles, WAV audibles y volumen discreto | Manual + revisión de rutas |

No inventar un mínimo de 1.000 tests ni instalar múltiples frameworks de automatización para cumplir esta matriz. Primero las invariantes del juego.

## 4. Dispositivos y navegadores
Exigir **al menos una prueba real** de cada formato:
- Celular táctil en orientación vertical.
- Tablet táctil (vertical u horizontal).
- Computador con mouse.

Registrar navegador y sistema operativo reales probados, sin asumir que fueron validados antes de hacerlo. Probar voz y PWA en los navegadores donde esas capacidades existan; un navegador que no soporta PWA no debe fallar la aceptación de la versión web.

### Registro de validación técnica — MVP-04 (Motor de preguntas evaluables)
- **Fecha / Entorno:** Linux x86_64, Chromium/Google Chrome (Puppeteer-core headless/headed execution) y servidor estático local Node.js v22.
- **Formatos y viewports verificados:**
  1. *Celular:* 375×667 px (vertical) y 667×375 px (horizontal) — Sin desbordamiento horizontal (`scrollWidth <= clientWidth`), botones táctiles con altura mínima >= 44px/52px.
  2. *Tablet:* 768×1024 px — Cuadrícula responsive de alternativas y grupos visuales de hasta 5×5 manzanas sin overflow.
  3. *Computador:* 1280×800 px — Interacción fluida con cursor/mouse, teclado y estados focus-visible.
- **Escenarios comprobados:**
  - *Voz activa y fallback sin voz:* Ejecución normal con locuciones Fola pregrabadas y degradación elegante ante fallo de carga o reproducción; los textos visibles y la interacción se mantienen sin bloqueo (Q-09).
  - *Modo silencioso:* El conmutador único silencia tanto locución como efectos WAV (`intento.wav`, `acierto.wav`); el flujo visual y la navegación continúan idénticos.
  - *Pistas contextuales:* En pregunta 4 (multiplicación sin objetos por defecto), pulsar «💡 Pista» revela los `a` grupos de `b` manzanas sin mutar la operación ni las alternativas. En pregunta 5 (selección de operación), la pista visual muestra los grupos correspondientes a la operación objetivo.
  - *Evaluación pedagógica:* Acierto inicial registra la pregunta como acertada; error inicial activa feedback empático «Cuenta otra vez», sonido `intento.wav` y estado `pensando`, permitiendo reintentos ilimitados. Al acertar en un reintento tardío, la pregunta permite continuar pero su registro de primer intento permanece inmutablemente como no acertado.
  - *Evaluación por producto:* En la pregunta 5, la alternativa correcta se determina estrictamente por `a × b = producto objetivo`, no por la posición visual del botón.
  - *Ronda incompleta:* Salir al Inicio desde Juego no corrompe la sesión ni altera la siguiente ronda limpia.
  - *Cierre de ronda:* Entrega a la vista Fin el resumen inmutable de 0–4 aciertos de primer intento, sin avance automático de nivel y habiendo retirado el texto/markup estático de recompensas previo al Change #6.
- **Nota metodológica:** Esta validación corresponde a pruebas técnicas y heurísticas automatizadas/asistidas en entorno local; no constituye validación presencial con niños de seis años.

### Registro de validación técnica — MVP-05 (Progresión de tablas 1 a 10, dominio y persistencia local)
- **Fecha / Entorno:** Linux x86_64, Chromium/Google Chrome (Puppeteer-core) y servidor estático local Node.js v22.
- **Formatos y viewports verificados:**
  1. *Celular:* 375×667 px (vertical) y 667×375 px (horizontal) — Selección de tablas 1 a 10 con tarjetas táctiles accesibles (altura mínima >= 44px), visualización clara de estados abierto/bloqueado, badge textual «Disponible» / «🔒 Bloqueado» y cero desbordamiento horizontal (`scrollWidth <= clientWidth`).
  2. *Tablet:* 768×1024 px — Cuadrícula responsive de 2 columnas de niveles, aviso de almacenamiento no intrusivo y botones de Fin de ronda («Siguiente nivel», «Repetir ronda», «Volver a niveles») adaptados sin solapamiento.
  3. *Computador:* 1280×800 px — Navegación completa mediante mouse y teclado (focus-visible, tabulación natural en niveles disponibles, niveles bloqueados con `disabled` y `aria-disabled="true"`).
- **Escenarios comprobados:**
  - *Estado inicial:* Tabla 1 desbloqueada y disponible; tablas 2–10 bloqueadas sin lógica ni progreso ficticio. El desbloqueo es estrictamente secuencial y prefijo.
  - *Dominio acumulado:* La tabla 1 usa `>=3/4`; una tabla posterior exige dos de las últimas tres rondas calificadas y siete factores distintos acertados inicialmente, muestra en Fin el mensaje de felicitación y ofrece la siguiente tabla sólo cuando corresponde.
  - *Dominio insuficiente con respuestas corregidas:* Los aciertos posteriores al primer intento no cuentan para dominio; la tabla siguiente permanece bloqueada y se ofrece repetir sin penalización adicional.
  - *Conservación ante fallos:* Jugar un nivel ya abierto y fallar no bloquea ni revierte niveles previamente desbloqueados.
  - *Cierre de tabla 10 (invariante v1.2):* Completar la tabla 10 permite repetir o volver a tablas anteriores y nunca muestra ni ofrece una inexistente tabla 11.
  - *Persistencia en localStorage:* Escritura y recarga en el mismo navegador conservan el nivel máximo alcanzado y la preferencia de sonido (`multiplo_progression_v1` y `multiplo_sound_enabled`).
  - *Aislamiento entre navegadores/contextos:* El progreso desbloqueado en un contexto de navegador no se fuga ni afecta a una sesión independiente o incógnita.
  - *Tolerancia y degradación elegante:* Ante `SecurityError`, almacenamiento bloqueado, cuota excedida o JSON corrupto en `localStorage`, la aplicación absorbe el error, inicia de forma segura en memoria en la tabla 1, muestra un aviso breve para adulto y permite jugar la ronda completa sin llamadas de red.
  - *Sonido persistido y voz:* El conmutador silencia efectos y locución, se almacena de forma defensiva y no impide el avance pedagógico de la ronda.
- **Nota metodológica:** Esta validación corresponde a pruebas técnicas deterministas y heurísticas automatizadas en entorno local; no constituye despliegue en producción ni validación presencial con niños de seis años.

## 5. Sesión observacional con el niño
Duración de una ronda: objetivo aproximado 3–5 minutos, sin cronómetro obligatorio.

**Guía para el adulto observador**
1. Iniciar el juego una vez; evitar explicar la respuesta de cada pregunta.
2. Observar si entiende dónde tocar y qué significa cada grupo.
3. Registrar si usa Pista, si pide ayuda y si termina la ronda.
4. Pedirle que cuente un ejemplo con objetos, sin convertirlo en una evaluación escolar.
5. Observar si expresa interés en volver a jugar.
6. Anotar únicamente hallazgos anónimos de la experiencia, por ejemplo «la instrucción 3 fue demasiado larga»; nunca nombre, foto, audio, fecha de nacimiento ni datos personales.

**Resultados a registrar:** bloqueante / importante / mejora sugerida, pantallas afectadas, evidencia reproducible y decisión de producto resultante. Las sesiones reales y sus hallazgos **no están todavía realizadas**.

## 6. Condiciones de salida del MVP
- Q-01 a Q-12 verificadas según el entorno que aplique, con evidencia.
- Sin errores conocidos que impidan completar una ronda.
- Sin respuestas matemáticas incorrectas o ambiguas.
- Efectos y voz no impiden jugar.
- Evaluación cualitativa documentada tras probar con el niño.
- El alcance final coincide con los documentos aprobados y los issues #1–#7.

## 7. Desviaciones
Si se descubre que una regla pedagógica no funciona (p. ej., no entiende «3 grupos de 2»), formular un hallazgo antes de ajustar. No reinterpretar el aprendizaje ni crear nuevas mecánicas sin registrar la decisión y abrir/ajustar el cambio OpenSpec correspondiente.

**Referencias:** [MVP.md](MVP.md), [LEARNING_MODEL.md](LEARNING_MODEL.md), [DECISIONS.md](DECISIONS.md) y [ROADMAP.md](ROADMAP.md).

## 8. V3-03 — validación local de métricas

`npm run test:metrics` ejecuta Worker con D1 local sintética, prueba la outbox en Chromium, construye el artefacto Pages allowlisted y verifica el reporte sintético y el periodo sin datos. Estas comprobaciones no usan D1 remota, no despliegan Worker/Pages y no habilitan transmisión real. El funcionamiento de rutas, permisos y Environment de producción requiere revisión en las cuentas antes de ejecutar workflows manuales.
