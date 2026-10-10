import { Pipe, PipeTransform } from '@angular/core';
import { estadoAcademico } from '../models/estudiante';

@Pipe({ name: 'estadoAcademico', standalone: true })
export class EstadoAcademicoPipe implements PipeTransform {
  transform(promedio: number): string {
    return estadoAcademico(promedio);
  }
}
