"use strict";


const formularioOrden =
    document.getElementById("formOrden");

const tablaOrdenes =
    document.getElementById("tablaOrdenes");

const mensajeOrden =
    document.getElementById("mensajeOrden");

const btnRestaurarOrdenes =
    document.getElementById("btnRestaurarOrdenes");


/* =========================
   MOSTRAR MENSAJE
========================= */

function mostrarMensajeOrden(
    mensaje,
    tipo = "error"
) {

    mensajeOrden.textContent = mensaje;

    mensajeOrden.className = "mensaje";

    if (tipo === "exito") {
        mensajeOrden.style.backgroundColor = "#e2f5e9";
    } else {
        mensajeOrden.style.backgroundColor = "#fde4e4";
    }
}


/* =========================
   MOSTRAR ÓRDENES
========================= */

function mostrarOrdenes() {
    tablaOrdenes.innerHTML = "";

    ordenes.forEach(orden => {
        const fila = document.createElement("tr");
        const opcionesEstado = estadosOrden
            .map(estado => `
                <option value="${estado}" ${estado === orden.estado ? "selected" : ""}>
                    ${estado}
                </option>
            `)
            .join("");

        fila.innerHTML = `
            <td>${orden.id}</td>
            <td>${orden.cotizacionId}</td>
            <td>${orden.vehiculoId}</td>
            <td>${orden.origen}</td>
            <td>${orden.destino}</td>
            <td>S/ ${orden.tarifa}</td>
            <td>
                <select
                    class="selector-estado-orden"
                    data-id="${orden.id}"
                    data-estado="${orden.estado}"
                    aria-label="Estado de la orden ${orden.id}"
                >
                    ${opcionesEstado}
                </select>
            </td>
            <td>
                <button
                    type="button"
                    class="btn-eliminar-orden"
                    data-id="${orden.id}"
                >
                    Eliminar
                </button>
            </td>
        `;

        tablaOrdenes.appendChild(fila);

    });
}

tablaOrdenes.addEventListener("change", function (event) {
    if (!event.target.classList.contains("selector-estado-orden")) {
        return;
    }

    try {
        cambiarEstadoOrden(
            event.target.dataset.id,
            event.target.value
        );

        mostrarOrdenes();

        mostrarMensajeOrden(
            "Estado de la orden actualizado correctamente.",
            "exito"
        );
    } catch (error) {
        mostrarMensajeOrden(error.message);
    }
});

tablaOrdenes.addEventListener("click", function (event) {
    if (!event.target.classList.contains("btn-eliminar-orden")) {
        return;
    }

    const id = event.target.dataset.id;
    const indice = ordenes.findIndex(orden => orden.id === id);

    if (indice !== -1) {
        ordenes.splice(indice, 1);
        mostrarOrdenes();

        mostrarMensajeOrden(
            "Orden eliminada correctamente.",
            "exito"
        );
    }
});

btnRestaurarOrdenes.addEventListener("click", function () {
    restaurarOrdenes();
    mostrarOrdenes();

    mostrarMensajeOrden(
        "Datos de órdenes restaurados correctamente.",
        "exito"
    );
});


/* =========================
   EVENTO REGISTRAR ORDEN
========================= */

formularioOrden.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        try {

            const datos = {

                id:
                    document.getElementById(
                        "idOrden"
                    ).value,

                cotizacionId:
                    document.getElementById(
                        "cotizacionId"
                    ).value,

                vehiculoId:
                    document.getElementById(
                        "vehiculoId"
                    ).value,

                origen:
                    document.getElementById(
                        "origen"
                    ).value,

                destino:
                    document.getElementById(
                        "destino"
                    ).value,

                distancia:
                    document.getElementById(
                        "distanciaOrden"
                    ).value,

                peso:
                    document.getElementById(
                        "pesoOrden"
                    ).value
            };

            registrarOrden(datos);

            mostrarOrdenes();

            formularioOrden.reset();

            mostrarMensajeOrden(
                "Orden registrada correctamente.",
                "exito"
            );

        } catch (error) {

            mostrarMensajeOrden(
                error.message
            );
        }
    }
);

restaurarOrdenes();
mostrarOrdenes();