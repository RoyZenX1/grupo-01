import { Injectable, signal } from '@angular/core';
import { Cliente } from '../models/cliente.model';
import { CLIENTES_INICIALES } from '../models/datos-iniciales';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private clientesSignal = signal<Cliente[]>(
    CLIENTES_INICIALES.map(cliente => ({ ...cliente }))
  );

  readonly clientes = this.clientesSignal.asReadonly();


  registrar(datos: Omit<Cliente, 'id'>): Cliente {

    const nuevoCliente: Cliente = {
      id: String(
        Math.max(0, ...this.clientesSignal().map(cliente => Number(cliente.id) || 0)) + 1
      ),
      nombre: datos.nombre,
      identificacion: datos.identificacion,
      email: datos.email,
      telefono: datos.telefono
    };


    this.clientesSignal.update(clientes => [
      ...clientes,
      nuevoCliente
    ]);



    return nuevoCliente;
  }


  actualizar(id: string, datos: Omit<Cliente, 'id'>): void {
    this.clientesSignal.update(clientes =>
      clientes.map(cliente =>
        cliente.id === id
          ? { ...datos, id }
          : cliente
      )
    );
  }

  eliminar(id: string): void {
    this.clientesSignal.update(clientes =>
      clientes.filter(cliente => cliente.id !== id)
    );
  }

  restaurar(): void {
    this.clientesSignal.set(
      CLIENTES_INICIALES.map(cliente => ({ ...cliente }))
    );
  }
}

