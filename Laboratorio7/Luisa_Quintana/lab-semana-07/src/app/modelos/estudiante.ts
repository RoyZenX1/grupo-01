export type EstadoAcademico = 'Destacado' | 'Aprobado' | 'En riesgo';

export interface Estudiante {
  readonly id: number;
  readonly nombre: string;
  readonly programa: string;
  readonly promedio: number;
  readonly asistencia: number;
}