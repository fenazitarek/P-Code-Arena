import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { Workspace } from '../components/Workspace';
import { useProgress } from '../context/ProgressContext';
import { getProblem, problems } from '../data/problems';
import { NotFoundPage } from './NotFoundPage';

export function ProblemPage() {
  const { problemId } = useParams();
  const location = useLocation();
  const problem = getProblem(problemId);
  const expectedKind = location.pathname.startsWith('/challenges') ? 'challenge' : 'practice';
  const { progress, completeProblem } = useProgress();
  const [awardNotice, setAwardNotice] = useState('');

  if (!problem || problem.kind !== expectedKind) return <NotFoundPage />;

  const completed = progress.completedProblems.includes(problem.id);
  const basePath = problem.kind === 'practice' ? '/practice' : '/challenges';
  const collection = problems.filter((item) => item.kind === problem.kind);
  const index = collection.findIndex((item) => item.id === problem.id);
  const next = collection[index + 1];

  function handlePassed() {
    if (!problem) return;
    const awarded = completeProblem(problem);
    setAwardNotice(awarded ? `Solved. You earned ${problem.xp} XP.` : 'All checks passed. This problem was already recorded.');
  }

  return (
    <>
      <Seo title={problem.title} description={`${problem.summary} An original ${problem.difficulty.toLowerCase()} C ${problem.kind} with local test execution.`} />
      <div className="border-b border-line bg-white/60">
        <div className="container-shell flex flex-wrap items-center gap-2 py-4 text-xs font-semibold text-[#7b877f]"><Link to={basePath} className="hover:text-forest">{problem.kind === 'practice' ? 'Practice' : 'Challenges'}</Link><Icon name="chevron-right" className="h-3.5 w-3.5" /><span className="text-ink">{problem.title}</span></div>
      </div>

      <div className="container-shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-14">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2"><DifficultyBadge difficulty={problem.difficulty} /><span className="pill bg-cream text-[#647168]">{problem.topic}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-ink"><Icon name="zap" className="h-3.5 w-3.5" />{problem.xp} XP</span></div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{problem.title}</h1>
            <p className="mt-4 text-lg leading-8 text-[#5d6b62]">{problem.description}</p>
          </header>

          {completed && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#cfe5d7] bg-[#f4fbf7] p-4 text-sm text-[#286044]"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-extrabold">Already solved</p><p className="mt-1 leading-6">You can keep experimenting, but this activity will not award XP a second time.</p></div></div>}
          {awardNotice && <div className="mt-6 flex items-start gap-3 rounded-2xl bg-ink p-4 text-sm text-white" role="status"><Icon name="spark" className="mt-0.5 h-5 w-5 shrink-0 text-lime" /><p className="font-semibold">{awardNotice}</p></div>}

          <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-labelledby="problem-format">
            <div className="surface-card p-5"><h2 id="problem-format" className="text-sm font-extrabold">Input</h2><p className="mt-2 text-sm leading-6 text-[#647168]">{problem.inputFormat}</p></div>
            <div className="surface-card p-5"><h2 className="text-sm font-extrabold">Output</h2><p className="mt-2 text-sm leading-6 text-[#647168]">{problem.outputFormat}</p></div>
          </section>

          <section className="mt-8" aria-labelledby="problem-examples"><h2 id="problem-examples" className="text-2xl font-extrabold tracking-tight">Work through an example</h2><div className="mt-4 grid gap-4">{problem.examples.map((example, exampleIndex) => <div key={exampleIndex} className="overflow-hidden rounded-2xl border border-line bg-white"><div className="grid sm:grid-cols-2"><div className="border-b border-line p-4 sm:border-b-0 sm:border-r"><p className="text-[10px] font-bold uppercase tracking-widest text-[#7b877f]">Input</p><pre className="code-scroll mt-2 overflow-x-auto font-mono text-sm">{example.input}</pre></div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-[#7b877f]">Output</p><pre className="code-scroll mt-2 overflow-x-auto font-mono text-sm text-forest">{example.output}</pre></div></div><p className="border-t border-line bg-cream/60 px-4 py-3 text-xs leading-5 text-[#647168]">{example.note}</p></div>)}</div></section>

          <div className="mt-10"><Workspace key={problem.id} id={`problem-${problem.id}`} initialCode={problem.starterCode} mode="check" tests={problem.tests} onPassed={handlePassed} /></div>

          <section className="mt-8 rounded-3xl border border-line bg-white p-6" aria-labelledby="problem-hints"><h2 id="problem-hints" className="text-lg font-extrabold">Need a nudge?</h2><p className="mt-1 text-sm text-[#647168]">Open one hint at a time and try again before moving to the next.</p><div className="mt-4 space-y-3">{problem.hints.map((hint, hintIndex) => <details key={hint} className="group rounded-2xl bg-cream p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold"><span>Hint {hintIndex + 1}</span><Icon name="chevron-down" className="h-4 w-4 transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-[#647168]">{hint}</p></details>)}</div></section>

          {next && <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-[#edf0e7] p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Next problem</p><h2 className="mt-1 text-lg font-extrabold">{next.title}</h2></div><Link to={`${basePath}/${next.id}`} className="btn-secondary">Keep going<Icon name="arrow-right" className="h-4 w-4" /></Link></div>}
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-card p-5"><h2 className="text-sm font-extrabold">Problem brief</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-[#7b877f]">Difficulty</dt><dd><DifficultyBadge difficulty={problem.difficulty} /></dd></div><div className="flex justify-between gap-3"><dt className="text-[#7b877f]">Topic</dt><dd className="font-bold">{problem.topic}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#7b877f]">Reward</dt><dd className="font-bold text-forest">{problem.xp} XP</dd></div><div className="flex justify-between gap-3"><dt className="text-[#7b877f]">Checks</dt><dd className="font-bold">{problem.tests.length}</dd></div></dl></div>
          <div className="surface-card p-5"><h2 className="text-sm font-extrabold">Keep in mind</h2><ul className="mt-4 space-y-3">{problem.constraints.map((constraint) => <li key={constraint} className="flex items-start gap-2 text-xs leading-5 text-[#647168]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />{constraint}</li>)}</ul></div>
          <div className="rounded-3xl bg-lavender/70 p-5"><div className="flex items-center gap-2 text-[#514778]"><Icon name="info" className="h-4 w-4" /><h2 className="text-sm font-extrabold">Honest feedback</h2></div><p className="mt-2 text-xs leading-5 text-[#655e82]">Output is compared after normalizing line endings and trailing whitespace. Every check must pass before XP is recorded.</p></div>
          <Link to={basePath} className="inline-flex items-center gap-2 px-1 text-sm font-bold text-forest hover:underline"><Icon name="arrow-left" className="h-4 w-4" />Back to all {problem.kind === 'practice' ? 'practice' : 'challenges'}</Link>
        </aside>
      </div>
    </>
  );
}
