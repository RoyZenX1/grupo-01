import { computed, Injectable, signal } from '@angular/core';
import { ESTUDIANTES } from '../datos/estudiantes';
import type { BorradorEstudiante, Estudiante } from '../modelos/estudiante';

@Injectable({ providedIn: 'root' })
export class EstudiantesStore {
  private readonly registros = signal<readonly Estudiante[]>([...ESTUDIANTES]);
  readonly estudiantes = this.registros.asReadonly();
  readonly total = computed(() => this.estudiantes().length);
  readonly promedio = computed(() => {
    const lista = this.estudiantes();
    return lista.length
      ? lista.reduce((suma, e) => suma + e.promedio, 0) / lista.length
      : 0;
  });
  private siguienteId = 107;

  agregar(datos: BorradorEstudiante): Estudiante {
    const nombre = datos.nombre.trim();
    if (
      nombre.length < 3 ||
      nombre.length > 80 ||
      !['Software', 'Sistemas'].includes(datos.programa) ||
      !Number.isFinite(datos.promedio) ||
      datos.promedio < 0 ||
      datos.promedio > 20 ||
      !Number.isFinite(datos.asistencia) ||
      datos.asistencia < 0 ||
      datos.asistencia > 100
    ) {
      throw new Error('Los datos del estudiante no son válidos.');
    }
    const estudiante: Estudiante = { ...datos, nombre, id: this.siguienteId++ };
    this.registros.update((lista) => [...lista, estudiante]);
    return estudiante;
  }
}