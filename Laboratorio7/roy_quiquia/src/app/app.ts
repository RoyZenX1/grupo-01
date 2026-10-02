import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ESTUDIANTES_INICIALES } from './datos/estudiantes';
import { ResaltarRiesgoDirective } from './directivas/resaltar-riesgo.directive';
import type { EstadoAcademico } from './modelos/estudiante';

type FiltroEstado = 'todos' | 'aprobados' | 'riesgo';

@Component({
  imports: [ResaltarRiesgoDirective],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly titulo = 'Panel de seguimiento académico';
  protected readonly estudiantes = signal(ESTUDIANTES_INICIALES);
  protected readonly filtroActivo = signal<FiltroEstado>('todos');

  protected readonly estudiantesVisibles = computed(() => {
    const filtro = this.filtroActivo();
    if (filtro === 'aprobados') {
      return this.estudiantes().filter((estudiante) => estudiante.promedio >= 11);
    }
    if (filtro === 'riesgo') {
      return this.estudiantes().filter((estudiante) => estudiante.promedio < 11);
    }
    return this.estudiantes();
  });

  protected readonly resumen = computed(() => {
    const estudiantes = this.estudiantes();
    const total = estudiantes.length;
    const aprobados = estudiantes.filter((estudiante) => estudiante.promedio >= 11).length;
    const enRiesgo = total - aprobados;
    const promedioGeneral = total
      ? estudiantes.reduce((suma, estudiante) => suma + estudiante.promedio, 0) / total
      : 0;

    return {
      total,
      aprobados,
      enRiesgo,
      promedioGeneral: Math.round((promedioGeneral + Number.EPSILON) * 100) / 100,
    } as const;
  });

  protected cambiarFiltro(filtro: FiltroEstado): void {
    this.filtroActivo.set(filtro);
  }

  protected simularListaVacia(): void {
    this.estudiantes.set([]);
  }

  protected restaurarDatos(): void {
    this.estudiantes.set(ESTUDIANTES_INICIALES);
    this.filtroActivo.set('todos');
  }

  protected estadoDe(promedio: number): EstadoAcademico {
    if (promedio >= 14) return 'Destacado';
    if (promedio >= 11) return 'Aprobado';
    return 'En riesgo';
  }

  protected porcentajeDe(promedio: number): number {
    return Math.max(0, Math.min(100, promedio * 5));
  }
}