# Copilot Instructions - Panel de Finanzas Personales

## Project Overview

Single-file personal finance dashboard for tracking income, expenses, and savings goals. Built as a standalone `index.html` with embedded CSS and vanilla JavaScript—no build tools, frameworks, or external dependencies.

## Architecture

### Single-File Structure
Everything resides in [index.html](../index.html) organized in clearly marked sections:
- **CSS** (lines ~9-680): All styles within `<style>` tags, using CSS variables would be an improvement
- **HTML** (lines ~680-980): Semantic sections for dashboard cards, forms, tables, and modals
- **JavaScript** (lines ~980-1913): All logic within `<script>` tags

### Data Model
```javascript
// Core data structures stored in localStorage
movimientos = [{id, tipo, categoria, monto, fecha, descripcion}]
objetivoAhorro = number
categoriasPersonalizadas = {Ingreso: [{nombre, icono}], Gasto: [...]}
```

### Key Patterns
- **localStorage keys**: `finanzas_movimientos`, `finanzas_objetivo`, `finanzas_categorias`
- **ID generation**: `Date.now()` timestamp for unique movement IDs
- **Currency**: Colombian Peso format (`es-CO` locale, no decimals)
- **Date handling**: ISO format (`YYYY-MM-DD`) internally, `DD/MM/YYYY` for display

## Code Conventions

### JavaScript Functions
- Functions are documented with JSDoc-style comments
- UI updates follow pattern: modify data → `guardarDatosLocalStorage()` → update relevant UI sections
- Event handlers use inline `onclick` attributes (e.g., `onclick="agregarMovimiento(event)"`)

### CSS Classes
- **State modifiers**: `.activo`, `.negativo`, `.ingreso`, `.gasto`
- **Component prefixes**: `.tarjeta-*`, `.btn-*`, `.categoria-*`, `.filtro-*`
- **Responsive**: Mobile breakpoint at `768px`

### Spanish Language
All UI text, variable names, and comments are in Spanish. Maintain this convention:
- `movimientos` (not "movements"), `ingresos/gastos` (income/expenses)
- Function names: `agregarMovimiento`, `actualizarResumen`, `formatearMoneda`

## Critical Functions

| Function | Purpose |
|----------|---------|
| `inicializar()` | Entry point—loads localStorage, sets defaults, renders UI |
| `guardarDatosLocalStorage()` | Persists all data—call after ANY data modification |
| `actualizarResumen()` | Recalculates monthly totals for dashboard cards |
| `actualizarTabla()` | Re-renders movements table with current filters/sort |
| `obtenerCategorias(tipo)` | Merges predefined + custom categories |

## Adding Features

When adding new functionality:
1. Add any new data to the appropriate global variable
2. Update `guardarDatosLocalStorage()` and `cargarDatosLocalStorage()` if adding persistent data
3. Create render function following `actualizar*()` naming pattern
4. Call render function in `inicializar()` and after relevant data changes
5. Add HTML section with `<section>` wrapper and `<h2>` title with emoji

## Styling Guidelines

- Use existing CSS custom gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Cards use `.tarjeta` class with hover transform effect
- Buttons: `.btn-primario` (main actions), `.btn-secundario` (cancel), `.btn-eliminar` (destructive)
- Form inputs: 2px border, 10px border-radius, focus state with brand color shadow
