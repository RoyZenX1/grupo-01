import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Integrante5/services/auth.service';

/**
 * Protege las rutas privadas: sin sesión redirige al login y recuerda
 * a qué página quería entrar la persona (`returnUrl`).
 */
export const authGuard: CanActivateFn = (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.estaLogueado()) {
        return true;
    }

    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
};
