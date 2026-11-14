import {
  useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import { fetchClient } from './http';
import { Panel } from './Panel';
import type { Mode } from './contract';

const listKeys = {
  all: ['talleres'] as const,
  mode: (mode: Mode) => ['talleres', mode] as const,
};

export function QueryPanel({ mode }: { mode: Mode }) {
  const cache = useQueryClient();
  const queryKey = listKeys.mode(mode);

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchClient.list(mode, signal),
    staleTime: 12_000,
  });

  const mutation = useMutation({
    mutationFn: fetchClient.reserve,
    onSuccess: () => cache.invalidateQueries({ queryKey: listKeys.all }),
  });

  return <Panel
    data={query.data}
    error={query.error}
    loading={query.isLoading}
    refreshing={query.isFetching && query.data !== undefined}
    canReserve={mode === 'normal'}
    refresh={() => { void query.refetch(); }}
    cancel={() => { void cache.cancelQueries({ queryKey, exact: true }); }}
    reserve={(input) => mutation.mutateAsync(input)}
  />;
}
