import { Component, inject, signal, OnInit } from '@angular/core';
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
export class Clientes implements OnInit {
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

  formulario: Omit<Cliente, 'id' | 'numero'> = {
    nombre: '',
    identificacion: '',
    email: '',
    telefono: ''
  };

  idEditando: string | null = null;

  mensaje = signal('');
  tipoMensaje = signal<'exito' | 'error'>('exito');

  ngOnInit(): void {
    this.clientesService.cargar().subscribe({
      error: () => {
        this.mostrarError(
          'No se pudieron cargar los clientes. Verifica que la API esté funcionando.'
        );
      }
    });
  }

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

    if (!validarDNI(identificacion) && !validarRUC(identificacion)) {
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

    const operacion = this.idEditando
      ? this.clientesService.actualizar(this.idEditando, datos)
      : this.clientesService.registrar(datos);

    operacion.subscribe({
      next: () => {
        this.mensaje.set(
          this.idEditando
            ? 'Cliente actualizado correctamente.'
            : 'Cliente registrado correctamente.'
        );
        this.tipoMensaje.set('exito');
        this.limpiarFormulario();
      },
      error: () => {
        this.mostrarError(
          'No se pudo guardar el cliente. Verifica que la API esté funcionando.'
        );
      }
    });
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
      this.clientesService.eliminar(id).subscribe({
        next: () => {
          this.mensaje.set('Cliente eliminado correctamente.');
          this.tipoMensaje.set('exito');

          if (this.idEditando === id) {
            this.limpiarFormulario();
          }
        },
        error: () => {
          this.mostrarError(
            'No se pudo eliminar el cliente. Verifica que la API esté funcionando.'
          );
        }
      });
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
