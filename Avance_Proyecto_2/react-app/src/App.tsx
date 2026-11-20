import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import {
  NotFoundPage,
  PlaceholderPage,
} from './pages/WorkspacePages'
import { VehiculoDetallePage } from './integrante3/vehiculos/VehiculoDetallePage'
import { VehiculosPage } from './integrante3/vehiculos/VehiculosPage'
import { ReportesPage } from './integrante4/reportes/reportesPage'
import { OrdenesPage } from './integrante4/ordenes/OrdenesPage'
import { ClientesPage } from './integrante1/clientes/ClientesPage'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <PlaceholderPage
                  title="Dashboard"
                  description="Este módulo será incorporado por el integrante responsable."
                />
              }
            />
            <Route
              path="clientes"
              element={<ClientesPage />}
            />
            <Route path="vehiculos" element={<VehiculosPage />} />
            <Route
              path="vehiculos/:codigo"
              element={<VehiculoDetallePage />}
            />
            <Route
              path="cotizaciones"
              element={
                <PlaceholderPage
                  title="Cotizaciones"
                  description="Aquí se incorporará la gestión de cotizaciones."
                />
              }
            />
            <Route
              path="ordenes"
              element={<OrdenesPage />}
              />
            <Route
              path="reportes"
              element={<ReportesPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
