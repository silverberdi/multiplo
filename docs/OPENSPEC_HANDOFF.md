# Múltiplo — Transferencia de contexto para OpenSpec
**Estado:** repositorio pre-implementación. Esta guía proporciona contexto a un agente que más adelante planifique e implemente los issues; **no equivale a haber implementado el producto ni a haber ejecutado validaciones OpenSpec**.

## 1. Qué es este proyecto
Múltiplo es una web/PWA educativa en español para un niño de 6 años. Busca que comprenda la multiplicación mediante grupos iguales, suma repetida, preguntas breves, pistas y progresión positiva. El objetivo inmediato es validar que puede terminar una ronda con autonomía y mostrar interés en repetir. La aplicación **todavía no está construida**.

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
10. Issues [#1–#7](https://github.com/silverberdi/multiplo/issues): trabajo operativo con Gherkin y dependencias.

No usar la conversación original como fuente oculta: los acuerdos útiles deben quedar en el repositorio.

## 3. Configuración del proyecto OpenSpec
El archivo [openspec/config.yaml](../openspec/config.yaml) establece esquema `spec-driven`, el contexto esencial y reglas por artefacto. Este mecanismo es el recomendado por OpenSpec para inyectar contexto en propuestas, specs, diseño y tareas (guía: https://openspec.dev/docs/project-config).

**Advertencia de estado:** crear `openspec/config.yaml` no prueba que `openspec init`, ningún change, apply, verify o archive hayan sido ejecutados. El agente responsable de desarrollar deberá comprobar el estado real del entorno y completar la inicialización necesaria **cuando comience su trabajo autorizado**.

## 4. Diferencia entre intención de producto y specs canónicas
- **Documentos en `docs/`**: expresan el producto objetivo, decisiones y criterios de éxito aunque aún no exista código.
- **Issues GitHub**: unidades de entrega y trazabilidad al MVP.
- **`openspec/changes/<id>/`**: cambios propuestos por el agente, con proposal, specs, design, tasks según el esquema disponible.
- **`openspec/specs/`**: debe describir el **comportamiento efectivamente incorporado** mediante el ciclo de sync/archive del propio framework, no una ficción de implementación completa.

No poblar manualmente `openspec/specs/` con funcionalidades no implementadas solo para parecer un proyecto terminado.

## 5. Flujo operativo esperado cuando se autorice desarrollar
1. Identificar issue(s) a abordar y verificar dependencias.
2. Leer los documentos anteriores y los recursos multimedia ya versionados.
3. Usar el **workflow nativo de OpenSpec** para explorar/proponer, y generar especificaciones Gherkin, diseño y tareas según corresponda al esquema instalado.
4. Conservar referencia a cada issue, requisitos RF/RNF, decisiones D y escenarios Q afectados.
5. Detectar contradicciones de documentación antes de implementar; no resolverlas inventando alcance.
6. Implementar únicamente dentro de un cambio y permisos autorizados.
7. Verificar tests y flujos reales, documentar resultados; **no declarar 'hecho' porque un archivo o issue existe**.
8. Integrar artefactos canónicos mediante el proceso de archive/sync del OpenSpec instalado, con evidencia de lo realmente hecho.

El orden exacto de comandos depende de la versión del CLI; usar las instrucciones de la versión instalada, no emular OpenSpec con archivos arbitrarios.

## 6. Reglas de decisión para el agente
**Contrato de producto más importante**:
- Niños de 6 años; español, autonomía con voz y texto.
- Cuatro niveles: tablas 2 a 5, factores 1 a 5.
- `a×b` representa **a grupos de b**.
- Cinco actividades por ronda (una demostración, cuatro preguntas).
- Tres opciones por pregunta, exactamente una correcta.
- Pistas y reintentos sin penalización; evaluación de **primer intento** únicamente.
- Desbloqueo con 3 de 4 aciertos iniciales, sin retroceder niveles.
- Progreso local; sin usuarios ni sincronización.
- Web responsive/PWA con fallback; sin servidor ni IA.
- Estrella y activos en repo: reutilizar antes de inventar más.

**Prioridades al decidir**: niño puede comprender/jugar > corrección matemática > ausencia de frustración > velocidad/simplicidad > mejoras estéticas opcionales.

## 7. Regla anti-sobreingeniería
No introducir por anticipación:
- frameworks pesados, microservicios, base de datos, autenticación, API, CMS;
- telemetría, perfiles parentales, tablas 6–10, monedas, ranking, mundos o minijuegos nuevos;
- infraestructura de pruebas desproporcionada para veinte multiplicaciones posibles;
- mecanismos propios que sustituyan el manejo de changes y specs de OpenSpec.

Una pequeña abstracción local solo se justifica si hace más claro y verificable el MVP.

## 8. Cómo gestionar hallazgos o solicitudes nuevas
Si un issue existente contradice un documento aprobado, registrarlo y pedir decisión de producto **antes de modificar la experiencia**. Si existe mejora futura no aprobada, documentarla en Roadmap como hipótesis sin convertirla automáticamente en tarea. Si es un defecto verificable contra contrato aprobado, el agente debe repararlo dentro del cambio autorizado y demostrarlo con aceptación Gherkin.

## 9. Estado y límites del trabajo documental
Este paquete puede servir como insumo de BA/arquitectura y OpenSpec. La producción de documentos y assets no implica implementación, despliegue, validación E2E con el niño ni cierre de issues.

**Fuentes OpenSpec:** https://openspec.dev/docs/project-config · https://openspec.dev/docs/configuration · https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md.
