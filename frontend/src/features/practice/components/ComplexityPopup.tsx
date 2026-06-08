import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Lightbulb, TrendingUp, Cpu, Zap, AlertTriangle, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

interface ComplexityInfo {
  detected: string;
  reasoning: string;
  badge: 'optimal' | 'acceptable' | 'needs_optimization';
  space_complexity?: string;
  breakdown?: { label: string; complexity: string; lines: number[] }[];
  optimizations?: string[];
}

interface Props {
  show: boolean;
  onClose: () => void;
  complexity: ComplexityInfo | null;
  analyzing: boolean;
}

const badgeConfig = {
  optimal: { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: CheckCircle2 },
  acceptable: { label: 'Acceptable', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: AlertTriangle },
  needs_optimization: { label: 'Needs Optimization', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', icon: Zap },
};

// Complexity scale for visual bar
const complexityScale = [
  { label: 'O(1)', value: 1, color: 'bg-emerald-500' },
  { label: 'O(log n)', value: 2, color: 'bg-emerald-400' },
  { label: 'O(n)', value: 3, color: 'bg-teal-400' },
  { label: 'O(n log n)', value: 4, color: 'bg-amber-400' },
  { label: 'O(n²)', value: 5, color: 'bg-orange-500' },
  { label: 'O(2^n)', value: 6, color: 'bg-red-500' },
];

function getScaleValue(complexity: string): number {
  const c = complexity.toLowerCase().replace(/\s/g, '');
  if (c.startsWith('o(1)') || c.startsWith('o(1')) return 1;
  if (c.startsWith('o(log')) return 2;
  if (c.startsWith('o(n)') || c.startsWith('o(n)') && !c.includes('log') && !c.includes('²') && !c.includes('2')) return 3;
  if (c.includes('nlog') || c.includes('n log')) return 4;
  if (c.includes('n²') || c.includes('n^2')) return 5;
  if (c.includes('2^n') || c.includes('n!')) return 6;
  return 3;
}

export default function ComplexityPopup({ show, onClose, complexity, analyzing }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-[#111127] border border-slate-800/50 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Complexity Analysis</h2>
                  <p className="text-xs text-slate-500">Time & space complexity of your code</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800/60 transition"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                  <p className="text-sm text-slate-400">Analyzing your code...</p>
                </div>
              ) : complexity ? (
                <>
                  {/* Main complexity badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2"><Cpu className="w-3.5 h-3.5" /> Time Complexity</div>
                      <div className="text-2xl font-bold font-mono text-white">{complexity.detected}</div>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2"><Layers className="w-3.5 h-3.5" /> Space Complexity</div>
                      <div className="text-2xl font-bold font-mono text-white">{complexity.space_complexity || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Badge */}
                  {(() => {
                    const cfg = badgeConfig[complexity.badge] || badgeConfig.acceptable;
                    const Icon = cfg.icon;
                    return (
                      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400 ml-1">{complexity.reasoning}</span>
                      </div>
                    );
                  })()}

                  {/* Complexity scale graph */}
                  <div>
                    <div className="text-xs text-slate-500 mb-3 font-medium">COMPLEXITY SCALE</div>
                    <div className="relative h-8 bg-slate-800/60 rounded-xl overflow-hidden flex">
                      {complexityScale.map((s, i) => {
                        const val = getScaleValue(complexity.detected);
                        const isAtOrBelow = i <= val - 1;
                        return (
                          <div key={s.label} className={`flex-1 flex items-center justify-center text-[10px] font-bold transition-colors ${i === val - 1 ? `${s.color} text-white` : isAtOrBelow ? 'bg-slate-700/40 text-white/40' : 'text-white/20'}`}>
                            {s.label}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5 px-1">
                      <span className="text-[10px] text-emerald-400 font-medium">Fast</span>
                      <span className="text-[10px] text-red-400 font-medium">Slow</span>
                    </div>
                  </div>

                  {/* Breakdown bars */}
                  {complexity.breakdown && complexity.breakdown.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 mb-3 font-medium">COMPLEXITY BREAKDOWN</div>
                      <div className="space-y-2.5">
                        {complexity.breakdown.map((b, i) => {
                          const val = getScaleValue(b.complexity);
                          const scaleItem = complexityScale[val - 1] || complexityScale[3];
                          const pct = (val / complexityScale.length) * 100;
                          return (
                            <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{b.label}</span>
                                <span className="text-xs font-mono font-bold text-slate-300">{b.complexity}</span>
                              </div>
                              <div className="h-5 bg-slate-800/80 rounded-lg overflow-hidden">
                                <div className={`h-full rounded-lg ${scaleItem.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Optimization suggestions */}
                  {complexity.optimizations && complexity.optimizations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> OPTIMIZATION SUGGESTIONS
                      </div>
                      <div className="space-y-2">
                        {complexity.optimizations.map((opt, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <p className="text-sm text-slate-300">{opt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No analysis data</p>
                </div>
              )}
            </div>

            {complexity && (
              <div className="p-4 border-t border-slate-800/50">
                <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition shadow-lg shadow-purple-500/25">
                  Got it
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
