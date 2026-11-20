export type RolUsuario = 'Administrador' | 'Operador'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
}

export interface CredencialesLogin {
  email: string
  password: string
}

export interface UsuarioDemo extends Usuario {
  password: string
}
