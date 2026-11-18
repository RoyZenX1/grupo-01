import { buildPayload, type Receipt, type RegistrationData } from '../model/registration';

export async function simulateSubmission(
  workshopId: string,
  data: RegistrationData,
): Promise<Receipt> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (data.coordinator.email.endsWith('@fallo.test')) {
    throw new Error('Fallo simulado. Cambia el correo y vuelve a intentar.');
  }
  return {
    reference: `LAB-${crypto.randomUUID().slice(0, 8)}`,
    payload: buildPayload(workshopId, data),
  };
}