import { Injectable, signal } from '@angular/core';
import { Orden, EstadoOrden } from '../models/orden.model';
import { ORDENES_INICIALES } from '../models/datos-iniciales';
import { VehiculosService } from './vehiculos.service';

@Injectable({ providedIn: 'root' })
export class OrdenesService {

    private ordenesSignal = signal<Orden[]>(
        ORDENES_INICIALES.map(o => ({ ...o }))
    );

    readonly ordenes = this.ordenesSignal.asReadonly();

    readonly estados: EstadoOrden[] = [
        'Pendiente', 'Programada', 'En ruta', 'Completada', 'Cancelada'
    ];

    constructor(private vehiculosService: VehiculosService) {}

    registrar(datos: {
        id: string;
        cotizacionId: string;
        vehiculoId: string;
        origen: string;
        destino: string;
        distancia: number;
        peso: number;
    }): Orden {
        const id = datos.id.trim();
        const cotizacionId = datos.cotizacionId.trim();
        const vehiculoId = datos.vehiculoId.trim();
        const origen = datos.origen.trim();
        const destino = datos.destino.trim();
        const distancia = Number(datos.distancia);
        const peso = Number(datos.peso);

        if (!id || !cotizacionId || !vehiculoId) {
            throw new Error('La orden necesita ID, cotización y vehículo.');
        }
        if (!origen || !destino) {
            throw new Error('La orden necesita origen y destino.');
        }
        if (!Number.isFinite(distancia) || distancia <= 0) {
            throw new Error('La distancia debe ser mayor que 0.');
        }
        if (!Number.isFinite(peso) || peso <= 0) {
            throw new Error('El peso debe ser mayor que 0.');
        }

        // Validar que el vehículo exista
        const vehiculoExiste = this.vehiculosService.vehiculos()
            .some(v => v.id === vehiculoId);
        if (!vehiculoExiste) {
            throw new Error(`El vehículo "${vehiculoId}" no existe.`);
        }

        // Validar ID único
        if (this.ordenesSignal().some(o => o.id === id)) {
            throw new Error('Ya existe una orden con ese ID.');
        }

        // Calcular tarifa automáticamente
        const tarifa = this.vehiculosService.calcularTarifa(distancia, peso);

        const nueva: Orden = {
            id,
            cotizacionId,
            vehiculoId,
            origen,
            destino,
            distancia,
            peso,
            tarifa: tarifa.precio,
            estado: 'Pendiente'
        };

        this.ordenesSignal.update(l => [...l, nueva]);
        return nueva;
    }

    cambiarEstado(id: string, nuevoEstado: EstadoOrden): void {
        const lista = this.ordenesSignal();
        const index = lista.findIndex(o => o.id === id);
        if (index === -1) throw new Error('Orden no encontrada.');

        const actualizadas = [...lista];
        actualizadas[index] = { ...actualizadas[index], estado: nuevoEstado };
        this.ordenesSignal.set(actualizadas);
    }

    eliminar(id: string): void {
        const lista = this.ordenesSignal();
        if (!lista.some(o => o.id === id)) {
            throw new Error('Orden no encontrada.');
        }
        this.ordenesSignal.set(lista.filter(o => o.id !== id));
    }

    restaurar(): void {
        this.ordenesSignal.set(ORDENES_INICIALES.map(o => ({ ...o })));
    }
}