import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[appResaltarRiesgo]',
  standalone: true,
  host: {
    '[class.tarjeta-riesgo]': 'esRiesgo()',
    '[class.tarjeta-aprobado]': 'esAprobado()',
    '[class.tarjeta-destacado]': 'esDestacado()',
    '[attr.data-estado]': 'estado()',
  },
})
export class ResaltarRiesgoDirective {
  readonly promedio = input.required<number>({ alias: 'appResaltarRiesgo' });

  protected readonly esRiesgo = computed(() => this.promedio() < 11);
  protected readonly esAprobado = computed(
    () => this.promedio() >= 11 && this.promedio() < 14,
  );
  protected readonly esDestacado = computed(() => this.promedio() >= 14);

  protected readonly estado = computed(() => {
    if (this.esDestacado()) return 'destacado';
    if (this.esAprobado()) return 'aprobado';
    return 'riesgo';
  });
}