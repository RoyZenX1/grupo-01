interface FieldMessageProps {
  readonly id: string;
  readonly message: string | undefined;
}

export function FieldMessage({ id, message }: FieldMessageProps) {
  return (
    <p id={id} className="field-message text-danger" aria-live="polite">
      {message ?? ''}
    </p>
  );
}