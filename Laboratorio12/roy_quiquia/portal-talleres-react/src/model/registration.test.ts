import { describe, expect, it } from 'vitest';
import { buildPayload, registrationSchema } from './registration';
import { validInput } from '../test/helpers';

describe('registrationSchema', () => {
  it('accepts zero and transforms the budget into a number', () => {
    const output = registrationSchema.parse(validInput());
    expect(output.budget).toBe(0);
    expect(output.coordinator.email).toBe('ana@example.test');
  });

  it.each(['', '-1', '20,50', '5000.01'])(
    'rejects the invalid budget %s', (budget) => {
      expect(registrationSchema.safeParse({ ...validInput(), budget }).success).toBe(false);
    },
  );

  it('requires a room only for in person mode', () => {
    const result = registrationSchema.safeParse({ ...validInput(), mode: 'presencial' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((i) => i.path[0] === 'room')).toBe(true);
  });

  it('accepts a valid room', () => {
    expect(registrationSchema.safeParse({
      ...validInput(), mode: 'presencial', room: 'Aula B201',
    }).success).toBe(true);
  });

  it('detects participant emails after normalization', () => {
    const input = validInput();
    input.participants.push({ name: 'Marta Díaz', email: ' LUIS@example.test ' });
    const result = registrationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('ya está'))).toBe(true);
    }
  });

  it('requires at least one participant', () => {
    expect(registrationSchema.safeParse({ ...validInput(), participants: [] }).success).toBe(false);
  });

  it('rejects a fifth participant', () => {
    const participants = Array.from({ length: 5 }, (_, index) => ({
      name: `Persona ${index}`, email: `persona${index}@example.test`,
    }));
    expect(registrationSchema.safeParse({ ...validInput(), participants }).success).toBe(false);
  });

  it('requires acceptance', () => {
    expect(registrationSchema.safeParse({ ...validInput(), accepted: false }).success).toBe(false);
  });

  it('omits a hidden room from a virtual payload', () => {
    const output = registrationSchema.parse({ ...validInput(), room: 'Dato anterior' });
    expect(buildPayload('react', output)).not.toHaveProperty('room');
  });

  it('includes a room in an in person payload', () => {
    const output = registrationSchema.parse({
      ...validInput(), mode: 'presencial', room: 'B201',
    });
    expect(buildPayload('react', output)).toMatchObject({ room: 'B201', workshopId: 'react' });
  });
});