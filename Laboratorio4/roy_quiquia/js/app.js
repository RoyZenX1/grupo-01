"use strict";
/* ============================================================
   GESTOR INTELIGENTE DE INVENTARIO — LÓGICA DE LA APLICACIÓN
   ------------------------------------------------------------
   Organización de este archivo:
   1. Modelo de datos: clase Producto
   2. Datos iniciales + utilidades de formato (Intl)
   3. Funciones puras: normalizar, validar, filtrar, ordenar, resumir
   4. Referencias al DOM
   5. Estado de la aplicación (inventario, índice, correlativo)
   6. Funciones de renderizado (pintar en pantalla)
   7. Manejadores de eventos (qué pasa cuando el usuario interactúa)
   8. Registro de listeners + arranque de la app

   PRINCIPIO CENTRAL DE TODO EL ARCHIVO:
   "inventario" es la única fuente de verdad. Nunca se muta directamente
   (no se usa push/splice sobre él); en cada cambio se crea un arreglo
   NUEVO (inmutabilidad práctica) y luego se vuelve a derivar todo lo demás
   (índice Map, categorías Set, filas de la tabla, resumen numérico).
   ============================================================ */


/* ============================================================
   1. MODELO DE DATOS: CLASE Producto
   ============================================================ */
class Producto {
  constructor({ id, nombre, categoria, precio, stock }) {
    // Conversión explícita de tipos en el constructor:
    // así, sin importar si el dato viene de un formulario (string) o de JSON,
    // el objeto Producto SIEMPRE termina con tipos correctos y consistentes.
    this.id = String(id);
    this.nombre = String(nombre).trim();       // .trim() quita espacios accidentales
    this.categoria = String(categoria).trim();
    this.precio = Number(precio);
    this.stock = Number(stock);
  }

  // GETTER: se accede como propiedad (producto.valorInventario), NO como función.
  // Se recalcula cada vez que se lee, así siempre refleja precio y stock actuales.
  get valorInventario() {
    return this.precio * this.stock;
  }

  // Otro getter: encapsula la "regla de negocio" de qué es stock bajo (1 a 5 unidades).
  // Si mañana cambia el umbral, se edita en UN solo lugar.
  get tieneStockBajo() {
    return this.stock > 0 && this.stock <= 5;
  }

  // toJSON() es un método ESPECIAL: JSON.stringify() lo llama automáticamente
  // si existe. Aquí lo usamos para decidir exactamente qué propiedades se
  // exportan (evita exportar getters computados o metadatos internos).
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      categoria: this.categoria,
      precio: this.precio,
      stock: this.stock
    };
  }

  // MÉTODO STATIC: pertenece a la clase, no a una instancia.
  // Se usa como "fábrica": convierte un objeto plano (ej. venido de JSON.parse
  // o de un formulario) en una instancia real de Producto, con sus getters
  // y métodos disponibles.
  static desdeObjeto(datos) {
    return new Producto(datos);
  }
}


/* ============================================================
   2. DATOS INICIALES Y FORMATEADORES
   ============================================================ */

// Objetos PLANOS (no instancias de Producto todavía). Se convertirán
// más abajo con .map(Producto.desdeObjeto).
const DATOS_INICIALES = [
  { id: "PRD-1001", nombre: "Monitor 24 pulgadas", categoria: "Pantallas", precio: 899.9, stock: 4 },
  { id: "PRD-1002", nombre: "Teclado mecánico", categoria: "Periféricos", precio: 219.5, stock: 12 },
  { id: "PRD-1003", nombre: "Mouse ergonómico", categoria: "Periféricos", precio: 129.9, stock: 0 },
  { id: "PRD-1004", nombre: "Base para laptop", categoria: "Accesorios", precio: 89.9, stock: 8 }
];

// Intl.NumberFormat: da formato de moneda correcto para Perú
// (símbolo "S/", separador de miles, dos decimales) sin tener que
// construir el string de precio a mano.
const formateadorMoneda = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN"
});

// Intl.Collator: compara texto respetando reglas del idioma español
// (por ejemplo, ordena "ñ" e ignora mayúsculas/minúsculas con sensitivity:"base").
// Comparar con < > directamente en JS NO maneja bien acentos/mayúsculas.
const comparadorTexto = new Intl.Collator("es-PE", {
  sensitivity: "base"
});


