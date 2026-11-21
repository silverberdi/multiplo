# Proposal

## Why

Las explicaciones de Aprende deben ser comprensibles para un niño de seis años y mantener concordancia gramatical con la cantidad de grupos y manzanas que muestran. Las formas singulares discordantes, como «Uno grupos de ocho manzanas», pueden confundir la relación entre la representación visual, el texto y la narración; Request #32 corrige ese contrato antes de ampliar o validar la experiencia.

La corrección aplica tanto al texto visible como a las narraciones Fola y a las pistas o textos derivados, preservando la convención matemática `a×b = a grupos de b` y el fallback no bloqueante.

## What Changes

- Ajustar las frases de la demostración Aprende para usar «Un grupo de N manzanas» cuando `a=1` y «Dos grupos de N manzanas» o la forma plural correspondiente cuando `a>1`.
- Usar «Un grupo de una manzana» cuando hay un único grupo con una única manzana, manteniendo «Un grupo de N manzanas» para `N>1`.
- Aplicar la misma concordancia a pistas y a cualquier texto derivado del número de grupos, sin producir «uno grupos» ni formas equivalentes discordantes.
- Mantener alineadas la narración solicitada y la explicación visible, incluyendo el número de grupos, objetos por grupo y operación dirigida.
- Conservar texto, imágenes e interacción cuando falte o falle una narración Fola; la discrepancia de audio no bloqueará la navegación.
- Añadir cobertura automatizada para los casos singulares (`a=1`) y plurales (`a>1`) en demostración, narración y pistas, incluyendo el caso `b=1`.

Límites: no se modifica la convención matemática, el catálogo de operaciones, la progresión, el número de preguntas, el inventario Fola, los assets versionados ni la arquitectura estática del MVP.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `visual-group-multiplication-learning`: las explicaciones visibles de Aprende deben concordar en singular y plural con el número de grupos y objetos.
- `star-guide-voice-text`: la narración de Aprende y sus fallbacks textuales deben usar la misma concordancia que la explicación visible y permanecer no bloqueantes.
- `question-round-engine`: las pistas y textos derivados de grupos deben conservar concordancia singular/plural sin cambiar la operación activa.

## Impact

- Afecta la generación de copy de Aprende, pistas y mensajes derivados, además de la selección o datos de narración asociados a la operación.
- Afecta las pruebas unitarias y E2E declaradas para el generador, la demostración, Fola/fallback y el flujo responsive; la ejecución de navegador queda para Apply/Verify mediante el executor configurado.
- Reutiliza `assets/objects/manzana.svg`, `assets/mascot/hablando.svg` y el catálogo Fola preparado; no requiere dependencias nuevas ni cambios de API, persistencia o datos.
- Trazabilidad: Request #32; RF-02, RF-03, RF-04, RNF-02, RNF-05 y RNF-07; dependencias de roadmap #1→#2/#3 y #1+#3→#4.
