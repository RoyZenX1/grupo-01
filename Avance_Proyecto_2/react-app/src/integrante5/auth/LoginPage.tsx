import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from './auth.context'
import './auth.css'

const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorAcceso, setErrorAcceso] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (usuario) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setErrorAcceso('')
    try {
      await login(values.email, values.password)
      const destino =
        (location.state as { from?: string } | null)?.from ?? '/dashboard'
      navigate(destino, { replace: true })
    } catch (error) {
      setErrorAcceso(
        error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
      )
    }
  }

  return (
    <main className="login-page">
      <section className="login-card workspace-card" aria-labelledby="login-titulo">
        <div className="login-brand">
          <span className="app-brand-name">NexoCargo</span>
          <span className="app-brand-caption">GESTIÓN LOGÍSTICA</span>
        </div>

        <h1 id="login-titulo">Iniciar sesión</h1>
        <p className="login-subtitulo">
          Ingresa con tu cuenta de demostración para continuar.
        </p>

        {errorAcceso && (
          <div className="alert alert-danger" role="alert">
            {errorAcceso}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              className={`form-control${errors.email ? ' is-invalid' : ''}`}
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              className={`form-control${errors.password ? ' is-invalid' : ''}`}
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <aside className="login-demo" aria-label="Cuentas de demostración">
          <h2>Cuentas de demostración</h2>
          <ul>
            <li>
              <strong>Administrador:</strong> admin@nexocargo.pe / demo1234
            </li>
            <li>
              <strong>Operador:</strong> operador@nexocargo.pe / demo1234
            </li>
          </ul>
          <p>Autenticación de demostración académica, sin seguridad real.</p>
        </aside>
      </section>
    </main>
  )
}
