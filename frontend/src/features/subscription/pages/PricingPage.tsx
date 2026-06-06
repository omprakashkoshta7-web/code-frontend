import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_PLANS } from '@/shared/utils/constants';
import PricingCard from '../components/PricingCard';
import FAQ from '@/shared/components/FAQ';
import toast from 'react-hot-toast';
import { Crown, Shield, Zap, Sparkles, Check, Calendar, ArrowRight, Star, Infinity, Lock, Code2, Brain, BarChart3, Lightbulb, Target, RefreshCw, ChevronRight } from 'lucide-react';
import type { PricingPlan } from '../types/subscription';
import { subscriptionApi } from '../api/subscriptionApi';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface SubData {
  plan?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

const comparisonFeatures = [
  { name: 'Pattern Recognition', free: true, premium: true },
  { name: 'Complexity Analysis', free: true, premium: true },
  { name: 'Basic Approach', free: true, premium: true },
  { name: 'Recognition Signals', free: false, premium: true },
  { name: 'Interview Notes', free: false, premium: true },
  { name: 'Edge Cases & Tricks', free: false, premium: true },
  { name: 'Company Frequency', free: false, premium: true },
  { name: 'Related Question Chains', free: false, premium: true },
  { name: 'Priority Support', free: false, premium: true },
];

const testimonials = [
  { text: 'Worth every rupee! The interview notes helped me crack Amazon.', name: 'Rahul V.', role: 'SDE at Amazon' },
  { text: 'Company frequency data is a game changer for interview prep.', name: 'Priya S.', role: 'SDE at Google' },
  { text: 'Pattern deep dives made complex topics click instantly.', name: 'Ananya P.', role: 'SDE at Microsoft' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [subData, setSubData] = useState<SubData | null>(null);

  useEffect(() => {
    (async () => {
      const cached = await subscriptionStorage.get();
      if (cached && subscriptionStorage.isPremiumSync()) {
        setSubData(cached);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await subscriptionApi.getStatus();
        if (res.data && res.data.plan === 'premium') {
          setSubData(res.data);
          await subscriptionStorage.set('premium', res.data);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const isPremium = !!subData && subData.plan === 'premium';

  const plans: (PricingPlan & { popular: boolean })[] = [
    { ...SUBSCRIPTION_PLANS.FREE, popular: false },
    { ...SUBSCRIPTION_PLANS.PREMIUM, popular: true },
  ];

  const handleSelect = (plan: PricingPlan) => {
    if (plan.price === 0) {
      navigate('/topics');
    } else {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to subscribe');
        navigate('/login');
        return;
      }
      navigate('/payment');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Floating decorative elements */}
      <div className="fixed top-32 left-10 w-20 h-20 border border-violet-500/20 rounded-2xl rotate-12 opacity-30 hidden lg:block" />
      <div className="fixed bottom-40 right-10 w-16 h-16 border border-purple-500/20 rounded-xl -rotate-6 opacity-30 hidden lg:block" />
      <div className="fixed top-60 right-20 w-3 h-3 rounded-full bg-violet-400/30 hidden lg:block" />
      <div className="fixed bottom-60 left-20 w-2 h-2 rounded-full bg-purple-400/20 hidden lg:block" />

      {/* Hero */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
                <Crown className="w-4 h-4" /> Simple Pricing
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              <span className="text-white">Start Free,</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Upgrade When Ready</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto px-4"
            >
              Everything you need to master coding interviews. Start with our free plan and unlock premium features when you need to go deeper.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            >
              {[
                { label: '500+ Questions', icon: Code2, color: 'text-emerald-400' },
                { label: 'Pattern Sheets', icon: Brain, color: 'text-violet-400' },
                { label: 'Live Editor', icon: Zap, color: 'text-amber-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/50">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Active Banner */}
      {isPremium && subData && (
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-500/10 via-[#111827] to-[#111827] border border-violet-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">Premium Plan Active</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-500/10 text-success-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Started: <span className="text-white font-medium">{formatDate(subData.start_date || '')}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: <span className="text-white font-medium">{formatDate(subData.end_date || '')}</span></span>
                  </div>
                </div>
                {subData.end_date && (
                  <p className="mt-2 text-xs text-violet-400">
                    {daysRemaining(subData.end_date)} days remaining
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={i}
              onSelect={() => handleSelect(plan)}
              isCurrentPlan={isPremium && plan.price > 0}
            />
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#111827]/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm"
        >
          <div className="p-6 sm:p-8 border-b border-white/5">
            <h2 className="text-lg sm:text-xl font-bold text-white">Compare Plans</h2>
            <p className="text-sm text-white/40 mt-1">See exactly what you get with each plan</p>
          </div>
          <div className="divide-y divide-white/5">
            {comparisonFeatures.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center px-6 sm:px-8 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <span className="flex-1 text-sm text-white/70">{f.name}</span>
                <div className="flex items-center gap-6 sm:gap-12">
                  <span className={`w-20 sm:w-24 text-center text-xs font-medium ${f.free ? 'text-emerald-400' : 'text-white/20'}`}>
                    {f.free ? 'Free' : '—'}
                  </span>
                  <span className={`w-20 sm:w-24 text-center text-xs font-medium ${f.premium ? 'text-violet-400' : 'text-white/20'}`}>
                    {f.premium ? 'Premium' : '—'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-white"
          >
            Trusted by Developers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-white/40 mt-2"
          >
            Join thousands who have upgraded their interview prep
          </motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111827]/60 border border-white/5 rounded-xl p-5 sm:p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/30">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-violet-500/10 via-[#111827] to-[#111827] border border-violet-500/20 rounded-2xl p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to Ace Your Interview?</h2>
          <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto mb-6">
            Join thousands of developers who have cracked their dream interviews with CodeSprout.
          </p>
          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token) { navigate('/login'); return; }
              navigate('/payment');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-400 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
          >
            Get Premium <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      <div className="relative z-10">
        <FAQ />
      </div>
    </div>
  );
}
