import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../api/authApi';
import { userStorage } from '@/shared/utils/userStorage';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const isConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCredential = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const res = await authApi.google(credential);
      localStorage.setItem('token', res.data.token);
      await userStorage.set(res.data.user);
      window.dispatchEvent(new Event('codesprout_user_change'));
      if (res.data.isNew) {
        toast.success('Account created with Google! Welcome 🎉');
      } else {
        toast.success('Signed in with Google!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleCredential(tokenResponse.access_token),
    onError: () => toast.error('Google sign-in was cancelled'),
    flow: 'implicit',
  });

  const login = useCallback(() => {
    if (!isConfigured) {
      toast.error('Google sign-in not configured. Set VITE_GOOGLE_CLIENT_ID in .env');
      return;
    }
    googleLogin();
  }, [googleLogin]);

  return { login, loading, isConfigured };
}
