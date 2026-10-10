import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    private auth = inject(AuthService);
    private router = inject(Router);

    email = signal('admin1@nexocargo.pe');
    clave = signal('admin123');
    mensaje = signal('');
    cargando = signal(false);

    onSubmit(event: Event): void {
        event.preventDefault();
        this.mensaje.set('');
        this.cargando.set(true);

        try {
            const sesion = this.auth.iniciarSesion(this.email(), this.clave());
            this.router.navigate(['/dashboard']);
        } catch (error) {
            this.mensaje.set(
                error instanceof Error ? error.message : 'Error al iniciar sesión.'
            );
        } finally {
            this.cargando.set(false);
        }
    }
}