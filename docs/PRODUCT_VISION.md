# Múltiplo — Intención de negocio y visión de producto
**Versión:** MVP v1.0 · **Estado:** intención y alcance aprobados para el primer producto; los resultados de aprendizaje aún no han sido validados con el niño.

## 1. ¿Por qué existe?
Múltiplo nace para ayudar a un niño de seis años a **descubrir qué significa multiplicar**, antes de exigirle memorizar tablas. La necesidad no es ofrecer un curso completo ni evaluar como un examen: es disponer de una experiencia breve, atractiva y autónoma, que convierta una idea abstracta (multiplicar) en grupos visibles de objetos.

### Problema por resolver
Las multiplicaciones expresadas solo como símbolos (\`3 × 2\`) pueden carecer de significado para un niño que todavía aprende a contar y leer. El producto debe tender un puente comprensible entre:
1. contar objetos;
2. reconocer grupos iguales;
3. sumar cantidades repetidas;
4. entender una multiplicación;
5. practicarla gradualmente.

Este es un **supuesto pedagógico de diseño**, no una afirmación de eficacia ya demostrada.

## 2. Para quién
- **Usuario primario:** niño de aproximadamente 6 años que está iniciándose en multiplicación, con experiencia y lectura todavía en desarrollo.
- **Acompañante:** adulto responsable que facilita el primer acceso, observa la experiencia y puede ayudar si es necesario.
- **No es objetivo del MVP:** maestros, grupos escolares, administración institucional, perfiles de múltiples niños.

El éxito de la interfaz se mide desde las capacidades del niño, no desde la comodidad del desarrollador o del adulto.

## 3. Propuesta de valor
> «Aprendo a multiplicar jugando con una estrella que me muestra, me habla y me deja volver a intentar».

Atributos irrenunciables:
- **Comprensión:** los grupos iguales anteceden a la memorización de resultados.
- **Autonomía:** voz + texto corto; controles táctiles obvios; ayuda inmediata.
- **Seguridad emocional:** sin castigos, cronómetros, vergüenza ni clasificación competitiva.
- **Repetición agradable:** sesiones cortas, variedad de preguntas, pistas y estrellas.
- **Disponibilidad:** navegador web en celular, tablet y computador, sin registro.

## 4. Objetivo de negocio del MVP
El resultado buscado no es monetización ni escala. Es **validar que un niño real puede iniciar una ronda, relacionar grupos con una multiplicación y querer volver a jugar** con ayuda mínima. La decisión de un modelo comercial, distribución pública o futuras audiencias **no está tomada**; no se debe inventar como requisito.

### Hipótesis a comprobar
H1. La demostración de grupos y sumas ayuda al niño a interpretar operaciones de una tabla inicial.
H2. La voz en español junto con el texto permite jugar con mínima asistencia de lectura adulta.
H3. Las actividades breves y la estrella como guía favorecen terminar la ronda y repetir.
H4. Pistas sin penalización permiten continuar tras equivocarse sin frustración excesiva.

### Señales observables (sin analítica en línea)
- Inicia desde la pantalla principal tras una explicación breve del adulto.
- Completa una ronda de cinco actividades con **ayuda mínima**.
- Puede explicar, señalar o contar correctamente los grupos de al menos un ejemplo.
- Comprende que puede solicitar ayuda y repetir.
- Muestra interés espontáneo en jugar otra ronda.
- La experiencia funciona de manera usable en al menos un teléfono, una tablet y un computador.

**Importante:** una única sesión no demuestra dominio de las tablas ni eficacia educativa. Los hallazgos sirven para decidir si iterar el juego, no para afirmar resultados académicos.

## 5. Producto mínimo acordado
Cuatro niveles en secuencia (tablas del 2 al 5, segundo factor de 1 a 5). Cada ronda tiene una demostración guiada y cuatro preguntas en tres modalidades. Se desbloquea el nivel posterior con tres aciertos de primer intento en las cuatro preguntas. La estrella presenta instrucciones con voz y texto, ofrece ayuda y celebra; el progreso se almacena localmente. No hay cuentas, backend, IA, anuncios ni pagos.

Fuente de comportamiento detallado: [Contrato del MVP](MVP.md). La experiencia exacta está en [USER_EXPERIENCE.md](USER_EXPERIENCE.md) y la pedagogía en [LEARNING_MODEL.md](LEARNING_MODEL.md).

## 6. Límites de la visión
**No confundir**:
- «Aprende jugando» no significa llenar el MVP de minijuegos.
- «Instalable» significa PWA donde esté disponible, no apps nativas.
- «Se guarda el avance» no significa sincronización entre dispositivos.
- «Voz» significa síntesis nativa con texto de respaldo, no audio de estudio ni clonación de voz.
- «Personalización» no es necesaria para que la primera experiencia sea valiosa.

## 7. Criterio para añadir funcionalidad
Una idea nueva solo entra en el MVP si:
1. elimina un bloqueo para jugar o comprender una ronda;
2. no contradice un acuerdo explícito;
3. no requiere una plataforma que el MVP no necesita;
4. tiene criterios verificables y justificación de valor.

Si no, registrarla como posible evolución en [ROADMAP.md](ROADMAP.md) sin comprometer fecha ni desarrollo.

## 8. Riesgos de producto
| Riesgo | Señal temprana | Respuesta razonable |
|---|---|---|
| Niño no entiende multiplicación | Acumula aciertos por ensayo y error sin reconocer grupos | Mejorar explicación/pista, no sumar más tablas |
| Lectura o voz insuficientes | Requiere ayuda constante para navegar | Frases más cortas y mejorar repetición de voz |
| Exceso de estímulos | Atiende más a efectos que a los grupos | Reducir animaciones y sonidos |
| Pocas operaciones repetidas | Se aburre antes de terminar | Variar preguntas y reforzar errores sin crear modos extra |
| Dispositivo o navegador | Voz o instalación falla | Texto siempre disponible; PWA solo cuando soporte exista |
| Datos de menores | Tentación de recopilar interacciones | No introducir cuentas, telemetría, identificadores ni datos personales |

## 9. Gobierno del alcance
- **Intención y comportamiento:** documentos en \`docs/\`.
- **Decisiones duraderas:** [DECISIONS.md](DECISIONS.md).
- **Entrega ejecutable:** issues [#1–#7](https://github.com/silverberdi/multiplo/issues), gestionados mediante OpenSpec antes de implementar.
- **Validación con usuario:** [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md).

Cualquier discrepancia entre una implementación propuesta y esta intención se resuelve documentando la decisión de producto; no por suposición del agente.
