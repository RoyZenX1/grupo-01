export interface Estudiante {
    id: number;
    nombre: string;
    codigo: string;
    carrera: string;
    promedio: number;
    asistencia: number;
    estado: 'Aprobado' | 'Desaprobado' | 'En riesgo';
}
