import { z } from 'zod'
import { http } from '../../shared/api/http'
import { ESTADOS_COTIZACION } from '../../integrante2/cotizaciones/cotizacion.types'

export const COTIZACIONES_RESUMEN_QUERY_KEY = [
  'cotizaciones-resumen',
] as const

/**
 * Resumen mínimo de cotización para el dashboard.
 * El historial de la API mezcla registros antiguos sin todos los campos
 * del modelo actual, por lo que cada registro se valida de forma
 * independiente y los incompletos se descartan (mismo criterio que
 * cotizaciones.ordenes.api.ts del módulo de órdenes).
 */
const cotizacionResumenSchema = z.object({
  id: z.coerce.string().min(1),
  estado: z.enum(ESTADOS_COTIZACION),
  fechaVencimiento: z.string().default('9999-12-31'),
  total: z.number().default(0),
})

export type CotizacionResumen = z.infer<typeof cotizacionResumenSchema>

export async function listarResumenCotizaciones(): Promise<
  CotizacionResumen[]
> {
  const datos: unknown = await http.get('/cotizaciones')
  if (!Array.isArray(datos)) {
    throw new Error('La respuesta de cotizaciones no es válida.')
  }
  return datos.flatMap((registro) => {
    const resultado = cotizacionResumenSchema.safeParse(registro)
    return resultado.success ? [resultado.data] : []
  })
}
