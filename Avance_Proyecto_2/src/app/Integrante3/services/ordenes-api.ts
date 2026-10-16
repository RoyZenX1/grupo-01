import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Orden, BorradorOrden } from '../models/orden.model';

export const API_ORDENES = 'http://127.0.0.1:3000/ordenes';

@Injectable({ providedIn: 'root' })
export class OrdenesApi {
    private readonly http = inject(HttpClient);

    listar(): Observable<Orden[]> {
        return this.http.get<Orden[]>(API_ORDENES);
    }

    obtener(id: string): Observable<Orden> {
        return this.http.get<Orden>(`${API_ORDENES}/${encodeURIComponent(id)}`);
    }

    crear(datos: BorradorOrden & { codigo: string; tarifa: number; estado: Orden['estado'] }): Observable<Orden> {
        return this.http.post<Orden>(API_ORDENES, datos);
    }

    actualizar(id: string, cambios: Partial<Orden>): Observable<Orden> {
        return this.http.patch<Orden>(
            `${API_ORDENES}/${encodeURIComponent(id)}`,
            cambios,
        );
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${API_ORDENES}/${encodeURIComponent(id)}`);
    }
}