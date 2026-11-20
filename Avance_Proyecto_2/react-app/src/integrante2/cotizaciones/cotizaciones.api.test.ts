import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearCotizacion } from './cotizaciones.api'

const datos = {
  codigo: 'C005',
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
  fechaVencimiento: '2026-12-20',
  estado: 'Pendiente' as const,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

describe('crearCotizacion', () => {
  it('envía el código visible aparte del id que genera la API', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'api-generated-id', ...datos }),
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    const creada = await crearCotizacion(datos)
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as Record<string, unknown>

    expect(creada).toMatchObject({ id: 'api-generated-id', codigo: 'C005' })
    expect(body.codigo).toBe('C005')
    expect(body).not.toHaveProperty('id')
  })
})
