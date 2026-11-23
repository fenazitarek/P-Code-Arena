import type { Difficulty } from '../data/types';

const styles: Record<Difficulty, string> = {
  Easy: 'bg-[#e2f1e8] text-[#286044]',
  Medium: 'bg-[#fff0d9] text-[#8a5a12]',
  Hard: 'bg-[#f8e2e2] text-[#934141]',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`pill ${styles[difficulty]}`}>{difficulty}</span>;
}
