import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { userStorage } from '@/shared/utils/userStorage';
import toast from 'react-hot-toast';
import type { LoginPayload, RegisterPayload } from '../types/auth';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = await authApi.login(payload);
      localStorage.setItem('token', res.data.token);
      await userStorage.set(res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await authApi.register(payload);
      toast.success('Account created! Please sign in.');
      navigate('/login', {
        state: {
          prefilledEmail: payload.email,
          prefilledPassword: payload.password,
          fromSignup: true,
        },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
