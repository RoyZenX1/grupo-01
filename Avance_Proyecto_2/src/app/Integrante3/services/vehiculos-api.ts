import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { BorradorVehiculo, Vehiculo } from '../models/vehiculo.model';

export const API_VEHICULOS = 'http://127.0.0.1:3000/vehiculos';

@Injectable({ providedIn: 'root' })
export class VehiculosApi {
    private readonly http = inject(HttpClient);

    listar(): Observable<Vehiculo[]> {
        return this.http.get<Vehiculo[]>(API_VEHICULOS);
    }

    obtener(id: string): Observable<Vehiculo> {
        return this.http.get<Vehiculo>(`${API_VEHICULOS}/${encodeURIComponent(id)}`);
    }

    crear(datos: Omit<Vehiculo, 'id' | 'codigo'> & { codigo: string }): Observable<Vehiculo> {
        return this.http.post<Vehiculo>(API_VEHICULOS, datos);
    }

    actualizar(id: string, cambios: Partial<Vehiculo>): Observable<Vehiculo> {
        return this.http.patch<Vehiculo>(
            `${API_VEHICULOS}/${encodeURIComponent(id)}`,
            cambios,
        );
    }

    reemplazar(id: string, datos: BorradorVehiculo): Observable<Vehiculo> {
        return this.http.put<Vehiculo>(
            `${API_VEHICULOS}/${encodeURIComponent(id)}`,
            datos,
        );
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${API_VEHICULOS}/${encodeURIComponent(id)}`);
    }
}