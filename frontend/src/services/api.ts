import axios from 'axios';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';
import { userStorage } from '@/shared/utils/userStorage';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      userStorage.clear();
      subscriptionStorage.clear();
      window.dispatchEvent(new Event('codesprout_user_change'));
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
