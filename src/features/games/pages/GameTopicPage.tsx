import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Gamepad2, Lock, Crown, Zap, Brain, Star,
  Trophy, Code2, Rocket,
} from 'lucide-react';
import { useGameProgress } from '../hooks/useGameProgress';
import { LEVEL_TEMPLATES, type Difficulty } from '../data/gamesData';

const difficultyMeta: Record<Difficulty, { color: string; ring: string; gradient: string; icon: any; label: string; }> = {
  easy:   { color: 'text-emerald-300', ring: 'ring-emerald-400/50',   gradient: 'from-emerald-400 to-teal-500',    icon: Brain, label: 'Easy'   },
  medium: { color: 'text-amber-300',   ring: 'ring-amber-400/50',     gradient: 'from-amber-400 to-orange-500',   icon: Zap,   label: 'Medium' },
  hard:   { color: 'text-rose-300',    ring: 'ring-rose-400/50',      gradient: 'from-rose-400 to-pink-500',      icon: Crown, label: 'Hard'   },
};
function Stars({ count, size = 'sm' }: { count: number; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3 h-3 sm:w-3.5 sm:h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`${dim} ${i < count ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`}
        />
      ))}
    </div>
  );
}

// SVG candy-cane path: stripes between level nodes
function LollipopDecor({ emoji, style, size = 64 }: { emoji: string; style: React.CSSProperties; size?: number }) {
  return (
    <div className="absolute pointer-events-none select-none opacity-60" style={style}>
      <div
        className="rounded-full bg-gradient-to-br from-pink-300/30 to-rose-400/30 flex items-center justify-center border-2 border-pink-300/20 shadow-lg backdrop-blur-sm"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {emoji}
      </div>
    </div>
  );
}

