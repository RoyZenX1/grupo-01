
import type {
  EstadoOrden,
  Orden,
  OrdenOrdenamiento,
  ResumenEstado,
  ResumenRuta,
  ResumenCotizacion,
} from './reportes.types.ts'

export const ESTADOS_ORDEN: EstadoOrden[] = [
  'Pendiente',
  'Programada',
  'En ruta',
  'Completada',
  'Cancelada',
]

export function normalizar(texto: string): string {
  return texto
    .toLocaleLowerCase('es-PE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function obtenerRuta(orden: Orden): string {
  return `${orden.origen} → ${orden.destino}`
}

export function filtrarOrdenes(
  ordenes: Orden[],
  texto: string,
  montoMin: number | null,
  montoMax: number | null,
  estadosSeleccionados: EstadoOrden[],
): Orden[] {
  const busqueda = normalizar(texto.trim())

  return ordenes.filter((orden) => {
    const contenido = normalizar(
      `${orden.codigo ?? orden.id} ${orden.cotizacionId} ${orden.vehiculoId} ${orden.origen} ${orden.destino}`,
    )

    const coincideTexto =
      !busqueda || contenido.includes(busqueda)

    const coincideMinimo =
      montoMin === null || orden.tarifa >= montoMin

    const coincideMaximo =
      montoMax === null || orden.tarifa <= montoMax

    const coincideEstado =
      estadosSeleccionados.length === 0 ||
      estadosSeleccionados.includes(orden.estado)

    return (
      coincideTexto &&
      coincideMinimo &&
      coincideMaximo &&
      coincideEstado
    )
  })
}

export function ordenarOrdenes(
  ordenes: Orden[],
  criterio: OrdenOrdenamiento,
): Orden[] {
  return [...ordenes].sort((a, b) => {
    switch (criterio) {
      case 'codigo-asc':
        return a.codigo.localeCompare(b.codigo, 'es', { numeric: true })

      case 'codigo-desc':
        return b.codigo.localeCompare(a.codigo, 'es', { numeric: true })

      case 'tarifa-asc':
        return a.tarifa - b.tarifa

      case 'tarifa-desc':
        return b.tarifa - a.tarifa

      case 'origen-asc':
        return a.origen.localeCompare(b.origen, 'es')

      case 'estado-asc':
        return a.estado.localeCompare(b.estado, 'es')

      default:
        return 0
    }
  })
}

export function calcularTotalTarifas(ordenes: Orden[]): number {
  return ordenes.reduce(
    (total, orden) => total + orden.tarifa,
    0,
  )
}

export function calcularTarifaPromedio(ordenes: Orden[]): number {
  if (ordenes.length === 0) return 0

  return calcularTotalTarifas(ordenes) / ordenes.length
}

export function contarCotizacionesVinculadas(
  ordenes: Orden[],
): number {
  return new Set(ordenes.map((orden) => orden.cotizacionId)).size
}

export function contarRutasUnicas(ordenes: Orden[]): number {
  return new Set(ordenes.map(obtenerRuta)).size
}

export function contarOrdenesEnCurso(ordenes: Orden[]): number {
  return ordenes.filter(
    (orden) =>
      orden.estado === 'En ruta' ||
      orden.estado === 'Programada',
  ).length
}

export function resumirEstados(
  ordenes: Orden[],
): ResumenEstado[] {
  return ESTADOS_ORDEN.map((estado) => {
    const lista = ordenes.filter(
      (orden) => orden.estado === estado,
    )

    return {
      estado,
      cantidad: lista.length,
      monto: calcularTotalTarifas(lista),
      porcentaje:
        ordenes.length === 0
          ? 0
          : (lista.length / ordenes.length) * 100,
    }
  })
}

export function resumirRutas(
  ordenes: Orden[],
): ResumenRuta[] {
  const mapa = new Map<string, ResumenRuta>()

  for (const orden of ordenes) {
    const ruta = obtenerRuta(orden)

    const grupo = mapa.get(ruta) ?? {
      ruta,
      cantidad: 0,
      monto: 0,
    }

    grupo.cantidad++
    grupo.monto += orden.tarifa

    mapa.set(ruta, grupo)
  }

  return [...mapa.values()].sort(
    (a, b) => b.monto - a.monto,
  )
}

export function resumirCotizaciones(
  ordenes: Orden[],
): ResumenCotizacion[] {
  const mapa = new Map<string, ResumenCotizacion>()

  for (const orden of ordenes) {
    const cotizacion = orden.cotizacionId

    const grupo = mapa.get(cotizacion) ?? {
      cotizacion,
      cantidad: 0,
      monto: 0,
    }

    grupo.cantidad++
    grupo.monto += orden.tarifa

    mapa.set(cotizacion, grupo)
  }

  return [...mapa.values()]
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 5)
}
