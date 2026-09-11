"use strict";

function validarDNI(dni) {

    const regexDNI = /^\d{8}$/;

    return regexDNI.test(dni.trim());
}


function validarRUC(ruc) {

    const regexRUC = /^\d{11}$/;

    return regexRUC.test(ruc.trim());
}


function validarEmail(email) {

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regexEmail.test(email.trim());
}


function validarTelefono(telefono) {

    const regexTelefono = /^9\d{8}$/;

    return regexTelefono.test(telefono.trim());
}


function validarIdentificacion(identificacion) {

    const valor = identificacion.trim();

    if (validarDNI(valor)) {
        return true;
    }

    if (validarRUC(valor)) {
        return true;
    }

    return false;
}


export {
    validarDNI,
    validarRUC,
    validarEmail,
    validarTelefono,
    validarIdentificacion
};