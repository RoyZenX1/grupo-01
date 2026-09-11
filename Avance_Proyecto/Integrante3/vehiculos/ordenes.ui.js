"use strict";


const formularioOrden =
    document.getElementById("formOrden");

const tablaOrdenes =
    document.getElementById("tablaOrdenes");

const mensajeOrden =
    document.getElementById("mensajeOrden");


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

        fila.innerHTML = `
            <td>${orden.id}</td>
            <td>${orden.cotizacionId}</td>
            <td>${orden.vehiculoId}</td>
            <td>${orden.origen}</td>
            <td>${orden.destino}</td>
            <td>S/ ${orden.tarifa}</td>
            <td>${orden.estado}</td>
        `;

        tablaOrdenes.appendChild(fila);
    });
}


/* =========================
   EVENTO REGISTRAR ORDEN
========================= */

formularioOrden.addEventListener(
    "submit",
    function(event) {

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