import { Injectable, computed, inject } from '@angular/core';
import { VehiculosService } from '../../Integrante3/services/vehiculos.service';
import { OrdenesService } from '../../Integrante3/services/ordenes.service';
import { EstadoVehiculo } from '../../Integrante3/models/vehiculo.model';
import { EstadoOrden, Orden } from '../../Integrante3/models/orden.model';
import { ItemDistribucion, ResumenFlota, ResumenOrdenes } from '../models/dashboard.model';

const ESTADOS_VEHICULO: readonly EstadoVehiculo[] = [
    'Disponible', 'En ruta', 'Mantenimiento', 'Fuera de servicio'
];

const ESTADOS_ORDEN_ACTIVOS: readonly EstadoOrden[] = ['Pendiente', 'Programada', 'En ruta'];

/**
 * Cuenta cuántos valores hay en cada categoría y calcula su porcentaje.
 * Las categorías sin elementos se incluyen con cantidad 0 y mantienen el orden dado.
 */
export function distribuir<T extends string>(
    valores: readonly T[],
    categorias: readonly T[]
): ItemDistribucion[] {
    const conteo = valores.reduce(
        (mapa, valor) => mapa.set(valor, (mapa.get(valor) ?? 0) + 1),
        new Map<T, number>()
    );
    const total = valores.length;

    return categorias.map(categoria => {
        const cantidad = conteo.get(categoria) ?? 0;
        return {
            etiqueta: categoria,
            cantidad,
            porcentaje: total === 0 ? 0 : Math.round((cantidad / total) * 100)
        };
    });
}

/**
 * Reúne los indicadores del dashboard a partir de los servicios de
 * vehículos y órdenes (Integrante 3). Todo se calcula con `computed`, así
 * que el panel se actualiza solo cuando esos datos cambian.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
    private vehiculosService = inject(VehiculosService);
    private ordenesService = inject(OrdenesService);

    readonly flota = computed<ResumenFlota>(() => ({
        total: this.vehiculosService.total(),
        disponibles: this.vehiculosService.disponibles(),
        enRuta: this.vehiculosService.enRuta()
    }));

    readonly estadosFlota = computed(() =>
        distribuir(
            this.vehiculosService.vehiculos().map(v => v.estado),
            ESTADOS_VEHICULO
        )
    );

    readonly estadosOrdenes = computed(() =>
        distribuir(
            this.ordenesService.ordenes().map(o => o.estado),
            this.ordenesService.estados
        )
    );

    readonly ordenes = computed<ResumenOrdenes>(() => {
        const lista = this.ordenesService.ordenes();
        return {
            total: lista.length,
            activas: lista.filter(o => ESTADOS_ORDEN_ACTIVOS.includes(o.estado)).length,
            completadas: lista.filter(o => o.estado === 'Completada').length,
            // Las órdenes canceladas no generan ingreso
            ingresos: lista
                .filter(o => o.estado !== 'Cancelada')
                .reduce((suma, o) => suma + o.tarifa, 0)
        };
    });

    /** Las cinco órdenes más recientes (la última registrada primero). */
    readonly ultimasOrdenes = computed<Orden[]>(() =>
        [...this.ordenesService.ordenes()].reverse().slice(0, 5)
    );
}
