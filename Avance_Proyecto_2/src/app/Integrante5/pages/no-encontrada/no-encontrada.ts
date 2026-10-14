import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-no-encontrada',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './no-encontrada.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoEncontrada {}

