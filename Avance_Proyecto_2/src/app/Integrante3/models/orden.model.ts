export type EstadoOrden =
    | 'Pendiente'
    | 'Programada'
    | 'En ruta'
    | 'Completada'
    | 'Cancelada';

export interface Orden {
    readonly id: string;
    readonly codigo?: string;
    readonly cotizacionId: string;
    readonly vehiculoId: string;
    readonly origen: string;
    readonly destino: string;
    readonly distancia: number;
    readonly peso: number;
    readonly tarifa: number;
    readonly estado: EstadoOrden;
}

export type BorradorOrden = Omit<Orden, 'id' | 'codigo' | 'tarifa' | 'estado'>;