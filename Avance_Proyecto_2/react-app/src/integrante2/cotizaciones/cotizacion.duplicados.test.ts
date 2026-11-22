import { describe, expect, it } from 'vitest'
import { buscarDuplicada, verificarSinDuplicado } from './cotizacion.duplicados'
import type { DatosComparables } from './cotizacion.duplicados'
import type { Cotizacion } from './cotizacion.types'

function cotizacion(parcial: Partial<Cotizacion> = {}): Cotizacion {
  return {
    id: 'a1',
    codigo: 'C001',
    clienteId: '1',
    servicio: 'Transporte Lima - Callao',
    origen: 'Lima',
    destino: 'Callao',
    distancia: 25,
    peso: 2,
    precioUnitario: 100,
    cantidad: 1,
    descuentoPorcentaje: 0,
    subtotal: 100,
    baseImponible: 100,
    igv: 18,
    total: 118,
    fechaEmision: '2026-11-20',
    fechaVencimiento: '2099-12-31',
    estado: 'Pendiente',
    ...parcial,
  }
}

const datos: DatosComparables = {
  clienteId: '1',
  origen: 'Lima',
  destino: 'Callao',
  distancia: 25,
  peso: 2,
  cantidad: 1,
  descuentoPorcentaje: 0,
}

describe('buscarDuplicada', () => {
  it('detecta una cotización vigente con exactamente los mismos datos', () => {
    expect(buscarDuplicada(datos, [cotizacion()])?.codigo).toBe('C001')
  })

  it('ignora mayúsculas, tildes y espacios en origen y destino', () => {
    const casi = { ...datos, origen: '  LIMÁ ', destino: 'callao' }
    expect(buscarDuplicada(casi, [cotizacion()])?.codigo).toBe('C001')
  })

  it('cualquier dato distinto la vuelve una cotización nueva', () => {
    const cambios: Partial<DatosComparables>[] = [
      { clienteId: '2' }, { destino: 'Ate' }, { distancia: 30 },
      { peso: 3 }, { cantidad: 2 }, { descuentoPorcentaje: 5 },
    ]
    for (const cambio of cambios) {
      expect(buscarDuplicada({ ...datos, ...cambio }, [cotizacion()])).toBe(undefined)
    }
  })

  it('una cotización aprobada también bloquea', () => {
    expect(buscarDuplicada(datos, [cotizacion({ estado: 'Aprobada' })])?.codigo).toBe('C001')
  })

  it('rechazadas y vencidas no bloquean: se puede volver a cotizar', () => {
    expect(buscarDuplicada(datos, [cotizacion({ estado: 'Rechazada' })])).toBe(undefined)
    expect(buscarDuplicada(datos, [cotizacion({ estado: 'Vencida' })])).toBe(undefined)
    // pendiente pero con fecha de vencimiento ya pasada = vencida
    expect(
      buscarDuplicada(datos, [cotizacion({ fechaVencimiento: '2020-01-01' })]),
    ).toBe(undefined)
  })

  it('al editar, no se compara contra sí misma', () => {
    expect(buscarDuplicada(datos, [cotizacion()], { excluirId: 'a1' })).toBe(undefined)
  })

  it('al editar sí detecta que quedaría igual a otra distinta', () => {
    const otra = cotizacion({ id: 'b2', codigo: 'C002' })
    expect(buscarDuplicada(datos, [cotizacion(), otra], { excluirId: 'a1' })?.codigo).toBe('C002')
  })

  it('compara por nombre con cotizaciones antiguas sin clienteId', () => {
    const antigua = cotizacion({ clienteId: '', clienteNombre: 'Minera Sur' })
    expect(buscarDuplicada(datos, [antigua], { nombreCliente: 'minera sur' })?.codigo).toBe('C001')
    expect(buscarDuplicada(datos, [antigua], { nombreCliente: 'Otro cliente' })).toBe(undefined)
    expect(buscarDuplicada(datos, [antigua])).toBe(undefined)
  })

  it('con el formulario incompleto no avisa nada', () => {
    expect(buscarDuplicada({ ...datos, clienteId: '' }, [cotizacion()])).toBe(undefined)
    expect(buscarDuplicada({ ...datos, origen: '  ' }, [cotizacion()])).toBe(undefined)
    expect(buscarDuplicada({ ...datos, distancia: Number.NaN }, [cotizacion()])).toBe(undefined)
  })
})

describe('verificarSinDuplicado', () => {
  it('lanza un error que nombra la cotización existente', () => {
    let mensaje = ''
    try {
      verificarSinDuplicado(datos, [cotizacion()])
    } catch (e) {
      mensaje = (e as Error).message
    }
    expect(mensaje).toBe(
      'Ya existe la cotización C001 (Pendiente) con estos mismos datos. No se guardó otra igual.',
    )
  })

  it('no lanza nada si no hay duplicado', () => {
    verificarSinDuplicado({ ...datos, peso: 9 }, [cotizacion()])
    expect(true).toBe(true)
  })
})
