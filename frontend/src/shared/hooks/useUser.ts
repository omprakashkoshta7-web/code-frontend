import { useState, useEffect } from 'react';
import { userStorage } from '@/shared/utils/userStorage';

export function useUser<T = any>(): T | null {
  const [user, setUser] = useState<T | null>(userStorage.getSync());

  useEffect(() => {
    userStorage.get<T>().then(setUser);
    const onChange = () => userStorage.get<T>().then(setUser);
    window.addEventListener('codesprout_user_change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('codesprout_user_change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return user;
}
