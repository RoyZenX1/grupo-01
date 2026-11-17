import { z } from 'zod'
import { ESTADOS_VEHICULO, TIPOS_VEHICULO } from './vehiculo.types'

const codigoSchema = z
  .string()
  .regex(/^VEH-\d{3,}$/, 'El código debe tener el formato VEH-001.')

const placaSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}-\d{3}$/, 'Usa el formato ABC-123.')

export const vehiculoSchema = z.object({
  id: z.string().min(1),
  codigo: codigoSchema,
  placa: z.string().regex(/^[A-Z]{3}-\d{3}$/),
  modelo: z.string().optional(),
  tipo: z.enum(TIPOS_VEHICULO),
  capacidad: z.number().finite().positive(),
  estado: z.enum(ESTADOS_VEHICULO),
})

export const vehiculoFormSchema = z.object({
  codigo: codigoSchema,
  placa: placaSchema,
  modelo: z.string().trim().min(1, 'El modelo es obligatorio.'),
  tipo: z.enum(TIPOS_VEHICULO, {
    error: 'Selecciona un tipo de vehículo.',
  }),
  capacidad: z
    .number()
    .finite('Ingresa una capacidad válida.')
    .positive('La capacidad debe ser mayor que 0.')
    .max(100, 'La capacidad máxima es de 100 toneladas.'),
  estado: z.enum(ESTADOS_VEHICULO),
})

export type VehiculoFormValues = z.infer<typeof vehiculoFormSchema>