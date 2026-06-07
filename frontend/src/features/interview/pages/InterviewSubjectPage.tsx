import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Eye, EyeOff, RefreshCw, BookOpen, FileText, Layers, HelpCircle, ChevronLeft, ChevronRight,
  Mic, Sparkles, AlertCircle, CheckCircle2, XCircle, RotateCcw, Zap, Clock, Target, Trophy,
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';
import type { GeneratedQuestion, QuestionDifficulty } from '../types';
import SEO from '@/shared/components/SEO';
import { useUser } from '@/shared/hooks/useUser';

type Tab = 'questions' | 'notes' | 'flashcards' | 'quiz';

const DIFFICULTY_COLORS: Record<QuestionDifficulty, { bg: string; text: string; label: string }> = {
  basic: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Basic' },
  intermediate: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Intermediate' },
  advanced: { bg: 'bg-rose-500/15', text: 'text-rose-400', label: 'Advanced' },
};

// Curated learning resources per subject (links to external trusted sources)
const SUBJECT_RESOURCES: Record<string, { name: string; url: string; type: 'youtube' | 'article' | 'practice' }[]> = {
  default: [
    { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/', type: 'article' },
    { name: 'LeetCode', url: 'https://leetcode.com/', type: 'practice' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/', type: 'article' },
  ],
};

function getResourcesFor(subject: string) {
  const lower = subject.toLowerCase();
  const specific: { name: string; url: string; type: 'youtube' | 'article' | 'practice' }[] = [];
  if (lower.includes('javascript') || lower.includes(' js')) {
    specific.push({ name: 'javascript.info', url: 'https://javascript.info/', type: 'article' });
  }
  if (lower.includes('react')) {
    specific.push({ name: 'React Official Docs', url: 'https://react.dev/', type: 'article' });
  }
  if (lower.includes('python')) {
    specific.push({ name: 'Real Python', url: 'https://realpython.com/', type: 'article' });
  }
  if (lower.includes('sql')) {
    specific.push({ name: 'SQLBolt', url: 'https://sqlbolt.com/', type: 'practice' });
  }
  if (lower.includes('system design')) {
    specific.push({ name: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', type: 'article' });
  }
  if (lower.includes('machine learning') || lower.includes('ml')) {
    specific.push({ name: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'article' });
  }
  return [...specific, ...SUBJECT_RESOURCES.default];
}

export default function InterviewSubjectPage() {
  return (
    <>
      <SEO
        title="Interview Subject Prep - CodeSprout"
        description="Study a specific subject with AI-generated questions, notes, flashcards, and quizzes."
        path="/interview-prep/subject"
        noindex
      />
      <InterviewSubjectContent />
    </>
  );
}

function InterviewSubjectContent() {
  const { subject = '' } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const decodedSubject = decodeURIComponent(subject);

  const [tab, setTab] = useState<Tab>('questions');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<QuestionDifficulty | 'all'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    loadAndGenerate();
  }, [decodedSubject, user]);

  const loadAndGenerate = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.getQuestions(decodedSubject);
      setQuestions(res.data.questions || []);
      if ((res.data.questions || []).length < 15) {
        setGenerating(true);
        try {
          const prefs = await interviewApi.getPreferences();
          const role = prefs.data?.role || 'software-developer';
          const gen = await interviewApi.generateQuestions(decodedSubject, role);
          setQuestions(gen.data.questions || []);
        } catch { /* fail silently — user can retry */ }
        finally { setGenerating(false); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('This will clear existing questions for this subject and regenerate. Continue?')) return;
    setGenerating(true);
    try {
      await interviewApi.clearQuestions(decodedSubject);
      const prefs = await interviewApi.getPreferences();
      const role = prefs.data?.role || 'software-developer';
      const gen = await interviewApi.generateQuestions(decodedSubject, role);
      setQuestions(gen.data.questions || []);
      setRevealed({});
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to regenerate');
    } finally {
      setGenerating(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return questions;
    return questions.filter(q => q.difficulty === filter);
  }, [questions, filter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'questions', label: 'Questions', icon: HelpCircle, count: questions.length },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, count: questions.length },
    { id: 'quiz', label: 'Quiz', icon: Zap },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/interview-prep/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-4">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{decodedSubject}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {questions.length > 0 ? `${questions.length} AI-generated questions` : 'No questions yet'}
              {generating && <span className="ml-2 text-primary-400">· generating...</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/interview-prep/call?subject=${encodeURIComponent(decodedSubject)}`)}
              disabled={questions.length === 0}
              className="px-3 py-2 bg-gradient-to-r from-primary-500 to-pink-500 hover:opacity-90 text-white text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <Mic className="w-4 h-4" /> Start AI Call
            </button>
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Regenerate
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 mb-4 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                  isActive ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === 'questions' && (
          <QuestionsTab
            questions={filtered}
            revealed={revealed}
            setRevealed={setRevealed}
            filter={filter}
            setFilter={setFilter}
            onMock={() => navigate(`/interview-prep/mock?subject=${encodeURIComponent(decodedSubject)}`)}
          />
        )}
        {tab === 'notes' && <NotesTab subject={decodedSubject} questions={questions} />}
        {tab === 'flashcards' && <FlashcardsTab questions={questions} />}
        {tab === 'quiz' && <QuizTab questions={questions} subject={decodedSubject} />}
      </div>
    </div>
  );
}

// =============== QUESTIONS TAB ===============

function QuestionsTab({
  questions, revealed, setRevealed, filter, setFilter, onMock,
}: {
  questions: GeneratedQuestion[];
  revealed: Record<string, boolean>;
  setRevealed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filter: QuestionDifficulty | 'all';
  setFilter: (f: QuestionDifficulty | 'all') => void;
  onMock: () => void;
}) {
  if (questions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No questions yet</h3>
        <p className="text-sm text-slate-400">Generating now — refresh in a moment if nothing appears.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex gap-1.5">
          {(['all', 'basic', 'intermediate', 'advanced'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f} {f !== 'all' && `(${questions.filter(q => q.difficulty === f).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRevealed(prev => {
            const all: Record<string, boolean> = { ...prev };
            questions.forEach(q => { all[q.id] = true; });
            return all;
          })}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> Reveal all
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const isOpen = !!revealed[q.id];
          const diffStyle = DIFFICULTY_COLORS[q.difficulty];
          return (
            <div key={q.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${diffStyle.bg} ${diffStyle.text}`}>
                      {diffStyle.label}
                    </span>
                    {q.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{t}</span>
                    ))}
                  </div>
                  <div className="text-sm sm:text-base text-white font-medium">{q.question}</div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200"
                      >
                        {q.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setRevealed(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 shrink-0"
                >
                  {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isOpen ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============== NOTES TAB ===============

function NotesTab({ subject, questions }: { subject: string; questions: GeneratedQuestion[] }) {
  const resources = getResourcesFor(subject);

  const quickNotes = useMemo(() => {
    if (questions.length === 0) return [];
    const grouped: Record<QuestionDifficulty, GeneratedQuestion[]> = { basic: [], intermediate: [], advanced: [] };
    for (const q of questions) grouped[q.difficulty].push(q);
    const notes: { title: string; items: string[] }[] = [];
    for (const diff of ['basic', 'intermediate', 'advanced'] as QuestionDifficulty[]) {
      const qs = grouped[diff];
      if (qs.length === 0) continue;
      notes.push({
        title: `${diff.charAt(0).toUpperCase() + diff.slice(1)} — Key Points`,
        items: qs.slice(0, 6).map(q => `• ${q.question} — ${q.answer.split(/[.!?]/)[0]}.`),
      });
    }
    return notes;
  }, [questions]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-400" /> Curated Resources for {subject}
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {resources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-2"
            >
              <span className="text-xs px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase">{r.type}</span>
              <span className="text-sm text-white">{r.name}</span>
            </a>
          ))}
        </div>
      </div>

      {quickNotes.length > 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-400" /> Quick Revision Notes
          </h3>
          <div className="space-y-4">
            {quickNotes.map((n, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-primary-400 mb-1.5">{n.title}</h4>
                <div className="space-y-1 text-sm text-slate-300">{n.items.map((it, j) => <div key={j}>{it}</div>)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Generate questions first to see revision notes.
        </div>
      )}
    </div>
  );
}

// =============== FLASHCARDS TAB ===============

function FlashcardsTab({ questions }: { questions: GeneratedQuestion[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setIdx(0); setFlipped(false); }, [questions.length]);

  if (questions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <Layers className="w-12 h-12 text-primary-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No flashcards yet</h3>
        <p className="text-sm text-slate-400">Generate questions first.</p>
      </div>
    );
  }

  const q = questions[idx];
  if (!q) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No flashcard to show</h3>
        <button onClick={() => setIdx(0)} className="text-sm text-primary-400 hover:text-primary-300 mt-2">Reset to first</button>
      </div>
    );
  }
  const diffStyle = DIFFICULTY_COLORS[q.difficulty];
  const go = (delta: number) => {
    setFlipped(false);
    setIdx((idx + delta + questions.length) % questions.length);
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-slate-400">
        Card {idx + 1} of {questions.length}
      </div>
      <div
        onClick={() => setFlipped(f => !f)}
        className="relative h-72 sm:h-80 cursor-pointer perspective"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 preserve-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${diffStyle.bg} ${diffStyle.text} mb-3`}>
              {diffStyle.label} · Question
            </span>
            <div className="text-base sm:text-lg font-semibold text-white">{q.question}</div>
            <div className="absolute bottom-3 right-4 text-xs text-slate-500">Tap to flip</div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary-900/40 to-pink-900/40 border-2 border-primary-500/50"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/20 text-white mb-3`}>Answer</span>
            <div className="text-sm sm:text-base text-white leading-relaxed">{q.answer}</div>
            <div className="absolute bottom-3 right-4 text-xs text-slate-400">Tap to flip back</div>
          </div>
        </motion.div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => go(-1)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button onClick={() => setFlipped(f => !f)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1">
          <RotateCcw className="w-4 h-4" /> Flip
        </button>
        <button onClick={() => go(1)} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-lg flex items-center gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// =============== QUIZ TAB ===============

function QuizTab({ questions, subject }: { questions: GeneratedQuestion[]; subject: string }) {
  const [size, setSize] = useState<10 | 20 | 50>(10);
  const [started, setStarted] = useState(false);
  const [picks, setPicks] = useState<GeneratedQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ q: GeneratedQuestion; selfScore: 'knew' | 'partial' | 'missed'; userAnswer: string }[]>([]);

  const start = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(size, questions.length));
    setPicks(shuffled);
    setIdx(0);
    setAnswer('');
    setRevealed(false);
    setResults([]);
    setStarted(true);
  };

  const next = (selfScore: 'knew' | 'partial' | 'missed') => {
    setResults(r => [...r, { q: picks[idx], selfScore, userAnswer: answer }]);
    if (idx + 1 >= picks.length) {
      setStarted(false);
    } else {
      setIdx(idx + 1);
      setAnswer('');
      setRevealed(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <Zap className="w-12 h-12 text-primary-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No questions for quiz</h3>
        <p className="text-sm text-slate-400">Generate questions first.</p>
      </div>
    );
  }

  if (!started && results.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-2">Quick Quiz — {subject}</h3>
        <p className="text-sm text-slate-400 mb-5">Pick a quiz size, then try to answer each question. Self-evaluate to track progress.</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {([10, 20, 50] as const).map(n => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`py-3 rounded-lg font-semibold transition ${
                size === n ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {n} Qs
            </button>
          ))}
        </div>
        <button
          onClick={start}
          disabled={questions.length === 0}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-pink-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" /> Start Quiz
        </button>
      </div>
    );
  }

  if (!started && results.length > 0) {
    const knew = results.filter(r => r.selfScore === 'knew').length;
    const partial = results.filter(r => r.selfScore === 'partial').length;
    const missed = results.filter(r => r.selfScore === 'missed').length;
    const score = Math.round((knew * 1 + partial * 0.5) / results.length * 100);

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary-500/20 to-pink-500/20 border border-primary-500/30 rounded-2xl p-6 text-center">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <div className="text-3xl font-extrabold text-white">{score}%</div>
          <div className="text-sm text-slate-300 mt-1">{results.length} questions completed</div>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {knew} knew</div>
            <div className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-400" /> {partial} partial</div>
            <div className="flex items-center gap-1.5"><XCircle className="w-4 h-4 text-rose-400" /> {missed} missed</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={start} className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1.5">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={() => setResults([])} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">Back to Menu</button>
        </div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  r.selfScore === 'knew' ? 'bg-emerald-500/20 text-emerald-400' :
                  r.selfScore === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {r.selfScore === 'knew' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                   r.selfScore === 'partial' ? <AlertCircle className="w-3.5 h-3.5" /> :
                   <XCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{r.q.question}</div>
                  <div className="text-xs text-slate-400 mt-1">{r.q.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = picks[idx];
  if (!q) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No question to show</h3>
        <button onClick={() => setResults([])} className="text-sm text-primary-400 hover:text-primary-300 mt-2">Back to menu</button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Question {idx + 1} of {picks.length}</span>
        <div className="flex-1 mx-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-pink-500 transition-all" style={{ width: `${((idx) / picks.length) * 100}%` }} />
        </div>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="text-base sm:text-lg text-white mb-4">{q.question}</div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={5}
          className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
        />
        {revealed && (
          <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200">
            <div className="text-xs text-primary-400 font-semibold mb-1">Expected answer</div>
            {q.answer}
          </div>
        )}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            disabled={!answer.trim()}
            className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Reveal Answer
          </button>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button onClick={() => next('missed')} className="py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg flex items-center justify-center gap-1.5">
              <XCircle className="w-4 h-4" /> Missed
            </button>
            <button onClick={() => next('partial')} className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Partial
            </button>
            <button onClick={() => next('knew')} className="py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Knew it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
