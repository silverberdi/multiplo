# Design

## Context

El comportamiento actual está distribuido entre `js/progression.js`, `js/question-engine.js`, `js/aprende.js`, `js/app.js` y `js/star-guide.js`, con persistencia local y el catálogo Fola preparado por #20. Las especificaciones delta de este change sustituyen los límites v1.0 de tablas 2–5 y desbloqueo 3/4 donde se indica; no autorizan backend, cuentas, sincronización, TTS ni nuevos assets.

## Goals / Non-Goals

**Goals:**

- Mantener un único recorrido Aprende → cuatro preguntas → cierre, ampliado a 100 operaciones dirigidas y repaso intercalado.
- Separar resultado de la tabla actual, resultado de repaso, estrellas y evidencia de dominio.
- Hacer la migración legacy determinista, idempotente y tolerante a fallos de almacenamiento.
- Reutilizar la integración Fola de #20 y comprobar el flujo real en Chromium mediante los comandos declarados.

**Non-Goals:**

- No añadir tablas 11, niveles alternativos, modos de examen, motor adaptativo general, backend, usuarios, analítica, IA, TTS, assets o despliegue.
- No convertir una respuesta histórica en evidencia de dominio ni usar validación presencial como gate del Change.

## Decisions

### 1. Catálogo dirigido como fuente matemática única

Se conservará un catálogo derivado de pares `{a,b}` con `a,b ∈ 1..10`; toda demostración, alternativa, pista y clip recibirá la misma pareja dirigida. Esto evita que la conmutatividad produzca distractores ambiguos. La alternativa de generar operaciones desde texto libre se rechaza porque duplicaría reglas matemáticas en UI.

### 2. Ronda con metadato explícito de repaso

Cada pregunta llevará metadatos de tabla origen y tipo (`actual` o `repaso`), además de modalidad y pareja dirigida. El planificador seleccionará tres actuales + un repaso para tablas 2–10, mezclará el arreglo final y reservará cuatro actuales para tabla 1. Se reutilizará el historial fallado existente como prioridad limitada; no se añadirá un perfil adaptativo.

### 3. Dominio acumulado en estado v1.2

El estado local versionado almacenará, por tabla, un historial acotado de las últimas tres rondas completadas con aciertos iniciales actuales y un conjunto/conteo de factores `b` cubiertos inicialmente. El repaso se guardará en el historial de errores y estrellas, pero no en esos dos indicadores. El desbloqueo será monotónico y transaccional en memoria antes de persistirse.

### 4. Migración por identidad, una sola vez

Al cargar, se intentará leer el estado v1.2; si no existe, se leerá `multiplo_progression_v1` y se mapeará su ordinal legacy a un conjunto de tablas. Se marcará la versión migrada y se escribirá el nuevo estado una vez. Un estado v1.2 válido será la única fuente posterior, evitando duplicar métricas. Sonido e historial de fallos se leen de sus claves existentes y se conservan con validación defensiva.

### 5. Renderizado escalable y voz reutilizada

`aprende.js` y la vista de preguntas representarán grupos con CSS grid/flex, agrupaciones de cinco/diez y texto de apoyo para productos altos. La selección Fola se extenderá por IDs ya presentes en el manifest de #20; si un evento concreto no tiene clip, se usa fallback textual. No se generarán ni descargarán audios nuevos.

### 6. Evidencia de UI en el executor configurado

Las pruebas de reglas permanecerán en `node --test`; los escenarios de navegación, voz/fallback, viewport y ausencia de overflow se implementarán/ejecutarán en las suites browser declaradas (`npm run test:e2e`) por el executor configurado durante Apply/Verify. No se delegarán esas comprobaciones al operador ni se declarará validación física.

## Risks / Trade-offs

- [Catálogo 1×1 y arreglos 10×10 pueden ser visualmente ambiguos] → probar orientación, etiquetas y suma en cada extremo; usar agrupaciones ordenadas, no una nube de íconos.
- [Migrar una clave legacy corrupta podría perder disponibilidad] → validar rangos, conservar solo desbloqueos seguros y continuar con tabla 1 en memoria; nunca lanzar una excepción al iniciar.
- [La métrica acumulada puede crecer con sesiones largas] → limitar el historial de rondas a las tres últimas y factores a un conjunto de diez por tabla.
- [Un clip Fola no cubre una combinación nueva] → consultar manifest preparado y mostrar texto equivalente; no usar TTS ni bloquear.
- [Cambios de orden pueden hacer frágiles tests antiguos] → actualizar aserciones que codifiquen el orden v1.0 y conservar pruebas de invariantes, sin borrar cobertura matemática.
- [La documentación base contradice v1.2] → actualizarla dentro del mismo Change y registrar la trazabilidad; no resolver la contradicción ocultándola en código.

## Migration Plan

1. Implementar estado v1.2 y migración en memoria con escritura defensiva, preservando las claves de sonido e historial.
2. Generar nuevas rondas desde el catálogo dirigido y registrar resultados actuales/repaso.
3. Actualizar UI, narración y CSS; retirar rutas v1.0 solo después de demostrar que sus consumidores usan el nuevo contrato.
4. Ejecutar tests unitarios y browser locales, incluyendo recarga, localStorage corrupto/restringido y viewports 360–412 px.
5. Si la implementación debe revertirse, conservar la clave legacy y evitar sobrescribirla destructivamente; una versión previa puede seguir leyendo su formato. No se despliega ni se migra producción en este Change.
