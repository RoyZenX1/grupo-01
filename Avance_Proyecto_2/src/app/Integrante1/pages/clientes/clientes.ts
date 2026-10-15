import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';
import {
  validarDNI,
  validarRUC,
  validarCorreo
} from '../../utils/validations';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes {
  private clientesService = inject(ClientesService);

  readonly clientes = this.clientesService.clientes;

  
busqueda = signal('');

readonly clientesFiltrados = () => {
  const texto = this.busqueda().trim().toLowerCase();

  return this.clientes().filter(cliente =>
    cliente.nombre.toLowerCase().includes(texto) ||
    cliente.identificacion.includes(texto)
  );
};


  formulario: Omit<Cliente, 'id'> = {
    nombre: '',
    identificacion: '',
    email: '',
    telefono: ''
  };

  idEditando: string | null = null;

  mensaje = signal('');
  tipoMensaje = signal<'exito' | 'error'>('exito');

  guardar(): void {
    this.mensaje.set('');


    const nombre = String(this.formulario.nombre ?? '').trim();
    const identificacion = String(this.formulario.identificacion ?? '').trim();
    const email = String(this.formulario.email ?? '').trim();
    const telefono = String(this.formulario.telefono ?? '').trim();


    if (!nombre || !identificacion || !email || !telefono) {
      this.mostrarError('Completa todos los campos.');
      return;
    }

    if (
      !validarDNI(identificacion) &&
      !validarRUC(identificacion)
    ) {
      this.mostrarError('El DNI debe tener 8 dígitos o el RUC 11 dígitos.');
      return;
    }

    if (!validarCorreo(email)) {
      this.mostrarError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!/^9\d{8}$/.test(telefono)) {
      this.mostrarError('El teléfono debe tener 9 dígitos y comenzar con 9.');
      return;
    }

    const datos = { nombre, identificacion, email, telefono };

    try {
      if (this.idEditando) {
        this.clientesService.actualizar(this.idEditando, datos);
        this.mensaje.set('Cliente actualizado correctamente.');
      } else {
        this.clientesService.registrar(datos);
        this.mensaje.set('Cliente registrado correctamente.');
      }

      this.tipoMensaje.set('exito');
      this.limpiarFormulario();
    } catch (error) {
      this.mostrarError(
        error instanceof Error ? error.message : 'Ocurrió un error.'
      );
    }
  }

  editar(cliente: Cliente): void {
    this.idEditando = cliente.id;

    this.formulario = {
      nombre: cliente.nombre,
      identificacion: cliente.identificacion,
      email: cliente.email,
      telefono: cliente.telefono
    };

    this.mensaje.set('');
  }

  eliminar(id: string): void {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientesService.eliminar(id);
      this.mensaje.set('Cliente eliminado correctamente.');
      this.tipoMensaje.set('exito');

      if (this.idEditando === id) {
        this.limpiarFormulario();
      }
    }
  }

  limpiarFormulario(): void {
    this.formulario = {
      nombre: '',
      identificacion: '',
      email: '',
      telefono: ''
    };

    this.idEditando = null;
  }

  private mostrarError(texto: string): void {
    this.mensaje.set(texto);
    this.tipoMensaje.set('error');
  }
}
