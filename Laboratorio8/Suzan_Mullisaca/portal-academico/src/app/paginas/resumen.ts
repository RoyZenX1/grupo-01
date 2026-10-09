import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstudiantesStore } from '../estado/estudiantes-store';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './resumen.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Resumen {
  readonly store = inject(EstudiantesStore);
  readonly fecha = new Date();
}