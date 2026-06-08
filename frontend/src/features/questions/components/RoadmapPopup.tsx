import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import ROADMAPS from '../data/roadmaps';
import type { Roadmap, RoadmapStep } from '../data/roadmaps';

const STEPS_PER_ROW = 5;

export default function RoadmapPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<Roadmap | null>(null);

  const getRows = (): RoadmapStep[][] => {
    if (!selected) return [];
    const rows: RoadmapStep[][] = [];
    for (let i = 0; i < selected.steps.length; i += STEPS_PER_ROW) {
      rows.push(selected.steps.slice(i, i + STEPS_PER_ROW));
    }
    return rows;
  };

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
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden sm:rounded-2xl rounded-none border border-white/10 shadow-2xl"
            style={{ backgroundColor: '#0f172a', scrollbarWidth: 'thin' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10" style={{ backgroundColor: '#0f172a' }}>
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
                      <p className="text-[10px] text-white/30 mt-1 line-clamp-2">{roadmap.subtitle}</p>
                    </motion.button>
                  ))}
                </div>
              ) : (
                /* Horizontal Winding Road Layout */
                <div className="space-y-0">
                  {getRows().map((row, rowIndex) => {
                    const isReversed = rowIndex % 2 === 1;
                    const displayRow = isReversed ? [...row].reverse() : row;
                    return (
                      <div key={rowIndex} className="relative">
                        {/* Horizontal road line for this row */}
                        <div
                          className="absolute top-[22px] left-0 right-0 h-[3px] rounded-full -z-0"
                          style={{ backgroundColor: `${selected.color}15` }}
                        />
                        {/* Row container */}
                        <div className={`flex items-start ${isReversed ? 'flex-row-reverse' : ''}`}>
                          {displayRow.map((step, colIndex) => (
                            <div key={step.num} className="flex-1 relative">
                              {/* Connector arrows between steps */}
                              {colIndex > 0 && (
                                <div
                                  className={`absolute top-[22px] ${isReversed ? 'right-full' : 'left-full'} w-full h-[3px] z-0`}
                                  style={{ backgroundColor: `${selected.color}30` }}
                                >
                                  <div
                                    className={`absolute top-1/2 -translate-y-1/2 ${isReversed ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} w-0 h-0`}
                                    style={{
                                      borderTop: '5px solid transparent',
                                      borderBottom: '5px solid transparent',
                                      [isReversed ? 'borderRight' : 'borderLeft']: `8px solid ${selected.color}50`,
                                    }}
                                  />
                                </div>
                              )}

                              {/* Vertical connector to next row */}
                              {colIndex === row.length - 1 && rowIndex < getRows().length - 1 && (
                                <div
                                  className={`absolute top-[22px] ${isReversed ? 'left-[22px]' : 'right-[22px]'} w-[3px] h-10 z-0`}
                                  style={{ backgroundColor: `${selected.color}30` }}
                                />
                              )}

                              {/* Step content */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (rowIndex * STEPS_PER_ROW + colIndex) * 0.04, duration: 0.3 }}
                                className="flex flex-col items-center text-center px-1"
                              >
                                {/* Icon box */}
                                <div
                                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl border-2 mb-2 shadow-lg relative z-10"
                                  style={{
                                    backgroundColor: `${selected.color}15`,
                                    borderColor: `${selected.color}40`,
                                    boxShadow: `0 0 15px ${selected.color}20`,
                                  }}
                                >
                                  {step.icon}
                                </div>

                                {/* Number badge */}
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white -mt-4 relative z-20 border-2"
                                  style={{
                                    backgroundColor: selected.color,
                                    borderColor: '#0f172a',
                                  }}
                                >
                                  {String(step.num).padStart(2, '0')}
                                </div>

                                {/* Title */}
                                <h4 className="text-[11px] sm:text-xs font-bold text-white mt-1.5 leading-tight">{step.title}</h4>
                                {/* Description */}
                                <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5 leading-relaxed max-w-[120px] sm:max-w-[140px]">{step.description}</p>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
