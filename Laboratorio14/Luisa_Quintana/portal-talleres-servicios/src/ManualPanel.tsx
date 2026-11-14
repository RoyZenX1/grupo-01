import { useEffect, useReducer, useRef, useState } from 'react';
import { Panel } from './Panel';
import type { Client } from './http';
import type { Mode, Workshop } from './contract';

type Read = { loading: boolean; data?: Workshop[]; error?: unknown };

export function ManualPanel({ client, mode }: { client: Client; mode: Mode }) {
  const [read, setRead] = useState<Read>({ loading: true });
  const [revision, refresh] = useReducer((n: number) => n + 1, 0);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;
    let active = true;

    setRead((previous) => ({ loading: true, data: previous.data }));

    void client.list(mode, controller.signal).then(
      (data) => {
        if (active) setRead({ loading: false, data });
      },
      (error: unknown) => {
        if (active) setRead((previous) => ({
          loading: false, data: previous.data, error,
        }));
      },
    );

    return () => {
      active = false;
      controller.abort();
      activeRequest.current = null;
    };
  }, [client, mode, revision]);

  return <Panel
    data={read.data}
    error={read.error}
    loading={read.loading && read.data === undefined}
    refreshing={read.loading && read.data !== undefined}
    canReserve={mode === 'normal'}
    refresh={refresh}
    cancel={() => activeRequest.current?.abort()}
    reserve={async (input) => {
      const receipt = await client.reserve(input);
      refresh();
      return receipt;
    }}
  />;
}
