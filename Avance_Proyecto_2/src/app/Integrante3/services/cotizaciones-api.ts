import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Cotizacion } from '../models/cotizacion.model';

export const API_COTIZACIONES = 'http://127.0.0.1:3000/cotizaciones';

@Injectable({ providedIn: 'root' })
export class CotizacionesApi {
    private readonly http = inject(HttpClient);

    listarAprobadas(): Observable<Cotizacion[]> {
        return this.http.get<Cotizacion[]>(`${API_COTIZACIONES}?estado=Aprobada`);
    }
}