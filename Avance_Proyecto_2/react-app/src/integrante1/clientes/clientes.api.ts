import { z } from 'zod'
import { http } from '../../shared/api/http'
import { clienteSchema } from './cliente.schema'
import type { Cliente, ClienteWrite } from './cliente.types'

export const CLIENTES_QUERY_KEY = ['clientes'] as const

const recurso = (id: string) => `/clientes/${encodeURIComponent(id)}`

export async function listarClientes(): Promise<Cliente[]> {
  return z.array(clienteSchema).parse(await http.get('/clientes'))
}

export async function obtenerCliente(id: string): Promise<Cliente> {
  return clienteSchema.parse(await http.get(recurso(id)))
}

export async function crearCliente(datos: ClienteWrite): Promise<Cliente> {
  return clienteSchema.parse(await http.post('/clientes', datos))
}

export async function actualizarCliente(
  id: string,
  cambios: Partial<ClienteWrite>,
): Promise<Cliente> {
  return clienteSchema.parse(await http.patch(recurso(id), cambios))
}

export async function eliminarCliente(id: string): Promise<void> {
  await http.delete(recurso(id))
}

export function nombreDeCliente(clientes: Cliente[], id: string): string {
  return clientes.find((cliente) => cliente.id === id)?.nombre ?? `Cliente ${id}`
}
