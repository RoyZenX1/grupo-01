import type { EstadoOrden, HistorialOrden, Orden } from './ordenes.types.ts'

/** Etapas normales del proceso, en orden. "Cancelada" queda fuera del flujo. */
export const ETAPAS_ORDEN: EstadoOrden[] = [
  'Pendiente',
  'Programada',
  'En ruta',
  'Completada',
]

const TRANSICIONES: Record<EstadoOrden, EstadoOrden[]> = {
  Pendiente: ['Programada', 'Cancelada'],
  Programada: ['En ruta', 'Cancelada'],
  'En ruta': ['Completada', 'Cancelada'],
  Completada: [],
  Cancelada: [],
}

export function estadosSiguientes(estado: EstadoOrden): EstadoOrden[] {
  return TRANSICIONES[estado]
}

export function puedeCambiarEstado(
  actual: EstadoOrden,
  nuevo: EstadoOrden,
): boolean {
  return TRANSICIONES[actual].includes(nuevo)
}

export function esEstadoFinal(estado: EstadoOrden): boolean {
  return TRANSICIONES[estado].length === 0
}

/** Estados que dejan libre al vehículo asignado. */
export function liberaVehiculo(estado: EstadoOrden): boolean {
  return estado === 'Completada' || estado === 'Cancelada'
}

export function agregarHistorial(
  orden: { historial?: Orden['historial'] },
  estado: EstadoOrden,
  fecha: string = new Date().toISOString(),
): HistorialOrden[] {
  return [...(orden.historial ?? []), { estado, fecha }]
}

export function fechaDeEstado(
  orden: { historial?: Orden['historial'] },
  estado: EstadoOrden,
): string | undefined {
  return orden.historial?.find((item) => item.estado === estado)?.fecha
}
