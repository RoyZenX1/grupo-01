
export const ESTADOS_ORDEN = [
  'Pendiente',
  'Programada',
  'En ruta',
  'Completada',
  'Cancelada',
] as const

export type EstadoOrden = (typeof ESTADOS_ORDEN)[number]

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
  estado: string
  origen: string
  destino: string
  distancia: number
  peso: number
}