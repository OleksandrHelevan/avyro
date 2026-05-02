export const setInStorage = (key: string, data: unknown) => {
  if (typeof data === 'string') {
    localStorage.setItem(key, data);
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const getFromStorage = <T = string>(key: string): T | null => {
  const item = localStorage.getItem(key);

  if (!item) return null;

  try {
    return JSON.parse(item) as T;
  } catch {
    return item as unknown as T;
  }
};

export const clearFromStorage = (key: string) => {
  localStorage.removeItem(key);
};
