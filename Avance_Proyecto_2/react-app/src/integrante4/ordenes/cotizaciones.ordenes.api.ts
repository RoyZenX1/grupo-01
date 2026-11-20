import { z } from 'zod'
import { http } from '../../shared/api/http.ts'
import type { CotizacionParaOrden } from './ordenes.types.ts'

const cotizacionParaOrdenSchema = z.object({
  id: z.coerce.string().min(1),
  estado: z.string(),
  origen: z.string(),
  destino: z.string(),
  distancia: z.number(),
  peso: z.number(),
})

export async function listarCotizacionesParaOrden(): Promise<CotizacionParaOrden[]> {
  const datos: unknown = await http.get('/cotizaciones')

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
