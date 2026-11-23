
export const ESTADOS_ORDEN = [
  'Pendiente',
  'Programada',
  'En ruta',
  'Completada',
  'Cancelada',
] as const

export type EstadoOrden = (typeof ESTADOS_ORDEN)[number]

export interface HistorialOrden {
  estado: EstadoOrden
  fecha: string
}

export interface Orden {
  id: string
  codigo: string
  cotizacionId: string
  vehiculoId: string
  origen: string
  destino: string
  distancia: number
  peso: number
  tarifa: number
  estado: EstadoOrden
  /** Seguimiento de cambios de estado. Las órdenes antiguas no lo tienen. */
  historial?: HistorialOrden[]
}

export interface OrdenBorrador {
  cotizacionId: string
  vehiculoId: string
  origen: string
  destino: string
  distancia: number
  peso: number
}

export type OrdenWrite = Omit<Orden, 'id'>

export interface CotizacionParaOrden {
  id: string
  codigo?: string
  estado: string
  origen: string
  destino: string
  distancia: number
  peso: number
}