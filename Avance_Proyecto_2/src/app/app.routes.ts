import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { rolGuard } from './core/guards/rol.guard';

/**
 * Enrutamiento principal de NexoCargo.
 *
 * - `login`: pública (si ya hay sesión, redirige al dashboard).
 * - Rutas dentro del Layout: privadas. `authGuard` exige sesión y `rolGuard`
 *   comprueba el módulo (`data.modulo`) contra los permisos del rol.
 * - `**` va siempre al final: Angular usa la primera ruta que coincide.
 */
export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    {
        path: 'login',
        title: 'Iniciar sesión · NexoCargo',
        canActivate: [invitadoGuard],
        loadComponent: () =>
            import('./Integrante5/pages/login/login').then(m => m.Login)
    },

    {
        path: '',
        loadComponent: () =>
            import('./shared/layout/layout').then(m => m.Layout),
        canActivate: [authGuard],
        // canActivate solo corre al entrar al layout. Al moverse entre páginas hijas
        // ya activas hace falta canActivateChild para volver a comprobar la sesión.
        canActivateChild: [authGuard, rolGuard],
        children: [
            {
                path: 'dashboard',
                title: 'Dashboard · NexoCargo',
                data: { modulo: 'dashboard' },
                loadComponent: () =>
                    import('./Integrante5/pages/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'clientes',
                title: 'Clientes · NexoCargo',
                data: { modulo: 'clientes' },
                loadComponent: () =>
                    import('./Integrante1/pages/clientes/clientes').then(m => m.Clientes)
            },
            {
                path: 'cotizaciones',
                title: 'Cotizaciones · NexoCargo',
                data: { modulo: 'cotizaciones' },
                loadComponent: () =>
                    import('./Integrante2/pages/cotizaciones/cotizaciones').then(m => m.Cotizaciones)
            },
            {
                path: 'vehiculos',
                title: 'Vehículos · NexoCargo',
                data: { modulo: 'vehiculos' },
                loadComponent: () =>
                    import('./Integrante3/pages/vehiculos/vehiculos').then(m => m.Vehiculos)
            },
            {
                path: 'ordenes',
                title: 'Órdenes · NexoCargo',
                data: { modulo: 'ordenes' },
                loadComponent: () =>
                    import('./Integrante3/pages/ordenes/ordenes').then(m => m.Ordenes)
            },
            {
                path: 'reportes',
                title: 'Reportes · NexoCargo',
                data: { modulo: 'reportes' },
                loadComponent: () =>
                    import('./Integrante4/pages/reportes/reportes').then(m => m.Reportes)
            },
            {
                path: 'no-autorizado',
                title: 'Acceso restringido · NexoCargo',
                loadComponent: () =>
                    import('./Integrante5/pages/no-autorizado/no-autorizado').then(m => m.NoAutorizado)
            }
        ]
    },

    {
        path: '**',
        title: 'Página no encontrada · NexoCargo',
        loadComponent: () =>
            import('./Integrante5/pages/no-encontrada/no-encontrada').then(m => m.NoEncontrada)
    }
];
