import { secureStorage, encryptString, decryptString } from './secureStorage';

const KEY = 'user';
let cached: any = null;
let pending: Promise<any> | null = null;

const getUser = async <T = any>(): Promise<T | null> => {
  if (cached !== null) return cached as T;
  if (pending) return pending as Promise<T | null>;
  pending = (async () => {
    const v = await secureStorage.getItem(KEY);
    cached = v ?? null;
    pending = null;
    return cached as T | null;
  })();
  return pending as Promise<T | null>;
};

const setUser = async (user: any): Promise<void> => {
  cached = user;
  await secureStorage.setItem(KEY, user);
};

const clearUser = (): void => {
  cached = null;
  secureStorage.removeItem(KEY);
};

export const userStorage = {
  get: getUser,
  getSync: (): any => cached,
  set: setUser,
  clear: clearUser,
  encrypt: encryptString,
  decrypt: decryptString,
} as const;
