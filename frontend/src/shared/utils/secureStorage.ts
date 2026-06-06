const KEY_NAME = '__enc_key__';
const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

const toB64 = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
};

const fromB64 = (b64: string): Uint8Array => {
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
};

const getOrCreateKey = async (): Promise<CryptoKey> => {
  const stored = sessionStorage.getItem(KEY_NAME);
  if (stored) {
    try {
      const raw = fromB64(stored);
      return await crypto.subtle.importKey('raw', raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer, { name: ALGO }, true, ['encrypt', 'decrypt']);
    } catch { /* fall through */ }
  }

  const key = await crypto.subtle.generateKey({ name: ALGO, length: KEY_LENGTH }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  sessionStorage.setItem(KEY_NAME, toB64(raw));
  return key;
};

export const encryptString = async (plain: string): Promise<string> => {
  if (!plain) return '';
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt({ name: ALGO, iv }, key, data);
  return toB64(iv) + ':' + toB64(cipher);
};

export const decryptString = async (payload: string): Promise<string> => {
  if (!payload) return '';
  const [ivB64, cipherB64] = payload.split(':');
  if (!ivB64 || !cipherB64) return '';
  try {
    const key = await getOrCreateKey();
    const iv = fromB64(ivB64);
    const cipher = fromB64(cipherB64);
    const plain = await crypto.subtle.decrypt(
      { name: ALGO, iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer },
      key,
      cipher.buffer.slice(cipher.byteOffset, cipher.byteOffset + cipher.byteLength) as ArrayBuffer,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return '';
  }
};

export const secureStorage = {
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const json = JSON.stringify(value);
      const enc = await encryptString(json);
      localStorage.setItem(key, enc);
    } catch (e) {
      console.warn('[secureStorage] setItem failed:', e);
    }
  },

  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      if (!raw.includes(':')) {
        return JSON.parse(raw) as T;
      }
      const dec = await decryptString(raw);
      return dec ? (JSON.parse(dec) as T) : null;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clearSession(): void {
    sessionStorage.removeItem(KEY_NAME);
  },
};
