
export type EstadoOrden =
  | 'Pendiente'
  | 'Programada'
  | 'En ruta'
  | 'Completada'
  | 'Cancelada'

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

export type OrdenOrdenamiento =
  | 'codigo-asc'
  | 'codigo-desc'
  | 'tarifa-asc'
  | 'tarifa-desc'
  | 'origen-asc'
  | 'estado-asc'

export interface ResumenEstado {
  estado: EstadoOrden
  cantidad: number
  monto: number
  porcentaje: number
}

export interface ResumenRuta {
  ruta: string
  cantidad: number
  monto: number
}

export interface ResumenCotizacion {
  cotizacion: string
  cantidad: number
  monto: number
}
