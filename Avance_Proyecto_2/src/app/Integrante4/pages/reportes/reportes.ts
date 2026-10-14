import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../../Integrante3/services/ordenes.service';
import { EstadoOrden, Orden } from '../../../Integrante3/models/orden.model';

type OrdenOrdenamiento = 'id-asc' | 'id-desc' | 'tarifa-asc' | 'tarifa-desc' | 'origen-asc' | 'estado-asc';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  private readonly ordenesService = inject(OrdenesService);

  readonly estados: EstadoOrden[] = this.ordenesService.estados;
  readonly ordenes = this.ordenesService.ordenes;

  readonly texto = signal('');
  readonly montoMin = signal<number | null>(null);
  readonly montoMax = signal<number | null>(null);
  readonly ordenamiento = signal<OrdenOrdenamiento>('id-asc');
  readonly estadosSeleccionados = signal<EstadoOrden[]>([]);

  readonly ordenesFiltradas = computed(() => {
    const textoNormalizado = this.normalizar(this.texto().trim());
    const minimo = this.montoMin();
    const maximo = this.montoMax();
    const ordenamiento = this.ordenamiento();
    const estadosSeleccionados = this.estadosSeleccionados();

    const filtradas = this.ordenes().filter(orden => {
      const coincideTexto = !textoNormalizado || this.normalizar(
        `${orden.id} ${orden.cotizacionId} ${orden.vehiculoId} ${orden.origen} ${orden.destino}`
      ).includes(textoNormalizado);
      const coincideMinimo = minimo === null || minimo === undefined || orden.tarifa >= Number(minimo);
      const coincideMaximo = maximo === null || maximo === undefined || orden.tarifa <= Number(maximo);
      const coincideEstado = estadosSeleccionados.length === 0 || estadosSeleccionados.includes(orden.estado);
      return coincideTexto && coincideMinimo && coincideMaximo && coincideEstado;
    });

    return [...filtradas].sort((a, b) => this.comparar(a, b, ordenamiento));
  });

  readonly totalTarifas = computed(() => this.ordenesFiltradas().reduce((total, orden) => total + orden.tarifa, 0));
  readonly tarifaPromedio = computed(() => {
    const lista = this.ordenesFiltradas();
    return lista.length ? this.totalTarifas() / lista.length : 0;
  });
  readonly cotizacionesVinculadas = computed(() => new Set(this.ordenesFiltradas().map(o => o.cotizacionId)).size);
  readonly rutasUnicas = computed(() => new Set(this.ordenesFiltradas().map(o => this.ruta(o))).size);
  readonly enCurso = computed(() => this.ordenesFiltradas().filter(o => o.estado === 'En ruta' || o.estado === 'Programada').length);

  readonly resumenEstados = computed(() => this.estados.map(estado => {
    const lista = this.ordenesFiltradas().filter(o => o.estado === estado);
    return {
      estado,
      cantidad: lista.length,
      monto: lista.reduce((total, orden) => total + orden.tarifa, 0),
      porcentaje: this.ordenesFiltradas().length ? lista.length / this.ordenesFiltradas().length * 100 : 0
    };
  }));

  readonly resumenRutas = computed(() => {
    const mapa = new Map<string, { ruta: string; cantidad: number; monto: number }>();
    for (const orden of this.ordenesFiltradas()) {
      const ruta = this.ruta(orden);
      const grupo = mapa.get(ruta) ?? { ruta, cantidad: 0, monto: 0 };
      grupo.cantidad++;
      grupo.monto += orden.tarifa;
      mapa.set(ruta, grupo);
    }
    return [...mapa.values()].sort((a, b) => b.monto - a.monto);
  });

  readonly cotizacionesFrecuentes = computed(() => {
    const mapa = new Map<string, { cotizacion: string; cantidad: number; monto: number }>();
    for (const orden of this.ordenesFiltradas()) {
      const grupo = mapa.get(orden.cotizacionId) ?? { cotizacion: orden.cotizacionId, cantidad: 0, monto: 0 };
      grupo.cantidad++;
      grupo.monto += orden.tarifa;
      mapa.set(orden.cotizacionId, grupo);
    }
    return [...mapa.values()].sort((a, b) => b.monto - a.monto).slice(0, 5);
  });

  alternarEstado(estado: EstadoOrden): void {
    const actuales = this.estadosSeleccionados();
    this.estadosSeleccionados.set(actuales.includes(estado)
      ? actuales.filter(item => item !== estado)
      : [...actuales, estado]);
  }

  tieneEstado(estado: EstadoOrden): boolean {
    return this.estadosSeleccionados().includes(estado);
  }

  limpiarFiltros(): void {
    this.texto.set('');
    this.montoMin.set(null);
    this.montoMax.set(null);
    this.ordenamiento.set('id-asc');
    this.estadosSeleccionados.set([]);
  }

  ruta(orden: Orden): string {
    return `${orden.origen} → ${orden.destino}`;
  }

  claseEstado(estado: EstadoOrden): string {
    const clases: Record<EstadoOrden, string> = {
      'Pendiente': 'pendiente',
      'Programada': 'programada',
      'En ruta': 'en-ruta',
      'Completada': 'completada',
      'Cancelada': 'cancelada'
    };
    return clases[estado];
  }

  private normalizar(texto: string): string {
    return texto.toLocaleLowerCase('es-PE').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private comparar(a: Orden, b: Orden, ordenamiento: OrdenOrdenamiento): number {
    switch (ordenamiento) {
      case 'id-desc': return b.id.localeCompare(a.id, 'es', { numeric: true });
      case 'tarifa-asc': return a.tarifa - b.tarifa;
      case 'tarifa-desc': return b.tarifa - a.tarifa;
      case 'origen-asc': return a.origen.localeCompare(b.origen, 'es');
      case 'estado-asc': return a.estado.localeCompare(b.estado, 'es');
      case 'id-asc':
      default: return a.id.localeCompare(b.id, 'es', { numeric: true });
    }
  }
}
