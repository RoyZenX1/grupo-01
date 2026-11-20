import { describe, expect, it } from 'vitest'
import { normalizarCotizacion, normalizarListaCotizaciones } from './cotizacion.normalizar'
import { siguienteCodigoCotizacion } from './cotizaciones.api'

// Registros reales del historial de db.json
const antiguo = {
  id: 'C002', cliente: 'Agro Norte', origen: 'Ate', destino: 'Miraflores',
  distancia: 50, peso: 5, tarifa: 230, estado: 'Aprobada',
}
const sinRutaNiEstado = {
  clienteId: 'CUST-004', productoServicio: 'Transporte Ica - Lima', precioUnitario: 214,
  cantidad: 1, descuentoPorcentaje: 12, subtotal: 214, baseImponible: 188.32, igv: 33.9,
  total: 222.22, fechaEmision: '2026-10-16', id: 'JZM3GaB_2pU',
}
const mixto = {
  clienteId: '2', cliente: 'María López', origen: 'Lima', destino: 'Callao', distancia: 2, peso: 3,
  tarifa: 100, productoServicio: 'Transporte Lima - Callao', precioUnitario: 100, cantidad: 1,
  descuentoPorcentaje: 1, subtotal: 100, baseImponible: 99, igv: 17.82, total: 116.82,
  fechaEmision: '2026-10-16', estado: 'Pendiente', id: 'at_xYBDyHCY',
}

describe('normalizarCotizacion', () => {
  it('convierte el formato antiguo conservando estado, ruta y nombre del cliente', () => {
    const c = normalizarCotizacion(antiguo)!
    expect(c.estado).toBe('Aprobada')
    expect(c.clienteNombre).toBe('Agro Norte')
    expect(c.clienteId).toBe('')
    expect(c.precioUnitario).toBe(230)
    expect(c.total).toBe(271.4)
    expect(c.fechaVencimiento).toBe('9999-12-31')
  })

  it('deduce la ruta del servicio y asume Pendiente si no hay estado', () => {
    const c = normalizarCotizacion(sinRutaNiEstado)!
    expect(c.origen).toBe('Ica')
    expect(c.destino).toBe('Lima')
    expect(c.estado).toBe('Pendiente')
    expect(c.total).toBe(222.22)
    expect(c.fechaVencimiento).toBe('2026-11-15')
  })

  it('respeta los registros mixtos', () => {
    const c = normalizarCotizacion(mixto)!
    expect(c.clienteId).toBe('2')
    expect(c.servicio).toBe('Transporte Lima - Callao')
    expect(c.total).toBe(116.82)
  })

  it('descarta lo que no tiene id', () => {
    expect(normalizarCotizacion({ origen: 'Lima' })).toBe(null)
    expect(normalizarCotizacion(null)).toBe(null)
  })
})

describe('normalizarListaCotizaciones', () => {
  it('carga todo el historial aunque mezcle formatos', () => {
    const cotizaciones = normalizarListaCotizaciones([
      antiguo,
      sinRutaNiEstado,
      mixto,
      { basura: true },
    ])

    expect(cotizaciones).toHaveLength(3)
    expect(cotizaciones.map(({ codigo }) => codigo)).toEqual(['C002', 'C003', 'C004'])
    expect(siguienteCodigoCotizacion(cotizaciones)).toBe('C005')
  })

  it('falla si la API no devuelve una lista', () => {
    let mensaje = ''
    try { normalizarListaCotizaciones({}) } catch (e) { mensaje = (e as Error).message }
    expect(mensaje).toBe('La respuesta de cotizaciones no es válida.')
  })
})
