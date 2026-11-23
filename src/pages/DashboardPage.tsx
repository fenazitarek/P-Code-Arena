import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { ProgressBar } from '../components/ProgressBar';
import { Seo } from '../components/Seo';
import { nextLesson, useProgress } from '../context/ProgressContext';
import { lessons } from '../data/curriculum';
import { challengeProblems, practiceProblems } from '../data/problems';

export function DashboardPage() {
  const { progress, xp, level, levelProgress } = useProgress();
  const next = nextLesson(progress.completedLessons);
  const solvedPractice = practiceProblems.filter((problem) => progress.completedProblems.includes(problem.id)).length;
  const solvedChallenges = challengeProblems.filter((problem) => progress.completedProblems.includes(problem.id)).length;
  const nextProblem = [...practiceProblems, ...challengeProblems].find((problem) => !progress.completedProblems.includes(problem.id));
  const totalActivities = lessons.length + practiceProblems.length + challengeProblems.length;
  const totalCompleted = progress.completedLessons.length + progress.completedProblems.length;

  return (
    <>
      <Seo title="Your learning dashboard" description="Review your locally saved C lessons, solved problems, XP, level, recent activity, and recommended next steps." />
      <section className="border-b border-line bg-white/60"><div className="container-shell py-10 sm:py-14"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Your dashboard</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Welcome back, {progress.displayName}.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#647168]">A quiet overview of what you have finished and what could be a good next step.</p></div><Link to={`/learn/${next.id}`} className="btn-primary shrink-0">Continue lesson {String(next.order).padStart(2, '0')}<Icon name="arrow-right" className="h-4 w-4" /></Link></div></div></section>

      <div className="container-shell py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: 'zap' as IconName, label: 'Total XP', value: xp.toLocaleString(), note: level.name },
            { icon: 'book' as IconName, label: 'Lessons', value: `${progress.completedLessons.length}/${lessons.length}`, note: 'course complete' },
            { icon: 'target' as IconName, label: 'Problems solved', value: progress.completedProblems.length.toString(), note: `${practiceProblems.length + challengeProblems.length} available` },
            { icon: 'flame' as IconName, label: 'Overall progress', value: `${Math.round((totalCompleted / totalActivities) * 100)}%`, note: `${totalCompleted} activities done` },
          ].map((stat) => <div key={stat.label} className="surface-card p-5"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream text-forest"><Icon name={stat.icon} className="h-5 w-5" /></span><span className="text-xs font-semibold text-[#7b877f]">{stat.label}</span></div><p className="mt-5 text-3xl font-extrabold tracking-tight">{stat.value}</p><p className="mt-1 text-xs text-[#7b877f]">{stat.note}</p></div>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <section className="surface-card overflow-hidden" aria-labelledby="continue-learning"><div className="grid md:grid-cols-[1fr_auto]"><div className="p-6 sm:p-8"><p className="eyebrow">Continue learning</p><h2 id="continue-learning" className="mt-3 text-2xl font-extrabold tracking-tight">{next.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#647168]">{next.summary}</p><div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#7b877f]"><span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4" />{next.duration} minutes</span><span className="inline-flex items-center gap-1.5"><Icon name="zap" className="h-4 w-4" />10 XP</span></div><Link to={`/learn/${next.id}`} className="btn-primary mt-6">Open lesson<Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="flex min-h-[220px] items-center justify-center bg-[#edf0e7] p-8 md:min-h-full"><div className="text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-ink text-lime"><Icon name="code" className="h-10 w-10" /></span><p className="mt-4 font-mono text-xs font-bold text-[#7b877f]">LESSON {String(next.order).padStart(2, '0')}</p></div></div></div></section>

            <section className="surface-card p-6 sm:p-8" aria-labelledby="progress-breakdown"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Progress breakdown</p><h2 id="progress-breakdown" className="mt-2 text-2xl font-extrabold tracking-tight">Every category counts.</h2></div><Icon name="dashboard" className="h-7 w-7 text-[#a4aea7]" /></div><div className="mt-6 space-y-6">{[{ label: 'C lessons', value: progress.completedLessons.length, total: lessons.length, to: '/learn' }, { label: 'Practice problems', value: solvedPractice, total: practiceProblems.length, to: '/practice' }, { label: 'Challenges', value: solvedChallenges, total: challengeProblems.length, to: '/challenges' }].map((item) => <div key={item.label}><div className="flex items-center justify-between gap-4 text-sm"><Link to={item.to} className="font-bold hover:text-forest">{item.label}</Link><span className="text-[#7b877f]">{item.value}/{item.total}</span></div><ProgressBar value={(item.value / item.total) * 100} label={`${item.label}: ${item.value} of ${item.total} complete`} className="mt-2" /></div>)}</div></section>

            {nextProblem && <section className="rounded-3xl bg-lavender/70 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow text-[#655e82]">Suggested next problem</p><h2 className="mt-2 text-xl font-extrabold text-[#383052]">{nextProblem.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#655e82]">{nextProblem.summary}</p></div><Link to={`${nextProblem.kind === 'practice' ? '/practice' : '/challenges'}/${nextProblem.id}`} className="btn-secondary shrink-0 border-[#cfc7eb] bg-white/70">Try it<Icon name="arrow-right" className="h-4 w-4" /></Link></div></section>}
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-ink p-6 text-white" aria-labelledby="level-title"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink"><Icon name="spark" className="h-5 w-5" /></span><span className="text-xs font-bold uppercase tracking-wider text-white/45">Current level</span></div><h2 id="level-title" className="mt-6 text-3xl font-extrabold">{level.name}</h2><p className="mt-1 text-sm text-white/55">{xp.toLocaleString()} XP earned</p><ProgressBar value={levelProgress.percent} label={`Level progress: ${levelProgress.percent}%`} className="mt-5 bg-white/15" barClassName="bg-lime" /><p className="mt-3 text-xs text-white/50">{levelProgress.remaining ? `${levelProgress.remaining} XP to the next level` : 'You reached the highest level'}</p></section>

            <section className="surface-card p-6" aria-labelledby="recent-activity"><h2 id="recent-activity" className="text-lg font-extrabold">Recent activity</h2>{progress.activity.length ? <ul className="mt-4 space-y-4">{progress.activity.slice(0, 6).map((activity) => <li key={activity.id} className="flex items-start gap-3"><span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${activity.type === 'lesson' ? 'bg-lavender text-[#514778]' : 'bg-[#e2f1e8] text-[#286044]'}`}><Icon name={activity.type === 'lesson' ? 'book' : 'check'} className="h-4 w-4" /></span><div className="min-w-0"><p className="line-clamp-2 text-xs font-bold leading-5">{activity.title}</p><p className="mt-1 text-[11px] text-[#7b877f]">{new Date(activity.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · +{activity.xp} XP</p></div></li>)}</ul> : <div className="mt-4 rounded-2xl bg-cream p-5 text-center"><Icon name="spark" className="mx-auto h-6 w-6 text-[#9aa49d]" /><p className="mt-2 text-sm font-bold">Your first win goes here.</p><p className="mt-1 text-xs leading-5 text-[#7b877f]">Complete a lesson or solve a problem to start your activity list.</p></div>}</section>

            {Object.keys(progress.arenaBest).length > 0 && <section className="surface-card p-6"><h2 className="text-lg font-extrabold">Timed session bests</h2><ul className="mt-4 space-y-3">{Object.entries(progress.arenaBest).map(([id, seconds]) => { const problem = [...practiceProblems, ...challengeProblems].find((item) => item.id === id); return <li key={id} className="flex items-center justify-between gap-3 text-xs"><span className="line-clamp-1 font-semibold text-[#647168]">{problem?.title ?? 'Challenge'}</span><span className="shrink-0 font-mono font-bold text-forest">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span></li>; })}</ul></section>}
          </aside>
        </div>
      </div>
    </>
  );
}
