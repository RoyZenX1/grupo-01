import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../Integrante5/services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.html',
    styleUrl: './layout.css'
})
export class Layout {
    sidebarCollapsed = signal(false);
    auth = inject(AuthService);

    toggleSidebar(): void {
        this.sidebarCollapsed.update(v => !v);
    }

    cerrarSesion(): void {
        this.auth.cerrarSesion();
    }
}