# Múltiplo — Experiencia de usuario y diseño de interacción
**Versión:** MVP v1.0 · **Audiencia:** niño de 6 años · **Dispositivos:** celular, tablet, computador.

## 1. Promesa de experiencia
En pocos segundos el niño debe entender qué hacer: ver la estrella, pulsar **Jugar**, escuchar/leer una consigna, tocar una de tres respuestas y recibir una reacción cálida. La interfaz no debe sentirse como un examen.

### Principios
1. **Un objetivo visible por pantalla.** Números grandes; instrucciones de una frase cuando sea posible.
2. **Toque o clic, nunca precisión fina.** Sin arrastrar, escribir resultados, gestos o navegación escondida.
3. **Feedback inmediato y claro.** Acierto, error y progreso no dependen únicamente del color.
4. **Ritmo autónomo.** No hay tiempo límite ni cambios de pantalla antes de permitir comprender lo ocurrido.
5. **Voz + texto equivalentes.** El niño puede continuar aunque el dispositivo no reproduzca audio.
6. **Seguridad emocional.** Mensajes positivos incluso si no alcanzó el umbral de desbloqueo.
7. **Una única experiencia adaptable.** Sin flujos separados ni productos distintos por dispositivo.

## 2. Mapa de navegación
\`\`\`mermaid
flowchart TD
  A[Inicio y niveles] -->|Jugar nivel disponible| B[Aprende: grupos, suma, multiplicación]
  B -->|Continuar| C[Pregunta 1 de 4]
  C --> D[Pregunta 2 de 4]
  D --> E[Pregunta 3 de 4]
  E --> F[Pregunta 4 de 4]
  F --> G[Fin de ronda]
  G -->|Repetir| B
  G -->|Siguiente nivel desbloqueado| B
  G -->|Volver a niveles| A
\`\`\`
Los cuatro estados de pregunta reutilizan **la misma pantalla Juego**; feedback de error/acierto se presenta sin crear nuevas pantallas.

## 3. Especificación por pantalla
### 3.1 Inicio y niveles
**Elementos:** logo Múltiplo, estrella normal, saludo hablado/escrito, botón Jugar (nivel disponible), cuatro tarjetas para tablas 2–5 con estado disponible/bloqueado, botón de sonido. Al primer acceso, el nivel 1 es el punto de entrada.

**Flujo:** tocar Jugar abre Aprender del nivel seleccionado. Los niveles cerrados se muestran, pero no permiten entrar. Al volver desde fin de ronda, conservar los desbloqueos.

**Copia orientativa:** «¡Hola! Soy Múltiplo. ¡Vamos a aprender jugando!».

### 3.2 Aprende
**Elementos:** estrella hablando, cantidad de grupos visiblemente separados, objetos por grupo, suma repetida y multiplicación equivalente; botón Continuar y botón repetir voz.

**Secuencia:** mostrar primero grupos, después relacionar suma y multiplicación; el niño controla cuándo avanzar. Un ejemplo no debe durar más que la paciencia del usuario: evitar exposiciones largas o bloqueos temporizados.

**Copia:** «Tres grupos de dos manzanas. Dos más dos más dos son seis. Tres por dos son seis».

### 3.3 Juego
**Elementos constantes:** progreso visible «Pregunta 1 de 4», estrella, consigna simple, tres botones/opciones grandes, botón Pista si aporta información nueva, botón repetir voz y silenciar.

- **Contar grupos:** grupos de objetos visibles más alternativas numéricas.
- **Resolver multiplicación:** operación y tres resultados; la pista presenta grupos.
- **Encontrar multiplicación:** resultado y tres operaciones; la pista presenta grupos de la operación objetivo sin introducir falsedades.
- **Acierto:** estrella celebrando, breve audio, texto como «¡Muy bien!», y acción para siguiente pregunta.
- **Error:** estrella pensando, texto «Cuenta otra vez», pista visual y posibilidad de seleccionar de nuevo. No restar estrellas ya ganadas.
- **Evitar respuestas accidentales:** mantener una transición comprensible después del acierto; no forzar cronómetros.

**Nota:** «cinco actividades por ronda» se muestra al niño como una explicación inicial y cuatro preguntas. El marcador de preguntas del juego es «1 de 4» a «4 de 4», no «1 de 5» para la evaluación.

### 3.4 Fin de ronda
**Elementos:** estrella celebrando, estrellas obtenidas entre 0 y 4, frase positiva, botón Repetir, acción Volver a niveles y botón Siguiente nivel **solo si existe y está desbloqueado**.

**Copia:** «¡Fantástico! Ganaste tres estrellas». Con pocos aciertos: «¡Buen esfuerzo! ¿Jugamos otra vez?» (evitar «Perdiste» o «Fallaste»).

## 4. Estados y eventos
| Evento | Reacción visual | Voz/sonido | Estado del juego |
|---|---|---|---|
| Iniciar | Estrella normal → hablando | Saludo / instrucción tras gesto | Entra nivel disponible |
| Iniciar explicación | Aparecen agrupaciones | Narración corta | No puntúa |
| Seleccionar correcta al primer intento | Estrella celebrando, indicador ganado | Efecto de acierto + felicitación | Marca primera respuesta correcta |
| Seleccionar incorrecta | Estrella pensando y pista | Sonido suave y frase amable | Primera respuesta marcada como error; admite más intentos |
| Solicitar pista | Aparecen grupos | Explicación breve, si habilitado | Sin alterar respuesta o puntaje |
| Completar cuarta pregunta | Pantalla final | Efecto de celebración | Calcula estrellas y avance |
| Silenciar | Icono de sonido apagado | Detiene o evita nueva voz/efectos | Conserva preferencia local |
| Repetir voz | Resalta/repite instrucción vigente | Se reproduce una sola vez | No altera pregunta |

## 5. Identidad visual
Referencia canónica: [ASSETS.md](ASSETS.md), con SVG de los estados de la estrella, manzana y cuatro WAV. Dirección visual aprobada: fondos claros, colores alegres, esquinas redondeadas y pocos elementos por pantalla.

- Tipografía recomendada: **Nunito** para texto y cifras; **Baloo 2** para títulos, con fallback legible. No es necesario incorporar binarios de fuentes.
- En celular: jerarquía vertical y zonas táctiles generosas; no superar ancho útil.
- En tablet: aprovechar espacio para grupos sin llenar la pantalla.
- En computador: misma mecánica, centrada visualmente; mouse funcional.
- No depender solo de amarillo/verde/rojo para explicar un resultado. Texto e iconografía lo refuerzan.
- Animaciones pequeñas y cortas, y respetar la preferencia del sistema por reducir movimiento cuando sea posible.

## 6. Voz y ausencia de voz
- La voz explica solo información que el niño también puede ver.
- En español, ritmo sereno, frases cortas y un solo mensaje audible a la vez.
- El primer intento de hablar debe ocurrir después de que el usuario pulse Jugar; la reproducción automática puede estar limitada en navegadores.
- Un botón permite repetir la instrucción vigente; otro activa/desactiva sonido (incluye efectos).
- Si la voz del navegador no está disponible, carga tarde o no es española, el texto permanece y el juego sigue operando. No bloquear la ronda.
- Los WAV del repo son efectos, **no** locuciones pregrabadas.

## 7. Comportamiento en situaciones menos felices
- Si el niño falla muchas veces: conservar la pregunta y la pista, no castigar ni incrementar dificultad.
- Si se cierra la pestaña durante una ronda: persistir como mínimo los **niveles ya desbloqueados**; **reanudar exactamente a mitad de ronda no es un requisito**.
- Si se borran datos locales: puede volver a nivel 1. No prometer recuperación remota.
- Si la PWA no es instalable en un navegador: el juego continúa funcionando como página web.
- Si faltan efectos sonoros: no bloquear interacción o lectura de instrucciones.

## 8. Estados de pantalla a validar
Inicio primer acceso; nivel bloqueado; nivel disponible; aprende; pregunta visual; pregunta sin objetos; pista; error y reintento; acierto; final con 0–2 aciertos; final con 3–4 aciertos; nivel 4 terminado; voz deshabilitada.

## 9. Fuera de experiencia MVP
Gestos, teclado obligatorio, avatar personalizable, múltiples mundos, tienda de premios, anuncios, chat, competición, cuentas, panel del adulto, recopilación de datos del niño.

**Vínculos:** [LEARNING_MODEL.md](LEARNING_MODEL.md), [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md), issues #1, #2, #3, #4 y #6.
