import { DecimalPipe, PercentPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
} from '@angular/core';
import type { Estudiante } from '../modelos/estudiante';
import { EstadoAcademicoPipe } from '../pipes/estado-academico.pipe';
@Component({
    selector: 'app-tarjeta-estudiante',
    standalone: true,
    imports: [DecimalPipe, PercentPipe, EstadoAcademicoPipe],
    templateUrl: './tarjeta-estudiante.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaEstudiante {
    readonly estudiante = input.required<Estudiante>();
    readonly seleccionado = input(false);
    readonly seleccionar = output<Estudiante>();
}