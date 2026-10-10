export type EstadoVehiculo = 'Disponible' | 'En ruta' | 'Mantenimiento' | 'Fuera de servicio';

export interface Vehiculo {
    id: string;
    placa: string;
    tipo: string;
    capacidad: number;
    estado: EstadoVehiculo;
}
