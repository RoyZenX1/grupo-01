import { Pipe, PipeTransform } from '@angular/core';
import { estadoAcademico, EstadoAcademico } from '../modelos/estudiante';

@Pipe({ name: 'estadoAcademico', standalone: true })
export class EstadoAcademicoPipe implements PipeTransform {
  transform(promedio: number): EstadoAcademico {
    return estadoAcademico(promedio);
  }
}
