import { Link } from 'react-router-dom';
import type { Problem } from '../data/types';
import { useProgress } from '../context/ProgressContext';
import { DifficultyBadge } from './DifficultyBadge';
import { Icon } from './Icon';

export function ProblemCard({ problem, index = 0 }: { problem: Problem; index?: number }) {
  const { progress } = useProgress();
  const completed = progress.completedProblems.includes(problem.id);
  const basePath = problem.kind === 'practice' ? '/practice' : '/challenges';

  return (
    <Link to={`${basePath}/${problem.id}`} className="surface-card group flex min-h-[220px] flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-moss/40 hover:shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-xs font-semibold text-[#7b877f]">{problem.topic}</span>
        </div>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${completed ? 'bg-[#e2f1e8] text-[#286044]' : 'bg-cream text-[#7b877f]'}`}>
          <Icon name={completed ? 'check' : 'arrow-right'} className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-5 text-xl font-extrabold tracking-tight text-ink">{problem.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[#647168]">{problem.summary}</p>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-forest"><Icon name="zap" className="h-4 w-4" />{problem.xp} XP</span>
        <span className="text-xs font-semibold text-[#7b877f]">{completed ? 'Solved' : `Problem ${String(index + 1).padStart(2, '0')}`}</span>
      </div>
    </Link>
  );
}
