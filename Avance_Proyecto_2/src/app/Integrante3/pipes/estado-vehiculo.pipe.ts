import { Pipe, PipeTransform } from '@angular/core';
import type { EstadoVehiculo } from '../models/vehiculo.model';

@Pipe({ name: 'estadoVehiculo', standalone: true })
export class EstadoVehiculoPipe implements PipeTransform {
    transform(estado: EstadoVehiculo): string {
        switch (estado) {
            case 'Disponible': return 'Disponible';
            case 'En ruta': return 'En ruta';
            case 'Mantenimiento': return 'En mantenimiento';
            case 'Fuera de servicio': return 'Fuera de servicio';
            default: return estado;
        }
    }
}