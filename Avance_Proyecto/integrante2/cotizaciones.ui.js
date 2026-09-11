import { calcularCotizacion } from './cotizaciones.js';

document.addEventListener("DOMContentLoaded", () => {
    const formCotizacion = document.getElementById("formCotizacion");
    const panelResultado = document.getElementById("panelResultado");
    const mensajeError = document.getElementById("mensajeError");

    const productoResultado = document.getElementById("productoResultado");
    const subtotalResultado = document.getElementById("subtotalResultado");
    const descuentoResultado = document.getElementById("descuentoResultado");
    const baseResultado = document.getElementById("baseResultado");
    const igvResultado = document.getElementById("igvResultado");
    const totalResultado = document.getElementById("totalResultado");

    if (!formCotizacion) {
        console.error("No se encontró el formulario con ID 'formCotizacion'");
        return;
    }

    formCotizacion.addEventListener("submit", (evento) => {
        evento.preventDefault(); // Evita que la página se recargue

        // Ocultar errores previos
        mensajeError.hidden = true;
        mensajeError.textContent = "";

        const producto = document.getElementById("producto").value.trim();
        const precio = parseFloat(document.getElementById("precio").value);
        const cantidad = parseInt(document.getElementById("cantidad").value);
        const descuento = parseFloat(document.getElementById("descuento").value);

        if (!producto) {
            mostrarError("Por favor, ingresa una descripción para el servicio.");
            return;
        }

        try {
            const resultados = calcularCotizacion({ precio, cantidad, descuento });

            // Rellenar datos en el HTML
            productoResultado.textContent = `Servicio: ${producto} (Cantidad: ${cantidad})`;
            subtotalResultado.textContent = `S/ ${resultados.subtotalBruto}`;
            descuentoResultado.textContent = `S/ ${resultados.montoDescuento} (${descuento}%)`;
            baseResultado.textContent = `S/ ${resultados.subtotalNeto}`;
            igvResultado.textContent = `S/ ${resultados.igv}`;
            totalResultado.textContent = `S/ ${resultados.total}`;

            // Mostrar panel de resultados
            panelResultado.hidden = false;
        } catch (error) {
            mostrarError(error.message);
            panelResultado.hidden = true;
        }
    });

    function mostrarError(mensaje) {
        mensajeError.textContent = mensaje;
        mensajeError.hidden = false;
    }
});