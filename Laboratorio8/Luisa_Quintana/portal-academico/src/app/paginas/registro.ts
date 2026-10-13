import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstudiantesStore } from '../estado/estudiantes-store';
import type { Programa } from '../modelos/estudiante';
function nombreValido(control: AbstractControl) {
    const texto = String(control.value ?? '').trim();
    return texto.length >= 3 && texto.length <= 80 ? null : { nombre: true };
}
function numeroFinito(control: AbstractControl) {
    return control.value === null || Number.isFinite(control.value)
        ? null
        : { finito: true };
}
@Component({
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './registro.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registro {
    private readonly fb = inject(FormBuilder);
    private readonly store = inject(EstudiantesStore);
    readonly enviado = signal(false);
    readonly mensaje = signal('');
    readonly form = this.fb.group({
        nombre: this.fb.nonNullable.control('', [nombreValido]),
        programa: this.fb.nonNullable.control<Programa>('Software', [
            Validators.required,
        ]),
        promedio: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(0),
            Validators.max(20),
            numeroFinito,
        ]),
        asistencia: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(0),
            Validators.max(100),
            numeroFinito,
        ]),
    });
    invalido(campo: keyof typeof this.form.controls): boolean {
        const control = this.form.controls[campo];
        return control.invalid && (control.touched || this.enviado());
    }
    guardar(): void {
        this.enviado.set(true);
        this.mensaje.set('');
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const datos = this.form.getRawValue();
        if (datos.promedio === null || datos.asistencia === null) return;
        try {
            const nuevo = this.store.agregar({
                ...datos,
                promedio: datos.promedio,
                asistencia: datos.asistencia,
            });
            this.mensaje.set(
                `Se registró a ${nuevo.nombre} con identificador ${nuevo.id}.`,
            );
            this.form.reset();
            this.enviado.set(false);
        } catch (error) {
            this.mensaje.set(
                error instanceof Error ? error.message : 'No se pudo registrar.',
            );
        }
    }
}