/* ============================================================
   3. FUNCIONES PURAS (sin tocar el DOM)
   Una función pura: mismos argumentos -> mismo resultado, y no
   modifica nada fuera de sí misma. Esto las hace fáciles de probar
   y de razonar sobre ellas.
   ============================================================ */

// Limpia espacios sobrantes: quita espacios al inicio/fin y colapsa
// espacios múltiples internos en uno solo (regex /\s+/gu).
function normalizarTexto(texto) {
  return String(texto).trim().replace(/\s+/gu, " ");
}

// Valida un objeto de datos "crudo" (antes de convertirlo en Producto)
// y devuelve un ARREGLO de mensajes de error (vacío si todo está bien).
// Devolver un arreglo (no lanzar una excepción) permite mostrar
// TODOS los errores de una vez, no solo el primero.
function validarDatos(datos) {
  const errores = [];

  if (normalizarTexto(datos.nombre).length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
  }
  if (normalizarTexto(datos.categoria).length < 2) {
    errores.push("La categoría debe tener al menos 2 caracteres.");
  }
  // Number.isFinite: rechaza NaN, Infinity y -Infinity (a diferencia de solo "typeof === 'number'")
  if (!Number.isFinite(datos.precio) || datos.precio <= 0) {
    errores.push("El precio debe ser un número mayor que cero.");
  }
  // Number.isInteger: rechaza decimales (ej. stock = 2.5 no es válido)
  if (!Number.isInteger(datos.stock) || datos.stock < 0) {
    errores.push("El stock debe ser un entero mayor o igual que cero.");
  }

  return errores;
}

// A partir del arreglo completo de productos, extrae las categorías
// ÚNICAS usando Set (que por definición no permite duplicados),
// las convierte de vuelta a arreglo con [...] y las ordena alfabéticamente
// usando el comparador que respeta reglas del español.
function obtenerCategorias(productos) {
  const categoriasUnicas = new Set(productos.map(producto => producto.categoria));
  return [...categoriasUnicas].toSorted(comparadorTexto.compare);
}

// Construye un ÍNDICE de búsqueda rápida: Map<id, producto>.
// Buscar por id en un Map es O(1) (prácticamente instantáneo),
// mientras que buscar con .find() en un arreglo es O(n) (recorre todo).
// Se reconstruye cada vez que "inventario" cambia.
function crearIndice(productos) {
  return new Map(productos.map(producto => [producto.id, producto]));
}

// Filtra por texto de búsqueda Y por categoría seleccionada al mismo tiempo.
// El parámetro usa desestructuración con valores por defecto:
// si no se pasa "texto" o "categoria", se asume cadena vacía.
function filtrarProductos(productos, { texto = "", categoria = "" } = {}) {
  const termino = normalizarTexto(texto).toLocaleLowerCase("es-PE");

  return productos.filter(producto => {
    const coincideTexto = termino === "" ||
      producto.nombre.toLocaleLowerCase("es-PE").includes(termino) ||
      producto.categoria.toLocaleLowerCase("es-PE").includes(termino);

    const coincideCategoria = categoria === "" || producto.categoria === categoria;

    // Debe cumplir AMBAS condiciones (búsqueda de texto Y categoría)
    return coincideTexto && coincideCategoria;
  });
}

// Devuelve una COPIA ordenada (nunca ordena "en el sitio").
// El objeto "comparadores" funciona como una tabla de búsqueda:
// en vez de un if/else largo, se selecciona la función de comparación
// según el criterio recibido.
function ordenarProductos(productos, criterio) {
  const comparadores = {
    "precio-desc": (a, b) => b.precio - a.precio,          // de mayor a menor precio
    "stock-asc": (a, b) => a.stock - b.stock,               // de menor a mayor stock
    nombre: (a, b) => comparadorTexto.compare(a.nombre, b.nombre) // alfabético
  };

  // Si el criterio no existe en la tabla, usa "nombre" como valor por defecto (??)
  return productos.toSorted(comparadores[criterio] ?? comparadores.nombre);
}

// reduce() recorre el arreglo UNA sola vez y va construyendo un único
// objeto resumen. El segundo argumento de reduce (el objeto { productos:0,... })
// es el valor inicial del acumulador: OBLIGATORIO para no depender de que
// el arreglo tenga al menos un elemento.
function calcularResumen(productos) {
  return productos.reduce((resumen, producto) => ({
    productos: resumen.productos + 1,
    unidades: resumen.unidades + producto.stock,
    valor: resumen.valor + producto.valorInventario,
    // El operador ternario convierte el booleano tieneStockBajo en 0 o 1 para poder sumarlo
    stockBajo: resumen.stockBajo + (producto.tieneStockBajo ? 1 : 0)
  }), { productos: 0, unidades: 0, valor: 0, stockBajo: 0 });
}

