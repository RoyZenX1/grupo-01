import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TarjetaEstudiante } from '../componentes/tarjeta-estudiante';
import type { Estudiante } from '../modelos/estudiante';
import { EstudiantesApi } from '../servicios/estudiantes-api';
import { mensajeHttp } from '../servicios/mensaje-http';

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