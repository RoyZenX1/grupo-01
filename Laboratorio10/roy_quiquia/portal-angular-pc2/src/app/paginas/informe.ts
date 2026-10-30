import { DecimalPipe, PercentPipe } from '@angular/common';
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
import type { Estudiante, Programa } from '../modelos/estudiante';
import { estadoAcademico } from '../modelos/estudiante';
import { EstudiantesApi } from '../servicios/estudiantes-api';
import { mensajeHttp } from '../servicios/mensaje-http';

interface FilaInforme {
  readonly programa: Programa;
  readonly total: number;
  readonly promedio: number;
  readonly asistencia: number;
  readonly enRiesgo: number;
}

@Component({
  standalone: true,
  imports: [DecimalPipe, PercentPipe, RouterLink],
  templateUrl: './informe.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Informe implements OnInit {
  private readonly api = inject(EstudiantesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly lista = signal<Estudiante[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly filas = computed<FilaInforme[]>(() =>
    (['Software', 'Sistemas'] as const).map((programa) => {
      const grupo = this.lista().filter((e) => e.programa === programa);
      return {
        programa,
        total: grupo.length,
        promedio: this.media(grupo.map((e) => e.promedio)),
        asistencia: this.media(grupo.map((e) => e.asistencia)),
        enRiesgo: grupo.filter((e) => estadoAcademico(e.promedio) === 'En riesgo').length,
      };
    }),
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

  private media(valores: readonly number[]): number {
    return valores.length ? valores.reduce((suma, valor) => suma + valor, 0) / valores.length : 0;
  }
}
