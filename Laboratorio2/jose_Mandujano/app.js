"use strict";
const REGLAS_BASE = Object.freeze({
 igvPorcentaje: 18,
 descuentoClienteFrecuente: 5,
 descuentoMaximo: 50,
 envioExpresCentimos: 1500,
});
const OPCION_CLIENTE_FRECUENTE = 1 << 0;
const OPCION_ENVIO_EXPRES = 1 << 1;
const formulario = document.querySelector("#formCotizacion");
const inputProducto = document.querySelector("#producto");
const inputPrecio = document.querySelector("#precio");
const inputCantidad = document.querySelector("#cantidad");
const inputDescuento = document.querySelector("#descuento");
const inputClienteFrecuente = document.querySelector("#clienteFrecuente");
const inputEnvioExpres = document.querySelector("#envioExpres");
const mensajeError = document.querySelector("#mensajeError");
const panelResultado = document.querySelector("#panelResultado");
const salidas = {
 id: document.querySelector("#idOperacion"),
 producto: document.querySelector("#productoResultado"),
 subtotal: document.querySelector("#subtotalResultado"),

 descuento: document.querySelector("#descuentoResultado"),
 base: document.querySelector("#baseResultado"),
 igv: document.querySelector("#igvResultado"),
 envio: document.querySelector("#envioResultado"),
 total: document.querySelector("#totalResultado"),
 banderas: document.querySelector("#explicacionBanderas"),
};
const formateadorMoneda = new Intl.NumberFormat("es-PE", {
 style: "currency",
 currency: "PEN",
 minimumFractionDigits: 2,
});
let correlativo = 0n;
function crearIdOperacion() {
 correlativo += 1n;
 return BigInt(Date.now()) * 1_000_000n + correlativo;
}
function convertirImporteACentimos(texto) {
 const limpio = texto.trim();
 const partes = limpio.split(".");
 if (limpio === "" || partes.length > 2) {

throw new TypeError("Ingresa un precio válido con punto decimal.");
 }
 const parteEntera = partes[0];
 const parteDecimal = partes[1] ?? "";
 if (parteEntera === "" || parteDecimal.length > 2) {
 throw new RangeError("El precio admite como máximo dos decimales.");
 }
 const enteros = Number(parteEntera);
 const decimales = Number(parteDecimal.padEnd(2, "0") || "0");
 if (
 !Number.isInteger(enteros) || enteros < 0 ||
 !Number.isInteger(decimales) || decimales < 0 || decimales > 99
 ) {
 throw new TypeError("El precio contiene caracteres o signos no válidos.");
 }
const centimos = enteros * 100 + decimales;
 if (!Number.isSafeInteger(centimos) || centimos <= 0) {
 throw new RangeError("El precio debe ser mayor que 0 y estar dentro del rango permitido.");
 }

  return centimos;
}
function leerEntero(input, nombre, minimo, maximo) {
 const valor = Number(input.value);
 if (!Number.isInteger(valor) || valor < minimo || valor > maximo) {
 throw new RangeError(`${nombre} debe ser un entero entre ${minimo} y ${maximo}.`);
 }
 return valor;
}
function crearBanderas({ clienteFrecuente, envioExpres }) {
 let banderas = 0;
 if (clienteFrecuente) {
 banderas |= OPCION_CLIENTE_FRECUENTE;
 }
 if (envioExpres) {
 banderas |= OPCION_ENVIO_EXPRES;
 }
 return banderas;
}

