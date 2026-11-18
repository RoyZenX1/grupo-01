import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Select from 'react-select';
import type { RegistrationInput, RegistrationData } from '../model/registration';
import { FieldMessage } from './FieldMessage';

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
] as const;

export function WorkshopFields() {
  const { register, control, formState: { errors, isSubmitting } } =
    useFormContext<RegistrationInput, unknown, RegistrationData>();
  const mode = useWatch({ control, name: 'mode' });

  return (
    <fieldset className="form-section">
      <legend className="h4">Organización del taller</legend>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="mode">Modalidad</label>
          <select id="mode" className="form-select" {...register('mode')}>
            <option value="virtual">Virtual</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="priority">Prioridad</label>
          <Controller name="priority" control={control}
            render={({ field }) => (
              <Select inputId="priority" instanceId="priority-select" name={field.name}
                options={PRIORITIES} isSearchable={false} isDisabled={isSubmitting}
                value={PRIORITIES.find((option) => option.value === field.value) ?? null}
                onChange={(option) => field.onChange(option?.value ?? 'normal')}
                onBlur={field.onBlur} ref={field.ref}
                aria-invalid={Boolean(errors.priority)} aria-describedby="priority-error" />
            )} />
          <FieldMessage id="priority-error" message={errors.priority?.message} />
        </div>
        {mode === 'presencial' && (
          <div className="col-md-6">
            <label className="form-label" htmlFor="room">Aula</label>
            <input id="room" className="form-control" {...register('room')}
              aria-invalid={Boolean(errors.room)} aria-describedby="room-error" />
            <FieldMessage id="room-error" message={errors.room?.message} />
          </div>
        )}
        <div className="col-md-6">
          <label className="form-label" htmlFor="budget">Presupuesto en soles</label>
          <input id="budget" className="form-control" inputMode="decimal"
            placeholder="0 o 150.50" {...register('budget')}
            aria-invalid={Boolean(errors.budget)} aria-describedby="budget-error" />
          <FieldMessage id="budget-error" message={errors.budget?.message} />
        </div>
      </div>
    </fieldset>
  );
}