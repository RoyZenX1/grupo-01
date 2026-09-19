# Guía de Laboratorio 05: Proyecto integrador de JavaScript

**UTP | Ingeniería de Software y Sistemas | JavaScript Avanzado | Recurso de aprendizaje**

**Temas:** Algoritmos, módulos ES, clases, arreglos, objetos, funciones, validación, DOM, JSON, localStorage

| Semana | Sesiones | Duración | Hito |
|:------:|:--------:|:--------:|:----:|
| 05 | 09 y 10 | 4 horas | PC1 |

---

## Caso práctico: Panel de seguimiento académico

Construirás una aplicación modular que registra estudiantes y notas, calcula promedios, detecta riesgo académico, busca, filtra, ordena y elimina registros, y conserva respaldos con JSON y almacenamiento local.

---

## Ruta del laboratorio

La semana integra los aprendizajes anteriores en un producto verificable. Sigue el orden porque cada bloque prepara el siguiente.

| Bloque | Actividad | Evidencia |
|:------:|-----------|-----------|
| A | Traducir requisitos a reglas y algoritmos | Modelo y pseudocódigo |
| B | Diseñar arquitectura modular y flujo de datos | Mapa de responsabilidades |
| C | Implementar modelo, validadores y servicio | Lógica de negocio |
| D | Construir HTML semántico y CSS responsivo | Interfaz accesible |
| E | Conectar DOM, eventos y estado | Aplicación funcional |
| F | Ejecutar pruebas y simulación de PC1 | Matriz de evidencias |

## Ficha del laboratorio

| Elemento | Descripción |
|----------|-------------|
| **Logro** | Construye una aplicación web modular que transforma, valida, persiste y presenta datos académicos. |
| **Producto** | Panel de seguimiento académico con HTML, CSS y seis módulos JavaScript. |
| **Estrategia** | Análisis, diseño, implementación incremental, prueba sistemática y reflexión. |
| **Requisitos** | Visual Studio Code, navegador moderno y servidor local sencillo; no se requieren dependencias externas. |
| **Conocimientos previos** | Semanas 1 a 4: tipos, operadores, números, cadenas, regex, objetos, arreglos, clases, JSON, Map, Set, DOM y eventos. |

### Resultados de aprendizaje observables

- Descompone un problema en entrada, reglas, proceso, estado, salida y casos de error.
- Organiza el programa mediante módulos ES con dependencias explícitas y responsabilidades acotadas.
- Modela estudiantes con una clase, propiedades, getters y representación serializable.
- Aplica operadores, funciones y métodos de arreglos para calcular, buscar, filtrar, ordenar y resumir.
- Valida cadenas, números y unicidad antes de modificar el estado de la aplicación.
- Actualiza el DOM con nodos y `textContent`, registra eventos con `addEventListener` y conserva accesibilidad básica.
- Exporta, importa y persiste datos con JSON y `localStorage` sin asumir que los datos externos son confiables.
- Diseña y registra pruebas normales, de frontera, inválidas y de recuperación.

> **Propósito:** La meta no es acumular sintaxis, sino combinarla en decisiones coherentes que puedan explicarse, probarse y mantenerse.

---

## 1. Del contenido aislado a un sistema

Integrar significa hacer que cada concepto resuelva una responsabilidad concreta. El programa final debe conservar un único estado principal y derivar de él la interfaz y los indicadores.

| Semana | Conocimiento | Aplicación en el proyecto |
|:------:|--------------|---------------------------|
| 1 | Variables, tipos, condicionales, funciones, errores, DOM y eventos | Flujo del formulario, mensajes y actualización de la vista. |
| 2 | Números, operadores, `Math`, coerción y spread | Promedios, reglas de aprobación, copia de arreglos y contadores. |
| 3 | Cadenas y expresiones regulares | Normalización y validación de código, nombre y correo. |
| 4 | Objetos, arreglos, clases, JSON, `Map`, `Set` y flechas | Modelo, colecciones, índices, filtros, resumen y respaldo. |
| 5 | Algoritmos e integración | Arquitectura modular, persistencia, pruebas y evidencia. |

### 1.1 Anatomía de una solución

| Parte | Pregunta de diseño | Decisión del panel |
|-------|--------------------|--------------------|
| Entrada | ¿Qué datos llegan? | Código, nombre, correo, programa y tres notas. |
| Reglas | ¿Qué debe cumplirse? | Formato, rangos 0–20, campos no vacíos y código único. |
| Proceso | ¿Qué se calcula o transforma? | Normalización, promedio, estado, filtros, orden y resumen. |
| Estado | ¿Qué cambia durante el uso? | Arreglo privado de estudiantes; `Map` derivado por código. |
| Salida | ¿Qué observa la persona? | Tabla, métricas, mensajes, filtros y respaldo JSON. |
| Errores | ¿Cómo se recupera el sistema? | Excepciones controladas, datos anteriores intactos y mensajes claros. |

### 1.2 Algoritmo antes del código

**Código 1. Pseudocódigo del registro**

```text
AL ENVIAR el formulario
    impedir la recarga de la página
    leer los controles como texto
    normalizar espacios, mayúsculas y minúsculas
    validar formatos, rangos y unicidad
    SI existen errores
        informar sin modificar el estado
    SI NO
        crear Estudiante
        producir un nuevo arreglo con el registro
        reconstruir el índice Map
        guardar JSON en localStorage
        volver a renderizar la vista
    FIN SI
```

> **Invariante:** Después de cada operación exitosa, el arreglo principal y el `Map` deben contener exactamente los mismos códigos.

---

## 2. Arquitectura modular

Un módulo ES es un archivo JavaScript con ámbito propio que exporta e importa valores. El navegador resuelve sus rutas y evalúa cada módulo una sola vez. `type="module"` implica carga diferida, pero los módulos locales deben servirse mediante HTTP para evitar restricciones de `file://`.

| Módulo | Responsabilidad | No debe hacer |
|--------|-----------------|---------------|
| `modelos/Estudiante.js` | Representar una entidad y calcular valores propios. | Acceder al DOM o `localStorage`. |
| `datos/datosIniciales.js` | Proporcionar datos planos de demostración. | Modificar el estado. |
| `utilidades/validadores.js` | Normalizar y validar datos sin efectos externos. | Mostrar mensajes. |
| `servicios/EstudianteService.js` | Gestionar reglas, colección, índices, JSON y persistencia. | Construir filas HTML. |
| `app.js` | Conectar controles, eventos, servicio y representación visual. | Duplicar reglas del servicio. |

**Código 2. Importación y exportación nombradas**

