import { DatePipe, DecimalPipe } from '@angular/common';
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
import { PanelIndicador } from '../componentes/panel-indicador';
import { estadoAcademico, type Estudiante } from '../modelos/estudiante';
import { EstudiantesApi } from '../servicios/estudiantes-api';
import { mensajeHttp } from '../servicios/mensaje-http';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, PanelIndicador, RouterLink],
  templateUrl: './resumen.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Resumen implements OnInit {
  private readonly api = inject(EstudiantesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly lista = signal<Estudiante[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly fecha = new Date();

  readonly total = computed(() => this.lista().length);
  readonly promedio = computed(() =>
    this.total() ? this.lista().reduce((suma, e) => suma + e.promedio, 0) / this.total() : 0,
  );
  readonly asistencia = computed(() =>
    this.total() ? this.lista().reduce((suma, e) => suma + e.asistencia, 0) / this.total() : 0,
  );
  readonly destacados = computed(
    () => this.lista().filter((e) => estadoAcademico(e.promedio) === 'Destacado').length,
  );
  readonly enRiesgo = computed(
    () => this.lista().filter((e) => estadoAcademico(e.promedio) === 'En riesgo').length,
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');
    this.api
      .listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (datos) => this.lista.set(datos),
        error: (error) => this.error.set(mensajeHttp(error)),
      });
  }
}
