import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, ArrowRight, CheckCircle, AlertTriangle, Clock, Database, Code2, BookOpen, Target } from 'lucide-react';
import { PATTERN_DETAILS, type PatternDetail } from '../data/patternsData';
import SEO, { buildBreadcrumbJsonLd } from '@/shared/components/SEO';

const categoryColors: Record<string, string> = {
  'HashMap': 'from-violet-500 to-purple-500',
  'Two Pointers': 'from-emerald-500 to-teal-500',
  'Sliding Window': 'from-purple-500 to-indigo-500',
  'Stack': 'from-amber-500 to-orange-500',
  'Queue': 'from-cyan-500 to-sky-500',
  'Heap': 'from-fuchsia-500 to-pink-500',
  'DFS': 'from-rose-500 to-pink-500',
  'BFS': 'from-sky-500 to-blue-500',
  'DP': 'from-primary-500 to-indigo-600',
  'Greedy': 'from-lime-500 to-green-500',
  'Backtracking': 'from-fuchsia-500 to-purple-500',
  'Sorting': 'from-teal-500 to-emerald-500',
  'Linked List': 'from-pink-500 to-rose-500',
  'Tree': 'from-green-500 to-emerald-500',
  'Graph': 'from-indigo-500 to-blue-500',
  'Design': 'from-yellow-500 to-amber-500',
  'Array': 'from-blue-500 to-cyan-500',
  'Other': 'from-gray-500 to-slate-400',
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[''`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const buildGenericPattern = (name: string, categoryFromName: string): PatternDetail => ({
  name,
  category: categoryFromName,
  summary: `Apply the ${name} technique to break down this class of problems. Look for the recognition signals below to decide when to reach for it.`,
  flow: [
    { step: 'Recognize the Pattern', desc: `Identify signals that point to ${name} in the problem statement.` },
    { step: 'Choose Data Structures', desc: 'Pick structures that support the operations the pattern needs (map, set, stack, queue, etc.).' },
    { step: 'Apply the Technique', desc: `Implement the core loop or recursion for ${name}, updating state as you go.` },
    { step: 'Verify and Return', desc: 'Confirm edge cases (empty input, single element, duplicates) and return the result.' },
  ],
  template: `# Generic ${name} template\nstate = initialize()\nfor each item in input:\n    if condition(item):\n        state = update(state, item)\n    if goal_reached(state):\n        return result_from(state)\nreturn state`,
  tips: [
    'Practice the simplest version of the problem first',
    'Identify the invariant the algorithm maintains',
    'Sketch the data flow on small examples before coding',
  ],
  traps: [
    'Off-by-one errors in index/pointer manipulation',
    'Forgetting to handle empty or single-element inputs',
    'Missing edge cases with duplicates or negative values',
  ],
  timeComplexity: 'Varies by problem',
  spaceComplexity: 'Varies by problem',
});

export default function PatternDetailPage() {
  return (
    <>
      <PatternDetailSEO />
      <PatternDetailContent />
    </>
  );
}

function PatternDetailSEO() {
  const { name } = useParams<{ name: string }>();
  const decoded = name ? decodeURIComponent(name) : '';
  return (
    <SEO
      title={`${decoded} Pattern - Cheat Sheet & Practice | CodeSprout`}
      description={`Master the ${decoded} coding pattern. Learn recognition signals, time complexity, code template, and practice curated ${decoded} interview questions.`}
      path={`/patterns/${name}`}
      keywords={[`${decoded} pattern`, `${decoded} DSA`, `${decoded} leetcode`, 'coding pattern cheat sheet']}
      jsonLd={buildBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Patterns', url: '/patterns' },
        { name: decoded, url: `/patterns/${name}` },
      ])}
    />
  );
}

