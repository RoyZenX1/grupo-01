import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cotizacion } from '../models/cotizacion.model';

@Injectable({
    providedIn: 'root'
})
export class CotizacionesService {
    private apiUrl = 'http://localhost:3000/cotizaciones';

    constructor(private http: HttpClient) { }

    obtenerCotizaciones(): Observable<Cotizacion[]> {
        return this.http.get<Cotizacion[]>(this.apiUrl);
    }

    crearCotizacion(cotizacion: Cotizacion): Observable<Cotizacion> {
        return this.http.post<Cotizacion>(this.apiUrl, cotizacion);
    }

    eliminarCotizacion(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}