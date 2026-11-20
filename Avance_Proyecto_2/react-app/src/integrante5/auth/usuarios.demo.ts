import type { UsuarioDemo } from './auth.types'

/**
 * Usuarios de demostración académica.
 * No representan un sistema de autenticación real ni de producción.
 */
export const USUARIOS_DEMO: readonly UsuarioDemo[] = [
  {
    id: 'U001',
    nombre: 'Ana Torres',
    email: 'admin@nexocargo.pe',
    password: 'demo1234',
    rol: 'Administrador',
  },
  {
    id: 'U002',
    nombre: 'Luis Vega',
    email: 'operador@nexocargo.pe',
    password: 'demo1234',
    rol: 'Operador',
  },
]
