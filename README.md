# Múltiplo ⭐

Juego educativo en español para niños de 6 años. Su objetivo es enseñar a **comprender y practicar multiplicaciones** jugando.

## Estado

**MVP v1.0 — planificación.** Este repositorio contiene el alcance y los issues para implementar el MVP. **Todavía no contiene una implementación del juego.**

## Experiencia del MVP

- Una estrella amarilla guía con instrucciones mediante **voz y texto**.
- Una partida corta de 5 actividades: 1 demostración visual, 2 ejercicios de contar grupos y 2 desafíos.
- Tres tipos de ejercicio: contar grupos, resolver multiplicaciones y encontrar la multiplicación que produce un resultado.
- Cuatro niveles progresivos: tablas del **2, 3, 4 y 5**, con factores del 1 al 5.
- Preguntas con tres opciones grandes, pistas visuales, intentos ilimitados y sin cronómetro.
- Se desbloquea el siguiente nivel al acertar **al menos 3 de las 4 preguntas en el primer intento**.
- Progreso guardado localmente en el dispositivo/navegador, sin cuentas ni sincronización.
- Web responsive, compatible con celular, tablet y computador, instalable como PWA cuando el navegador lo permita.

## Documentación

- [Contrato funcional del MVP](docs/MVP.md).
- [Issues del proyecto](../../issues).

## Alcance técnico esperado

HTML, CSS y JavaScript, hosting estático, almacenamiento local y síntesis de voz nativa del navegador. Sin backend, inteligencia artificial, autenticación, tiendas de aplicaciones ni frameworks pesados.

## Convención pedagógica

La operación `a × b` se presenta como **a grupos de b objetos**. Así, `2 × 3` significa dos grupos de tres objetos (seis en total). En el nivel de la tabla del 2 se practican `2 × 1` a `2 × 5`.

El trabajo de implementación se hará a partir de los issues y sus criterios de aceptación (Given / When / Then). No ampliar el alcance del MVP sin una decisión explícita.
