import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Sesion, Usuario } from '../models/usuario.model';

const CLAVE_SESION = 'nexocargo_sesion';

const USUARIOS_INICIALES: Usuario[] = [
    { id: 'U001', nombre: 'Roy',     email: 'admin1@nexocargo.pe', clave: 'admin123', rol: 'administrador' },
    { id: 'U002', nombre: 'Nicolas', email: 'admin2@nexocargo.pe', clave: 'admin123', rol: 'administrador' },
    { id: 'U003', nombre: 'Suzan',   email: 'admin3@nexocargo.pe', clave: 'admin123', rol: 'administrador' },
    { id: 'U004', nombre: 'Katy',    email: 'admin4@nexocargo.pe', clave: 'admin123', rol: 'administrador' },
    { id: 'U005', nombre: 'Jose',    email: 'admin5@nexocargo.pe', clave: 'admin123', rol: 'administrador' }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
    private router = inject(Router);

    private sesionSignal = signal<Sesion | null>(null);

    readonly sesion = this.sesionSignal.asReadonly();
    readonly estaLogueado = computed(() => this.sesionSignal() !== null);
    readonly esAdmin = computed(() => this.sesionSignal()?.rol === 'administrador');

    constructor() {
        this.cargarSesion();
    }

    iniciarSesion(email: string, clave: string): Sesion {
        const emailLimpio = email.trim().toLowerCase();

        if (!emailLimpio || !clave) {
            throw new Error('Ingresa el correo y la clave.');
        }

        const usuario = USUARIOS_INICIALES.find(
            u => u.email === emailLimpio && u.clave === clave
        );

        if (!usuario) {
            throw new Error('Credenciales incorrectas. Verifica tu correo y clave.');
        }

        const sesion: Sesion = {
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        this.sesionSignal.set(sesion);
        return sesion;
    }

    cerrarSesion(): void {
        localStorage.removeItem(CLAVE_SESION);
        this.sesionSignal.set(null);
        this.router.navigate(['/login']);
    }

    private cargarSesion(): void {
        try {
            const datos = localStorage.getItem(CLAVE_SESION);
            if (!datos) return;

            const sesion = JSON.parse(datos) as Sesion;
            if (sesion && sesion.email && sesion.rol) {
                this.sesionSignal.set(sesion);
            }
        } catch {
            localStorage.removeItem(CLAVE_SESION);
        }
    }
}