import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { PlaceholderPage } from '../pages/WorkspacePages'
import { AuthProvider } from '../integrante5/auth/auth.context'

describe('AppLayout', () => {
  it('renders the shared navigation and marks the active section', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/clientes']}>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                path="/clientes"
                element={
                  <PlaceholderPage
                    title="Clientes"
                    description="Gestión de clientes."
                  />
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('NexoCargo')
    expect(markup).toContain('Dashboard')
    expect(markup).toContain('Vehículos')
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain('Gestión de clientes.')
  })
})
