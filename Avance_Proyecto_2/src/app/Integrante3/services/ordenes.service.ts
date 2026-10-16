import { computed, inject, Injectable, signal } from '@angular/core';
import { Orden, EstadoOrden } from '../models/orden.model';
import { Cotizacion } from '../models/cotizacion.model';
import { VehiculosService } from './vehiculos.service';

@Injectable({ providedIn: 'root' })
export class OrdenesService {

    private readonly vehiculosService = inject(VehiculosService);

    private readonly ordenesSignal = signal<readonly Orden[]>([]);
    readonly ordenes = this.ordenesSignal.asReadonly();

    private readonly cotizacionesSignal = signal<readonly Cotizacion[]>([]);
    readonly cotizacionesAprobadas = computed(() =>
        this.cotizacionesSignal().filter(c => c.estado === 'Aprobada'),
    );

    readonly estados: EstadoOrden[] = [
        'Pendiente', 'Programada', 'En ruta', 'Completada', 'Cancelada',
    ];
    readonly codigoSiguiente = computed(() => {
        const codigos = this.ordenesSignal()
            .map(o => o.codigo ?? o.id)
            .map(codigo => /^ORD(\d+)$/.exec(codigo))
            .filter((match): match is RegExpExecArray => match !== null)
            .map(match => Number(match[1]));
        const siguiente = codigos.length ? Math.max(...codigos) + 1 : 1;
        return `ORD${String(siguiente).padStart(3, '0')}`;
    });

    reemplazarLista(lista: readonly Orden[]): void {
        this.ordenesSignal.set([...lista]);
    }

    reemplazarCotizaciones(lista: readonly Cotizacion[]): void {
        this.cotizacionesSignal.set([...lista]);
    }

    agregarLocal(o: Orden): void {
        this.ordenesSignal.update(l => [...l, o]);
    }

    actualizarLocal(o: Orden): void {
        this.ordenesSignal.update(l => l.map(x => (x.id === o.id ? o : x)));
    }

    quitarLocal(id: string): void {
        this.ordenesSignal.update(l => l.filter(x => x.id !== id));
    }

    /**
     * Valida y construye el borrador de la orden.
     * Reglas: cotización aprobada + vehículo disponible + peso ≤ capacidad.
     */
    prepararBorrador(datos: {
        cotizacionId: string; vehiculoId: string;
        origen: string; destino: string; distancia: number; peso: number;
    }): {
        borrador: Omit<Orden, 'id' | 'codigo' | 'tarifa' | 'estado'>;
        tarifaCalculada: number;
    } {
        const cotizacionId = datos.cotizacionId.trim();
        const vehiculoId = datos.vehiculoId.trim();
        const origen = datos.origen.trim();
        const destino = datos.destino.trim();
        const distancia = Number(datos.distancia);
        const peso = Number(datos.peso);

        if (!cotizacionId) throw new Error('Selecciona una cotización aprobada.');
        if (!vehiculoId) throw new Error('Selecciona un vehículo.');
        if (origen.length < 3 || origen.length > 80) {
            throw new Error('El origen debe tener entre 3 y 80 caracteres.');
        }
        if (destino.length < 3 || destino.length > 80) {
            throw new Error('El destino debe tener entre 3 y 80 caracteres.');
        }
        if (!Number.isFinite(distancia) || distancia <= 0) {
            throw new Error('La distancia debe ser mayor que 0.');
        }
        if (!Number.isFinite(peso) || peso <= 0) {
            throw new Error('El peso debe ser mayor que 0.');
        }
        const cotizacion = this.cotizacionesSignal().find(c => c.id === cotizacionId);
        if (!cotizacion) throw new Error('La cotización no existe.');
        if (cotizacion.estado !== 'Aprobada') {
            throw new Error('Solo se pueden registrar órdenes de cotizaciones aprobadas.');
        }

        const vehiculo = this.vehiculosService.disponiblePorId(vehiculoId);
        if (!vehiculo) throw new Error(`El vehículo "${vehiculoId}" no existe.`);
        if (vehiculo.estado !== 'Disponible') {
            throw new Error(`El vehículo ${vehiculo.placa} no está disponible (${vehiculo.estado}).`);
        }
        if (peso > vehiculo.capacidad) {
            throw new Error(`El peso (${peso} t) excede la capacidad de ${vehiculo.placa} (${vehiculo.capacidad} t).`);
        }

        const { precio } = this.vehiculosService.calcularTarifa(distancia, peso);

        return {
            borrador: {
                cotizacionId, vehiculoId, origen, destino,
                distancia, peso,
            },
            tarifaCalculada: precio,
        };
    }
}