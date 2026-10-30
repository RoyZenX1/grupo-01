import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import type { Programa } from '../modelos/estudiante';
import { EstudiantesApi } from '../servicios/estudiantes-api';
import { mensajeHttp } from '../servicios/mensaje-http';

function nombreValido(control: AbstractControl) {
  const texto = String(control.value ?? '').trim();
  return texto.length >= 3 && texto.length <= 80 ? null : { nombre: true };
}

function numeroFinito(control: AbstractControl) {
  return control.value === null || Number.isFinite(control.value) ? null : { finito: true };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EstudiantesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = signal<string | null>(null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly enviado = signal(false);
  readonly mensaje = signal('');
  readonly errorCarga = signal('');
  readonly errorGuardado = signal('');

  readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', [nombreValido]),
    programa: this.fb.nonNullable.control<Programa>('Software', [Validators.required]),
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

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => {
          this.id.set(params.get('id'));
          this.cargando.set(true);
          this.errorCarga.set('');
          this.errorGuardado.set('');
          this.mensaje.set('');
          this.enviado.set(false);
          this.form.reset();
          this.form.disable();
        }),
        switchMap(() => {
          const id = this.id();
          return id
            ? this.api.obtener(id).pipe(
                catchError((error) => {
                  this.errorCarga.set(mensajeHttp(error));
                  return of(null);
                }),
              )
            : of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((estudiante) => {
        if (estudiante) this.form.patchValue(estudiante);
        if (!this.errorCarga()) this.form.enable();
        this.cargando.set(false);
      });
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  guardar(): void {
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    this.enviado.set(true);
    this.mensaje.set('');
    this.errorGuardado.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    if (valores.promedio === null || valores.asistencia === null) return;
    const datos = {
      ...valores,
      nombre: valores.nombre.trim(),
      promedio: valores.promedio,
      asistencia: valores.asistencia,
    };
    const id = this.id();
    const solicitud = id ? this.api.actualizar(id, datos) : this.api.crear(datos);
    this.guardando.set(true);
    this.form.disable();
    solicitud
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.guardando.set(false);
          this.form.enable();
        }),
      )
      .subscribe({
        next: (estudiante) => {
          this.mensaje.set(`Se guardó a ${estudiante.nombre} con id ${estudiante.id}.`);
          if (!id) this.form.reset();
          this.enviado.set(false);
        },
        error: (error) => this.errorGuardado.set(mensajeHttp(error)),
      });
  }
}
