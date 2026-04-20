const BASE_URL = '/api';

type Headers = Record<string, string>;

interface RequestOptions {
  headers?: Headers;
  body?: unknown;
}

async function request<T>(endpoint: string, method: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: Headers) =>
    request<T>(endpoint, 'GET', { headers }),

  post: <T>(endpoint: string, body: unknown, headers?: Headers) =>
    request<T>(endpoint, 'POST', { body, headers }),

  put: <T>(endpoint: string, body: unknown, headers?: Headers) =>
    request<T>(endpoint, 'PUT', { body, headers }),

  patch: <T>(endpoint: string, body: unknown, headers?: Headers) =>
    request<T>(endpoint, 'PATCH', { body, headers }),

  delete: <T>(endpoint: string, headers?: Headers) =>
    request<T>(endpoint, 'DELETE', { headers }),
};
