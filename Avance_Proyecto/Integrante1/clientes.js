"use strict";

const CLAVE_CLIENTES = "nexocargo_clientes";

let clientes = [];

function cargarClientes() {

    try {

        const datos = localStorage.getItem(CLAVE_CLIENTES);

        if (datos) {
            clientes = JSON.parse(datos);
        } else {
            clientes = [];
        }

    } catch (error) {

        console.error("Error al cargar clientes:", error);

        clientes = [];
    }

    return clientes;
}


function guardarClientes() {

    try {

        localStorage.setItem(
            CLAVE_CLIENTES,
            JSON.stringify(clientes)
        );

    } catch (error) {

        console.error("Error al guardar clientes:", error);

        throw new Error("No se pudieron guardar los clientes.");
    }
}


function obtenerClientes() {

    return clientes;
}


function agregarCliente(cliente) {

    cliente.id = Date.now();

    clientes.push(cliente);

    guardarClientes();

    return cliente;
}


function buscarClientes(texto) {

    const termino = texto
        .trim()
        .toLocaleLowerCase("es-PE");

    return clientes.filter(cliente => {

        const nombre = cliente.nombre
            .toLocaleLowerCase("es-PE");

        const identificacion = cliente.identificacion;

        return nombre.includes(termino) ||
               identificacion.includes(termino);

    });
}


function actualizarCliente(id, datos) {

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {
        throw new Error("Cliente no encontrado.");
    }

    clientes[indice] = {
        ...clientes[indice],
        ...datos
    };

    guardarClientes();

    return clientes[indice];
}


function eliminarCliente(id) {

    const indice = clientes.findIndex(
        cliente => cliente.id === id
    );

    if (indice === -1) {
        throw new Error("Cliente no encontrado.");
    }

    clientes.splice(indice, 1);

    guardarClientes();
}


cargarClientes();


export {
    obtenerClientes,
    agregarCliente,
    buscarClientes,
    actualizarCliente,
    eliminarCliente
};