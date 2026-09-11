"use strict";

import {
    obtenerClientes,
    agregarCliente,
    buscarClientes,
    actualizarCliente,
    eliminarCliente
} from "./clientes.js";

import { 
    validarEmail, 
    validarTelefono, 
    validarIdentificacion 
} from "./utils/validations.js";


const formulario = document.querySelector("#formCliente");

const inputNombre = document.querySelector("#nombre");
const inputIdentificacion = document.querySelector("#identificacion");
const inputEmail = document.querySelector("#email");
const inputTelefono = document.querySelector("#telefono");

const busqueda = document.querySelector("#busqueda");

const tablaClientes = document.querySelector("#tablaClientes");

const mensaje = document.querySelector("#mensaje");

const mensajeVacio = document.querySelector("#mensajeVacio");

const btnGuardar = document.querySelector("#btnGuardar");


let clienteEditando = null;


// MOSTRAR MENSAJE

function mostrarMensaje(texto) {

    mensaje.textContent = texto;

    mensaje.hidden = false;
}


function ocultarMensaje() {

    mensaje.textContent = "";

    mensaje.hidden = true;
}


// VALIDAR FORMULARIO

function validarFormulario() {

    const nombre = inputNombre.value.trim();

    const identificacion =
        inputIdentificacion.value.trim();

    const email =
        inputEmail.value.trim();

    const telefono =
        inputTelefono.value.trim();


    if (nombre === "") {
        throw new Error("Ingresa el nombre del cliente.");
    }


    if (!validarIdentificacion(identificacion)) {

        throw new Error(
            "La identificación debe ser un DNI de 8 dígitos o un RUC de 11 dígitos."
        );

    }


    if (!validarEmail(email)) {

        throw new Error(
            "Ingresa un correo electrónico válido."
        );

    }


    if (!validarTelefono(telefono)) {

    throw new Error(
        "El teléfono debe tener 9 dígitos y comenzar con 9."
    );

}


    return {
        nombre,
        identificacion,
        email,
        telefono
    };
}


// LIMPIAR FORMULARIO

function limpiarFormulario() {

    formulario.reset();

    clienteEditando = null;

    btnGuardar.textContent = "Registrar cliente";
}


// CREAR FILA

function crearFila(cliente) {

    const fila = document.createElement("tr");


    const celdaNombre =
        document.createElement("td");

    celdaNombre.textContent =
        cliente.nombre;


    const celdaIdentificacion =
        document.createElement("td");

    celdaIdentificacion.textContent =
        cliente.identificacion;


    const celdaEmail =
        document.createElement("td");

    celdaEmail.textContent =
        cliente.email;


    const celdaTelefono =
        document.createElement("td");

    celdaTelefono.textContent =
        cliente.telefono;


    const celdaAcciones =
        document.createElement("td");


    const btnEditar =
        document.createElement("button");

    btnEditar.type = "button";

    btnEditar.className = "btn";

    btnEditar.textContent = "Editar";

    btnEditar.dataset.id = cliente.id;


    const btnEliminar =
        document.createElement("button");

    btnEliminar.type = "button";

    btnEliminar.className = "btn";

    btnEliminar.textContent = "Eliminar";

    btnEliminar.dataset.id = cliente.id;


    celdaAcciones.append(
        btnEditar,
        btnEliminar
    );


    fila.append(
        celdaNombre,
        celdaIdentificacion,
        celdaEmail,
        celdaTelefono,
        celdaAcciones
    );


    return fila;
}


// MOSTRAR CLIENTES

function mostrarClientes(lista = obtenerClientes()) {

    tablaClientes.replaceChildren();


    lista.forEach(cliente => {

        const fila = crearFila(cliente);

        tablaClientes.appendChild(fila);

    });


    mensajeVacio.hidden = lista.length > 0;
}


// REGISTRAR / ACTUALIZAR

function manejarEnvio(evento) {

    evento.preventDefault();

    ocultarMensaje();


    try {

        const datos = validarFormulario();


        if (clienteEditando === null) {

            agregarCliente(datos);

            mostrarMensaje(
                "Cliente registrado correctamente."
            );

        } else {

            actualizarCliente(
                clienteEditando,
                datos
            );

            mostrarMensaje(
                "Cliente actualizado correctamente."
            );

        }


        limpiarFormulario();

        mostrarClientes();

    } catch (error) {

        mostrarMensaje(error.message);

        console.error(error);

    }
}


// EDITAR CLIENTE

function editarCliente(id) {

    const cliente =
        obtenerClientes().find(
            cliente => cliente.id === id
        );


    if (!cliente) {

        mostrarMensaje(
            "No se encontró el cliente."
        );

        return;
    }


    inputNombre.value = cliente.nombre;

    inputIdentificacion.value =
        cliente.identificacion;

    inputEmail.value =
        cliente.email;

    inputTelefono.value =
        cliente.telefono;


    clienteEditando = id;

    btnGuardar.textContent =
        "Actualizar cliente";

    inputNombre.focus();
}


// ELIMINAR CLIENTE

function manejarEliminacion(id) {

    try {

        eliminarCliente(id);

        mostrarClientes();

        mostrarMensaje(
            "Cliente eliminado correctamente."
        );

    } catch (error) {

        mostrarMensaje(error.message);

        console.error(error);
    }
}


// EVENTOS DE LA TABLA

function manejarClickTabla(evento) {

    const boton =
        evento.target.closest("button");

    if (!boton) {
        return;
    }


    const id =
        Number(boton.dataset.id);


    if (boton.textContent === "Editar") {

        editarCliente(id);

    }


    if (boton.textContent === "Eliminar") {

        manejarEliminacion(id);

    }
}


// BÚSQUEDA

function manejarBusqueda() {

    const texto =
        busqueda.value.trim();


    if (texto === "") {

        mostrarClientes();

        return;
    }


    const resultados =
        buscarClientes(texto);


    mostrarClientes(resultados);
}



// EVENTOS

formulario.addEventListener(
    "submit",
    manejarEnvio
);


tablaClientes.addEventListener(
    "click",
    manejarClickTabla
);


busqueda.addEventListener(
    "input",
    manejarBusqueda
);


// INICIO

mostrarClientes();