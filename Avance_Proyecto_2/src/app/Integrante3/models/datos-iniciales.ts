import { Vehiculo } from './vehiculo.model';
import { Orden } from './orden.model';

export const VEHICULOS_INICIALES: Vehiculo[] = [
    { id: 'V001', placa: 'ABC-123', tipo: 'Camión',    capacidad: 10, estado: 'Disponible' },
    { id: 'V002', placa: 'DEF-456', tipo: 'Furgón',    capacidad: 7,  estado: 'Disponible' },
    { id: 'V003', placa: 'GHI-789', tipo: 'Camioneta', capacidad: 3,  estado: 'Disponible' }
];

export const ORDENES_INICIALES: Orden[] = [
    { id: 'O001', cotizacionId: 'C001', vehiculoId: 'V001', origen: 'Lima', destino: 'Callao',     distancia: 25, peso: 2, tarifa: 100, estado: 'Pendiente' },
    { id: 'O002', cotizacionId: 'C002', vehiculoId: 'V002', origen: 'Ate',  destino: 'Miraflores', distancia: 50, peso: 5, tarifa: 230, estado: 'Programada' },
    { id: 'O003', cotizacionId: 'C003', vehiculoId: 'V003', origen: 'Lima', destino: 'Chorrillos', distancia: 80, peso: 3, tarifa: 150, estado: 'En ruta' }
];