# Múltiplo — Transferencia de contexto para OpenSpec
**Estado:** el juego v1.2 ya está implementado. Esta guía orienta cambios posteriores; no sustituye el código, el contrato del Issue autorizado ni el workflow nativo de OpenSpec.

## 1. Qué es este proyecto
Múltiplo es una web/PWA educativa en español para un niño de 6 años. Busca que comprenda la multiplicación mediante grupos iguales, suma repetida, preguntas breves, pistas y progresión positiva. Consulta `docs/INDEX.md`, los Changes archivados y el código para conocer el comportamiento vigente; las descripciones del MVP inicial pueden estar supersedidas.

## 2. Leer antes de proponer cambios
Orden recomendado (contexto de producto primero, decisiones y restricciones después):

1. [PRODUCT_VISION.md](PRODUCT_VISION.md): por qué existe, usuario, hipótesis, señales de éxito y no objetivos.
2. [MVP.md](MVP.md): contrato de comportamiento del MVP aprobado.
3. [LEARNING_MODEL.md](LEARNING_MODEL.md): invariantes matemáticas, rondas, scoring y desbloqueo.
4. [USER_EXPERIENCE.md](USER_EXPERIENCE.md): pantallas, interacción, voz y fallback.
5. [DECISIONS.md](DECISIONS.md): acuerdos cerrados, propuestas de apoyo y pendientes.
6. [ARCHITECTURE.md](ARCHITECTURE.md): drivers técnicos, restricciones y trade-offs.
7. [ROADMAP.md](ROADMAP.md): orden de entrega y evidencia de salida.
8. [TRACEABILITY.md](TRACEABILITY.md) y [QUALITY_AND_VALIDATION.md](QUALITY_AND_VALIDATION.md): cobertura y pruebas.
9. [ASSETS.md](ASSETS.md) + directorio [assets/](../assets/): recursos que ya existen.
10. [Issues de Múltiplo](https://github.com/silverberdi/multiplo/issues): el issue activo determina el alcance autorizado. V3-01 #42 trata solo historial y agregados locales; #43 y #44 son trabajo separado, actualmente `disabled`.

No usar la conversación original como fuente oculta: los acuerdos útiles deben quedar en el repositorio.

## 3. Configuración del proyecto OpenSpec
El archivo [openspec/config.yaml](../openspec/config.yaml) establece esquema `spec-driven`, el contexto esencial y reglas por artefacto. Este mecanismo es el recomendado por OpenSpec para inyectar contexto en propuestas, specs, diseño y tareas (guía: https://openspec.dev/docs/project-config).

El estado de OpenSpec debe consultarse con el CLI instalado. Los Changes archivados describen trabajo completado en su alcance; no inferir ejecución, validación o despliegue desde la sola existencia de documentos.

## 4. Diferencia entre intención de producto y specs canónicas
- **Documentos en `docs/`**: expresan visión, decisiones e historial; algunos límites iniciales fueron sustituidos por decisiones posteriores.
- **Issues GitHub**: unidades de entrega y trazabilidad al MVP.
- **`openspec/changes/<id>/`**: cambios propuestos por el agente, con proposal, specs, design, tasks según el esquema disponible.
- **`openspec/specs/`**: debe describir el **comportamiento efectivamente incorporado** mediante el ciclo de sync/archive del propio framework, no una ficción de implementación completa.

No poblar manualmente `openspec/specs/` con funcionalidades no implementadas solo para parecer un proyecto terminado.

## 5. Flujo operativo esperado cuando se autorice desarrollar
1. Identificar issue(s) a abordar y verificar dependencias.
2. Leer los documentos anteriores y los recursos multimedia ya versionados.
3. Usar el **workflow nativo de OpenSpec** para explorar/proponer, y generar especificaciones Gherkin, diseño y tareas según corresponda al esquema instalado.
4. Conservar referencia a cada issue, requisitos RF/RNF, decisiones D y escenarios Q afectados.
5. Detectar contradicciones entre documentación histórica, código y Change autorizado; respetar el Change y las decisiones vigentes, sin convertir hipótesis futuras en alcance.
6. Implementar únicamente dentro de un cambio y permisos autorizados.
7. Verificar tests y flujos reales, documentar resultados; **no declarar 'hecho' porque un archivo o issue existe**.
8. Integrar artefactos canónicos mediante el proceso de archive/sync del OpenSpec instalado, con evidencia de lo realmente hecho.

El orden exacto de comandos depende de la versión del CLI; usar las instrucciones de la versión instalada, no emular OpenSpec con archivos arbitrarios.

## 6. Reglas de decisión para el agente
**Contrato de producto más importante**:
- Niños de 6 años; español, autonomía con voz y texto.
- Request #21: tablas 1 a 10, factores 1 a 10 y dominio acumulado; la tabla 11 no existe.
- `a×b` representa **a grupos de b**.
- Cinco actividades por ronda (una demostración, cuatro preguntas).
- Tres opciones por pregunta, exactamente una correcta.
- Pistas y reintentos sin penalización; evaluación de **primer intento** únicamente.
- Desbloqueo con dominio acumulado v1.2, sin retroceder tablas.
- Progreso local; sin usuarios ni sincronización.
- Web responsive/PWA con fallback; sin servidor ni IA.
- Estrella y activos en repo: reutilizar antes de inventar más.

**Prioridades al decidir**: niño puede comprender/jugar > corrección matemática > ausencia de frustración > velocidad/simplicidad > mejoras estéticas opcionales.

## 7. Regla anti-sobreingeniería
No introducir por anticipación:
- frameworks pesados, microservicios, base de datos, autenticación, API, CMS;
- telemetría, perfiles parentales, tablas posteriores a la 10, monedas, ranking, mundos o minijuegos nuevos;
- infraestructura de pruebas desproporcionada para veinte multiplicaciones posibles;
- mecanismos propios que sustituyan el manejo de changes y specs de OpenSpec.

Una pequeña abstracción local solo se justifica si hace más claro y verificable el MVP.

## 8. Cómo gestionar hallazgos o solicitudes nuevas
Si un issue existente contradice un documento aprobado, registrarlo y pedir decisión de producto **antes de modificar la experiencia**. Si existe mejora futura no aprobada, documentarla en Roadmap como hipótesis sin convertirla automáticamente en tarea. Si es un defecto verificable contra contrato aprobado, el agente debe repararlo dentro del cambio autorizado y demostrarlo con aceptación Gherkin.

## 9. Estado y límites del trabajo documental
Este paquete puede servir como insumo de producto y OpenSpec. La producción de documentos y assets no implica implementación, despliegue, validación E2E con el niño ni cierre de issues.

**Fuentes OpenSpec:** https://openspec.dev/docs/project-config · https://openspec.dev/docs/configuration · https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md.
