import { useNavigate, useParams } from 'react-router';
import { findWorkshop } from '../data/workshops';
import type { Receipt } from '../model/registration';
import { RegistrationForm } from '../components/RegistrationForm';
import { NotFoundPage } from './NotFoundPage';

export function RegistrationPage({ onSaved }: { readonly onSaved: (r: Receipt) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const workshop = findWorkshop(id);
  if (!workshop) return <NotFoundPage />;

  return (
    <>
      <h1>Inscripción a {workshop.title}</h1>
      <p className="lead">Registra la coordinación, organización y participantes.</p>
      <RegistrationForm key={workshop.id} workshopId={workshop.id}
        onSaved={(receipt) => {
          onSaved(receipt);
          navigate('/confirmacion');
        }} />
    </>
  );
}