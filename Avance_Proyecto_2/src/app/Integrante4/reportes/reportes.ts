import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { OrdenesApi } from '../../Integrante3/services/ordenes-api';
import { OrdenesService } from '../../Integrante3/services/ordenes.service';
import { mensajeHttp } from '../../Integrante3/services/mensaje-http';
import { EstadoOrden, Orden } from '../../Integrante3/models/orden.model';

type OrdenOrdenamiento = 'codigo-asc' | 'codigo-desc' | 'tarifa-asc' | 'tarifa-desc' | 'origen-asc' | 'estado-asc';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  private readonly ordenesService = inject(OrdenesService);
  private readonly ordenesApi = inject(OrdenesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly estados: EstadoOrden[] = this.ordenesService.estados;
  readonly ordenes = this.ordenesService.ordenes;
  readonly cargando = signal(false);
  readonly errorCarga = signal('');

  readonly texto = signal('');
  readonly montoMin = signal<number | null>(null);
  readonly montoMax = signal<number | null>(null);
  readonly ordenamiento = signal<OrdenOrdenamiento>('codigo-asc');
  readonly estadosSeleccionados = signal<EstadoOrden[]>([]);

  readonly ordenesFiltradas = computed(() => {
    const textoNormalizado = this.normalizar(this.texto().trim());
    const minimo = this.montoMin();
    const maximo = this.montoMax();
    const ordenamiento = this.ordenamiento();
    const estadosSeleccionados = this.estadosSeleccionados();

    const filtradas = this.ordenes().filter(orden => {
      const coincideTexto =!textoNormalizado || this.normalizar(
        `${orden.codigo?? orden.id} ${orden.cotizacionId} ${orden.vehiculoId} ${orden.origen} ${orden.destino}`
      ).includes(textoNormalizado);
      const coincideMinimo = minimo === null || orden.tarifa >= Number(minimo);
      const coincideMaximo = maximo === null || orden.tarifa <= Number(maximo);
      const coincideEstado = estadosSeleccionados.length === 0 || estadosSeleccionados.includes(orden.estado);
      return coincideTexto && coincideMinimo && coincideMaximo && coincideEstado;
    });

    return [...filtradas].sort((a, b) => this.comparar(a, b, ordenamiento));
  });

  readonly totalTarifas = computed(() => this.ordenesFiltradas().reduce((total, orden) => total + orden.tarifa, 0));
  readonly tarifaPromedio = computed(() => {
    const lista = this.ordenesFiltradas();
    return lista.length? this.totalTarifas() / lista.length : 0;
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
      porcentaje: this.ordenesFiltradas().length? lista.length / this.ordenesFiltradas().length * 100 : 0
    };
  }));

  readonly resumenRutas = computed(() => {
    const mapa = new Map<string, { ruta: string; cantidad: number; monto: number }>();
    for (const orden of this.ordenesFiltradas()) {
      const ruta = this.ruta(orden);
      const grupo = mapa.get(ruta)?? { ruta, cantidad: 0, monto: 0 };
      grupo.cantidad++;
      grupo.monto += orden.tarifa;
      mapa.set(ruta, grupo);
    }
    return [...mapa.values()].sort((a, b) => b.monto - a.monto);
  });

  readonly cotizacionesFrecuentes = computed(() => {
    const mapa = new Map<string, { cotizacion: string; cantidad: number; monto: number }>();
    for (const orden of this.ordenesFiltradas()) {
      const grupo = mapa.get(orden.cotizacionId)?? { cotizacion: orden.cotizacionId, cantidad: 0, monto: 0 };
      grupo.cantidad++;
      grupo.monto += orden.tarifa;
      mapa.set(orden.cotizacionId, grupo);
    }
    return [...mapa.values()].sort((a, b) => b.monto - a.monto).slice(0, 5);
  });

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.errorCarga.set('');

    this.ordenesApi.listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: ordenes => this.ordenesService.reemplazarLista(ordenes),
        error: error => this.errorCarga.set(mensajeHttp(error)),
      });
  }

  alternarEstado(estado: EstadoOrden): void {
    const actuales = this.estadosSeleccionados();
    this.estadosSeleccionados.set(actuales.includes(estado)? actuales.filter(item => item!== estado) : [...actuales, estado]);
  }
  tieneEstado(estado: EstadoOrden): boolean { return this.estadosSeleccionados().includes(estado); }
  limpiarFiltros(): void {
    this.texto.set(''); this.montoMin.set(null); this.montoMax.set(null);
    this.ordenamiento.set('codigo-asc'); this.estadosSeleccionados.set([]);
  }
  ruta(orden: Orden): string { return `${orden.origen} → ${orden.destino}`; }
  claseEstado(estado: EstadoOrden): string {
    const clases: Record<EstadoOrden, string> = {
      'Pendiente': 'pendiente', 'Programada': 'programada', 'En ruta': 'en-ruta',
      'Completada': 'completada', 'Cancelada': 'cancelada'
    };
    return clases[estado];
  }
  private normalizar(texto: string): string {
    return texto.toLocaleLowerCase('es-PE').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  private comparar(a: Orden, b: Orden, ordenamiento: OrdenOrdenamiento): number {
    switch (ordenamiento) {
      case 'codigo-desc': return (b.codigo?? b.id).localeCompare(a.codigo?? a.id, 'es', { numeric: true });
      case 'codigo-asc': return (a.codigo?? a.id).localeCompare(b.codigo?? b.id, 'es', { numeric: true });
      case 'tarifa-asc': return a.tarifa - b.tarifa;
      case 'tarifa-desc': return b.tarifa - a.tarifa;
      case 'origen-asc': return a.origen.localeCompare(b.origen, 'es');
      case 'estado-asc': return a.estado.localeCompare(b.estado, 'es');
      default: return (a.codigo?? a.id).localeCompare(b.codigo?? b.id, 'es', { numeric: true });
    }
  }
}