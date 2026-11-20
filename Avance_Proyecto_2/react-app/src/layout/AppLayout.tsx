import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../integrante5/auth/auth.context'

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { path: '/clientes', label: 'Clientes', icon: '♙' },
  { path: '/vehiculos', label: 'Vehículos', icon: '▤' },
  { path: '/cotizaciones', label: 'Cotizaciones', icon: '▣' },
  { path: '/ordenes', label: 'Órdenes', icon: '➜' },
  { path: '/reportes', label: 'Reportes', icon: '▦' },
]

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function cerrarSesion() {
    logout()
    navigate('/login', { replace: true })
  }
  const currentPage = navigation.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  )

  return (
    <div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <a className="app-skip-link" href="#contenido">Saltar al contenido</a>
      <aside aria-label="Navegación principal" className="app-sidebar">
        <button
          aria-controls="app-navigation"
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          className="app-sidebar-toggle"
          type="button"
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
        >
          <span />
          <span />
          <span />
        </button>
        <NavLink
          className="app-brand"
          to="/dashboard"
        >
          <span>
            <span className="app-brand-name">NexoCargo</span>
            <span className="app-brand-caption">GESTIÓN LOGÍSTICA</span>
          </span>
        </NavLink>

        <nav id="app-navigation">
          {navigation.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              className={({ isActive }) =>
                `app-nav-link${isActive ? ' active' : ''}`
              }
              data-icono={icon}
              to={path}
              title={label}
            >
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <p className="app-sidebar-note">Plataforma de operaciones</p>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <nav aria-label="Ubicación actual" className="app-breadcrumb">
            <span>NexoCargo</span>
            <span aria-hidden="true">/</span>
            <strong>{currentPage?.label ?? 'Página no encontrada'}</strong>
          </nav>
          <div className="app-topbar-context">
            <span aria-hidden="true" className="app-topbar-avatar">
              {usuario?.nombre.charAt(0) ?? 'N'}
            </span>
            <div className="app-topbar-user">
              <span className="app-topbar-title">
                {usuario?.nombre ?? 'NexoCargo'}
              </span>
              <span className="app-topbar-label">
                {usuario?.rol ?? 'Gestión logística'}
              </span>
            </div>
            <button
              className="app-logout"
              type="button"
              onClick={cerrarSesion}
            >
              Salir
            </button>
          </div>
        </header>
        <div className="app-content" id="contenido" tabIndex={-1}>
          <Outlet />
        </div>
        <footer className="app-footer">
          NexoCargo | Sistema de gestión logística | Avance 3
        </footer>
      </div>
    </div>
  )
}
