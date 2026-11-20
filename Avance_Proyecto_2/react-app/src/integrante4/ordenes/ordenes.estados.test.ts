import { describe, expect, it } from 'vitest'
import {
  agregarHistorial,
  esEstadoFinal,
  estadosSiguientes,
  liberaVehiculo,
  puedeCambiarEstado,
} from './ordenes.estados'

describe('flujo de estados de órdenes', () => {
  it('avanza etapa por etapa', () => {
    expect(puedeCambiarEstado('Pendiente', 'Programada')).toBe(true)
    expect(puedeCambiarEstado('Programada', 'En ruta')).toBe(true)
    expect(puedeCambiarEstado('En ruta', 'Completada')).toBe(true)
  })

  it('no permite saltar etapas ni retroceder', () => {
    expect(puedeCambiarEstado('Pendiente', 'Completada')).toBe(false)
    expect(puedeCambiarEstado('En ruta', 'Pendiente')).toBe(false)
  })

  it('permite cancelar mientras la orden no sea final', () => {
    expect(estadosSiguientes('Programada')).toContain('Cancelada')
    expect(estadosSiguientes('Completada')).toEqual([])
    expect(esEstadoFinal('Cancelada')).toBe(true)
  })

  it('libera el vehículo al completar o cancelar', () => {
    expect(liberaVehiculo('Completada')).toBe(true)
    expect(liberaVehiculo('Cancelada')).toBe(true)
    expect(liberaVehiculo('En ruta')).toBe(false)
  })

  it('agrega al historial sin perder lo anterior', () => {
    const historial = agregarHistorial(
      { historial: [{ estado: 'Pendiente', fecha: '2026-01-01T00:00:00.000Z' }] },
      'Programada',
      '2026-01-02T00:00:00.000Z',
    )
    expect(historial).toHaveLength(2)
    expect(historial[1].estado).toBe('Programada')
  })
})
