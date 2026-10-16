export type EstadoCotizacion = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface CotizacionTransporte {
    readonly id: string;
    readonly cliente: string;
    readonly origen: string;
    readonly destino: string;
    readonly distancia: number;
    readonly peso: number;
    readonly tarifa: number;
    readonly estado: EstadoCotizacion;
}