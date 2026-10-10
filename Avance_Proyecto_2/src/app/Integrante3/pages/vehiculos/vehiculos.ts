import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService } from '../../services/vehiculos.service';
import { EstadoVehiculo, Vehiculo } from '../../models/vehiculo.model';
import { Tarifa } from '../../models/tarifa.model';

@Component({
    selector: 'app-vehiculos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './vehiculos.html',
    styleUrl: './vehiculos.css'
})
export class Vehiculos {
    private service = inject(VehiculosService);

    // Estado expuesto a la plantilla
    readonly vehiculos = this.service.vehiculos;
    readonly total = this.service.total;
    readonly disponibles = this.service.disponibles;
    readonly enRuta = this.service.enRuta;

    // Formulario de registro
    form = { id: '', placa: '', tipo: '', capacidad: 0 };
    mensaje = signal('');
    tipoMensaje = signal<'exito' | 'error'>('exito');

    // Formulario de tarifa
    formTarifa = { distancia: 0, peso: 0 };
    tarifa = signal<Tarifa | null>(null);
    errorTarifa = signal('');

    readonly estados: EstadoVehiculo[] = [
        'Disponible', 'En ruta', 'Mantenimiento', 'Fuera de servicio'
    ];

    readonly tipos = ['Camión', 'Furgón', 'Camioneta', 'Tráiler'];

    registrar(): void {
        this.mensaje.set('');
        try {
            this.service.registrar(this.form);
            this.mensaje.set('Vehículo registrado correctamente.');
            this.tipoMensaje.set('exito');
            this.form = { id: '', placa: '', tipo: '', capacidad: 0 };
        } catch (e) {
            this.mensaje.set(e instanceof Error ? e.message : 'Error al registrar.');
            this.tipoMensaje.set('error');
        }
    }

    cambiarEstado(id: string, event: Event): void {
        const valor = (event.target as HTMLSelectElement).value as EstadoVehiculo;
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
        if (!confirm(`¿Eliminar el vehículo ${id}?`)) return;
        try {
            this.service.eliminar(id);
            this.mensaje.set('Vehículo eliminado.');
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

    calcularTarifa(): void {
        this.tarifa.set(null);
        this.errorTarifa.set('');
        try {
            const t = this.service.calcularTarifa(
                this.formTarifa.distancia,
                this.formTarifa.peso
            );
            this.tarifa.set(t);
        } catch (e) {
            this.errorTarifa.set(e instanceof Error ? e.message : 'Error.');
        }
    }

    trackById(_: number, v: Vehiculo): string {
        return v.id;
    }
}