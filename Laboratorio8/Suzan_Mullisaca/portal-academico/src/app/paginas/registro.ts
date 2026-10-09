import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { EstudiantesStore } from '../estado/estudiantes-store';

function nombreValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (valor.length === 0) return null;
    if (valor.length < 3 || valor.length > 80) return { nombre: true };
    return null;
  };
}

function numeroFinito(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined) return null;
    return Number.isFinite(control.value) ? null : { numero: true };
  };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(EstudiantesStore);
  readonly enviado = signal(false);
  readonly mensaje = signal('');

  readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', [
      Validators.required,
      nombreValido(),
    ]),
    programa: this.fb.nonNullable.control<'Software' | 'Sistemas'>('Software', [
      Validators.required,
    ]),
    promedio: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(20),
      numeroFinito(),
    ]),
    asistencia: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
      numeroFinito(),
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
        nombre: datos.nombre,
        programa: datos.programa,
        promedio: datos.promedio,
        asistencia: datos.asistencia,
      });
      this.mensaje.set(
        `Se registró a ${nuevo.nombre} con identificador ${nuevo.id}`,
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