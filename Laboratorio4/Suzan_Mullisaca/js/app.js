"use strict";

class Producto {
    constructor({ id, nombre, categoria, precio, stock }) {
        this.id = String(id);
        this.nombre = String(nombre).trim();
        this.categoria = String(categoria).trim();
        this.precio = Number(precio);
        this.stock = Number(stock);
    }

    get valorInventario() {
        return this.precio * this.stock;
    }

    get tieneStockBajo() {
        return this.stock > 0 && this.stock <= 5;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            categoria: this.categoria,
            precio: this.precio,
            stock: this.stock
        };
    }

    static desdeObjeto(datos) {
        return new Producto(datos);
    }
}

const DATOS_INICIALES = [
    {
        id: "PRD-1001",
        nombre: "Monitor 24 pulgadas",
        categoria: "Pantallas",
        precio: 899.90,
        stock: 4
    },
    {
        id: "PRD-1002",
        nombre: "Teclado mecánico",
        categoria: "Periféricos",
        precio: 219.50,
        stock: 12
    },
    {
        id: "PRD-1003",
        nombre: "Mouse ergonómico",
        categoria: "Periféricos",
        precio: 129.90,
        stock: 0
    },
    {
        id: "PRD-1004",
        nombre: "Base para laptop",
        categoria: "Accesorios",
        precio: 89.90,
        stock: 8
    }
];

const formateadorMoneda = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN"
});

const comparadorTexto = new Intl.Collator("es-PE", {
    sensitivity: "base"
});

function normalizarTexto(texto) {
    return String(texto).trim().replace(/\s+/gu, " ");
}

function validarDatos(datos) {
    const errores = [];

    if (normalizarTexto(datos.nombre).length < 3) {
        errores.push("El nombre debe tener al menos 3 caracteres.");
    }

    if (normalizarTexto(datos.categoria).length < 2) {
        errores.push("La categoría debe tener al menos 2 caracteres.");
    }

    if (!Number.isFinite(datos.precio) || datos.precio <= 0) {
        errores.push("El precio debe ser un número mayor que cero.");
    }

    if (!Number.isInteger(datos.stock) || datos.stock < 0) {
        errores.push("El stock debe ser un entero mayor o igual que cero.");
    }

    return errores;
}

function obtenerCategorias(productos) {
    const categoriasUnicas = new Set(
        productos.map(producto => producto.categoria)
    );

    return [...categoriasUnicas].toSorted(comparadorTexto.compare);
}

function crearIndice(productos) {
    return new Map(
        productos.map(producto => [producto.id, producto])
    );
}

function filtrarProductos(
    productos,
    { texto = "", categoria = "" } = {}
) {
    const termino = normalizarTexto(texto)
        .toLocaleLowerCase("es-PE");

    return productos.filter(producto => {
        const coincideTexto =
            termino === "" ||
            producto.nombre
                .toLocaleLowerCase("es-PE")
                .includes(termino) ||
            producto.categoria
                .toLocaleLowerCase("es-PE")
                .includes(termino);

        const coincideCategoria =
            categoria === "" ||
            producto.categoria === categoria;

        return coincideTexto && coincideCategoria;
    });
}

function ordenarProductos(productos, criterio) {
    const comparadores = {
        "precio-desc": (a, b) => b.precio - a.precio,
        "stock-asc": (a, b) => a.stock - b.stock,
        nombre: (a, b) => comparadorTexto.compare(a.nombre, b.nombre)
    };

    return productos.toSorted(
        comparadores[criterio] ?? comparadores.nombre
    );
}

function calcularResumen(productos) {
    return productos.reduce(
        (resumen, producto) => ({
            productos: resumen.productos + 1,
            unidades: resumen.unidades + producto.stock,
            valor: resumen.valor + producto.valorInventario,
            stockBajo:
                resumen.stockBajo +
                (producto.tieneStockBajo ? 1 : 0)
        }),
        {
            productos: 0,
            unidades: 0,
            valor: 0,
            stockBajo: 0
        }
    );
}

function validarColeccionImportada(valor) {
    if (!Array.isArray(valor)) {
        throw new TypeError(
            "El JSON debe contener un arreglo de productos."
        );
    }

    const productos = valor.map(Producto.desdeObjeto);

    const errores = productos.flatMap(
        (producto, indice) =>
            validarDatos(producto).map(
                error => `Elemento ${indice + 1}: ${error}`
            )
    );

    const ids = productos.map(producto => producto.id);

    if (new Set(ids).size !== ids.length) {
        errores.push("Los identificadores no pueden repetirse.");
    }

    if (productos.some(producto => producto.id.trim() === "")) {
        errores.push(
            "Todos los productos deben incluir un identificador."
        );
    }

    if (errores.length > 0) {
        throw new TypeError(errores.join(" "));
    }

    return productos;
}


// --- Interfaz del navegador ---

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

let inventario = DATOS_INICIALES.map(Producto.desdeObjeto);
let indicePorId = crearIndice(inventario);
let correlativo = 1005;

function mostrarMensaje(texto, tipo = "error") {
    mensajes.textContent = texto;
    mensajes.classList.toggle("exito", tipo === "exito");
    mensajes.hidden = false;
}

function ocultarMensaje() {
    mensajes.hidden = true;
    mensajes.textContent = "";
}

