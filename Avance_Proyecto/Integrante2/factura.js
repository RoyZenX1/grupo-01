const IGV = 0.18; // constante: porcentaje de impuesto (no cambia)
let items = []; // arreglo de objetos: cada fila de la factura
let contadorItem = 0; // variable de control para IDs internos

// Colección (Map): asocia cada tipo de comprobante con su patrón de validación
const patronesDocumento = new Map([
    ["boleta", /^[0-9]{8}$/],   // DNI: 8 dígitos
    ["factura", /^[0-9]{11}$/] // RUC: 11 dígitos
]);


class ItemFactura {
    constructor(descripcion, cantidad, precioUnitario) {
        this.id = ++contadorItem;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }
    get subtotal() {
        return this.cantidad * this.precioUnitario;
    }
}


function obtenerCorrelativo() {
    const guardado = localStorage.getItem("nexocargo_correlativo");
    return guardado ? JSON.parse(guardado) : { boleta: 0, factura: 0 };
}

function guardarCorrelativo(correlativo) {
    localStorage.setItem("nexocargo_correlativo", JSON.stringify(correlativo));
}


window.onload = function () {
    document.getElementById("fechaEmision").value =
        new Date().toLocaleDateString("es-PE");
    actualizarSerie();
    console.log("Módulo de facturación de NexoCargo listo.");
};


function actualizarSerie() {
    const tipo = document.getElementById("tipoComprobante").value;
    const labelDocumento = document.getElementById("labelDocumento");
    let serie = "";

 
    switch (tipo) {
        case "boleta":
            serie = "B001";
            labelDocumento.textContent = "DNI";
            break;
        case "factura":
            serie = "F001";
            labelDocumento.textContent = "RUC";
            break;
        default:
            serie = "S/N";
    }

    const correlativo = obtenerCorrelativo();
    const numero = (correlativo[tipo] + 1).toString().padStart(6, "0");
    // Interpolación de cadenas (template literals)
    document.getElementById("numeroComprobante").value = `${serie}-${numero}`;
}


function documentoValido(tipo, numero) {
    const patron = patronesDocumento.get(tipo);
    return patron ? patron.test(numero) : false;
}


function agregarItem() {
    try {
        const descripcion = document.getElementById("descripcionItem").value.trim();
        const cantidad = Number(document.getElementById("cantidadItem").value);
        const precio = parseFloat(document.getElementById("precioItem").value);

        
        if (descripcion === "") {
            throw new Error("Debe ingresar la descripción del servicio.");
        }
        if (!cantidad || cantidad <= 0) {
            throw new Error("La cantidad debe ser un número mayor a 0.");
        }
        if (isNaN(precio) || precio < 0) {
            throw new Error("Ingrese un precio unitario válido.");
        }

        const nuevoItem = new ItemFactura(descripcion, cantidad, precio);
        items = [...items, nuevoItem];

        renderizarTabla();
        calcularTotales();
        limpiarCamposItem();
        console.log("Ítem agregado:", nuevoItem);
    } catch (error) {
        alert(`No se pudo agregar el servicio: ${error.message}`);
        console.error(error);
    }
}

function limpiarCamposItem() {
    document.getElementById("descripcionItem").value = "";
    document.getElementById("cantidadItem").value = 1;
    document.getElementById("precioItem").value = "";
}


function eliminarItem(id) {
    items = items.filter((item) => item.id !== id);
    renderizarTabla();
    calcularTotales();
}


function renderizarTabla() {
    const cuerpo = document.getElementById("cuerpoTabla");
    cuerpo.innerHTML = "";

    items.forEach((item, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.descripcion}</td>
            <td>${item.cantidad}</td>
            <td>S/ ${item.precioUnitario.toFixed(2)}</td>
            <td>S/ ${item.subtotal.toFixed(2)}</td>
            <td><button class="btn-eliminar" onclick="eliminarItem(${item.id})">✕</button></td>
        `;
        cuerpo.appendChild(fila);
    });
}


function calcularTotales() {
    const subtotal = items.reduce((acumulado, item) => acumulado + item.subtotal, 0);
    const igv = subtotal * IGV;
    const total = subtotal + igv;

    document.getElementById("subtotal").textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById("igv").textContent = `S/ ${igv.toFixed(2)}`;
    document.getElementById("total").textContent = `S/ ${total.toFixed(2)}`;
}


function generarFactura() {
    try {
        const tipo = document.getElementById("tipoComprobante").value;
        const nombre = document.getElementById("nombreCliente").value.trim();
        const numeroDocumento = document.getElementById("numeroDocumento").value.trim();

        if (nombre === "") {
            throw new Error("Ingrese el nombre o razón social del cliente.");
        }
        if (!documentoValido(tipo, numeroDocumento)) {
            throw new Error(
                tipo === "boleta"
                    ? "El DNI debe tener 8 dígitos."
                    : "El RUC debe tener 11 dígitos."
            );
        }
        if (items.length === 0) {
            throw new Error("Agregue al menos un servicio a la factura.");
        }

        // Actualiza el correlativo guardado (notación JSON)
        const correlativo = obtenerCorrelativo();
        correlativo[tipo] += 1; 
        guardarCorrelativo(correlativo);

        const numeroComprobante = document.getElementById("numeroComprobante").value;
        const mensaje = document.getElementById("mensajeEstado");
        mensaje.textContent = `✅ ${tipo === "boleta" ? "Boleta" : "Factura"} ${numeroComprobante} generada correctamente para ${nombre}.`;
        mensaje.className = "mensaje-estado exito";

        alert("Comprobante generado correctamente.");
        console.log("Factura generada:", { tipo, nombre, numeroDocumento, items });
    } catch (error) {
        alert(`No se pudo generar el comprobante: ${error.message}`);
        console.error(error);
    }
}


function imprimirFactura() {
    window.print();
}


function reiniciarFactura() {
    items = [];
    contadorItem = 0;
    document.getElementById("nombreCliente").value = "";
    document.getElementById("numeroDocumento").value = "";
    document.getElementById("mensajeEstado").textContent = "";
    document.getElementById("mensajeEstado").className = "mensaje-estado";
    renderizarTabla();
    calcularTotales();
    actualizarSerie();
}
