import axios from 'axios';
import axiosRetry from 'axios-retry';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';
import { userStorage } from '@/shared/utils/userStorage';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
});

axiosRetry(api, {
  retries: 4,
  retryCondition: (error) => error.response?.status === 429,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (retryCount, error) => {
    console.warn(`[429] Retry #${retryCount} for ${error.config?.url}`);
  },
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
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
