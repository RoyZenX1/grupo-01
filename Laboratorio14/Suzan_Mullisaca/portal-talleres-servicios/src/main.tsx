import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { App } from './App';
import './styles.css';

const cache = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: { retry: false },
  },
});

const root = document.getElementById('root');

if (!root) throw new Error('Falta el contenedor #root.');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={cache}>
      <SWRConfig value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 1500,
      }}>
        <App />
      </SWRConfig>
    </QueryClientProvider>
  </StrictMode>,
);
