import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../Integrante5/services/auth.service';
import { ITEMS_MENU } from '../../core/config/permisos';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.html',
    styleUrl: './layout.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout {
    private router = inject(Router);
    readonly auth = inject(AuthService);

    sidebarCollapsed = signal(false);

    /** Ruta actual (sin parámetros), actualizada en cada navegación. */
    private rutaActual = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map(e => e.urlAfterRedirects.split(/[?#]/)[0])
        ),
        { initialValue: this.router.url.split(/[?#]/)[0] }
    );

    /** Nombre de la sección actual para la barra superior. */
    readonly paginaActual = computed(() => {
        const ruta = this.rutaActual();
        if (ruta.startsWith('/no-autorizado')) return 'Acceso restringido';
        return ITEMS_MENU.find(item => ruta.startsWith(item.ruta))?.etiqueta ?? 'Inicio';
    });

    readonly inicial = computed(
        () => (this.auth.sesion()?.nombre ?? '?').charAt(0).toUpperCase()
    );

    readonly anio = new Date().getFullYear();

    toggleSidebar(): void {
        this.sidebarCollapsed.update(v => !v);
    }

    cerrarSesion(): void {
        this.auth.cerrarSesion();
    }
}