// Valida un arreglo COMPLETO recién importado desde JSON.
// Lanza errores (throw) en vez de devolver un arreglo de mensajes,
// porque aquí queremos DETENER la importación por completo si algo falla
// (a diferencia de validarDatos, que es para un solo producto del formulario).
function validarColeccionImportada(valor) {
  if (!Array.isArray(valor)) {
    throw new TypeError("El JSON debe contener un arreglo de productos.");
  }

  // Reconstruye instancias reales de Producto (con getters y métodos)
  // a partir de los objetos planos que entrega JSON.parse().
  const productos = valor.map(Producto.desdeObjeto);

  // flatMap: por cada producto, validarDatos() devuelve un arreglo de errores;
  // flatMap los "aplana" todos en un solo arreglo final, ya con el número
  // de elemento agregado al mensaje para saber cuál producto falló.
  const errores = productos.flatMap((producto, indice) =>
    validarDatos(producto).map(error => `Elemento ${indice + 1}: ${error}`)
  );

  // Verificación de ids duplicados: si el tamaño del Set (que elimina
  // duplicados) es menor que el largo del arreglo original, hay repetidos.
  const ids = productos.map(producto => producto.id);
  if (new Set(ids).size !== ids.length) {
    errores.push("Los identificadores no pueden repetirse.");
  }

  if (productos.some(producto => producto.id.trim() === "")) {
    errores.push("Todos los productos deben incluir un identificador.");
  }

  if (errores.length > 0) {
    // Se unen todos los mensajes en un solo string y se lanza UNA excepción
    throw new TypeError(errores.join(" "));
  }

  return productos;
}


/* ============================================================
   4. REFERENCIAS AL DOM
   Se buscan UNA sola vez al cargar el script y se guardan en constantes,
   en vez de llamar a document.querySelector repetidamente cada vez
   que se necesitan (más eficiente y más legible).
   ============================================================ */
const formulario = document.querySelector("#formProducto");
const campoNombre = document.querySelector("#nombre");
const campoCategoria = document.querySelector("#categoria");
const campoPrecio = document.querySelector("#precio");
const campoStock = document.querySelector("#stock");

const busqueda = document.querySelector("#busqueda");
const filtroCategoria = document.querySelector("#filtroCategoria");
const selectorOrden = document.querySelector("#orden");

const cuerpoInventario = document.querySelector("#cuerpoInventario");
const estadoVacio = document.querySelector("#estadoVacio");
const mensajes = document.querySelector("#mensajes");
const areaJson = document.querySelector("#areaJson");


/* ============================================================
   5. ESTADO DE LA APLICACIÓN
   "let" (no "const") porque estas variables SÍ se reasignan
   a lo largo de la ejecución (cada vez que cambia el inventario).
   ============================================================ */

// Convierte los datos planos iniciales en instancias reales de Producto.
let inventario = DATOS_INICIALES.map(Producto.desdeObjeto);

// Índice derivado del inventario (se recalcula cada vez que este cambia)
let indicePorId = crearIndice(inventario);

// Contador simple para generar el siguiente id (PRD-1005, PRD-1006, ...)
let correlativo = 1005;


/* ============================================================
   6. FUNCIONES DE RENDERIZADO (pintan el estado actual en el DOM)
   ============================================================ */

function mostrarMensaje(texto, tipo = "error") {
  mensajes.textContent = texto;
  // classList.toggle(clase, condicion): añade la clase "exito" SOLO si
  // tipo === "exito"; si no, la quita. Así el mismo bloque HTML sirve
  // para mostrar tanto errores (rojo) como éxitos (verde).
  mensajes.classList.toggle("exito", tipo === "exito");
  mensajes.hidden = false;
}

function ocultarMensaje() {
  mensajes.hidden = true;
  mensajes.textContent = "";
}

// Helper para crear una celda <td> de forma repetible y segura.
// Se usa textContent (NO innerHTML) para evitar inyección de HTML
// si algún dato del producto llegara a contener etiquetas.
function crearCelda(texto, clase = "") {
  const celda = document.createElement("td");
  celda.textContent = texto;
  if (clase) celda.className = clase;
  return celda;
}

