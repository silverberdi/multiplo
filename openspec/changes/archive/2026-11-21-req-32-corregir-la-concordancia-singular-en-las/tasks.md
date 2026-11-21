# Tasks

## 1. Composición de texto y consumidores

- [x] 1.1 Localizar todas las plantillas de explicación de Aprende, pistas y textos derivados, y reemplazar las formas discordantes por una composición basada en la pareja dirigida `a×b`; verificar por inspección que no quede «uno grupos» ni una forma equivalente en los recorridos afectados (Request #32; capacidades visual-group-multiplication-learning y question-round-engine).
- [x] 1.2 Implementar o ajustar la composición compartida para `a=1` → «Un grupo», `a>1` → número de grupos en plural, `b=1` → «una manzana» y `b>1` → cantidad plural; verificar que `3×2` siga significando tres grupos de dos y no se invierta la orientación (escenarios de demostración y pista).
- [x] 1.3 Conectar la misma salida textual con la explicación visible de Aprende y el texto de fallback de la guía, reutilizando `assets/objects/manzana.svg` y `assets/mascot/hablando.svg` sin añadir dependencias ni assets (RF-02/RF-03, ASSETS.md).

## 2. Narración Fola y degradación

- [x] 2.1 Ajustar la selección o los datos de narración de Aprende para que los casos singular y plural correspondan a la operación visible y al número de objetos por grupo; verificar que la solicitud conserve el evento y la pareja dirigida `a×b` (capacidad star-guide-voice-text).
- [x] 2.2 Mantener el fallback cuando un clip falta, falla o no puede garantizar correspondencia: dejar visibles texto, imágenes y navegación sin TTS/IA ni bloqueo; verificar con un fallo simulado de reproducción (RNF-02 y escenarios de fallback).

## 3. Pruebas automatizadas de contrato

- [x] 3.1 Añadir o actualizar pruebas unitarias para `1×1`, `1×N`, `2×N` y una pareja con `a>2`, comprobando grupo, complemento, suma, producto y ausencia de «uno grupos»; verificar con `npm run test:unit`.
- [x] 3.2 Cubrir las pistas y textos derivados en singular y plural, confirmando que la operación, alternativas, resultado y evaluación del primer intento no cambian; verificar con `npm run test`.
- [x] 3.3 Cubrir la narración/fallback para `a=1` y `a>1`, incluyendo texto visible disponible cuando el clip Fola no se reproduce; verificar con la suite Fola existente y registrar el resultado reproducible.

## 4. Verificación E2E y responsive

- [x] 4.1 El executor configurado debe implementar y ejecutar los checks de navegador declarados para la demostración Aprende, narración, fallback y pistas con casos `a=1` y `a>1`; verificar en el navegador real el texto observable, la navegación no bloqueada y la correspondencia `a×b`.
- [x] 4.2 El executor configurado debe verificar los mismos escenarios en los viewports responsive declarados, incluyendo una operación de producto alto, sin delegar navegación asíncrona, viewport o concurrencia a `human_validation`; verificar con `npm run test:e2e` y conservar evidencia de salida.
- [x] 4.3 Ejecutar la suite completa declarada y comprobar que no regresan grupos, suma, producto, pistas, voz/fallback ni responsive; verificar con `npm run test` y documentar cualquier check no ejecutable como pendiente explícito.

## 5. Retirada y trazabilidad

- [x] 5.1 Retirar dentro del mismo cambio las plantillas o ramas sustituidas que puedan volver a producir discordancia, sin eliminar historial ni introducir un compositor paralelo; verificar mediante búsqueda de texto y pruebas de regresión.
- [x] 5.2 Actualizar la trazabilidad del cambio con Request #32, RF-02/RF-03/RF-04, RNF-02/RNF-05/RNF-07 y los escenarios cubiertos, sin declarar implementación o evidencia de Verify antes de ejecutarlas.
