import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Página no encontrada</h1>
    <p>La dirección solicitada no corresponde a una vista del portal.</p>
    <a routerLink="/resumen" class="btn btn-primary">Volver al resumen</a>
  `,
})
export class NoEncontrada {}
