## Context

La evidencia y el motivo del cambio están en `proposal.md`; el comportamiento normativo está en las dos delta specs. El juego ya tiene coordinador Fola, catálogo estático y WAV publicados. El cambio debe corregir su integración sin introducir otra capa de audio.

## Goals / Non-Goals

**Goals:** conservar una sola ruta de resolución y reproducción Fola, corregir el filtro de compatibilidad para la forma real del guion, y hacer exhaustiva la verificación de todos los IDs que el runtime puede solicitar.

**Non-Goals:** regenerar locuciones, cambiar el contenido matemático o visual, implementar TTS, añadir telemetría ni probar acústicamente dispositivos físicos como parte de CI.

## Decisions

- La bienvenida usará los eventos y estado de visita existentes, enlazados al primer gesto de entrada que ya habilita audio. Esto evita un segundo botón y respeta las políticas de autoplay. Mantener el texto visible es el fallback; no crear un reproductor o cola nuevos.
- No se usará una consulta `HEAD` al manifiesto para decidir si se intenta reproducir un clip: confirma el manifiesto, no el WAV solicitado, y puede competir con el primer gesto. Se intenta directamente la ruta del clip y el error de carga/reproducción conserva el fallback textual existente.
- El estado visual «hablando» solo se activa con el evento real `play` del WAV; un intento de reproducción pendiente o rechazado conserva el estado normal.
- La compatibilidad se corregirá en el validador semántico actual para aceptar el sustantivo que acompaña a una cantidad en el guion real. Se mantendrá rechazo de operaciones invertidas o de cantidades incompatibles; no se relajará el filtro de forma general.
- El catálogo y manifiesto existentes serán la fuente de verdad para las rutas. Las pruebas recorrerán el conjunto derivado del runtime (489 IDs válidos) y comprobarán integridad y asociaciones exactas, en vez de mantener otra lista parcial de IDs.
- El E2E observará la solicitud del archivo esperado y el inicio de `play()` en el navegador. No afirmará que CI puede probar que un altavoz físico emitió sonido.

## Risks / Trade-offs

- Un cambio demasiado permisivo en el filtro podría aceptar locuciones matemáticamente incorrectas → incluir regresiones positivas y negativas para los órdenes de factores y cantidades.
- Una aserción de `play()` puede verse afectada por políticas del navegador → disparar el flujo mediante gesto real de Playwright y mantener el texto/fallback no bloqueante.
- El E2E no prueba audibilidad física ni comportamiento acústico de iOS → informar esta limitación sin bloquear la verificación de rutas y reproducción iniciada.

## Migration Plan

No hay migración de datos ni infraestructura. Aplicar el cambio en el repositorio, validar en el SHA candidato y publicar mediante el flujo normal del proyecto. El rollback consiste en revertir el commit de código; los WAV y el manifiesto no se modifican.
