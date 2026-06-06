import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import type { Question } from '../types/question';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';

const diffBorder: Record<string, string> = {
  Easy: 'border-l-emerald-400',
  Medium: 'border-l-amber-400',
  Hard: 'border-l-rose-400',
};

const diffPill: Record<string, string> = {
  Easy: 'bg-emerald-400/20 text-emerald-300',
  Medium: 'bg-amber-400/20 text-amber-300',
  Hard: 'bg-rose-400/20 text-rose-300',
};

export default function QuestionCard({ question, index }: { question: Question; index: number }) {
  const isPremium = subscriptionStorage.isPremiumSync();
  const isLocked = !isPremium && question.difficulty !== 'Easy';
  const borderColor = diffBorder[question.difficulty] || diffBorder.Easy;
  const pillColor = diffPill[question.difficulty] || diffPill.Easy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link
        to={isLocked ? '/pricing' : `/questions/${question.slug}`}
        className={`block bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 border-l-4 ${borderColor} hover:bg-white/15 hover:border-white/25 transition-all duration-300 group ${isLocked ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-xs font-mono text-white/30 w-7 shrink-0">{String(index + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${isLocked ? 'text-white/40' : 'text-white group-hover:text-white transition-colors'} truncate`}>
                  {question.title}
                </span>
                {isLocked && <Lock className="w-3 h-3 text-white/30 shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap">
                <span className={isLocked ? 'text-white/25' : 'text-white/40'}>{question.topic_name}</span>
                {question.pattern && (
                  <>
                    <span className="text-white/15">·</span>
                    <span className={isLocked ? 'text-white/25' : 'text-purple-400/70'}>{question.pattern}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isLocked ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/50">Premium</span>
            ) : (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pillColor}`}>{question.difficulty}</span>
            )}
            <ArrowRight className={`w-3.5 h-3.5 transition-all ${
              isLocked ? 'text-white/10' : 'text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5'
            }`} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
