import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { TarjetaEstudiante } from '../componentes/tarjeta-estudiante';
import type { Estudiante } from '../modelos/estudiante';
import {
  FILTRO_INICIAL,
  filtrarYOrdenar,
  type FiltroEstudiantes,
  type OpcionEstado,
  type OpcionPrograma,
  type OrdenEstudiantes,
} from '../modelos/filtro-estudiantes';
import { EstudiantesApi } from '../servicios/estudiantes-api';
import { mensajeHttp } from '../servicios/mensaje-http';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TarjetaEstudiante],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Estudiantes implements OnInit {
  private readonly api = inject(EstudiantesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly lista = signal<Estudiante[]>([]);
  readonly seleccionado = signal<Estudiante | null>(null);
  readonly pendiente = signal<Estudiante | null>(null);
  readonly cargando = signal(false);
  readonly eliminando = signal(false);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly mensaje = signal('');

  readonly filtros = new FormGroup({
    termino: new FormControl(FILTRO_INICIAL.termino, { nonNullable: true }),
    programa: new FormControl<OpcionPrograma>(FILTRO_INICIAL.programa, {
      nonNullable: true,
    }),
    estado: new FormControl<OpcionEstado>(FILTRO_INICIAL.estado, {
      nonNullable: true,
    }),
    orden: new FormControl<OrdenEstudiantes>(FILTRO_INICIAL.orden, {
      nonNullable: true,
    }),
  });

  private readonly filtroActual = toSignal(
    this.filtros.valueChanges.pipe(map(() => this.filtros.getRawValue())),
    { initialValue: this.filtros.getRawValue() },
  );

  readonly visibles = computed(() =>
    filtrarYOrdenar(this.lista(), this.filtroActual() as FiltroEstudiantes),
  );

  readonly hayFiltros = computed(() => {
    const filtro = this.filtroActual();
    return (
      filtro.termino.trim() !== '' ||
      filtro.programa !== 'Todos' ||
      filtro.estado !== 'Todos' ||
      filtro.orden !== 'nombre'
    );
  });

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

  limpiarFiltros(): void {
    this.filtros.setValue(FILTRO_INICIAL);
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
