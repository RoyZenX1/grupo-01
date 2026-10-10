import { Injectable, signal, computed } from '@angular/core';
import { Vehiculo, EstadoVehiculo } from '../models/vehiculo.model';
import { Tarifa } from '../models/tarifa.model';
import { VEHICULOS_INICIALES } from '../models/datos-iniciales';

const MATRIZ_TARIFAS: number[][] = [
    [100, 150, 200],
    [180, 230, 280],
    [250, 300, 350]
];

@Injectable({ providedIn: 'root' })
export class VehiculosService {

    private vehiculosSignal = signal<Vehiculo[]>(
        VEHICULOS_INICIALES.map(v => ({ ...v }))
    );

    readonly vehiculos = this.vehiculosSignal.asReadonly();
    readonly total = computed(() => this.vehiculosSignal().length);
    readonly disponibles = computed(() =>
        this.vehiculosSignal().filter(v => v.estado === 'Disponible').length
    );
    readonly enRuta = computed(() =>
        this.vehiculosSignal().filter(v => v.estado === 'En ruta').length
    );

    registrar(datos: { id: string; placa: string; tipo: string; capacidad: number }): Vehiculo {
        const id = datos.id.trim();
        const placa = datos.placa.trim().toUpperCase();
        const capacidad = Number(datos.capacidad);

        if (!id || !placa || !datos.tipo) {
            throw new Error('Todos los campos son obligatorios.');
        }
        if (!Number.isFinite(capacidad) || capacidad <= 0) {
            throw new Error('La capacidad debe ser mayor que 0.');
        }
        if (!/^[A-Z]{3}-\d{3}$/.test(placa)) {
            throw new Error('La placa debe tener el formato ABC-123.');
        }

        const lista = this.vehiculosSignal();
        if (lista.some(v => v.id === id)) {
            throw new Error('Ya existe un vehículo con ese ID.');
        }
        if (lista.some(v => v.placa === placa)) {
            throw new Error('Ya existe un vehículo con esa placa.');
        }

        const nuevo: Vehiculo = {
            id, placa,
            tipo: datos.tipo,
            capacidad,
            estado: 'Disponible'
        };

        this.vehiculosSignal.update(l => [...l, nuevo]);
        return nuevo;
    }

    cambiarEstado(id: string, nuevoEstado: EstadoVehiculo): void {
        const lista = this.vehiculosSignal();
        const index = lista.findIndex(v => v.id === id);
        if (index === -1) throw new Error('Vehículo no encontrado.');

        const actualizados = [...lista];
        actualizados[index] = { ...actualizados[index], estado: nuevoEstado };
        this.vehiculosSignal.set(actualizados);
    }

    eliminar(id: string): void {
        const lista = this.vehiculosSignal();
        if (!lista.some(v => v.id === id)) {
            throw new Error('Vehículo no encontrado.');
        }
        this.vehiculosSignal.set(lista.filter(v => v.id !== id));
    }

    restaurar(): void {
        this.vehiculosSignal.set(VEHICULOS_INICIALES.map(v => ({ ...v })));
    }

    calcularTarifa(distancia: number, peso: number): Tarifa {
        const d = Number(distancia);
        const p = Number(peso);

        if (!Number.isFinite(d) || !Number.isFinite(p)) {
            throw new Error('Distancia y peso deben ser números.');
        }
        if (d <= 0 || p <= 0) {
            throw new Error('Distancia y peso deben ser mayores que 0.');
        }

        const fila = d <= 50 ? 0 : d <= 100 ? 1 : d <= 200 ? 2 : -1;
        const columna = p <= 3 ? 0 : p <= 7 ? 1 : p <= 10 ? 2 : -1;

        if (fila === -1 || columna === -1) {
            throw new Error('La distancia o el peso están fuera del rango permitido.');
        }

        return { distancia: d, peso: p, precio: MATRIZ_TARIFAS[fila][columna] };
    }
}