import { describe, expect, it } from 'vitest'
import { buscarTarifa, calcularTarifa } from './tarifas'

describe('tarifas', () => {
  it('selecciona la tarifa correcta en los límites de los rangos', () => {
    expect(buscarTarifa(50, 3)).toMatchObject({
      fila: 0,
      columna: 0,
      precio: 100,
    })
    expect(buscarTarifa(51, 4)).toMatchObject({
      fila: 1,
      columna: 1,
      precio: 230,
    })
    expect(buscarTarifa(200, 10)).toMatchObject({
      fila: 2,
      columna: 2,
      precio: 350,
    })
  })

  it('mantiene los límites máximos de distancia y peso', () => {
    expect(buscarTarifa(201, 5)).toBeUndefined()
    expect(buscarTarifa(100, 10.1)).toBeUndefined()
    expect(calcularTarifa(51, 4).precio).toBe(230)
    expect(() => calcularTarifa(201, 5)).toThrow(
      'El rango máximo es 200 km y 10 toneladas.',
    )
  })
})
