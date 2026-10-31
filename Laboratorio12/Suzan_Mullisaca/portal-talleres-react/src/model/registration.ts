import { z } from 'zod';

const personSchema = z.object({
  name: z.string().trim().min(3, 'Escribe al menos 3 caracteres.')
    .max(80, 'Usa como máximo 80 caracteres.'),
  email: z.string().trim().toLowerCase().pipe(
    z.email('Escribe un correo válido.'),
  ),
});

const budgetSchema = z.string().trim()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/, 'Usa un importe como 0 o 150.50.')
  .transform(Number)
  .pipe(z.number().min(0).max(5000, 'El máximo es 5000 soles.'));

export const registrationSchema = z.object({
  coordinator: personSchema,
  mode: z.enum(['virtual', 'presencial']),
  room: z.string().trim(),
  priority: z.enum(['normal', 'alta']),
  budget: budgetSchema,
  participants: z.array(personSchema)
    .min(1, 'Añade al menos un participante.')
    .max(4, 'Se admiten hasta 4 participantes.'),
  accepted: z.boolean().refine(Boolean, 'Debes aceptar las condiciones.'),
}).superRefine((data, context) => {
  if (data.mode === 'presencial' && (data.room.length < 3 || data.room.length > 60)) {
    context.addIssue({
      code: 'custom',
      path: ['room'],
      message: 'Indica un aula de 3 a 60 caracteres.',
    });
  }
  const emails = new Set<string>();
  data.participants.forEach((person, index) => {
    if (emails.has(person.email)) {
      context.addIssue({
        code: 'custom',
        path: ['participants', index, 'email'],
        message: 'Este correo ya está en el equipo.',
      });
    }
    emails.add(person.email); 
  });
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

export function initialValues(): RegistrationInput {
  return {
    coordinator: { name: '', email: '' },
    mode: 'virtual',
    room: '',
    priority: 'normal',
    budget: '',
    participants: [{ name: '', email: '' }],
    accepted: false,
  };
}

export function buildPayload(workshopId: string, data: RegistrationData) {
  const { room, ...rest } = data;
  return {
    workshopId,
    ...rest,
    ...(data.mode === 'presencial' ? { room } : {}),
  };
}

export interface Receipt {
  readonly reference: string;
  readonly payload: ReturnType<typeof buildPayload>;
}