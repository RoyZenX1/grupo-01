import { useContext, useEffect, useEffectEvent, useState } from 'react';
import { DetailsContext } from './preferences';
import { WORKSHOPS } from './workshops';
import type { WorkshopId } from './workshops';

export const notices = new EventTarget();

export function Notices() {
  const [channel, setChannel] = useState<WorkshopId>('react');
  const [message, setMessage] = useState('En espera de avisos.');
  const details = useContext(DetailsContext);

  const onNotice = useEffectEvent((title: string) => {
    setMessage(
      details ? 'Cupos revisados para ' + title : 'Aviso recibido.'
    );
  });

  useEffect(() => {
    const title = WORKSHOPS.find((item) => item.id === channel)?.title;
    const listener = () => onNotice(title ?? channel);
    notices.addEventListener(channel, listener);
    return () => notices.removeEventListener(channel, listener);
  }, [channel]);

  return (
    <section aria-labelledby="notices-title">
      <h2 id="notices-title">Avisos de cupos</h2>
      <label>
        Canal de avisos
        <select
          value={channel}
          onChange={(event) => {
            const item = WORKSHOPS.find((w) => w.id === event.target.value);
            if (!item) return;
            setChannel(item.id);
            setMessage('En espera de avisos.');
          }}
        >
          {WORKSHOPS.map(({ id, title }) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </label>
      <p role="status">{message}</p>
      <div className="buttons">
        <button
          onClick={() => {
            const title = WORKSHOPS.find((i) => i.id === channel)?.title ?? channel;
            notices.dispatchEvent(new Event(channel));
            setMessage('Evento emitido para ' + title + '.');
          }}
        >
          Emitir aviso en el canal
        </button>
      </div>
    </section>
  );
}