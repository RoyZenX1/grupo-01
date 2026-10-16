export type EstadoVehiculo =
    | 'Disponible'
    | 'En ruta'
    | 'Mantenimiento'
    | 'Fuera de servicio';

export interface Vehiculo {
    readonly id: string;
    readonly codigo?: string;
    readonly placa: string;
    readonly tipo: string;
    readonly capacidad: number;
    readonly estado: EstadoVehiculo;
}

export type BorradorVehiculo = Omit<Vehiculo, 'id' | 'estado'>;