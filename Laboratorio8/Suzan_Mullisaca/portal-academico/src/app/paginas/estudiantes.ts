import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarjetaEstudiante } from '../componentes/tarjeta-estudiante';
import { EstudiantesStore } from '../estado/estudiantes-store';
import type { Estudiante } from '../modelos/estudiante';

@Component({
  standalone: true,
  imports: [RouterLink, TarjetaEstudiante],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Estudiantes {
  readonly store = inject(EstudiantesStore);
  readonly seleccionado = signal<Estudiante | null>(null);

  seleccionar(estudiante: Estudiante): void {
    this.seleccionado.set(estudiante);
  }
}