function tieneOpcion(banderas, opcion) {
 return (banderas & opcion) !== 0;
}
function sumarCentimos(...valores) {
 let total = 0;
 for (const valor of valores) {
 total += valor;
 }
 return total;
}
function calcularCotizacion(datos, opciones = {}) {
 const reglas = { ...REGLAS_BASE, ...opciones };
 const banderas = reglas.banderas ?? 0;
 const subtotalCentimos = datos.precioCentimos * datos.cantidad;
 if (!Number.isSafeInteger(subtotalCentimos)) {
 throw new RangeError("El subtotal excede el rango de enteros seguros.");
 }
 const esFrecuente = tieneOpcion(banderas, OPCION_CLIENTE_FRECUENTE);
 const descuentoMinimo = esFrecuente ? reglas.descuentoClienteFrecuente : 0;

 const descuentoAplicado = Math.min(
 Math.max(datos.descuento, descuentoMinimo),
 reglas.descuentoMaximo,
 );
 const descuentoCentimos = Math.round(
 subtotalCentimos * descuentoAplicado / 100,
 );
 const baseImponibleCentimos = subtotalCentimos - descuentoCentimos;
 const igvCentimos = Math.round(
 baseImponibleCentimos * reglas.igvPorcentaje / 100,
 );
 const envioCentimos = tieneOpcion(banderas, OPCION_ENVIO_EXPRES)
 ? reglas.envioExpresCentimos
 : 0;
 const componentes = [baseImponibleCentimos, igvCentimos, envioCentimos];
 const totalCentimos = sumarCentimos(...componentes);
 return {
 ...datos,
 banderas,
 descuentoAplicado,
 subtotalCentimos,
 descuentoCentimos,
 baseImponibleCentimos,

 igvCentimos,
 envioCentimos,
 totalCentimos,
 };
}
function formatearCentimos(centimos) {
 return formateadorMoneda.format(centimos / 100);
}
function limpiarError() {
 mensajeError.textContent = "";
 mensajeError.hidden = true;
}
function mostrarError(mensaje) {
 mensajeError.textContent = mensaje;
 mensajeError.hidden = false;
}
function mostrarResultado(resultado) {
 salidas.id.value = crearIdOperacion().toString();
 salidas.producto.textContent = `${resultado.producto} × ${resultado.cantidad}`;
 salidas.subtotal.value = formatearCentimos(resultado.subtotalCentimos);
 salidas.descuento.value = `-${formatearCentimos(resultado.descuentoCentimos)}
(${resultado.descuentoAplicado} %)`;
 salidas.base.value = formatearCentimos(resultado.baseImponibleCentimos);

 salidas.igv.value = formatearCentimos(resultado.igvCentimos);
 salidas.envio.value = formatearCentimos(resultado.envioCentimos);
 salidas.total.value = formatearCentimos(resultado.totalCentimos);
 const frecuente = tieneOpcion(resultado.banderas, OPCION_CLIENTE_FRECUENTE);
 const expres = tieneOpcion(resultado.banderas, OPCION_ENVIO_EXPRES);
 salidas.banderas.textContent =
 `Banderas ${resultado.banderas.toString(2).padStart(2, "0")}: ` +
 `cliente frecuente ${frecuente ? "sí" : "no"}; ` +
 `envío express ${expres ? "sí" : "no"}.`;
 panelResultado.hidden = false;
}
function manejarEnvio(evento) {
 evento.preventDefault();
 limpiarError();
 try {
 const producto = inputProducto.value.trim();
 if (producto === "") {
 throw new TypeError("Escribe el nombre del producto o servicio.");
 }
 const precioCentimos = convertirImporteACentimos(inputPrecio.value);

const cantidad = leerEntero(inputCantidad, "La cantidad", 1, 10000);
 const descuento = leerEntero(inputDescuento, "El descuento", 0, 50);
 const banderas = crearBanderas({
 clienteFrecuente: inputClienteFrecuente.checked,
 envioExpres: inputEnvioExpres.checked,
 });
 const datos = { producto, precioCentimos, cantidad, descuento };
 const resultado = calcularCotizacion(datos, { banderas });
 mostrarResultado(resultado);
 } catch (error) {
 panelResultado.hidden = true;
 mostrarError(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
 }
}
function manejarReinicio() {
 limpiarError();
 panelResultado.hidden = true;
 queueMicrotask(() => inputProducto.focus());
}
formulario.addEventListener("submit", manejarEnvio);
formulario.addEventListener("reset", manejarReinicio);
inputProducto.focus();
