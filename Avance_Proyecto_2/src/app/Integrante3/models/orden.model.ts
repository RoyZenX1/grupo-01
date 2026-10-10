export type EstadoOrden = 'Pendiente' | 'Programada' | 'En ruta' | 'Completada' | 'Cancelada';

export interface Orden {
    id: string;
    cotizacionId: string;
    vehiculoId: string;
    origen: string;
    destino: string;
    distancia: number;
    peso: number;
    tarifa: number;
    estado: EstadoOrden;
}