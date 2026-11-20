import { z } from 'zod'
import { ESTADOS_COTIZACION } from './cotizacion.types'

const numero = (mensaje: string) => z.number({ error: mensaje }).finite(mensaje)

export const cotizacionFormSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente.'),
  origen: z.string().trim().min(3, 'El origen debe tener al menos 3 caracteres.').max(80),
  destino: z.string().trim().min(3, 'El destino debe tener al menos 3 caracteres.').max(80),
  distancia: numero('Ingresa la distancia en km.')
    .positive('La distancia debe ser mayor que 0.')
    .max(200, 'La tarifa solo cubre hasta 200 km.'),
  peso: numero('Ingresa el peso en toneladas.')
    .positive('El peso debe ser mayor que 0.')
    .max(10, 'La tarifa solo cubre hasta 10 t.'),
  cantidad: numero('Ingresa la cantidad de servicios.')
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad mínima es 1.')
    .max(100, 'La cantidad máxima es 100.'),
  descuentoPorcentaje: numero('Ingresa el descuento (0 si no aplica).')
    .min(0, 'El descuento no puede ser negativo.')
    .max(50, 'El descuento máximo es 50 %.'),
})

export type CotizacionFormValues = z.infer<typeof cotizacionFormSchema>

export const cotizacionSchema = z.object({
  id: z.coerce.string().min(1),
  codigo: z.string().min(1),
  clienteId: z.coerce.string(),
  servicio: z.string(),
  origen: z.string(),
  destino: z.string(),
  distancia: z.number(),
  peso: z.number(),
  precioUnitario: z.number(),
  cantidad: z.number(),
  descuentoPorcentaje: z.number(),
  subtotal: z.number(),
  baseImponible: z.number(),
  igv: z.number(),
  total: z.number(),
  fechaEmision: z.string(),
  fechaVencimiento: z.string(),
  estado: z.enum(ESTADOS_COTIZACION),
})
