export function calcularCotizacion({ precio, cantidad, descuento }) {
    if (isNaN(precio) || isNaN(cantidad) || precio <= 0 || cantidad <= 0) {
        throw new Error("Por favor, ingresa un precio y una cantidad válidos.");
    }

    if (isNaN(descuento) || descuento < 0 || descuento > 100) {
        throw new Error("El descuento debe estar entre 0% y 100%.");
    }

    const subtotalBruto = precio * cantidad;
    const montoDescuento = subtotalBruto * (descuento / 100);
    const subtotalNeto = subtotalBruto - montoDescuento;
    const igv = subtotalNeto * 0.18;
    const total = subtotalNeto + igv;

    return {
        subtotalBruto: subtotalBruto.toFixed(2),
        montoDescuento: montoDescuento.toFixed(2),
        subtotalNeto: subtotalNeto.toFixed(2),
        igv: igv.toFixed(2),
        total: total.toFixed(2)
    };
}