import {
  useDebugValue,
  useInsertionEffect,
  useState,
  useSyncExternalStore,
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

export function useNetworkStatus() {
  const online = useSyncExternalStore(
    subscribe,
    readOnline,
    serverOnline,
  );

  useDebugValue(online, (ok) => ok ? 'En línea' : 'Sin conexión');

  return online;
}

type Tone = 'azul' | 'verde';

const COLORS: Record<Tone, string> = {
  azul: '#143a65',
  verde: '#14543d',
};

// Adaptador didáctico de una hipotética librería de CSS en JS.
function useBadgeRule(tone: Tone) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.dataset.labBadge = tone;

    style.textContent =
      '.demo-badge[data-tone="' + tone + '"] {' +
      'background-color:' + COLORS[tone] + '; color: #fff;' +
      '}';

    document.head.append(style);

    return () => style.remove();
  }, [tone]);
}

export function Platform() {
  const online = useNetworkStatus();
  const [tone, setTone] = useState<Tone>('azul');

  useBadgeRule(tone);

  return (
    <section aria-labelledby="platform-title">
      <h2 id="platform-title">Estado externo y estilo dinámico</h2>

      <p role="status">Navegador: {online ? 'en línea' : 'sin conexión'}.
      </p>

      <p>
        <span className="demo-badge" data-tone={tone}>
          Insignia {tone}
        </span>
      </p>

      <div className="buttons">
        <button
          onClick={() =>
            setTone((x) => x === 'azul' ? 'verde' : 'azul')
          }
        >
          Cambiar color de insignia
        </button>
      </div>
    </section>
  );
}

