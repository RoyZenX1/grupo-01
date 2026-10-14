export interface Cotizacion {
    id?: number | string;
    clienteId: string; 
    productoServicio: string;
    precioUnitario: number;
    cantidad: number;
    descuentoPorcentaje: number;
    subtotal: number;
    baseImponible: number;
    igv: number;
    total: number;
    fechaEmision: string;
}