import { Router, Response, Request } from 'express';
import { randomUUID } from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth';
import { isPremium, getSubscription } from '../data/store';
import {
  getUserById,
  getPaymentRequests,
  getPaymentRequestsByUser,
  addPaymentRequest,
  updatePaymentRequest,
  findPaymentRequest,
} from '../data/db';
import { sendPremiumNotification } from '../services/notifications';
import { sendSubscriptionEmail } from '../services/email';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhook,
  fetchRazorpayPayment,
  refundRazorpayPayment,
  isRazorpayEnabled,
} from '../services/razorpay';
import type { Subscription } from '../types';

const router = Router();

interface PaymentRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan: 'premium';
  amount: number;
  upi_id: string;
  qr_data: string;
  utr?: string;
  status: 'pending' | 'verified' | 'failed';
  created_at: string;
  verified_at?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  provider?: 'upi' | 'razorpay';
}

const activatePremium = async (userId: string, userName: string, userEmail: string, amount: number) => {
  const { addSubscription } = await import('../data/store');
  const newSub: Subscription = {
    id: randomUUID(),
    user_id: userId,
    plan: 'premium',
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };

  addSubscription(newSub);

  sendPremiumNotification(userId);
  sendSubscriptionEmail(userEmail, userName, 'Premium', new Date(newSub.end_date!), amount).catch(e =>
    console.error('[payments] email failed:', e)
  );

  return newSub;
};

const UPI_ID = process.env.UPI_ID || 'codesprout@upi';
const UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME || 'CodeSprout';
const UPI_CURRENCY = process.env.UPI_CURRENCY || 'INR';
const AMOUNT = Number(process.env.PREMIUM_AMOUNT) || 49;
const SUBSCRIPTION_DAYS = Number(process.env.SUBSCRIPTION_DAYS) || 30;

const buildUpiLink = (txnNote: string) => {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: String(AMOUNT),
    cu: UPI_CURRENCY,
    tn: txnNote,
  });
  return `upi://pay?${params.toString()}`;
};

router.get('/razorpay/status', (_req: Request, res: Response) => {
  res.json({ enabled: isRazorpayEnabled(), build: 'status-public-v2' });
});

router.post('/razorpay/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (!verifyRazorpayWebhook(rawBody, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body?.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body?.payload?.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const payment = findPaymentRequest((p: any) => p.razorpay_order_id === orderId);
        if (payment && payment.status !== 'verified') {
          updatePaymentRequest(payment.id, payment.user_id, {
            razorpay_payment_id: paymentEntity.id,
            utr: paymentEntity.id,
            status: 'verified',
            verified_at: new Date().toISOString(),
          });
          const user = getUserById(payment.user_id);
          await activatePremium(payment.user_id, payment.user_name, user?.email || payment.user_email, payment.amount);
        }
      }
    }

    res.json({ received: true });
  } catch (e: any) {
    const msg = e?.error?.description || e?.message || 'Webhook processing failed';
    console.error('[razorpay] webhook failed:', msg);
    res.status(500).json({ error: msg });
  }
});

router.use(authenticate);

router.get('/subscription', (req: AuthRequest, res: Response) => {
  const sub = getSubscription(req.user!.id);
  if (sub) {
    if (sub.status === 'active' && sub.end_date && new Date(sub.end_date) < new Date()) {
      sub.status = 'inactive';
    }
    res.json(sub);
  } else {
    res.json({ plan: 'free', status: 'active' });
  }
});

router.post('/init', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  if (isPremium(userId)) {
    return res.status(400).json({ error: 'Already premium user' });
  }

  const txnId = `CS${Date.now()}${userId.slice(-4).toUpperCase()}`;
  const upiLink = buildUpiLink(`Premium ${txnId}`);

  const payment: PaymentRequest = {
    id: randomUUID(),
    user_id: userId,
    user_name: req.user!.name || req.user!.email,
    user_email: req.user!.email,
    plan: 'premium',
    amount: AMOUNT,
    upi_id: UPI_ID,
    qr_data: upiLink,
    status: 'pending',
    created_at: new Date().toISOString(),
    provider: 'upi',
  };

  addPaymentRequest(payment);

  res.json({
    payment_id: payment.id,
    txn_id: txnId,
    amount: AMOUNT,
    currency: UPI_CURRENCY,
    upi_id: UPI_ID,
    payee_name: UPI_PAYEE_NAME,
    qr_data: upiLink,
    upi_deep_link: upiLink,
    status: 'pending',
    expires_in: '15 minutes',
  });
});

router.post('/verify', async (req: AuthRequest, res: Response) => {
  const { utr, payment_id } = req.body;
  const userId = req.user!.id;

  if (!utr || utr.length < 5) {
    return res.status(400).json({ error: 'Valid UTR number required' });
  }

  const allUserPayments = getPaymentRequestsByUser(userId);
  const payment = payment_id
    ? allUserPayments.find((p: any) => p.id === payment_id)
    : allUserPayments[allUserPayments.length - 1];

  if (!payment) {
    return res.status(404).json({ error: 'Payment request not found' });
  }

  if (payment.status === 'verified') {
    return res.status(400).json({ error: 'Payment already verified' });
  }

  updatePaymentRequest(payment.id, userId, {
    utr,
    status: 'verified',
    verified_at: new Date().toISOString(),
    provider: 'upi',
  });

  const user = getUserById(userId);
  const newSub = await activatePremium(userId, req.user!.name || req.user!.email, user?.email || payment.user_email, payment.amount);

  res.json({
    success: true,
    message: 'Payment verified! Premium subscription activated.',
    payment: {
      id: payment.id,
      utr,
      amount: payment.amount,
      verified_at: new Date().toISOString(),
    },
    subscription: newSub,
  });
});

