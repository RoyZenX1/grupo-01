import { http } from '../../shared/api/http'
import { buscarTarifa } from '../../integrante3/vehiculos/tarifas'
import {
  calcularTotales,
  DIAS_VALIDEZ,
  hoyISO,
  sumarDias,
} from './cotizacion.calculations'
import { exigirCotizacion, normalizarListaCotizaciones } from './cotizacion.normalizar'
import type { CotizacionFormValues } from './cotizacion.schema'
import type { Cotizacion, CotizacionWrite, EstadoCotizacion } from './cotizacion.types'

export const COTIZACIONES_QUERY_KEY = ['cotizaciones'] as const

const recurso = (id: string) => `/cotizaciones/${encodeURIComponent(id)}`

export async function listarCotizaciones(): Promise<Cotizacion[]> {
  return normalizarListaCotizaciones(await http.get('/cotizaciones'))
}

export async function obtenerCotizacion(id: string): Promise<Cotizacion> {
  return exigirCotizacion(await http.get(recurso(id)))
}

export function siguienteCodigoCotizacion(cotizaciones: Cotizacion[]): string {
  const numeros = cotizaciones
    .map(({ id }) => /^C(\d+)$/.exec(id))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1
  return `C${String(siguiente).padStart(3, '0')}`
}

/**
 * Convierte lo escrito en el formulario en el registro que se guarda.
 * El precio unitario sale de la matriz de tarifas del módulo de vehículos,
 * por lo que cotización, orden y reportes usan siempre la misma regla.
 */
export function construirCotizacion(
  values: CotizacionFormValues,
  fechaEmision: string = hoyISO(),
): CotizacionWrite {
  const tarifa = buscarTarifa(values.distancia, values.peso)
  if (!tarifa) {
    throw new Error('La distancia o el peso están fuera de la tabla de tarifas (200 km / 10 t).')
  }
  const totales = calcularTotales(tarifa.precio, values.cantidad, values.descuentoPorcentaje)
  const origen = values.origen.trim()
  const destino = values.destino.trim()

  return {
    clienteId: values.clienteId,
    servicio: `Transporte ${origen} - ${destino}`,
    origen,
    destino,
    distancia: values.distancia,
    peso: values.peso,
    precioUnitario: tarifa.precio,
    cantidad: values.cantidad,
    descuentoPorcentaje: values.descuentoPorcentaje,
    subtotal: totales.subtotal,
    baseImponible: totales.baseImponible,
    igv: totales.igv,
    total: totales.total,
    fechaEmision,
    fechaVencimiento: sumarDias(fechaEmision, DIAS_VALIDEZ),
    estado: 'Pendiente',
  }
}

export async function crearCotizacion(
  datos: CotizacionWrite & { id: string },
): Promise<Cotizacion> {
  return exigirCotizacion(await http.post('/cotizaciones', datos))
}

export async function actualizarCotizacion(
  id: string,
  cambios: Partial<CotizacionWrite>,
): Promise<Cotizacion> {
  return exigirCotizacion(await http.patch(recurso(id), cambios))
}

export async function cambiarEstadoCotizacion(
  id: string,
  estado: EstadoCotizacion,
): Promise<Cotizacion> {
  return actualizarCotizacion(id, { estado })
}

export async function eliminarCotizacion(id: string): Promise<void> {
  await http.delete(recurso(id))
}
