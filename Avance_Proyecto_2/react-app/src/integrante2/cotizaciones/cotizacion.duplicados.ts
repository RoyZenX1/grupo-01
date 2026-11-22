import { estadoEfectivo } from './cotizacion.calculations'
import type { Cotizacion, EstadoCotizacion } from './cotizacion.types'

/** Los siete datos que llena quien cotiza. Dos cotizaciones con los mismos datos son la misma. */
export interface DatosComparables {
  clienteId: string
  origen: string
  destino: string
  distancia: number
  peso: number
  cantidad: number
  descuentoPorcentaje: number
}

/**
 * Solo bloquean las cotizaciones vigentes. Si la anterior fue rechazada o venció,
 * volver a cotizar lo mismo es legítimo (el cliente puede aceptar una nueva oferta).
 */
const ESTADOS_QUE_BLOQUEAN: readonly EstadoCotizacion[] = ['Pendiente', 'Aprobada']

/** "  Lima  " y "lima" y "LIMÁ" cuentan como el mismo texto. */
function clave(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-PE')
    .replace(/\s+/g, ' ')
    .trim()
}

function datosCompletos(d: DatosComparables): boolean {
  return (
    d.clienteId !== '' &&
    clave(d.origen) !== '' &&
    clave(d.destino) !== '' &&
    [d.distancia, d.peso, d.cantidad, d.descuentoPorcentaje].every(Number.isFinite)
  )
}

interface Opciones {
  /** Al editar, la cotización no puede considerarse duplicada de sí misma. */
  excluirId?: string
  /**
   * Nombre del cliente elegido. Sirve para comparar con cotizaciones antiguas que
   * guardaron el nombre y no el clienteId.
   */
  nombreCliente?: string
}

/** Devuelve la cotización vigente que ya tiene exactamente estos datos, si existe. */
export function buscarDuplicada(
  datos: DatosComparables,
  cotizaciones: Cotizacion[],
  { excluirId, nombreCliente }: Opciones = {},
): Cotizacion | undefined {
  if (!datosCompletos(datos)) return undefined

  return cotizaciones.find((c) => {
    if (c.id === excluirId) return false
    if (!ESTADOS_QUE_BLOQUEAN.includes(estadoEfectivo(c))) return false

    const mismoCliente =
      c.clienteId !== ''
        ? c.clienteId === datos.clienteId
        : Boolean(c.clienteNombre && nombreCliente) &&
          clave(c.clienteNombre ?? '') === clave(nombreCliente ?? '')

    return (
      mismoCliente &&
      clave(c.origen) === clave(datos.origen) &&
      clave(c.destino) === clave(datos.destino) &&
      c.distancia === datos.distancia &&
      c.peso === datos.peso &&
      c.cantidad === datos.cantidad &&
      c.descuentoPorcentaje === datos.descuentoPorcentaje
    )
  })
}

/** Lanza un error con mensaje claro si ya existe una cotización igual. */
export function verificarSinDuplicado(
  datos: DatosComparables,
  cotizaciones: Cotizacion[],
  opciones?: Opciones,
): void {
  const duplicada = buscarDuplicada(datos, cotizaciones, opciones)
  if (duplicada) {
    throw new Error(
      `Ya existe la cotización ${duplicada.codigo} (${estadoEfectivo(duplicada)}) con estos mismos datos. ` +
        'No se guardó otra igual.',
    )
  }
}
