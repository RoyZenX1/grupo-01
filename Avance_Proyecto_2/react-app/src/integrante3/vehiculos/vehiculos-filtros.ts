import type { Vehiculo } from './vehiculo.types'

export interface FiltrosVehiculos {
  busqueda: string
  estado: string
  tipo: string
}

export function filtrarVehiculos(
  vehiculos: Vehiculo[],
  filtros: FiltrosVehiculos,
): Vehiculo[] {
  const busqueda = filtros.busqueda.trim().toLocaleLowerCase()

  return vehiculos.filter((vehiculo) => {
    const coincideBusqueda =
      !busqueda ||
      [vehiculo.codigo, vehiculo.placa, vehiculo.modelo ?? ''].some((valor) =>
        valor.toLocaleLowerCase().includes(busqueda),
      )
    const coincideEstado = !filtros.estado || vehiculo.estado === filtros.estado
    const coincideTipo = !filtros.tipo || vehiculo.tipo === filtros.tipo

    return coincideBusqueda && coincideEstado && coincideTipo
  })
}

export function esPlacaDuplicada(
  vehiculos: Vehiculo[],
  placa: string,
  idExcluido?: string,
): boolean {
  const placaNormalizada = placa.trim().toLocaleUpperCase()

  return vehiculos.some(
    (vehiculo) =>
      vehiculo.id !== idExcluido &&
      vehiculo.placa.trim().toLocaleUpperCase() === placaNormalizada,
  )
}
