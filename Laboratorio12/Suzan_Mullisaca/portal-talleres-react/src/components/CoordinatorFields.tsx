import { useFormContext } from 'react-hook-form';
import type { RegistrationInput, RegistrationData } from '../model/registration';
import { FieldMessage } from './FieldMessage';

export function CoordinatorFields() {
  const { register, formState: { errors } } =
    useFormContext<RegistrationInput, unknown, RegistrationData>();

  return (
    <fieldset className="form-section">
      <legend className="h4">Datos de coordinación</legend>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="coordinator-name" className="form-label">Nombre de coordinación</label>
          <input
            id="coordinator-name"
            className="form-control"
            autoComplete="name"
            aria-invalid={Boolean(errors.coordinator?.name)}
            aria-describedby="coordinator-name-error"
            {...register('coordinator.name')}
          />
          <FieldMessage id="coordinator-name-error" message={errors.coordinator?.name?.message} />
        </div>
        <div className="col-md-6">
          <label htmlFor="coordinator-email" className="form-label">Correo de coordinación</label>
          <input
            id="coordinator-email"
            className="form-control"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.coordinator?.email)}
            aria-describedby="coordinator-email-error"
            {...register('coordinator.email')}
          />
          <FieldMessage id="coordinator-email-error" message={errors.coordinator?.email?.message} />
        </div>
      </div>
    </fieldset>
  );
}