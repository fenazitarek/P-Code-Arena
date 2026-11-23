import type { ProgressState } from '../data/types';

export const PROGRESS_KEY = 'loopcraft-progress-v1';
export const DRAFT_KEY = 'loopcraft-drafts-v1';

export const defaultProgress: ProgressState = {
  displayName: 'Curious Coder',
  completedLessons: [],
  completedProblems: [],
  arenaBest: {},
  activity: [],
};

export interface Level {
  name: string;
  minimum: number;
  next: number | null;
}

const levels: Level[] = [
  { name: 'Starter', minimum: 0, next: 150 },
  { name: 'Builder', minimum: 150, next: 500 },
  { name: 'Explorer', minimum: 500, next: 1000 },
  { name: 'Trailblazer', minimum: 1000, next: 2000 },
  { name: 'Mentor', minimum: 2000, next: null },
];

export function getLevel(xp: number): Level {
  return [...levels].reverse().find((level) => xp >= level.minimum) ?? levels[0];
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  if (level.next === null) {
    return { percent: 100, remaining: 0 };
  }
  const span = level.next - level.minimum;
  const earned = xp - level.minimum;
  return {
    percent: Math.min(100, Math.round((earned / span) * 100)),
    remaining: Math.max(0, level.next - xp),
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      displayName: typeof parsed.displayName === 'string' && parsed.displayName.trim() ? parsed.displayName : 'Curious Coder',
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons.filter((id): id is string => typeof id === 'string') : [],
      completedProblems: Array.isArray(parsed.completedProblems) ? parsed.completedProblems.filter((id): id is string => typeof id === 'string') : [],
      arenaBest: parsed.arenaBest && typeof parsed.arenaBest === 'object' ? parsed.arenaBest : {},
      activity: Array.isArray(parsed.activity) ? parsed.activity.slice(0, 12) : [],
    };
  } catch {
    return defaultProgress;
  }
}

export function saveDraft(id: string, code: string) {
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, string>;
    drafts[id] = code;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  } catch {
    return;
  }
}

export function loadDraft(id: string) {
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, string>;
    return typeof drafts[id] === 'string' ? drafts[id] : null;
  } catch {
    return null;
  }
}
