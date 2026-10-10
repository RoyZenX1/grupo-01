import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
        path: 'login',
        loadComponent: () =>
            import('./Integrante5/pages/login/login').then(m => m.Login)
    },

    {
        path: '',
        loadComponent: () =>
            import('./shared/layout/layout').then(m => m.Layout),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./Integrante5/pages/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'clientes',
                loadComponent: () =>
                    import('./Integrante1/pages/clientes/clientes').then(m => m.Clientes)
            },
            {
                path: 'cotizaciones',
                loadComponent: () =>
                    import('./Integrante2/pages/cotizaciones/cotizaciones').then(m => m.Cotizaciones)
            },
            {
                path: 'vehiculos',
                loadComponent: () =>
                    import('./Integrante3/pages/vehiculos/vehiculos').then(m => m.Vehiculos)
            },
            {
                path: 'ordenes',
                loadComponent: () =>
                    import('./Integrante3/pages/ordenes/ordenes').then(m => m.Ordenes)
            },
            {
                path: 'facturas',
                loadComponent: () =>
                    import('./Integrante4/pages/facturas/facturas').then(m => m.Facturas)
            },
            {
                path: 'reportes',
                loadComponent: () =>
                    import('./Integrante4/pages/reportes/reportes').then(m => m.Reportes)
            }
        ]
    },

    { path: '**', redirectTo: 'login' }
];