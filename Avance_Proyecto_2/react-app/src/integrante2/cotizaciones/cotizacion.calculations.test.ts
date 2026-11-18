import { describe, expect, it } from 'vitest'
import { buscarTarifa } from '../vehiculos/tarifas'
import {
  calcularTotales,
  estadoEfectivo,
  puedeConvertirseEnOrden,
  sumarDias,
} from './cotizacion.calculations'

describe('calcularTotales', () => {
  it('aplica descuento sobre el subtotal y luego IGV del 18 %', () => {
    expect(calcularTotales(100, 1, 1)).toEqual({
      subtotal: 100,
      descuento: 1,
      baseImponible: 99,
      igv: 17.82,
      total: 116.82,
    })
  })

  it('multiplica por la cantidad de servicios', () => {
    const totales = calcularTotales(300, 3, 5)
    expect(totales.subtotal).toBe(900)
    expect(totales.baseImponible).toBe(855)
    expect(totales.total).toBe(1008.9)
  })

  it('coincide con la tarifa de la matriz del módulo de vehículos', () => {
    // 50 km y 5 t → fila 0, columna 1
    expect(buscarTarifa(50, 5)?.precio).toBe(150)
    expect(calcularTotales(150, 1, 0).total).toBe(177)
  })
})

describe('estadoEfectivo', () => {
  it('marca como vencida una cotización pendiente con fecha pasada', () => {
    expect(
      estadoEfectivo({ estado: 'Pendiente', fechaVencimiento: '2026-11-15' }, '2026-11-18'),
    ).toBe('Vencida')
  })

  it('mantiene pendiente una cotización vigente', () => {
    expect(
      estadoEfectivo({ estado: 'Pendiente', fechaVencimiento: '2026-12-01' }, '2026-11-18'),
    ).toBe('Pendiente')
  })

  it('no altera cotizaciones ya resueltas', () => {
    expect(
      estadoEfectivo({ estado: 'Aprobada', fechaVencimiento: '2020-01-01' }, '2026-11-18'),
    ).toBe('Aprobada')
  })

  it('solo las aprobadas pueden convertirse en orden', () => {
    expect(puedeConvertirseEnOrden({ estado: 'Rechazada', fechaVencimiento: '2099-01-01' })).toBe(false)
    expect(puedeConvertirseEnOrden({ estado: 'Aprobada', fechaVencimiento: '2099-01-01' })).toBe(true)
  })
})

describe('sumarDias', () => {
  it('cruza el cambio de mes y de año', () => {
    expect(sumarDias('2026-10-16', 30)).toBe('2026-11-15')
    expect(sumarDias('2026-12-20', 30)).toBe('2027-01-19')
  })
})
