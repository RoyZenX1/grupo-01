export const ESTADOS_COTIZACION = [
  'Pendiente',
  'Aprobada',
  'Rechazada',
  'Vencida',
] as const

export type EstadoCotizacion = (typeof ESTADOS_COTIZACION)[number]

/**
 * Cotización de transporte. Se guarda solo el `clienteId`; el nombre del
 * cliente se obtiene de clientes.api.ts (una única fuente de verdad).
 */
export interface Cotizacion {
  id: string
  clienteId: string
  /** Nombre guardado en registros antiguos que aún no tienen clienteId. */
  clienteNombre?: string
  servicio: string
  origen: string
  destino: string
  distancia: number
  peso: number
  precioUnitario: number
  cantidad: number
  descuentoPorcentaje: number
  subtotal: number
  baseImponible: number
  igv: number
  total: number
  fechaEmision: string
  fechaVencimiento: string
  estado: EstadoCotizacion
}

export type CotizacionWrite = Omit<Cotizacion, 'id'>
