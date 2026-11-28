import { useRef, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Receipt, Reservation } from './contract';
import type { PortalContext } from './context';
import { createReservation } from './services';
import { workshopKey } from './hooks';
import { Catalog, Reserve, Confirmation } from './pages';

function Layout() {
  const client = useQueryClient();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const lock = useRef(false);
  const mutation = useMutation({
    mutationFn: createReservation, retry: false,
    onSuccess: (result) => {
      setReceipt(result);
      void client.invalidateQueries({ queryKey: workshopKey });
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: workshopKey });
    },
  });
  async function reserve(data: Reservation) {
    if (lock.current) throw new Error('Ya hay una reserva en proceso');
    lock.current = true;
    try { return await mutation.mutateAsync(data); }
    finally { lock.current = false; }
  }
  const context: PortalContext = { receipt, saving: mutation.isPending, reserve };
  return <>
    <header className="portal-header">
      <div className="container py-3 d-flex flex-wrap gap-3 align-items-center">
        <Link className="brand me-auto" to="/">Talleres UTP</Link>
        <nav aria-label="Navegación principal" className="d-flex gap-3">
          <NavLink to="/" end>Catálogo</NavLink>
          <NavLink to="/confirmacion">Último recibo</NavLink>
        </nav>
      </div>
    </header>
    <main className="container py-4"><Outlet context={context} /></main>
  </>;
}
export function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Catalog />} />
      <Route path="reservar/:id" element={<Reserve />} />
      <Route path="confirmacion" element={<Confirmation />} />
      <Route path="*" element={<><h1>Página no encontrada</h1><Link to="/">Ir al catálogo</Link></>} />
    </Route>
  </Routes>;
}
