"use strict";

/* =========================
   CLASE VEHÍCULO
========================= */

class Vehiculo {

    constructor(id, placa, tipo, capacidad, estado = "Disponible") {
        this.id = id;
        this.placa = placa;
        this.tipo = tipo;
        this.capacidad = capacidad;
        this.estado = estado;
    }
}


/* =========================
   CLASE TARIFA
========================= */

class Tarifa {

    constructor(distancia, peso, precio) {
        this.distancia = distancia;
        this.peso = peso;
        this.precio = precio;
    }
}


/* =========================
   DATOS
========================= */

const vehiculos = [];

const matrizTarifas = [
    [100, 150, 200],
    [180, 230, 280],
    [250, 300, 350]
];


/* =========================
   REGISTRAR VEHÍCULO
========================= */

function registrarVehiculo(id, placa, tipo, capacidad) {

    if (!id || !placa || !tipo) {
        throw new TypeError(
            "Todos los campos del vehículo son obligatorios."
        );
    }

    const capacidadNumerica = Number(capacidad);

    if (isNaN(capacidadNumerica) || capacidadNumerica <= 0) {
        throw new RangeError(
            "La capacidad debe ser un número mayor que 0."
        );
    }

    const placaNormalizada = placa
        .trim()
        .toUpperCase();

    const vehiculoExistente = vehiculos.find(
        vehiculo => vehiculo.placa === placaNormalizada
    );

    if (vehiculoExistente) {
        throw new Error(
            "Ya existe un vehículo con esa placa."
        );
    }

    const vehiculo = new Vehiculo(
        id.trim(),
        placaNormalizada,
        tipo,
        capacidadNumerica
    );

    vehiculos.push(vehiculo);

    return vehiculo;
}


/* =========================
   BUSCAR VEHÍCULO
========================= */

function buscarVehiculo(placa) {

    const placaBuscada = placa
        .trim()
        .toUpperCase();

    return vehiculos.find(
        vehiculo => vehiculo.placa === placaBuscada
    );
}


/* =========================
   VEHÍCULOS DISPONIBLES
========================= */

function obtenerVehiculosDisponibles() {

    return vehiculos.filter(
        vehiculo => vehiculo.estado === "Disponible"
    );
}


/* =========================
   CAMBIAR ESTADO
========================= */

function cambiarEstadoVehiculo(id, nuevoEstado) {

    const vehiculo = vehiculos.find(
        vehiculo => vehiculo.id === id
    );

    if (!vehiculo) {
        throw new Error("Vehículo no encontrado.");
    }

    const estadosPermitidos = [
        "Disponible",
        "En ruta",
        "Mantenimiento"
    ];

    if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new Error("Estado de vehículo no válido.");
    }

    vehiculo.estado = nuevoEstado;
}


/* =========================
   ELIMINAR VEHÍCULO
========================= */

function eliminarVehiculo(id) {

    const indice = vehiculos.findIndex(
        vehiculo => vehiculo.id === id
    );

    if (indice === -1) {
        throw new Error("Vehículo no encontrado.");
    }

    vehiculos.splice(indice, 1);
}


/* =========================
   RANGO DE DISTANCIA
========================= */

function obtenerRangoDistancia(distancia) {

    const rangos = [50, 100, 200];

    for (let i = 0; i < rangos.length; i++) {

        if (distancia <= rangos[i]) {
            return i;
        }
    }

    return -1;
}


/* =========================
   RANGO DE PESO
========================= */

function obtenerRangoPeso(peso) {

    if (peso <= 3) {
        return 0;
    }

    if (peso <= 7) {
        return 1;
    }

    if (peso <= 10) {
        return 2;
    }

    return -1;
}


/* =========================
   CALCULAR TARIFA
========================= */

function calcularTarifa(distancia, peso) {

    const distanciaNumerica = Number(distancia);
    const pesoNumerico = Number(peso);

    if (
        isNaN(distanciaNumerica) ||
        isNaN(pesoNumerico)
    ) {
        throw new TypeError(
            "Distancia y peso deben ser números."
        );
    }

    if (
        distanciaNumerica <= 0 ||
        pesoNumerico <= 0
    ) {
        throw new RangeError(
            "Distancia y peso deben ser mayores que 0."
        );
    }

    const fila = obtenerRangoDistancia(distanciaNumerica);
    const columna = obtenerRangoPeso(pesoNumerico);

    if (fila === -1 || columna === -1) {
        throw new RangeError(
            "La distancia o el peso están fuera del rango permitido."
        );
    }

    const precio = matrizTarifas[fila][columna];

    return new Tarifa(
        distanciaNumerica,
        pesoNumerico,
        precio
    );
}