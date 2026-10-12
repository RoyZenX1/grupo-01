import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { BorradorEstudiante, Estudiante } from '../models/estudiante';

export const API_URL = 'http://127.0.0.1:3000/estudiantes';

@Injectable({ providedIn: 'root' })
export class EstudiantesApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(API_URL);
  }

  obtener(id: string): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${API_URL}/${encodeURIComponent(id)}`);
  }

  crear(datos: BorradorEstudiante): Observable<Estudiante> {
    return this.http.post<Estudiante>(API_URL, datos);
  }

  actualizar(id: string, cambios: Partial<BorradorEstudiante>): Observable<Estudiante> {
    return this.http.patch<Estudiante>(`${API_URL}/${encodeURIComponent(id)}`, cambios);
  }

  reemplazar(id: string, datos: BorradorEstudiante): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${API_URL}/${encodeURIComponent(id)}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${encodeURIComponent(id)}`);
  }
}
