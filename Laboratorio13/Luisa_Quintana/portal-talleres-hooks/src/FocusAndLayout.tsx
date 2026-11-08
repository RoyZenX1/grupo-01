import {
  useId, useImperativeHandle, useLayoutEffect, useRef, useState,
} from 'react';
import type { Ref } from 'react';

type FieldHandle = { focus: () => void };

function TeamField({
  label,
  ref,
}: {
  label: string;
  ref?: Ref<FieldHandle>;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => input.current?.focus(),
  }), []);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={input} aria-describedby={id + '-hint'} />
      <small id={id + '-hint'}>Usa un nombre ficticio.</small>
    </div>
  );
}

function MeasuredLabel({ long }: { long: boolean }) {
  const label = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = label.current;
    if (!node) return;

    const measure = () => {
      setWidth(Math.ceil(node.getBoundingClientRect().width));
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, [long]);

  return (
    <div>
      <span ref={label} className="measured-label">
        {long ? 'Cupos disponibles para el equipo' : 'Cupos'}
      </span>
      <p>Ancho medido: {width} px.</p>
    </div>
  );
}

export function FocusAndLayout() {
  const team = useRef<FieldHandle>(null);
  const [long, setLong] = useState(false);

  return (
    <section aria-labelledby="refs-title">
      <h2 id="refs-title">Foco accesible y medición</h2>

      <TeamField label="Nombre del equipo" ref={team} />
      <TeamField label="Nombre alternativo" />

      <div className="buttons">
        <button onClick={() => team.current?.focus()}>
          Ir al nombre del equipo
        </button>

        <button
          aria-pressed={long}
          onClick={() => setLong((x) => !x)}
        >
          Etiqueta extendida
        </button>
      </div>

      <MeasuredLabel long={long} />
    </section>
  );
}
