import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import TopicsPage from '@/features/topics/pages/TopicsPage';
import QuestionsPage from '@/features/questions/pages/QuestionsPage';
import PatternsPage from '@/features/patterns/pages/PatternsPage';
import DifficultyPage from '@/features/difficulty/pages/DifficultyPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import PricingPage from '@/features/subscription/pages/PricingPage';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderboardPage';
import InterviewPrepPage from '@/features/interview/pages/InterviewPrepPage';
import InterviewSetupPage from '@/features/interview/pages/InterviewSetupPage';
import InterviewDashboardPage from '@/features/interview/pages/InterviewDashboardPage';
import InterviewSubjectPage from '@/features/interview/pages/InterviewSubjectPage';
import MockInterviewPage from '@/features/interview/pages/MockInterviewPage';
import MockCallPage from '@/features/interview/pages/MockCallPage';
import MockResultPage from '@/features/interview/pages/MockResultPage';
import GamesLandingPage from '@/features/games/pages/GamesLandingPage';
import HeroSection from '@/shared/components/HeroSection';
import FAQ from '@/shared/components/FAQ';

const TopicDetailPage = lazy(() => import('@/features/topics/pages/TopicDetailPage'));
const QuestionDetailPage = lazy(() => import('@/features/questions/pages/QuestionDetailPage'));
const PatternDetailPage = lazy(() => import('@/features/patterns/pages/PatternDetailPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const BookmarksPage = lazy(() => import('@/features/bookmarks/pages/BookmarksPage'));
const PaymentPage = lazy(() => import('@/features/payment/pages/PaymentPage'));
const CommunitiesPage = lazy(() => import('@/features/community/pages/CommunitiesPage'));
const CommunityDetailPage = lazy(() => import('@/features/community/pages/CommunityDetailPage'));
const GameTopicPage = lazy(() => import('@/features/games/pages/GameTopicPage'));
const GamePlayPage = lazy(() => import('@/features/games/pages/GamePlayPage'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const ManageQuestions = lazy(() => import('@/features/admin/pages/ManageQuestions'));
const AddQuestionPage = lazy(() => import('@/features/admin/pages/AddQuestionPage'));
const ManageUsers = lazy(() => import('@/features/admin/pages/ManageUsers'));
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { TOPICS } from '@/shared/utils/constants';
import {
  ArrowRight, Database, Braces, Hash, Link2, Layers, MoveVertical, Trello,
  GitBranch, TreePine, Network, Target, Puzzle, RefreshCw, Maximize2, Search,
  ZapIcon, Sparkles, Code2, Eye, TrendingUp, Lightbulb, BookOpen, BarChart3,
  Play, CheckCircle, ChevronRight, ChevronLeft, FileText, Monitor, Shield, Gamepad2,
  Trophy, Crown, Flame
} from 'lucide-react';
import SEO, {
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildFaqJsonLd,
} from '@/shared/components/SEO';

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

const topicStyle: Record<string, { bg: string; text: string; ring: string }> = {
  Arrays:         { bg: 'from-blue-500/20 to-cyan-500/20',     text: 'text-blue-300',    ring: 'group-hover:ring-blue-400/40'    },
  Strings:        { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-300', ring: 'group-hover:ring-emerald-400/40' },
  Hashing:        { bg: 'from-violet-500/20 to-purple-500/20', text: 'text-violet-300', ring: 'group-hover:ring-violet-400/40'  },
  'Linked List':  { bg: 'from-pink-500/20 to-rose-500/20',    text: 'text-pink-300',    ring: 'group-hover:ring-pink-400/40'    },
  Stack:          { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-300',   ring: 'group-hover:ring-amber-400/40'   },
  Queue:          { bg: 'from-cyan-500/20 to-sky-500/20',     text: 'text-cyan-300',    ring: 'group-hover:ring-cyan-400/40'    },
  Heap:           { bg: 'from-fuchsia-500/20 to-pink-500/20', text: 'text-fuchsia-300', ring: 'group-hover:ring-fuchsia-400/40' },
  Trees:          { bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-300',  ring: 'group-hover:ring-green-400/40'   },
  BST:            { bg: 'from-lime-500/20 to-green-500/20',   text: 'text-lime-300',    ring: 'group-hover:ring-lime-400/40'    },
  Graphs:         { bg: 'from-indigo-500/20 to-blue-500/20',  text: 'text-indigo-300',  ring: 'group-hover:ring-indigo-400/40'  },
  Greedy:         { bg: 'from-rose-500/20 to-red-500/20',     text: 'text-rose-300',    ring: 'group-hover:ring-rose-400/40'    },
  DP:             { bg: 'from-yellow-500/20 to-amber-500/20', text: 'text-yellow-300',  ring: 'group-hover:ring-yellow-400/40'  },
  Backtracking:   { bg: 'from-teal-500/20 to-emerald-500/20', text: 'text-teal-300',    ring: 'group-hover:ring-teal-400/40'    },
  'Sliding Window': { bg: 'from-orange-500/20 to-red-500/20', text: 'text-orange-300', ring: 'group-hover:ring-orange-400/40'  },
  'Binary Search':  { bg: 'from-sky-500/20 to-blue-500/20',   text: 'text-sky-300',     ring: 'group-hover:ring-sky-400/40'     },
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

function ReviewCard({ review, isCenter, accent }: { review: typeof reviewsData[0]; isCenter?: boolean; accent?: string }) {
  return (
    <div className={`relative rounded-2xl p-6 transition-all duration-500 select-none overflow-hidden h-full flex flex-col bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/20 hover:from-white/[0.06] hover:to-white/[0.02] ${
      isCenter ? `shadow-[0_8px_40px_-8px_rgba(139,92,246,0.35)] ${accent || ''}` : ''
    }`}>
      {isCenter && <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40" style={{ background: accent?.includes('purple') ? 'rgba(139,92,246,0.4)' : accent?.includes('amber') ? 'rgba(245,158,11,0.4)' : 'rgba(139,92,246,0.4)' }} />}
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <svg key={s} className={`w-4 h-4 ${s < review.rating ? 'text-amber-400' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <svg className="w-7 h-7 text-purple-400/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
          </svg>
        </div>
        <p className="text-[14px] leading-relaxed mb-5 text-white/75 flex-1">&ldquo;{review.text}&rdquo;</p>
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 ring-2 ring-purple-500/20">
            {review.avatar}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{review.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-white/50 mt-0.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: companyColors[review.company] || '#888' }} />
              <span className="truncate">{review.role} @ {review.company}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTestimonials() {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [hovered, setHovered] = useState(false);
  const len = reviewsData.length;

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setPerPage(1);
      else if (w < 1024) setPerPage(2);
      else setPerPage(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalPages = Math.ceil(len / perPage);
  const safePage = page % totalPages;
  const startIdx = safePage * perPage;
  const visibleReviews = reviewsData.slice(startIdx, startIdx + perPage);
  while (visibleReviews.length < perPage && visibleReviews.length < len) {
    const missing = perPage - visibleReviews.length;
    visibleReviews.push(...reviewsData.slice(0, missing));
  }

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => setPage((p) => (p + 1) % totalPages), 5000);
    return () => clearInterval(t);
  }, [totalPages, hovered]);

  return (
    <div
      className="relative mx-auto max-w-6xl px-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleReviews.map((review, i) => {
          const isCenter = perPage === 3 ? i === 1 : perPage === 2 ? i === 0 : true;
          const accents = ['border-purple-500/20', 'border-amber-500/20', 'border-blue-500/20'];
          const accent = accents[i % accents.length];
          return (
            <motion.div
              key={`${review.name}-${startIdx}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="h-full"
            >
              <ReviewCard review={review} isCenter={isCenter} accent={accent} />
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          aria-label="Previous testimonials"
          className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Go to testimonial page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === safePage ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-8' : 'bg-white/20 hover:bg-white/40 w-1.5'}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          aria-label="Next testimonials"
          className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all hover:scale-105"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  const [popularQuestions, setPopularQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState({ questions: 0, patterns: 0, topics: 0, users: 0 });
  const [topCoders, setTopCoders] = useState<any[]>([]);
  const [totalCoders, setTotalCoders] = useState(0);

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
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => {
        setTopCoders((d.leaderboard || []).slice(0, 5));
        setTotalCoders(d.total_users || 0);
      })
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
      <SEO
        title="CodeSprout - Master Coding Patterns & Crack DSA Interviews"
        description="Master coding interview patterns with 1000+ curated DSA questions, pattern-based cheat sheets, step-by-step visualizer, and progress tracking. Crack FAANG interviews faster."
        path="/"
        keywords={['coding patterns', 'DSA practice', 'interview prep', 'FAANG', 'system design', 'coding cheat sheets', 'algorithm practice']}
        jsonLd={[
          buildOrganizationJsonLd(),
          buildSoftwareApplicationJsonLd(),
          buildFaqJsonLd([
            { question: 'What is CodeSprout?', answer: 'CodeSprout is a pattern-based DSA learning platform with 1000+ coding interview questions, cheat sheets, and a code visualizer to help you crack FAANG interviews.' },
            { question: 'Is CodeSprout free?', answer: 'Yes, CodeSprout offers free access to a large set of coding questions and cheat sheets. Premium plans unlock hard problems, advanced analytics, and unlimited practice.' },
            { question: 'Which companies does CodeSprout prepare me for?', answer: 'CodeSprout helps you prepare for coding interviews at Google, Amazon, Microsoft, Meta, Apple, Netflix, Adobe, Uber, and other top tech companies.' },
          ]),
        ]}
      />
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
              <p className="text-white/50 mt-2">Pick a topic and start solving</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {TOPICS.slice(0, 10).map((topic, i) => {
                const style = topicStyle[topic] || { bg: 'from-purple-500/20 to-violet-500/20', text: 'text-purple-300', ring: 'group-hover:ring-purple-400/40' };
                return (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/topics/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group relative block bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 overflow-hidden"
                    >
                      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${style.bg} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                      <div className="relative flex flex-col h-full">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.bg} ${style.text} flex items-center justify-center mb-4 ring-1 ring-white/10 ${style.ring} group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300`}>
                          {topicIcons[topic.toLowerCase()] || <Database className="w-5 h-5" />}
                        </div>

                        <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-white transition-colors">
                          {topic}
                        </h3>

                        <div className="mt-auto pt-3 flex items-center justify-end text-xs text-white/0 group-hover:text-white/60 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
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

      {/* Top Coders */}
      <FadeInSection>
        <section className="relative py-20">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-4 border border-amber-500/20">
                <Trophy className="w-3.5 h-3.5" /> Top Coders
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Leaderboard</h2>
              <p className="text-slate-400 mt-2">{totalCoders > 0 ? `${totalCoders} coders competing` : 'See how you rank against the community'}</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0d1424] border border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/5">
                  <div className="col-span-2 sm:col-span-1">Rank</div>
                  <div className="col-span-6 sm:col-span-5">Coder</div>
                  <div className="col-span-2 text-center">Solved</div>
                  <div className="col-span-2 text-center hidden sm:block">Streak</div>
                  <div className="col-span-2 sm:col-span-2 text-right">Points</div>
                </div>
                {topCoders.length === 0 ? (
                  <div className="px-5 py-10 text-center text-white/40 text-sm">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-white/[0.02] rounded-lg mb-2 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  topCoders.map((coder, i) => {
                    const isTop3 = coder.rank <= 3;
                    const rankIcon = coder.rank === 1 ? <Crown className="w-4 h-4 text-amber-400" />
                      : coder.rank === 2 ? <Crown className="w-4 h-4 text-slate-300" />
                      : coder.rank === 3 ? <Crown className="w-4 h-4 text-orange-400" />
                      : <span className="text-sm text-white/40 font-mono">#{coder.rank}</span>;
                    const avatarColor = isTop3
                      ? coder.rank === 1 ? 'from-amber-400 to-yellow-500' : coder.rank === 2 ? 'from-slate-300 to-slate-400' : 'from-orange-400 to-amber-500'
                      : 'from-purple-500/40 to-violet-600/40';
                    return (
                      <div key={coder.user_id} className={`grid grid-cols-12 px-5 py-3.5 items-center text-sm border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.03] ${isTop3 ? 'bg-amber-500/[0.04]' : ''}`}>
                        <div className="col-span-2 sm:col-span-1 flex items-center">{rankIcon}</div>
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 bg-gradient-to-br ${avatarColor} ${isTop3 ? 'ring-2 ring-amber-500/20' : ''}`}>
                            {(coder.user_name || 'A').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-white font-medium truncate">{coder.user_name || 'Anonymous'}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-white/80 font-mono text-xs">{coder.solved}</span>
                        </div>
                        <div className="col-span-2 text-center hidden sm:flex items-center justify-center gap-1">
                          {coder.streak > 0 ? (
                            <>
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span className="text-orange-300 text-xs font-mono">{coder.streak}</span>
                            </>
                          ) : (
                            <span className="text-white/20 text-xs">—</span>
                          )}
                        </div>
                        <div className="col-span-2 sm:col-span-2 text-right">
                          <span className={`font-mono font-semibold ${isTop3 ? 'text-amber-300' : 'text-emerald-300'}`}>
                            {coder.points?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-center mt-6">
                <Link to="/leaderboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/80 font-medium text-sm hover:bg-white/5 hover:border-white/20 transition-all">
                  View Full Leaderboard <ArrowRight className="w-4 h-4" />
                </Link>
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
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4 border border-purple-500/20">
                Loved by 10,000+ Developers <span className="text-red-400">❤️</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">What <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Students</span> Say</h2>
              <p className="text-white/50 mt-2 max-w-2xl mx-auto">Real stories from developers who landed their dream jobs after practicing on CodeSprout</p>
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

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading page">
    <div className="w-10 h-10 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
  </div>
);

const lazyRoute = (Comp: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}>
    <Comp />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'topics', element: <TopicsPage /> },
      { path: 'topics/:slug', element: lazyRoute(TopicDetailPage) },
      { path: 'questions', element: <QuestionsPage /> },
      { path: 'questions/:slug', element: lazyRoute(QuestionDetailPage) },
      { path: 'patterns', element: <PatternsPage /> },
      { path: 'patterns/:name', element: lazyRoute(PatternDetailPage) },
      { path: 'easy', element: <DifficultyPage /> },
      { path: 'medium', element: <DifficultyPage /> },
      { path: 'hard', element: <DifficultyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'interview-prep', element: <InterviewPrepPage /> },
      { path: 'interview-prep/setup', element: <ProtectedRoute><InterviewSetupPage /></ProtectedRoute> },
      { path: 'interview-prep/dashboard', element: <ProtectedRoute><InterviewDashboardPage /></ProtectedRoute> },
      { path: 'interview-prep/subject/:subject', element: <ProtectedRoute><InterviewSubjectPage /></ProtectedRoute> },
      { path: 'interview-prep/mock', element: <ProtectedRoute><MockInterviewPage /></ProtectedRoute> },
      { path: 'interview-prep/call', element: <ProtectedRoute><MockCallPage /></ProtectedRoute> },
      { path: 'interview-prep/mock-result/:id', element: <ProtectedRoute><MockResultPage /></ProtectedRoute> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'communities', element: <ProtectedRoute><Suspense fallback={<PageLoader />}><CommunitiesPage /></Suspense></ProtectedRoute> },
      { path: 'communities/:id', element: <ProtectedRoute><Suspense fallback={<PageLoader />}><CommunityDetailPage /></Suspense></ProtectedRoute> },
      { path: 'payment', element: <ProtectedRoute><Suspense fallback={<PageLoader />}><PaymentPage /></Suspense></ProtectedRoute> },
      { path: 'dashboard', element: <ProtectedRoute><Suspense fallback={<PageLoader />}><DashboardPage /></Suspense></ProtectedRoute> },
      { path: 'bookmarks', element: <ProtectedRoute><Suspense fallback={<PageLoader />}><BookmarksPage /></Suspense></ProtectedRoute> },
      { path: 'games', element: <GamesLandingPage /> },
      { path: 'games/:topic', element: lazyRoute(GameTopicPage) },
      { path: 'games/:topic/:level', element: lazyRoute(GamePlayPage) },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute adminOnly><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: lazyRoute(AdminDashboard) },
      { path: 'questions', element: lazyRoute(ManageQuestions) },
      { path: 'add-question', element: lazyRoute(AddQuestionPage) },
      { path: 'users', element: lazyRoute(ManageUsers) },
    ],
  },
]);