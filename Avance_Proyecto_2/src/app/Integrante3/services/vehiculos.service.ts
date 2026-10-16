import { computed, Injectable, signal } from '@angular/core';
import { Vehiculo, EstadoVehiculo } from '../models/vehiculo.model';
import { Tarifa } from '../models/tarifa.model';

const MATRIZ_TARIFAS: number[][] = [
    [100, 150, 200],
    [180, 230, 280],
    [250, 300, 350],
];

@Injectable({ providedIn: 'root' })
export class VehiculosService {

    private readonly vehiculosSignal = signal<readonly Vehiculo[]>([]);
    readonly vehiculos = this.vehiculosSignal.asReadonly();

    readonly total = computed(() => this.vehiculosSignal().length);
    readonly disponibles = computed(() =>
        this.vehiculosSignal().filter(v => v.estado === 'Disponible').length,
    );
    readonly enRuta = computed(() =>
        this.vehiculosSignal().filter(v => v.estado === 'En ruta').length,
    );
    readonly codigoSiguiente = computed(() => {
        const codigos = this.vehiculosSignal()
            .map(v => v.codigo ?? v.id)
            .map(codigo => /^V(\d+)$/.exec(codigo))
            .filter((match): match is RegExpExecArray => match !== null)
            .map(match => Number(match[1]));
        const siguiente = codigos.length ? Math.max(...codigos) + 1 : 1;
        return `V${String(siguiente).padStart(3, '0')}`;
    });

    // Reemplaza la lista completa (llamado tras GET)
    reemplazarLista(lista: readonly Vehiculo[]): void {
        this.vehiculosSignal.set([...lista]);
    }

    // Actualiza un solo vehículo localmente (tras PATCH)
    actualizarLocal(v: Vehiculo): void {
        this.vehiculosSignal.update(lista =>
            lista.map(x => (x.id === v.id ? v : x)),
        );
    }

    agregarLocal(v: Vehiculo): void {
        this.vehiculosSignal.update(lista => [...lista, v]);
    }

    quitarLocal(id: string): void {
        this.vehiculosSignal.update(lista => lista.filter(x => x.id !== id));
    }

    // Validación de dominio (se ejecuta antes de llamar la API)
    validarBorrador(datos: {
        placa: string; tipo: string; capacidad: number;
    }): { placa: string; tipo: string; capacidad: number } {
        const placa = datos.placa.trim().toUpperCase();
        const capacidad = Number(datos.capacidad);

        if (!placa) throw new Error('La placa es obligatoria.');
        if (!datos.tipo) throw new Error('Selecciona un tipo de vehículo.');
        if (!Number.isFinite(capacidad) || capacidad <= 0) {
            throw new Error('La capacidad debe ser mayor que 0.');
        }
        if (!/^[A-Z]{3}-\d{3}$/.test(placa)) {
            throw new Error('La placa debe tener el formato ABC-123.');
        }
        if (this.vehiculosSignal().some(v => v.placa === placa)) {
            throw new Error('Ya existe un vehículo con esa placa.');
        }
        return { placa, tipo: datos.tipo, capacidad };
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
            throw new Error('Distancia o peso fuera de rango (máx. 200 km / 10 t).');
        }
        return { distancia: d, peso: p, precio: MATRIZ_TARIFAS[fila][columna] };
    }

    disponiblePorId(id: string): Vehiculo | undefined {
        return this.vehiculosSignal().find(v => v.id === id);
    }
}