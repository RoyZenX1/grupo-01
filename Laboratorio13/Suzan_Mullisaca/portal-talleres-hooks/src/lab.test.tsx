import { StrictMode } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
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
    for (let i = 0; i < 5; i += 1) await user.click(add);
    expect(screen.getByRole('status')).toHaveTextContent('Total: 4.');
    expect(screen.getByRole('status')).toHaveTextContent('Máximo');
    await user.click(screen.getByRole('button', { name: 'Vaciar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Total: 0.');
  });

  test('impide cantidades negativas al quitar en un taller vacío', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Quitar plaza' }));
    expect(screen.getByRole('status')).toHaveTextContent('no tiene plazas');
    expect(screen.getByRole('status')).toHaveTextContent('Total: 0.');
  });

  test('el contexto comparte la orientación entre estaciones', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/Orientación detallada/)).toBeVisible();
    await user.click(screen.getByLabelText('Mostrar orientación detallada'));
    expect(screen.getByText('Orientación breve.')).toBeVisible();
  });

  test('la suscripción usa el canal activo y se limpia al cambiar', async () => {
    const user = userEvent.setup();
    render(
      <Preferences>
        <Notices />
      </Preferences>
    );
    const select = screen.getByLabelText('Canal de avisos');
    await user.selectOptions(select, 'react');
    await act(async () => {
      notices.dispatchEvent(new Event('react'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cupos revisados para Interfaces con React'
    );
    await user.selectOptions(select, 'pruebas');
    expect(screen.getByRole('status')).toHaveTextContent('En espera');
    await act(async () => {
      notices.dispatchEvent(new Event('pruebas'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cupos revisados para Pruebas de interfaces'
    );
  });
});

describe('DOM y catálogo', () => {
  test('el botón enfoca el primer campo y cada id es único', async () => {
    const user = userEvent.setup();
    render(<FocusAndLayout />);
    const fields = screen.getAllByRole('textbox');
    expect(fields).toHaveLength(2);
    expect(fields[0].id).not.toBe(fields[1].id);
    const field = screen.getByLabelText('Nombre del equipo');
    expect(field).toHaveAccessibleDescription('Usa un nombre ficticio.');
    await user.click(
      screen.getByRole('button', { name: 'Ir al nombre del equipo' })
    );
    expect(field).toHaveFocus();
  });

  test('mide de nuevo al cambiar la etiqueta', async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const wide = this.textContent?.startsWith('Cupos disponibles extendidos');
        return new DOMRect(0, 0, wide ? 230 : 60, 22);
      }
    );
    render(<FocusAndLayout />);
    expect(screen.getByText('Ancho medido: 60 px.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Etiqueta extendida' }));
    expect(screen.getByText('Ancho medido: 230 px.')).toBeVisible();
  });

  test('filtra, ordena y selecciona sin cambiar el valor escrito', async () => {
    const user = userEvent.setup();
    render(<Catalog />);
    const field = screen.getByRole('textbox', { name: 'Buscar talleres' });
    await user.type(field, 'react');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('2000 coincidencias')
    );
    const first = () =>
      within(screen.getByRole('list')).getAllByRole('button')[0];
    expect(first()).toHaveTextContent('Interfaces con React 1');
    await user.click(screen.getByRole('button', { name: 'Orden inverso' }));
    await waitFor(() => expect(first()).toHaveTextContent('5998'));
    await user.click(first());
    expect(screen.getByText('Selección: Interfaces con React 5998.')).toBeVisible();
    expect(field).toHaveValue('react');
  });

  test('observa la conectividad e instala y retira una sola regla', async () => {
    const user = userEvent.setup();
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { unmount } = render(
      <StrictMode>
        <Platform />
      </StrictMode>
    );
    expect(screen.getByRole('status').textContent ?? '').toMatch(/en línea/i);
    online.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status').textContent ?? '').toMatch(/sin conexión/i);
    const style = () => document.head.querySelectorAll('style[data-lab-badge]');
    expect(style()).toHaveLength(1);
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Color de la insignia' }),
      'verde'
    );
    expect(style()).toHaveLength(1);
    unmount();
    expect(style()).toHaveLength(0);
  });
});

describe('Acciones y recursos', () => {
  test('confirma una reserva y muestra el estado pendiente', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => true);
    render(<Booking save={save} />);
    await user.selectOptions(screen.getByLabelText('Cantidad'), '2');
    await user.click(screen.getByRole('button', { name: 'Reservar plazas' }));
    await waitFor(() =>
      expect(screen.getByTestId('booking-summary')).toHaveTextContent(
        'Confirmadas: 2.'
      )
    );
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('revierte la reserva optimista cuando falla', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => false);
    render(<Booking save={save} />);
    await user.selectOptions(screen.getByLabelText('Cantidad'), '1');
    await user.click(screen.getByRole('button', { name: 'Reservar plazas' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se confirmó');
    expect(screen.getByTestId('booking-summary')).toHaveTextContent(
      'Confirmadas: 0.'
    );
  });

  test('respeta el máximo de cuatro plazas sin llamar al simulador', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => true);
    render(<Booking save={save} />);
    const select = screen.getByLabelText('Cantidad');
    const submit = () => screen.getByRole('button', { name: 'Reservar plazas' });
    await user.selectOptions(select, '3');
    await user.click(submit());
    await waitFor(() =>
      expect(screen.getByTestId('booking-summary')).toHaveTextContent(
        'Confirmadas: 3.'
      )
    );
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
      </Preferences>
    );
    expect(screen.queryByText(/El informe tiene plazas ficticias/)).toBeNull();
    await user.click(screen.getByLabelText('Mostrar nota del informe'));
    expect(screen.getByText(/El informe tiene plazas ficticias/)).toBeVisible();
  });

  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  test('muestra carga, recupera un rechazo y vuelve a leer el informe', async () => {
    const user = userEvent.setup();
    const failure = deferred<Report>();
    const success = deferred<Report>();
    const load = (fail: boolean) => (fail ? failure.promise : success.promise);
    render(<Resources load={load} />, { onCaughtError: vi.fn() });
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Simular error' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Cargando informe');
    await act(async () => {
      failure.reject(new Error('Fallo de prueba'));
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo leer');
    await act(async () => {
      await user.click(
        screen.getByRole('button', { name: 'Leer disponibilidad' })
      );
    });
    await act(async () => {
      success.resolve(WORKSHOPS.map((item) => ({ ...item, seats: 2 })));
    });
    const list = await screen.findByRole('list', {
      name: 'Disponibilidad de talleres',
    });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});