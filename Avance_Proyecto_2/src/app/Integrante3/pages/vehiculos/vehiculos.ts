import {
    ChangeDetectionStrategy, Component, DestroyRef,
    inject, OnInit, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
    AbstractControl, FormBuilder, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import { VehiculosApi } from '../../services/vehiculos-api';
import { VehiculosService } from '../../services/vehiculos.service';
import { mensajeHttp } from '../../services/mensaje-http';
import { EstadoVehiculoPipe } from '../../pipes/estado-vehiculo.pipe';
import type { EstadoVehiculo } from '../../models/vehiculo.model';
import type { Tarifa } from '../../models/tarifa.model';

function numeroFinito(control: AbstractControl) {
    return control.value === null || Number.isFinite(control.value)
        ? null
        : { finito: true };
}

@Component({
    selector: 'app-vehiculos',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, EstadoVehiculoPipe],
    templateUrl: './vehiculos.html',
    styleUrl: './vehiculos.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Vehiculos implements OnInit {

    private readonly fb = inject(FormBuilder);
    private readonly api = inject(VehiculosApi);
    private readonly store = inject(VehiculosService);
    private readonly destroyRef = inject(DestroyRef);

    // Datos del servicio
    readonly vehiculos = this.store.vehiculos;
    readonly total = this.store.total;
    readonly disponibles = this.store.disponibles;
    readonly enRuta = this.store.enRuta;
    readonly codigoSiguiente = this.store.codigoSiguiente;

    // Estados UI
    readonly cargando = signal(false);
    readonly errorCarga = signal('');
    readonly guardando = signal(false);
    readonly enviado = signal(false);
    readonly mensaje = signal('');
    readonly tipoMensaje = signal<'exito' | 'error'>('exito');
    readonly pendienteEliminar = signal<string | null>(null);
    readonly eliminando = signal(false);

    readonly estados: EstadoVehiculo[] = [
        'Disponible', 'En ruta', 'Mantenimiento', 'Fuera de servicio',
    ];
    readonly tipos = ['Camión', 'Furgón', 'Camioneta', 'Tráiler'];

    // Formulario reactivo tipado
    readonly form = this.fb.group({
        placa:     this.fb.nonNullable.control('', [
            Validators.required,
            Validators.pattern(/^[A-Za-z]{3}-\d{3}$/),
        ]),
        tipo:      this.fb.nonNullable.control('', [Validators.required]),
        capacidad: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(0.1),
            Validators.max(100),
            numeroFinito,
        ]),
    });

    // Formulario de tarifa
    readonly formTarifa = this.fb.group({
        distancia: this.fb.control<number | null>(null, [
            Validators.required, Validators.min(1), numeroFinito,
        ]),
        peso: this.fb.control<number | null>(null, [
            Validators.required, Validators.min(0.1), numeroFinito,
        ]),
    });
    readonly tarifa = signal<Tarifa | null>(null);
    readonly errorTarifa = signal('');

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        if (this.cargando()) return;
        this.cargando.set(true);
        this.errorCarga.set('');
        this.api.listar()
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.cargando.set(false)),
            )
            .subscribe({
                next: lista => this.store.reemplazarLista(lista),
                error: e => this.errorCarga.set(mensajeHttp(e)),
            });
    }

    invalido(campo: 'placa' | 'tipo' | 'capacidad'): boolean {
        const c = this.form.controls[campo];
        return c.invalid && (c.touched || this.enviado());
    }

    invalidoTarifa(campo: 'distancia' | 'peso'): boolean {
        const c = this.formTarifa.controls[campo];
        return c.invalid && c.touched;
    }

    registrar(): void {
        this.mensaje.set('');
        this.enviado.set(true);
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const v = this.form.getRawValue();
        if (v.capacidad === null) return;

        let borrador;
        try {
            borrador = this.store.validarBorrador({
                placa: v.placa, tipo: v.tipo, capacidad: v.capacidad,
            });
        } catch (e) {
            this.mensaje.set(e instanceof Error ? e.message : 'Datos inválidos.');
            this.tipoMensaje.set('error');
            return;
        }

        this.guardando.set(true);
        this.form.disable();
        this.api.crear({
            codigo: this.codigoSiguiente(),
            placa: borrador.placa,
            tipo: borrador.tipo,
            capacidad: borrador.capacidad,
            estado: 'Disponible',
        })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.guardando.set(false);
                    this.form.enable();
                }),
            )
            .subscribe({
                next: nuevo => {
                    this.store.agregarLocal(nuevo);
                    this.mensaje.set(`Vehículo ${nuevo.codigo ?? nuevo.id} registrado.`);
                    this.tipoMensaje.set('exito');
                    this.form.reset({ placa: '', tipo: '', capacidad: null });
                    this.enviado.set(false);
                },
                error: e => {
                    this.mensaje.set(mensajeHttp(e));
                    this.tipoMensaje.set('error');
                },
            });
    }

    cambiarEstado(id: string, event: Event): void {
        const nuevoEstado = (event.target as HTMLSelectElement).value as EstadoVehiculo;
        this.api.actualizar(id, { estado: nuevoEstado })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: actualizado => {
                    this.store.actualizarLocal(actualizado);
                    this.mensaje.set(`Estado actualizado a "${nuevoEstado}".`);
                    this.tipoMensaje.set('exito');
                },
                error: e => {
                    this.mensaje.set(mensajeHttp(e));
                    this.tipoMensaje.set('error');
                    this.cargar();
                },
            });
    }

    solicitarEliminar(id: string): void {
        this.pendienteEliminar.set(id);
    }

    cancelarEliminar(): void {
        this.pendienteEliminar.set(null);
    }

    confirmarEliminar(): void {
        const id = this.pendienteEliminar();
        if (!id || this.eliminando()) return;
        this.eliminando.set(true);
        this.api.eliminar(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.eliminando.set(false)),
            )
            .subscribe({
                next: () => {
                    this.store.quitarLocal(id);
                    this.pendienteEliminar.set(null);
                    this.mensaje.set('Vehículo eliminado.');
                    this.tipoMensaje.set('exito');
                },
                error: e => {
                    this.mensaje.set(mensajeHttp(e));
                    this.tipoMensaje.set('error');
                },
            });
    }

    calcularTarifa(): void {
        this.tarifa.set(null);
        this.errorTarifa.set('');
        if (this.formTarifa.invalid) {
            this.formTarifa.markAllAsTouched();
            return;
        }
        const { distancia, peso } = this.formTarifa.getRawValue();
        if (distancia === null || peso === null) return;
        try {
            this.tarifa.set(this.store.calcularTarifa(distancia, peso));
        } catch (e) {
            this.errorTarifa.set(e instanceof Error ? e.message : 'Error.');
        }
    }
}