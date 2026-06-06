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
const POLL_MS = 30_000;

function getUserId(): string | null {
  const u = userStorage.getSync();
  return u?.id ? String(u.id) : null;
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const fetchNotifications = useCallback(async (silent = false) => {
    const uid = getUserId();
    if (!uid) {
      setItems([]);
      setUnread(0);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/notifications?userId=${uid}&limit=50`);
      const list: AppNotification[] = res.data?.notifications || [];
      list.sort((a, b) => b.created_at.localeCompare(a.created_at));

      // Detect new ones to fire toast
      if (!isFirstLoad.current) {
        const seen = lastIds.current;
        const fresh = list.filter(n => !seen.has(n.id));
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
      lastIds.current = new Set(list.map(n => n.id));
      isFirstLoad.current = false;

      setItems(list);
      setUnread(res.data?.unread ?? list.filter(n => !n.read).length);
    } catch (e) {
      // silent fail on poll
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    const uid = getUserId();
    if (!uid) return;
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnread(prev => Math.max(0, prev - 1));
    try {
      await api.post(`/notifications/${id}/read?userId=${uid}`);
    } catch (e) { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api.post(`/notifications/read-all?userId=${uid}`);
    } catch (e) { /* ignore */ }
  }, []);

  const remove = useCallback(async (id: string) => {
    const uid = getUserId();
    if (!uid) return;
    const removed = items.find(n => n.id === id);
    setItems(prev => prev.filter(n => n.id !== id));
    if (removed && !removed.read) setUnread(prev => Math.max(0, prev - 1));
    try {
      await api.delete(`/notifications/${id}?userId=${uid}`);
    } catch (e) { /* ignore */ }
  }, [items]);

  useEffect(() => {
    fetchNotifications(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') fetchNotifications(false);
    };
    window.addEventListener('storage', onStorage);
    const onUserChange = () => fetchNotifications(false);
    window.addEventListener('codesprout_user_change', onUserChange);
    const interval = setInterval(() => fetchNotifications(true), POLL_MS);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('codesprout_user_change', onUserChange);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  return { items, unread, open, setOpen, loading, fetchNotifications, markRead, markAllRead, remove };
}
