import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { Orden, EstadoOrden } from '../../models/orden.model';

@Component({
    selector: 'app-ordenes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ordenes.html',
    styleUrl: './ordenes.css'
})
export class Ordenes {
    private service = inject(OrdenesService);

    readonly ordenes = this.service.ordenes;
    readonly estados = this.service.estados;

    form = {
        id: '',
        cotizacionId: '',
        vehiculoId: '',
        origen: '',
        destino: '',
        distancia: 0,
        peso: 0
    };

    mensaje = signal('');
    tipoMensaje = signal<'exito' | 'error'>('exito');

    registrar(): void {
        this.mensaje.set('');
        try {
            this.service.registrar(this.form);
            this.mensaje.set('Orden registrada correctamente.');
            this.tipoMensaje.set('exito');
            this.form = {
                id: '', cotizacionId: '', vehiculoId: '',
                origen: '', destino: '', distancia: 0, peso: 0
            };
        } catch (e) {
            this.mensaje.set(e instanceof Error ? e.message : 'Error al registrar.');
            this.tipoMensaje.set('error');
        }
    }

    cambiarEstado(id: string, event: Event): void {
        const valor = (event.target as HTMLSelectElement).value as EstadoOrden;
        try {
            this.service.cambiarEstado(id, valor);
            this.mensaje.set('Estado actualizado.');
            this.tipoMensaje.set('exito');
        } catch (e) {
            this.mensaje.set(e instanceof Error ? e.message : 'Error.');
            this.tipoMensaje.set('error');
        }
    }

    eliminar(id: string): void {
        if (!confirm(`¿Eliminar la orden ${id}?`)) return;
        try {
            this.service.eliminar(id);
            this.mensaje.set('Orden eliminada.');
            this.tipoMensaje.set('exito');
        } catch (e) {
            this.mensaje.set(e instanceof Error ? e.message : 'Error.');
            this.tipoMensaje.set('error');
        }
    }

    restaurar(): void {
        this.service.restaurar();
        this.mensaje.set('Datos restaurados.');
        this.tipoMensaje.set('exito');
    }
}