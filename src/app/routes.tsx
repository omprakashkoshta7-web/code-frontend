import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import TopicsPage from '@/features/topics/pages/TopicsPage';
import TopicDetailPage from '@/features/topics/pages/TopicDetailPage';
import QuestionsPage from '@/features/questions/pages/QuestionsPage';
import QuestionDetailPage from '@/features/questions/pages/QuestionDetailPage';
import DifficultyPage from '@/features/difficulty/pages/DifficultyPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import PatternsPage from '@/features/patterns/pages/PatternsPage';
import PatternDetailPage from '@/features/patterns/pages/PatternDetailPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import BookmarksPage from '@/features/bookmarks/pages/BookmarksPage';
import PricingPage from '@/features/subscription/pages/PricingPage';
import PaymentPage from '@/features/payment/pages/PaymentPage';
import InterviewPrepPage from '@/features/interview/pages/InterviewPrepPage';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderboardPage';
import CommunitiesPage from '@/features/community/pages/CommunitiesPage';
import CommunityDetailPage from '@/features/community/pages/CommunityDetailPage';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import ManageQuestions from '@/features/admin/pages/ManageQuestions';
import AddQuestionPage from '@/features/admin/pages/AddQuestionPage';
import ManageUsers from '@/features/admin/pages/ManageUsers';
import HeroSection from '@/shared/components/HeroSection';
import FAQ from '@/shared/components/FAQ';
import GamesLandingPage from '@/features/games/pages/GamesLandingPage';
import GameTopicPage from '@/features/games/pages/GameTopicPage';
import GamePlayPage from '@/features/games/pages/GamePlayPage';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { TOPICS } from '@/shared/utils/constants';
import {
  ArrowRight, Database, Braces, Hash, Link2, Layers, MoveVertical, Trello,
  GitBranch, TreePine, Network, Target, Puzzle, RefreshCw, Maximize2, Search,
  ZapIcon, Sparkles, Code2, Eye, TrendingUp, Lightbulb, BookOpen, BarChart3,
  Play, CheckCircle, ChevronRight, ChevronLeft, FileText, Monitor, Shield, Gamepad2
} from 'lucide-react';

const topicIcons: Record<string, React.ReactNode> = {
  arrays: <Database className="w-5 h-5" />,
  strings: <Braces className="w-5 h-5" />,
  hashing: <Hash className="w-5 h-5" />,
  'linked list': <Link2 className="w-5 h-5" />,
  stack: <Layers className="w-5 h-5" />,
  queue: <MoveVertical className="w-5 h-5" />,
  heap: <Trello className="w-5 h-5" />,
  trees: <GitBranch className="w-5 h-5" />,
  bst: <TreePine className="w-5 h-5" />,
  graphs: <Network className="w-5 h-5" />,
  greedy: <Target className="w-5 h-5" />,
  dp: <Puzzle className="w-5 h-5" />,
  backtracking: <RefreshCw className="w-5 h-5" />,
  'sliding window': <Maximize2 className="w-5 h-5" />,
  'binary search': <Search className="w-5 h-5" />,
};

const topicProgress: Record<string, { total: number; done: number }> = {
  Arrays: { total: 25, done: 18 },
  Strings: { total: 15, done: 10 },
  Hashing: { total: 20, done: 12 },
  'Linked List': { total: 18, done: 8 },
  Stack: { total: 12, done: 5 },
  Queue: { total: 10, done: 3 },
  Heap: { total: 14, done: 6 },
  Trees: { total: 22, done: 15 },
  BST: { total: 16, done: 9 },
  Graphs: { total: 20, done: 4 },
};

const patterns = [
  { name: 'HashMap', signals: ['Need fast lookup', 'Pair matching', 'Frequency counting'], time: 'O(n)', color: 'from-blue-500 to-cyan-500' },
  { name: 'Sliding Window', signals: ['Contiguous subarray', 'Max/min length', 'Fixed/variable window'], time: 'O(n)', color: 'from-emerald-500 to-teal-500' },
  { name: 'Two Pointers', signals: ['Sorted array', 'Opposite ends', 'Pair sum'], time: 'O(n)', color: 'from-purple-500 to-pink-500' },
  { name: 'Binary Search', signals: ['Sorted input', 'Find target', 'Search space'], time: 'O(log n)', color: 'from-amber-500 to-orange-500' },
];

