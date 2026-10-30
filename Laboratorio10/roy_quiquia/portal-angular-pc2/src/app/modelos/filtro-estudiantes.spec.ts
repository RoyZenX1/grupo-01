import type { Estudiante } from './estudiante';
import { FILTRO_INICIAL, filtrarYOrdenar, type FiltroEstudiantes } from './filtro-estudiantes';

const estudiantes: Estudiante[] = [
  {
    id: '101',
    nombre: 'Ángela Ruiz',
    programa: 'Software',
    promedio: 18,
    asistencia: 90,
  },
  {
    id: '102',
    nombre: 'Bruno Díaz',
    programa: 'Sistemas',
    promedio: 10,
    asistencia: 98,
  },
  {
    id: '103',
    nombre: 'Carla Soto',
    programa: 'Software',
    promedio: 13,
    asistencia: 80,
  },
];

describe('filtrarYOrdenar', () => {
  it('no modifica el arreglo original y ordena por nombre', () => {
    const copia = [...estudiantes];
    const resultado = filtrarYOrdenar(estudiantes, FILTRO_INICIAL);
    expect(estudiantes).toEqual(copia);
    expect(resultado.map((e) => e.nombre)).toEqual(['Ángela Ruiz', 'Bruno Díaz', 'Carla Soto']);
  });

  it('normaliza espacios y mayúsculas al buscar por nombre', () => {
    const filtro: FiltroEstudiantes = {
      ...FILTRO_INICIAL,
      termino: ' ÁNGELA ',
    };
    expect(filtrarYOrdenar(estudiantes, filtro).map((e) => e.id)).toEqual(['101']);
  });

  it('combina programa y estado académico', () => {
    const filtro: FiltroEstudiantes = {
      ...FILTRO_INICIAL,
      programa: 'Software',
      estado: 'Aprobado',
    };
    expect(filtrarYOrdenar(estudiantes, filtro).map((e) => e.id)).toEqual(['103']);
  });

  it('ordena por promedio o asistencia sin alterar el filtro', () => {
    const porPromedio = filtrarYOrdenar(estudiantes, {
      ...FILTRO_INICIAL,
      orden: 'promedio-desc',
    });
    const porAsistencia = filtrarYOrdenar(estudiantes, {
      ...FILTRO_INICIAL,
      orden: 'asistencia-desc',
    });
    expect(porPromedio.map((e) => e.id)).toEqual(['101', '103', '102']);
    expect(porAsistencia.map((e) => e.id)).toEqual(['102', '101', '103']);
  });
});
