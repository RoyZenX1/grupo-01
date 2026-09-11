"use strict";


/* =========================
   DATOS
========================= */

const ordenes = [];

const DATOS_INICIALES_ORDENES = [
    {
        id: "O001",
        cotizacionId: "C001",
        vehiculoId: "V001",
        origen: "Lima",
        destino: "Callao",
        distancia: 25,
        peso: 2,
        tarifa: 100,
        estado: "Pendiente"
    },
    {
        id: "O002",
        cotizacionId: "C002",
        vehiculoId: "V002",
        origen: "Ate",
        destino: "Miraflores",
        distancia: 50,
        peso: 5,
        tarifa: 230,
        estado: "Programada"
    },
    {
        id: "O003",
        cotizacionId: "C003",
        vehiculoId: "V003",
        origen: "Lima",
        destino: "Chorrillos",
        distancia: 80,
        peso: 3,
        tarifa: 150,
        estado: "En ruta"
    }
];

function restaurarOrdenes() {
    ordenes.length = 0;

    DATOS_INICIALES_ORDENES.forEach(orden => {
        ordenes.push({ ...orden });
    });
}


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