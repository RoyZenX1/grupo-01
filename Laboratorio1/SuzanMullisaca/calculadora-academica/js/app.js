"use strict";
const NOTA_MINIMA = 0;
const NOTA_MAXIMA = 20;
const NOTA_APROBATORIA = 12;
const form = document.querySelector("#formNotas");
const inputNombre = document.querySelector("#nombre");
const inputNota1 = document.querySelector("#nota1");
const inputNota2 = document.querySelector("#nota2");
const inputNota3 = document.querySelector("#nota3");
const inputNota4 = document.querySelector("#nota4");
const mensajeError = document.querySelector("#mensajeError");
const panelResultado = document.querySelector("#panelResultado");
const nombreResultado = document.querySelector("#nombreResultado");
const promedioResultado = document.querySelector("#promedioResultado");
const estadoResultado = document.querySelector("#estadoResultado");
const barraProgreso = document.querySelector("#barraProgreso");
let numeroIntentos = 0;

function convertirNota(input, etiqueta) {
    const texto = input.value.trim();
    if (texto === "") {
        throw new TypeError(`Ingresa ${etiqueta}.`);
    }
    const nota = Number(texto);
    if (!Number.isFinite(nota)) {
        throw new TypeError(`${etiqueta} debe ser un número válido.`);
    }
    if (nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
        throw new RangeError(
            `${etiqueta} debe estar entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}.`,
        );
    }
    return nota;
}

function calcularPromedio(nota1, nota2, nota3, nota4) {
    return (nota1 + nota2 + nota3 + nota4) / 4;
}

function obtenerEstado(promedio) {
    if (promedio >= 18) {
        return "Excelente";
    }
    if (promedio >= 15) {
        return "Logro destacado";
    }
    if (promedio >= NOTA_APROBATORIA) {
        return "Aprobado";
    }
    return "Requiere refuerzo";
}

function obtenerClaseEstado(promedio) {
    if (promedio >= 18) return "estado--excelente";
    if (promedio >= 15) return "estado--logrado";
    if (promedio >= NOTA_APROBATORIA) return "estado--aprobado";
    return "estado--refuerzo";
}

function limpiarMensajeError() {
    mensajeError.textContent = "";
    mensajeError.hidden = true;
}

function mostrarResultado(nombre, promedio, estado) {
    nombreResultado.textContent = `Estudiante: ${nombre}`;
    promedioResultado.textContent = promedio.toFixed(2);
    estadoResultado.textContent = estado;
    estadoResultado.className = "resultado__estado";
    estadoResultado.classList.add(obtenerClaseEstado(promedio));
    const porcentaje = (promedio / NOTA_MAXIMA) * 100;
    barraProgreso.style.width = `${porcentaje}%`;
    panelResultado.hidden = false;
}

function mostrarError(error) {
    panelResultado.hidden = true;
    mensajeError.textContent = error.message;
    mensajeError.hidden = false;
    console.error(error);
}

function manejarEnvio(evento) {
    evento.preventDefault();
    limpiarMensajeError();
    numeroIntentos += 1;
    try {
        const nombre = inputNombre.value.trim();
        if (nombre === "") {
            throw new TypeError("Ingresa el nombre del estudiante.");
        }
        const nota1 = convertirNota(inputNota1, "la nota 1");
        const nota2 = convertirNota(inputNota2, "la nota 2");
        const nota3 = convertirNota(inputNota3, "la nota 3");
        const nota4 = convertirNota(inputNota4, "la nota 4");
        const promedio = calcularPromedio(nota1, nota2, nota3, nota4);
        const estado = obtenerEstado(promedio);

        mostrarResultado(nombre, promedio, estado);
        console.table({ nombre, nota1, nota2, nota3, nota4, promedio, estado });
    } catch (error) {
        mostrarError(error);
    } finally {
        console.info(`Intento de cálculo número ${numeroIntentos}.`);
    }
}

function manejarReinicio() {
    numeroIntentos = 0;
    limpiarMensajeError();
    panelResultado.hidden = true;
    barraProgreso.style.width = "0%";
    inputNombre.focus();
}

function ejecutarPruebaPromedioCuatroNotas() {
    const promedio = calcularPromedio(20, 20, 20, 20);
    const estado = obtenerEstado(promedio);
    if (promedio !== 20 || estado !== "Excelente") {
        throw new Error("La prueba con cuatro notas de 20 falló.");
    }
    console.info("Prueba: promedio con 4 notas de 20 = OK");
}

form.addEventListener("submit", manejarEnvio);
form.addEventListener("reset", manejarReinicio);

ejecutarPruebaPromedioCuatroNotas();