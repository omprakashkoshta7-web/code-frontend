import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTopics } from '../hooks/useTopics';
import TopicCard from '../components/TopicCard';
import TopicPopup from '../components/TopicPopup';
import SearchBar from '@/shared/components/SearchBar';
import { BookOpen, Code2, Zap, Target, Sparkles } from 'lucide-react';
import type { Topic } from '../types/topic';
import SEO, { buildBreadcrumbJsonLd } from '@/shared/components/SEO';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="w-11 h-11 bg-white/10 rounded-xl mb-4" />
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function TopicsPage() {
  return (
    <>
      <SEO
        title="DSA Topics - Arrays, Strings, Trees, Graphs, DP & More"
        description="Browse all DSA topics on CodeSprout. Master arrays, strings, linked lists, trees, graphs, dynamic programming, backtracking and more with curated problems and cheat sheets."
        path="/topics"
        keywords={['DSA topics', 'arrays', 'strings', 'linked list', 'trees', 'graphs', 'dynamic programming', 'backtracking', 'stack', 'queue', 'heap', 'greedy', 'binary search']}
        jsonLd={buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Topics', url: '/topics' }])}
      />
      <TopicsContent />
    </>
  );
}

function TopicsContent() {
  const { topics, loading } = useTopics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [globalStats, setGlobalStats] = useState({ questions: 0, patterns: 0, topics: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setGlobalStats({
        questions: d.total_questions || 0,
        patterns: d.total_patterns || 0,
        topics: d.total_topics || 0,
      }))
      .catch(() => {});
  }, []);

  const formatStat = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+` : `${n}+`);

  const stats = [
    { icon: BookOpen, label: 'Topics', value: formatStat(globalStats.topics), color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Code2, label: 'Questions', value: formatStat(globalStats.questions), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Zap, label: 'Patterns', value: formatStat(globalStats.patterns), color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: Target, label: 'Companies', value: '50+', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400">DSA Topics</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              <span className="text-white">Learn </span>
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Every Topic</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
            >
              Master data structures and algorithms with our curated cheat sheets. Learn patterns, solve problems, ace your interviews.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <SearchBar />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              {stats.map((s, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${s.bg} border border-white/5`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-sm font-bold text-white">{s.value}</span>
                  <span className="text-xs text-white/40">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-shrink-0 w-full max-w-md lg:max-w-lg"
          >
            <img src="/topics-hero.png" alt="DSA Topics" className="w-full h-auto drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16" ref={ref}>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6"
          >
            {topics.map((topic, i) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={i}
                onClick={() => setSelectedTopic(topic)}
              />
            ))}
          </motion.div>
        )}
      </section>

      <TopicPopup topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </div>
  );
}
