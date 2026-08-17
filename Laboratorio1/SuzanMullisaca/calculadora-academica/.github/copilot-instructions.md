# Copilot instructions for this project

## Project shape
- This is a small static web app: `index.html` defines the UI, `css/styles.css` contains the visual system, and `js/app.js` implements the business logic.
- The form in `index.html` is the main interaction boundary. It reads three/four numeric inputs, validates them, computes a student average, and updates the result panel without a framework.
- The app is intentionally DOM-driven: IDs like `#formNotas`, `#promedioResultado`, and `#barraProgreso` are the contract between HTML and JavaScript.

## Key behaviors to preserve
- Validation is done in `js/app.js` with `convertirNota()`: empty values throw `TypeError`, invalid numbers throw `TypeError`, and values outside `0..20` throw `RangeError`.
- The average is calculated in `calcularPromedio()` and the status text is derived in `obtenerEstado()` using thresholds like `>= 18` = `Excelente` and `>= 12` = `Aprobado`.
- The result panel is only shown after valid submission; errors hide it and render the message in `#mensajeError`.

## Styling conventions
- CSS uses custom properties defined in `:root` for colors and spacing; keep new UI tokens aligned with the existing palette.
- Layout is built with CSS Grid; the note field layout is defined by `.rejilla-notas` and should remain responsive under `@media (max-width: 48rem)`.

## Workflow
- There is no build step or test runner in this repo. For local checks, open `index.html` directly in a browser or serve the folder with a simple static server.
- When making logic changes, validate both the happy path and the invalid-input path in the browser console; this project logs results with `console.table()` and `console.info()`.
- If you add a new form field, update the corresponding selector, validation, result `output[for=...]`, and styling grid in the same change.
