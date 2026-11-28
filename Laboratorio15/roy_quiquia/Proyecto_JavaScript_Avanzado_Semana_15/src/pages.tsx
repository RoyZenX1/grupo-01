import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MODES, formSchema } from './contract';
import type { Mode, Workshop, FormValues, Receipt } from './contract';
import { useWorkshops } from './hooks';
import { usePortal } from './context';

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return <article className="card h-100 shadow-sm">
    <div className="card-body">
      <h2 className="h5">{workshop.title}</h2>
      <p>{workshop.seats} cupo(s) disponible(s)</p>
      {workshop.seats > 0
        ? <Link className="btn btn-primary" to={`/reservar/${workshop.id}`}>
            Reservar <span className="visually-hidden">{workshop.title}</span>
          </Link>
        : <span className="badge text-bg-secondary">Agotado</span>}
    </div>
  </article>;
}

export function Catalog() {
  const [mode, setMode] = useState<Mode>('normal');
  const [search, setSearch] = useState('');
  const query = useWorkshops(mode);
  const filtered = useMemo(() => (query.data ?? []).filter(w =>
    w.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  ), [query.data, search]);
  return <>
    <h1>Explora los talleres</h1>
    <p className="lead">Consulta los cupos y reserva tu participación.</p>
    <div className="row g-3 align-items-end mb-4">
      <div className="col-md-5">
        <label htmlFor="search" className="form-label">Buscar taller</label>
        <input id="search" className="form-control" value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label htmlFor="mode" className="form-label">Escenario de API</label>
        <select id="mode" className="form-select" value={mode}
          onChange={e => setMode(e.target.value as Mode)}>
          {MODES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      <div className="col-md-3">
        <button className="btn btn-outline-primary" disabled={query.isFetching}
          onClick={() => void query.refetch()}>Actualizar</button>
      </div>
    </div>
    {query.isFetching && <p role="status">Consultando talleres…</p>}
    {query.isError && <p className="alert alert-danger" role="alert">
      {query.error.message}. Usa Actualizar o cambia el escenario.
    </p>}
    {!query.isError && query.data && <>
      {query.data.length === 0 ? <p>No hay talleres disponibles.</p>
        : filtered.length === 0 ? <p>No hay coincidencias.</p>
        : <div className="row g-3">
          {filtered.map(w => <div key={w.id} className="col-12 col-md-6 col-lg-4">
            <WorkshopCard workshop={w} />
          </div>)}
        </div>}
    </>}
  </>;
}

function ReservationForm({ workshop }: { workshop: Workshop }) {
  const { reserve, saving } = usePortal();
  const [error, setError] = useState('');
  const [result, setResult] = useState<Receipt | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { seats: 1 } });
  const busy = saving || isSubmitting;
  async function submit(values: FormValues) {
    setError('');
    setResult(null);
    if (values.seats > workshop.seats) {
      setError('La cantidad supera los cupos disponibles.');
      return;
    }
    try { setResult(await reserve({ workshopId: workshop.id, ...values })); }
    catch (e) {
      const message = e instanceof Error ? e.message : 'Error inesperado';
      setError(`${message}. Consulta los cupos antes de repetir la reserva.`);
    }
  }
  return <form className="card card-body form-panel" noValidate onSubmit={handleSubmit(submit)}>
    <p>Disponibles: <strong>{workshop.seats}</strong></p>
    <label htmlFor="seats" className="form-label">Cantidad de cupos (1 a 4)</label>
    <input id="seats" type="number" min={1} max={4} step={1}
      className="form-control" disabled={busy}
      aria-invalid={!!errors.seats} aria-describedby="seat-help"
      {...register('seats', { valueAsNumber: true })} />
    <div id="seat-help" className="form-text">
      {errors.seats ? <span role="alert" className="text-danger">{errors.seats.message}</span>
        : 'El servidor comprobará la disponibilidad final.'}
    </div>
    <button className="btn btn-primary mt-3" disabled={busy || workshop.seats === 0}>
      {busy ? 'Enviando…' : 'Confirmar reserva'}
    </button>
    {error && <p role="alert" className="alert alert-danger mt-3">{error}</p>}
    {result && <div role="status" className="alert alert-success mt-3">
      Reserva registrada. Saldo confirmado: {result.remaining}.{' '}
      <Link to="/confirmacion">Ver último recibo</Link>
    </div>}
  </form>;
}

export function Reserve() {
  const { id } = useParams();
  const query = useWorkshops();
  const workshop = query.data?.find(w => w.id === id);
  return <>
    <Link to="/">Volver al catálogo</Link>
    <h1 className="mt-3">Reservar taller</h1>
    {query.isFetching && <p role="status">Consultando disponibilidad…</p>}
    {query.isError ? <div role="alert" className="alert alert-danger">
      {query.error.message}. <button className="btn btn-outline-danger"
        onClick={() => void query.refetch()}>Reintentar lectura</button>
    </div> : workshop ? <>
      <h2 className="h4">{workshop.title}</h2>
      <ReservationForm key={workshop.id} workshop={workshop} />
    </> : query.data && <p>Taller no encontrado.</p>}
  </>;
}

export function Confirmation() {
  const { receipt } = usePortal();
  return <>
    <h1>Último recibo confirmado</h1>
    {receipt ? <div className="card card-body form-panel">
      <dl className="mb-0">
        <dt>ID de reserva</dt><dd className="text-break">{receipt.id}</dd>
        <dt>Taller</dt><dd>{receipt.workshopId}</dd>
        <dt>Cupos reservados</dt><dd>{receipt.seats}</dd>
        <dt>Saldo al confirmar</dt><dd>{receipt.remaining}</dd>
      </dl>
    </div> : <p>Aún no hay un recibo en esta sesión de navegación.</p>}
    <Link className="btn btn-outline-primary mt-3" to="/">Volver al catálogo</Link>
  </>;
}
