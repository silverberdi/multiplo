# Design

## Context

Request #32 cruza el texto de la demostración Aprende, las narraciones Fola y las pistas derivadas. Las capacidades existentes ya fijan la orientación `a×b = a grupos de b`, el uso de assets locales y el fallback textual; este diseño conserva esos contratos y concreta una única regla de composición lingüística.

## Goals / Non-Goals

**Goals:**

- Centralizar la decisión de número gramatical a partir de `a` y `b`, para que visible, hablado y pista reciban el mismo resultado.
- Mantener intactos grupos, suma, producto, alternativas, evaluación del primer intento y navegación.
- Cubrir exhaustivamente los bordes `a=1`, `a>1`, `b=1` y `b>1` en pruebas unitarias, y observarlos en el flujo real de navegador.
- Permitir que un clip ausente, fallido o no utilizable deje disponible el texto correcto y no bloquee.

**Non-Goals:**

- No crear un sistema general de traducción, pluralización para idiomas adicionales ni contenido nuevo de Fola.
- No generar audio con TTS/IA, descargar recursos en runtime ni modificar persistencia, progreso o reglas matemáticas.
- No convertir la validación física con un niño en sustituto de las comprobaciones automatizables del navegador.

## Decisions

1. **Una composición compartida recibe los factores dirigidos.**
   La lógica de copy debe derivar grupo y complemento de `a` y `b`, con `a=1` → «Un grupo», `a>1` → número de grupos en plural, `b=1` → «una manzana» y `b>1` → cantidad plural. La alternativa de duplicar frases en cada vista se descarta porque permitiría que Aprende, pistas y Fola se desalineen.

2. **El contrato matemático precede al texto.**
   La composición consume la pareja dirigida ya seleccionada y no la invierte ni la recalcula. Así, `3×2` continúa significando tres grupos de dos aunque el producto coincida con otra orientación.

3. **El texto visible es la fuente de fallback.**
   La narración Fola se solicita con el identificador de la operación/evento existente. Si falta o falla, se conserva el copy generado y la navegación. No se añadirá síntesis del navegador para reparar una locución.

4. **Pruebas por capas y browser check configurado.**
   Las pruebas unitarias cubrirán `a=1`, `a>1`, `b=1`, `b>1` y ausencia de formas discordantes. El executor configurado ejecutará `npm run test:e2e` y añadirá/actualizará checks de navegador para verificar texto, solicitud de narración, fallback y responsive en el flujo real; no se delegarán navegación asíncrona ni viewport a `human_validation`.

## Risks / Trade-offs

- **[Riesgo]** Algunos clips Fola pregrabados podrían contener una frase histórica con discordancia aunque el texto nuevo sea correcto. → **Mitigación:** validar el ID y el texto asociado; si el clip no puede garantizar correspondencia, mantener texto y navegación disponibles y documentar el fallback sin introducir audio generado.
- **[Riesgo]** Una corrección local de una frase puede dejar otra pista o mensaje derivado con «uno grupos». → **Mitigación:** buscar todas las plantillas y probar singular/plural en demostración, narración y pistas, incluyendo `a=1` y `a>1`.
- **[Riesgo]** La prueba responsive podría verificar el copy pero no la composición visual completa. → **Mitigación:** conservar los escenarios existentes de grupos/producto y ejecutar el E2E en los viewports declarados, con evidencia observable.

## Migration Plan

Apply actualizará las plantillas/compositor y sus consumidores, añadirá las pruebas y retirará cualquier texto discordante reemplazado dentro del mismo cambio. Verify ejecutará la suite declarada y los checks reales de navegador. No hay migración de datos ni rollback de persistencia: revertir el cambio de copy y pruebas restaura el comportamiento anterior sin afectar progreso local.

