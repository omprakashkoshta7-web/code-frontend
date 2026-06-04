import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play, Eye, Check, Gamepad2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Token {
  type: 'keyword' | 'function' | 'param' | 'property' | 'number' | 'string' | 'operator' | 'punct' | 'plain';
  text: string;
}

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const keywords = new Set(['function', 'for', 'const', 'let', 'if', 'return', 'new', 'else', 'while', 'class', 'import', 'export', 'from', 'var']);
  const regex = /(\$\{[^}]+\})|('[^']*')|("[^"]*")|(\b\d+\.?\d*\b)|([A-Za-z_$][A-Za-z0-9_$]*)|([{}()\[\];,.])|(==|!=|===|!==|=>|<=|>=|&&|\|\||[+\-*/%<>!]=?)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > lastIndex) {
      tokens.push({ type: 'plain', text: line.slice(lastIndex, m.index) });
    }
    const matched = m[0];
    if (m[1] !== undefined) {
      tokens.push({ type: 'string', text: matched });
    } else if (m[2] !== undefined || m[3] !== undefined) {
      tokens.push({ type: 'string', text: matched });
    } else if (m[4] !== undefined) {
      tokens.push({ type: 'number', text: matched });
    } else if (m[5] !== undefined) {
      if (keywords.has(matched)) {
        tokens.push({ type: 'keyword', text: matched });
      } else if (/^[A-Z]/.test(matched)) {
        tokens.push({ type: 'function', text: matched });
      } else if (m.index > 0 && line[m.index - 1] === '.') {
        tokens.push({ type: 'property', text: matched });
      } else {
        tokens.push({ type: 'param', text: matched });
      }
    } else if (m[6] !== undefined) {
      tokens.push({ type: 'punct', text: matched });
    } else if (m[7] !== undefined) {
      tokens.push({ type: 'operator', text: matched });
    }
    lastIndex = m.index + matched.length;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: 'plain', text: line.slice(lastIndex) });
  }
  return tokens;
}

const tokenColor: Record<Token['type'], string> = {
  keyword: 'text-purple-300',
  function: 'text-cyan-300',
  param: 'text-slate-200',
  property: 'text-cyan-300',
  number: 'text-amber-300',
  string: 'text-emerald-300',
  operator: 'text-pink-300',
  punct: 'text-slate-400',
  plain: 'text-slate-300',
};

const codeLines = [
  { indent: 0, text: 'function twoSum(nums, target) {' },
  { indent: 1, text: 'const map = new Map();' },
  { indent: 1, text: 'for (let i = 0; i < nums.length; i++) {' },
  { indent: 2, text: 'const complement = target - nums[i];' },
  { indent: 2, text: 'if (map.has(complement)) {' },
  { indent: 3, text: 'return [map.get(complement), i];' },
  { indent: 2, text: '}' },
  { indent: 2, text: 'map.set(nums[i], i);' },
  { indent: 1, text: '}' },
  { indent: 0, text: '}' },
];

const vars = [
  { name: 'nums', value: '[2,7,11,15]', color: 'text-amber-300' },
  { name: 'target', value: '9', color: 'text-amber-300' },
  { name: 'map', value: '{2: 0, 7: 1}', color: 'text-emerald-300' },
  { name: 'i', value: '1', color: 'text-cyan-300' },
];

function CodeCube({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c6cf6" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c6cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* top */}
      <polygon points="30,4 54,18 30,32 6,18" fill="url(#cubeTop)" />
      {/* left */}
      <polygon points="6,18 30,32 30,56 6,42" fill="url(#cubeLeft)" />
      {/* right */}
      <polygon points="54,18 30,32 30,56 54,42" fill="url(#cubeRight)" />
      {/* edges */}
      <polyline points="6,18 30,32 54,18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="30" y1="32" x2="30" y2="56" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    </svg>
  );
}

