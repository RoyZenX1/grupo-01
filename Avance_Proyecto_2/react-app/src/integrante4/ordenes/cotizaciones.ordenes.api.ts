
import { z } from 'zod'
import type { CotizacionParaOrden } from './ordenes.types'

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000'
).replace(/\/+$/, '')

const cotizacionesUrl = `${apiBaseUrl}/cotizaciones`

const cotizacionParaOrdenSchema = z.object({
  id: z.coerce.string().min(1),
  estado: z.string(),
  origen: z.string(),
  destino: z.string(),
  distancia: z.number(),
  peso: z.number(),
})

export async function listarCotizacionesParaOrden(): Promise<CotizacionParaOrden[]> {
  const response = await fetch(cotizacionesUrl)

  if (!response.ok) {
    throw new Error('No se pudieron cargar las cotizaciones.')
  }

  const datos: unknown = await response.json()

  if (!Array.isArray(datos)) {
    throw new Error('La respuesta de cotizaciones no es válida.')
  }

  // Conservamos únicamente los registros que tienen
  // todos los datos necesarios para crear una orden.
  return datos.flatMap((registro) => {
    const resultado = cotizacionParaOrdenSchema.safeParse(registro)

    return resultado.success ? [resultado.data] : []
  })
}
