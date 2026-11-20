
import type { Orden, OrdenBorrador } from './ordenes.types.ts'
import type { CotizacionParaOrden } from './ordenes.types.ts'
import type { Vehiculo } from '../../integrante3/vehiculos/vehiculo.types.ts'
import { buscarTarifa } from '../../integrante3/vehiculos/tarifas.ts'

export interface ResultadoBorradorOrden {
  borrador: OrdenBorrador
  tarifaCalculada: number
}

export function prepararBorradorOrden(
  datos: OrdenBorrador,
  cotizaciones: CotizacionParaOrden[],
  vehiculos: Vehiculo[],
): ResultadoBorradorOrden {
  const cotizacionId = datos.cotizacionId.trim()
  const vehiculoId = datos.vehiculoId.trim()
  const origen = datos.origen.trim()
  const destino = datos.destino.trim()
  const distancia = Number(datos.distancia)
  const peso = Number(datos.peso)

  if (!cotizacionId) {
    throw new Error('Selecciona una cotización aprobada.')
  }

  if (!vehiculoId) {
    throw new Error('Selecciona un vehículo.')
  }

  if (origen.length < 3 || origen.length > 80) {
    throw new Error('El origen debe tener entre 3 y 80 caracteres.')
  }

  if (destino.length < 3 || destino.length > 80) {
    throw new Error('El destino debe tener entre 3 y 80 caracteres.')
  }

  if (!Number.isFinite(distancia) || distancia <= 0) {
    throw new Error('La distancia debe ser mayor que 0.')
  }

  if (!Number.isFinite(peso) || peso <= 0) {
    throw new Error('El peso debe ser mayor que 0.')
  }

  const cotizacion = cotizaciones.find(
    (item) => item.id === cotizacionId,
  )

  if (!cotizacion) {
    throw new Error('La cotización no existe.')
  }

  if (cotizacion.estado !== 'Aprobada') {
    throw new Error(
      'Solo se pueden registrar órdenes de cotizaciones aprobadas.',
    )
  }

  const vehiculo = vehiculos.find(
    (item) => item.id === vehiculoId,
  )

  if (!vehiculo) {
    throw new Error(`El vehículo "${vehiculoId}" no existe.`)
  }

  if (vehiculo.estado !== 'Disponible') {
    throw new Error(
      `El vehículo ${vehiculo.placa} no está disponible (${vehiculo.estado}).`,
    )
  }

  if (peso > vehiculo.capacidad) {
    throw new Error(
      `El peso (${peso} t) excede la capacidad de ${vehiculo.placa} (${vehiculo.capacidad} t).`,
    )
  }

  const tarifa = buscarTarifa(distancia, peso)

  if (!tarifa) {
    throw new Error(
      'Distancia o peso fuera de rango (máx. 200 km / 10 t).',
    )
  }

  return {
    borrador: {
      cotizacionId,
      vehiculoId,
      origen,
      destino,
      distancia,
      peso,
    },
    tarifaCalculada: tarifa.precio,
  }
}

export function siguienteCodigoOrden(ordenes: Orden[]): string {
  const numeros = ordenes
    .map((orden) => /^ORD(\d+)$/.exec(orden.codigo ?? orden.id))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]))

  const siguiente =
    numeros.length > 0 ? Math.max(...numeros) + 1 : 1

  return `ORD${String(siguiente).padStart(3, '0')}`
}