```js
// modelos/Estudiante.js
export class Estudiante { /* ... */ }

// servicios/EstudianteService.js
import { Estudiante } from "../modelos/Estudiante.js";
export class EstudianteService { /* ... */ }

// app.js
import { EstudianteService } from "./servicios/EstudianteService.js";
```

> **Rutas:** Las rutas relativas se calculan desde el archivo que importa. Incluye la extensión `.js` y respeta mayúsculas y minúsculas.

### 2.1 Dependencias y flujo

| Origen | Depende de | Datos que intercambia |
|--------|------------|-----------------------|
| `app.js` | `datosIniciales` y `EstudianteService` | Entradas del formulario, filtros y resultados. |
| `EstudianteService.js` | `Estudiante` y validadores | Objetos normalizados, instancias y JSON. |
| `validadores.js` | Ningún módulo del proyecto | Objetos planos y lista de errores. |
| `Estudiante.js` | Ningún módulo del proyecto | Propiedades y valores calculados. |

---

## 3. Estado, datos derivados e inmutabilidad

El estado fuente es el arreglo de estudiantes. Programas únicos, índice por código, promedios, estados y métricas son datos derivados: se calculan nuevamente en vez de almacenarse como copias que podrían desincronizarse.

| Tipo | Ejemplo | Tratamiento |
|------|---------|-------------|
| Estado fuente | `#estudiantes` | Solo el servicio lo reemplaza después de validar. |
| Índice derivado | `#indicePorCodigo` | Se reconstruye después de agregar, eliminar o importar. |
| Valor calculado | `estudiante.promedio` | Getter; no se almacena en JSON. |
| Vista derivada | Lista filtrada y ordenada | `filter()` y `toSorted()` sin mutar el origen. |
| Resumen derivado | Aprobados, riesgo y promedio grupal | `reduce()` con acumulador explícito. |

**Código 3. Actualización sin mutar el arreglo anterior**

```js
// Agregar
this.#estudiantes = [...this.#estudiantes, nuevoEstudiante];

// Eliminar
this.#estudiantes = this.#estudiantes.filter(
  estudiante => estudiante.codigo !== codigo
);

// Ordenar una copia
return filtrados.toSorted(comparador);
```

> **Precisión:** La inmutabilidad aquí se aplica al contenedor `Array`. Los objetos contenidos siguen siendo referencias; por eso el servicio controla dónde se crean y reemplazan.

---

## 4. Validación como frontera

Toda entrada de formulario, `localStorage` o JSON es externa al modelo y debe considerarse no confiable. El orden recomendado es: **normalizar → validar → construir → persistir → renderizar**.

| Regla | Implementación | Caso límite |
|-------|----------------|-------------|
| Código | `^U\d{8}$` | `u20260001` se normaliza a `U20260001`. |
| Nombre | Letras Unicode, espacios, apóstrofo y guion | Rechaza números y símbolos ajenos al nombre. |
| Correo | Regla práctica sin espacios y con `@` | No pretende implementar todo el estándar de correo. |
| Programa | Longitud entre 3 y 60 | Se colapsan espacios repetidos. |
| Notas | Tres números finitos entre 0 y 20 | Cadena vacía no debe convertirse silenciosamente en 0. |
| Unicidad | `Map.has(codigo)` | Se revisa también al importar un arreglo completo. |

> **Regex:** Una expresión regular comprueba forma, no significado. Después del patrón todavía pueden existir reglas de longitud, rango, unicidad o negocio.

### 4.1 Excepciones y recuperación

`try...catch` debe rodear operaciones que realmente pueden fallar y cuyo error puede manejarse: `JSON.parse`, almacenamiento o una validación que lanza `TypeError`. No debe ocultar errores de programación de forma indiscriminada.

**Código 4. Importación atómica**

```js
try {
  const datos = JSON.parse(texto);
  const candidatos = validarYConstruirTodos(datos);
  this.#estudiantes = candidatos; // asignar solo al final
  this.#sincronizarIndice();
  this.guardarLocal();
} catch (error) {
  mostrarMensaje(`No se pudo importar: ${error.message}`);
}
```

La operación es atómica desde la perspectiva de la aplicación: si analizar o validar falla, el arreglo anterior permanece sin cambios.

---

## 5. DOM, eventos y salida segura

El DOM representa la página como nodos. La aplicación obtiene referencias una vez, registra eventos y vuelve a construir únicamente las partes variables. Para datos del usuario utiliza `textContent` o nodos explícitos; `innerHTML` interpretaría marcado y ampliaría riesgos innecesarios.

| Decisión | Motivo |
|----------|--------|
| `addEventListener()` | Separa el HTML del comportamiento y permite varios listeners. |
| `evento.preventDefault()` | Evita que el formulario recargue la página. |
| `replaceChildren()` | Sustituye el contenido dinámico de manera explícita. |
| `textContent` | Inserta texto sin interpretar etiquetas HTML. |
| `closest()` + `dataset` | Implementa delegación de eventos para botones creados dinámicamente. |
| `role="alert"` / `role="status"` | Ayuda a comunicar cambios mediante tecnologías de asistencia. |

---

## 6. JSON y localStorage

JSON es un formato de texto y `localStorage` almacena pares clave–valor de texto asociados al origen. Por ello se serializa antes de guardar y se analiza al cargar. Una instancia recuperada desde JSON debe reconstruirse para volver a obtener su prototipo y getters.

| Operación | Resultado | Precaución |
|-----------|-----------|------------|
| `JSON.stringify(valor)` | Texto JSON | Omite funciones y no conserva `Map`, `Set` ni prototipos. |
| `JSON.parse(texto)` | Valores y objetos planos | Puede lanzar `SyntaxError`; valida la estructura resultante. |
| `localStorage.setItem` | Guarda texto bajo una clave | Puede fallar por disponibilidad o cuota. |
| `localStorage.getItem` | Texto o `null` | Los datos pueden estar dañados o ser de otra versión. |
| `localStorage.removeItem` | Elimina una clave | Úsalo para recuperarte de respaldos inválidos. |

> **Límite:** `localStorage` es síncrono y no es una base de datos. No guardes contraseñas, tokens ni información sensible en este ejercicio.

---

## 7. Estrategia de pruebas

Una prueba define entrada, acción y resultado esperado. Para cada regla incluye al menos un caso válido, un valor de frontera y un caso inválido; después prueba la recuperación sin perder datos previos.

