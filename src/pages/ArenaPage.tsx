import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { Seo } from '../components/Seo';
import { Workspace } from '../components/Workspace';
import { useProgress } from '../context/ProgressContext';
import { challengeProblems } from '../data/problems';

type ArenaStatus = 'setup' | 'active' | 'finished' | 'expired';

export function ArenaPage() {
  const { progress, completeProblem, saveArenaTime } = useProgress();
  const [selectedId, setSelectedId] = useState(challengeProblems[0].id);
  const [minutes, setMinutes] = useState(10);
  const [status, setStatus] = useState<ArenaStatus>('setup');
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [summary, setSummary] = useState({ elapsed: 0, xp: 0 });
  const deadlineRef = useRef(0);
  const startedAtRef = useRef(0);
  const selected = challengeProblems.find((problem) => problem.id === selectedId) ?? challengeProblems[0];

  useEffect(() => {
    if (status !== 'active') return;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setStatus('expired');
    }, 500);
    return () => window.clearInterval(interval);
  }, [status]);

  function startSession() {
    startedAtRef.current = Date.now();
    deadlineRef.current = startedAtRef.current + minutes * 60 * 1000;
    setSecondsLeft(minutes * 60);
    setStatus('active');
    window.scrollTo(0, 0);
  }

  function handlePassed() {
    const elapsed = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    const awarded = completeProblem(selected);
    saveArenaTime(selected.id, elapsed);
    setSummary({ elapsed, xp: awarded ? selected.xp : 0 });
    setStatus('finished');
    window.scrollTo(0, 0);
  }

  if (status === 'active') {
    return (
      <>
        <Seo title={`Timed session: ${selected.title}`} description="A solo, timed C practice session with real local compilation and test feedback." />
        <div className="border-b border-line bg-ink text-white">
          <div className="container-shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Timed solo session</p><h1 className="mt-1 text-xl font-extrabold sm:text-2xl">{selected.title}</h1></div>
            <div className="flex items-center gap-4"><div className={`rounded-2xl px-4 py-2 text-center ${secondsLeft <= 60 ? 'bg-[#934141]' : 'bg-white/10'}`} role="timer" aria-label={`${formatTime(secondsLeft)} remaining`}><p className="font-mono text-2xl font-bold tabular-nums">{formatTime(secondsLeft)}</p><p className="text-[10px] font-bold uppercase tracking-widest text-white/55">remaining</p></div><button type="button" onClick={() => setStatus('expired')} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10">End session</button></div>
          </div>
        </div>
        <div className="container-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div><div className="mb-6 flex flex-wrap items-center gap-2"><DifficultyBadge difficulty={selected.difficulty} /><span className="pill bg-white text-[#647168]">{selected.topic}</span><span className="pill bg-lime text-ink">{selected.xp} XP</span></div><p className="mb-6 text-base leading-7 text-[#5d6b62]">{selected.description}</p><Workspace key={`arena-${selected.id}-${startedAtRef.current}`} id={`arena-${selected.id}`} initialCode={selected.starterCode} mode="check" tests={selected.tests} onPassed={handlePassed} /></div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit"><div className="surface-card p-5"><h2 className="text-sm font-extrabold">Session brief</h2><ul className="mt-4 space-y-3 text-xs leading-5 text-[#647168]"><li className="flex gap-2"><Icon name="target" className="h-4 w-4 shrink-0 text-forest" />Pass all {selected.tests.length} checks before the timer ends.</li><li className="flex gap-2"><Icon name="user" className="h-4 w-4 shrink-0 text-forest" />This is solo practice, not a live opponent match.</li><li className="flex gap-2"><Icon name="zap" className="h-4 w-4 shrink-0 text-forest" />XP is awarded once per problem across the whole app.</li></ul></div>{progress.arenaBest[selected.id] && <div className="rounded-3xl bg-lavender/70 p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#655e82]">Your best local time</p><p className="mt-2 font-mono text-2xl font-bold text-[#383052]">{formatTime(progress.arenaBest[selected.id])}</p></div>}<Link to="/challenges" className="inline-flex items-center gap-2 px-1 text-sm font-bold text-forest"><Icon name="arrow-left" className="h-4 w-4" />Leave timed mode</Link></aside>
        </div>
      </>
    );
  }

  if (status === 'finished' || status === 'expired') {
    const success = status === 'finished';
    return (
      <>
        <Seo title={success ? 'Session complete' : 'Session ended'} description="Review your solo timed C practice session and choose the next challenge." />
        <section className="container-shell py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className={`mx-auto grid h-20 w-20 place-items-center rounded-[28px] ${success ? 'bg-lime' : 'bg-lavender'}`}><Icon name={success ? 'trophy' : 'clock'} className="h-10 w-10" /></span>
            <p className="eyebrow mt-7">{success ? 'All checks passed' : 'Session ended'}</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{success ? 'That is a solid solve.' : 'The timer won this round.'}</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[#647168]">{success ? 'You combined the idea, the code, and the tests. Take a moment to notice what made the solution click.' : 'Your draft is still saved. Review the problem without the clock, then come back when you want another timed attempt.'}</p>
            <div className="mt-8 grid grid-cols-2 gap-4"><div className="surface-card p-5"><p className="font-mono text-2xl font-bold text-forest">{formatTime(summary.elapsed || Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)))}</p><p className="mt-1 text-xs font-semibold text-[#7b877f]">session time</p></div><div className="surface-card p-5"><p className="text-2xl font-bold text-forest">+{summary.xp} XP</p><p className="mt-1 text-xs font-semibold text-[#7b877f]">new reward</p></div></div>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" className="btn-primary" onClick={() => setStatus('setup')}>Choose another session<Icon name="arrow-right" className="h-4 w-4" /></button><Link to={`/challenges/${selected.id}`} className="btn-secondary">Review without a timer</Link></div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title="Timed C arena" description="Choose a C challenge and a comfortable time limit for focused solo practice with real local test execution." />
      <PageHeader eyebrow="Timed arena" title="Practice with a clock, not a crowd." description="Pick a challenge and a time limit, then work toward a verified solution. This local edition is deliberately solo: no matchmaking, no remote opponents, no pressure to perform for strangers.">
        <Link to="/challenges" className="btn-secondary">Browse untimed challenges<Icon name="arrow-right" className="h-4 w-4" /></Link>
      </PageHeader>
      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14">
        <section aria-labelledby="choose-arena-problem"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Step one</p><h2 id="choose-arena-problem" className="mt-2 text-2xl font-extrabold">Choose your training problem</h2></div><span className="text-xs font-bold text-[#7b877f]">{challengeProblems.length} available</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{challengeProblems.map((problem) => <button key={problem.id} type="button" onClick={() => setSelectedId(problem.id)} aria-pressed={selectedId === problem.id} className={`surface-card p-5 text-left transition ${selectedId === problem.id ? 'border-forest ring-4 ring-forest/10' : 'hover:border-moss/40'}`}><div className="flex items-start justify-between gap-3"><DifficultyBadge difficulty={problem.difficulty} /><span className={`grid h-6 w-6 place-items-center rounded-full ${selectedId === problem.id ? 'bg-forest text-white' : 'border border-line'}`}>{selectedId === problem.id && <Icon name="check" className="h-3.5 w-3.5" />}</span></div><h3 className="mt-4 font-extrabold tracking-tight">{problem.title}</h3><p className="mt-2 text-sm leading-6 text-[#647168]">{problem.summary}</p><div className="mt-4 flex items-center justify-between text-xs font-semibold"><span className="text-[#7b877f]">{problem.topic}</span>{progress.arenaBest[problem.id] ? <span className="text-forest">Best {formatTime(progress.arenaBest[problem.id])}</span> : <span className="text-[#7b877f]">{problem.xp} XP</span>}</div></button>)}</div></section>
        <aside className="lg:sticky lg:top-24 lg:h-fit"><div className="surface-card p-6"><p className="eyebrow">Step two</p><h2 className="mt-2 text-2xl font-extrabold">Set a comfortable pace</h2><p className="mt-2 text-sm leading-6 text-[#647168]">A shorter session is still useful. Choose the amount of focus you actually have today.</p><div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Session duration">{[5, 10, 15].map((value) => <button key={value} type="button" onClick={() => setMinutes(value)} aria-pressed={minutes === value} className={`rounded-2xl border px-3 py-4 text-center transition ${minutes === value ? 'border-forest bg-forest text-white' : 'border-line bg-cream text-ink hover:border-moss'}`}><span className="block text-xl font-extrabold">{value}</span><span className="text-xs font-semibold opacity-70">minutes</span></button>)}</div><div className="mt-5 rounded-2xl bg-cream p-4"><p className="text-xs font-bold text-[#7b877f]">Selected problem</p><p className="mt-1 font-extrabold">{selected.title}</p><p className="mt-1 text-xs text-[#647168]">{selected.tests.length} checks · {selected.xp} XP</p></div><button type="button" onClick={startSession} className="btn-primary mt-5 w-full"><Icon name="play" className="h-4 w-4" />Start {minutes}-minute session</button><p className="mt-3 text-center text-xs leading-5 text-[#7b877f]">The timer begins after you press start. You can end the session early.</p></div></aside>
      </div>
    </>
  );
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutesPart = Math.floor(safe / 60);
  const secondsPart = safe % 60;
  return `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`;
}
