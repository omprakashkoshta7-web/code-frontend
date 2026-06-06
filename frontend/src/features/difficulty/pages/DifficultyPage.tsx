import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Check, Lock, Sparkles, Code2, BarChart3 } from 'lucide-react';
import { useQuestions } from '@/features/questions/hooks/useQuestions';
import QuestionCard from '@/features/questions/components/QuestionCard';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';

const difficultyMeta: Record<string, { color: string; title: string; desc: string; gradient: string }> = {
  easy: { color: 'success', title: 'Easy', desc: 'Basic problems to build foundation', gradient: 'from-success-500/10 via-[#0B1020] to-success-600/10' },
  medium: { color: 'warning', title: 'Medium', desc: 'Interview-level problems', gradient: 'from-warning-500/10 via-[#0B1020] to-warning-600/10' },
  hard: { color: 'danger', title: 'Hard', desc: 'Advanced problems for deep understanding', gradient: 'from-danger-500/10 via-[#0B1020] to-danger-600/10' },
};

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex items-center gap-3">
          <div className="h-4 w-4 bg-white/10 rounded" />
          <div className="flex-1 h-4 bg-white/10 rounded w-48" />
          <div className="h-6 w-16 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function DifficultyPage() {
  const location = useLocation();
  const level = location.pathname.replace('/', '');
  const meta = difficultyMeta[level] || difficultyMeta.easy;
  const { questions, loading } = useQuestions({ difficulty: level });
  const isPremium = subscriptionStorage.isPremiumSync();

  if (!isPremium && level !== 'easy') {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary-400 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-glow">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2 capitalize">{level} Questions</h1>
            <p className="text-slate-400 mb-8">{meta?.desc}</p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-8 border-2 border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-primary-600/10 max-w-md mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <Crown className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-4">Premium Feature</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Upgrade to Premium to access all <strong className="capitalize">{level}</strong> level questions with detailed cheat sheets.
                </p>
                <ul className="text-sm text-slate-400 space-y-3 mb-6 text-left max-w-xs mx-auto">
                  {[
                    `Full access to all ${level} questions`,
                    'Complete cheat sheets with pattern analysis',
                    'Interview notes & company frequency',
                    'Edge cases & optimization tricks',
                  ].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <Check className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
                <Link to="/pricing" className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" /> Upgrade to Premium
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Link to="/easy" className="inline-flex items-center gap-1 mt-6 text-sm text-primary-400 hover:underline font-medium">
                Browse free Easy questions instead <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className={`relative bg-gradient-to-br ${meta.gradient} py-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary-400 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] text-slate-400 text-xs font-semibold mb-4 shadow-sm border border-white/10">
              <BarChart3 className="w-3.5 h-3.5" /> Difficulty
            </motion.span>
            <h1 className="section-heading capitalize">{level} Questions</h1>
            <p className="section-subheading">{meta?.desc}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <SkeletonList />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
              <Code2 className="w-4 h-4" />
              <span>{questions.length} {level} questions</span>
            </div>
            {questions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} />
            ))}
            {questions.length === 0 && (
              <p className="text-center text-slate-400 py-12">No {level} questions yet.</p>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
