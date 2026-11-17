export interface ResultadoTarifa {
  distancia: number
  peso: number
  precio: number
}

export const RANGOS_DISTANCIA = [
  { etiqueta: 'Hasta 50 km', maximo: 50 },
  { etiqueta: 'Más de 50 hasta 100 km', maximo: 100 },
  { etiqueta: 'Más de 100 hasta 200 km', maximo: 200 },
] as const

export const RANGOS_PESO = [
  { etiqueta: 'Hasta 3 t', maximo: 3 },
  { etiqueta: 'Más de 3 hasta 7 t', maximo: 7 },
  { etiqueta: 'Más de 7 hasta 10 t', maximo: 10 },
] as const

export const MATRIZ_TARIFAS = [
  [100, 150, 200],
  [180, 230, 280],
  [250, 300, 350],
] as const

export interface SeleccionTarifa {
  fila: number
  columna: number
  precio: number
}

export function buscarTarifa(
  distancia: number,
  peso: number,
): SeleccionTarifa | undefined {
  if (!Number.isFinite(distancia) || !Number.isFinite(peso)) {
    return undefined
  }

  const fila = RANGOS_DISTANCIA.findIndex(
    ({ maximo }) => distancia > 0 && distancia <= maximo,
  )
  const columna = RANGOS_PESO.findIndex(
    ({ maximo }) => peso > 0 && peso <= maximo,
  )

  if (fila === -1 || columna === -1) {
    return undefined
  }

  return {
    fila,
    columna,
    precio: MATRIZ_TARIFAS[fila][columna],
  }
}

export function calcularTarifa(
  distancia: number,
  peso: number,
): ResultadoTarifa {
  if (!Number.isFinite(distancia) || !Number.isFinite(peso)) {
    throw new Error('Distancia y peso deben ser números válidos.')
  }
  if (distancia <= 0 || peso <= 0) {
    throw new Error('Distancia y peso deben ser mayores que 0.')
  }

  const seleccion = buscarTarifa(distancia, peso)
  if (!seleccion) {
    throw new Error('El rango máximo es 200 km y 10 toneladas.')
  }

  return { distancia, peso, precio: seleccion.precio }
}
