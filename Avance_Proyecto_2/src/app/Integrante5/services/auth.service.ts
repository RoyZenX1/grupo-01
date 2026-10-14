import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Rol, Sesion, Usuario } from '../models/usuario.model';
import { ItemMenu, Modulo, itemsPermitidos, puedeAcceder } from '../../core/config/permisos';

const CLAVE_SESION = 'nexocargo_sesion';

/**
 * Usuarios de demostración del Avance 2.
 * En un sistema real esta validación vive en el backend; las claves
 * nunca se guardan ni se comparan en el navegador.
 */
export const USUARIOS_INICIALES: Usuario[] = [
    { id: 'U001', nombre: 'Roy',     email: 'admin1@nexocargo.pe',   clave: 'admin123',   rol: 'administrador' },
    { id: 'U002', nombre: 'Nicolas', email: 'admin2@nexocargo.pe',   clave: 'admin123',   rol: 'administrador' },
    { id: 'U003', nombre: 'Suzan',   email: 'admin3@nexocargo.pe',   clave: 'admin123',   rol: 'administrador' },
    { id: 'U004', nombre: 'Katy',    email: 'admin4@nexocargo.pe',   clave: 'admin123',   rol: 'administrador' },
    { id: 'U005', nombre: 'Jose',    email: 'admin5@nexocargo.pe',   clave: 'admin123',   rol: 'administrador' },
    { id: 'U006', nombre: 'Cliente', email: 'cliente1@nexocargo.pe', clave: 'cliente123', rol: 'cliente' }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
    private router = inject(Router);

    private sesionSignal = signal<Sesion | null>(null);

    readonly sesion = this.sesionSignal.asReadonly();
    readonly estaLogueado = computed(() => this.sesionSignal() !== null);
    readonly rol = computed<Rol | null>(() => this.sesionSignal()?.rol ?? null);
    readonly esAdmin = computed(() => this.rol() === 'administrador');

    /** Opciones de menú visibles para el rol de la sesión actual. */
    readonly menu = computed<ItemMenu[]>(() => itemsPermitidos(this.rol()));

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

        const sesion = this.crearSesion(usuario);

        this.guardarSesion(sesion);
        this.sesionSignal.set(sesion);
        return sesion;
    }

    cerrarSesion(): void {
        try {
            localStorage.removeItem(CLAVE_SESION);
        } catch {
            // El almacenamiento puede no estar disponible; la sesión en memoria se limpia igual.
        }
        this.sesionSignal.set(null);
        this.router.navigate(['/login']);
    }

    /** ¿El rol de la sesión es alguno de los indicados? */
    tieneRol(...roles: Rol[]): boolean {
        const actual = this.rol();
        return actual !== null && roles.includes(actual);
    }

    /** ¿La sesión actual puede entrar al módulo indicado? */
    puedeAcceder(modulo: Modulo): boolean {
        return puedeAcceder(this.rol(), modulo);
    }

    private crearSesion(usuario: Usuario): Sesion {
        return { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
    }

    private guardarSesion(sesion: Sesion): void {
        try {
            localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        } catch {
            // Sin almacenamiento la sesión dura solo hasta recargar la página.
        }
    }

    private cargarSesion(): void {
        try {
            const datos = localStorage.getItem(CLAVE_SESION);
            if (!datos) return;

            const guardada = JSON.parse(datos) as Partial<Sesion> | null;
            const usuario = USUARIOS_INICIALES.find(u => u.email === guardada?.email);

            // El rol se toma siempre de la lista de usuarios, no de lo guardado:
            // así un valor alterado en el navegador no concede permisos.
            if (usuario) {
                this.sesionSignal.set(this.crearSesion(usuario));
            } else {
                localStorage.removeItem(CLAVE_SESION);
            }
        } catch {
            try {
                localStorage.removeItem(CLAVE_SESION);
            } catch {
                // nada más que hacer
            }
        }
    }
}
