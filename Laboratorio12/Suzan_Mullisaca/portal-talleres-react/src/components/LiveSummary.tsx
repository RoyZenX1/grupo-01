import { useFormContext, useWatch } from 'react-hook-form';
import type { RegistrationInput, RegistrationData } from '../model/registration';

export function LiveSummary() {
  const { control } = useFormContext<RegistrationInput, unknown, RegistrationData>();
  const [participants, mode, budget] = useWatch({
    control,
    name: ['participants', 'mode', 'budget'],
  });

  return (
    <p className="summary" aria-live="polite">
      Resumen provisional: {participants.length} participante(s) · {mode} ·
      presupuesto escrito: {budget.trim() === '' ? 'sin indicar' : budget} soles.
      La validación definitiva se ejecuta al enviar.
    </p>
  );
}