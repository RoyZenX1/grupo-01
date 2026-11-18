import { StrictMode } from 'react';
import {
  act,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { App } from './App';
import { Booking } from './Booking';
import { Catalog } from './Catalog';
import { FocusAndLayout } from './FocusAndLayout';
import { Notices, notices } from './Notices';
import { Platform } from './Platform';
import { Preferences } from './preferences';
import { Resources } from './Resources';
import type { Report } from './Resources';
import { WORKSHOPS } from './workshops';

afterEach(() => vi.restoreAllMocks());

describe('Estado y efectos', () => {
  test('limita la agenda a cuatro y permite vaciarla', async () => {
    const user = userEvent.setup();
    render(<App />);

    const add = screen.getByRole('button', { name: 'Añadir plaza' });

    for (let i = 0; i < 5; i += 1) {
      await user.click(add);
    }

    expect(screen.getByRole('status')).toHaveTextContent('Total: 4.');
    expect(screen.getByRole('status')).toHaveTextContent('Máximo');

    await user.click(screen.getByRole('button', { name: 'Vaciar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Total: 0.');
  });

  test('impide cantidades negativas al quitar en un taller vacío', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: 'Quitar plaza' }),
    );

    expect(screen.getByRole('status')).toHaveTextContent('Total: 0.');
    expect(screen.getByRole('status')).toHaveTextContent('no tiene plazas');
  });

  test('comparte la orientación y la conserva al volver a la agenda', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByLabelText('Mostrar orientación detallada'),
    );

    await user.click(screen.getByRole('button', { name: '2 Avisos' }));
    await user.click(screen.getByRole('button', { name: '1 Agenda' }));

    expect(screen.getByText('Orientación breve.')).toBeVisible();
  });

  test('lee la preferencia reciente sin reinstalar el listener', async () => {
    const user = userEvent.setup();
    const add = vi.spyOn(notices, 'addEventListener');
    const remove = vi.spyOn(notices, 'removeEventListener');

    const { unmount } = render(
      <StrictMode>
        <Preferences>
          <Notices />
        </Preferences>
      </StrictMode>,
    );

    const initialAdds = add.mock.calls.length;
    expect(initialAdds).toBeGreaterThan(0);

    const reactNotice = screen.getByRole('button', {
      name: 'Emitir aviso de Interfaces con React',
    });

    await user.click(reactNotice);

    expect(screen.getByRole('status')).toHaveTextContent('Cupos revisados');

    await user.click(
      screen.getByLabelText('Mostrar orientación detallada'),
    );

    await user.click(reactNotice);

    expect(screen.getByRole('status')).toHaveTextContent('Aviso recibido.');
    expect(add).toHaveBeenCalledTimes(initialAdds);

    await user.selectOptions(
      screen.getByLabelText('Canal de avisos'),
      'pruebas',
    );

    expect(add).toHaveBeenCalledTimes(initialAdds + 1);

    await user.click(reactNotice);

    expect(screen.getByRole('status')).toHaveTextContent('En espera');

    unmount();

    expect(remove).toHaveBeenCalledTimes(add.mock.calls.length);
  });
});

describe('DOM y catálogo', () => {
  test('enfoca solo el campo pedido y los identificadores difieren', async () => {
    const user = userEvent.setup();
    render(<FocusAndLayout />);

    const field = screen.getByRole('textbox', {
      name: 'Nombre del equipo',
    });

    const other = screen.getByRole('textbox', {
      name: 'Nombre alternativo',
    });

    expect(field.id).not.toBe(other.id);
    expect(field).toHaveAccessibleDescription('Usa un nombre ficticio.');

    await user.click(
      screen.getByRole('button', {
        name: 'Ir al nombre del equipo',
      }),
    );

    expect(field).toHaveFocus();
  });

  test('mide de nuevo al cambiar la etiqueta', async () => {
    const user = userEvent.setup();

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const wide = this.textContent?.startsWith('Cupos disponibles');

        return new DOMRect(0, 0, wide ? 230 : 60, 22);
      });

    render(<FocusAndLayout />);

    expect(screen.getByText('Ancho medido: 60 px.')).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Etiqueta extendida' }),
    );

    expect(screen.getByText('Ancho medido: 230 px.')).toBeVisible();
  });

  test('filtra, ordena y selecciona sin cambiar el valor escrito', async () => {
    const user = userEvent.setup();
    render(<Catalog />);

    const field = screen.getByRole('textbox', {
      name: 'Buscar talleres',
    });

    await user.type(field, 'react');

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '2000 coincidencias',
      ),
    );

    const first = () =>
      within(screen.getByRole('list')).getAllByRole('button')[0];

    expect(first()).toHaveTextContent('Interfaces con React 1');

    await user.click(
      screen.getByRole('button', { name: 'Orden inverso' }),
    );

    await waitFor(() => expect(first()).toHaveTextContent('5998'));

    await user.click(first());

    expect(
      screen.getByText('Selección: Interfaces con React 5998.'),
    ).toBeVisible();

    expect(field).toHaveValue('react');
  });

  test('observa la conectividad e instala y retira una sola regla', async () => {
    const user = userEvent.setup();

    const online = vi
      .spyOn(navigator, 'onLine', 'get')
      .mockReturnValue(true);

    const { unmount } = render(
      <StrictMode>
        <Platform />
      </StrictMode>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('en línea');

    online.mockReturnValue(false);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('status')).toHaveTextContent('sin conexión');

    const style = () =>
      document.head.querySelectorAll('style[data-lab-badge]');

    expect(style()).toHaveLength(1);

    await user.click(
      screen.getByRole('button', {
        name: 'Cambiar color de insignia',
      }),
    );

    expect(style()).toHaveLength(1);
    expect(style()[0]).toHaveAttribute('data-lab-badge', 'verde');

    unmount();

    expect(style()).toHaveLength(0);
  });
});

