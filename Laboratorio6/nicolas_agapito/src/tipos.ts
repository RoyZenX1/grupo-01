export type EstadoAcademico = "aprobado" | "riesgo";

export interface EstudianteEntrada {
  codigo: string;
  nombre: string;
  programa: string;
  notas: number[];
}

export interface FiltrosEstudiantes {
  estado?: EstadoAcademico;
  programa?: string;
  top?: number;
}

export interface ResumenAcademico {
  total: number;
  aprobados: number;
  riesgo: number;
  promedioGrupal: number;
}

export type ResultadoValidacion<T> =
  | { ok: true; valor: T }
  | { ok: false; errores: string[] };