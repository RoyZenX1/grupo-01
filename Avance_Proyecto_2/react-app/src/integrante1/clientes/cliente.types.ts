export interface Cliente {
  id: string
  nombre: string
  identificacion: string
  email: string
  telefono: string
}

export type ClienteWrite = Omit<Cliente, 'id'>
