"use strict";


/* =========================
   DATOS
========================= */

const ordenes = [];


/* =========================
   ESTADOS
========================= */

const estadosOrden = [
    "Pendiente",
    "Programada",
    "En ruta",
    "Completada",
    "Cancelada"
];


/* =========================
   REGISTRAR ORDEN
========================= */

function registrarOrden(datos) {

    if (
        !datos.id ||
        !datos.cotizacionId ||
        !datos.vehiculoId
    ) {
        throw new TypeError(
            "La orden necesita ID, cotización y vehículo."
        );
    }

    const distancia = Number(datos.distancia);
    const peso = Number(datos.peso);

    if (
        isNaN(distancia) ||
        isNaN(peso)
    ) {
        throw new TypeError(
            "Distancia y peso deben ser números."
        );
    }

    if (
        distancia <= 0 ||
        peso <= 0
    ) {
        throw new RangeError(
            "Distancia y peso deben ser mayores que 0."
        );
    }

    const ordenExistente = ordenes.find(
        orden => orden.id === datos.id
    );

    if (ordenExistente) {
        throw new Error(
            "Ya existe una orden con ese ID."
        );
    }

    const tarifa = calcularTarifa(
        distancia,
        peso
    );

    const orden = {

        id: datos.id.trim(),

        cotizacionId:
            datos.cotizacionId.trim(),

        vehiculoId:
            datos.vehiculoId.trim(),

        origen:
            datos.origen.trim(),

        destino:
            datos.destino.trim(),

        distancia: distancia,

        peso: peso,

        tarifa: tarifa.precio,

        estado: "Pendiente"
    };

    ordenes.push(orden);

    return orden;
}


/* =========================
   BUSCAR ORDEN
========================= */

function buscarOrden(id) {

    return ordenes.find(
        orden => orden.id === id
    );
}


/* =========================
   CAMBIAR ESTADO
========================= */

function cambiarEstadoOrden(id, nuevoEstado) {

    if (!estadosOrden.includes(nuevoEstado)) {
        throw new Error(
            "El estado indicado no es válido."
        );
    }

    const orden = buscarOrden(id);

    if (!orden) {
        throw new Error(
            "Orden no encontrada."
        );
    }

    orden.estado = nuevoEstado;
}


/* =========================
   ASIGNAR VEHÍCULO
========================= */

function asignarVehiculo(idOrden, idVehiculo) {

    const orden = buscarOrden(idOrden);

    if (!orden) {
        throw new Error(
            "Orden no encontrada."
        );
    }

    orden.vehiculoId = idVehiculo;
}