const steps = [
  { icon: Lightbulb, title: 'Learn Pattern', desc: 'Identify the underlying pattern behind DSA problems', color: 'from-amber-500 to-orange-500' },
  { icon: Eye, title: 'Visualize Solution', desc: 'Watch step-by-step execution with variable tracking', color: 'from-primary-500 to-indigo-500' },
  { icon: Code2, title: 'Practice Code', desc: 'Write code in our built-in editor with test cases', color: 'from-emerald-500 to-teal-500' },
  { icon: BarChart3, title: 'Track Progress', desc: 'Analyze complexity, compare solutions, and grow', color: 'from-rose-500 to-pink-500' },
];

const companies = ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Uber', 'Meta', 'Apple', 'Netflix'];

function FadeInSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const reviewsData = [
  { name: 'Priya Sharma', role: 'SDE', company: 'Google', color: 'text-blue-400', avatar: 'PS', rating: 5, text: 'The patterns section is a game changer! Helped me solve problems I used to struggle with. Got placed at Google thanks to CodeSprout!' },
  { name: 'Rahul Verma', role: 'SDE', company: 'Amazon', color: 'text-amber-400', avatar: 'RV', rating: 5, text: 'CodeSprout helped me master DSA in just 8 weeks. The cheat sheets are incredibly concise and the visualizer made complex algorithms click for me.' },
  { name: 'Ananya Patel', role: 'SDE', company: 'Microsoft', color: 'text-blue-400', avatar: 'AP', rating: 5, text: 'Best DSA resource I have ever used. The progress tracking kept me motivated, and the interview prep section was exactly what I needed for my Microsoft interviews.' },
  { name: 'Vikram Singh', role: 'SDE', company: 'Amazon', color: 'text-amber-400', avatar: 'VS', rating: 5, text: 'The structured roadmap and interview questions were exactly what I needed for my Amazon interview.' },
  { name: 'Neha Gupta', role: 'SDE', company: 'Adobe', color: 'text-red-400', avatar: 'NG', rating: 5, text: 'I especially loved the community feature. Discussing approaches with other students and sharing notes made my preparation journey much more effective.' },
  { name: 'Arjun Mehta', role: 'SDE', company: 'Meta', color: 'text-blue-400', avatar: 'AM', rating: 5, text: 'Cracked Meta after 3 months of consistent practice. The pattern cheat sheets and timed practice were exactly what I needed. Highly recommend!' },
];

const companyColors: Record<string, string> = {
  Google: '#4285F4',
  Amazon: '#FF9900',
  Microsoft: '#00A4EF',
  Uber: '#000000',
  Adobe: '#FF0000',
  Meta: '#0668E1',
};

