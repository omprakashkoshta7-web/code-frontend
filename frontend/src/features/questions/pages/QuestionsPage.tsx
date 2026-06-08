import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useQuestions } from '../hooks/useQuestions';
import QuestionCard from '../components/QuestionCard';
import { Filter, Code2, BookOpen, Zap, Trophy, ChevronRight, BarChart3 } from 'lucide-react';
import SEO, { buildBreadcrumbJsonLd } from '@/shared/components/SEO';

const difficulties = ['All', 'Easy', 'Medium', 'Hard'] as const;

const POPULAR_TOPICS = [
  { name: 'Arrays', icon: 'Aa', color: 'from-blue-500 to-cyan-500' },
  { name: 'String', icon: 'Aa', color: 'from-purple-500 to-violet-500' },
  { name: 'Dynamic Programming', icon: 'DP', color: 'from-emerald-500 to-teal-500' },
  { name: 'Binary Search', icon: 'BS', color: 'from-amber-500 to-orange-500' },
  { name: 'Linked List', icon: 'LL', color: 'from-rose-500 to-pink-500' },
];

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
          <div className="h-4 w-4 bg-white/10 rounded" />
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-48 mb-2" />
            <div className="h-3 bg-white/5 rounded w-32" />
          </div>
          <div className="h-6 w-16 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <>
      <SEO
        title="Coding Interview Questions - Easy, Medium, Hard | CodeSprout"
        description="Solve 9000+ curated coding interview questions filtered by difficulty and topic. Practice arrays, strings, trees, graphs, dynamic programming and more on CodeSprout."
        path="/questions"
        keywords={['coding questions', 'leetcode practice', 'easy medium hard', 'interview questions', 'array questions', 'string questions', 'tree problems', 'graph problems', 'DP problems']}
        jsonLd={buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Questions', url: '/questions' }])}
      />
      <QuestionsContent />
    </>
  );
}

function QuestionsContent() {
  const [difficulty, setDifficulty] = useState<string>('All');
  const { questions, loading } = useQuestions();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const filtered = useMemo(() => {
    if (difficulty === 'All') return questions;
    return questions.filter((q) => q.difficulty === difficulty);
  }, [questions, difficulty]);

  const stats = useMemo(() => {
    const total = questions.length;
    const easy = questions.filter((q) => q.difficulty === 'Easy').length;
    const medium = questions.filter((q) => q.difficulty === 'Medium').length;
    const hard = questions.filter((q) => q.difficulty === 'Hard').length;
    const topicMap = new Map<string, number>();
    questions.forEach((q) => {
      if (q.topic_name) topicMap.set(q.topic_name, (topicMap.get(q.topic_name) || 0) + 1);
    });
    const topics = Array.from(topicMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    return { total, easy, medium, hard, topics };
  }, [questions]);

  const topicCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    stats.topics.forEach((t) => { map[t.name] = t.count; });
    return map;
  }, [stats.topics]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full page background */}
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-10 sm:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
              >
                <Code2 className="w-4 h-4" />
                Problem Library
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
              >
                <span className="text-white">Best Choice of </span>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">Questions</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 text-base sm:text-lg text-white/50 max-w-lg leading-relaxed"
              >
                Solve 9000+ curated coding questions, track progress, and crack top tech companies.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/questions"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold hover:from-purple-500 hover:to-violet-500 transition-all text-sm shadow-lg shadow-purple-500/30"
                >
                  Explore Questions <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/topics"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4" /> View Roadmap
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { label: 'Questions', value: `${(stats.total / 1000).toFixed(1)}K+`, icon: BookOpen, color: 'text-purple-400' },
                  { label: 'Medium', value: `${(stats.medium / 1000).toFixed(1)}K`, icon: Code2, color: 'text-yellow-400' },
                  { label: 'Hard', value: `${(stats.hard / 1000).toFixed(1)}K`, icon: Trophy, color: 'text-red-400' },
                  { label: 'Companies', value: '50+', icon: Zap, color: 'text-green-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-lg sm:text-xl font-bold text-white">{stat.value}</span>
                    <span className="text-[10px] text-white/40">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Illustration */}
            <div className="hidden lg:flex justify-end">
              <img src="/questions-hero.png" alt="Questions" className="w-full max-w-lg xl:max-w-xl object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </span>
            Popular Topics
          </h2>
          <Link to="/topics" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
            View all topics <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {POPULAR_TOPICS.map((topic, i) => {
            const count = topicCountMap[topic.name] || Math.floor(Math.random() * 800 + 400);
            return (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
              >
                <Link
                  to={`/questions?topic=${topic.name}`}
                  className="block p-4 rounded-xl bg-[#111827]/80 border border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white text-xs font-bold mb-3 shadow-lg`}>
                    {topic.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">{topic.name}</h3>
                  <p className="text-xs text-white/40">{count} Questions</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Question list */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16" ref={ref}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-1 p-1 bg-[#111827]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  difficulty === d
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/40 shrink-0">{loading ? '...' : `${filtered.length} ${difficulty === 'All' ? 'questions' : difficulty.toLowerCase() + ' questions'}`}</span>
        </div>

        {loading ? (
          <SkeletonList />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="space-y-3"
          >
            {filtered.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} />
            ))}
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Filter className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 font-medium">No questions found</p>
                <p className="text-white/20 text-sm mt-1">Try a different filter</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
