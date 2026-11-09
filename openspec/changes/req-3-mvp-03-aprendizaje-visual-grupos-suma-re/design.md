# Design

## Context

El repositorio ya contiene un shell HTML/CSS/JS navegable y una implementación base de la guía, además de los contratos de producto, activos SVG/WAV y artefactos OpenSpec. En el área de este Change, `index.html` todavía contiene una demo Aprende estática de `3×2` y `js/app.js` todavía solicita el guion fijo de demostración; esos consumidores deben ser reemplazados, no conservarse junto al renderizado generado. Véase `proposal.md` para la motivación. La solución debe encajar en la web estática existente, mantener la convención `a × b = a grupos de b`, reutilizar los assets versionados y convivir con la navegación del issue #1 y la guía de voz del issue #2.

## Goals / Non-Goals

**Goals:**

- Modelar una demostración de ronda como datos simples y derivar de esos datos grupos, suma y producto para impedir inconsistencias.
- Hacer que el modelo generado sea la única fuente de la demo: retirar el markup estático de grupos, suma, producto, etiquetas ARIA e instrucción de `index.html`, y sustituir el guion fijo de `GUIDE_SCRIPT.demostracion` por texto derivado del nivel y del segundo factor.
- Renderizar grupos independientes con el mismo SVG de manzana, con composición adaptable a móvil, tablet y escritorio.
- Hacer que Aprende sea un estado de ronda único, no evaluable, con transición explícita a la primera pregunta.
- Integrar la narración a la abstracción de guía existente: texto visible siempre, `hablando.svg` durante la explicación y síntesis opcional después del gesto del usuario.
- Permitir reducir movimiento y tolerar fallos de voz o de recursos multimedia sin bloquear el flujo.

**Non-Goals:**

- No implementar aquí las cuatro preguntas, distractores, puntuación, estrellas de evaluación ni desbloqueo de niveles.
- No añadir persistencia, backend, cuentas, telemetría, IA, CMS, framework gráfico o servicio de voz externo.
- No crear nuevos objetos visuales, locuciones pregrabadas o una orientación alternativa de los factores.

## Decisions

### Un modelo matemático como fuente única

La demostración se construirá desde un par `{a, b}` validado en los rangos del MVP. El producto se calcula como `a * b`; la suma se forma con `a` términos de `b`; y los grupos se generan como `a` listas de `b` referencias al mismo recurso de manzana. La UI no recibirá valores independientes para suma, grupos y producto.

Alternativa descartada: escribir el texto y dibujar los grupos por separado. Es más corto inicialmente, pero permite mostrar una suma o cantidad de objetos que no corresponde a la operación.

### Factor fijo por nivel y variación del segundo factor

El nivel aporta `a` (2, 3, 4 o 5) y la selección de ronda elige `b` entre 1 y 5. La selección puede evitar repetir el ejemplo inmediatamente anterior, pero no necesita un motor adaptativo ni modificar la tabla del nivel.

Alternativa descartada: seleccionar ambos factores libremente. Rompería la definición de niveles y podría introducir tablas fuera del MVP.

### Estado de ronda explícito

La ronda comienza en `learn`, conserva la demostración hasta que el niño pulsa Continuar y luego emite la transición a la primera pregunta. La entrada `learn` no llama al mecanismo de evaluación ni al contador de estrellas; la transición no depende de reloj ni de que la voz termine.

Alternativa descartada: avanzar automáticamente al acabar la narración. Puede fallar por restricciones de audio y reduce el control del niño.

### SVG repetido y CSS ligero

Se usará una referencia al archivo `manzana.svg` por objeto, agrupada dentro de contenedores semánticos y estilizados con CSS responsive. La mascota se mostrará con `hablando.svg` durante la narración. Las animaciones, si se implementan, serán cortas, opcionales y desactivadas o simplificadas bajo `prefers-reduced-motion`.

Alternativa descartada: canvas, una librería de gráficos o sprites nuevos. No aportan valor para un máximo de 25 objetos y dificultan la inspección y accesibilidad del recurso aprobado.

### Narración no bloqueante

El texto de la demostración será la fuente de contenido para la narración. La guía existente cancelará una locución anterior antes de comenzar otra y manejará la ausencia o fallo de `speechSynthesis` como fallback textual. El botón Continuar estará disponible aunque la voz no exista, falle o esté silenciada.

Alternativa descartada: audio pregrabado o API remota. Añadiría peso, dependencia externa y un problema de disponibilidad sin mejorar el contrato del MVP.

### Retirada y contrato de prueba

La integración modificará el shell existente en lugar de añadir otro contenedor de demostración. Los selectores semánticos de la demo generada deberán permitir que las pruebas fijen un par determinista (por ejemplo, `3×2`) y comprueben cantidad de grupos, cantidad de objetos por grupo, suma, producto, texto visible y última instrucción narrada. Las aserciones heredadas que esperan `Tres grupos de dos manzanas` o `Mira: tres grupos de dos` se actualizarán o retirarán; no se conservarán como contrato alternativo porque contradicen la variación de `b`.

## Risks / Trade-offs

- [Risk] En pantallas estrechas, cinco manzanas por grupo y hasta cinco grupos pueden saturar el ancho → usar composición flexible, separación visible entre grupos y permitir reflujo vertical sin ocultar suma ni producto.
- [Risk] La repetición del SVG puede cargar rutas incorrectas durante la integración → verificar que los assets versionados se resuelven desde el paquete y que un fallo visual no elimina el texto matemático.
- [Risk] Una voz lenta o bloqueada puede parecer un bloqueo → habilitar Continuar inmediatamente, cancelar locuciones al cambiar de estado y probar explícitamente el fallback.
- [Risk] Una animación puede distraer del conteo → mantenerla breve y decorativa, respetar `prefers-reduced-motion` y validar que el contenido completo permanece estable.
- [Risk] La selección aleatoria puede dificultar pruebas reproducibles → permitir inyectar una fuente de selección determinista en pruebas, sin exponer una nueva función de producto.

## Migration Plan

No hay migración de datos ni despliegue que ejecutar. La migración de UI consiste en reemplazar el markup estático de Aprende y la llamada al guion fijo dentro del shell existente, conservando la navegación base y los contratos de guía fuera de esta demo. Si la integración falla, el rollback consiste en retirar la transición al estado Aprende generado, sin cambios de `localStorage`; no se debe reintroducir la demo estática como ruta duplicada sin actualizar primero este Change.

## Open Questions

Ninguna pregunta abierta cambia el contrato o la estrategia. La elección concreta de organización de archivos queda para el implementador dentro del stack HTML/CSS/JS existente.
