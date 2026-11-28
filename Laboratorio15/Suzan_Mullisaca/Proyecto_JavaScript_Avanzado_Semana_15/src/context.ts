import { useOutletContext } from 'react-router-dom';
import type { Receipt, Reservation } from './contract';

export type PortalContext = {
  receipt: Receipt | null;
  saving: boolean;
  reserve: (data: Reservation) => Promise<Receipt>;
};
export const usePortal = () => useOutletContext<PortalContext>();
