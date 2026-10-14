/** Una categoría con su cantidad y su peso relativo (para dibujar barras). */
export interface ItemDistribucion {
    etiqueta: string;
    cantidad: number;
    porcentaje: number;
}

export interface ResumenFlota {
    total: number;
    disponibles: number;
    enRuta: number;
}

export interface ResumenOrdenes {
    total: number;
    activas: number;
    completadas: number;
    ingresos: number;
}