| Categoría | Ejemplo | Qué demuestra |
|-----------|---------|---------------|
| Normal | Notas 15, 14 y 16 | Promedio 15.00 y estado Aprobado. |
| Frontera inferior | Notas 0, 0 y 0 | El cero es válido y no se confunde con vacío. |
| Frontera de decisión | Promedio exacto 12 | La condición `>= 12` clasifica como Aprobado. |
| Inválido | Nota 20.1 | Se rechaza antes de modificar el arreglo. |
| Duplicado | Código ya registrado | `Map` detecta unicidad. |
| Recuperación | JSON mal formado | Se conserva el estado anterior y aparece un mensaje. |

---

## 8. Preparación del proyecto

La aplicación se ejecutará desde un servidor local porque utiliza módulos ES. No instales bibliotecas: el proyecto solo emplea APIs estándar del navegador.

| Archivo | Responsabilidad |
|---------|-----------------|
| `index.html` | Estructura semántica, formulario, métricas, filtros, tabla y área JSON. |
| `css/styles.css` | Sistema visual, cuadrículas, controles, tabla, estados y adaptación móvil. |
| `js/modelos/Estudiante.js` | Entidad `Estudiante`, promedio, estado, iniciales y `toJSON()`. |
| `js/datos/datosIniciales.js` | Cuatro registros planos para iniciar y restaurar. |
| `js/utilidades/validadores.js` | Normalización y reglas de entrada. |
| `js/servicios/EstudianteService.js` | Colección, `Map`/`Set`, filtros, resumen, JSON y `localStorage`. |
| `js/app.js` | Referencias DOM, renderizado, eventos y coordinación. |

### Estructura de carpetas

```text
lab-semana-05/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── modelos/
    │   └── Estudiante.js
    ├── datos/
    │   └── datosIniciales.js
    ├── utilidades/
    │   └── validadores.js
    └── servicios/
        └── EstudianteService.js
```

### Pasos

1. Crea la carpeta `lab-semana-05` y ábrela completa en Visual Studio Code.
2. Crea `index.html`, `css/styles.css` y las carpetas `js/modelos`, `js/datos`, `js/utilidades` y `js/servicios`.
3. Crea los cinco archivos JavaScript mostrados en la tabla.
4. Instala o usa la extensión **Live Server** y ejecuta *Open with Live Server* desde `index.html`.
5. Como alternativa, desde la carpeta del proyecto ejecuta `python -m http.server 5500` y abre `http://localhost:5500`.
6. Mantén DevTools abierto y revisa **Console** y **Application > Local Storage** durante las pruebas.

> **No uses doble clic:** Abrir `index.html` con `file://` puede bloquear la carga de módulos por seguridad. Usa siempre una URL `http://localhost`.

---

## 9. Implementación de HTML semántico

Abre `index.html` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Códigos 5 a 10: `index.html` (bloques 1 a 6, unidos)**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de seguimiento académico</title>
  <link rel="stylesheet" href="./css/styles.css">
  <script type="module" src="./js/app.js"></script>
</head>
<body>
  <header class="encabezado">
    <div class="contenedor">
      <p class="etiqueta">JavaScript Avanzado · Semana 5</p>
      <h1>Panel de seguimiento académico</h1>
      <p class="introduccion">
        Proyecto integrador de la Unidad 1 y preparación práctica para la PC1.
      </p>
    </div>
  </header>

  <main class="contenedor contenido">
    <section class="panel" aria-labelledby="titulo-registro">
      <h2 id="titulo-registro">Registrar estudiante</h2>
      <form id="formEstudiante" novalidate>
        <div class="campos">
          <div class="campo">
            <label for="codigo">Código</label>
            <input id="codigo" name="codigo" type="text" maxlength="9"
                   placeholder="U20260001" required>
            <small>Formato: U seguido de 8 dígitos.</small>
          </div>
          <div class="campo campo-doble">
            <label for="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" type="text" maxlength="80"
                   autocomplete="name" placeholder="Ana María Pérez" required>
          </div>
          <div class="campo campo-doble">
            <label for="correo">Correo</label>
            <input id="correo" name="correo" type="email" maxlength="120"
                   autocomplete="email" placeholder="ana.perez@utp.edu.pe" required>
          </div>
          <div class="campo">
            <label for="programa">Programa</label>
            <input id="programa" name="programa" type="text" maxlength="60"
                   placeholder="Ingeniería de Software" required>
          </div>
          <div class="campo">
            <label for="nota1">Nota 1</label>
            <input id="nota1" name="nota1" type="number" min="0" max="20"
                   step="0.1" placeholder="15" required>
          </div>
          <div class="campo">
            <label for="nota2">Nota 2</label>
            <input id="nota2" name="nota2" type="number" min="0" max="20"
                   step="0.1" placeholder="14" required>
          </div>
          <div class="campo">
            <label for="nota3">Nota 3</label>
            <input id="nota3" name="nota3" type="number" min="0" max="20"
                   step="0.1" placeholder="16" required>
          </div>
        </div>
        <div class="acciones">
          <button type="submit">Registrar</button>
          <button id="btnRestaurar" type="button" class="secundario">Restaurar ejemplo</button>
        </div>
      </form>
      <div id="mensajes" class="mensajes" role="alert" hidden></div>
    </section>

    <section class="panel metricas-panel" aria-labelledby="titulo-indicadores">
      <h2 id="titulo-indicadores">Indicadores</h2>
      <dl class="metricas">
        <div><dt>Estudiantes</dt><dd id="totalEstudiantes">0</dd></div>
        <div><dt>Aprobados</dt><dd id="totalAprobados">0</dd></div>
        <div><dt>En riesgo</dt><dd id="totalRiesgo">0</dd></div>
        <div><dt>Promedio grupal</dt><dd id="promedioGrupal">0.00</dd></div>
      </dl>
      <p id="mensajeRiesgo" class="alerta" role="status"></p>
    </section>

    <section class="panel panel-completo" aria-labelledby="titulo-listado">
      <div class="cabecera-seccion">
        <div>
          <p class="etiqueta">Seguimiento</p>
          <h2 id="titulo-listado">Resultados académicos</h2>
        </div>
        <span id="resumenVisible" class="insignia">0 estudiantes</span>
      </div>
      <div class="filtros">
        <div class="campo campo-doble">
          <label for="busqueda">Buscar</label>
          <input id="busqueda" type="search" placeholder="Código, nombre o correo">
        </div>
        <div class="campo">
          <label for="filtroPrograma">Programa</label>
          <select id="filtroPrograma"><option value="">Todos</option></select>
        </div>
        <div class="campo">
          <label for="filtroEstado">Estado</label>
          <select id="filtroEstado">
            <option value="">Todos</option>
            <option value="Aprobado">Aprobado</option>
            <option value="En riesgo">En riesgo</option>
          </select>
        </div>
        <div class="campo">
          <label for="orden">Orden</label>
          <select id="orden">
            <option value="nombre">Nombre A–Z</option>
            <option value="promedio-desc">Mayor promedio</option>
            <option value="promedio-asc">Menor promedio</option>
          </select>
        </div>
      </div>
      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Programa</th>
              <th>Notas</th>
              <th class="numero">Promedio</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody id="cuerpoEstudiantes"></tbody>
        </table>
      </div>
      <p id="estadoVacio" class="estado-vacio" hidden>No se encontraron estudiantes.</p>
    </section>

    <section class="panel panel-completo" aria-labelledby="titulo-json">
      <h2 id="titulo-json">Respaldo e intercambio JSON</h2>
      <p>
        La aplicación guarda automáticamente en el navegador. También puedes exportar
        el arreglo actual o importar un respaldo previamente validado.
      </p>
      <label for="areaJson">Datos JSON</label>
      <textarea id="areaJson" rows="10" spellcheck="false"
                placeholder='[{"codigo":"U20260001","nombre":"Ana Pérez",...}]'></textarea>
      <div class="acciones">
        <button id="btnExportar" type="button">Exportar</button>
        <button id="btnImportar" type="button" class="secundario">Importar</button>
      </div>
    </section>
  </main>
