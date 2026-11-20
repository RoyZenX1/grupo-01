import { z } from 'zod'
import { http } from '../../shared/api/http'
import { vehiculoSchema } from './vehiculo.schema'
import type { Vehiculo, VehiculoWrite } from './vehiculo.types'

const recurso = (id: string) => `/vehiculos/${encodeURIComponent(id)}`

export async function listarVehiculos(): Promise<Vehiculo[]> {
  return z.array(vehiculoSchema).parse(await http.get('/vehiculos'))
}

export async function obtenerVehiculoPorCodigo(codigo: string): Promise<Vehiculo> {
  const url = `/vehiculos?codigo=${encodeURIComponent(codigo)}`
  const vehiculos = z.array(vehiculoSchema).parse(await http.get(url))
  const vehiculo = vehiculos.find((item) => item.codigo === codigo)

  if (!vehiculo) {
    throw new Error(`No se encontró el vehículo ${codigo}.`)
  }

  return vehiculo
}

export async function crearVehiculo(datos: VehiculoWrite): Promise<Vehiculo> {
  return vehiculoSchema.parse(await http.post('/vehiculos', datos))
}

export async function actualizarVehiculo(
  id: string,
  cambios: Partial<VehiculoWrite>,
): Promise<Vehiculo> {
  return vehiculoSchema.parse(await http.patch(recurso(id), cambios))
}

export async function eliminarVehiculo(id: string): Promise<void> {
  await http.delete(recurso(id))
}
