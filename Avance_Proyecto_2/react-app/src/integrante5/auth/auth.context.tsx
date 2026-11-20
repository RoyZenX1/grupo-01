import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RolUsuario, Usuario } from './auth.types'
import { USUARIOS_DEMO } from './usuarios.demo'

const CLAVE_SESION = 'nexocargo.sesion'

interface AuthContextValue {
  usuario: Usuario | null
  login: (email: string, password: string) => Promise<Usuario>
  logout: () => void
  tieneRol: (...roles: RolUsuario[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function leerSesionGuardada(): Usuario | null {
  try {
    const guardado = window.localStorage.getItem(CLAVE_SESION)
    if (!guardado) return null
    const usuario = JSON.parse(guardado) as Usuario
    return typeof usuario?.id === 'string' ? usuario : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesionGuardada)

  const login = useCallback(async (email: string, password: string) => {
    // Simulación académica: pequeña espera para reproducir un inicio de sesión.
    await new Promise((resolve) => setTimeout(resolve, 500))

    const encontrado = USUARIOS_DEMO.find(
      (candidato) =>
        candidato.email.toLocaleLowerCase('es-PE') ===
          email.trim().toLocaleLowerCase('es-PE') &&
        candidato.password === password,
    )

    if (!encontrado) {
      throw new Error('Correo o contraseña incorrectos.')
    }

    const sesion: Usuario = {
      id: encontrado.id,
      nombre: encontrado.nombre,
      email: encontrado.email,
      rol: encontrado.rol,
    }
    window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
    setUsuario(sesion)
    return sesion
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(CLAVE_SESION)
    setUsuario(null)
  }, [])

  const tieneRol = useCallback(
    (...roles: RolUsuario[]) =>
      usuario !== null && roles.includes(usuario.rol),
    [usuario],
  )

  const valor = useMemo(
    () => ({ usuario, login, logout, tieneRol }),
    [usuario, login, logout, tieneRol],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }
  return contexto
}
