import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, Sparkles, Trophy, Star, Zap,
  Flame, Clock, ChevronRight, ChevronLeft, Code2, Brain, Crown,
  Lightbulb, RotateCcw, PartyPopper, ArrowRight, Lock,
} from 'lucide-react';
import { useGameProgress } from '../hooks/useGameProgress';
import { GAMES_BY_TOPIC, STICKER_LIBRARY, BADGE_LIBRARY, buildGenericLevels, type Difficulty, type GameQuestion, type QuizQuestion, type CodeChallenge } from '../data/gamesData';

interface AnswerRecord { questionId: string; correct: boolean; points: number; }

function pickStickerForLevel(level: Difficulty, score: number, total: number): string {
  const pct = score / total;
  if (pct === 1) return 'trophy';
  if (pct >= 0.8) return 'crown';
  if (level === 'easy') return 'star';
  if (level === 'medium') return 'gem';
  return 'lightning';
}

function checkNewBadges(prev: string[], earned: string[], topicsDone: number, streak: number, perfectLevels: number): string[] {
  const newOnes: string[] = [];
  if (topicsDone >= 1 && !earned.includes('rookie') && !prev.includes('rookie')) newOnes.push('rookie');
  if (topicsDone >= 5 && !earned.includes('sprout') && !prev.includes('sprout')) newOnes.push('sprout');
  if (topicsDone >= 10 && !earned.includes('master') && !prev.includes('master')) newOnes.push('master');
  if (topicsDone >= 25 && !earned.includes('pro') && !prev.includes('pro')) newOnes.push('pro');
  if (streak >= 3 && !earned.includes('streak3') && !prev.includes('streak3')) newOnes.push('streak3');
  if (streak >= 7 && !earned.includes('streak7') && !prev.includes('streak7')) newOnes.push('streak7');
  if (perfectLevels >= 1 && !earned.includes('perfect') && !prev.includes('perfect')) newOnes.push('perfect');
  return newOnes;
}