function ReviewCard({ review, isCenter }: { review: typeof reviewsData[0]; isCenter?: boolean }) {
  return (
    <div className={`relative rounded-2xl p-5 transition-all duration-500 select-none overflow-hidden ${
      isCenter
        ? 'bg-[#0a0d1a] border-2 border-purple-500/40 shadow-[0_0_40px_-5px_rgba(139,92,246,0.3)]'
        : 'bg-white/[0.03] border border-white/[0.06]'
    }`}>
      {isCenter && <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />}
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <svg key={s} className={`w-4 h-4 ${s < review.rating ? 'text-amber-400' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-5xl font-serif leading-none select-none -mt-2" style={{ color: isCenter ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.15)' }}>&ldquo;</span>
        </div>
        <p className={`text-[13px] leading-relaxed mb-4 ${isCenter ? 'text-white/80' : 'text-white/60'}`}>&ldquo;{review.text}&rdquo;</p>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isCenter ? 'bg-gradient-to-br from-purple-500 to-violet-600 ring-2 ring-purple-500/30' : 'bg-white/10'}`}>
            {review.avatar}
          </div>
          <div>
            <div className={`text-sm font-semibold ${isCenter ? 'text-white' : 'text-white/80'}`}>{review.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: companyColors[review.company] || '#888' }} />
              {review.role} @ {review.company}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTestimonials() {
  const [idx, setIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(900);
  const [isMobile, setIsMobile] = useState(false);
  const len = reviewsData.length;
  const cardW = 340;
  const gap = 20;
  const step = cardW + gap;

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setCw(containerRef.current.offsetWidth);
      setIsMobile(window.innerWidth < 768);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const prev = () => setIdx((p) => (p - 1 + len) % len);
  const next = () => setIdx((p) => (p + 1) % len);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % len), 4000);
    return () => clearInterval(t);
  }, [len]);

  const offsetX = -(idx * step) + (cw / 2) - (cardW / 2);

  return (
    <div className="relative mx-auto max-w-5xl px-4">
      <div ref={containerRef} className="relative h-[480px] overflow-hidden">
        <motion.div
          animate={{ x: offsetX }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="flex gap-5 absolute left-0 top-1/2 -translate-y-1/2"
        >
          {reviewsData.map((review, i) => {
            const dist = Math.abs(i - idx);
            const isCenterCard = dist === 0;
            return (
              <motion.div
                key={review.name}
                animate={{
                  scale: isMobile ? 1 : isCenterCard ? 1.05 : dist === 1 ? 0.88 : 0.75,
                  opacity: isMobile ? (isCenterCard ? 1 : 0) : isCenterCard ? 1 : dist === 1 ? 0.55 : 0.15,
                }}
                transition={{ type: 'spring', stiffness: 250, damping: 28 }}
                className="shrink-0"
                style={{
                  width: isMobile ? 'calc(100vw - 2rem)' : cardW,
                  maxWidth: isMobile ? 340 : cardW,
                  filter: isCenterCard ? 'none' : 'blur(0.5px)',
                  pointerEvents: isCenterCard ? 'auto' : 'none',
                }}
              >
                <ReviewCard review={review} isCenter={isCenterCard} />
              </motion.div>
            );
          })}
        </motion.div>
        {!isMobile && (
          <>
            <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-[#0B1020] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#0B1020] to-transparent pointer-events-none z-10" />
          </>
        )}
        {isMobile && (
          <>
            <button onClick={prev} aria-label="Previous testimonial" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 hover:text-white hover:bg-black/80 flex items-center justify-center transition-all z-20">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} aria-label="Next testimonial" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 hover:text-white hover:bg-black/80 flex items-center justify-center transition-all z-20">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 mt-4">
        <button onClick={prev} className="hidden md:flex w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 items-center justify-center transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {reviewsData.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-purple-400 w-6' : 'bg-white/20 hover:bg-white/40 w-1.5'}`} />
        ))}
        <button onClick={next} className="hidden md:flex w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 items-center justify-center transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  const [popularQuestions, setPopularQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState({ questions: 0, patterns: 0, topics: 0, users: 0 });

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data) => setPopularQuestions(data.slice(0, 6)))
      .catch(() => {});
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats({
        questions: d.total_questions || 0,
        patterns: d.total_patterns || 0,
        topics: d.total_topics || 0,
        users: d.total_users || 0,
      }))
      .catch(() => {});
  }, []);

  const formatStat = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`;
    return `${n}+`;
  };

  const statsDisplay = [
    { value: formatStat(stats.questions), label: 'Coding Questions', color: 'text-primary-300' },
    { value: formatStat(stats.patterns), label: 'Pattern Cheat Sheets', color: 'text-emerald-300' },
    { value: formatStat(stats.topics), label: 'DSA Topics', color: 'text-amber-300' },
    { value: formatStat(stats.users), label: 'Students Preparing', color: 'text-blue-300' },
  ];

  return (
    <>
      <HeroSection />

      <div className="relative" style={{ backgroundColor: '#0B1020' }}>

      {/* Stats */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {statsDisplay.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <FadeInSection>
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <BookOpen className="w-3.5 h-3.5" /> Master DSA
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">How It Works</h2>
              <p className="text-white/50 text-base">A proven 4-step method to crack coding interviews</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[2px]">
                <div className="w-full h-full bg-white/10 rounded-full" />
                <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} className="absolute inset-0 bg-gradient-to-r from-amber-400 via-primary-400 via-emerald-400 to-rose-400 rounded-full origin-left" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
                {steps.map((step, i) => (
                  <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} className="relative group flex flex-col items-center">
                    <div className="relative mb-5">
                      <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.15 + 0.2, type: 'spring', stiffness: 200 }} className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative z-10" style={{ background: `linear-gradient(135deg, ${i === 0 ? '#f59e0b, #f97316' : i === 1 ? '#6366f1, #818cf8' : i === 2 ? '#10b981, #14b8a6' : '#f43f5e, #ec4899'})`, boxShadow: `0 8px 24px -4px ${i === 0 ? 'rgba(245,158,11,0.4)' : i === 1 ? 'rgba(99,102,241,0.4)' : i === 2 ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}` }}>
                        <step.icon className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center w-full hover:bg-white/15 hover:border-white/25 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Topics */}
      <FadeInSection>
        <section className="relative py-20">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Core Topics
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Master Every Pattern</h2>
              <p className="text-white/50 mt-2">Structured learning with progress tracking</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {TOPICS.slice(0, 10).map((topic, i) => {
                const prog = topicProgress[topic];
                const pct = prog ? Math.round((prog.done / prog.total) * 100) : 0;
                return (
                  <motion.div key={topic} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/topics/${topic.toLowerCase().replace(/\s+/g, '-')}`} className="group block bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-5 hover:bg-white/15 hover:border-white/25 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 text-white/80 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/15">
                          {topicIcons[topic.toLowerCase()] || <Database className="w-5 h-5" />}
                        </div>
                        <div className="text-sm font-semibold text-white group-hover:text-white transition-colors">{topic}</div>
                      </div>
                      {prog ? (
                        <>
                          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5">
                            <span>{prog.done}/{prog.total} Questions</span>
                            <span className="font-semibold text-white/70">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] text-white/40">Explore Topics</div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Patterns */}
      <FadeInSection>
        <section className="relative py-20 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <Target className="w-3.5 h-3.5" /> Pattern Recognition
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Recognize Any Pattern</h2>
              <p className="text-white/50 mt-2">Each pattern comes with recognition signals, time complexity, and code templates</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {patterns.map((p, i) => (
                <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-sm" style={{ background: `linear-gradient(135deg, ${p.color.includes('blue') ? '#3b82f6' : p.color.includes('emerald') ? '#10b981' : p.color.includes('purple') ? '#8b5cf6' : '#f59e0b'}, transparent)` }} />
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 h-full hover:bg-white/15 hover:border-white/25 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">{p.time}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {p.signals.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-xs text-white/50">
                          <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Questions */}
      <FadeInSection>
        <section className="relative py-20">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <Code2 className="w-3.5 h-3.5" /> Trending
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Popular Questions</h2>
              <p className="text-white/50 mt-2">Most viewed coding questions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularQuestions.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <Link to={`/questions/${q.slug}`} className={`block bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 border-l-4 ${q.difficulty === 'Easy' ? 'border-l-emerald-400' : q.difficulty === 'Medium' ? 'border-l-amber-400' : 'border-l-rose-400'} hover:bg-white/15 hover:border-white/25 transition-all duration-300 group`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/30 w-5">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <span className="font-medium text-white group-hover:text-white transition-colors text-sm">{q.title}</span>
                          <span className="text-xs text-white/40 ml-2">{q.topic_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-emerald-400/20 text-emerald-300' : q.difficulty === 'Medium' ? 'bg-amber-400/20 text-amber-300' : 'bg-rose-400/20 text-rose-300'}`}>{q.difficulty}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/questions" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/20 text-white/80 font-semibold text-sm hover:bg-white/10 transition-all">
                View All Questions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Platform */}
      <FadeInSection>
        <section className="relative py-20 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <Monitor className="w-3.5 h-3.5" /> Platform
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Inside the Platform</h2>
              <p className="text-white/50 mt-2">Everything you need to master DSA in one place</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: FileText, title: 'Cheat Sheets', desc: 'Pattern-based approach with step-by-step breakdown, flow diagrams, and code templates', color: 'from-primary-500 to-indigo-600' },
                { icon: Eye, title: 'Visualizer', desc: 'Step-by-step code execution with variable tracking and line highlighting', color: 'from-emerald-500 to-teal-600' },
                { icon: Code2, title: 'Compiler', desc: 'Run code instantly with custom test cases, complexity analysis, and output comparison', color: 'from-amber-500 to-orange-600' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="group">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 h-full hover:bg-white/15 hover:border-white/25 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Dashboard */}
      <FadeInSection>
        <section className="relative py-20">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <BarChart3 className="w-3.5 h-3.5" /> Dashboard
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Interview Readiness</h2>
              <p className="text-slate-400 mt-2">Track your preparation with detailed analytics</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Overall Progress</h3>
                    <p className="text-sm text-slate-400">Your interview readiness score</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-500">72%</div>
                    <div className="text-xs text-slate-400">Ready</div>
                  </div>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-8">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Arrays & Hashing', pct: 90, color: 'bg-success-500' },
                    { name: 'Trees & BST', pct: 65, color: 'bg-warning-500' },
                    { name: 'Graphs', pct: 30, color: 'bg-danger-500' },
                    { name: 'Dynamic Programming', pct: 45, color: 'bg-info-500' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white font-medium">{item.name}</span>
                        <span className="text-slate-400 font-mono text-xs">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Trusted By */}
      <FadeInSection>
        <section className="relative py-10 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                <Shield className="w-3.5 h-3.5" /> Trusted By
              </span>
              <h2 className="text-xl font-semibold text-white">Common Interview Patterns Asked At</h2>
            </div>
            {/* Infinite marquee container */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              }}
            >
              <motion.div
                className="flex items-center gap-12 md:gap-16 w-max"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 25,
                    ease: 'linear',
                  },
                }}
              >
                {[...companies, ...companies].map((company, i) => (
                  <div
                    key={`${company}-${i}`}
                    className="text-slate-400 hover:text-white transition-colors text-2xl md:text-3xl font-bold select-none whitespace-nowrap"
                  >
                    {company}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Reviews */}
      <FadeInSection>
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2 border border-purple-500/20">
                Loved by 10,000+ Developers <span className="text-red-400">❤️</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">What <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Students</span> Say</h2>
              <p className="text-white/50 mt-1">Hear from students who cracked their dream interviews</p>
            </div>
            <SectionTestimonials />
          </div>
        </section>
      </FadeInSection>

      {/* Why Us */}
      <FadeInSection>
        <section className="relative py-20">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Why CodeSprout?</h2>
              <p className="text-slate-400 mt-2">Stop memorizing, start understanding patterns</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Target, color: 'from-primary-500 to-indigo-600', title: 'Pattern Recognition', desc: 'Learn to identify patterns, not just memorize solutions' },
                { icon: ZapIcon, color: 'from-emerald-500 to-teal-600', title: 'Quick Reference', desc: 'Concise cheat sheets for rapid revision before interviews' },
                { icon: TrendingUp, color: 'from-amber-500 to-orange-600', title: 'Track Progress', desc: 'Bookmark questions and track your learning journey' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="group">
                  <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 text-center hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* CTA */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 sm:mb-4">Start Learning Free</h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-base sm:text-lg">No credit card required. Access {stats.questions}+ questions and {stats.patterns}+ cheat sheets instantly.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/questions" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all shadow-lg shadow-glow">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/games" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 hover:border-white/20 transition-all">
              <Gamepad2 className="w-4 h-4" /> Start Games Test
            </Link>
          </div>
        </div>
      </section>

      </div>

      <FAQ />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'topics', element: <TopicsPage /> },
      { path: 'topics/:slug', element: <TopicDetailPage /> },
      { path: 'questions', element: <QuestionsPage /> },
      { path: 'questions/:slug', element: <QuestionDetailPage /> },
      { path: 'patterns', element: <PatternsPage /> },
      { path: 'patterns/:name', element: <PatternDetailPage /> },
      { path: 'easy', element: <DifficultyPage /> },
      { path: 'medium', element: <DifficultyPage /> },
      { path: 'hard', element: <DifficultyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'interview-prep', element: <InterviewPrepPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'communities', element: <ProtectedRoute><CommunitiesPage /></ProtectedRoute> },
      { path: 'communities/:id', element: <ProtectedRoute><CommunityDetailPage /></ProtectedRoute> },
      { path: 'payment', element: <ProtectedRoute><PaymentPage /></ProtectedRoute> },
      { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: 'bookmarks', element: <ProtectedRoute><BookmarksPage /></ProtectedRoute> },
      { path: 'games', element: <GamesLandingPage /> },
      { path: 'games/:topic', element: <GameTopicPage /> },
      { path: 'games/:topic/:level', element: <GamePlayPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute adminOnly><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'questions', element: <ManageQuestions /> },
      { path: 'add-question', element: <AddQuestionPage /> },
      { path: 'users', element: <ManageUsers /> },
    ],
  },
]);