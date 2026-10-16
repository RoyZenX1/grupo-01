import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { CotizacionTransporte } from '../models/cotizacion-transporte.model';

export const API_COTIZACIONES = 'http://127.0.0.1:3000/cotizaciones';

@Injectable({ providedIn: 'root' })
export class CotizacionesApi {
    private readonly http = inject(HttpClient);

    listarAprobadas(): Observable<CotizacionTransporte[]> {
        return this.http.get<CotizacionTransporte[]>(`${API_COTIZACIONES}?estado=Aprobada`);
    }
}