// Construye una fila <tr> completa para un producto.
function crearFila(producto) {
  const fila = document.createElement("tr");

  // Clase condicional: si tiene stock bajo, se añade "stock-bajo" (ver CSS)
  const claseStock = producto.tieneStockBajo ? "numero stock-bajo" : "numero";

  const boton = document.createElement("button");

  // .append() permite agregar varios nodos hijos de una sola vez
  fila.append(
    crearCelda(producto.nombre),
    crearCelda(producto.categoria),
    crearCelda(formateadorMoneda.format(producto.precio), "numero"),
    crearCelda(String(producto.stock), claseStock),
    crearCelda(formateadorMoneda.format(producto.valorInventario), "numero")
  );

  boton.type = "button";
  boton.className = "peligro";
  // dataset.id guarda el id del producto directamente en el atributo
  // data-id="..." del botón. Así, al hacer click, podemos leerlo
  // sin necesidad de closures ni de recorrer el arreglo otra vez.
  boton.dataset.id = producto.id;
  boton.textContent = "Eliminar";

  const celdaAccion = document.createElement("td");
  celdaAccion.append(boton);
  fila.append(celdaAccion);

  return fila;
}

// Regenera el <select> de categorías a partir del inventario actual.
function actualizarCategorias() {
  const seleccionActual = filtroCategoria.value; // recordar qué categoría estaba elegida

  // replaceChildren() borra todas las <option> anteriores de un solo golpe
  filtroCategoria.replaceChildren(new Option("Todas", ""));

  obtenerCategorias(inventario).forEach(categoria => {
    filtroCategoria.add(new Option(categoria, categoria));
  });

  // Si la categoría que estaba seleccionada TODAVÍA existe (no se eliminó
  // el último producto de esa categoría), se restaura; si no, vuelve a "Todas".
  filtroCategoria.value = obtenerCategorias(inventario).includes(seleccionActual)
    ? seleccionActual
    : "";
}

// Actualiza los 4 indicadores numéricos y el mensaje de alerta de stock.
function actualizarResumen() {
  const resumen = calcularResumen(inventario);

  document.querySelector("#totalProductos").textContent = resumen.productos;
  document.querySelector("#totalUnidades").textContent = resumen.unidades;
  document.querySelector("#valorTotal").textContent = formateadorMoneda.format(resumen.valor);
  document.querySelector("#stockBajo").textContent = resumen.stockBajo;

  // some() se detiene en el primer true que encuentra: eficiente para
  // preguntas de sí/no como "¿hay al menos un producto agotado?"
  const hayAgotados = inventario.some(producto => producto.stock === 0);

  const alerta = document.querySelector("#alertaStock");
  alerta.textContent = hayAgotados
    ? "Atención: existe al menos un producto agotado."
    : "No existen productos agotados.";
}

// Función central de pintado: filtra -> ordena -> muestra en la tabla.
// IMPORTANTE: nunca modifica "inventario", solo trabaja sobre copias
// derivadas ("filtrados", "visibles"), así el estado original queda intacto
// para cuando el usuario cambie o quite los filtros.
function renderizar() {
  const filtrados = filtrarProductos(inventario, {
    texto: busqueda.value,
    categoria: filtroCategoria.value
  });

  const visibles = ordenarProductos(filtrados, selectorOrden.value);

  // Spread (...) dentro de replaceChildren: reemplaza todas las filas
  // anteriores por las nuevas de un solo golpe (más eficiente que
  // borrar e insertar una por una).
  cuerpoInventario.replaceChildren(...visibles.map(crearFila));

  estadoVacio.hidden = visibles.length > 0;

  // Plural condicional simple: "1 producto" vs "3 productos"
  document.querySelector("#resumenVisible").textContent =
    `${visibles.length} producto${visibles.length === 1 ? "" : "s"}`;

  actualizarResumen();
}

// Se llama SIEMPRE que "inventario" cambia de contenido (agregar, eliminar,
// importar, restaurar). Reconstruye TODAS las estructuras derivadas
// en el orden correcto: primero el índice Map, luego las categorías,
// y al final se repinta la tabla.
function sincronizarEstructuras() {
  indicePorId = crearIndice(inventario);
  actualizarCategorias();
  renderizar();
}


/* ============================================================
   7. MANEJADORES DE EVENTOS
   ============================================================ */

