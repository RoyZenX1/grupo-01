import axios from 'axios';
import ky, { HTTPError, TimeoutError } from 'ky';
import {
  abortError, ApiError, listUrl, parseJsonText, parseReceipt, parseWorkshops,
  readResponse, RESERVATIONS, TIMEOUT, withDeadline,
} from './contract';
import type { Mode, Receipt, Reservation, Workshop } from './contract';

export interface Client {
  list(mode: Mode, signal?: AbortSignal): Promise<Workshop[]>;
  reserve(input: Reservation): Promise<Receipt>;
}

export function fetchJson(
  url: string, options: RequestInit = {}, signal?: AbortSignal,
) {
  return withDeadline(
    async (active) => readResponse(await fetch(url, { ...options, signal: active })),
    signal,
  );
}

export const fetchClient: Client = {
  async list(mode, signal) {
    return parseWorkshops(await fetchJson(listUrl(mode), {}, signal));
  },
  async reserve(input) {
    return parseReceipt(await fetchJson(RESERVATIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }));
  },
};

const axiosInstance = axios.create({
  timeout: TIMEOUT,
  responseType: 'json',
  transitional: { silentJSONParsing: false },
});

axiosInstance.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isCancel(error)) throw abortError();
  if (axios.isAxiosError(error)) {
    if (error.response && error.response.status >= 400) {
      throw new ApiError('http', error.response.status);
    }
    if (error.cause instanceof SyntaxError) throw new ApiError('format');
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new ApiError('timeout');
    }
    throw new ApiError('network');
  }
  throw error;
});

export const axiosClient: Client = {
  async list(mode, signal) {
    const response = await axiosInstance.get<unknown>(listUrl(mode), { signal });
    return parseWorkshops(response.data);
  },
  async reserve(input) {
    const response = await axiosInstance.post<unknown>(RESERVATIONS, input);
    return parseReceipt(response.data);
  },
};

function xhrJson(url: string, input?: Reservation, signal?: AbortSignal) {
  return new Promise<unknown>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const xhr = new XMLHttpRequest();
    const cancel = () => xhr.abort();

    xhr.open(input ? 'POST' : 'GET', url, true);
    xhr.timeout = TIMEOUT;

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new ApiError('http', xhr.status));
        return;
      }
      try {
        resolve(parseJsonText(xhr.responseText));
      } catch (error) {
        reject(error);
      }
    };

    xhr.onerror = () => reject(new ApiError('network'));
    xhr.ontimeout = () => reject(new ApiError('timeout'));
    xhr.onabort = () => reject(abortError());
    xhr.onloadend = () => signal?.removeEventListener('abort', cancel);

    if (input) xhr.setRequestHeader('Content-Type', 'application/json');
    signal?.addEventListener('abort', cancel, { once: true });

    try {
      xhr.send(input ? JSON.stringify(input) : null);
    } catch (error) {
      signal?.removeEventListener('abort', cancel);
      reject(error);
    }
  });
}

export const xhrClient: Client = {
  async list(mode, signal) {
    return parseWorkshops(await xhrJson(listUrl(mode), undefined, signal));
  },
  async reserve(input) {
    return parseReceipt(await xhrJson(RESERVATIONS, input));
  },
};

const kyInstance = ky.create({ timeout: TIMEOUT, retry: 0 });

async function kyJson(operation: () => Promise<unknown>, signal?: AbortSignal) {
  try {
    return await operation();
  } catch (error) {
    if (signal?.aborted) throw abortError();
    if (error instanceof HTTPError) throw new ApiError('http', error.response.status);
    if (error instanceof TimeoutError) throw new ApiError('timeout');
    if (error instanceof SyntaxError) throw new ApiError('format');
    throw error;
  }
}

export const kyClient: Client = {
  async list(mode, signal) {
    const run = () => kyInstance.get(listUrl(mode), { signal }).json<unknown>();
    return parseWorkshops(await kyJson(run, signal));
  },
  async reserve(input) {
    const run = () => kyInstance.post(RESERVATIONS, { json: input }).json<unknown>();
    return parseReceipt(await kyJson(run));
  },
};