</body>
</html>
```

**Notas por bloque**

- **Bloque 1:** El `head` carga la hoja de estilos y declara `app.js` como módulo; el navegador difiere automáticamente su ejecución.
- **Bloque 2:** El formulario asocia `label` y control, mantiene atributos HTML útiles y delega las reglas de negocio a JavaScript.
- **Bloque 3:** Las notas conservan el valor como texto hasta que los validadores comprueban que no esté vacío y que su conversión sea finita.
- **Bloque 4:** Los botones declaran su tipo para evitar envíos accidentales; `role="alert"` comunica los errores del formulario.
- **Bloque 5:** `dl` representa pares término–valor para las métricas y `role="status"` comunica cambios no críticos.
- **Bloque 6:** Los filtros representan condiciones independientes que el servicio combina mediante operadores lógicos.

---

## 10. Implementación de CSS responsivo

Abre `css/styles.css` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Códigos 11 a 15: `css/styles.css` (bloques 1 a 5, unidos)**

```css
:root {
  color-scheme: light;
  --azul-900: #0b2545;
  --azul-700: #1f4d78;
  --azul-500: #2e74b5;
  --azul-100: #e8f1fb;
  --rojo: #e63b2e;
  --tinta: #172033;
  --gris: #667085;
  --borde: #d7dee8;
  --fondo: #f4f7fb;
  --blanco: #ffffff;
  --verde: #13795b;
  --verde-claro: #e8f5f0;
  --error: #9b1c1c;
  --error-claro: #fdecec;
  --advertencia: #8a6500;
  --advertencia-claro: #fff6d9;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--tinta);
  background: var(--fondo);
  line-height: 1.5;
}

.contenedor {
  width: min(1180px, calc(100% - 2rem));
  margin-inline: auto;
}

.encabezado {
  padding: 2.7rem 0 5rem;
  color: var(--blanco);
  background: linear-gradient(135deg, var(--azul-900), var(--azul-500));
}

