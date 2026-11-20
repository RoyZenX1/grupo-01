import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { NotFoundPage } from './pages/WorkspacePages'
import { AuthProvider } from './integrante5/auth/auth.context'
import { LoginPage } from './integrante5/auth/LoginPage'
import { RequireAuth } from './integrante5/auth/RequireAuth'
import { DashboardPage } from './integrante5/dashboard/DashboardPage'
import { ReportesContainer } from './integrante5/integracion/ReportesContainer'
import { ClientesPage } from './integrante1/clientes/ClientesPage'
import { CotizacionesPage } from './integrante2/cotizaciones/CotizacionesPage'
import { VehiculoDetallePage } from './integrante3/vehiculos/VehiculoDetallePage'
import { VehiculosPage } from './integrante3/vehiculos/VehiculosPage'
import { OrdenesPage } from './integrante4/ordenes/OrdenesPage'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="cotizaciones" element={<CotizacionesPage />} />
                <Route path="vehiculos" element={<VehiculosPage />} />
                <Route
                  path="vehiculos/:codigo"
                  element={<VehiculoDetallePage />}
                />
                <Route path="ordenes" element={<OrdenesPage />} />
                <Route path="reportes" element={<ReportesContainer />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
