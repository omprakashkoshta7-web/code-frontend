import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getMasterKey = (): Buffer => {
  const raw = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'codesprout-default-encryption-key-change-me';
  return crypto.createHash('sha256').update(String(raw)).digest();
};

export const encryptField = (plain: string | null | undefined): string => {
  if (plain === null || plain === undefined || plain === '') return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, getMasterKey(), iv);
    const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
  } catch {
    return '';
  }
};

export const decryptField = (payload: string | null | undefined): string => {
  if (!payload) return '';
  try {
    const parts = String(payload).split(':');
    if (parts.length !== 4 || parts[0] !== 'v1') return '';
    const iv = Buffer.from(parts[1], 'base64');
    const tag = Buffer.from(parts[2], 'base64');
    const enc = Buffer.from(parts[3], 'base64');
    const decipher = crypto.createDecipheriv(ALGO, getMasterKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString('utf8');
  } catch {
    return '';
  }
};

export const hashSensitive = (value: string): string => {
  if (!value) return '';
  return crypto.createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
};

export const maskEmail = (email: string | undefined | null): string => {
  if (!email) return '';
  const [user, domain] = String(email).split('@');
  if (!domain) return '';
  const masked = user.length <= 2 ? user[0] + '*' : user[0] + '*'.repeat(Math.max(1, user.length - 2)) + user[user.length - 1];
  return `${masked}@${domain}`;
};

export const maskUPI = (upi: string | undefined | null): string => {
  if (!upi) return '';
  const s = String(upi);
  if (s.length <= 4) return s;
  return s.slice(0, 2) + '*'.repeat(s.length - 4) + s.slice(-2);
};

export const generateOpaqueToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('base64url');
};
