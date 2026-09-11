"use strict";


const formularioVehiculo =
    document.getElementById("formVehiculo");

const tablaVehiculos =
    document.getElementById("tablaVehiculos");

const mensajeVehiculo =
    document.getElementById("mensajeVehiculo");

const formularioTarifa =
    document.getElementById("formTarifa");

const resultadoTarifa =
    document.getElementById("resultadoTarifa");

const btnRestaurarVehiculos =
    document.getElementById("btnRestaurarVehiculos");

const resumenVehiculos = {
    total: document.getElementById("totalVehiculos"),
    disponibles: document.getElementById("vehiculosDisponibles"),
    enRuta: document.getElementById("vehiculosRuta")
};


/* =========================
   MOSTRAR MENSAJE
========================= */

function mostrarMensaje(mensaje, tipo = "error") {

    mensajeVehiculo.textContent = mensaje;

    mensajeVehiculo.className = "mensaje";

    if (tipo === "exito") {
        mensajeVehiculo.style.backgroundColor = "#e2f5e9";
    } else {
        mensajeVehiculo.style.backgroundColor = "#fde4e4";
    }
}


/* =========================
   MOSTRAR VEHÍCULOS
========================= */

function mostrarVehiculos() {
    tablaVehiculos.innerHTML = "";

    vehiculos.forEach(vehiculo => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${vehiculo.id}</td>
            <td>${vehiculo.placa}</td>
            <td>${vehiculo.tipo}</td>
            <td>${vehiculo.capacidad} t</td>
            <td><span class="estado">${vehiculo.estado}</span></td>
            <td>
                <button
                    type="button"
                    class="btn-eliminar"
                    data-id="${vehiculo.id}"
                >
                    Eliminar
                </button>
            </td>
        `;

        tablaVehiculos.appendChild(fila);
    });

    actualizarResumen();
}

function actualizarResumen() {
    resumenVehiculos.total.textContent = vehiculos.length;
    resumenVehiculos.disponibles.textContent =
        vehiculos.filter(vehiculo => vehiculo.estado === "Disponible").length;
    resumenVehiculos.enRuta.textContent =
        vehiculos.filter(vehiculo => vehiculo.estado === "En ruta").length;
}

tablaVehiculos.addEventListener("click", event => {
    const boton = event.target.closest(".btn-eliminar");

    if (!boton) {
        return;
    }

    try {
        eliminarVehiculo(boton.dataset.id);
        mostrarVehiculos();
        mostrarMensaje("Vehículo eliminado correctamente.", "exito");
    } catch (error) {
        mostrarMensaje(error.message);
    }
});

btnRestaurarVehiculos.addEventListener("click", () => {
    restaurarVehiculos();
    mostrarVehiculos();
    mostrarMensaje(
        "Datos de vehículos restaurados correctamente.",
        "exito"
    );
});

/* =========================
   EVENTO REGISTRAR
========================= */

formularioVehiculo.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        try {

            const id =
                document.getElementById("idVehiculo").value;

            const placa =
                document.getElementById("placa").value;

            const tipo =
                document.getElementById("tipo").value;

            const capacidad =
                document.getElementById("capacidad").value;

            registrarVehiculo(
                id,
                placa,
                tipo,
                capacidad
            );

            mostrarVehiculos();

            formularioVehiculo.reset();

            mostrarMensaje(
                "Vehículo registrado correctamente.",
                "exito"
            );

        } catch (error) {

            mostrarMensaje(error.message);
        }
    }
);


/* =========================
   CALCULAR TARIFA
========================= */

formularioTarifa.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        try {

            const distancia =
                document.getElementById("distancia").value;

            const peso =
                document.getElementById("peso").value;

            const tarifa =
                calcularTarifa(
                    distancia,
                    peso
                );

            resultadoTarifa.innerHTML = `
                <strong>Tarifa encontrada:</strong>
                S/ ${tarifa.precio}
                <br>
                Distancia: ${tarifa.distancia} km
                <br>
                Peso: ${tarifa.peso} toneladas
            `;

            resultadoTarifa.classList.add("visible");

        } catch (error) {

            resultadoTarifa.textContent =
                error.message;

            resultadoTarifa.classList.add("visible");
        }
    }
);

mostrarVehiculos();