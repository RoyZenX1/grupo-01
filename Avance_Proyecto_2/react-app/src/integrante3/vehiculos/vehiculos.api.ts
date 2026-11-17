import { z } from 'zod'
import { vehiculoSchema } from './vehiculo.schema'
import type { Vehiculo, VehiculoWrite } from './vehiculo.types'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000')
  .replace(/\/+$/, '')
const vehiculosUrl = `${apiBaseUrl}/vehiculos`

async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      detail || `La API respondió con el estado ${response.status}.`,
    )
  }
  return response.json()
}

function jsonBody(payload: unknown): Pick<RequestInit, 'headers' | 'body'> {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

export async function listarVehiculos(): Promise<Vehiculo[]> {
  return z.array(vehiculoSchema).parse(await requestJson(vehiculosUrl))
}

export async function obtenerVehiculoPorCodigo(codigo: string): Promise<Vehiculo> {
  const url = `${vehiculosUrl}?codigo=${encodeURIComponent(codigo)}`
  const vehiculos = z
    .array(vehiculoSchema)
    .parse(await requestJson(url))
  const vehiculo = vehiculos.find((item) => item.codigo === codigo)

  if (!vehiculo) {
    throw new Error(`No se encontró el vehículo ${codigo}.`)
  }

  return vehiculo
}

export async function crearVehiculo(datos: VehiculoWrite): Promise<Vehiculo> {
  return vehiculoSchema.parse(
    await requestJson(vehiculosUrl, {
      method: 'POST',
      ...jsonBody(datos),
    }),
  )
}

export async function actualizarVehiculo(
  id: string,
  cambios: Partial<VehiculoWrite>,
): Promise<Vehiculo> {
  const url = `${vehiculosUrl}/${encodeURIComponent(id)}`
  return vehiculoSchema.parse(
    await requestJson(url, {
      method: 'PATCH',
      ...jsonBody(cambios),
    }),
  )
}

export async function eliminarVehiculo(id: string): Promise<void> {
  const response = await fetch(`${vehiculosUrl}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      detail || `La API respondió con el estado ${response.status}.`,
    )
  }
}