import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Gamepad2, Lock, CheckCircle2, Crown, Star, Zap, Brain,
  Trophy, Sparkles, ChevronRight,
} from 'lucide-react';
import { useGameProgress } from '../hooks/useGameProgress';
import { GAMES_BY_TOPIC, buildGenericLevels, type Difficulty } from '../data/gamesData';

const difficultyMeta: Record<Difficulty, {
  label: string; color: string; gradient: string; icon: any; questions: number; xp: number;
  desc: string;
}> = {
  easy: { label: 'Easy', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500', icon: Brain, questions: 2, xp: 50, desc: 'Warm-up with quick MCQs + a starter coding problem.' },
  medium: { label: 'Medium', color: 'text-amber-400', gradient: 'from-amber-500 to-orange-500', icon: Zap, questions: 2, xp: 80, desc: 'Mixed bag of tricky MCQs and a tighter coding task.' },
  hard: { label: 'Hard', color: 'text-rose-400', gradient: 'from-rose-500 to-pink-500', icon: Crown, questions: 1, xp: 120, desc: 'Boss-level: one shot at the toughest challenge.' },
};

const order: Difficulty[] = ['easy', 'medium', 'hard'];

export default function GameTopicPage() {
  const { topic: topicParam } = useParams<{ topic: string }>();
  const topic = topicParam ? decodeURIComponent(topicParam) : '';
  const navigate = useNavigate();
  const { getLevel, isLevelUnlocked, progress } = useGameProgress();
  const [stats, setStats] = useState<{ questions: number; patterns: number; topics: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const levels = GAMES_BY_TOPIC[topic] || buildGenericLevels(topic);
  const totalQuestions = order.reduce((s, l) => s + levels[l].length, 0);
  const topicCompleted = order.filter((l) => getLevel(topic, l)).length;
  const allDone = topicCompleted === 3;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16">
        <Link to="/games" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition mb-5">
          <ArrowLeft className="w-4 h-4" /> All Topics
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
              <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{topic}</h1>
              <p className="text-white/50 text-sm mt-1">
                {totalQuestions} questions • 3 levels • Earn up to 250 XP
              </p>
            </div>
            {allDone && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5" /> Complete
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {order.map((lvl) => {
              const r = getLevel(topic, lvl);
              return (
                <div key={lvl} className="bg-white/[0.02] border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">{lvl}</div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {r ? `${Math.round((r.score / r.total) * 100)}%` : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Levels */}
        <div className="space-y-3 sm:space-y-4">
          {order.map((lvl, i) => {
            const meta = difficultyMeta[lvl];
            const result = getLevel(topic, lvl);
            const unlocked = isLevelUnlocked(topic, lvl);
            const Icon = meta.icon;
            return (
              <motion.div
                key={lvl}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {unlocked ? (
                  <Link
                    to={`/games/${encodeURIComponent(topic)}/${lvl}`}
                    className="group block bg-[#0d0f1f] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-white/20 hover:shadow-lg transition-all relative overflow-hidden"
                  >
                    <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${meta.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`} />
                    <div className="relative flex items-center gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-base sm:text-lg font-bold ${meta.color}`}>{meta.label}</h3>
                          {result && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {result?.perfect && <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">PERFECT</span>}
                        </div>
                        <p className="text-xs sm:text-sm text-white/50 mt-0.5 line-clamp-2">{meta.desc}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] sm:text-xs text-white/40">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {meta.xp} XP</span>
                          <span>•</span>
                          <span>{levels[lvl].length} Qs</span>
                          {result && (
                            <>
                              <span>•</span>
                              <span>Best: {result.best}/{result.total}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                ) : (
                  <div className="block bg-[#0d0f1f] border border-white/5 rounded-2xl p-4 sm:p-5 opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white/40">{meta.label}</h3>
                        <p className="text-xs sm:text-sm text-white/30 mt-0.5">Score 60% on the previous level to unlock</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-white/50 leading-relaxed">
            <span className="text-white font-semibold">Tip:</span> Each coding challenge has hidden tests. Match the reference solution to earn full points. Wrong answers cost no points, but you can retry the level any time.
          </div>
        </div>
      </div>
    </div>
  );
}
