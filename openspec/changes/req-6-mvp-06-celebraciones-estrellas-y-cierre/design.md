# Design

## Context

El repositorio aún está en planificación; la implementación futura debe integrarse con la ronda, la progresión local y la guía de estrella definidos por los Changes dependientes #2 y #5. Este diseño concreta cómo se coordinará el cierre descrito en `proposal.md` y en los tres delta specs, manteniendo HTML/CSS/JS, assets locales, `speechSynthesis` y `localStorage`.

## Goals / Non-Goals

**Goals:**

- Mantener una única secuencia de ronda: respuesta → feedback breve → siguiente pregunta o resultado.
- Derivar las estrellas del resumen inmutable de primer intento y hacer que el resultado sea una fuente única para el desbloqueo y las acciones visibles.
- Hacer que la celebración sea opcional en tiempo y multimedia: texto, controles y navegación siguen disponibles con silencio, voz ausente o WAV fallido.
- Reutilizar los SVG/WAV aprobados y mantener la interfaz legible y usable en móvil, tablet y computador.
- Permitir verificar 0/4, 1/4, 2/4, 3/4 y 4/4, nivel final, repetición y estado silenciado.

**Non-Goals:**

- No cambiar la fórmula de puntuación, las cuatro preguntas, la progresión 1–4 ni la persistencia local existente.
- No introducir una pantalla de recompensa separada, animaciones largas, monedas, vidas, ranking, cuentas, backend o analítica.
- No sustituir la voz nativa por audio narrado ni añadir dependencias externas.

## Decisions

1. **Resultado inmutable como contrato entre ronda y progresión.** Al cerrar la cuarta pregunta se emite una sola estructura de resultado en memoria con nivel, `firstAttemptCorrect` por pregunta y total 0–4. La UI de Fin, el cálculo de estrellas y el desbloqueo consumen ese resultado; los reintentos no lo mutan. Esto evita que la celebración o una navegación posterior alteren la evaluación.

   Alternativa descartada: recalcular estrellas leyendo el estado visual de cada pregunta, porque puede incluir correcciones tardías y duplicar la regla 3/4.

2. **Celebración como estado corto no bloqueante.** La confirmación de un acierto publica feedback de celebración y actualiza la mascota, pero el control para continuar queda disponible inmediatamente; la transición visual/sonora se cancela o se solapa de forma segura al cambiar de actividad. El cierre usa el mismo patrón con `celebrando.svg`, pero muestra el resultado hasta que el niño elija una acción.

   Alternativa descartada: modal temporizado obligatorio, porque añade espera y puede impedir autonomía o fallar con autoplay/voz.

3. **Acciones derivadas del nivel siguiente real.** Tras persistir el desbloqueo cuando corresponde, el resultado muestra `Siguiente nivel` solo si existe un nivel posterior (niveles 1–3). En cualquier resultado se mantienen `Repetir` y el retorno a niveles abiertos; en el nivel 4 no se genera un Nivel 5.

   Alternativa descartada: navegar automáticamente al nivel siguiente, porque el MVP exige cerrar la ronda y dejar clara la elección del niño.

4. **Canal multimedia centralizado y tolerante.** La celebración solicitará `acierto.wav` por acierto y `celebracion.wav` una vez al cierre solo si el sonido está habilitado; la síntesis seguirá el texto visible y se cancelará al cambiar de actividad. Los errores de carga/reproducción se absorben y no cambian el estado de ronda.

   Alternativa descartada: reproducir audio como condición de avance, porque contradice el fallback escrito y el modo silenciado.

5. **Presentación explícita de estrellas.** La vista final renderiza cuatro posiciones de estrella premio, diferenciando las obtenidas mediante texto/atributo accesible además de la imagen; no depende únicamente del color ni crea una métrica adicional.

## Risks / Trade-offs

- [Celebración demasiado llamativa] → usar una sola mascota, efectos breves y `prefers-reduced-motion`; validar que la siguiente acción siga siendo evidente.
- [Audio duplicado o superpuesto] → una única coordinación de reproducción, cancelación al cambiar de actividad y prueba con sonido habilitado/silenciado.
- [Reintento contado por error] → pruebas de resultado 0–4 con respuestas corregidas y aserción sobre el resumen inmutable, no solo sobre el texto mostrado.
- [Persistencia falla al desbloquear] → conservar la sesión jugable y mostrar la acción solo según el estado disponible; no añadir almacenamiento remoto ni bloquear la ronda.
- [Layout estrecho en Fin] → probar los tres factores de forma y verificar que las acciones táctiles no se solapen ni produzcan overflow horizontal.

## Migration Plan

No hay migración de datos ni despliegue en esta fase: el Change modifica planificación, y la futura implementación debe consumir las claves de progreso/sonido ya definidas por #5. Durante el apply, integrar la celebración en el flujo existente, retirar cualquier recompensa estática que quede sustituida dentro de este alcance, ejecutar pruebas unitarias y E2E, y verificar regresión de #2/#5. El rollback consiste en revertir los cambios del candidato sin modificar datos locales; el contrato no requiere conversión de `localStorage`.

## Open Questions

No quedan preguntas abiertas que cambien el contrato o el enfoque. La elección de nombres internos de eventos, estructura de archivos y herramienta ligera de pruebas queda abierta al implementador mientras conserve los escenarios y límites anteriores.
