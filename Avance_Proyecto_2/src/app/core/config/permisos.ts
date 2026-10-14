import { Rol } from '../../Integrante5/models/usuario.model';

/** Módulos de la aplicación que se pueden proteger por rol. */
export type Modulo =
    | 'dashboard'
    | 'clientes'
    | 'cotizaciones'
    | 'vehiculos'
    | 'ordenes'
    | 'facturas'
    | 'reportes';

export interface ItemMenu {
    modulo: Modulo;
    ruta: string;
    etiqueta: string;
    icono: string;
    roles: readonly Rol[];
}

const TODOS: readonly Rol[] = ['administrador', 'cliente'];
const SOLO_ADMIN: readonly Rol[] = ['administrador'];

/**
 * Única fuente de verdad de la navegación y de los permisos por rol.
 *
 * - El menú del layout se genera a partir de esta lista.
 * - El `rolGuard` consulta esta lista para proteger las rutas.
 *
 * Para dar o quitar acceso a un rol basta con cambiar `roles` aquí.
 */
export const ITEMS_MENU: readonly ItemMenu[] = [
    { modulo: 'dashboard',    ruta: '/dashboard',    etiqueta: 'Dashboard',    icono: '⌂', roles: TODOS },
    { modulo: 'clientes',     ruta: '/clientes',     etiqueta: 'Clientes',     icono: '♙', roles: SOLO_ADMIN },
    { modulo: 'cotizaciones', ruta: '/cotizaciones', etiqueta: 'Cotizaciones', icono: '▣', roles: TODOS },
    { modulo: 'vehiculos',    ruta: '/vehiculos',    etiqueta: 'Vehículos',    icono: '▤', roles: SOLO_ADMIN },
    { modulo: 'ordenes',      ruta: '/ordenes',      etiqueta: 'Órdenes',      icono: '➜', roles: SOLO_ADMIN },
    { modulo: 'facturas',     ruta: '/facturas',     etiqueta: 'Facturas',     icono: '▥', roles: TODOS },
    { modulo: 'reportes',     ruta: '/reportes',     etiqueta: 'Reportes',     icono: '▦', roles: SOLO_ADMIN }
];

/** Ítems de menú a los que un rol tiene acceso. Sin rol no hay acceso a nada. */
export function itemsPermitidos(rol: Rol | null | undefined): ItemMenu[] {
    if (!rol) return [];
    return ITEMS_MENU.filter(item => item.roles.includes(rol));
}

/** Indica si un rol puede entrar al módulo indicado. */
export function puedeAcceder(rol: Rol | null | undefined, modulo: Modulo): boolean {
    if (!rol) return false;
    const item = ITEMS_MENU.find(i => i.modulo === modulo);
    return item ? item.roles.includes(rol) : false;
}