function crearCelda(texto, clase = "") {
    const celda = document.createElement("td");

    celda.textContent = texto;

    if (clase) {
        celda.className = clase;
    }

    return celda;
}

function crearFila(producto) {
    const fila = document.createElement("tr");

    const claseStock = producto.tieneStockBajo
        ? "numero stock-bajo"
        : "numero";

    const boton = document.createElement("button");

    fila.append(
        crearCelda(producto.nombre),
        crearCelda(producto.categoria),
        crearCelda(
            formateadorMoneda.format(producto.precio),
            "numero"
        ),
        crearCelda(String(producto.stock), claseStock),
        crearCelda(
            formateadorMoneda.format(producto.valorInventario),
            "numero"
        )
    );

    boton.type = "button";
    boton.className = "peligro";
    boton.dataset.id = producto.id;
    boton.textContent = "Eliminar";

    const celdaAccion = document.createElement("td");
    celdaAccion.append(boton);

    fila.append(celdaAccion);

    return fila;
}

function actualizarCategorias() {
    const seleccionActual = filtroCategoria.value;

    filtroCategoria.replaceChildren(
        new Option("Todas", "")
    );

    obtenerCategorias(inventario).forEach(categoria => {
        filtroCategoria.add(
            new Option(categoria, categoria)
        );
    });

    filtroCategoria.value =
        obtenerCategorias(inventario).includes(seleccionActual)
            ? seleccionActual
            : "";
}

function actualizarResumen() {
    const resumen = calcularResumen(inventario);

    document.querySelector("#totalProductos").textContent =
        resumen.productos;

    document.querySelector("#totalUnidades").textContent =
        resumen.unidades;

    document.querySelector("#valorTotal").textContent =
        formateadorMoneda.format(resumen.valor);

    document.querySelector("#stockBajo").textContent =
        resumen.stockBajo;

    const hayAgotados = inventario.some(
        producto => producto.stock === 0
    );

    const alerta = document.querySelector("#alertaStock");

    alerta.textContent = hayAgotados
        ? "Atención: existe al menos un producto agotado."
        : "No existen productos agotados.";
}

function renderizar() {
    const filtrados = filtrarProductos(inventario, {
        texto: busqueda.value,
        categoria: filtroCategoria.value
    });

    const visibles = ordenarProductos(
        filtrados,
        selectorOrden.value
    );

    cuerpoInventario.replaceChildren(
        ...visibles.map(crearFila)
    );

    estadoVacio.hidden = visibles.length > 0;

    document.querySelector("#resumenVisible").textContent =
        `${visibles.length} producto${visibles.length === 1 ? "" : "s"}`;

    actualizarResumen();
}

function sincronizarEstructuras() {
    indicePorId = crearIndice(inventario);
    actualizarCategorias();
    renderizar();
}

function manejarRegistro(evento) {
    evento.preventDefault();
    ocultarMensaje();

    const datos = {
        id: `PRD-${correlativo}`,
        nombre: normalizarTexto(campoNombre.value),
        categoria: normalizarTexto(campoCategoria.value),
        precio: Number(campoPrecio.value),
        stock: Number(campoStock.value)
    };

    const errores = validarDatos(datos);

    if (errores.length > 0) {
        mostrarMensaje(errores.join(" "));
        return;
    }

    inventario = [
        ...inventario,
        new Producto(datos)
    ];

    correlativo += 1;

    formulario.reset();

    sincronizarEstructuras();

    mostrarMensaje(
        "Producto agregado correctamente.",
        "exito"
    );
}

function manejarEliminacion(evento) {
    const boton = evento.target.closest("button[data-id]");

    if (!boton) {
        return;
    }

    const producto = indicePorId.get(boton.dataset.id);

    if (!producto) {
        return;
    }

    inventario = inventario.filter(
        elemento => elemento.id !== producto.id
    );

    sincronizarEstructuras();

    mostrarMensaje(
        `${producto.nombre} fue eliminado.`,
        "exito"
    );
}

function exportarJson() {
    areaJson.value = JSON.stringify(
        inventario,
        null,
        2
    );

    mostrarMensaje(
        "Inventario exportado como JSON.",
        "exito"
    );
}

function importarJson() {
    try {
        const datos = JSON.parse(areaJson.value);

        inventario = validarColeccionImportada(datos);

        sincronizarEstructuras();

        mostrarMensaje(
            "Inventario importado correctamente.",
            "exito"
        );
    } catch (error) {
        mostrarMensaje(
            `No se pudo importar: ${error.message}`
        );
    }
}

function restaurarDatos() {
    inventario = DATOS_INICIALES.map(
        Producto.desdeObjeto
    );

    correlativo = 1005;
    areaJson.value = "";

    ocultarMensaje();

    sincronizarEstructuras();
}


// --- Eventos ---

formulario.addEventListener(
    "submit",
    manejarRegistro
);

cuerpoInventario.addEventListener(
    "click",
    manejarEliminacion
);

busqueda.addEventListener(
    "input",
    renderizar
);

filtroCategoria.addEventListener(
    "change",
    renderizar
);

selectorOrden.addEventListener(
    "change",
    renderizar
);

document
    .querySelector("#btnExportar")
    .addEventListener("click", exportarJson);

document
    .querySelector("#btnImportar")
    .addEventListener("click", importarJson);

document
    .querySelector("#btnRestaurar")
    .addEventListener("click", restaurarDatos);

sincronizarEstructuras();