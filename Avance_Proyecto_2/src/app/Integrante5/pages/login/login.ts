import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface CuentaDemo {
    etiqueta: string;
    email: string;
    clave: string;
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
    private auth = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    readonly cuentasDemo: CuentaDemo[] = [
        { etiqueta: 'Administrador', email: 'admin1@nexocargo.pe',   clave: 'admin123' },
        { etiqueta: 'Cliente',       email: 'cliente1@nexocargo.pe', clave: 'cliente123' }
    ];

    email = signal(this.cuentasDemo[0].email);
    clave = signal(this.cuentasDemo[0].clave);
    mensaje = signal('');
    cargando = signal(false);

    usarCuenta(cuenta: CuentaDemo): void {
        this.email.set(cuenta.email);
        this.clave.set(cuenta.clave);
        this.mensaje.set('');
    }

    onSubmit(event: Event): void {
        event.preventDefault();
        this.mensaje.set('');
        this.cargando.set(true);

        try {
            this.auth.iniciarSesion(this.email(), this.clave());
            this.router.navigateByUrl(this.destino());
        } catch (error) {
            this.mensaje.set(
                error instanceof Error ? error.message : 'Error al iniciar sesión.'
            );
        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * Página a la que volver tras iniciar sesión. Solo se aceptan rutas internas
     * ("/algo"); un valor como "//sitio.com" o "https://..." se descarta para
     * evitar redirecciones hacia sitios externos.
     */
    private destino(): string {
        const solicitado = this.route.snapshot.queryParamMap.get('returnUrl');
        const esInterna = !!solicitado && solicitado.startsWith('/') && !solicitado.startsWith('//');
        return esInterna ? solicitado : '/dashboard';
    }
}
