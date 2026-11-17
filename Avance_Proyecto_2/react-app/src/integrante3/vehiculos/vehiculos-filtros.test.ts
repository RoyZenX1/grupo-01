import { describe, expect, it } from 'vitest'
import type { Vehiculo } from './vehiculo.types'
import { esPlacaDuplicada, filtrarVehiculos } from './vehiculos-filtros'

const vehiculos: Vehiculo[] = [
  {
    id: 'internal-1',
    codigo: 'VEH-001',
    placa: 'ABC-123',
    modelo: 'Hilux',
    tipo: 'Camioneta',
    capacidad: 3,
    estado: 'Disponible',
  },
  {
    id: 'internal-2',
    codigo: 'VEH-002',
    placa: 'DEF-456',
    modelo: 'Atego',
    tipo: 'Camión',
    capacidad: 10,
    estado: 'Mantenimiento',
  },
]

describe('filtrarVehiculos', () => {
  it('busca por código, placa o modelo sin distinguir mayúsculas', () => {
    expect(
      filtrarVehiculos(vehiculos, {
        busqueda: 'hilux',
        estado: '',
        tipo: '',
      }).map(({ id }) => id),
    ).toEqual(['internal-1'])
  })

  it('combina los filtros de estado y tipo', () => {
    expect(
      filtrarVehiculos(vehiculos, {
        busqueda: '',
        estado: 'Mantenimiento',
        tipo: 'Camión',
      }).map(({ codigo }) => codigo),
    ).toEqual(['VEH-002'])
  })
})

describe('esPlacaDuplicada', () => {
  it('compara placas sin distinguir mayúsculas y excluye el vehículo editado', () => {
    expect(esPlacaDuplicada(vehiculos, 'abc-123')).toBe(true)
    expect(esPlacaDuplicada(vehiculos, 'abc-123', 'internal-1')).toBe(false)
  })
})
