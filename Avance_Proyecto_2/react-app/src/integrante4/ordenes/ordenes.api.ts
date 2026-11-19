
import { z } from 'zod'
import type { Orden, OrdenWrite } from './ordenes.types'

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000'
).replace(/\/+$/, '')

const ordenesUrl = `${apiBaseUrl}/ordenes`

const ordenSchema = z.object({
  id: z.coerce.string().min(1),
  codigo: z.string(),
  cotizacionId: z.string(),
  vehiculoId: z.string(),
  origen: z.string(),
  destino: z.string(),
  distancia: z.number(),
  peso: z.number(),
  tarifa: z.number(),
  estado: z.enum([
    'Pendiente',
    'Programada',
    'En ruta',
    'Completada',
    'Cancelada',
  ]),
})

async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(url, init)

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      detail || `La API respondió con el estado ${response.status}.`,
    )
  }

  if (response.status === 204) return undefined

  return response.json()
}

function jsonBody(payload: unknown): Pick<RequestInit, 'headers' | 'body'> {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

export async function listarOrdenes(): Promise<Orden[]> {
  return z.array(ordenSchema).parse(
    await requestJson(ordenesUrl),
  )
}

export async function obtenerOrden(id: string): Promise<Orden> {
  return ordenSchema.parse(
    await requestJson(
      `${ordenesUrl}/${encodeURIComponent(id)}`,
    ),
  )
}

export async function crearOrden(
  datos: OrdenWrite,
): Promise<Orden> {
  return ordenSchema.parse(
    await requestJson(ordenesUrl, {
      method: 'POST',
      ...jsonBody(datos),
    }),
  )
}

export async function actualizarOrden(
  id: string,
  cambios: Partial<OrdenWrite>,
): Promise<Orden> {
  return ordenSchema.parse(
    await requestJson(
      `${ordenesUrl}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        ...jsonBody(cambios),
      },
    ),
  )
}

export async function eliminarOrden(id: string): Promise<void> {
  const response = await fetch(
    `${ordenesUrl}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )

  if (!response.ok) {
    const detail = await response.text()

    throw new Error(
      detail || `No se pudo eliminar la orden. Estado: ${response.status}.`,
    )
  }
}