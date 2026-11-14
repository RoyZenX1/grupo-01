import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { listUrl, parseWorkshops, RESERVATIONS } from './contract';
import type { Mode, Reservation } from './contract';
import { fetchClient, fetchJson } from './http';
import { Panel } from './Panel';

async function readWorkshops(url: string) {
  return parseWorkshops(await fetchJson(url));
}

function SharedCount({ url }: { url: string }) {
  const { data } = useSWR(url, readWorkshops);
  return <p>Segundo consumidor: {data?.length ?? '—'} talleres.</p>;
}

export function SwrPanel({ mode }: { mode: Mode }) {
  const url = listUrl(mode);
  const query = useSWR(url, readWorkshops);

  const write = useSWRMutation(
    RESERVATIONS,
    (_url, { arg }: { arg: Reservation }) => fetchClient.reserve(arg),
  );

  const refresh = () => { void query.mutate().catch(() => {}); };

  return <>
    <SharedCount url={url} />
    <Panel
      data={query.data}
      error={query.error}
      loading={query.isLoading}
      refreshing={query.isValidating && query.data !== undefined}
      canReserve={mode === 'normal'}
      refresh={refresh}
      reserve={async (input) => {
        const receipt = await write.trigger(input);
        refresh();
        return receipt;
      }}
    />
  </>;
}
