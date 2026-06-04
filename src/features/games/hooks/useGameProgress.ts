import { useCallback, useEffect, useState } from 'react';
import type { Difficulty } from '../data/gamesData';

const STORAGE_KEY = 'codesprout_game_progress_v1';

export interface LevelResult {
  score: number;
  total: number;
  best: number;
  completedAt: number;
  perfect: boolean;
}

export interface TopicProgress {
  easy?: LevelResult;
  medium?: LevelResult;
  hard?: LevelResult;
}

export interface GameProgress {
  topics: Record<string, TopicProgress>;
  stickers: string[];
  badges: string[];
  streak: { count: number; lastDate: string };
  totalXp: number;
  perfectLevels: number;
}

const empty: GameProgress = {
  topics: {},
  stickers: [],
  badges: [],
  streak: { count: 0, lastDate: '' },
  totalXp: 0,
  perfectLevels: 0,
};

function read(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed, streak: { ...empty.streak, ...(parsed.streak || {}) } };
  } catch { return { ...empty }; }
}

function write(p: GameProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

function today() { return new Date().toDateString(); }

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(() => read());

  useEffect(() => { write(progress); }, [progress]);

  const getLevel = useCallback((topic: string, level: Difficulty): LevelResult | undefined => {
    return progress.topics[topic]?.[level];
  }, [progress]);

  const isLevelUnlocked = useCallback((topic: string, level: Difficulty): boolean => {
    if (level === 'easy') return true;
    if (level === 'medium') {
      const easy = getLevel(topic, 'easy');
      return !!easy && easy.score / easy.total >= 0.6;
    }
    const med = getLevel(topic, 'medium');
    return !!med && med.score / med.total >= 0.6;
  }, [getLevel]);

  const saveLevel = useCallback((
    topic: string,
    level: Difficulty,
    score: number,
    total: number,
    stickersEarned: string[],
    badgesEarned: string[],
  ) => {
    setProgress((prev) => {
      const next: GameProgress = { ...prev, topics: { ...prev.topics }, stickers: [...prev.stickers], badges: [...prev.badges] };
      const prevTopic = next.topics[topic] || {};
      const prevLevel = prevTopic[level];
      const perfect = score === total;
      const newResult: LevelResult = {
        score: Math.max(prevLevel?.score || 0, score),
        total,
        best: Math.max(prevLevel?.best || 0, score),
        completedAt: Date.now(),
        perfect: perfect || !!prevLevel?.perfect,
      };
      next.topics[topic] = { ...prevTopic, [level]: newResult };

      for (const s of stickersEarned) if (!next.stickers.includes(s)) next.stickers.push(s);
      for (const b of badgesEarned) if (!next.badges.includes(b)) next.badges.push(b);

      const xpGain = score * 10 + (perfect ? 50 : 0);
      next.totalXp = (next.totalXp || 0) + xpGain;
      if (perfect && !prevLevel?.perfect) next.perfectLevels = (next.perfectLevels || 0) + 1;

      const lastDate = next.streak.lastDate;
      const todayStr = today();
      if (lastDate !== todayStr) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        next.streak = {
          count: lastDate === yesterday ? next.streak.count + 1 : 1,
          lastDate: todayStr,
        };
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => { setProgress({ ...empty }); }, []);

  return {
    progress,
    getLevel,
    isLevelUnlocked,
    saveLevel,
    reset,
  };
}
