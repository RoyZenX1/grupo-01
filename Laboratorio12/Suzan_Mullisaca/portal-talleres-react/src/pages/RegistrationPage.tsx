import { useParams, useNavigate } from 'react-router';
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
      <h1>Inscripción: {workshop.title}</h1>
      <RegistrationForm
        key={workshop.id}
        workshopId={workshop.id}
        onSaved={(receipt) => {
          onSaved(receipt);
          navigate('/confirmacion');
        }}
      />
    </>
  );
}