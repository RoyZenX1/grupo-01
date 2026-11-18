import type { UserEvent } from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { initialValues } from '../model/registration';

export function validInput() {
  return {
    ...initialValues(), coordinator: { name: 'Ana Torres', email: 'ANA@example.test' },
    participants: [{ name: 'Luis Pérez', email: 'luis@example.test' }],
    budget: '0', accepted: true,
  };
}

export async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Nombre de coordinación'), 'Ana Torres');
  await user.type(screen.getByLabelText('Correo de coordinación'), 'ana@example.test');
  await user.type(screen.getByLabelText('Nombre participante 1'), 'Luis Pérez');
  await user.type(screen.getByLabelText('Correo participante 1'), 'luis@example.test');
  await user.type(screen.getByLabelText('Presupuesto en soles'), '0');
  await user.click(screen.getByRole('checkbox', { name: /acepto las condiciones/i }));
}