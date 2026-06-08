import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Layers, Hash, Target, GitBranch, Network, Zap, Puzzle, RefreshCw, Maximize2, CircleDot, MoveVertical, Link2, Database, Trello, Braces, Code2, BookOpen, Sparkles, ArrowRight, Filter } from 'lucide-react';
import SEO, { buildBreadcrumbJsonLd } from '@/shared/components/SEO';

const patternIcons: Record<string, any> = {
  'HashMap Lookup': Hash, 'Hash Set': Hash, 'HashMap': Hash, 'Dual HashMap': Hash,
  'Two Pointers': Target, 'Two Pointer Gap': Target, 'Three Pointers': Target,
  'Sliding Window': Maximize2, 'Monotonic Stack': Layers, 'Monotonic Deque': Layers,
  'Stack': Layers, 'Stack Matching': Layers, 'Stack Simulation': Layers,
  'DFS': GitBranch, 'DFS + Recursion': GitBranch, 'DFS / BFS': GitBranch,
  'BFS': Network, 'BFS Multi-source': Network, 'BFS Shortest Path': Network,
  'Dynamic Programming': Puzzle, 'Backtracking': RefreshCw,
  'Greedy': Zap, 'Greedy + Heap': Zap,
  'Min Heap': Trello, 'Max Heap': Trello, 'Two Heaps': Trello,
  'Binary Search': CircleDot,
  'Kadane\'s Algorithm': Zap, 'Prefix Sum': BookOpen,
  'Fast & Slow Pointer': MoveVertical, 'Iterative Pointers': Link2,
  'Sorting': Layers, 'Cyclic Sort': RefreshCw,
  'Queue': MoveVertical, 'Deque': MoveVertical,
  'Merge Sort': GitBranch, 'Topological Sort': Network,
  'Inorder Traversal': GitBranch, 'Recursive Generation': RefreshCw,
};

const patternCategories: Record<string, { color: string; desc: string }> = {
  'Array': { color: 'from-blue-500 to-cyan-500', desc: 'Patterns for array manipulation and traversal' },
  'HashMap': { color: 'from-violet-500 to-purple-500', desc: 'Patterns using hash-based data structures' },
  'Two Pointers': { color: 'from-emerald-500 to-teal-500', desc: 'Patterns using two pointers for linear traversal' },
  'Sliding Window': { color: 'from-purple-500 to-indigo-500', desc: 'Patterns for contiguous subarray/window problems' },
  'Stack': { color: 'from-amber-500 to-orange-500', desc: 'Patterns using stack for nested/sequential processing' },
  'Queue': { color: 'from-cyan-500 to-sky-500', desc: 'Patterns using queue/deque for ordered processing' },
  'Heap': { color: 'from-fuchsia-500 to-pink-500', desc: 'Patterns using priority queues for k-th/streaming' },
  'DFS': { color: 'from-rose-500 to-pink-500', desc: 'Depth-first traversal for trees and graphs' },
  'BFS': { color: 'from-sky-500 to-blue-500', desc: 'Breadth-first traversal for shortest path/level order' },
  'DP': { color: 'from-primary-500 to-indigo-600', desc: 'Dynamic programming for optimal substructure' },
  'Greedy': { color: 'from-lime-500 to-green-500', desc: 'Greedy algorithms for locally optimal choices' },
  'Backtracking': { color: 'from-fuchsia-500 to-purple-500', desc: 'Recursive exploration with backtracking' },
  'Sorting': { color: 'from-teal-500 to-emerald-500', desc: 'Patterns based on sorting and ordering' },
  'Linked List': { color: 'from-pink-500 to-rose-500', desc: 'Patterns for linked list manipulation' },
  'Tree': { color: 'from-green-500 to-emerald-500', desc: 'Patterns for binary tree traversal and operations' },
  'Graph': { color: 'from-indigo-500 to-blue-500', desc: 'Patterns for graph traversal and algorithms' },
  'Design': { color: 'from-yellow-500 to-amber-500', desc: 'Design patterns for data structures' },
  'Other': { color: 'from-gray-500 to-slate-400', desc: 'Other algorithmic patterns' },
};

function categorizePattern(name: string): string {
  if (name.includes('HashMap') || name.includes('Hash Set') || name.includes('Hash')) return 'HashMap';
  if (name.includes('Two Pointer') || name.includes('Three Pointer') || name.includes('Pointer Gap')) return 'Two Pointers';
  if (name.includes('Sliding Window')) return 'Sliding Window';
  if (name.includes('Stack')) return 'Stack';
  if (name.includes('Queue') || name.includes('Deque')) return 'Queue';
  if (name.includes('Heap') || name.includes('Min Heap') || name.includes('Max Heap') || name.includes('Heaps')) return 'Heap';
  if (name.includes('DFS')) return 'DFS';
  if (name.includes('BFS')) return 'BFS';
  if (name.includes('Dynamic') || name.includes('DP')) return 'DP';
  if (name.includes('Backtracking')) return 'Backtracking';
  if (name.includes('Greedy')) return 'Greedy';
  if (name.includes('Sort')) return 'Sorting';
  if (name.includes('Iterative') || name.includes('Fast & Slow') || name.includes('Floyd') || name.includes('Reverse') || name.includes('Reversal') || name.includes('Merge Sort')) return 'Linked List';
  if (name.includes('Inorder') || name.includes('Recursive') || name.includes('BST') || name.includes('Tree')) return 'Tree';
  if (name.includes('Dijkstra') || name.includes('Topological') || name.includes('Union-Find') || name.includes('Tarjan') || name.includes('Euler')) return 'Graph';
  if (name.includes('Design') || name.includes('LRU') || name.includes('LFU')) return 'Design';
  if (name.includes('Kadane') || name.includes('Prefix Sum') || name.includes('Cyclic') || name.includes('Binary Search')) return 'Array';
  return 'Other';
}

