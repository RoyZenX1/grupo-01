import { z } from 'zod'

export const clienteSchema = z.object({
  id: z.coerce.string().min(1),
  nombre: z.string().trim().min(1),
  identificacion: z.string().trim().min(1),
  email: z.string().trim().email(),
  telefono: z.string().trim().min(1),
})

export const clienteFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(100, 'El nombre no puede superar 100 caracteres.'),
  identificacion: z
    .string()
    .trim()
    .regex(/^\d{8}$|^\d{11}$/, 'Ingresa 8 dígitos (DNI) o 11 dígitos (RUC).'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido.')
    .max(150, 'El correo no puede superar 150 caracteres.'),
  telefono: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, 'Ingresa un celular peruano válido de 9 dígitos.'),
})

export type ClienteFormValues = z.infer<typeof clienteFormSchema>
