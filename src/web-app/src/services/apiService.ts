const BASE_URL = '/api';

type Headers = Record<string, string>;

interface RequestOptions {
  headers?: Headers;
  body?: unknown;
}

const getToken = () => {
  // ЗМІНЕНО: Шукаємо accessToken (як у твоєму App.tsx), або token про всяк випадок
  const data = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed.accessToken || parsed.token || null;
    }
    return data;
  } catch (e) {
    return data;
  }
};

const publicEndpoints = ["/login", "/sign-up"];

const isPublicEndpoint = (endpoint: string) =>
  publicEndpoints.some((url) => endpoint.startsWith(url));

async function request<T>(
  endpoint: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (!isPublicEndpoint(endpoint) && token) {
    const cleanToken = token.replace(/"/g, '');
    headers.Authorization = `Bearer ${cleanToken}`;
  }

  const config: RequestInit = { method, headers };

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // ЗМІНЕНО: Видаляємо обидва варіанти ключів, щоб точно розлогінити юзера
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      // Опціонально: можна додати window.location.href = '/login', щоб одразу викидало на сторінку входу
    }
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }

  return response.status === 204 ? {} as T : response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: Headers) => request<T>(endpoint, 'GET', { headers }),
  post: <T>(endpoint: string, body: unknown, headers?: Headers) => request<T>(endpoint, 'POST', { body, headers }),
  put: <T>(endpoint: string, body: unknown, headers?: Headers) => request<T>(endpoint, 'PUT', { body, headers }),
  patch: <T>(endpoint: string, body: unknown, headers?: Headers) => request<T>(endpoint, 'PATCH', { body, headers }),
  delete: <T>(endpoint: string, headers?: Headers) => request<T>(endpoint, 'DELETE', { headers }),
};