function manejarRegistro(evento) {
  evento.preventDefault(); // evita que el formulario recargue la página
  ocultarMensaje();

  const datos = {
    id: `PRD-${correlativo}`, // id autogenerado, el usuario no lo escribe
    nombre: normalizarTexto(campoNombre.value),
    categoria: normalizarTexto(campoCategoria.value),
    precio: Number(campoPrecio.value), // los inputs siempre entregan strings: hay que convertir
    stock: Number(campoStock.value)
  };

  const errores = validarDatos(datos);
  if (errores.length > 0) {
    mostrarMensaje(errores.join(" "));
    return; // se detiene aquí: NO se agrega el producto si hay errores
  }

  // Inmutabilidad: en vez de inventario.push(...), se crea un ARREGLO NUEVO
  // que contiene todo lo anterior más el producto nuevo.
  inventario = [...inventario, new Producto(datos)];
  correlativo += 1;
  formulario.reset(); // limpia los campos del formulario

  sincronizarEstructuras();
  mostrarMensaje("Producto agregado correctamente.", "exito");
}

function manejarEliminacion(evento) {
  // Delegación de eventos: en vez de poner un listener en CADA botón
  // "Eliminar" (que además se destruyen y recrean con cada render),
  // se pone UN SOLO listener en el <tbody> y se detecta el click
  // usando closest(), que sube por los ancestros hasta encontrar
  // un elemento que coincida con el selector.
  const boton = evento.target.closest("button[data-id]");
  if (!boton) return; // el click no fue sobre un botón de eliminar

  // Búsqueda O(1) en el Map en vez de recorrer el arreglo con .find()
  const producto = indicePorId.get(boton.dataset.id);
  if (!producto) return;

  // filter() crea un arreglo nuevo SIN el producto eliminado
  // (de nuevo: nunca se muta "inventario" directamente)
  inventario = inventario.filter(elemento => elemento.id !== producto.id);

  sincronizarEstructuras();
  mostrarMensaje(`${producto.nombre} fue eliminado.`, "exito");
}

function exportarJson() {
  // JSON.stringify(valor, replacer, espacios):
  // el "2" al final indica sangría de 2 espacios -> JSON legible para humanos.
  // Como Producto tiene un método toJSON(), stringify lo usa automáticamente
  // para decidir qué propiedades exportar de cada instancia.
  areaJson.value = JSON.stringify(inventario, null, 2);
  mostrarMensaje("Inventario exportado como JSON.", "exito");
}

function importarJson() {
  try {
    // JSON.parse puede lanzar SyntaxError si el texto no es JSON válido
    const datos = JSON.parse(areaJson.value);

    // Solo si la validación pasa completamente se reemplaza "inventario".
    // Si validarColeccionImportada lanza un error, la siguiente línea
    // nunca se ejecuta, y el inventario anterior queda intacto.
    inventario = validarColeccionImportada(datos);

    sincronizarEstructuras();
    mostrarMensaje("Inventario importado correctamente.", "exito");
  } catch (error) {
    // Captura tanto errores de sintaxis JSON como los TypeError
    // lanzados manualmente en validarColeccionImportada.
    mostrarMensaje(`No se pudo importar: ${error.message}`);
  }
}

function restaurarDatos() {
  inventario = DATOS_INICIALES.map(Producto.desdeObjeto);
  correlativo = 1005;
  areaJson.value = "";
  ocultarMensaje();
  sincronizarEstructuras();
}


/* ============================================================
   8. REGISTRO DE LISTENERS Y ARRANQUE DE LA APLICACIÓN
   ============================================================ */

formulario.addEventListener("submit", manejarRegistro);
cuerpoInventario.addEventListener("click", manejarEliminacion); // delegación de eventos

// "input" se dispara con cada tecla; da una búsqueda instantánea mientras se escribe
busqueda.addEventListener("input", renderizar);
filtroCategoria.addEventListener("change", renderizar);
selectorOrden.addEventListener("change", renderizar);

document.querySelector("#btnExportar").addEventListener("click", exportarJson);
document.querySelector("#btnImportar").addEventListener("click", importarJson);
document.querySelector("#btnRestaurar").addEventListener("click", restaurarDatos);

// Llamada inicial: sin esto, la tabla, las categorías y el resumen
// quedarían vacíos hasta el primer clic del usuario.
sincronizarEstructuras();