import { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';
import type { PaymentInit, PaymentStatus, PaymentVerify, RazorpayOrder, RazorpayVerifyResponse } from '../types/payment';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';
import { subscriptionApi } from '@/features/subscription/api/subscriptionApi';
import toast from 'react-hot-toast';

export function usePaymentInit() {
  const [payment, setPayment] = useState<PaymentInit | null>(null);
  const [loading, setLoading] = useState(false);

  const init = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.init();
      setPayment(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { payment, loading, init };
}

export function usePaymentVerify() {
  const [verifying, setVerifying] = useState(false);

  const verify = async (utr: string, paymentId?: string): Promise<PaymentVerify | null> => {
    setVerifying(true);
    try {
      const res = await paymentApi.verify(utr, paymentId);
      toast.success(res.data.message);
      if (res.data.subscription) {
        await subscriptionStorage.set('premium', res.data.subscription as any);
      }
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Verification failed');
      return null;
    } finally {
      setVerifying(false);
    }
  };

  return { verifying, verify };
}

export function usePaymentStatus() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.status();
      setStatus(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, check };
}

export function useRazorpayStatus() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await paymentApi.razorpayStatus();
        setEnabled(res.data.enabled);
      } catch {
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { enabled, loading };
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

let razorpayScriptPromise: Promise<boolean> | null = null;

const loadRazorpayScript = (): Promise<boolean> => {
  if (razorpayScriptPromise) return razorpayScriptPromise;
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  razorpayScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener('load', () => resolve(!!window.Razorpay));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return razorpayScriptPromise;
};

export function useRazorpayCheckout() {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCheckout = async (): Promise<RazorpayVerifyResponse | null> => {
    setError(null);
    setOpening(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay checkout');
      }

      const orderRes = await paymentApi.createRazorpayOrder();
      const order: RazorpayOrder = orderRes.data;

      return await new Promise<RazorpayVerifyResponse | null>((resolve) => {
        let resolved = false;

        const finalize = async (data: RazorpayVerifyResponse | null) => {
          if (resolved) return;
          resolved = true;
          if (data?.subscription) {
            await subscriptionStorage.set('premium', data.subscription as any);
            toast.success(data.message || 'Payment verified! Premium activated.');
          }
          resolve(data);
        };

        const pollBackend = () => {
          let attempts = 0;
          const maxAttempts = 20;
          const interval = setInterval(async () => {
            attempts++;
            try {
              const res = await subscriptionApi.getStatus();
              if (res.data?.plan === 'premium') {
                clearInterval(interval);
                await finalize({
                  success: true,
                  message: 'Payment verified! Premium subscription activated.',
                  subscription: res.data,
                } as any);
                return;
              }
            } catch {}
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              toast('Payment could not be verified. Please check later.');
              finalize(null);
            }
          }, 2000);
        };

        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'CodeSprout',
          description: 'Premium Subscription (30 days)',
          image: '/logo.png',
          order_id: order.order_id,
          prefill: order.prefill,
          notes: order.notes,
          theme: { color: '#7C6CF6' },
          handler: async (response: any) => {
            try {
              const verifyRes = await paymentApi.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_id: order.payment_id,
              });
              await finalize(verifyRes.data);
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Payment verification failed');
              finalize(null);
            }
          },
          modal: {
            ondismiss: () => {
              pollBackend();
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          toast.error(resp?.error?.description || 'Payment failed');
          finalize(null);
        });
        rzp.open();
      });
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Razorpay checkout failed';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setOpening(false);
    }
  };

  return { openCheckout, opening, error };
}
