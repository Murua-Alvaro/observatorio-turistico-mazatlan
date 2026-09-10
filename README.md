# Observatorio Turístico de Mazatlán

Repositorio principal del Observatorio Turístico de Mazatlán.

## Arquitectura

- Frontend: React + TypeScript + Vite
- Visualización: Recharts
- Datos: artefactos auditados derivados de OMA, DataTur, INEGI EVI y SICT
- Deploy: Render con auto-deploy desde `main`
- Validación: scripts reproducibles y pruebas de estructura

## Flujo

Fuentes originales → auditoría → datos limpios → transformación → aplicación → Render.

Este repositorio es independiente de `growa-territorial` y de los demás proyectos de Growa.
