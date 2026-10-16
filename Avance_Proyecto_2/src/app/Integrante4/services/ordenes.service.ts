import { Injectable, signal } from '@angular/core';
import { EstadoOrden, Orden } from '../models/orden.model';

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  readonly estados: EstadoOrden[] = ['Pendiente', 'Programada', 'En ruta', 'Completada', 'Cancelada'];

  readonly ordenes = signal<Orden[]>([
    { id: '1', codigo: 'O001', cotizacionId: 'COT-001', vehiculoId: 'VH-01', origen: 'Lima', destino: 'Callao', distancia: 15, peso: 2.5, tarifa: 150, estado: 'Pendiente' },
    { id: '2', codigo: 'O002', cotizacionId: 'COT-002', vehiculoId: 'VH-02', origen: 'Lima', destino: 'Trujillo', distancia: 560, peso: 5, tarifa: 1200, estado: 'En ruta' },
    { id: '3', codigo: 'O003', cotizacionId: 'COT-001', vehiculoId: 'VH-03', origen: 'Arequipa', destino: 'Cusco', distancia: 320, peso: 3, tarifa: 850, estado: 'Programada' },
    { id: '4', codigo: 'O004', cotizacionId: 'COT-003', vehiculoId: 'VH-01', origen: 'Lima', destino: 'Piura', distancia: 900, peso: 8, tarifa: 2100, estado: 'Completada' },
    { id: '5', codigo: 'O005', cotizacionId: 'COT-004', vehiculoId: 'VH-04', origen: 'Callao', destino: 'Lima', distancia: 15, peso: 1, tarifa: 120, estado: 'Cancelada' },
  ]);
}