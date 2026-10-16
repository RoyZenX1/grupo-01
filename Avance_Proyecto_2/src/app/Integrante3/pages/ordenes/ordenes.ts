import {
    ChangeDetectionStrategy, Component, DestroyRef,
    computed, inject, OnInit, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { CotizacionesApi } from '../../../Integrante2/services/cotizaciones-api';
import { OrdenesApi } from '../../services/ordenes-api';
import { OrdenesService } from '../../services/ordenes.service';
import { VehiculosApi } from '../../services/vehiculos-api';
import { VehiculosService } from '../../services/vehiculos.service';
import { mensajeHttp } from '../../services/mensaje-http';
import type { EstadoOrden } from '../../models/orden.model';

function numeroFinito(control: AbstractControl) {
    return control.value === null || Number.isFinite(control.value)
        ? null
        : { finito: true };
}

@Component({
    selector: 'app-ordenes',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './ordenes.html',
    styleUrl: './ordenes.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ordenes implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly service = inject(OrdenesService);
    private readonly vehiculosService = inject(VehiculosService);
    private readonly ordenesApi = inject(OrdenesApi);
    private readonly cotizacionesApi = inject(CotizacionesApi);
    private readonly vehiculosApi = inject(VehiculosApi);
    private readonly destroyRef = inject(DestroyRef);

    readonly ordenes = this.service.ordenes;
    readonly estados = this.service.estados;
    readonly codigoSiguiente = this.service.codigoSiguiente;
    readonly cotizacionesAprobadas = this.service.cotizacionesAprobadas;
    readonly vehiculosDisponibles = computed(() =>
        this.vehiculosService.vehiculos().filter(v => v.estado === 'Disponible'),
    );

    readonly cargando = signal(false);
    readonly errorCarga = signal('');
    readonly guardando = signal(false);
    readonly enviado = signal(false);
    readonly pendienteEliminar = signal<string | null>(null);
    readonly codigoPendienteEliminar = signal('');
    readonly eliminando = signal(false);
    readonly mensaje = signal('');
    readonly tipoMensaje = signal<'exito' | 'error'>('exito');

    readonly form = this.fb.group({
        cotizacionId: this.fb.nonNullable.control('', [Validators.required]),
        vehiculoId: this.fb.nonNullable.control('', [Validators.required]),
        origen: this.fb.nonNullable.control('', [
            Validators.required, Validators.minLength(3), Validators.maxLength(80),
        ]),
        destino: this.fb.nonNullable.control('', [
            Validators.required, Validators.minLength(3), Validators.maxLength(80),
        ]),
        distancia: this.fb.control<number | null>(null, [
            Validators.required, Validators.min(1), numeroFinito,
        ]),
        peso: this.fb.control<number | null>(null, [
            Validators.required, Validators.min(0.1), numeroFinito,
        ]),
    });

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        if (this.cargando()) return;
        this.cargando.set(true);
        this.errorCarga.set('');
        forkJoin({
            ordenes: this.ordenesApi.listar(),
            cotizaciones: this.cotizacionesApi.listarAprobadas(),
            vehiculos: this.vehiculosApi.listar(),
        })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.cargando.set(false)),
            )
            .subscribe({
                next: ({ ordenes, cotizaciones, vehiculos }) => {
                    this.service.reemplazarLista(ordenes);
                    this.service.reemplazarCotizaciones(cotizaciones);
                    this.vehiculosService.reemplazarLista(vehiculos);
                },
                error: e => this.errorCarga.set(mensajeHttp(e)),
            });
    }

    invalido(campo: 'cotizacionId' | 'vehiculoId' | 'origen' | 'destino' | 'distancia' | 'peso'): boolean {
        const control = this.form.controls[campo];
        return control.invalid && (control.touched || this.enviado());
    }

    alCambiarCotizacion(): void {
        const cotizacion = this.cotizacionesAprobadas().find(
            c => c.id === this.form.controls.cotizacionId.value,
        );
        if (!cotizacion) return;
        this.form.patchValue({
            origen: cotizacion.origen,
            destino: cotizacion.destino,
            distancia: cotizacion.distancia,
            peso: cotizacion.peso,
        });
    }

    registrar(): void {
        this.mensaje.set('');
        this.enviado.set(true);
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const datos = this.form.getRawValue();
        const distancia = datos.distancia;
        const peso = datos.peso;
        if (distancia === null || peso === null) return;

        let preparado: ReturnType<OrdenesService['prepararBorrador']>;
        try {
            preparado = this.service.prepararBorrador({ ...datos, distancia, peso });
        } catch (e) {
            this.mensaje.set(e instanceof Error ? e.message : 'Datos inválidos.');
            this.tipoMensaje.set('error');
            return;
        }

        this.guardando.set(true);
        this.form.disable();
        this.ordenesApi.crear({
            ...preparado.borrador,
            codigo: this.codigoSiguiente(),
            tarifa: preparado.tarifaCalculada,
            estado: 'Pendiente',
        })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.guardando.set(false);
                    this.form.enable();
                }),
            )
            .subscribe({
                next: orden => {
                    this.service.agregarLocal(orden);
                    this.mensaje.set(`Orden ${orden.codigo ?? orden.id} registrada correctamente.`);
                    this.tipoMensaje.set('exito');
                    this.form.reset({
                        cotizacionId: '', vehiculoId: '',
                        origen: '', destino: '', distancia: null, peso: null,
                    });
                    this.enviado.set(false);
                },
                error: e => {
                    this.mensaje.set(mensajeHttp(e));
                    this.tipoMensaje.set('error');
                },
            });
    }

    cambiarEstado(id: string, event: Event): void {
        const valor = (event.target as HTMLSelectElement).value as EstadoOrden;
        this.ordenesApi.actualizar(id, { estado: valor })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: orden => {
                    this.service.actualizarLocal(orden);
                    this.mensaje.set('Estado actualizado.');
                    this.tipoMensaje.set('exito');
                },
                error: e => {
                    this.mensaje.set(mensajeHttp(e));
                    this.tipoMensaje.set('error');
                    this.cargar();
                },
            });
    }

    solicitarEliminar(orden: { id: string; codigo?: string }): void {
        const id = orden.id;
        this.pendienteEliminar.set(id);
        this.codigoPendienteEliminar.set(orden.codigo ?? orden.id);
    }

    cancelarEliminar(): void {
        this.pendienteEliminar.set(null);
        this.codigoPendienteEliminar.set('');
    }

    confirmarEliminar(): void {
        const id = this.pendienteEliminar();
        if (!id || this.eliminando()) return;
        this.eliminando.set(true);
        this.ordenesApi.eliminar(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.eliminando.set(false)),
            )
            .subscribe({
                next: () => {
                    this.service.quitarLocal(id);
                    this.pendienteEliminar.set(null);
                    this.codigoPendienteEliminar.set('');
                    this.mensaje.set('Orden eliminada.');
                    this.tipoMensaje.set('exito');
                },
                error: e => {
                    this.mensaje.set(mensajeHttp(e));
                    this.tipoMensaje.set('error');
                },
            });
    }
}