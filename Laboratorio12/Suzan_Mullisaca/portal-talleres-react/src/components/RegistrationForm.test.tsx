// src/components/RegistrationForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationForm } from './RegistrationForm';
import { simulateSubmission } from '../services/simulatedSubmission';
import {
  buildPayload,
  registrationSchema,
  type Receipt,
} from '../model/registration';
import { fillValidForm, validInput } from '../test/helpers';

vi.mock('../services/simulatedSubmission', () => ({
  simulateSubmission: vi.fn(),
}));

const submitMock = vi.mocked(simulateSubmission);

const receipt: Receipt = {
  reference: 'LAB-prueba',
  payload: buildPayload('react', registrationSchema.parse(validInput())),
};

beforeEach(() => {
  submitMock.mockReset();
  submitMock.mockResolvedValue(receipt);
});

describe('RegistrationForm', () => {
  it('shows errors and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm workshopId="react" onSaved={vi.fn()} />);

    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );

    expect(
      await screen.findAllByText('Escribe al menos 3 caracteres.'),
    ).toHaveLength(2);
    await waitFor(() =>
      expect(
        screen.getByLabelText('Nombre de coordinación'),
      ).toHaveFocus(),
    );
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('submits transformed data and a zero budget', async () => {
    const user = userEvent.setup();
    const saved = vi.fn();
    render(<RegistrationForm workshopId="react" onSaved={saved} />);

    await fillValidForm(user);
    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );

    await waitFor(() => expect(saved).toHaveBeenCalledWith(receipt));
    expect(submitMock).toHaveBeenCalledWith(
      'react',
      expect.objectContaining({ budget: 0 }),
    );
  });

  it('preserves the third person when the second row is removed', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm workshopId="react" onSaved={vi.fn()} />);

    await user.click(
      screen.getByRole('button', { name: 'Añadir participante' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Añadir participante' }),
    );
    await user.type(
      screen.getByLabelText('Nombre participante 3'),
      'Marta Díaz',
    );
    await user.click(
      screen.getByRole('button', { name: 'Quitar participante 2' }),
    );

    expect(screen.getByLabelText('Nombre participante 2')).toHaveValue(
      'Marta Díaz',
    );
  });

  it('stops adding after four people', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm workshopId="react" onSaved={vi.fn()} />);

    const add = screen.getByRole('button', { name: 'Añadir participante' });
    await user.click(add);
    await user.click(add);
    await user.click(add);

    expect(add).toBeDisabled();
    expect(
      screen.getByLabelText('Nombre participante 4'),
    ).toBeInTheDocument();
  });

  it('reveals and validates the conditional room', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm workshopId="react" onSaved={vi.fn()} />);

    await fillValidForm(user);
    await user.selectOptions(
      screen.getByLabelText('Modalidad'),
      'presencial',
    );
    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );

    expect(
      await screen.findByText('Indica un aula de 3 a 60 caracteres.'),
    ).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('adapts the React Select option into a priority string', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm workshopId="react" onSaved={vi.fn()} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('combobox', { name: 'Prioridad' }));
    await user.click(screen.getByRole('option', { name: 'Alta' }));
    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );

    await waitFor(() =>
      expect(submitMock).toHaveBeenCalledWith(
        'react',
        expect.objectContaining({ priority: 'alta' }),
      ),
    );
  });

  it('keeps input after an error and permits retry', async () => {
    submitMock.mockRejectedValueOnce(new Error('Fallo controlado.'));
    const user = userEvent.setup();
    const saved = vi.fn();
    render(<RegistrationForm workshopId="react" onSaved={saved} />);

    await fillValidForm(user);
    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Fallo controlado.',
    );
    expect(screen.getByLabelText('Nombre de coordinación')).toHaveValue(
      'Ana Torres',
    );

    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  });

  it('resets values and dynamic rows', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm workshopId="react" onSaved={vi.fn()} />);

    await fillValidForm(user);
    await user.click(
      screen.getByRole('button', { name: 'Añadir participante' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Restablecer formulario' }),
    );

    expect(screen.getByLabelText('Nombre de coordinación')).toHaveValue('');
    expect(
      screen.queryByLabelText('Nombre participante 2'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('disables submission while the operation is pending', async () => {
    let finish!: (result: Receipt) => void;
    submitMock.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );

    const user = userEvent.setup();
    const saved = vi.fn();
    render(<RegistrationForm workshopId="react" onSaved={saved} />);

    await fillValidForm(user);
    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud' }),
    );

    const pending = await screen.findByRole('button', {
      name: 'Procesando solicitud',
    });
    expect(pending).toBeDisabled();
    await user.click(pending);
    expect(submitMock).toHaveBeenCalledOnce();

    finish(receipt);
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  });
});