describe('Acciones y recursos', () => {
  test('anticipa dos plazas y las confirma al resolver la acción', async () => {
    const user = userEvent.setup();
    const task = Promise.withResolvers<boolean>();

    render(<Booking save={() => task.promise} />);

    await user.selectOptions(
      screen.getByLabelText('Cantidad'),
      '2',
    );

    await user.click(
      screen.getByRole('button', { name: 'Reservar plazas' }),
    );

    expect(
      screen.getByText('Confirmadas: 0. Visibles: 2.'),
    ).toBeVisible();

    expect(
      screen.getByRole('button', { name: 'Reservando…' }),
    ).toBeDisabled();

    await act(async () => {
      task.resolve(true);
    });

    expect(
      screen.getByText('Confirmadas: 2. Visibles: 2.'),
    ).toBeVisible();

    expect(screen.getByRole('status')).toHaveTextContent('confirmada');
  });

  test('revierte la anticipación ante fallo y permite reintentar', async () => {
    const user = userEvent.setup();
    const task = Promise.withResolvers<boolean>();

    const save = vi.fn<(fail: boolean) => Promise<boolean>>()
      .mockReturnValueOnce(task.promise)
      .mockResolvedValueOnce(true);

    render(<Booking save={save} />);

    const fail = screen.getByRole('checkbox', {
      name: 'Simular fallo de reserva',
    });

    const submit = () =>
      screen.getByRole('button', { name: 'Reservar plazas' });

    await user.click(fail);
    await user.click(submit());

    expect(save).toHaveBeenCalledWith(true);

    expect(
      screen.getByText('Confirmadas: 0. Visibles: 1.'),
    ).toBeVisible();

    await act(async () => {
      task.resolve(false);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Reintenta');

    expect(
      screen.getByText('Confirmadas: 0. Visibles: 0.'),
    ).toBeVisible();

    await user.click(fail);
    await user.click(submit());

    await screen.findByText('Confirmadas: 1. Visibles: 1.');

    expect(save).toHaveBeenLastCalledWith(false);
  });

  test('rechaza exceder el cupo sin llamar al servicio simulado', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => true);

    render(<Booking save={save} />);

    const select = screen.getByLabelText('Cantidad');

    const submit = () =>
      screen.getByRole('button', { name: 'Reservar plazas' });

    await user.selectOptions(select, '3');
    await user.click(submit());

    await screen.findByText('Confirmadas: 3. Visibles: 3.');

    await user.selectOptions(select, '2');
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent('Máximo');

    expect(save).toHaveBeenCalledTimes(1);
  });

  test('lee un contexto de forma condicional sin alterar su origen', async () => {
    const user = userEvent.setup();

    render(
      <Preferences>
        <Resources />
      </Preferences>,
    );

    expect(
      screen.queryByText('El informe tiene plazas ficticias.'),
    ).toBeNull();

    await user.click(
      screen.getByLabelText('Mostrar nota del informe'),
    );

    expect(
      screen.getByText('El informe tiene plazas ficticias.'),
    ).toBeVisible();

    await user.click(
      screen.getByLabelText('Mostrar orientación detallada'),
    );

    expect(screen.getByText('Datos de práctica.')).toBeVisible();
  });

  test('muestra carga, recupera un rechazo y vuelve a leer el informe', async () => {
    const user = userEvent.setup();

    const failure = Promise.withResolvers<Report>();
    const success = Promise.withResolvers<Report>();

    const load = (fail: boolean) =>
      fail ? failure.promise : success.promise;

    render(<Resources load={load} />, {
      onCaughtError: vi.fn(),
    });

    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Simular error' }),
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando informe',
    );

    await act(async () => {
      failure.reject(new Error('Fallo de prueba'));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo leer',
    );

    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Leer disponibilidad' }),
      );
    });

    await act(async () => {
      success.resolve(
        WORKSHOPS.map((item) => ({
          ...item,
          seats: 2,
        })),
      );
    });

    const list = screen.getByRole('list', {
      name: 'Disponibilidad de talleres',
    });

    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
