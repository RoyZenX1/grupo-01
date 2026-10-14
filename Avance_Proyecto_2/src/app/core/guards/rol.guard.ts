import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../../Integrante5/services/auth.service';
import { Modulo } from '../config/permisos';

/**
 * Autorización por rol. Se aplica una sola vez como `canActivateChild` en el layout:
 * cada ruta hija declara su módulo en `data: { modulo: '...' }` y los permisos
 * se consultan en `core/config/permisos.ts`.
 *
 * Una ruta sin `data.modulo` (por ejemplo `no-autorizado`) queda abierta
 * a cualquier persona con sesión.
 */
export const rolGuard: CanActivateChildFn = (childRoute) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const modulo = childRoute.data['modulo'] as Modulo | undefined;

    if (!modulo || auth.puedeAcceder(modulo)) {
        return true;
    }

    return router.createUrlTree(['/no-autorizado'], {
        queryParams: { modulo }
    });
};
