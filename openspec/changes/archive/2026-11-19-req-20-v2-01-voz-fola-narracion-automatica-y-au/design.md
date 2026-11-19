# Design

## Context

La motivación y el contrato observable están en `proposal.md` y en los dos deltas de `specs/`. El código actual concentra coordinación en `js/star-guide.js`, invocado por `js/app.js`, `js/aprende.js` y el flujo de preguntas; hoy usa `speechSynthesis`, `Audio` para efectos y la preferencia `multiplo_sound_enabled`. Las pruebas existentes cubren guía, Aprende, preguntas, progresión, cierre y navegador; el cambio debe reutilizar esos callers y sus dobles, no introducir un coordinador paralelo.

## Goals / Non-Goals

**Goals:**

- Mantener una única fachada de guía que coordine catálogo Fola, reproducción, efectos, estados de mascota, cancelación y silencio.
- Hacer reproducible la preparación de la release con checksum y validación de manifiesto, rutas, hashes e IDs usados.
- Resolver clips por evento y contexto matemático, cargar solo el clip/bloque activo y degradar de forma no bloqueante a texto/imágenes.
- Preservar el contrato de ronda, primer intento, progreso local, controles accesibles y ejecución estática responsive.
- Dejar evidencia automatizada de preparación, selección, cancelación, silencio, repetición, fallback, regresión matemática y checks browser.

**Non-Goals:**

- No generar, editar, versionar ni incluir los 490 WAV en Git.
- No usar `speechSynthesis`, TTS, IA, Drive, backend, cuentas, permisos de micrófono, reconocimiento de voz o analítica.
- No cambiar tablas, distractores, reglas de desbloqueo, scoring, aprendizaje, PWA, infraestructura de publicación ni despliegue.
- No realizar E2E en producción ni validación física con un niño dentro de este change.

## Decisions

### 1. Una fuente Fola con catálogo validado

El script npm descargará la URL fija, verificará el SHA-256 antes de extraer y validará la forma de `manifest.json`, los 490 IDs, rutas seguras dentro del paquete, archivos referidos y hashes SHA-256. La extracción será a una carpeta estática generada, por ejemplo `assets/audio/fola/`, añadida explícitamente a `.gitignore`; un archivo de estado parcial no se considerará válido. La documentación indicará que limpiar esa carpeta se recupera ejecutando de nuevo el script.

Se elige validación local sobre confiar en el estado histórico de Drive porque la release es el origen versionado del contrato. No se añade una dependencia de red al runtime: la descarga solo ocurre en preparación.

### 2. Catálogo indexado y resolución contextual

El manifest y los catálogos se convertirán/leerán como índice liviano de `id → file/text_expected`, con una función de resolución que recibe un evento y el contexto `{a,b,producto,modalidad}`. El selector rechazará combinaciones sin correspondencia o texto esperado incompatible con la operación visible. La carga de audio será bajo demanda mediante un adaptador inyectable; no se precargarán los 490 clips.

El contrato de los IDs seguirá la numeración original 1..490. No se inferirá disponibilidad a partir de columnas antiguas de Drive ni se crearán audios faltantes.

### 3. Reutilización y retiro seguro del speech synthesis

`js/star-guide.js` conservará la API conceptual usada por `app.js` y los módulos de actividad, pero su implementación pasará a un reproductor Fola y un reproductor de efectos coordinados. Se retirarán las rutas de `speechSynthesis` como narrador de runtime y sus callers/tests se migrarán a dobles de reproducción. La cancelación tendrá un token/identificador de narración vigente para que una promesa tardía no restaure `hablando.svg` ni reproduzca un clip obsoleto.

Se evita una segunda capa de voz porque duplicaría el estado de silencio, repetir y mascota. El fallback será texto visible, no una síntesis alternativa.

### 4. Política de reproducción y controles

El gesto de `Jugar` o de elegir tabla habilitará el contexto de audio y llamará a la bienvenida; cambios de pantalla/pregunta cancelarán lo anterior. `Repetir` invocará el último contexto narrable sin modificar el motor. La escucha de una alternativa será un control hijo/adyacente que no dispare el handler de selección. Toques en grupos no evaluables tendrán una indicación contextual con deduplicación/debounce y nunca llamarán a respuesta.

Silenciar cancelará la locución y pausará/detendrá efectos activos, persistirá el booleano existente y hará que cada reproducción futura compruebe el estado justo antes de iniciar. Reactivar no repetirá automáticamente eventos antiguos; solo permitirá la siguiente narración o una repetición explícita.

### 5. Pruebas y evidencia

Se ampliarán las pruebas unitarias existentes con manifest/catálogo, integridad simulada sin descarga por test, selección matemática, fallos de reproducción, cancelación, silencio, repetición y no selección. Se conservarán las pruebas del motor/progresión y se agregarán regresiones donde el contrato de audio atraviesa esos módulos. El ejecutor configurado correrá los comandos browser declarados en Apply/Verify y aportará resultados observables para autoplay, navegación, viewport, controles separados y fallback; no se delegarán esas comprobaciones a una persona.

## Risks / Trade-offs

- **[Clip no disponible, corrupto o bloqueado por autoplay]** → texto/imágenes y flujo sin bloqueo; registrar diagnóstico de preparación/reproducción sin mostrar voz robótica.
- **[Índice o manifest desalineado con una operación]** → validación determinista antes de publicar y selector que rechaza el clip; la actividad conserva su explicación visual.
- **[Efecto y voz se solapan o una promesa tardía revierte estado]** → cola de reproducción de una sola narración, cancelación por token y adaptadores con eventos de fin/error.
- **[Carga o memoria excesiva en dispositivos infantiles]** → fetch/Audio bajo demanda por clip o bloque activo, sin precarga global; liberar referencias al cambiar de actividad.
- **[Cambio incompatible con pruebas o callers actuales]** → mantener la fachada pública del guía, migrar dobles y ejecutar la suite completa; cualquier cambio de contrato se tramita con OpenSpec antes de implementar.
- **[La carpeta generada se limpia antes de publicar]** → `.gitignore` explícito, comando reproducible documentado y fallo claro si faltan assets preparados.

## Migration Plan

1. Inventariar callers de `StarGuide`, efectos y preferencia de sonido; añadir el script de preparación y validadores sin alterar la app.
2. Preparar/validar localmente la release y probar el catálogo con fixtures pequeños; nunca commitear la salida generada.
3. Implementar el adaptador Fola y migrar el guía, `app.js`, Aprende y preguntas a contextos de evento/operación, retirando el fallback `speechSynthesis`.
4. Migrar pruebas/dobles, ejecutar unit/integration y los checks browser declarados con resultados observables en los tres viewports configurados.
5. Rollback: retirar la integración Fola y restaurar la implementación anterior solo mediante un update OpenSpec; la carpeta generada se puede limpiar y regenerar, y no hay migración de datos ni backend.

## Open Questions

- La correspondencia exacta de cada evento con los IDs del manifest debe derivarse del `manifest.json` de la release durante Apply; si falta un ID requerido por el contrato, el Apply debe detenerse y solicitar una decisión/actualización, no inventar una locución.
