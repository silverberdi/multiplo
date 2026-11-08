# Múltiplo — Calidad, aceptación y validación con usuario
**Alcance:** MVP v1.0. El objetivo es probar un juego completo y comprensible para un niño de 6 años, no una infraestructura compleja.

## 1. Calidad mínima exigible
- **Matemáticas correctas**: grupos, sumas, operaciones y opciones corresponden exactamente.
- **Autonomía**: la navegación es reconocible sin depender de leer instrucciones largas.
- **Accesibilidad funcional**: voz y texto, botones grandes, pantallas adaptadas y feedback que no depende solo de colores.
- **Ausencia de castigos**: errores no bloquean el progreso ni eliminan oportunidades de practicar.
- **Fiabilidad**: puntaje de primer intento, desbloqueo y datos locales consistentes.
- **Privacidad**: sin cuentas, nombres de menores, anuncios, telemetría ni identificadores.
- **Sencillez técnica**: sin dependencias ni servicios que no aporten valor directo.

## 2. Escenarios transversales de aceptación
### Q-01 — Primer inicio
**Given** un navegador sin progreso anterior
**When** el jugador pulsa Jugar
**Then** entra al nivel 1 y la estrella presenta la experiencia mediante texto y voz si está disponible.

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

### Q-07 — Fin del nivel 4
**Given** que la ronda corresponde a la tabla del 5
**When** finaliza
**Then** puede repetirla o volver a niveles y nunca se presenta un quinto nivel.

### Q-08 — Persistencia local
**Given** que se desbloqueó nivel 2
**When** se cierra y reabre el mismo navegador sin borrar datos
**Then** nivel 2 continúa disponible.

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

## 3. Matriz de pruebas funcionales
| Área | Pruebas mínimas | Modalidad |
|---|---|---|
| Matemáticas | Todas las combinaciones 2–5 × 1–5; sumas y grupos; distractores únicos | Automatizada prioritaria |
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
