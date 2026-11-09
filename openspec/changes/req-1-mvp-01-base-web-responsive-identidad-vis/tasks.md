# Tasks

## 1. Estructura visual base

- [x] 1.1 Crear el shell estático en español y las cuatro vistas aprobadas (inicio/niveles, aprende, juego y fin de ronda), con navegación y controles primarios coherentes; verificar mediante recorrido manual que cada vista es alcanzable y que no se añaden pantallas fuera de MVP-01 (Issue #1, RF-01; escenarios de vistas base).
- [x] 1.2 Implementar tokens de identidad visual según `docs/ASSETS.md` (paleta, espaciado, jerarquía tipográfica, botones y números grandes) y enlazar `normal.svg`, `celebrando.svg` y `estrella-premio.svg`; verificar que los recursos se cargan desde `assets/` y que cada uso tiene texto alternativo o etiqueta accesible (Issue #1, D-006/D-013/D-018).
- [x] 1.3 Definir la carga de Nunito y Baloo 2 con `system-ui, sans-serif` como fallback; verificar con las webfonts disponibles y bloqueadas que títulos, texto y números siguen siendo legibles y que ningún error de fuente bloquea la navegación (RNF-07, escenario de fallback).

## 2. Responsive y estados de niveles

- [x] 2.1 Aplicar layout fluido y límites de contenido para celular, tablet y computador, incluyendo controles táctiles/clic grandes y ausencia de overflow horizontal; verificar en viewports representativos y con zoom/rotación que no aparece scroll horizontal ni control primario recortado (RNF-01/RNF-07, escenarios responsive).
- [x] 2.2 Renderizar niveles 1–4 en inicio/niveles, habilitar solo el nivel 1 como entrada visual inicial y marcar 2–4 como bloqueados con texto/icono accesible; verificar que no se calcula ni persiste progreso y que la vista no afirma lógica de desbloqueo implementada (RF-01, escenario de niveles).

## 3. PWA progresiva y límites técnicos

- [x] 3.1 Añadir manifest e icono de instalación derivado de `assets/icons/estrella-premio.svg`, enlazarlos desde la entrada web y definir el mínimo de nombre, colores y modo de presentación; verificar que el manifest es válido y que sus iconos resuelven desde el paquete (RF-09, D-014).
- [x] 3.2 Verificar el camino web sin instalación y documentar/ajustar la degradación cuando el navegador no ofrece PWA; comprobar que la experiencia base abre sin backend, login, analytics, publicidad, datos personales ni dependencias pesadas (RNF-03/RNF-04, escenario de fallback PWA).

## 4. Evidencia de integración del cambio

- [x] 4.1 Ejecutar una comprobación de recorrido completo de las cuatro vistas en celular, tablet y computador, incluyendo interacción por toque/clic y estados bloqueados; conservar el resultado como evidencia de los escenarios de la spec, sin declarar implementadas las reglas matemáticas, voz completa o progreso de issues posteriores.
- [x] 4.2 Inspeccionar dependencias y referencias del candidato para confirmar que solo se reutilizan los assets versionados y la solución estática aprobada; verificar explícitamente que la convención matemática, generador, puntuación 3/4 y persistencia local quedan fuera de este cambio y no se duplican aquí (Issue #1 frente a RF-03–RF-07).
