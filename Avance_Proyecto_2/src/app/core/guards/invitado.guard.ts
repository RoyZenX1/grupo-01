import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Integrante5/services/auth.service';

/** Evita mostrar el login a quien ya tiene sesión: lo envía al dashboard. */
export const invitadoGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.estaLogueado() ? router.createUrlTree(['/dashboard']) : true;
};