export default function GameTopicPage() {
  const { topic: topicParam } = useParams<{ topic: string }>();
  const topic = topicParam ? decodeURIComponent(topicParam) : '';
  const { getLevel, isLevelUnlocked, progress } = useGameProgress();

  const levelResults = LEVEL_TEMPLATES.map((l) => getLevel(topic, l.id));
  const completedCount = levelResults.filter((r) => r && r.stars >= 1).length;
  const allDone = completedCount === 7;
  const totalStars = levelResults.reduce((s, r) => s + (r?.stars || 0), 0);
  const maxStars = 21;
  const progressPct = (totalStars / maxStars) * 100;

  const completed = levelResults.map((r) => !!(r && r.stars >= 1));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Candy decorations */}
      <LollipopDecor emoji="🍭" style={{ top: '12%', left: '4%' }} size={72} />
      <LollipopDecor emoji="🍬" style={{ top: '35%', right: '5%' }} size={64} />
      <LollipopDecor emoji="🍫" style={{ bottom: '15%', left: '6%' }} size={56} />
      <LollipopDecor emoji="🍩" style={{ bottom: '30%', right: '3%' }} size={68} />
      <LollipopDecor emoji="🍭" style={{ top: '60%', left: '3%' }} size={48} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16">
        {/* Top bar: back link + stats */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <Link to="/games" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> All Topics
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold">
              <Zap className="w-3 h-3" /> {progress.streak.count}d
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Trophy className="w-3 h-3" /> {progress.totalXp}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckIcon /> {completedCount}/7
            </span>
          </div>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
              <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight truncate">{topic}</h1>
              <p className="text-white/50 text-xs sm:text-sm mt-0.5">Clear levels, earn XP & badges</p>
            </div>
            {allDone && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Crown className="w-3.5 h-3.5" /> Mastered
              </div>
            )}
          </div>
        </motion.div>

        {/* Levels candy path */}
        <div className="bg-[#0d0f1f] border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-5 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 relative z-10">
            <h2 className="text-sm sm:text-base font-semibold text-white">Levels</h2>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-amber-300 font-semibold">{totalStars}</span>
              <span>/ {maxStars}</span>
            </div>
          </div>

          {(() => {
            // Container height in px — single source of truth for path AND circles
            const H = 340;
            // Circle vertical centers (px from top of container)
            const centers = [70, 200, 110, 230, 80, 210, 130];
            const nodeSize = 64; // w-16
            const innerW = 600; // SVG viewBox width
            const innerH = 340; // SVG viewBox height (matches H)
            const xPositions = LEVEL_TEMPLATES.map((_, i) => (i + 0.5) * (innerW / LEVEL_TEMPLATES.length));

            const segs = LEVEL_TEMPLATES.slice(0, -1).map((_, i) => ({
              x1: xPositions[i], y1: centers[i],
              x2: xPositions[i + 1], y2: centers[i + 1],
            }));

            return (
              <div className="relative w-full" style={{ height: H }}>
                {/* Background candy path SVG — same coord system as the circles below */}
                <svg
                  viewBox={`0 0 ${innerW} ${innerH}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <defs>
                    <linearGradient id="candy" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="candyDim" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#475569" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#64748b" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#475569" stopOpacity="0.45" />
                    </linearGradient>
                  </defs>
                  {segs.map((s, i) => {
                    const midX = (s.x1 + s.x2) / 2;
                    const cp1Y = s.y1 + (s.y2 - s.y1) * 0.3;
                    const cp2Y = s.y2 - (s.y2 - s.y1) * 0.3;
                    const d = `M ${s.x1} ${s.y1} C ${midX} ${cp1Y}, ${midX} ${cp2Y}, ${s.x2} ${s.y2}`;
                    const isActive = completed[i] && completed[i + 1];
                    return (
                      <g key={i}>
                        <path d={d} stroke="url(#candyDim)" strokeWidth="8" fill="none" strokeLinecap="round" />
                        {isActive && (
                          <>
                            <path d={d} stroke="url(#candy)" strokeWidth="8" fill="none" strokeLinecap="round" />
                            <path
                              d={d}
                              stroke="white"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray="8 10"
                              opacity="0.7"
                            />
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Level nodes — absolutely positioned, centered on the path */}
                {LEVEL_TEMPLATES.map((lvl, i) => {
                  const meta = difficultyMeta[lvl.difficulty];
                  const result = levelResults[i];
                  const unlocked = isLevelUnlocked(topic, lvl.id);
                  const isCompleted = result && result.stars >= 1;
                  const leftPct = (xPositions[i] / innerW) * 100;
                  return (
                    <div
                      key={lvl.id}
                      className="absolute"
                      style={{
                        left: `calc(${leftPct}% - ${nodeSize / 2}px)`,
                        top: centers[i] - nodeSize / 2,
                        width: nodeSize,
                      }}
                    >
                      {unlocked ? (
                        <Link to={`/games/${encodeURIComponent(topic)}/${lvl.id}`} className="block group">
                          <Stars count={result?.stars || 0} />
                          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-xl transition-all ${
                            isCompleted
                              ? `bg-gradient-to-br ${meta.gradient} ring-2 ${meta.ring} group-hover:scale-110 group-hover:shadow-2xl`
                              : `bg-gradient-to-br ${meta.gradient} ring-2 ${meta.ring} group-hover:scale-110 group-hover:brightness-110`
                          }`}>
                            <span className="drop-shadow-md">{lvl.id}</span>
                            {isCompleted && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0d0f1f] flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-1.5 px-1">
                            <div className={`text-[9px] sm:text-[10px] font-semibold ${meta.color}`}>{meta.label}</div>
                            <div className="text-[10px] sm:text-xs font-bold text-white leading-tight whitespace-nowrap">{lvl.name}</div>
                            <div className="text-[8px] sm:text-[9px] text-white/40 leading-tight whitespace-nowrap">{lvl.desc}</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="block cursor-not-allowed">
                          <div className="flex justify-center h-3.5 mb-0.5">
                            <Stars count={0} />
                          </div>
                          <div className="relative w-16 h-16 rounded-full bg-white/[0.04] border-2 border-white/10 flex items-center justify-center text-white/30 text-lg font-bold">
                            {lvl.id}
                            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40">
                              <Lock className="w-5 h-5 text-white/40" />
                            </div>
                          </div>
                          <div className="text-center mt-1.5 px-1">
                            <div className="text-[9px] sm:text-[10px] font-semibold text-white/30">{meta.label}</div>
                            <div className="text-[10px] sm:text-xs font-bold text-white/30 leading-tight whitespace-nowrap">{lvl.name}</div>
                            <div className="text-[8px] sm:text-[9px] text-white/20 leading-tight whitespace-nowrap">{lvl.desc}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Progress + Next Reward */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="sm:col-span-2 bg-[#0d0f1f] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-white">Your Progress</div>
                <div className="text-[10px] sm:text-xs text-white/40 mt-0.5">{completedCount} of 7 levels completed</div>
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-400">{Math.round(progressPct)}%</div>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              />
            </div>
          </div>
          <div className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-white/40">Next Reward</div>
              <div className="text-xs sm:text-sm font-bold text-white truncate">
                +{LEVEL_TEMPLATES[completedCount]?.id ? 30 + LEVEL_TEMPLATES[completedCount].id * 10 : 0} XP
              </div>
              <div className="text-[10px] sm:text-xs text-white/40 truncate">Complete Level {Math.min(completedCount + 1, 7)}</div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-3">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Gamepad2, color: 'from-violet-500 to-purple-500', title: 'Pick a Level', desc: 'Choose a level to start your coding adventure' },
              { icon: Code2, color: 'from-cyan-500 to-blue-500', title: 'Solve Challenges', desc: 'Solve bite-sized coding problems' },
              { icon: Trophy, color: 'from-amber-500 to-orange-500', title: 'Earn Rewards', desc: 'Earn XP, stickers and unlock new levels' },
            ].map((s) => (
              <div key={s.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white">{s.title}</div>
                <div className="text-[10px] sm:text-xs text-white/40 leading-relaxed mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
    </svg>
  );
}
