# Proposal

## Why

Múltiplo necesita una base web que un niño de seis años pueda abrir y recorrer con comodidad en celular, tablet o computador antes de integrar la lógica de aprendizaje. Este cambio atiende el Issue #1 de prioridad alta y establece la primera superficie visual, responsive e instalable del MVP sin introducir backend, cuentas ni dependencias pesadas.

## What Changes

- Crear la estructura visual estática de las cuatro vistas aprobadas: inicio/niveles, aprende, juego y fin de ronda, con navegación o acciones de demostración suficientes para recorrer el esqueleto sin prometer lógica completa.
- Definir la identidad visual aprobada: estrella amarilla, paleta de `ASSETS.md`, tipografías Nunito para lectura y cifras y Baloo 2 para títulos, con fallback del sistema.
- Reutilizar y vincular los recursos versionados pertinentes, incluidos `assets/mascot/normal.svg`, `assets/mascot/celebrando.svg` y `assets/icons/estrella-premio.svg`, sin depender de recursos adjuntos al chat.
- Hacer adaptables las vistas base para celular, tablet y computador, con controles grandes para toque/clic, texto y números legibles y sin desbordamiento horizontal.
- Mostrar visualmente los niveles 1–4 en la vista de inicio, dejando bloqueados los niveles posteriores mientras no exista integración de progreso.
- Añadir la configuración mínima de PWA: manifest e icono derivado de la estrella, de modo que el navegador pueda ofrecer instalación cuando la soporte; la web normal seguirá funcionando si no puede instalarse.
- Mantener una implementación estática y ligera, sin backend, login, datos personales, analítica, publicidad, framework grande, aplicaciones nativas, configuraciones avanzadas ni pantallas fuera del MVP-01.

## Capabilities

### New Capabilities

- `web-base-responsive-pwa`: Base visual responsive de Múltiplo, esqueleto de vistas, identidad visual, niveles iniciales bloqueados y configuración PWA instalable progresiva.

### Modified Capabilities

- Ninguna; el repositorio no contiene capacidades OpenSpec existentes y el juego aún no está implementado.

## Impact

- **Trazabilidad:** Issue #1; RF-01 y RF-09; RNF-01, RNF-03, RNF-04 y RNF-07; decisiones D-004, D-006, D-013, D-014, D-017 y D-018.
- **Superficie afectada:** nueva interfaz web estática, estilos responsive, referencias a activos SVG y configuración de manifest/icono PWA. No se modifica todavía la lógica matemática, el generador de ejercicios, el progreso local ni la síntesis de voz completa de issues posteriores.
- **Dependencias:** activos ya versionados en `assets/` y catálogo/paleta/tipografías de `docs/ASSETS.md`; no se añade backend ni dependencia pesada. La carga de webfonts debe degradar a `system-ui, sans-serif`.
- **Validación posterior:** inspección de desbordamiento y controles en tres factores de forma, carga de fallback tipográfico, presencia de manifest/icono y recorrido visual de las cuatro vistas. Esto será evidencia de implementación futura, no una afirmación de que el producto ya está construido.
