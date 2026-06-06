import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Star, Clock, Trophy, CreditCard, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { getDifficultyColor } from '@/shared/utils/helpers';
import { useUser } from '@/shared/hooks/useUser';

const statCards = [
  { icon: Star, label: 'Bookmarked Questions', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
  { icon: Clock, label: 'Recent Questions', gradient: 'from-sky-500 to-blue-500', shadow: 'shadow-sky-500/25' },
  { icon: Trophy, label: 'Topics Explored', gradient: 'from-primary-500 to-indigo-500', shadow: 'shadow-primary-500/25' },
];

export default function DashboardPage() {
  const { data, loading } = useDashboard();
  const user = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statValues = [
    data?.bookmarks?.length || 0,
    data?.recent_questions?.length || 0,
    data?.completed_topics?.length || 0,
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                Welcome back, <span className="font-semibold text-white">{user?.name || 'User'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data?.subscription && data.subscription.plan === 'premium' ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 shadow-sm">
                    ✨ Premium Plan
                  </span>
                  {(data.subscription as any).start_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{new Date((data.subscription as any).start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>→</span>
                      <span>{new Date((data.subscription as any).end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              ) : data?.subscription ? (
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-slate-400">
                  Free Plan
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-bl-[40px] opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-lg ${card.shadow}`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{statValues[i]}</div>
                <div className="text-sm text-slate-400 mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-400" /> Recent Questions
                </h2>
                <Link to="/questions" className="text-sm text-primary-400 hover:text-primary-500 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {data?.recent_questions?.slice(0, 5).map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/questions/${q.slug}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                        <span className="text-sm text-white group-hover:text-primary-400 transition-colors">{q.title}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                    </Link>
                  </motion.div>
                )) || <p className="text-sm text-slate-400 text-center py-4">No recent questions</p>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-warning-500" /> Bookmarks
                </h2>
                <Link to="/bookmarks" className="text-sm text-primary-400 hover:text-primary-500 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {data?.bookmarks?.slice(0, 5).map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/questions/${b.slug}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <Star className="w-3.5 h-3.5 text-warning-500 shrink-0" />
                        <span className="text-sm text-white group-hover:text-primary-400 transition-colors">{b.title}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDifficultyColor(b.difficulty)}`}>{b.difficulty}</span>
                    </Link>
                  </motion.div>
                )) || <p className="text-sm text-slate-400 text-center py-4">No bookmarks yet</p>}
              </div>
            </motion.div>
          </div>

          {data?.subscription?.plan !== 'premium' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="mt-8 card p-6 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Upgrade to Premium
                    </h2>
                    <p className="text-white/80 text-sm mt-1">Unlock interview notes, edge cases, company frequency & more</p>
                  </div>
                  <Link to="/pricing" className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all inline-flex items-center gap-2 shadow-lg shrink-0 group-hover:scale-105">
                    Upgrade <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
