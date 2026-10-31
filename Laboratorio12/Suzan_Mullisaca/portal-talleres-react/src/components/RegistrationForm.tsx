import { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { initialValues, registrationSchema } from '../model/registration';
import type { Receipt, RegistrationInput, RegistrationData } from '../model/registration';
import { simulateSubmission } from '../services/simulatedSubmission';
import { CoordinatorFields } from './CoordinatorFields';
import { ParticipantFields } from './ParticipantFields';
import { WorkshopFields } from './WorkshopFields';
import { LiveSummary } from './LiveSummary';
import { FieldMessage } from './FieldMessage';

interface RegistrationFormProps {
  readonly workshopId: string;
  readonly onSaved: (receipt: Receipt) => void;
}

export function RegistrationForm({ workshopId, onSaved }: RegistrationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const methods = useForm<RegistrationInput, unknown, RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: initialValues(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldUnregister: false,
    shouldFocusError: false,
  });

  const {
    register, handleSubmit, reset, setError, clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  async function submit(data: RegistrationData) {
    clearErrors('root.server');
    try {
      const receipt = await simulateSubmission(workshopId, data);
      onSaved(receipt);
    } catch (error: unknown) {
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : 'No se pudo procesar.',
      });
    }
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  return (
    <FormProvider {...methods}>
      <form ref={formRef} noValidate onSubmit={handleSubmit(submit, focusFirstError)}>
        <p>Todos los datos son obligatorios salvo el aula en modalidad virtual.</p>
        <p className="small text-secondary">
          Estado: {isDirty ? 'modificado' : 'sin cambios'}.
        </p>

        <fieldset disabled={isSubmitting}>
          <legend className="visually-hidden">Solicitud de inscripción</legend>
          <CoordinatorFields />
          <WorkshopFields />
          <ParticipantFields />
          <LiveSummary />

          <div className="form-check my-3">
            <input
              id="accepted"
              type="checkbox"
              className="form-check-input"
              {...register('accepted')}
              aria-invalid={Boolean(errors.accepted)}
              aria-describedby="accepted-error"
            />
            <label className="form-check-label" htmlFor="accepted">
              Acepto las condiciones del laboratorio y usar solo datos ficticios
            </label>
            <FieldMessage id="accepted-error" message={errors.accepted?.message} />
          </div>

          {errors.root?.server && (
            <p role="alert" className="text-danger">{errors.root.server.message}</p>
          )}

          <div className="d-flex flex-wrap gap-3">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando solicitud' : 'Enviar solicitud'}
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => reset(initialValues())}
            >
              Restablecer formulario
            </button>
          </div>
        </fieldset>
      </form>
    </FormProvider>
  );
}