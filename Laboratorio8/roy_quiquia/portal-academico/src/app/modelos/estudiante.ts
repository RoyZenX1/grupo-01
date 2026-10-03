export type Programa = 'Software' | 'Sistemas';
export type EstadoAcademico = 'Destacado' | 'Aprobado' | 'En riesgo';

export interface Estudiante {
  readonly id: number;
  readonly nombre: string;
  readonly programa: Programa;
  readonly promedio: number;
  readonly asistencia: number;
}

export type BorradorEstudiante = Omit<Estudiante, 'id'>;

export function estadoAcademico(promedio: number): EstadoAcademico {
  if (promedio >= 14) return 'Destacado';
  return promedio >= 11 ? 'Aprobado' : 'En riesgo';
}