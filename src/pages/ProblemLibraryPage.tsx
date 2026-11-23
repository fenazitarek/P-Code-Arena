import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { ProblemCard } from '../components/ProblemCard';
import { ProgressBar } from '../components/ProgressBar';
import { Seo } from '../components/Seo';
import { useProgress } from '../context/ProgressContext';
import { challengeProblems, practiceProblems } from '../data/problems';
import type { Difficulty, ProblemKind } from '../data/types';

export function ProblemLibraryPage({ kind }: { kind: ProblemKind }) {
  const { progress } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');
  const collection = kind === 'practice' ? practiceProblems : challengeProblems;
  const topics = ['All', ...new Set(collection.map((problem) => problem.topic))];
  const completedCount = collection.filter((problem) => progress.completedProblems.includes(problem.id)).length;
  const filtered = useMemo(() => collection.filter((problem) => {
    const matchesDifficulty = difficulty === 'All' || problem.difficulty === difficulty;
    const matchesTopic = topic === 'All' || problem.topic === topic;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || `${problem.title} ${problem.summary} ${problem.topic}`.toLowerCase().includes(search);
    return matchesDifficulty && matchesTopic && matchesQuery;
  }), [collection, difficulty, query, topic]);
  const isPractice = kind === 'practice';

  return (
    <>
      <Seo title={isPractice ? 'C practice problems' : 'C challenges'} description={isPractice ? 'Practice C with original, auto-graded exercises, helpful hints, and real local compilation.' : 'Take on longer C challenges in number theory, strings, arrays, dynamic programming, and graphs.'} />
      <PageHeader eyebrow={isPractice ? 'Practice' : 'Challenges'} title={isPractice ? 'Turn understanding into a working solution.' : 'Longer problems. Deeper thinking.'} description={isPractice ? 'Choose a focused exercise, write your solution, and run every check locally. Hints are available when you want a nudge, not an answer.' : 'These independent problems ask you to combine several ideas. There is no timer unless you choose the timed arena.'}>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-lime"><Icon name={isPractice ? 'target' : 'flame'} className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">{completedCount} of {collection.length} solved</p><ProgressBar value={(completedCount / collection.length) * 100} label={`${completedCount} of ${collection.length} solved`} className="mt-2 w-40" /></div></div>
      </PageHeader>

      <div className="container-shell py-10 sm:py-14">
        <div className="surface-card p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr_220px] lg:items-center">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((option) => <button key={option} type="button" onClick={() => setDifficulty(option)} aria-pressed={difficulty === option} className={`rounded-full px-4 py-2 text-sm font-bold transition ${difficulty === option ? 'bg-forest text-white' : 'bg-cream text-[#647168] hover:text-ink'}`}>{option}</button>)}
            </div>
            <div className="relative"><label htmlFor="problem-search" className="sr-only">Search problems</label><Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b877f]" /><input id="problem-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="field-input pl-10" placeholder="Search by title, topic, or idea" /></div>
            <div><label htmlFor="problem-topic" className="sr-only">Filter by topic</label><select id="problem-topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="field-input">{topics.map((option) => <option key={option} value={option}>{option === 'All' ? 'All topics' : option}</option>)}</select></div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4"><p className="text-sm text-[#647168]" aria-live="polite">Showing <strong className="text-ink">{filtered.length}</strong> {filtered.length === 1 ? 'problem' : 'problems'}</p>{(difficulty !== 'All' || query || topic !== 'All') && <button type="button" onClick={() => { setDifficulty('All'); setQuery(''); setTopic('All'); }} className="text-sm font-bold text-forest hover:underline">Clear filters</button>}</div>

        {filtered.length ? <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((problem, index) => <ProblemCard key={problem.id} problem={problem} index={index} />)}</div> : <div className="surface-card mt-5 p-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cream text-[#7b877f]"><Icon name="search" className="h-6 w-6" /></span><h2 className="mt-4 text-xl font-extrabold">No problems match those filters.</h2><p className="mt-2 text-sm text-[#647168]">Try a broader search or clear the current filters.</p><button type="button" className="btn-secondary mt-5" onClick={() => { setDifficulty('All'); setQuery(''); setTopic('All'); }}>Show everything</button></div>}
      </div>
    </>
  );
}
