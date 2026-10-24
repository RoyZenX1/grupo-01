import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'resumen',
    pathMatch: 'full',
  },
  {
    path: 'resumen',
    loadComponent: () =>
      import('./pages/resumen').then((m) => m.Resumen),
    title: 'Resumen académico',
  },
  {
    path: 'estudiantes',
    loadComponent: () =>
      import('./pages/estudiantes').then((m) => m.Estudiantes),
    title: 'Estudiantes',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro').then((m) => m.Registro),
    title: 'Registro de estudiante',
  },
  {
    path: 'registro/:id',
    loadComponent: () =>
      import('./pages/registro').then((m) => m.Registro),
    title: 'Editar estudiante',
  },
  {
    path: 'informe',
    loadComponent: () =>
      import('./pages/informe').then((m) => m.Informe),
    title: 'Informe académico',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/no-encontrada').then((m) => m.NoEncontrada),
    title: 'Página no encontrada',
  },
];