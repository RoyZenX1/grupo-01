import {
  useDebugValue, useInsertionEffect, useState, useSyncExternalStore,
} from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const readOnline = () => navigator.onLine;
const serverOnline = () => true;

function useNetworkStatus() {
  const online = useSyncExternalStore(subscribe, readOnline, serverOnline);
  useDebugValue(online ? 'En línea' : 'Sin conexión');
  return online;
}

export function Platform() {
  const online = useNetworkStatus();
  const [color, setColor] = useState<'azul' | 'verde'>('azul');

  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-lab-badge', '');
    style.textContent = `.badge-lab { background: ${color === 'azul' ? '#143a65' : '#1b7a3e'}; color: #fff; padding: .2rem .6rem; border-radius: .35rem; display: inline-block; }`;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [color]);

  return (
    <section aria-labelledby="platform-title">
      <h2 id="platform-title">Plataforma</h2>
      <p role="status">
        {online ? 'En línea' : 'Sin conexión'} — <span className="badge-lab">Insignia</span>
      </p>
      <label>
        Color de la insignia
        <select value={color} onChange={(e) => setColor(e.target.value as 'azul' | 'verde')}>
          <option value="azul">Azul</option>
          <option value="verde">Verde</option>
        </select>
      </label>
    </section>
  );
}