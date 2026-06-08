import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import ROADMAPS from '../data/roadmaps';
import type { Roadmap } from '../data/roadmaps';

export default function RoadmapPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<Roadmap | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { setSelected(null); onClose(); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden sm:rounded-2xl rounded-none border border-white/10 shadow-2xl"
            style={{ backgroundColor: '#0a0e1a', scrollbarWidth: 'thin' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10" style={{ backgroundColor: '#0a0e1a' }}>
              <div className="flex items-center gap-3">
                {selected ? (
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <span className="text-white text-sm">🗺️</span>
                  </span>
                )}
                <h2 className="text-base sm:text-lg font-bold text-white">{selected ? selected.title : 'Programming Roadmaps'}</h2>
              </div>
              <button onClick={() => { setSelected(null); onClose(); }} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              {!selected ? (
                /* Roadmap selection grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ROADMAPS.map((roadmap, i) => (
                    <motion.button
                      key={roadmap.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelected(roadmap)}
                      className="text-left p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group"
                      style={{ borderColor: `${roadmap.color}20` }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${roadmap.color}20` }}>
                          {roadmap.steps[0]?.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white group-hover:text-white/90 transition-colors">{roadmap.title}</h3>
                          <p className="text-[10px] text-white/40">{roadmap.steps.length} steps</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {roadmap.steps.slice(0, 4).map((s, j) => (
                          <div key={j} className="px-2 py-0.5 rounded text-[9px] text-white/40 border border-white/5">{s.title}</div>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                /* Winding Road Layout */
                <div className="relative ml-4 sm:ml-8 mr-4 sm:mr-8">
                  {/* Vertical dashed road line */}
                  <div
                    className="absolute left-0 sm:left-6 top-0 bottom-0 w-0 border-l-[3px] border-dashed -translate-x-1/2 sm:translate-x-0"
                    style={{ borderColor: selected.color }}
                  />

                  {/* Steps */}
                  <div className="space-y-2">
                    {selected.steps.map((step, i) => {
                      const isLeft = step.side === 'left';
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.3 }}
                          className="relative flex items-start"
                        >
                          {/* Connector line from road to box */}
                          <div
                            className="absolute top-5 h-0.5 hidden sm:block"
                            style={{
                              left: '24px',
                              width: '32px',
                              backgroundColor: `${selected.color}40`,
                            }}
                          />

                          {/* Milestone circle on road */}
                          <div className="absolute top-3 left-0 sm:left-6 -translate-x-1/2 sm:translate-x-0 z-10">
                            <div
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl border-2 shadow-lg"
                              style={{
                                backgroundColor: '#0a0e1a',
                                borderColor: selected.color,
                                boxShadow: `0 0 20px ${selected.color}30`,
                              }}
                            >
                              {step.icon}
                            </div>
                          </div>

                          {/* Category box */}
                          <div className={`ml-14 sm:ml-24 w-full sm:w-[calc(100%-80px)] ${isLeft ? '' : ''}`}>
                            <div
                              className="rounded-xl border overflow-hidden bg-[#0f1429]"
                              style={{ borderColor: `${selected.color}30` }}
                            >
                              {/* Box header */}
                              <div
                                className="px-4 py-2 flex items-center justify-between"
                                style={{ backgroundColor: `${selected.color}15` }}
                              >
                                <span className="text-xs sm:text-sm font-bold text-white">{step.title}</span>
                                <span className="text-[10px] text-white/30 font-mono">Step {i + 1}</span>
                              </div>
                              {/* Box items */}
                              <div className="p-3 flex flex-wrap gap-1.5">
                                {step.items.map((item, j) => (
                                  <span
                                    key={j}
                                    className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium border"
                                    style={{
                                      backgroundColor: `${selected.color}08`,
                                      borderColor: `${selected.color}20`,
                                      color: `${selected.color}cc`,
                                    }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* End milestone */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: selected.steps.length * 0.06 + 0.2, type: 'spring' }}
                    className="relative flex justify-start mt-4"
                  >
                    <div className="ml-0 sm:ml-6 -translate-x-1/2 sm:translate-x-0">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2"
                        style={{
                          backgroundColor: `${selected.color}20`,
                          borderColor: selected.color,
                          boxShadow: `0 0 30px ${selected.color}40`,
                        }}
                      >
                        🏆
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
