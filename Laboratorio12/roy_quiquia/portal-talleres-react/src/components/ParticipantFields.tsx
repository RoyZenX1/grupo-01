import { useFieldArray, useFormContext } from 'react-hook-form';
import type { RegistrationInput, RegistrationData } from '../model/registration';
import { FieldMessage } from './FieldMessage';

export function ParticipantFields() {
  const { control, register, formState: { errors } } =
    useFormContext<RegistrationInput, unknown, RegistrationData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'participants' });

  return (
    <fieldset className="form-section">
      <legend className="h4">Equipo participante</legend>
      <p>Registra de 1 a 4 personas con correos distintos.</p>
      {fields.map((field, index) => (
        <fieldset className="participant" key={field.id}>
          <legend className="h6">Participante {index + 1}</legend>
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label" htmlFor={`${field.id}-name`}>
                Nombre participante {index + 1}
              </label>
              <input className="form-control" id={`${field.id}-name`}
                aria-invalid={Boolean(errors.participants?.[index]?.name)}
                aria-describedby={`${field.id}-name-error`}
                {...register(`participants.${index}.name` as const)} />
              <FieldMessage id={`${field.id}-name-error`}
                message={errors.participants?.[index]?.name?.message} />
            </div>
            <div className="col-md-5">
              <label className="form-label" htmlFor={`${field.id}-email`}>
                Correo participante {index + 1}
              </label>
              <input className="form-control" type="email" id={`${field.id}-email`}
                aria-invalid={Boolean(errors.participants?.[index]?.email)}
                aria-describedby={`${field.id}-email-error`}
                {...register(`participants.${index}.email` as const)} />
              <FieldMessage id={`${field.id}-email-error`}
                message={errors.participants?.[index]?.email?.message} />
            </div>
            <div className="col-md-2 d-flex align-items-start pt-md-5">
              <button className="btn btn-outline-danger btn-sm" type="button"
                disabled={fields.length === 1} onClick={() => remove(index)}
                aria-label={`Quitar participante ${index + 1}`}>Quitar</button>
            </div>
          </div>
        </fieldset>
      ))}
      <button className="btn btn-outline-primary" type="button"
        disabled={fields.length >= 4}
        onClick={() => append({ name: '', email: '' })}>Añadir participante</button>
      <FieldMessage id="participants-error" message={errors.participants?.message} />
    </fieldset>
  );
}