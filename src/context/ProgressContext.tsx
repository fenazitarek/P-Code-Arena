import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { lessons } from '../data/curriculum';
import { problems } from '../data/problems';
import type { Activity, Lesson, Problem, ProgressState } from '../data/types';
import { defaultProgress, getLevel, getLevelProgress, loadProgress, PROGRESS_KEY } from '../lib/progress';

interface ProgressContextValue {
  progress: ProgressState;
  xp: number;
  level: ReturnType<typeof getLevel>;
  levelProgress: ReturnType<typeof getLevelProgress>;
  completeLesson: (lesson: Lesson) => boolean;
  completeProblem: (problem: Problem) => boolean;
  setDisplayName: (name: string) => void;
  saveArenaTime: (problemId: string, seconds: number) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function activityId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      return;
    }
  }, [progress]);

  const xp = useMemo(() => {
    const lessonXp = progress.completedLessons.length * 10;
    const problemXp = progress.completedProblems.reduce((total, id) => {
      return total + (problems.find((problem) => problem.id === id)?.xp ?? 0);
    }, 0);
    return lessonXp + problemXp;
  }, [progress.completedLessons, progress.completedProblems]);

  const completeLesson = useCallback((lesson: Lesson) => {
    if (progress.completedLessons.includes(lesson.id)) return false;
    const activity: Activity = {
      id: activityId(),
      type: 'lesson',
      title: lesson.title,
      xp: 10,
      completedAt: new Date().toISOString(),
    };
    setProgress((current) => ({
      ...current,
      completedLessons: [...current.completedLessons, lesson.id],
      activity: [activity, ...current.activity].slice(0, 12),
    }));
    return true;
  }, [progress.completedLessons]);

  const completeProblem = useCallback((problem: Problem) => {
    if (progress.completedProblems.includes(problem.id)) return false;
    const activity: Activity = {
      id: activityId(),
      type: 'problem',
      title: problem.title,
      xp: problem.xp,
      completedAt: new Date().toISOString(),
    };
    setProgress((current) => ({
      ...current,
      completedProblems: [...current.completedProblems, problem.id],
      activity: [activity, ...current.activity].slice(0, 12),
    }));
    return true;
  }, [progress.completedProblems]);

  const setDisplayName = useCallback((name: string) => {
    const cleanName = name.trim().slice(0, 32) || 'Curious Coder';
    setProgress((current) => ({ ...current, displayName: cleanName }));
  }, []);

  const saveArenaTime = useCallback((problemId: string, seconds: number) => {
    setProgress((current) => {
      const previous = current.arenaBest[problemId];
      if (previous !== undefined && previous <= seconds) return current;
      return { ...current, arenaBest: { ...current.arenaBest, [problemId]: seconds } };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...defaultProgress, activity: [], completedLessons: [], completedProblems: [], arenaBest: {} });
  }, []);

  const value = useMemo<ProgressContextValue>(() => ({
    progress,
    xp,
    level: getLevel(xp),
    levelProgress: getLevelProgress(xp),
    completeLesson,
    completeProblem,
    setDisplayName,
    saveArenaTime,
    resetProgress,
  }), [progress, xp, completeLesson, completeProblem, setDisplayName, saveArenaTime, resetProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}

export function nextLesson(completedIds: string[]) {
  return lessons.find((lesson) => !completedIds.includes(lesson.id)) ?? lessons[lessons.length - 1];
}
