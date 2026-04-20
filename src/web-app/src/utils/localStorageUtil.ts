export const setInStorage = ( key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
}

export const getFromStorage = ( key: string ) => {
    return localStorage.getItem(key);
}

export const clearFromStorage = ( key: string ) => {
    localStorage.removeItem(key);
}