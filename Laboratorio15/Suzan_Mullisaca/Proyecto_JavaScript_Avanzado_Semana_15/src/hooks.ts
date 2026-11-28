import { useQuery } from '@tanstack/react-query';
import type { Mode } from './contract';
import { getWorkshops } from './services';

export const workshopKey = ['talleres'] as const;
export function useWorkshops(mode: Mode = 'normal') {
  return useQuery({
    queryKey: [...workshopKey, mode],
    queryFn: ({ signal }) => getWorkshops(mode, signal),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