export default function GamePlayPage() {
  const { topic: topicParam, level } = useParams<{ topic: string; level: string }>();
  const navigate = useNavigate();
  const topic = topicParam ? decodeURIComponent(topicParam) : '';
  const diff: Difficulty = (level === 'medium' || level === 'hard') ? level : 'easy';

  const { progress, saveLevel, isLevelUnlocked } = useGameProgress();
  const unlocked = isLevelUnlocked(topic, diff);

  const levels = useMemo(() => GAMES_BY_TOPIC[topic] || buildGenericLevels(topic), [topic]);
  const questions = levels[diff];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<'playing' | 'result' | 'locked'>(unlocked ? 'playing' : 'locked');
  const [selected, setSelected] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!unlocked) setPhase('locked');
    else if (phase === 'locked') setPhase('playing');
  }, [unlocked, phase]);

  useEffect(() => {
    if (questions[idx]) {
      const q = questions[idx];
      setSelected(null);
      setCodeFeedback(null);
      setShowHint(false);
      if (q.type === 'code') setCode(q.starter);
    }
  }, [idx, questions]);

  const q = questions[idx];
  const score = answers.filter((a) => a.correct).length;
  const total = questions.length;

  if (!topic || !q) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Topic not found</h1>
          <Link to="/games" className="text-purple-400 hover:text-purple-300">← Back to Games</Link>
        </div>
      </div>
    );
  }

  if (phase === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Level Locked</h1>
          <p className="text-white/60 mb-6">Score at least 60% on the previous level to unlock this one.</p>
          <Link to={`/games/${encodeURIComponent(topic)}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition">
            <ArrowLeft className="w-4 h-4" /> Back to topic
          </Link>
        </motion.div>
      </div>
    );
  }

  const submitQuiz = () => {
    if (selected === null) return;
    const qq = q as QuizQuestion;
    const correct = selected === qq.answer;
    setAnswers((a) => [...a, { questionId: qq.id, correct, points: correct ? 10 : 0 }]);
    setTimeout(() => {
      if (idx + 1 < questions.length) setIdx(idx + 1);
      else finishLevel();
    }, 600);
  };

  const submitCode = () => {
    const cc = q as CodeChallenge;
    const userCode = code.replace(/\s+/g, '');
    const answerCode = cc.answer.replace(/\s+/g, '');
    const ok = userCode.includes(answerCode.slice(0, Math.min(answerCode.length, 20))) || userCode === answerCode;
    setCodeFeedback({
      ok,
      msg: ok ? 'Code matches the reference solution.' : 'Not quite — review and try again.',
    });
    setAnswers((a) => [...a, { questionId: cc.id, correct: ok, points: ok ? 20 : 0 }]);
    setTimeout(() => {
      if (idx + 1 < questions.length) setIdx(idx + 1);
      else finishLevel();
    }, 1200);
  };

  const finishLevel = () => {
    const finalScore = answers.filter((a) => a.correct).length;
    setPhase('result');
    const sticker = pickStickerForLevel(diff, finalScore, total);
    const stickerArr = finalScore / total >= 0.5 ? [sticker] : [];

    const prevTopicsDone = Object.values(progress.topics).filter((t) => {
      const done = [t.easy, t.medium, t.hard].filter(Boolean).length;
      return done === 3;
    }).length;
    const willBeDone = finalScore / total >= 0.6;
    const isLastLevel = diff === 'hard';
    const currentTopicDone = willBeDone && (diff === 'easy' || (diff === 'medium' && !!progress.topics[topic]?.easy) || (diff === 'hard' && !!progress.topics[topic]?.medium && !!progress.topics[topic]?.easy));
    const newCompletedTopics = currentTopicDone && isLastLevel ? prevTopicsDone + 1 : prevTopicsDone;
    const newPerfect = finalScore === total ? (progress.perfectLevels || 0) + 1 : progress.perfectLevels;
    const newBadges = checkNewBadges(progress.badges, [], newCompletedTopics, 0, newPerfect);

    saveLevel(topic, diff, finalScore, total, stickerArr, newBadges);
  };

  const restart = () => {
    setIdx(0);
    setAnswers([]);
    setPhase('playing');
    setSelected(null);
    setCodeFeedback(null);
    setShowHint(false);
    startTimeRef.current = Date.now();
    setElapsed(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = ((idx + (phase === 'result' ? 1 : 0)) / total) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <Link to={`/games/${encodeURIComponent(topic)}`} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> {topic}
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              <Clock className="w-3.5 h-3.5" /> {formatTime(elapsed)}
            </span>
            <span className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border font-medium ${
              diff === 'easy' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              diff === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {diff === 'easy' ? <Brain className="w-3.5 h-3.5" /> : diff === 'medium' ? <Zap className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
              {diff.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
            <span>Question {Math.min(idx + 1, total)} of {total}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'playing' && (
            <motion.div
              key={`q-${idx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {q.type === 'quiz' ? (
                <div className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-5 sm:p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Quick Quiz</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-5 leading-relaxed">{(q as QuizQuestion).q}</h2>
                  <div className="space-y-2.5">
                    {(q as QuizQuestion).options.map((opt, i) => {
                      const isSel = selected === i;
                      const isCorrect = i === (q as QuizQuestion).answer;
                      const revealed = selected !== null;
                      return (
                        <button
                          key={i}
                          onClick={() => !revealed && setSelected(i)}
                          disabled={revealed}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                            revealed && isCorrect ? 'bg-emerald-500/15 border-emerald-500/40 text-white' :
                            revealed && isSel && !isCorrect ? 'bg-rose-500/15 border-rose-500/40 text-white' :
                            isSel ? 'bg-purple-500/15 border-purple-500/40 text-white' :
                            'bg-white/[0.02] border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            revealed && isCorrect ? 'bg-emerald-500/30 text-emerald-200' :
                            revealed && isSel && !isCorrect ? 'bg-rose-500/30 text-rose-200' :
                            isSel ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-white/40'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-sm sm:text-base">{opt}</span>
                          {revealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                          {revealed && isSel && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== null && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{(q as QuizQuestion).explanation}</p>
                      </div>
                    </motion.div>
                  )}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={submitQuiz}
                      disabled={selected === null}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {idx + 1 < total ? 'Next Question' : 'Finish'} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-5 sm:p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Code Challenge</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 leading-relaxed">{(q as CodeChallenge).q}</h2>
                  <button
                    onClick={() => setShowHint((s) => !s)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition mb-4"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide hint' : 'Show hint'}
                  </button>
                  {showHint && <p className="text-xs sm:text-sm text-amber-300/80 mb-4 italic">💡 {(q as CodeChallenge).hint}</p>}

                  <div className="bg-[#0a0d1a] border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                      <span className="ml-2 text-[10px] text-white/30 font-mono">JavaScript</span>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={10}
                      className="w-full bg-transparent p-4 text-sm font-mono text-emerald-300 focus:outline-none resize-none"
                      spellCheck={false}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-white/40 mb-2">Test cases:</div>
                    <div className="space-y-1.5">
                      {(q as CodeChallenge).tests.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-mono bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                          <span className="text-white/30">→</span>
                          <span className="text-white/60">{t.input}</span>
                          <span className="text-white/30 ml-auto">expected:</span>
                          <span className="text-emerald-400">{t.expected}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {codeFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
                        codeFeedback.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {codeFeedback.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {codeFeedback.msg}
                    </motion.div>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={submitCode}
                      disabled={code.trim().length < 5}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      Submit Code <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0d0f1f] border border-white/10 rounded-2xl p-6 sm:p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl sm:text-5xl"
                style={{
                  background: score === total
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                    : score / total >= 0.5
                    ? 'linear-gradient(135deg, #a78bfa, #ec4899)'
                    : 'linear-gradient(135deg, #475569, #334155)',
                }}
              >
                {score === total ? <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" /> : score / total >= 0.5 ? <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-white" /> : <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12 text-white" />}
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {score === total ? 'Perfect!' : score / total >= 0.5 ? 'Nice work!' : 'Keep practicing!'}
              </h1>
              <p className="text-white/50 mb-6 text-sm sm:text-base">
                You scored <span className="font-bold text-white">{score}</span> out of {total}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/40">Score</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{Math.round((score / total) * 100)}%</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/40">XP</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-400">+{score * 10 + (score === total ? 50 : 0)}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/40">Time</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{formatTime(elapsed)}</div>
                </div>
              </div>

              {score / total >= 0.5 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Sticker earned!</span>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={restart}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition text-sm sm:text-base"
                >
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
                {diff === 'easy' && (
                  <Link
                    to={`/games/${encodeURIComponent(topic)}/medium`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
                  >
                    Next Level <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {diff === 'medium' && (
                  <Link
                    to={`/games/${encodeURIComponent(topic)}/hard`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
                  >
                    Hard Level <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {diff === 'hard' && (
                  <Link
                    to="/games"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
                  >
                    More Topics <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
