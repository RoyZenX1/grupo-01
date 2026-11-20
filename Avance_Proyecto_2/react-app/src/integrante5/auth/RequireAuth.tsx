import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth.context'

export function RequireAuth() {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
