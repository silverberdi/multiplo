# Design

## Context

El cambio modifica únicamente el pie existente de `index.html`, que hoy contiene un `p.footer-note` informativo dentro de `footer.app-footer`; sus reglas ya están centralizadas en la sección de pie de `css/styles.css`. La motivación y el contrato observable están en `proposal.md` y en el delta de `specs/web-base-responsive-pwa/spec.md`.

## Goals / Non-Goals

**Goals:**

- Añadir las dos frases aprobadas como contenido semántico y distinguible del texto informativo existente.
- Mantener la jerarquía visual secundaria, legibilidad y ausencia de overflow en los tres rangos responsive ya soportados.
- Mantener el footer estático, accesible y sin enlace, recurso ni dependencia nueva.
- Dejar una comprobación ligera de DOM y una comprobación de viewport estrecho y escritorio ejecutables por el executor configurado.

**Non-Goals:**

- No rediseñar el footer, la identidad de Múltiplo ni el resto de las vistas.
- No crear un componente, página, modal, banner, splash, logo, animación, dominio o integración externa.
- No cambiar privacidad, declaraciones legales, audio, lógica de juego, PWA, rutas o telemetría.

## Decisions

1. **Reutilizar `app-footer` y sus estilos existentes.** Se elegirá una estructura HTML semántica mínima dentro del footer y se reutilizará `footer-note` o una variante local de la misma regla para separar visualmente la atribución. Esto mantiene el alcance de Request #45 en la superficie existente. Se descarta crear un bloque global o una nueva vista porque haría más prominente el crédito y ampliaría la arquitectura.

2. **Conservar el texto educativo sin reescribir afirmaciones de privacidad.** La atribución se añadirá junto al texto actual; cualquier ajuste de saltos o agrupación deberá preservar su significado. Se descarta sustituirlo por el lema o por texto legal nuevo porque el request no autoriza cambios de producto ni de privacidad.

3. **Usar texto plano accesible, sin enlace ni movimiento.** Las frases serán texto renderizado en el footer, con jerarquía secundaria mediante las reglas CSS ya presentes y sin interacción. Se descartan enlace a Beastie Studio, imagen de marca y animación porque no existe destino oficial aprobado y contradicen el alcance.

4. **Verificar navegador con el executor configurado.** Apply/Verify deberá ejecutar el DOM y la comprobación responsive en Chromium usando el runtime disponible, con viewport móvil estrecho y escritorio, registrando resultados observables. La comprobación física en dispositivos reales puede quedar como seguimiento posterior y no sustituye la prueba automatizable.

## Risks / Trade-offs

- **[Riesgo]** Una línea adicional puede aumentar la altura del footer en móvil. → Mantener texto breve, permitir wrapping natural y comprobar que no haya overflow ni solapamiento en viewport estrecho.
- **[Riesgo]** Separar la atribución podría reducir contraste o hacerla demasiado tenue. → Reutilizar color y tamaño legibles existentes; validar el texto renderizado y el contraste visual sin depender de color para comunicar significado.
- **[Riesgo]** La documentación de identidad puede no estar presente como archivo específico. → Conservar el lema solo donde ya esté aprobado/documentado y no inventar una nueva afirmación; registrar cualquier necesidad documental en tareas sin ampliar el código.

## Migration Plan

No hay migración de datos ni despliegue especial. En Apply se editará únicamente la superficie del footer y, si la inspección lo exige, sus reglas CSS existentes. La reversión consiste en retirar las dos líneas o el ajuste CSS del mismo cambio, sin afectar estado local, assets, rutas o APIs.
