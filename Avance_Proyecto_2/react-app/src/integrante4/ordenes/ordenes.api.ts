import { z } from 'zod'
import { http } from '../../shared/api/http'
import type { Orden, OrdenWrite } from './ordenes.types'

const recurso = (id: string) => `/ordenes/${encodeURIComponent(id)}`

const ordenSchema = z.object({
  id: z.coerce.string().min(1),
  codigo: z.string(),
  cotizacionId: z.string(),
  vehiculoId: z.string(),
  origen: z.string(),
  destino: z.string(),
  distancia: z.number(),
  peso: z.number(),
  tarifa: z.number(),
  estado: z.enum([
    'Pendiente',
    'Programada',
    'En ruta',
    'Completada',
    'Cancelada',
  ]),
})

export async function listarOrdenes(): Promise<Orden[]> {
  return z.array(ordenSchema).parse(await http.get('/ordenes'))
}

export async function obtenerOrden(id: string): Promise<Orden> {
  return ordenSchema.parse(await http.get(recurso(id)))
}

export async function crearOrden(datos: OrdenWrite): Promise<Orden> {
  return ordenSchema.parse(await http.post('/ordenes', datos))
}

export async function actualizarOrden(
  id: string,
  cambios: Partial<OrdenWrite>,
): Promise<Orden> {
  return ordenSchema.parse(await http.patch(recurso(id), cambios))
}

export async function eliminarOrden(id: string): Promise<void> {
  await http.delete(recurso(id))
}
