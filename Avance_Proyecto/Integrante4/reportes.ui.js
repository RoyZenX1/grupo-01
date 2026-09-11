// ---- Estado de la interfaz ----
let mascaraFiltro = 0;          // acumula los flags activos (bitwise)
let ordenActualCampo = "fecha"; // columna usada para ordenar
let ordenActualDireccion = "desc";


window.onload = function () {
    renderizarFiltros();
    actualizarVista();
    console.log("Módulo de reportes y métricas listo.");
};


function renderizarFiltros() {
    const contenedor = document.getElementById("filtrosEstado");
    contenedor.innerHTML = "";

    ETIQUETA_ESTADO.forEach((texto, flag) => {
        const boton = document.createElement("button");
        boton.textContent = texto;
        boton.className = "chip-filtro";
        boton.dataset.flag = flag;
        // EVENTO onclick asignado dinámicamente
        boton.onclick = function () {
            alternarFiltro(flag, boton);
        };
        contenedor.appendChild(boton);
    });
}

function alternarFiltro(flag, boton) {
    mascaraFiltro = alternarFlag(mascaraFiltro, flag); // XOR bit a bit (reportes.js)
    boton.classList.toggle("activo", (mascaraFiltro & flag) !== 0);
    actualizarVista();
}


function limpiarFiltros() {
    mascaraFiltro = 0;
    document.querySelectorAll(".chip-filtro").forEach((boton) => boton.classList.remove("activo"));
    actualizarVista();
}


function cambiarOrden() {
    const selector = document.getElementById("selectOrden");
    const [campo, direccion] = selector.value.split("-");
    ordenActualCampo = campo;
    ordenActualDireccion = direccion;
    actualizarVista();
}


function actualizarVista() {
    try {
        const filtradas = filtrarPorEstado(ordenes, mascaraFiltro);
        const ordenadas = ordenarPor(filtradas, ordenActualCampo, ordenActualDireccion);

        pintarMetricas(calcularMetricas(filtradas));
        pintarTablaOrdenes(transformarParaReporte(ordenadas));
        pintarTopClientes(topClientesPorMonto(filtradas, 5));
        pintarResumenRutas(resumenPorRuta(filtradas));

        document.getElementById("contadorResultados").textContent =
            `${filtradas.length} de ${ordenes.length} órdenes`;
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al generar el reporte.");
    }
}


function pintarMetricas(metricas) {
    document.getElementById("metricaCantidad").textContent = metricas.cantidad;
    document.getElementById("metricaMonto").textContent = `S/ ${metricas.montoTotal.toFixed(2)}`;
    document.getElementById("metricaPromedio").textContent = `S/ ${metricas.promedio.toFixed(2)}`;
    document.getElementById("metricaClientes").textContent = metricas.clientesUnicos;
    document.getElementById("metricaRutas").textContent = metricas.rutasUnicas;
    document.getElementById("metricaUrgentes").textContent = metricas.urgentes;
}


function pintarTablaOrdenes(filas) {
    const cuerpo = document.getElementById("cuerpoTablaOrdenes");
    cuerpo.innerHTML = "";

    if (filas.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="6" class="vacio">No hay órdenes con ese filtro.</td></tr>`;
        return;
    }

    filas.forEach((fila) => {
        const tr = document.createElement("tr");
        if (fila.esUrgente) tr.classList.add("fila-urgente");
        tr.innerHTML = `
            <td>${fila.id}</td>
            <td>${fila.cliente}</td>
            <td>${fila.ruta}</td>
            <td>${fila.monto}</td>
            <td>${fila.estado}</td>
            <td>${fila.fecha}</td>
        `;
        cuerpo.appendChild(tr);
    });
}


function pintarTopClientes(topClientes) {
    const contenedor = document.getElementById("listaTopClientes");
    contenedor.innerHTML = "";

    if (topClientes.length === 0) {
        contenedor.innerHTML = `<p class="vacio">Sin datos para mostrar.</p>`;
        return;
    }

    const montoMax = Math.max(...topClientes.map((c) => c.total));

    topClientes.forEach((c) => {
        const porcentaje = montoMax > 0 ? (c.total / montoMax) * 100 : 0;
        const fila = document.createElement("div");
        fila.className = "barra-fila";
        fila.innerHTML = `
            <div class="barra-etiqueta">${c.cliente} <span>(${c.cantidad})</span></div>
            <div class="barra-fondo">
                <div class="barra-relleno" style="width: ${porcentaje}%;"></div>
            </div>
            <div class="barra-valor">S/ ${c.total.toFixed(2)}</div>
        `;
        contenedor.appendChild(fila);
    });
}


function pintarResumenRutas(rutas) {
    const cuerpo = document.getElementById("cuerpoTablaRutas");
    cuerpo.innerHTML = "";

    if (rutas.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="3" class="vacio">Sin datos.</td></tr>`;
        return;
    }

    rutas.forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.ruta}</td>
            <td>${r.cantidad}</td>
            <td>S/ ${r.monto.toFixed(2)}</td>
        `;
        cuerpo.appendChild(tr);
    });
}
