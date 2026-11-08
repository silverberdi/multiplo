# Múltiplo — Modelo pedagógico y reglas del juego
**Estado:** diseño de aprendizaje del MVP. **Perfil:** niño de 6 años, iniciación a multiplicación.

## 1. Principio didáctico
La primera meta es **comprender grupos iguales y sumas repetidas**. La memorización de tablas no reemplaza esa comprensión. Las equivocaciones son oportunidades de mostrar grupos otra vez; el niño nunca pierde una vida ni una ronda por fallar.

### Convención matemática obligatoria
La expresión \`a × b\` significa **a grupos de b elementos**. Por ejemplo:

- \`3 × 2\` → [🍎🍎] [🍎🍎] [🍎🍎] → \`2+2+2=6\` → \`3×2=6\`.
- \`2 × 4\` → 2 grupos de 4 → \`4+4=8\` → \`2×4=8\`.
- \`5 × 1\` → 5 grupos de 1 → \`1+1+1+1+1=5\`.

La conmutatividad puede mencionarse en el futuro, pero **no cambiar silenciosamente la orientación de los grupos** en una pantalla: \`2×3\` y \`3×2\` comparten producto, no representación.

## 2. Niveles
| Nivel | Primer factor \`a\` | Segundo factor \`b\` | Estado |
|---|---:|---|---|
| 1 | 2 | 1, 2, 3, 4, 5 | Disponible al comenzar |
| 2 | 3 | 1, 2, 3, 4, 5 | Desbloqueable |
| 3 | 4 | 1, 2, 3, 4, 5 | Desbloqueable |
| 4 | 5 | 1, 2, 3, 4, 5 | Desbloqueable |

Una ronda de un nivel **solo** utiliza su tabla objetivo. La suma máxima para mostrar es 25 objetos (5 grupos de 5). Los niveles ya desbloqueados se pueden repetir sin volver a bloquearlos.

## 3. Ronda estándar: una demostración y cuatro preguntas
| Posición | Experiencia | Evaluada | Ayuda visual |
|---|---|---|---|
| 1 | **Aprende:** grupos + suma repetida + multiplicación narrada | No | Siempre visible |
| 2 | **Cuenta grupos:** grupos visibles, elige número total | Sí | Ya visible |
| 3 | **Cuenta grupos:** otro ejercicio equivalente | Sí | Ya visible |
| 4 | **Multiplica:** operación, elige total | Sí | Opcional, botón Pista |
| 5 | **Encuentra la operación:** total dado, elige multiplicación correcta | Sí | Opcional, botón Pista |

La demostración no concede ni quita estrellas. El niño avanza mediante un botón Continuar sin tiempo límite.

## 4. Generación y selección de preguntas
Reglas de dominio:
1. Operaciones de la ronda: \`a×b\`, con \`a\` fijo por nivel y \`b\` en 1–5.
2. En cada pregunta hay **exactamente tres opciones seleccionables** y **una sola válida**. Los distractores pueden ser productos cercanos, pero deben evitar opciones duplicadas o ambiguas.
3. En el ejercicio «encuentra la operación», las tres alternativas son operaciones con el **mismo primer factor** del nivel, factores secundarios distintos, y **solo una** debe obtener el resultado pedido.
4. Evitar repetir la misma pareja \`a,b\` entre las cuatro preguntas de la ronda cuando sea posible. Con cinco valores de \`b\` y cuatro preguntas, es posible sin forzar repeticiones.
5. Entre rondas, variar orden de preguntas, operandos y posición de la respuesta correcta. No fijar siempre la respuesta válida en el centro.
6. Si hay historial de dificultades, priorizar razonablemente factores que fallaron, **sin eliminar la variedad**. No existe obligación de crear un motor adaptativo inteligente.
7. El conjunto de respuestas puede formarse a partir de los cinco productos de la tabla actual; respetar tres distintos y uno correcto.
8. No presentar textos matemáticos falsos como explicaciones; las opciones de respuesta son distractores, nunca afirmaciones didácticas.

### Ejemplo completo para tabla del 2
- Aprende: \`2×3=6\` con 2 grupos de 3.
- Cuenta grupos: \`2×1\` → 2.
- Cuenta grupos: \`2×4\` → 8.
- Resuelve: \`2×2\` → 4 (pista: 2 grupos de 2).
- Encuentra la operación que da 10: \`2×3 / 2×5 / 2×4\` → válida \`2×5\`.

Cada pregunta presenta 3 opciones; no repetir exactamente estos cuatro ejercicios en todas las sesiones.

## 5. Evaluación y desbloqueo
- **Acierto inicial** = la primera opción pulsada en esa pregunta es correcta. Se registra de forma independiente del número de reintentos posteriores.
- **Reintentos:** ilimitados. Después de un error el niño recibe una explicación/pista y puede seleccionar nuevamente.
- **Estrellas:** una por acierto inicial en cada una de las cuatro preguntas; total 0–4. El objetivo no es «perder estrellas», sino mostrar las obtenidas.
- **Desbloqueo:** al completar las cuatro preguntas, si tiene 3 o 4 aciertos iniciales, se abre el siguiente nivel existente. Con 0–2, el siguiente sigue cerrado pero el niño puede repetir.
- **Fin de tabla del 5:** cierre positivo sin botón hacia un nivel inexistente.
- **Persistencia:** preservar niveles desbloqueados y datos mínimos para favorecer variación/priorización, en el mismo navegador. No hay cuenta ni sincronización.
- **Efectividad:** el umbral de 3/4 es una regla lúdica aprobada; **no equivale a certificación de dominio escolar**.

## 6. Sistema de ayuda
Cuando la respuesta es incorrecta:
- La estrella dice algo como «¡Intentémoslo otra vez! Cuenta las manzanas».
- Mostrar/recordar las agrupaciones correspondientes a la operación; mantener el mismo problema.
- No usar sonidos de alarma, color rojo como único mensaje, frases negativas ni penalización.
- El botón Pista debe estar disponible antes del error para las preguntas sin dibujo. Las preguntas con grupos visibles ya tienen una ayuda incorporada.
- No revelar la respuesta correcta automáticamente antes de que el niño pueda contar; privilegiar la comprensión.

## 7. Texto hablado y lenguaje
- «Mira, hay tres grupos de dos manzanas».
- «Dos más dos más dos son seis».
- «Entonces tres por dos son seis».
- «¿Cuántas manzanas hay en total?»
- «¿Cuánto es tres por dos?»
- «¿Cuál multiplicación da seis?»
- «¡Muy bien!», «Cuenta otra vez», «¡Terminaste!».

Texto siempre corto y consistente con las cantidades mostradas. Evitar instrucciones que dependan de leer párrafos.

## 8. Validación educativa mínima
Observar la capacidad de relacionar grupos visibles con el producto, el uso de la pista, la necesidad de ayuda, errores repetidos y deseo de repetir. Evitar obtener conclusiones de aprendizaje duradero a partir de una única sesión. No recoger identidad ni datos personales del niño.

## 9. Invariantes que ningún cambio OpenSpec puede romper sin aprobación
- Convención \`a×b = a grupos de b\`.
- Cuatro preguntas evaluables por ronda y un aprendizaje inicial no evaluable.
- Tres opciones distintas por pregunta, exactamente una correcta.
- Acierto inicial inmutable tras reintentos.
- Umbral 3/4 para avanzar.
- El niño siempre puede reintentar y consultar pistas sin castigos.
- Cada nivel cubre exactamente una tabla del 2 al 5, con \`b\` entre 1 y 5.

**Referencia:** [MVP.md](MVP.md) y los issues [#3](https://github.com/silverberdi/multiplo/issues/3), [#4](https://github.com/silverberdi/multiplo/issues/4), [#5](https://github.com/silverberdi/multiplo/issues/5).
