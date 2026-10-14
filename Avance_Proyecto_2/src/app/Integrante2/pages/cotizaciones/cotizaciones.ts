import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotizacionesService } from '../../services/cotizaciones.service';
import { Cotizacion } from '../../models/cotizacion.model';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cotizaciones.html',
  styleUrls: ['./cotizaciones.css']
})
export class Cotizaciones implements OnInit {
  cotizadorForm: FormGroup;
  resultadoCalculado: Cotizacion | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private cotizacionesService: CotizacionesService
  ) {
    this.cotizadorForm = this.fb.group({
      clienteId: ['', Validators.required],
      productoServicio: ['', [Validators.required, Validators.maxLength(60)]],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(10000)]],
      descuentoPorcentaje: [0, [Validators.required, Validators.min(0), Validators.max(50)]]
    });
  }

  ngOnInit(): void {}

  calcularYGuardar(): void {
    if (this.cotizadorForm.invalid) {
      this.mensajeError = 'Por favor, completa correctamente todos los campos.';
      return;
    }

    this.mensajeError = '';
    const formValues = this.cotizadorForm.value;

    const subtotalBruto = formValues.precioUnitario * formValues.cantidad;
    const montoDescuento = subtotalBruto * (formValues.descuentoPorcentaje / 100);
    const baseImponible = subtotalBruto - montoDescuento;
    const igv = baseImponible * 0.18;
    const total = baseImponible + igv;

    const nuevaCotizacion: Cotizacion = {
      clienteId: formValues.clienteId,
      productoServicio: formValues.productoServicio,
      precioUnitario: formValues.precioUnitario,
      cantidad: formValues.cantidad,
      descuentoPorcentaje: formValues.descuentoPorcentaje,
      subtotal: Number(subtotalBruto.toFixed(2)),
      baseImponible: Number(baseImponible.toFixed(2)),
      igv: Number(igv.toFixed(2)),
      total: Number(total.toFixed(2)),
      fechaEmision: new Date().toISOString().split('T')[0]
    };

    this.cotizacionesService.crearCotizacion(nuevaCotizacion).subscribe({
      next: (response: Cotizacion) => {
        this.resultadoCalculado = response;
        this.mensajeExito = '¡Cotización calculada y registrada con éxito!';
        this.cotizadorForm.reset({ cantidad: 1, descuentoPorcentaje: 0, precioUnitario: 0 });
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        this.mensajeError = 'No se pudo conectar con el servidor de datos.';
      }
    });
  }
}