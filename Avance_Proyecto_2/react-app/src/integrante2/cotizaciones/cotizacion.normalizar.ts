import { calcularTotales, DIAS_VALIDEZ, SIN_VENCIMIENTO, sumarDias } from './cotizacion.calculations'
import { ESTADOS_COTIZACION } from './cotizacion.types'
import type { Cotizacion, EstadoCotizacion } from './cotizacion.types'

/**
 * El historial de db.json mezcla registros con dos formatos:
 *  - antiguo: { cliente: "Minera Sur", origen, destino, distancia, peso, tarifa, estado }
 *  - antiguo del formulario: { clienteId, productoServicio, precioUnitario, ... } sin ruta ni estado
 *  - actual: el modelo completo de cotizacion.types.ts
 * Esta función convierte cualquiera de ellos al modelo actual para que la página
 * cargue todo el historial en lugar de fallar por un solo registro incompleto.
 */

const numero = (valor: unknown): number | undefined =>
  typeof valor === 'number' && Number.isFinite(valor) ? valor : undefined

const texto = (valor: unknown): string | undefined =>
  typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : undefined

function esEstado(valor: unknown): valor is EstadoCotizacion {
  return ESTADOS_COTIZACION.some((estado) => estado === valor)
}

/** "Transporte Ica - Lima" → { origen: "Ica", destino: "Lima" } */
function rutaDesdeServicio(servicio: string | undefined) {
  const coincidencia = servicio ? /^\S+\s+(.+?)\s+-\s+(.+)$/.exec(servicio) : null
  return coincidencia
    ? { origen: coincidencia[1].trim(), destino: coincidencia[2].trim() }
    : { origen: undefined, destino: undefined }
}

export function normalizarCotizacion(registro: unknown): Cotizacion | null {
  if (typeof registro !== 'object' || registro === null) return null
  const r = registro as Record<string, unknown>

  const idCrudo = r.id
  if (typeof idCrudo !== 'string' && typeof idCrudo !== 'number') return null
  const id = String(idCrudo)
  if (id === '') return null

  const servicioGuardado = texto(r.servicio) ?? texto(r.productoServicio)
  const rutaServicio = rutaDesdeServicio(servicioGuardado)
  const origen = texto(r.origen) ?? rutaServicio.origen ?? ''
  const destino = texto(r.destino) ?? rutaServicio.destino ?? ''

  const precioUnitario = numero(r.precioUnitario) ?? numero(r.tarifa) ?? 0
  const cantidad = numero(r.cantidad) ?? 1
  const descuentoPorcentaje = numero(r.descuentoPorcentaje) ?? 0

  const subtotal = numero(r.subtotal)
  const baseImponible = numero(r.baseImponible)
  const igv = numero(r.igv)
  const total = numero(r.total)
  const totales =
    subtotal !== undefined && baseImponible !== undefined && igv !== undefined && total !== undefined
      ? { subtotal, baseImponible, igv, total }
      : calcularTotales(precioUnitario, cantidad, descuentoPorcentaje)

  const fechaEmision = texto(r.fechaEmision) ?? ''
  const fechaVencimiento =
    texto(r.fechaVencimiento) ??
    (fechaEmision ? sumarDias(fechaEmision, DIAS_VALIDEZ) : SIN_VENCIMIENTO)

  return {
    id,
    clienteId: r.clienteId === undefined || r.clienteId === null ? '' : String(r.clienteId),
    clienteNombre: texto(r.cliente) ?? texto(r.clienteNombre),
    servicio:
      servicioGuardado ?? (origen && destino ? `Transporte ${origen} - ${destino}` : 'Servicio de transporte'),
    origen,
    destino,
    distancia: numero(r.distancia) ?? 0,
    peso: numero(r.peso) ?? 0,
    precioUnitario,
    cantidad,
    descuentoPorcentaje,
    subtotal: totales.subtotal,
    baseImponible: totales.baseImponible,
    igv: totales.igv,
    total: totales.total,
    fechaEmision,
    fechaVencimiento,
    estado: esEstado(r.estado) ? r.estado : 'Pendiente',
  }
}

/** Igual que normalizarCotizacion, pero falla si la API devolvió algo inutilizable. */
export function exigirCotizacion(registro: unknown): Cotizacion {
  const cotizacion = normalizarCotizacion(registro)
  if (!cotizacion) throw new Error('La API devolvió una cotización inválida.')
  return cotizacion
}

export function normalizarListaCotizaciones(datos: unknown): Cotizacion[] {
  if (!Array.isArray(datos)) {
    throw new Error('La respuesta de cotizaciones no es válida.')
  }
  return datos.flatMap((registro) => {
    const cotizacion = normalizarCotizacion(registro)
    return cotizacion ? [cotizacion] : []
  })
}