function PatternDetailContent() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : '';
  const slug = useMemo(() => slugify(decodedName), [decodedName]);

  const [apiPattern, setApiPattern] = useState<PatternDetail | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    setApiLoading(true);
    setNotFound(false);
    setApiPattern(null);
    fetch(`/api/patterns/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setApiPattern({
            name: data.name,
            category: data.category,
            summary: data.summary,
            flow: data.flow || [],
            template: data.template || '',
            tips: data.tips || [],
            traps: data.traps || [],
            timeComplexity: data.time_complexity || 'N/A',
            spaceComplexity: data.space_complexity || 'N/A',
          });
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setApiLoading(false));
  }, [slug]);

  useEffect(() => {
    setQuestionsLoading(true);
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data as any[]).filter(
          (q) => q.pattern === decodedName || q.pattern?.includes(decodedName)
        );
        setQuestions(filtered);
      })
      .catch(() => {})
      .finally(() => setQuestionsLoading(false));
  }, [decodedName]);

  const hardcoded = PATTERN_DETAILS[decodedName];
  let pattern: PatternDetail | null = apiPattern || hardcoded || null;
  if (!pattern && !apiLoading) {
    pattern = buildGenericPattern(decodedName, hardcoded?.category || 'Other');
  }

  if (apiLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1020]" />
        <div className="relative z-10 text-white/40 text-lg">Loading...</div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1020]" />
        <div className="relative z-10 text-center">
          <p className="text-white/40 text-lg">Pattern not found</p>
          <Link to="/patterns" className="text-emerald-400 hover:underline mt-2 inline-block">Back to patterns</Link>
        </div>
      </div>
    );
  }

  const color = categoryColors[pattern.category] || 'from-gray-500 to-slate-400';
  const isGeneric = !apiPattern && !hardcoded;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10 sm:pb-12">
        <Link to="/patterns" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-3 sm:mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Patterns
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{pattern.name}</h1>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${color} text-white font-medium`}>{pattern.category}</span>
                {isGeneric && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-wider">
                    Auto
                  </span>
                )}
              </div>
              <p className="text-white/50 text-xs sm:text-sm leading-snug mt-0.5">{pattern.summary}</p>
            </div>
            <div className="hidden md:flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/50">
                <Clock className="w-3 h-3" /> Time: {pattern.timeComplexity}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/50">
                <Database className="w-3 h-3" /> Space: {pattern.spaceComplexity}
              </div>
            </div>
          </div>
          <div className="flex md:hidden flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/50">
              <Clock className="w-3 h-3" /> Time: {pattern.timeComplexity}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/50">
              <Database className="w-3 h-3" /> Space: {pattern.spaceComplexity}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-sm sm:text-base font-bold text-white mb-2.5 flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-emerald-400" /> How It Works
              </h2>
              <div className="space-y-2">
                {pattern.flow.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.06 }}
                    className="group relative"
                  >
                    {i < pattern.flow.length - 1 && (
                      <div className="absolute left-[14px] top-[30px] w-px h-[calc(100%+6px)] bg-gradient-to-b from-white/15 to-transparent" />
                    )}
                    <div className="relative flex gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow group-hover:scale-110 transition-transform duration-300`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors leading-tight">{step.step}</h3>
                        <p className="text-[11px] sm:text-xs text-white/50 leading-snug mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-sm sm:text-base font-bold text-white mb-2.5 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" /> Template
              </h2>
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border-b border-white/5">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] text-white/30 ml-1">pseudocode</span>
                </div>
                <pre className="p-3 sm:p-4 text-[11px] sm:text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto" style={{ backgroundColor: '#0B1020' }}>
                  {pattern.template}
                </pre>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Tips
                </h2>
                <div className="space-y-1.5">
                  {pattern.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-emerald-500/[0.04] border border-emerald-500/[0.08] hover:bg-emerald-500/[0.08] transition-colors">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] sm:text-xs text-white/60 leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h2 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Common Traps
                </h2>
                <div className="space-y-1.5">
                  {pattern.traps.map((trap, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-amber-500/[0.04] border border-amber-500/[0.08] hover:bg-amber-500/[0.08] transition-colors">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] sm:text-xs text-white/60 leading-snug">{trap}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="lg:sticky lg:top-24">
              <h2 className="text-sm sm:text-base font-bold text-white mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Practice Questions
                {!questionsLoading && questions.length > 0 && (
                  <span className="text-[10px] font-medium text-white/40 ml-auto">{questions.length}</span>
                )}
              </h2>

              {questionsLoading ? (
                <div className="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/5 animate-pulse h-12" />
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                  <Target className="w-6 h-6 text-white/10 mx-auto mb-1.5" />
                  <p className="text-xs text-white/40">No questions found for this pattern</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                  {questions.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.04 }}
                    >
                      <Link
                        to={`/questions/${q.slug}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors leading-tight">{q.title}</p>
                          <p className="text-[10px] text-white/30 mt-0.5">{q.topic_name}</p>
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                          q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