h1, h2, p { margin-top: 0; }
h1 { max-width: 850px; margin-bottom: .5rem; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; }
h2 { margin-bottom: 1rem; color: var(--azul-900); }
.introduccion { max-width: 720px; margin-bottom: 0; color: #dbeafe; }
.etiqueta { margin-bottom: .35rem; color: var(--rojo); font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }

.contenido {
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 1.25rem;
  margin-top: -2.8rem;
  padding-bottom: 3rem;
}

.panel {
  padding: clamp(1.1rem, 3vw, 1.8rem);
  border: 1px solid var(--borde);
  border-radius: 1rem;
  background: var(--blanco);
  box-shadow: 0 18px 45px rgb(11 37 69 / 10%);
}

.panel-completo { grid-column: 1 / -1; }
.campos, .filtros { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .9rem; }
.campo-doble { grid-column: span 2; }
.campo { margin-bottom: .9rem; }
label { display: block; margin-bottom: .35rem; font-weight: 700; }
small { color: var(--gris); }

input, select, textarea {
  width: 100%;
  padding: .72rem .8rem;
  border: 1px solid #aeb9c8;
  border-radius: .55rem;
  color: inherit;
  background: #fff;
  font: inherit;
}

textarea { resize: vertical; font-family: ui-monospace, "Cascadia Code", monospace; font-size: .9rem; }
input:focus, select:focus, textarea:focus { outline: 3px solid rgb(46 116 181 / 22%); border-color: var(--azul-500); }
.acciones { display: flex; flex-wrap: wrap; gap: .7rem; margin-top: .5rem; }

button {
  padding: .7rem .95rem;
  border: 2px solid var(--azul-700);
  border-radius: .55rem;
  color: #fff;
  background: var(--azul-700);
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

button:hover { background: var(--azul-900); }
button:focus-visible { outline: 3px solid rgb(230 59 46 / 35%); outline-offset: 2px; }
button.secundario { color: var(--azul-700); background: #fff; }
button.peligro { padding: .35rem .55rem; border-color: var(--error); color: var(--error); background: #fff; font-size: .84rem; }
.mensajes { margin-top: 1rem; padding: .8rem 1rem; border-left: 4px solid var(--error); color: var(--error); background: var(--error-claro); }
.mensajes.exito { border-color: var(--verde); color: var(--verde); background: var(--verde-claro); }
.cabecera-seccion { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
.insignia { padding: .35rem .65rem; border-radius: 999px; color: var(--azul-900); background: var(--azul-100); font-weight: 750; white-space: nowrap; }
.metricas { display: grid; grid-template-columns: repeat(2, 1fr); gap: .65rem; margin: 0; }
.metricas div { padding: .8rem; border-radius: .65rem; background: var(--azul-100); text-align: center; }
.metricas dt { color: var(--gris); font-size: .78rem; }
.metricas dd { margin: 0; color: var(--azul-900); font-size: 1.35rem; font-weight: 800; }
.alerta { margin: 1rem 0 0; padding: .7rem; border-radius: .5rem; color: var(--advertencia); background: var(--advertencia-claro); font-weight: 700; }
.tabla-contenedor { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--borde); text-align: left; vertical-align: top; }
th { color: var(--azul-900); background: var(--azul-100); font-size: .87rem; }
.numero { text-align: right; font-variant-numeric: tabular-nums; }
.secundario-texto { color: var(--gris); font-size: .82rem; }
.estado { display: inline-block; padding: .2rem .5rem; border-radius: 999px; font-size: .8rem; font-weight: 800; }
.estado.aprobado { color: var(--verde); background: var(--verde-claro); }
.estado.riesgo { color: var(--error); background: var(--error-claro); }
.estado-vacio { padding: 1rem; color: var(--gris); text-align: center; }
[hidden] { display: none !important; }

@media (max-width: 860px) {
  .contenido, .campos, .filtros { grid-template-columns: 1fr; }
  .panel-completo, .campo-doble { grid-column: auto; }
}

@media (max-width: 520px) {
  .metricas { grid-template-columns: 1fr; }
  .cabecera-seccion { flex-direction: column; }
}
```

**Notas por bloque**

- **Bloque 1:** Las variables concentran colores, bordes y sombras para evitar valores dispersos.
- **Bloque 2:** La cuadrícula principal distribuye paneles y permite que los paneles completos ocupen ambas columnas.
- **Bloque 3:** Los controles comparten medidas y conservan un foco visible para navegación por teclado.
- **Bloque 4:** Las métricas y filtros se adaptan al espacio disponible sin cambiar la estructura HTML.
- **Bloque 5:** La tabla permite desplazamiento horizontal, alinea números y diferencia estados sin depender solo del color.

---

## 11. Implementación del modelo `Estudiante`

Abre `js/modelos/Estudiante.js` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Códigos 16 y 17: `js/modelos/Estudiante.js` (bloques 1 y 2, unidos)**

```js
export class Estudiante {
  constructor({ codigo, nombre, correo, programa, notas }) {
    this.codigo = String(codigo).trim().toUpperCase();
    this.nombre = String(nombre).trim();
    this.correo = String(correo).trim().toLocaleLowerCase("es-PE");
    this.programa = String(programa).trim();
    this.notas = notas.map(Number);
  }

  get promedio() {
    const suma = this.notas.reduce((total, nota) => total + nota, 0);
    return Math.round((suma / this.notas.length + Number.EPSILON) * 100) / 100;
  }

  get estado() {
    return this.promedio >= 12 ? "Aprobado" : "En riesgo";
  }

  get iniciales() {
    return this.nombre
      .split(/\s+/u)
      .slice(0, 2)
      .map(parte => parte.at(0)?.toLocaleUpperCase("es-PE") ?? "")
      .join("");
  }

  toJSON() {
    return {
      codigo: this.codigo,
      nombre: this.nombre,
      correo: this.correo,
      programa: this.programa,
      notas: [...this.notas]
    };
  }

  static desdeObjeto(datos) {
    return new Estudiante(datos);
  }
}
```

**Notas por bloque**

- **Bloque 1:** El constructor normaliza tipos básicos y copia las notas para no conservar el arreglo recibido como alias.
- **Bloque 2:** `promedio` y `estado` son getters derivados: siempre reflejan las notas actuales y no duplican información.

---

## 12. Implementación de datos iniciales

Abre `js/datos/datosIniciales.js` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Código 18: `js/datos/datosIniciales.js` (bloque 1 de 1)**

```js
export const DATOS_INICIALES = [
  {
    codigo: "U20260001",
    nombre: "Ana María Pérez",
    correo: "ana.perez@utp.edu.pe",
    programa: "Ingeniería de Software",
    notas: [16, 15, 17]
  },
  {
    codigo: "U20260002",
    nombre: "Luis Alberto Rojas",
    correo: "luis.rojas@utp.edu.pe",
    programa: "Ingeniería de Sistemas",
    notas: [11, 10, 12]
  },
  {
    codigo: "U20260003",
    nombre: "María José Salas",
    correo: "maria.salas@utp.edu.pe",
    programa: "Ingeniería de Software",
    notas: [14, 13, 15]
  },
  {
    codigo: "U20260004",
    nombre: "Diego Núñez Torres",
    correo: "diego.nunez@utp.edu.pe",
    programa: "Ingeniería de Sistemas",
    notas: [8, 11, 9]
  }
];
```

Se exportan objetos planos porque representan datos transportables, no comportamiento.

---

## 13. Implementación de validadores

Abre `js/utilidades/validadores.js` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Códigos 19 y 20: `js/utilidades/validadores.js` (bloques 1 y 2, unidos)**

```js
const PATRON_CODIGO = /^U\d{8}$/u;
const PATRON_NOMBRE = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export function normalizarTexto(texto) {
  return String(texto).trim().replace(/\s+/gu, " ");
}

export function normalizarDatos(datos) {
  return {
    codigo: normalizarTexto(datos.codigo).toUpperCase(),
    nombre: normalizarTexto(datos.nombre),
    correo: normalizarTexto(datos.correo).toLocaleLowerCase("es-PE"),
    programa: normalizarTexto(datos.programa),
    notas: datos.notas.map(Number)
  };
}

export function validarDatosEstudiante(datos) {
  const errores = [];

  if (!PATRON_CODIGO.test(datos.codigo)) {
    errores.push("El código debe tener el formato U seguido de 8 dígitos.");
  }
  if (!PATRON_NOMBRE.test(datos.nombre)) {
    errores.push("El nombre solo puede contener letras, espacios, apóstrofes o guiones.");
  }
  if (!PATRON_CORREO.test(datos.correo)) {
    errores.push("El correo no tiene una estructura válida.");
  }
  if (datos.programa.length < 3) {
    errores.push("El programa debe tener al menos 3 caracteres.");
  }
  if (!Array.isArray(datos.notas) || datos.notas.length !== 3) {
    errores.push("Se requieren exactamente 3 notas.");
  } else if (datos.notas.some(nota => !Number.isFinite(nota) || nota < 0 || nota > 20)) {
    errores.push("Cada nota debe ser un número entre 0 y 20.");
  }

  return errores;
}
```

**Notas por bloque**

- **Bloque 1:** Las regex se declaran una vez; la bandera `u` permite tratar el patrón como Unicode.
- **Bloque 2:** `normalizarDatos` devuelve un objeto nuevo y preserva notas vacías como `NaN` para que no se confundan con cero.

---

## 14. Implementación del servicio de estudiantes

Abre `js/servicios/EstudianteService.js` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Códigos 21 a 26: `js/servicios/EstudianteService.js` (bloques 1 a 6, unidos)**

```js
import { Estudiante } from "../modelos/Estudiante.js";
import { normalizarDatos, validarDatosEstudiante } from "../utilidades/validadores.js";

const CLAVE_ALMACENAMIENTO = "js-avanzado-semana5-estudiantes-v1";
const comparadorTexto = new Intl.Collator("es-PE", { sensitivity: "base" });

export class EstudianteService {
  #estudiantes = [];
  #indicePorCodigo = new Map();
  #almacenamiento;

  constructor(datosIniciales = [], almacenamiento = globalThis.localStorage) {
    this.#almacenamiento = almacenamiento;
    this.reemplazarTodos(datosIniciales, { guardar: false });
  }

  listar() {
    return [...this.#estudiantes];
  }

  obtenerPorCodigo(codigo) {
    return this.#indicePorCodigo.get(codigo);
  }

  obtenerProgramas() {
    return [...new Set(this.#estudiantes.map(estudiante => estudiante.programa))]
      .toSorted(comparadorTexto.compare);
  }

  agregar(datos) {
    const normalizados = normalizarDatos(datos);
    const errores = validarDatosEstudiante(normalizados);

    if (this.#indicePorCodigo.has(normalizados.codigo)) {
      errores.push("El código ya se encuentra registrado.");
    }
    if (errores.length > 0) {
      throw new TypeError(errores.join(" "));
    }

    this.#estudiantes = [...this.#estudiantes, new Estudiante(normalizados)];
    this.#sincronizarIndice();
    this.guardarLocal();
  }

  eliminar(codigo) {
    if (!this.#indicePorCodigo.has(codigo)) return false;

    this.#estudiantes = this.#estudiantes.filter(estudiante => estudiante.codigo !== codigo);
    this.#sincronizarIndice();
    this.guardarLocal();
    return true;
  }

  buscar({ texto = "", programa = "", estado = "", orden = "nombre" } = {}) {
    const termino = String(texto).trim().toLocaleLowerCase("es-PE");

    const filtrados = this.#estudiantes.filter(estudiante => {
      const coincideTexto = termino === "" ||
        estudiante.codigo.toLocaleLowerCase("es-PE").includes(termino) ||
        estudiante.nombre.toLocaleLowerCase("es-PE").includes(termino) ||
        estudiante.correo.toLocaleLowerCase("es-PE").includes(termino);
      const coincidePrograma = programa === "" || estudiante.programa === programa;
      const coincideEstado = estado === "" || estudiante.estado === estado;
      return coincideTexto && coincidePrograma && coincideEstado;
    });

    const comparadores = {
      "promedio-desc": (a, b) => b.promedio - a.promedio,
      "promedio-asc": (a, b) => a.promedio - b.promedio,
      nombre: (a, b) => comparadorTexto.compare(a.nombre, b.nombre)
    };

    return filtrados.toSorted(comparadores[orden] ?? comparadores.nombre);
  }

  obtenerResumen() {
    const base = this.#estudiantes.reduce((resumen, estudiante) => ({
      total: resumen.total + 1,
      aprobados: resumen.aprobados + (estudiante.estado === "Aprobado" ? 1 : 0),
      riesgo: resumen.riesgo + (estudiante.estado === "En riesgo" ? 1 : 0),
      sumaPromedios: resumen.sumaPromedios + estudiante.promedio
    }), { total: 0, aprobados: 0, riesgo: 0, sumaPromedios: 0 });

    return {
      ...base,
      promedioGrupal: base.total === 0 ? 0 : base.sumaPromedios / base.total
    };
  }

  exportarJson() {
    return JSON.stringify(this.#estudiantes, null, 2);
  }

  importarJson(texto) {
    const datos = JSON.parse(texto);
    this.reemplazarTodos(datos, { guardar: true });
  }

  reemplazarTodos(datos, { guardar = true } = {}) {
    if (!Array.isArray(datos)) {
      throw new TypeError("Los datos deben contener un arreglo de estudiantes.");
    }

    const candidatos = datos.map((dato, indice) => {
      const normalizados = normalizarDatos(dato);
      const errores = validarDatosEstudiante(normalizados);
      if (errores.length > 0) {
        throw new TypeError(`Elemento ${indice + 1}: ${errores.join(" ")}`);
      }
      return new Estudiante(normalizados);
    });

    const codigos = candidatos.map(estudiante => estudiante.codigo);
    if (new Set(codigos).size !== codigos.length) {
      throw new TypeError("Los códigos no pueden repetirse.");
    }

    this.#estudiantes = candidatos;
    this.#sincronizarIndice();
    if (guardar) this.guardarLocal();
  }

  guardarLocal() {
    if (!this.#almacenamiento) return;
    this.#almacenamiento.setItem(CLAVE_ALMACENAMIENTO, this.exportarJson());
  }

  cargarLocal() {
    if (!this.#almacenamiento) return false;
    const texto = this.#almacenamiento.getItem(CLAVE_ALMACENAMIENTO);
    if (texto === null) return false;

    this.reemplazarTodos(JSON.parse(texto), { guardar: false });
    return true;
  }

  limpiarLocal() {
    this.#almacenamiento?.removeItem(CLAVE_ALMACENAMIENTO);
  }

  #sincronizarIndice() {
    this.#indicePorCodigo = new Map(
      this.#estudiantes.map(estudiante => [estudiante.codigo, estudiante])
    );
  }
}
```

**Notas por bloque**

- **Bloque 1:** Los campos privados protegen el arreglo y su índice; el constructor permite inyectar un almacenamiento alternativo para pruebas.
- **Bloque 2:** `listar` devuelve una copia superficial y `obtenerProgramas` combina `Array`, `Set` y `toSorted`.
- **Bloque 3:** `agregar` normaliza, valida, comprueba `Map` y solo después crea una instancia y persiste.
- **Bloque 4:** `eliminar` usa `filter` para producir un arreglo nuevo y devuelve un booleano que indica si hubo cambio.
- **Bloque 5:** `buscar` combina condiciones opcionales y selecciona el comparador mediante un objeto de estrategias.
- **Bloque 6:** `obtenerResumen` usa `reduce` con acumulador explícito y evita dividir entre cero.

---

## 15. Implementación del controlador y la vista

Abre `js/app.js` y escribe todos los bloques en orden. Los bloques forman un único archivo; no agregues etiquetas ni comentarios que no se indiquen.

**Códigos 27 a 34: `js/app.js` (bloques 1 a 8, unidos)**

```js
import { DATOS_INICIALES } from "./datos/datosIniciales.js";
import { EstudianteService } from "./servicios/EstudianteService.js";

const formulario = document.querySelector("#formEstudiante");
const cuerpoEstudiantes = document.querySelector("#cuerpoEstudiantes");
const mensajes = document.querySelector("#mensajes");
const busqueda = document.querySelector("#busqueda");
const filtroPrograma = document.querySelector("#filtroPrograma");
const filtroEstado = document.querySelector("#filtroEstado");
const selectorOrden = document.querySelector("#orden");
const estadoVacio = document.querySelector("#estadoVacio");
const areaJson = document.querySelector("#areaJson");

const servicio = new EstudianteService(DATOS_INICIALES);
const formateadorPromedio = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function mostrarMensaje(texto, tipo = "error") {
  mensajes.textContent = texto;
  mensajes.classList.toggle("exito", tipo === "exito");
  mensajes.hidden = false;
}

function ocultarMensaje() {
  mensajes.hidden = true;
  mensajes.textContent = "";
}

function crearCelda() {
  return document.createElement("td");
}

function crearFila(estudiante) {
  const fila = document.createElement("tr");

  const celdaEstudiante = crearCelda();
  const nombre = document.createElement("strong");
  const datos = document.createElement("div");
  nombre.textContent = `${estudiante.iniciales} · ${estudiante.nombre}`;
  datos.className = "secundario-texto";
  datos.textContent = `${estudiante.codigo} · ${estudiante.correo}`;
  celdaEstudiante.append(nombre, datos);

  const celdaPrograma = crearCelda();
  celdaPrograma.textContent = estudiante.programa;

  const celdaNotas = crearCelda();
  celdaNotas.textContent = estudiante.notas.join(" · ");

  const celdaPromedio = crearCelda();
  celdaPromedio.className = "numero";
  celdaPromedio.textContent = formateadorPromedio.format(estudiante.promedio);

  const celdaEstado = crearCelda();
  const etiquetaEstado = document.createElement("span");
  etiquetaEstado.className = `estado ${estudiante.estado === "Aprobado" ? "aprobado" : "riesgo"}`;
  etiquetaEstado.textContent = estudiante.estado;
  celdaEstado.append(etiquetaEstado);

  const celdaAccion = crearCelda();
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "peligro";
  boton.dataset.codigo = estudiante.codigo;
  boton.textContent = "Eliminar";
  celdaAccion.append(boton);

  fila.append(
    celdaEstudiante,
    celdaPrograma,
    celdaNotas,
    celdaPromedio,
    celdaEstado,
    celdaAccion
  );
  return fila;
}

function actualizarProgramas() {
  const seleccion = filtroPrograma.value;
  filtroPrograma.replaceChildren(new Option("Todos", ""));
  servicio.obtenerProgramas().forEach(programa => {
    filtroPrograma.add(new Option(programa, programa));
  });
  filtroPrograma.value = servicio.obtenerProgramas().includes(seleccion) ? seleccion : "";
}

function actualizarIndicadores() {
  const resumen = servicio.obtenerResumen();
  document.querySelector("#totalEstudiantes").textContent = resumen.total;
  document.querySelector("#totalAprobados").textContent = resumen.aprobados;
  document.querySelector("#totalRiesgo").textContent = resumen.riesgo;
  document.querySelector("#promedioGrupal").textContent =
    formateadorPromedio.format(resumen.promedioGrupal);
  document.querySelector("#mensajeRiesgo").textContent = resumen.riesgo > 0
    ? `${resumen.riesgo} estudiante${resumen.riesgo === 1 ? " requiere" : "s requieren"} acompañamiento.`
    : "No existen estudiantes en riesgo.";
}

function renderizar() {
  const visibles = servicio.buscar({
    texto: busqueda.value,
    programa: filtroPrograma.value,
    estado: filtroEstado.value,
    orden: selectorOrden.value
  });

  cuerpoEstudiantes.replaceChildren(...visibles.map(crearFila));
  estadoVacio.hidden = visibles.length > 0;
  document.querySelector("#resumenVisible").textContent =
    `${visibles.length} estudiante${visibles.length === 1 ? "" : "s"}`;
  actualizarIndicadores();
}

function sincronizarVista() {
  actualizarProgramas();
  renderizar();
}

function leerFormulario() {
  return {
    codigo: formulario.elements.codigo.value,
    nombre: formulario.elements.nombre.value,
    correo: formulario.elements.correo.value,
    programa: formulario.elements.programa.value,
    notas: [
      formulario.elements.nota1.value,
      formulario.elements.nota2.value,
      formulario.elements.nota3.value
    ]
  };
}

function manejarRegistro(evento) {
  evento.preventDefault();
  ocultarMensaje();

  try {
    servicio.agregar(leerFormulario());
    formulario.reset();
    sincronizarVista();
    mostrarMensaje("Estudiante registrado correctamente.", "exito");
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

function manejarEliminacion(evento) {
  const boton = evento.target.closest("button[data-codigo]");
  if (!boton) return;

  const estudiante = servicio.obtenerPorCodigo(boton.dataset.codigo);
  if (!estudiante) return;

  servicio.eliminar(estudiante.codigo);
  sincronizarVista();
  mostrarMensaje(`${estudiante.nombre} fue eliminado.`, "exito");
}

function exportarJson() {
  areaJson.value = servicio.exportarJson();
  mostrarMensaje("Respaldo JSON generado.", "exito");
}

function importarJson() {
  try {
    servicio.importarJson(areaJson.value);
    sincronizarVista();
    mostrarMensaje("Datos importados correctamente.", "exito");
  } catch (error) {
    mostrarMensaje(`No se pudo importar: ${error.message}`);
  }
}

function restaurarEjemplo() {
  servicio.reemplazarTodos(DATOS_INICIALES);
  areaJson.value = "";
  ocultarMensaje();
  sincronizarVista();
}

formulario.addEventListener("submit", manejarRegistro);
cuerpoEstudiantes.addEventListener("click", manejarEliminacion);
busqueda.addEventListener("input", renderizar);
filtroPrograma.addEventListener("change", renderizar);
filtroEstado.addEventListener("change", renderizar);
selectorOrden.addEventListener("change", renderizar);
document.querySelector("#btnExportar").addEventListener("click", exportarJson);
document.querySelector("#btnImportar").addEventListener("click", importarJson);
document.querySelector("#btnRestaurar").addEventListener("click", restaurarEjemplo);

try {
  servicio.cargarLocal();
} catch (error) {
  servicio.limpiarLocal();
  mostrarMensaje(`El respaldo local estaba dañado y fue descartado: ${error.message}`);
}

sincronizarVista();
```

**Notas por bloque**

- **Bloque 1:** Las importaciones declaran dependencias y las referencias DOM se almacenan una sola vez.
- **Bloque 2:** `Intl.NumberFormat` presenta decimales según `es-PE` sin modificar el valor numérico.
- **Bloque 3:** `mostrarMensaje` y `ocultarMensaje` centralizan el estado visual de retroalimentación.
- **Bloque 4:** `crearFila` construye nodos y usa `textContent`; ninguna entrada se interpreta como HTML.
- **Bloque 5:** `dataset` conecta cada botón con el código y prepara la delegación de eventos.
- **Bloque 6:** `actualizarProgramas` conserva el filtro únicamente si la opción todavía existe.
- **Bloque 7:** `actualizarIndicadores` consume un resumen del servicio y no repite sus cálculos.
- **Bloque 8:** `renderizar` deriva la lista visible de los cuatro controles y reemplaza las filas de una vez.

---

## 16. Ejecución y verificación

1. Guarda todos los archivos y abre el proyecto mediante `http://localhost`.
2. Confirma que aparecen cuatro estudiantes iniciales y que **Console** no muestra errores.
3. Recarga la página: los cambios previos deben recuperarse desde `localStorage`.
4. Ejecuta cada caso de la matriz y registra resultado real, resultado esperado y estado.
5. Ante un fallo, coloca *breakpoints* en `agregar()`, `reemplazarTodos()`, `renderizar()` y `manejarRegistro()`.

### 16.1 Matriz mínima de pruebas

| N.º | Caso | Entrada o acción | Resultado esperado |
|:---:|------|------------------|--------------------|
| 1 | Inicio | Primera apertura | 4 estudiantes; 2 aprobados; 2 en riesgo; promedio grupal 12.58. |
| 2 | Registro válido | `U20260005`, Sofía Ramos, notas 20/18/19 | Se agrega, promedio 19.00, estado Aprobado y persistencia. |
| 3 | Código normalizado | `u20260006` | Se guarda como `U20260006`. |
| 4 | Código inválido | `A123` | Mensaje de formato; colección intacta. |
| 5 | Duplicado | `U20260001` | Mensaje de código registrado; no se agrega. |
| 6 | Nombre Unicode | Ángela Núñez-Soto | Nombre aceptado. |
| 7 | Nota vacía | `nota2` sin valor | Rechazo; no se interpreta como cero. |
| 8 | Frontera 0 | Notas 0/0/0 | Registro válido, promedio 0 y En riesgo. |
| 9 | Frontera 20 | Notas 20/20/20 | Registro válido, promedio 20 y Aprobado. |
| 10 | Frontera 12 | Notas 12/12/12 | Estado Aprobado. |
| 11 | Búsqueda | `ana` | Encuentra a Ana por nombre, sin distinguir mayúsculas. |
| 12 | Filtros | Programa + En riesgo | Solo filas que cumplen ambas condiciones. |
| 13 | Orden | Mayor promedio | Vista descendente sin alterar el estado fuente. |
| 14 | Eliminar | Eliminar `U20260004` | Fila, métricas, `Map` y `localStorage` se actualizan. |
| 15 | Exportar | Pulsar Exportar | Textarea contiene un arreglo JSON legible. |
| 16 | JSON roto | Pegar `{sin comillas}` | Error controlado y datos anteriores intactos. |
| 17 | JSON duplicado | Dos elementos con el mismo código | Importación rechazada de forma atómica. |
| 18 | Persistencia | Registrar y recargar | El registro reaparece desde `localStorage`. |

### 16.2 Evidencias de integración

| Concepto | Evidencia en el proyecto |
|----------|--------------------------|
| Operadores | Condiciones, ternario, spread, suma y comparación `>=`. |
| Funciones | Normalización, validación, renderizado y manejadores de eventos. |
| Clase y getters | `Estudiante`, `promedio`, `estado` e `iniciales`. |
| Array | Estado fuente, `map`, `filter`, `reduce` y `toSorted`. |
| Map | Índice por código y comprobación de duplicados. |
| Set | Programas únicos y códigos importados no repetidos. |
| Regex | Código, nombre y correo. |
| JSON | Exportación, importación y almacenamiento. |
| DOM y eventos | Formulario, filtros, filas, mensajes y delegación. |
| Módulos | Separación entre modelo, datos, utilidades, servicio y vista. |

### 16.3 Errores frecuentes

| Síntoma | Causa probable | Corrección |
|---------|----------------|------------|
| *Failed to load module* | Proyecto abierto con `file://` o ruta incorrecta | Usa servidor local y verifica la extensión `.js`. |
| No se exporta una clase | Falta `export` o `import` nombrado | Compara exactamente los nombres entre módulos. |
| `toSorted` no existe | Navegador desactualizado | Actualiza el navegador o usa `[...lista].sort()`. |
| Promedio `NaN` | Nota vacía o no finita | Valida la cadena original antes de `Number()`. |
| Métodos ausentes al importar | JSON produce objetos planos | Construye nuevas instancias de `Estudiante`. |
| Datos viejos reaparecen | `localStorage` contiene otra versión | *Restaurar ejemplo* o eliminar la clave del sitio. |
| Filtro sin opciones | `Set` o sincronización no se ejecutaron | Llama `actualizarProgramas()` después de mutar. |
| HTML inesperado en una celda | Se usó `innerHTML` | Reemplaza por `textContent` o `createElement()`. |
| Importación parcial | Se asignó durante la validación | Construye candidatos y asigna solo al terminar. |

---

## 17. Preguntas de reflexión

1. ¿Cuál es la única fuente de verdad de la aplicación y qué datos se derivan de ella?
2. ¿Por qué el `Map` debe reconstruirse después de agregar, eliminar o importar?
3. ¿Qué responsabilidades se volverían difíciles de probar si todo estuviera en `app.js`?
4. ¿Por qué normalizar no sustituye a validar?
5. ¿Qué diferencia existe entre un error de sintaxis JSON y un JSON válido con estructura incorrecta?
6. ¿Por qué la importación debe validar todo antes de reemplazar el estado?
7. ¿Qué ventaja ofrece `textContent` frente a `innerHTML` para datos ingresados por usuarios?
8. ¿Por qué `localStorage` no es apropiado para información sensible o grandes volúmenes?
9. ¿Qué caso de frontera encontró un error que no aparecía con datos normales?
10. ¿Cómo demostrarías que `toSorted()` no altera el orden del arreglo principal?

> **Cierre:** Una solución profesional mantiene explícitas sus reglas, limita los efectos externos y puede demostrar su corrección con pruebas reproducibles.

---

## Fuentes de consulta

- ECMAScript 2026 Language Specification
- MDN: JavaScript modules
- MDN: Classes
- MDN: Private elements
- MDN: Array
- MDN: Map
- MDN: Set
- MDN: JSON
- MDN: Window.localStorage
- MDN: Node.textContent
- MDN: try...catch
- MDN: addEventListener()