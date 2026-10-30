import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-panel-indicador',
  standalone: true,
  templateUrl: './panel-indicador.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelIndicador {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly ayuda = input('');
}
