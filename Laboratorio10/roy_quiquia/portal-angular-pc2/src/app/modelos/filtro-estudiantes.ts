import {
  estadoAcademico,
  type EstadoAcademico,
  type Estudiante,
  type Programa,
} from './estudiante';

export type OpcionPrograma = 'Todos' | Programa;
export type OpcionEstado = 'Todos' | EstadoAcademico;
export type OrdenEstudiantes = 'nombre' | 'promedio-desc' | 'asistencia-desc';

export interface FiltroEstudiantes {
  readonly termino: string;
  readonly programa: OpcionPrograma;
  readonly estado: OpcionEstado;
  readonly orden: OrdenEstudiantes;
}

export const FILTRO_INICIAL: FiltroEstudiantes = {
  termino: '',
  programa: 'Todos',
  estado: 'Todos',
  orden: 'nombre',
};

export function filtrarYOrdenar(
  estudiantes: readonly Estudiante[],
  filtro: FiltroEstudiantes,
): Estudiante[] {
  const termino = filtro.termino.trim().toLocaleLowerCase('es');
  const resultado = estudiantes.filter((estudiante) => {
    const coincideNombre = estudiante.nombre.toLocaleLowerCase('es').includes(termino);
    const coincidePrograma = filtro.programa === 'Todos' || estudiante.programa === filtro.programa;
    const coincideEstado =
      filtro.estado === 'Todos' || estadoAcademico(estudiante.promedio) === filtro.estado;
    return coincideNombre && coincidePrograma && coincideEstado;
  });
  return [...resultado].sort((a, b) => {
    if (filtro.orden === 'promedio-desc') return b.promedio - a.promedio;
    if (filtro.orden === 'asistencia-desc') return b.asistencia - a.asistencia;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}
