import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-no-autorizado',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './no-autorizado.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoAutorizado {
    readonly auth = inject(AuthService);
}
