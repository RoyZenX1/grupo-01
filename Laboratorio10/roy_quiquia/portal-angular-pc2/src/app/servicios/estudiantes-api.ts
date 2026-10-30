import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { BorradorEstudiante, Estudiante } from '../modelos/estudiante';

export const API_URL = 'http://127.0.0.1:3000/estudiantes';

@Injectable({ providedIn: 'root' })
export class EstudiantesApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(API_URL);
  }

  obtener(id: string): Observable<Estudiante> {
    return this.http.get<Estudiante>(this.url(id));
  }

  crear(datos: BorradorEstudiante): Observable<Estudiante> {
    return this.http.post<Estudiante>(API_URL, datos);
  }

  actualizar(id: string, cambios: Partial<BorradorEstudiante>): Observable<Estudiante> {
    return this.http.patch<Estudiante>(this.url(id), cambios);
  }

  reemplazar(id: string, datos: BorradorEstudiante): Observable<Estudiante> {
    return this.http.put<Estudiante>(this.url(id), datos);
  }

  eliminar(id: string): Observable<unknown> {
    return this.http.delete<unknown>(this.url(id));
  }

  private url(id: string): string {
    return `${API_URL}/${encodeURIComponent(id)}`;
  }
}
