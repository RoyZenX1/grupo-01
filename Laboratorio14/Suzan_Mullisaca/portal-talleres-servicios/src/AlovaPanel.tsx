import { createAlova, invalidateCache } from 'alova';
import { useRequest } from 'alova/client';
import adapterFetch from 'alova/fetch';
import ReactHook from 'alova/react';
import {
  listUrl, parseReceipt, parseWorkshops, readResponse, RESERVATIONS,
  withDeadline,
} from './contract';
import type { Mode, Reservation } from './contract';
import { Panel } from './Panel';

const alova = createAlova({
  statesHook: ReactHook,
  cacheFor: { GET: 12_000, POST: 0 },
  requestAdapter: adapterFetch({
    customFetch: (url, options) => withDeadline(
      (signal) => fetch(url, { ...options, signal }), options?.signal,
    ),
  }),
  responded: readResponse,
});

const listMethod = (mode: Mode) => alova.Get(listUrl(mode), {
  transform: parseWorkshops,
});

const postMethod = (input: Reservation) => alova.Post(RESERVATIONS, input, {
  transform: parseReceipt,
});

export function AlovaPanel({ mode }: { mode: Mode }) {
  const read = useRequest(listMethod(mode));
  const save = useRequest(postMethod, { immediate: false });

  async function reload() {
    await invalidateCache(listMethod(mode));
    await read.send();
  }

  const refresh = () => { void reload().catch(() => {}); };

  return <Panel
    data={read.data}
    error={read.error}
    loading={read.loading && read.data === undefined}
    refreshing={read.loading && read.data !== undefined}
    canReserve={mode === 'normal'}
    cancel={read.abort}
    refresh={refresh}
    reserve={async (input) => {
      const receipt = await save.send(input);
      refresh();
      return receipt;
    }}
  />;
}