export default function PatternsPage() {
  return (
    <>
      <SEO
        title="Coding Patterns - Sliding Window, Two Pointers, DP & More"
        description="Master 16+ coding patterns including sliding window, two pointers, binary search, dynamic programming, BFS, DFS, backtracking, greedy and more. Each pattern includes cheat sheet, recognition signals, time complexity and code templates."
        path="/patterns"
        keywords={['sliding window', 'two pointers', 'binary search', 'dynamic programming', 'BFS', 'DFS', 'backtracking', 'greedy', 'monotonic stack', 'heap', 'trie', 'union find', 'graph patterns']}
        jsonLd={buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Patterns', url: '/patterns' }])}
      />
      <PatternsContent />
    </>
  );
}

function PatternsContent() {
  const [patterns, setPatterns] = useState<{ name: string; count: number; questions: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then(data => {
        const grouped: Record<string, any[]> = {};
        data.forEach((q: any) => {
          const p = q.pattern || 'Uncategorized';
          if (!grouped[p]) grouped[p] = [];
          grouped[p].push(q);
        });
        const sorted = Object.entries(grouped)
          .map(([name, questions]) => ({ name, count: questions.length, questions }))
          .sort((a, b) => b.count - a.count);
        setPatterns(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = searchQuery.length >= 2
    ? patterns.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : patterns;

  const groupedByCategory: Record<string, typeof filtered> = {};
  filtered.forEach(p => {
    const cat = categorizePattern(p.name);
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(p);
  });

  const categoryOrder = ['Array', 'HashMap', 'Two Pointers', 'Sliding Window', 'Stack', 'Queue', 'Heap', 'DFS', 'BFS', 'DP', 'Greedy', 'Backtracking', 'Sorting', 'Linked List', 'Tree', 'Graph', 'Design', 'Other'];

  const availableCategories = ['All', ...categoryOrder.filter(c => groupedByCategory[c] && groupedByCategory[c].length > 0)];

  const displayedCategories = activeCategory === 'All' ? categoryOrder : [activeCategory];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #14091f 50%, #0a0a1a 100%)' }}>
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-teal-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="fixed top-32 right-10 w-20 h-20 border border-emerald-500/15 rounded-2xl rotate-12 opacity-30 hidden lg:block" />
      <div className="fixed bottom-40 left-10 w-16 h-16 border border-teal-500/15 rounded-xl -rotate-6 opacity-30 hidden lg:block" />

      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 sm:pb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 w-full">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                  <Layers className="w-4 h-4" /> DSA Patterns
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
              >
                <span className="text-white">Master </span>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Patterns</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed"
              >
                Learn algorithmic patterns to solve any coding problem. Each pattern includes multiple practice questions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-7"
              >
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search patterns..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                {[
                  { label: 'Patterns', value: patterns.length, color: 'text-emerald-400' },
                  { label: 'Questions', value: patterns.reduce((s, p) => s + p.count, 0), color: 'text-blue-400' },
                  { label: 'Categories', value: availableCategories.length - 1, color: 'text-violet-400' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                    <span className={`text-sm font-bold ${s.color}`}>{s.value}+</span>
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
              <img src="/patterns-hero.png" alt="DSA Patterns" className="w-full h-auto drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center pb-6">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
      </section>

      {!loading && availableCategories.length > 1 && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <Filter className="w-4 h-4 text-white/30 shrink-0" />
            {availableCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 space-y-10 sm:space-y-12 lg:space-y-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse">
                <div className="w-10 h-10 bg-white/10 rounded-xl mb-4" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/40 font-medium">No patterns found</p>
            <p className="text-white/20 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          displayedCategories.map(cat => {
            const items = groupedByCategory[cat];
            if (!items || items.length === 0) return null;
            const meta = patternCategories[cat] || patternCategories['Other'];
            const Icon = patternIcons[items[0]?.name] || Layers;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-white">{cat}</h2>
                      <span className="text-xs text-white/30 font-mono">{items.length}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/40 truncate">{meta.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {items.map((pattern, i) => {
                    const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
                    pattern.questions.forEach((q: { difficulty: string }) => {
                      if (['Easy', 'Medium', 'Hard'].includes(q.difficulty)) diffCounts[q.difficulty as keyof typeof diffCounts]++;
                    });
                    const hasEasy = diffCounts.Easy > 0;
                    const hasMedium = diffCounts.Medium > 0;
                    const hasHard = diffCounts.Hard > 0;

                    return (
                      <motion.div
                        key={pattern.name}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
                          to={`/patterns/${encodeURIComponent(pattern.name)}`}
                          className="block p-5 rounded-2xl bg-[#0d0f1f] border border-white/[0.06] hover:bg-[#111827] hover:border-white/[0.12] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-md`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-mono text-white/30 px-1.5 py-0.5 rounded bg-white/[0.04]">{pattern.count} Q</span>
                          </div>
                          <h3 className="font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors text-sm">{pattern.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {hasEasy && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">E</span>}
                              {hasMedium && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">M</span>}
                              {hasHard && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20">H</span>}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </section>
    </div>
  );
}
