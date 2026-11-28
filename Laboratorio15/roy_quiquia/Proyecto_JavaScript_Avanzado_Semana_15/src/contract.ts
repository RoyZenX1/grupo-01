import { z } from 'zod';

export const MODES = [
  ['normal', 'Normal'], ['vacio', 'Lista vacía'],
  ['lento', 'Respuesta lenta'], ['agotado', 'Tiempo agotado'],
  ['error', 'Error HTTP 503'], ['invalido', 'Datos inválidos'],
] as const;
export type Mode = typeof MODES[number][0];
export const workshopSchema = z.object({
  id: z.string().min(1), title: z.string().min(1),
  seats: z.number().int().nonnegative(),
});
export const listSchema = z.array(workshopSchema);
export const formSchema = z.object({
  seats: z.number().int().min(1, 'Mínimo 1 cupo').max(4, 'Máximo 4 cupos'),
});
export const receiptSchema = z.object({
  id: z.uuid(), workshopId: z.string().min(1),
  seats: z.number().int().min(1).max(4),
  remaining: z.number().int().nonnegative(),
});
export type Workshop = z.infer<typeof workshopSchema>;
export type FormValues = z.infer<typeof formSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
export type Reservation = FormValues & { workshopId: string };
