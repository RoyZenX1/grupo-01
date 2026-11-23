
import { z } from 'zod'
import { http } from '../../shared/api/http.ts'
import { normalizarListaCotizaciones } from '../../integrante2/cotizaciones/cotizacion.normalizar.ts'
import type { CotizacionParaOrden } from './ordenes.types.ts'

const cotizacionParaOrdenSchema = z.object({
  id: z.coerce.string().min(1),
  codigo: z.string().optional(),
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

  const cotizaciones = normalizarListaCotizaciones(datos)

  return cotizaciones.flatMap((cotizacion) => {
    const resultado = cotizacionParaOrdenSchema.safeParse(cotizacion)

    return resultado.success ? [resultado.data] : []
  })
}

