export const ESTADOS_VEHICULO = [
  'Disponible',
  'Ocupado',
  'Mantenimiento',
  'Reservado',
] as const

export const TIPOS_VEHICULO = [
  'Camión',
  'Furgón',
  'Camioneta',
  'Tráiler',
] as const

export type EstadoVehiculo = (typeof ESTADOS_VEHICULO)[number]
export type TipoVehiculo = (typeof TIPOS_VEHICULO)[number]

export function esEstadoVehiculo(value: string): value is EstadoVehiculo {
  return ESTADOS_VEHICULO.some((estado) => estado === value)
}

export interface Vehiculo {
  id: string
  codigo: string
  placa: string
  modelo?: string
  tipo: TipoVehiculo
  capacidad: number
  estado: EstadoVehiculo
}

export interface VehiculoWrite {
  codigo: string
  placa: string
  modelo: string
  tipo: TipoVehiculo
  capacidad: number
  estado: EstadoVehiculo
}
