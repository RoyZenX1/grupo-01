import type { Estudiante } from './estudiante';
import {
  FILTRO_INICIAL,
  filtrarYOrdenar,
  type FiltroEstudiantes,
} from './filtro-estudiantes';

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
    nombre: 'María Paredes',
    programa: 'Software',
    promedio: 13.5,
    asistencia: 88,
  },
];

describe('filtrarYOrdenar', () => {
  it('no muta la colección original', () => {
    const copia = [...estudiantes];
    filtrarYOrdenar(estudiantes, {
      ...FILTRO_INICIAL,
      orden: 'promedio-desc',
    });
    expect(estudiantes).toEqual(copia);
  });

  it('busca por nombre sin distinguir mayúsculas ni tildes', () => {
    const filtro: FiltroEstudiantes = {
      ...FILTRO_INICIAL,
      termino: 'maria',
    };
    const resultado = filtrarYOrdenar(estudiantes, filtro);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('103');
  });

  it('combina programa y estado académico', () => {
    const filtro: FiltroEstudiantes = {
      ...FILTRO_INICIAL,
      programa: 'Software',
      estado: 'Destacado',
    };
    const resultado = filtrarYOrdenar(estudiantes, filtro);
    expect(resultado.map((e) => e.id)).toEqual(['101']);
  });

  it('ordena por promedio descendente', () => {
    const filtro: FiltroEstudiantes = {
      ...FILTRO_INICIAL,
      orden: 'promedio-desc',
    };
    const resultado = filtrarYOrdenar(estudiantes, filtro);
    expect(resultado.map((e) => e.id)).toEqual(['101', '103', '102']);
  });
});