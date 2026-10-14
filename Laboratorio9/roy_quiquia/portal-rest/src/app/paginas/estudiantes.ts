import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TarjetaEstudiante } from '../componentes/tarjeta-estudiante';
import type { Estudiante, Programa } from '../modelos/estudiante';
import { EstudiantesApi } from '../servicios/estudiantes-api';
import { mensajeHttp } from '../servicios/mensaje-http';

export type FiltroPrograma = 'todos' | Programa;

function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

@Component({
  standalone: true,
  imports: [RouterLink, TarjetaEstudiante],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Estudiantes implements OnInit {
  private readonly api = inject(EstudiantesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly lista = signal<Estudiante[]>([]);
  readonly filtroNombre = signal('');
  readonly filtroPrograma = signal<FiltroPrograma>('todos');
  readonly listaFiltrada = computed(() => {
    const nombre = normalizarTexto(this.filtroNombre());
    const programa = this.filtroPrograma();
    return this.lista().filter((e) => {
      const coincideNombre =
        !nombre || normalizarTexto(e.nombre).includes(nombre);
      const coincidePrograma = programa === 'todos' || e.programa === programa;
      return coincideNombre && coincidePrograma;
    });
  });
  readonly seleccionado = signal<Estudiante | null>(null);
  readonly pendiente = signal<Estudiante | null>(null);
  readonly cargando = signal(false);
  readonly eliminando = signal(false);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly mensaje = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando() || this.eliminando()) return;
    this.cargando.set(true);
    this.errorCarga.set('');
    this.api
      .listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (datos) => {
          this.lista.set(datos);
          this.seleccionado.set(null);
        },
        error: (error) => this.errorCarga.set(mensajeHttp(error)),
      });
  }

  seleccionar(estudiante: Estudiante): void {
    this.seleccionado.set(estudiante);
  }

  actualizarFiltroNombre(evento: Event): void {
    this.filtroNombre.set((evento.target as HTMLInputElement).value);
  }

  actualizarFiltroPrograma(evento: Event): void {
    this.filtroPrograma.set(
      (evento.target as HTMLSelectElement).value as FiltroPrograma,
    );
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroPrograma.set('todos');
  }

  confirmarEliminacion(): void {
    const e = this.pendiente();
    if (!e || this.eliminando() || this.cargando()) return;
    this.eliminando.set(true);
    this.errorAccion.set('');
    this.mensaje.set('');
    this.api
      .eliminar(e.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.eliminando.set(false)),
      )
      .subscribe({
        next: () => {
          this.lista.update((lista) => lista.filter((x) => x.id !== e.id));
          if (this.seleccionado()?.id === e.id) this.seleccionado.set(null);
          this.pendiente.set(null);
          this.mensaje.set(`Se eliminó a ${e.nombre}.`);
        },
        error: (error) => this.errorAccion.set(mensajeHttp(error)),
      });
  }
}
