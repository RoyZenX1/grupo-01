export type Rol = 'administrador' | 'cliente';

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    clave: string;
    rol: Rol;
}

export interface Sesion {
    nombre: string;
    email: string;
    rol: Rol;
}