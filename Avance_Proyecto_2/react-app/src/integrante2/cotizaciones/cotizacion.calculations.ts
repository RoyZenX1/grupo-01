import type { Cotizacion, EstadoCotizacion } from './cotizacion.types'

export const TASA_IGV = 0.18
export const DIAS_VALIDEZ = 30

export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

export interface TotalesCotizacion {
  subtotal: number
  descuento: number
  baseImponible: number
  igv: number
  total: number
}

export function calcularTotales(
  precioUnitario: number,
  cantidad: number,
  descuentoPorcentaje: number,
): TotalesCotizacion {
  const subtotal = redondear(precioUnitario * cantidad)
  const baseImponible = redondear(subtotal * (1 - descuentoPorcentaje / 100))
  const descuento = redondear(subtotal - baseImponible)
  const igv = redondear(baseImponible * TASA_IGV)
  return { subtotal, descuento, baseImponible, igv, total: redondear(baseImponible + igv) }
}

const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

/** Formato monetario único para toda la aplicación (S/ 1,234.50). */
export function formatearMoneda(valor: number): string {
  return formatoMoneda.format(valor)
}

export function hoyISO(): string {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

export function sumarDias(fechaISO: string, dias: number): string {
  const fecha = new Date(`${fechaISO}T12:00:00`)
  fecha.setDate(fecha.getDate() + dias)
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

/**
 * Estado real de una cotización: una pendiente cuya fecha de vencimiento ya
 * pasó se considera vencida. Reportes y dashboard usan esta misma función.
 */
export function estadoEfectivo(
  cotizacion: Pick<Cotizacion, 'estado' | 'fechaVencimiento'>,
  hoy: string = hoyISO(),
): EstadoCotizacion {
  if (cotizacion.estado === 'Pendiente' && cotizacion.fechaVencimiento < hoy) {
    return 'Vencida'
  }
  return cotizacion.estado
}

export function puedeConvertirseEnOrden(
  cotizacion: Pick<Cotizacion, 'estado' | 'fechaVencimiento'>,
): boolean {
  return estadoEfectivo(cotizacion) === 'Aprobada'
}
