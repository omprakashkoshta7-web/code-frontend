import { secureStorage } from './secureStorage';

export interface SubscriptionData {
  plan?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

const PLAN_KEY = 'subscription';
const DATA_KEY = 'subscription_data';

let cachedUserId: string | null = null;
let cachedIdPromise: Promise<string | null> | null = null;

const getUserId = (): string | null => cachedUserId;
const refreshUserId = (): Promise<string | null> => {
  if (cachedIdPromise) return cachedIdPromise;
  cachedIdPromise = (async () => {
    const v = await secureStorage.getItem<any>('user');
    cachedUserId = v?.id || v?._id || null;
    return cachedUserId;
  })();
  return cachedIdPromise;
};

const keysFor = (userId: string) => ({
  plan: `${PLAN_KEY}_${userId}`,
  data: `${DATA_KEY}_${userId}`,
});

export const subscriptionStorage = {
  async isPremium(userId?: string | null): Promise<boolean> {
    const id = userId ?? getUserId() ?? await refreshUserId();
    if (!id) return false;
    const v = await secureStorage.getItem<string>(keysFor(id).plan);
    return v === 'premium';
  },

  isPremiumSync(userId?: string | null): boolean {
    const id = userId ?? getUserId();
    if (!id) return false;
    const raw = localStorage.getItem(keysFor(id).plan);
    if (!raw) return false;
    return raw === 'premium' || raw.includes('"premium"');
  },

  async get(userId?: string | null): Promise<SubscriptionData | null> {
    const id = userId ?? getUserId() ?? await refreshUserId();
    if (!id) return null;
    return await secureStorage.getItem<SubscriptionData>(keysFor(id).data);
  },

  getSync(userId?: string | null): SubscriptionData | null {
    const id = userId ?? getUserId();
    if (!id) return null;
    const raw = localStorage.getItem(keysFor(id).data);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  async set(plan: string, data: SubscriptionData, userId?: string | null) {
    const id = userId ?? getUserId() ?? await refreshUserId();
    if (!id) return;
    const k = keysFor(id);
    await secureStorage.setItem(k.plan, plan);
    await secureStorage.setItem(k.data, data);
  },

  async clear(userId?: string | null) {
    const id = userId ?? getUserId() ?? await refreshUserId();
    if (!id) return;
    const k = keysFor(id);
    secureStorage.removeItem(k.plan);
    secureStorage.removeItem(k.data);
  },

  async clearAll() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(`${PLAN_KEY}_`) || key.startsWith(`${DATA_KEY}_`))) {
        localStorage.removeItem(key);
      }
    }
  },
};
