import { REQUEST_HEADERS } from '@/config';

export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  data?: string | FormData;
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text' | 'document';
  fetch?: boolean;
  timeout?: number;
}

export interface RequestResponse<T = unknown> {
  status: number;
  response: T;
  responseHeaders: string;
  finalUrl: string;
}

export function request<T = unknown>(options: RequestOptions): Promise<RequestResponse<T>> {
  return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      url: options.url,
      method: options.method || 'GET',
      headers: {
        ...REQUEST_HEADERS,
        ...options.headers,
      },
      data: options.data,
      responseType: options.responseType || 'json',
      timeout: options.timeout,
      onload: (res) => {
        resolve({
          status: res.status,
          response: res.response as T,
          responseHeaders: res.responseHeaders,
          finalUrl: res.finalUrl,
        });
      },
      onerror: (err) => {
        reject(err);
      },
    });
  });
}

export function requestWithProgress<T = unknown>(
  options: RequestOptions,
  onProgress?: (progress: GM.Progress) => void
): Promise<RequestResponse<T>> {
  return new Promise((resolve, reject) => {
    GM.xmlHttpRequest({
      url: options.url,
      method: options.method || 'GET',
      headers: {
        ...REQUEST_HEADERS,
        ...options.headers,
      },
      data: options.data,
      responseType: options.responseType || 'blob',
      fetch: options.fetch,
      timeout: options.timeout,
      onload: (res) => {
        resolve({
          status: res.status,
          response: res.response as T,
          responseHeaders: res.responseHeaders,
          finalUrl: res.finalUrl,
        });
      },
      onerror: (err) => {
        reject(err);
      },
      onprogress: (progress) => {
        onProgress?.(progress);
      },
    });
  });
}