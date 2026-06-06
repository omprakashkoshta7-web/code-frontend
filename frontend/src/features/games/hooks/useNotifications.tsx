import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { userStorage } from '@/shared/utils/userStorage';

export type NotificationType =
  | 'welcome'
  | 'level_complete'
  | 'badge'
  | 'streak'
  | 'reminder'
  | 'achievement'
  | 'question_solved'
  | 'premium'
  | 'nudge'
  | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const STORAGE_KEY = 'codesprout_last_seen_notif_v1';
const POLL_MS = 60_000;

function getUserId(): string | null {
  const u = userStorage.getSync();
  return u?.id ? String(u.id) : null;
}

let subscriberCount = 0;
let sharedInterval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
let sharedItems: AppNotification[] = [];
let sharedUnread = 0;
let sharedLoading = false;
let sharedFirstLoad = true;
let sharedLastIds = new Set<string>();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

async function sharedFetch(silent = false) {
  const uid = getUserId();
  if (!uid) {
    sharedItems = [];
    sharedUnread = 0;
    sharedLoading = false;
    sharedFirstLoad = true;
    sharedLastIds = new Set();
    notifyListeners();
    return;
  }
  if (!silent) sharedLoading = true;
  notifyListeners();
  try {
    const res = await api.get(`/notifications?userId=${uid}&limit=50`);
    const list: AppNotification[] = res.data?.notifications || [];
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));

    if (!sharedFirstLoad) {
      const fresh = list.filter(n => !sharedLastIds.has(n.id));
      for (const n of fresh.slice(0, 2)) {
        const onClick = () => { window.location.href = n.link || '/'; };
        toast(
          (t: any) => (
            <div onClick={onClick} className="cursor-pointer max-w-[320px]">
              <div className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">{n.icon}</span>
                <span>{n.title}</span>
              </div>
              <div className="text-xs text-gray-300 mt-1 line-clamp-2">{n.message}</div>
            </div>
          ),
          { duration: 5000, id: `notif-${n.id}` }
        );
      }
    }
    sharedLastIds = new Set(list.map(n => n.id));
    sharedFirstLoad = false;

    sharedItems = list;
    sharedUnread = res.data?.unread ?? list.filter(n => !n.read).length;
  } catch (e) {
    // silent fail
  } finally {
    if (!silent) sharedLoading = false;
    notifyListeners();
  }
}

function startSharedPolling() {
  sharedFetch(false);
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'user') sharedFetch(false);
  };
  const onUserChange = () => sharedFetch(false);
  window.addEventListener('storage', onStorage);
  window.addEventListener('codesprout_user_change', onUserChange);
  const interval = setInterval(() => sharedFetch(true), POLL_MS);
  return { interval, onStorage, onUserChange };
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>(sharedItems);
  const [unread, setUnread] = useState(sharedUnread);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const update = () => {
      setItems([...sharedItems]);
      setUnread(sharedUnread);
      setLoading(sharedLoading);
    };
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  useEffect(() => {
    subscriberCount++;
    if (subscriberCount === 1) {
      const { interval, onStorage, onUserChange } = startSharedPolling();
      sharedInterval = interval;
    }
    return () => {
      subscriberCount--;
      if (subscriberCount <= 0 && sharedInterval) {
        clearInterval(sharedInterval);
        sharedInterval = null;
      }
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    const uid = getUserId();
    if (!uid) return;
    sharedItems = sharedItems.map(n => (n.id === id ? { ...n, read: true } : n));
    sharedUnread = Math.max(0, sharedUnread - 1);
    notifyListeners();
    try {
      await api.post(`/notifications/${id}/read?userId=${uid}`);
    } catch (e) { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    sharedItems = sharedItems.map(n => ({ ...n, read: true }));
    sharedUnread = 0;
    notifyListeners();
    try {
      await api.post(`/notifications/read-all?userId=${uid}`);
    } catch (e) { /* ignore */ }
  }, []);

  const remove = useCallback(async (id: string) => {
    const uid = getUserId();
    if (!uid) return;
    const removed = sharedItems.find(n => n.id === id);
    sharedItems = sharedItems.filter(n => n.id !== id);
    if (removed && !removed.read) sharedUnread = Math.max(0, sharedUnread - 1);
    notifyListeners();
    try {
      await api.delete(`/notifications/${id}?userId=${uid}`);
    } catch (e) { /* ignore */ }
  }, []);

  return { items, unread, open, setOpen, loading, fetchNotifications: sharedFetch, markRead, markAllRead, remove };
}
