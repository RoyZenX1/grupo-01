"use strict";
console.log("Laboratorio iniciado");

const NOTA_APROBATORIA = 12;
let numeroIntentos = 0;

numeroIntentos = numeroIntentos + 1;
console.log(numeroIntentos); // 1

const texto = "15";
const nota = Number(texto);

console.log(typeof texto);
console.log(typeof nota);
console.log(typeof nota === 15);
console.log(typeof texto === 15);

if (promedio >= 18) {
    console.log("Excelente");
} else if (promedio >= 12) {
    console.log("Aprobado");
} else {
    console.log("Requiere refuerzo");
}


for (let intento = 1; intento <= 3; intento += 1) {
    console.log(`Intento ${intento}`);
}
let pendientes = 2;
while (pendientes > 0) {
    console.log(`Pendientes: ${pendientes}`);
    pendientes -= 1;
}


function calcularPromedio(nota1, nota2, nota3) {
    return (nota1 + nota2 + nota3) / 3;
}
const resultado = calcularPromedio(18, 16, 17);
console.log(resultado); // 17

function validarNota(nota) {
    if (nota < 0 || nota > 20) {
        throw new RangeError("La nota debe estar entre 0 y 20.");
    }
    return nota;
}
try {
    console.log(validarNota(25));
} catch (error) {
    console.error(error.message);
} finally {
    console.info("Validación terminada");
}

const boton = document.querySelector("#btnSaludar");
const salida = document.querySelector("#salida");
boton.addEventListener("click", () => {
    salida.textContent = "¡Hola desde JavaScript!";
});

