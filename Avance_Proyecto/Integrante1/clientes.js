"use strict";

const CLAVE_CLIENTES = "nexocargo_clientes";

let clientes = [];


/* =========================
   DATOS INICIALES
========================= */

const DATOS_INICIALES_CLIENTES = [
    {
        id: 1,
        nombre: "Juan Pérez",
        identificacion: "12345678",
        email: "juan.perez@gmail.com",
        telefono: "987654321"
    },
    {
        id: 2,
        nombre: "María García",
        identificacion: "87654321",
        email: "maria.garcia@gmail.com",
        telefono: "986543210"
    },
    {
        id: 3,
        nombre: "Transportes del Sur SAC",
        identificacion: "20123456789",
        email: "contacto@transportesdelsur.com",
        telefono: "985432109"
    },
    {
        id: 4,
        nombre: "Carlos Ramírez",
        identificacion: "45678912",
        email: "carlos.ramirez@gmail.com",
        telefono: "984321098"
    },
    {
        id: 5,
        nombre: "Comercial Andina SAC",
        identificacion: "20456789123",
        email: "ventas@comercialandina.com",
        telefono: "983210987"
    },
    {
        id: 6,
        nombre: "Ana Torres",
        identificacion: "34567891",
        email: "ana.torres@gmail.com",
        telefono: "982109876"
    },
    {
        id: 7,
        nombre: "Distribuidora Norte SAC",
        identificacion: "20678912345",
        email: "contacto@distribuidoranorte.com",
        telefono: "981098765"
    },
    {
        id: 8,
        nombre: "Luis Mendoza",
        identificacion: "23456789",
        email: "luis.mendoza@gmail.com",
        telefono: "980987654"
    },
    {
        id: 9,
        nombre: "Agroexport Perú SAC",
        identificacion: "20789123456",
        email: "ventas@agroexportperu.com",
        telefono: "979876543"
    },
    {
        id: 10,
        nombre: "Minera Los Andes SAC",
        identificacion: "20912345678",
        email: "contacto@mineralosandes.com",
        telefono: "978765432"
    }
];


/* =========================
   CARGAR CLIENTES
========================= */

function cargarClientes() {

    try {

        const datos = localStorage.getItem(CLAVE_CLIENTES);

        if (datos) {

            clientes = JSON.parse(datos);

        } else {

            clientes = DATOS_INICIALES_CLIENTES.map(cliente => ({
                ...cliente
            }));

            guardarClientes();
        }

    } catch (error) {

        console.error("Error al cargar clientes:", error);

        clientes = [];
    }

    return clientes;
}


/* =========================
   GUARDAR CLIENTES
========================= */

function guardarClientes() {

    try {

        localStorage.setItem(
            CLAVE_CLIENTES,
            JSON.stringify(clientes)
        );

    } catch (error) {

        console.error("Error al guardar clientes:", error);

        throw new Error(
            "No se pudieron guardar los clientes."
        );
    }
}


/* =========================
   OBTENER CLIENTES
========================= */

function obtenerClientes() {

    return clientes;
}


/* =========================
   AGREGAR CLIENTE
========================= */

function agregarCliente(cliente) {

    cliente.id = Date.now();

    clientes.push(cliente);

    guardarClientes();

    return cliente;
}


/* =========================
   BUSCAR CLIENTES
========================= */

function buscarClientes(texto) {

    const termino = texto
        .trim()
        .toLocaleLowerCase("es-PE");

    return clientes.filter(cliente => {

        const nombre = cliente.nombre
            .toLocaleLowerCase("es-PE");

        const identificacion =
            cliente.identificacion;

        return nombre.includes(termino) ||
               identificacion.includes(termino);
    });
}


/* =========================
   ACTUALIZAR CLIENTE
========================= */

function actualizarCliente(id, datos) {

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {

        throw new Error(
            "Cliente no encontrado."
        );
    }

    clientes[indice] = {
        ...clientes[indice],
        ...datos
    };

    guardarClientes();

    return clientes[indice];
}


/* =========================
   ELIMINAR CLIENTE
========================= */

function eliminarCliente(id) {

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {

        throw new Error(
            "Cliente no encontrado."
        );
    }

    clientes.splice(indice, 1);

    guardarClientes();
}


/* =========================
   INICIO
========================= */

cargarClientes();


export {
    obtenerClientes,
    agregarCliente,
    buscarClientes,
    actualizarCliente,
    eliminarCliente
};