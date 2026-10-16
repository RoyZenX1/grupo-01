import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/clientes';

  private clientesSignal = signal<Cliente[]>([]);
  readonly clientes = this.clientesSignal.asReadonly();

  cargar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl).pipe(
      tap(clientes => {
        const clientesNumerados = clientes.map((cliente, indice) => ({
          ...cliente,
          numero: cliente.numero ?? indice + 1
        }));

        this.clientesSignal.set(clientesNumerados);
      })
    );
  }

  registrar(datos: Omit<Cliente, 'id' | 'numero'>): Observable<Cliente> {
    const siguienteNumero = Math.max(
      0,
      ...this.clientesSignal().map(cliente => cliente.numero || 0)
    ) + 1;

    const nuevoCliente = {
      ...datos,
      numero: siguienteNumero
    };

    return this.http.post<Cliente>(this.apiUrl, nuevoCliente).pipe(
      tap(cliente => {
        this.clientesSignal.update(clientes => [...clientes, cliente]);
      })
    );
  }

  actualizar(
    id: string,
    datos: Omit<Cliente, 'id' | 'numero'>
  ): Observable<Cliente> {
    const clienteActual = this.clientesSignal().find(
      cliente => cliente.id === id
    );

    const clienteActualizado: Cliente = {
      ...datos,
      id,
      numero: clienteActual?.numero ?? 0
    };

    return this.http.put<Cliente>(
      `${this.apiUrl}/${id}`,
      clienteActualizado
    ).pipe(
      tap(cliente => {
        this.clientesSignal.update(clientes =>
          clientes.map(actual => actual.id === id ? cliente : actual)
        );
      })
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.clientesSignal.update(clientes =>
          clientes.filter(cliente => cliente.id !== id)
        );
      })
    );
  }
}
