import { afterEach, describe, expect, it, vi } from 'vitest'
import { obtenerVehiculoPorCodigo } from './vehiculos.api'

const vehiculo = {
  id: 'internal-id-1',
  codigo: 'VEH-001',
  placa: 'ABC-123',
  modelo: 'Hilux',
  tipo: 'Camioneta',
  capacidad: 3,
  estado: 'Disponible',
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

describe('obtenerVehiculoPorCodigo', () => {
  it('consulta por el código visible y devuelve el vehículo validado', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => [vehiculo],
    } as Response)
    vi.stubGlobal('fetch', fetchMock)

    await expect(obtenerVehiculoPorCodigo('VEH-001')).resolves.toEqual(vehiculo)
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://127.0.0.1:3000/vehiculos?codigo=VEH-001',
    )
  })

  it('reporta cuando el código visible no existe', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response),
    )

    await expect(obtenerVehiculoPorCodigo('VEH-999')).rejects.toThrow(
      'No se encontró el vehículo VEH-999.',
    )
  })
})
