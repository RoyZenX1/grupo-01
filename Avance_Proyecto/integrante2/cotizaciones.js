"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const formCotizacion = document.getElementById("formCotizacion");

    const producto = document.getElementById("producto");
    const precio = document.getElementById("precio");
    const cantidad = document.getElementById("cantidad");
    const descuento = document.getElementById("descuento");

    const mensajeError = document.getElementById("mensajeError");


    const resultadoVacio = document.getElementById("resultadoVacio");
    const resultadoCalculado = document.getElementById("resultadoCalculado");

    const productoResultado =
        document.getElementById("productoResultado");

    const cantidadResultado =
        document.getElementById("cantidadResultado");

    const subtotalResultado =
        document.getElementById("subtotalResultado");

    const descuentoResultado =
        document.getElementById("descuentoResultado");

    const baseResultado =
        document.getElementById("baseResultado");

    const igvResultado =
        document.getElementById("igvResultado");

    const totalResultado =
        document.getElementById("totalResultado");


    if (!formCotizacion) {

        console.error(
            "No se encontró el formulario de cotización."
        );

        return;
    }


    formCotizacion.addEventListener("submit", (evento) => {

        evento.preventDefault();


        mensajeError.hidden = true;
        mensajeError.textContent = "";


        const nombreServicio = producto.value.trim();

        const precioUnitario = parseFloat(precio.value);

        const unidades = parseInt(cantidad.value);

        const porcentajeDescuento =
            parseFloat(descuento.value);


        if (!nombreServicio) {

            mostrarError(
                "Por favor, ingresa el servicio o la ruta."
            );

            producto.focus();

            return;
        }

        if (
            Number.isNaN(precioUnitario) ||
            precioUnitario <= 0
        ) {

            mostrarError(
                "El precio debe ser un número mayor a 0."
            );

            precio.focus();

            return;
        }


        if (
            Number.isNaN(unidades) ||
            unidades <= 0 ||
            !Number.isInteger(unidades)
        ) {

            mostrarError(
                "La cantidad debe ser un número entero mayor a 0."
            );

            cantidad.focus();

            return;
        }

        if (
            Number.isNaN(porcentajeDescuento) ||
            porcentajeDescuento < 0 ||
            porcentajeDescuento > 50
        ) {

            mostrarError(
                "El descuento debe estar entre 0% y 50%."
            );

            descuento.focus();

            return;
        }


        const subtotalBruto =
            precioUnitario * unidades;


        const montoDescuento =
            subtotalBruto *
            (porcentajeDescuento / 100);


        const baseImponible =
            subtotalBruto - montoDescuento;

        const igv =
            baseImponible * 0.18;


        const total =
            baseImponible + igv;


        productoResultado.textContent =
            nombreServicio;


        cantidadResultado.textContent =
            `${unidades} ${unidades === 1 ? "unidad" : "unidades"}`;


        subtotalResultado.textContent =
            formatearMoneda(subtotalBruto);


        descuentoResultado.textContent =
            `${formatearMoneda(montoDescuento)} (${porcentajeDescuento}%)`;


        baseResultado.textContent =
            formatearMoneda(baseImponible);


        igvResultado.textContent =
            formatearMoneda(igv);


        totalResultado.textContent =
            formatearMoneda(total);


        resultadoVacio.hidden = true;

        resultadoCalculado.hidden = false;

    });

    formCotizacion.addEventListener("reset", () => {

        setTimeout(() => {

            mensajeError.hidden = true;
            mensajeError.textContent = "";

            resultadoCalculado.hidden = true;
            resultadoVacio.hidden = false;

            producto.focus();

        }, 0);

    });


    function mostrarError(mensaje) {

        mensajeError.textContent = mensaje;

        mensajeError.hidden = false;

    }


    function formatearMoneda(valor) {

        return `S/ ${valor.toFixed(2)}`;

    }


    const menuToggle =
        document.querySelector(".menu-toggle");

    const mobileMenuToggle =
        document.querySelector(".mobile-menu-toggle");

    const sidebar =
        document.querySelector(".sidebar");


    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("colapsado");

        });

    }


    if (mobileMenuToggle && sidebar) {

        mobileMenuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("mostrar");

        });

    }

});