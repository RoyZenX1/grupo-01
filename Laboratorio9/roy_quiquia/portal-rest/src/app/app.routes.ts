import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'resumen', pathMatch: 'full' },
  {
    path: 'resumen',
    title: 'Resumen académico',
    loadComponent: () => import('./paginas/resumen').then((m) => m.Resumen),
  },
  {
    path: 'estudiantes',
    title: 'Estudiantes',
    loadComponent: () =>
      import('./paginas/estudiantes').then((m) => m.Estudiantes),
  },
  {
    path: 'registro',
    title: 'Registrar estudiante',
    loadComponent: () => import('./paginas/registro').then((m) => m.Registro),
  },
  {
    path: 'registro/:id',
    title: 'Editar estudiante',
    loadComponent: () => import('./paginas/registro').then((m) => m.Registro),
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./paginas/no-encontrada').then((m) => m.NoEncontrada),
  },
];