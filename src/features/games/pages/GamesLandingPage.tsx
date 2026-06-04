import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2, Trophy, Sparkles, Flame, Target, Zap, Lock, Star,
  ChevronRight, Crown, Rocket, Award, RotateCcw,
} from 'lucide-react';
import { useGameProgress } from '../hooks/useGameProgress';
import { BADGE_LIBRARY, STICKER_LIBRARY, buildGenericLevels } from '../data/gamesData';

interface Topic { id: string; name: string; }

const topicGradients = [
  'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500', 'from-violet-500 to-purple-500', 'from-indigo-500 to-blue-500',
  'from-sky-500 to-cyan-500', 'from-lime-500 to-green-500', 'from-fuchsia-500 to-pink-500',
  'from-teal-500 to-emerald-500', 'from-yellow-500 to-amber-500', 'from-red-500 to-rose-500',
];

function TopicCard({ topic, index, completed, totalLevels, onClick }: {
  topic: Topic; index: number; completed: number; totalLevels: number; onClick: () => void;
}) {
  const color = topicGradients[index % topicGradients.length];
  const isComplete = completed === totalLevels;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4) }}
      onClick={onClick}
      className="group relative bg-[#0d0f1f] border border-white/10 rounded-2xl p-4 sm:p-5 text-left hover:border-white/20 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`} />
      <div className="relative flex items-center gap-3">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
          <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-purple-300 transition">{topic.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < completed ? `bg-gradient-to-br ${color}` : 'bg-white/10'}`} />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-white/40">{completed}/{totalLevels}</span>
          </div>
        </div>
        {isComplete ? (
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

function StickerShelf({ earned }: { earned: string[] }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 sm:gap-3">
      {STICKER_LIBRARY.map((s) => {
        const got = earned.includes(s.id);
        return (
          <div key={s.id} className={`relative aspect-square rounded-xl flex items-center justify-center text-2xl sm:text-3xl border transition-all ${got ? `bg-gradient-to-br ${s.color} border-white/20 shadow-lg` : 'bg-white/[0.02] border-white/5 grayscale opacity-30'}`}>
            {got ? s.emoji : <Lock className="w-3.5 h-3.5 text-white/20" />}
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] text-white/40 whitespace-nowrap">{got ? s.name : 'Locked'}</span>
          </div>
        );
      })}
    </div>
  );
}

function BadgeShelf({ earned }: { earned: string[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {BADGE_LIBRARY.map((b) => {
        const got = earned.includes(b.id);
        return (
          <div key={b.id} className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${got ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
            <div className="text-3xl sm:text-4xl mb-1">{b.emoji}</div>
            <div className="text-xs sm:text-sm font-semibold text-white">{b.name}</div>
            <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{b.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function GamesLandingPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'topics' | 'stickers' | 'badges'>('topics');
  const { progress, isLevelUnlocked, reset } = useGameProgress();

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : [];
        setTopics(arr.map((t: any) => ({ id: String(t.id ?? t.name), name: t.name })));
      })
      .catch(() => setTopics([]));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return topics;
    const q = search.toLowerCase();
    return topics.filter((t) => t.name.toLowerCase().includes(q));
  }, [topics, search]);

  const stats = useMemo(() => {
    let completedTopics = 0;
    let totalLevels = 0;
    let completedLevels = 0;
    for (const t of topics) {
      const p = progress.topics[t.name];
      if (!p) continue;
      const done = [p.easy, p.medium, p.hard].filter(Boolean).length;
      if (done === 3) completedTopics++;
      totalLevels += 3;
      completedLevels += done;
    }
    return { completedTopics, totalLevels, completedLevels };
  }, [topics, progress]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs sm:text-sm font-medium">
            <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Fun way to master DSA
          </span>
          <h1 className="mt-4 sm:mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-white">Games </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Test</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/50 max-w-2xl mx-auto">
            Pick a topic, clear 3 levels, earn stickers & badges. Each level mixes quick quizzes with bite-sized coding challenges.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Flame, label: 'Streak', value: `${progress.streak.count}d`, color: 'from-orange-500 to-red-500' },
            { icon: Zap, label: 'XP', value: progress.totalXp, color: 'from-yellow-500 to-amber-500' },
            { icon: Trophy, label: 'Topics', value: `${stats.completedTopics}/${topics.length}`, color: 'from-purple-500 to-violet-500' },
            { icon: Target, label: 'Levels', value: `${stats.completedLevels}/${stats.totalLevels}`, color: 'from-emerald-500 to-teal-500' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-bold text-white truncate">{s.value}</div>
                  <div className="text-[10px] sm:text-xs text-white/40">{s.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mb-5 bg-[#0d0f1f] border border-white/10 rounded-2xl p-1.5 w-full sm:w-fit overflow-x-auto">
          {[
            { key: 'topics', label: 'Topics', icon: Gamepad2 },
            { key: 'stickers', label: `Stickers (${progress.stickers.length}/${STICKER_LIBRARY.length})`, icon: Star },
            { key: 'badges', label: `Badges (${progress.badges.length}/${BADGE_LIBRARY.length})`, icon: Award },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                activeTab === t.key ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'topics' && (
          <>
            {/* Search */}
            <div className="mb-5">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics…"
                  className="w-full bg-[#0d0f1f] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Topic grid */}
            {topics.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-5 animate-pulse h-20" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filtered.map((t, i) => {
                  const p = progress.topics[t.name];
                  const done = [p?.easy, p?.medium, p?.hard].filter(Boolean).length;
                  return (
                    <TopicCard
                      key={t.id}
                      topic={t}
                      index={i}
                      completed={done}
                      totalLevels={3}
                      onClick={() => { window.location.href = `/games/${encodeURIComponent(t.name)}`; }}
                    />
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => { if (confirm('Reset all game progress?')) reset(); }}
                className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset progress
              </button>
            </div>
          </>
        )}

        {activeTab === 'stickers' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Sticker Collection</h2>
              <span className="text-xs text-white/40 ml-auto">{progress.stickers.length} / {STICKER_LIBRARY.length}</span>
            </div>
            <StickerShelf earned={progress.stickers} />
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Badge Collection</h2>
              <span className="text-xs text-white/40 ml-auto">{progress.badges.length} / {BADGE_LIBRARY.length}</span>
            </div>
            <BadgeShelf earned={progress.badges} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
