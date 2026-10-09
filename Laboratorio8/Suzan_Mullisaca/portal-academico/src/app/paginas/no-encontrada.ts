import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Página no encontrada</h1>
    <p>La dirección solicitada no existe en este portal.</p>
    <a routerLink="/resumen" class="btn btn-primary">Volver al resumen</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoEncontrada {}