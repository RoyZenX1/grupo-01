import { Vehiculo } from '../../Integrante3/models/vehiculo.model';
import { Orden } from '../../Integrante3/models/orden.model';
import { Cotizacion } from '../../Integrante3/models/cotizacion.model';

export const VEHICULOS_INICIALES: readonly Vehiculo[] = [
    { id: 'V001', placa: 'ABC-123', tipo: 'Camión',    capacidad: 10, estado: 'Disponible' },
    { id: 'V002', placa: 'DEF-456', tipo: 'Furgón',    capacidad: 7,  estado: 'Disponible' },
    { id: 'V003', placa: 'GHI-789', tipo: 'Camioneta', capacidad: 3,  estado: 'Disponible' },
];

export const COTIZACIONES_INICIALES: readonly Cotizacion[] = [
    { id: 'C001', cliente: 'Minera Sur',   origen: 'Lima', destino: 'Callao',     distancia: 25, peso: 2, tarifa: 100, estado: 'Aprobada' },
    { id: 'C002', cliente: 'Agro Norte',   origen: 'Ate',  destino: 'Miraflores', distancia: 50, peso: 5, tarifa: 230, estado: 'Aprobada' },
    { id: 'C003', cliente: 'Textil Centro',origen: 'Lima', destino: 'Chorrillos', distancia: 80, peso: 3, tarifa: 150, estado: 'Aprobada' },
    { id: 'C004', cliente: 'Pesquera Callao', origen: 'Callao', destino: 'Lima', distancia: 30, peso: 4, tarifa: 180, estado: 'Pendiente' },
];

export const ORDENES_INICIALES: readonly Orden[] = [];