export default function HeroSection() {
  const [activeLine, setActiveLine] = useState(5);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveLine((prev) => (prev + 1) % codeLines.length);
    }, 1400);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <section className="relative pb-12 overflow-hidden">
      {/* Fixed top background — covers navbar area + blends into hero, behind everything */}
      <div className="fixed top-0 left-0 right-0 h-[400px] -z-10 pointer-events-none bg-gradient-to-b from-[#0B1020] via-[#1a1140] to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1020] via-[#1a1140] to-[#0B1020]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(168,85,247,0.10) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-[260px] h-[260px] bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Bottom fade gradient to blend hero into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0B1020] via-[#0B1020] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:pb-40 pt-20 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs sm:text-sm font-medium mb-5 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Free Access for All Questions
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 sm:mb-6">
              Master{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
                Coding Patterns
              </span>
              <br />
              Faster Than Ever
            </h1>

            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-lg leading-relaxed">
              Stop watching hour-long videos. Get concise, pattern-based cheat sheets for 500+ coding questions with interview-focused notes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
              <Link
                to="/questions"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-white font-semibold hover:opacity-95 transition-all shadow-lg shadow-primary-600/30 text-sm"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/games"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all text-sm"
              >
                <Gamepad2 className="w-4 h-4" /> Start Games Test
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 sm:gap-6 gap-y-2 text-xs sm:text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                500+ questions free
              </span>
            </div>
          </motion.div>

          {/* Right side: Code editor with 3D decorations */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-[340px] sm:h-[400px] lg:h-[480px] mt-4 sm:mt-6 lg:mt-0 overflow-hidden sm:overflow-visible"
          >
            {/* 3D-styled purple code window BEHIND the main card — tilted, with traffic lights + code lines */}
            <motion.div
              className="absolute -top-2 right-2 sm:-right-2 lg:-right-8 w-[78%] sm:w-[80%] lg:w-[82%] h-[78%] z-10 pointer-events-none"
              style={{ transform: 'rotateY(-18deg) rotateX(8deg)', transformOrigin: '20% 80%' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-full h-full rounded-2xl border border-white/10 p-3 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-2.5 lg:gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.55) 0%, rgba(91,33,182,0.45) 50%, rgba(76,29,149,0.55) 100%)',
                  boxShadow: '0 25px 60px -10px rgba(124,108,246,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {/* traffic lights */}
                <div className="flex gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/45" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/45" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/45" />
                </div>
                {/* code lines */}
                {[0.9, 0.7, 0.85, 0.55, 0.75, 0.5].map((w, i) => (
                  <div key={i} className="h-1.5 sm:h-2 rounded-full bg-white/30" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            </motion.div>

            {/* Top-right 3D cube */}
            <motion.div
              className="absolute -top-5 -right-1 sm:-top-6 sm:-right-1 lg:-top-8 lg:-right-2 w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 z-20"
              animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 24px rgba(167,139,250,0.85))' }}
            >
              <CodeCube className="w-full h-full" />
            </motion.div>

            {/* Diagonal stripes pattern top-right (above the 3D window) */}
            <div
              className="absolute top-0 right-0 w-32 h-32 sm:w-44 sm:h-44 z-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(167,139,250,0.28) 0 1.5px, transparent 1.5px 12px)',
                maskImage: 'radial-gradient(circle at 100% 0%, black, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(circle at 100% 0%, black, transparent 75%)',
              }}
            />

            {/* Floating DSA-style words emerging from the 3D purple code window */}
            {([
              { word: 'DSA', top: '2%', right: '4%', delay: 0.2, size: 'text-[10px] sm:text-sm lg:text-base', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-400/30', glow: 'rgba(251,191,36,0.5)' },
              { word: 'DP', top: '-3%', right: '30%', delay: 1.2, size: 'text-[11px] sm:text-base lg:text-lg', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-400/30', glow: 'rgba(52,211,153,0.5)' },
              { word: 'Graph', bottom: '24%', right: '4%', delay: 1.7, size: 'text-[10px] sm:text-sm', color: 'text-cyan-300', bg: 'bg-cyan-500/15', border: 'border-cyan-400/30', glow: 'rgba(34,211,238,0.5)' },
              { word: 'Tree', bottom: '4%', right: '14%', delay: 2.2, size: 'text-[10px] sm:text-sm lg:text-base', color: 'text-violet-300', bg: 'bg-violet-500/15', border: 'border-violet-400/30', glow: 'rgba(167,139,250,0.5)' },
              { word: 'Hash', top: '50%', right: '2%', delay: 2.7, size: 'text-[10px] sm:text-sm', color: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-400/30', glow: 'rgba(251,113,133,0.5)' },
              { word: 'Recursion', top: '24%', right: '2%', delay: 0.7, size: 'text-[10px] sm:text-sm', color: 'text-pink-300', bg: 'bg-pink-500/15', border: 'border-pink-400/30', glow: 'rgba(244,114,182,0.5)' },
            ] as Array<{ word: string; top?: string; right?: string; bottom?: string; left?: string; delay: number; size: string; color: string; bg: string; border: string; glow: string }>).map(({ word, top, right, bottom, left, delay, size, color, bg, border, glow }) => (
              <motion.div
                key={word}
                className={`absolute z-20 px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full ${bg} ${border} ${color} font-mono font-bold backdrop-blur-sm ${size}`}
                style={{ top, right, bottom, left, boxShadow: `0 0 20px ${glow}` }}
                initial={{ opacity: 0, scale: 0.4, y: 10 }}
                animate={{
                  opacity: [0, 1, 1, 1],
                  scale: [0.4, 1.1, 1, 1],
                  y: [10, -4, 0, -3, 0],
                }}
                transition={{
                  duration: 6,
                  delay,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: 'easeInOut',
                }}
              >
                {word}
              </motion.div>
            ))}

            {/* Connecting wire from top-right to card — hidden on mobile */}
            <svg className="hidden sm:block absolute -top-2 right-0 w-72 h-44 z-15 pointer-events-none" viewBox="0 0 288 176" fill="none">
              <motion.path
                d="M 256 24 Q 180 100, 130 70"
                stroke="url(#wireGrad)"
                strokeWidth="1.8"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="wireGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Bottom wire — hidden on mobile */}
            <svg className="hidden sm:block absolute bottom-0 left-0 w-72 h-44 z-15 pointer-events-none" viewBox="0 0 288 176" fill="none">
              <motion.path
                d="M 200 150 Q 100 100, 40 30"
                stroke="url(#wireGrad2)"
                strokeWidth="1.8"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="wireGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Bottom-center 3D cube — hidden on smallest screens */}
            <motion.div
              className="hidden sm:block absolute -bottom-4 left-1/3 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 z-20"
              animate={{ y: [0, 5, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.75))' }}
            >
              <CodeCube className="w-full h-full" />
            </motion.div>

            {/* Diagonal stripes pattern bottom-right */}
            <div
              className="absolute bottom-4 right-4 w-32 h-32 sm:w-40 sm:h-40 z-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(167,139,250,0.25) 0 1.5px, transparent 1.5px 12px)',
                maskImage: 'radial-gradient(circle at 100% 100%, black, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(circle at 100% 100%, black, transparent 75%)',
              }}
            />

            {/* Dotted grid bottom-right */}
            <div
              className="absolute bottom-8 right-8 w-24 h-24 sm:w-28 sm:h-28 z-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 3px 3px, rgba(167,139,250,0.5) 1.2px, transparent 0)',
                backgroundSize: '10px 10px',
                maskImage: 'radial-gradient(circle at 100% 100%, black, transparent 60%)',
                WebkitMaskImage: 'radial-gradient(circle at 100% 100%, black, transparent 60%)',
              }}
            />

            {/* Outer glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-primary-500/20 via-violet-500/15 to-transparent rounded-3xl blur-2xl -z-10" />

            {/* Main code editor card — sits in front of the 3D purple window */}
            <div
              className="absolute top-8 sm:top-10 lg:top-12 left-0 w-[78%] h-[280px] sm:h-[330px] lg:h-[380px] z-30 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-900/40"
              style={{ backgroundColor: '#0d0f1f' }}
            >
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/5" style={{ backgroundColor: '#11142a' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 ml-2 sm:ml-3 font-mono truncate">two-sum.js</span>
                </div>
                <span className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 font-medium shrink-0">
                  HashMap
                </span>
              </div>

              {/* Code area */}
              <div className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-[11px] sm:text-[13px] leading-[1.6] sm:leading-[1.7] overflow-hidden">
                {codeLines.map((line, i) => {
                  const tokens = tokenize(line.text);
                  const isActive = i === activeLine;
                  return (
                    <div
                      key={i}
                      className={`flex items-center rounded-md transition-all duration-300 ${
                        isActive
                          ? 'bg-primary-500/15 ring-1 ring-primary-500/30'
                          : 'ring-1 ring-transparent'
                      }`}
                      style={{ paddingLeft: `${line.indent * 14 + 4}px`, paddingRight: '4px' }}
                    >
                      <span className={`w-5 sm:w-7 text-right mr-2 sm:mr-3 select-none text-[10px] sm:text-xs ${isActive ? 'text-primary-300/80' : 'text-slate-600'}`}>
                        {i + 1}
                      </span>
                      <span className="whitespace-pre overflow-hidden text-ellipsis">
                        {tokens.map((tok, ti) => (
                          <span key={ti} className={tokenColor[tok.type]}>
                            {tok.text}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom bar: step indicator + variables */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/5" style={{ backgroundColor: '#11142a' }}>
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center hover:bg-primary-500/30 transition-colors"
                    >
                      {isPlaying ? (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-300 rounded-sm" />
                      ) : (
                        <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary-300 ml-0.5" />
                      )}
                    </button>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">
                      Step <span className="text-primary-300 font-semibold">{activeLine + 1}</span>/{codeLines.length}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Execution
                  </div>
                </div>
                <div className="px-3 sm:px-4 pb-2 sm:pb-2.5 pt-0.5 sm:pt-1 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 font-mono text-[10px] sm:text-[11px]">
                  {vars.map((v) => (
                    <div key={v.name}>
                      <span className="text-slate-500">{v.name} = </span>
                      <span className={v.color}>{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
