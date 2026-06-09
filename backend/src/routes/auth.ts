import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getAllUsers, getUserByEmail, getUserById, addUser, getDb, saveDb } from '../data/db';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import { sendWelcomeNotification } from '../services/notifications';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email';
import { maskEmail, generateOpaqueToken } from '../services/crypto';
import { isPremiumFresh, getSubscription } from '../data/store';

const router = Router();

const publicUser = (u: { id: string; name?: string; email: string; role: string; picture?: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  email_masked: maskEmail(u.email),
  role: u.role,
  picture: u.picture,
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password).catch(() => false);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user: publicUser(user) });
});

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  if (getUserByEmail(email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const allUsers = getAllUsers();
  const maxId = Math.max(...allUsers.map(u => Number(u.id)).filter(n => !isNaN(n)), 0);
  const newUser = {
    id: String(maxId + 1),
    name, email,
    password: hashedPassword,
    role: 'user' as const,
    created_at: new Date().toISOString(),
  };
  addUser(newUser);

  try {
    sendWelcomeNotification(newUser.id, newUser.name);
    sendWelcomeEmail(newUser.email, newUser.name);
  } catch (e) {
    console.error('[auth] welcome notification failed:', e);
  }

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
  res.json({ token, user: publicUser(newUser) });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const subscription = getSubscription(userId);
  const isPremium = await isPremiumFresh(userId);
  const now = new Date();
  const subscriptionActive = subscription?.status === 'active'
    && (!subscription.end_date || new Date(subscription.end_date) > now);
  res.json({
    ...publicUser(user),
    plan: isPremium ? 'premium' : 'free',
    is_premium: isPremium,
    subscription_status: subscription?.status || (isPremium ? 'active' : 'inactive'),
    subscription_start: subscription?.start_date || null,
    subscription_end: subscription?.end_date || null,
    subscription_active: subscriptionActive,
  });
});

// POST /api/auth/google — verify Google access token via userinfo, find-or-create user, issue JWT
router.post('/google', async (req: Request, res: Response) => {
  const { credential } = req.body || {};
  console.log('[auth/google] hit, credential len:', credential ? credential.length : 0);
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

  // Fetch user info from Google using the access token
  let userInfo: any;
  try {
    const resp = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(credential)}`);
    console.log('[auth/google] userinfo status:', resp.status);
    if (!resp.ok) {
      const text = await resp.text();
      console.log('[auth/google] userinfo body:', text.slice(0, 200));
      return res.status(401).json({ error: 'Invalid Google token', detail: text });
    }
    userInfo = await resp.json();
    console.log('[auth/google] userinfo email:', userInfo?.email);
  } catch (e: any) {
    console.log('[auth/google] fetch error:', e?.message);
    return res.status(401).json({ error: 'Failed to verify Google token', detail: e?.message });
  }

  if (!userInfo?.email) {
    return res.status(400).json({ error: 'Google account has no email' });
  }
  if (userInfo.email_verified === false) {
    return res.status(400).json({ error: 'Google email not verified' });
  }

  const email = String(userInfo.email).toLowerCase();
  const name = userInfo.name || userInfo.given_name || email.split('@')[0];
  const picture = userInfo.picture || '';

  let user = getUserByEmail(email);
  let isNew = false;
  if (!user) {
    const allUsers = getAllUsers();
    const maxId = Math.max(...allUsers.map(u => Number(u.id)).filter(n => !isNaN(n)), 0);
    user = {
      id: String(maxId + 1),
      name,
      email,
      password: '',
      role: 'user' as const,
      created_at: new Date().toISOString(),
      picture,
      provider: 'google',
    } as any;
    addUser(user as any);
    isNew = true;
  }

  const finalUser = user!;

  if (isNew) {
    try {
      sendWelcomeNotification(finalUser.id, finalUser.name);
      sendWelcomeEmail(finalUser.email, finalUser.name);
    } catch (e) { console.error('[auth] google welcome failed:', e); }
  }

  const token = generateToken({ id: finalUser.id, email: finalUser.email, role: finalUser.role, name: finalUser.name });
  res.json({ token, user: publicUser(finalUser), isNew });
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = getUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists — always return success
    return res.json({ message: 'If that email is registered, a password reset link has been sent.' });
  }

  const token = generateOpaqueToken(32);
  const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  const db = getDb();
  const idx = db.users.findIndex(u => u.id === user.id);
  if (idx === -1) return res.status(500).json({ error: 'User not found in database' });
  db.users[idx] = { ...db.users[idx], resetToken: token, resetTokenExpiry: expiry };
  saveDb();

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetLink);
  } catch (e) {
    console.error('[auth] forgot-password email send failed:', e);
  }

  res.json({ message: 'If that email is registered, a password reset link has been sent.' });
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const db = getDb();
  const user = db.users.find(u => u.resetToken === token);
  if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return res.status(400).json({ error: 'Reset token has expired' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const idx = db.users.findIndex(u => u.id === user.id);
  db.users[idx] = { ...db.users[idx], password: hashedPassword, resetToken: undefined, resetTokenExpiry: undefined };
  saveDb();

  res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
});

// PUT /api/auth/profile — update name, picture
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, picture } = req.body;
  const db = getDb();
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  if (name !== undefined) db.users[idx].name = name;
  if (picture !== undefined) db.users[idx].picture = picture;
  saveDb();

  const user = db.users[idx];
  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ user: publicUser(user), token });
});

// PUT /api/auth/password — change password (requires current password)
router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(currentPassword, user.password).catch(() => false);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const db = getDb();
  const idx = db.users.findIndex(u => u.id === userId);
  db.users[idx] = { ...db.users[idx], password: hashedPassword };
  saveDb();

  res.json({ message: 'Password changed successfully' });
});

export default router;
