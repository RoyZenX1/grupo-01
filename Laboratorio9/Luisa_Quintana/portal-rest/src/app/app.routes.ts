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
import('./paginas/resumen').then((m) => m.Resumen),
},
];