router.post('/razorpay/create-order', async (req: AuthRequest, res: Response) => {
  try {
    if (!isRazorpayEnabled()) {
      return res.status(503).json({ error: 'Razorpay is not configured on the server' });
    }

    const userId = req.user!.id;

    if (isPremium(userId)) {
      return res.status(400).json({ error: 'Already premium user' });
    }

    const receipt = `CS${Date.now()}${userId.slice(-4).toUpperCase()}`;
    const order = await createRazorpayOrder({
      amount: AMOUNT,
      currency: UPI_CURRENCY,
      receipt,
      notes: {
        user_id: userId,
        user_email: req.user!.email,
        plan: 'premium',
      },
    });

    const payment: PaymentRequest = {
      id: randomUUID(),
      user_id: userId,
      user_name: req.user!.name || req.user!.email,
      user_email: req.user!.email,
      plan: 'premium',
      amount: AMOUNT,
      upi_id: '',
      qr_data: '',
      status: 'pending',
      created_at: new Date().toISOString(),
      razorpay_order_id: order.id,
      provider: 'razorpay',
    };

    addPaymentRequest(payment);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: process.env.RAZORPAY_KEY_ID,
      payment_id: payment.id,
      prefill: {
        name: req.user!.name,
        email: req.user!.email,
      },
      notes: { plan: 'premium' },
    });
  } catch (e: any) {
    const rzpErr = e?.error?.description || e?.error?.message;
    const msg = rzpErr || e?.message || e?.toString() || 'Failed to create Razorpay order';
    console.error('[razorpay] create-order failed:', JSON.stringify(e?.error || e?.message || e, null, 2));
    res.status(500).json({ error: msg, detail: e?.error?.code || e?.statusCode || undefined });
  }
});

router.post('/razorpay/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;
    const userId = req.user!.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing Razorpay payment details' });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const payment = findPaymentRequest(
      (p: any) => p.user_id === userId && (p.id === payment_id || p.razorpay_order_id === razorpay_order_id)
    );

    const alreadyVerified = isPremium(userId);
    if (alreadyVerified) {
      return res.json({
        success: true,
        message: 'Payment already verified! Premium subscription active.',
        subscription: null,
      });
    }

    const user = getUserById(userId);
    const newSub = await activatePremium(userId, req.user!.name || req.user!.email, user?.email || req.user!.email, AMOUNT);

    if (payment) {
      updatePaymentRequest(payment.id, userId, {
        razorpay_payment_id,
        utr: razorpay_payment_id,
        status: 'verified',
        verified_at: new Date().toISOString(),
        provider: 'razorpay',
      });
    }

    res.json({
      success: true,
      message: 'Payment verified! Premium subscription activated.',
      payment: payment ? {
        id: payment.id,
        razorpay_order_id,
        razorpay_payment_id,
        amount: payment.amount,
        verified_at: new Date().toISOString(),
      } : { razorpay_order_id, razorpay_payment_id, amount: AMOUNT },
      subscription: newSub,
    });
  } catch (e: any) {
    const msg = e?.error?.description || e?.message || 'Failed to verify payment';
    console.error('[razorpay] verify failed:', msg);
    res.status(500).json({ error: msg });
  }
});

router.post('/razorpay/refund', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const { payment_id, amount } = req.body;
    const payment = findPaymentRequest((p: any) => p.id === payment_id);
    if (!payment || !payment.razorpay_payment_id) {
      return res.status(404).json({ error: 'Razorpay payment not found' });
    }
    const refund = await refundRazorpayPayment(payment.razorpay_payment_id, amount);
    res.json({ success: true, refund });
  } catch (e: any) {
    const msg = e?.error?.description || e?.message || 'Refund failed';
    res.status(500).json({ error: msg });
  }
});

router.get('/status', (req: AuthRequest, res: Response) => {
  const userPayments = getPaymentRequestsByUser(req.user!.id);
  const payment = userPayments[userPayments.length - 1];
  if (!payment) {
    return res.json({ status: 'no_payment' });
  }
  res.json({
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    upi_id: payment.upi_id,
    utr: payment.utr || null,
    created_at: payment.created_at,
    verified_at: payment.verified_at || null,
  });
});

router.get('/requests', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  res.json(getPaymentRequests());
});

router.get('/debug/subscriptions', (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  const subs = (require('../data/db') as any).getSubscriptions ? (require('../data/db') as any).getSubscriptions() : [];
  res.json({ count: subs.length, subscriptions: subs });
});

router.get('/debug/whoami', (req: AuthRequest, res: Response) => {
  const subs = (require('../data/db') as any).getSubscriptions();
  const mine = subs.filter((s: any) => s.user_id === req.user!.id);
  res.json({
    user_id: req.user!.id,
    role: req.user!.role,
    email: req.user!.email,
    my_subscriptions: mine,
    is_premium: mine.some((s: any) => s.plan === 'premium' && s.status === 'active'),
  });
});

router.post('/admin-verify', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const { payment_id, action } = req.body;
  const payment = findPaymentRequest((p: any) => p.id === payment_id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  if (action === 'verify') {
    updatePaymentRequest(payment.id, payment.user_id, {
      status: 'verified',
      verified_at: new Date().toISOString(),
    });

    const user = getUserById(payment.user_id);
    await activatePremium(payment.user_id, payment.user_name, user?.email || payment.user_email, payment.amount);

    return res.json({ success: true, message: 'Payment verified by admin' });
  }

  if (action === 'reject') {
    updatePaymentRequest(payment.id, payment.user_id, { status: 'failed' });
    return res.json({ success: true, message: 'Payment rejected' });
  }

  res.status(400).json({ error: 'Invalid action' });
});

export default router;
