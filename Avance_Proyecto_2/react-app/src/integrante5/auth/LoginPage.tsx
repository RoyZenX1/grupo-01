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

const inputBase =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-all duration-200 focus:outline-none'

const inputNormal =
  'border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25'

const inputError =
  'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'

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
    <main className="grid min-h-screen place-items-center bg-[#f2f4f7] p-4 sm:p-6">
      <section
        className="w-full max-w-[430px] animate-[login-card-in_.55s_cubic-bezier(.22,.8,.35,1)_both] rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-24px_rgb(35_51_66/0.28)] motion-reduce:animate-none sm:p-8"
        aria-labelledby="login-titulo"
      >
        <div className="mb-7 text-center">
          <span className="block text-lg font-extrabold tracking-[0.14em] text-slate-800 before:mr-2 before:text-amber-500 before:content-['◉']">
            NexoCargo
          </span>
          <span className="mt-1 block text-[0.65rem] font-semibold tracking-[0.18em] text-slate-400">
            GESTIÓN LOGÍSTICA
          </span>
        </div>

        <h1
          id="login-titulo"
          className="mb-1.5 text-center text-2xl font-bold tracking-tight text-slate-800"
        >
          Iniciar sesión
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Ingresa con tu cuenta de demostración para continuar.
        </p>

        {errorAcceso && (
          <div
            className="mb-4 animate-[login-fade-in_.3s_ease-out_both] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 motion-reduce:animate-none"
            role="alert"
          >
            {errorAcceso}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-5">
          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-600"
              htmlFor="login-email"
            >
              Correo electrónico
            </label>
            <input
              className={`${inputBase} ${
                errors.email ? inputError : inputNormal
              }`}
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <div className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-1.5 block text-sm font-medium text-slate-600"
              htmlFor="login-password"
            >
              Contraseña
            </label>
            <input
              className={`${inputBase} ${
                errors.password ? inputError : inputNormal
              }`}
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <div className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </div>
            )}
          </div>

          <button
            className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-px hover:bg-slate-700 hover:shadow-[0_10px_24px_-10px_rgb(35_51_66/0.5)] active:scale-[0.99] active:bg-slate-900 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none motion-reduce:active:scale-100"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <aside
          className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4"
          aria-label="Cuentas de demostración"
        >
          <h2 className="text-sm font-bold text-slate-800">
            Cuentas de demostración
          </h2>
          <ul className="mb-2 mt-2 list-disc pl-5 text-[0.82rem] text-slate-600">
            <li className="mb-1">
              <strong>Administrador:</strong> admin@nexocargo.pe / demo1234
            </li>
            <li className="mb-1">
              <strong>Operador:</strong> operador@nexocargo.pe / demo1234
            </li>
          </ul>
          <p className="text-[0.75rem] text-slate-400">
            Autenticación de demostración académica, sin seguridad real.
          </p>
        </aside>
      </section>
    </main>
  )
}
