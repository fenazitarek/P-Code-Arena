import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { Seo } from '../components/Seo';
import { useProgress } from '../context/ProgressContext';
import { sampleLearners } from '../data/leaderboard';

export function RankingsPage() {
  const { progress, xp } = useProgress();
  const [query, setQuery] = useState('');
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const entries = useMemo(() => [
    ...sampleLearners.map((learner) => ({ ...learner, current: false })),
    { name: progress.displayName, xp, color: '#d9f479', current: true },
  ].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name)), [progress.displayName, xp]);
  const filtered = entries.filter((entry) => entry.name.toLowerCase().includes(query.trim().toLowerCase()));
  const currentRank = entries.findIndex((entry) => entry.current) + 1;

  return (
    <>
      <Seo title="Local rankings" description="A browser-local demo leaderboard that combines fictional learners with your own saved C learning progress." />
      <PageHeader eyebrow="Local rankings" title="A little context, without the pressure." description="See how your current XP compares with a fictional practice cohort. This is a local demo leaderboard, not a global or live ranking.">
        <button type="button" className="btn-secondary" onClick={() => setUpdatedAt(new Date())}><Icon name="reset" className="h-4 w-4" />Refresh local view</button>
        <Link to="/dashboard" className="btn-primary">View your progress<Icon name="arrow-right" className="h-4 w-4" /></Link>
      </PageHeader>
      <div className="container-shell py-10 sm:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {entries.slice(0, 3).map((entry, index) => <div key={entry.name} className={`surface-card p-6 ${index === 0 ? 'bg-ink text-white md:-translate-y-2' : ''}`}><div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-extrabold ${index === 0 ? 'bg-lime text-ink' : 'bg-cream text-forest'}`}>#{index + 1}</span><Icon name="trophy" className={`h-6 w-6 ${index === 0 ? 'text-lime' : 'text-[#a4aea7]'}`} /></div><p className={`mt-5 text-sm font-semibold ${index === 0 ? 'text-white/55' : 'text-[#7b877f]'}`}>Practice cohort</p><h2 className="mt-1 text-xl font-extrabold">{entry.name}</h2><p className={`mt-3 text-3xl font-extrabold ${index === 0 ? 'text-lime' : 'text-forest'}`}>{entry.xp.toLocaleString()} <span className="text-sm font-bold opacity-60">XP</span></p></div>)}
        </div>

        <section className="surface-card mt-8 overflow-hidden" aria-labelledby="leaderboard-title">
          <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 id="leaderboard-title" className="text-xl font-extrabold">Practice cohort standings</h2><p className="mt-1 text-xs text-[#7b877f]" aria-live="polite">Local view refreshed {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div><div className="relative sm:w-72"><label htmlFor="learner-search" className="sr-only">Search learners</label><Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b877f]" /><input id="learner-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="field-input pl-10" placeholder="Find a learner" /></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="bg-cream/70 text-[11px] font-bold uppercase tracking-wider text-[#7b877f]"><tr><th scope="col" className="px-6 py-3">Rank</th><th scope="col" className="px-6 py-3">Learner</th><th scope="col" className="px-6 py-3">Standing</th><th scope="col" className="px-6 py-3 text-right">XP</th></tr></thead><tbody className="divide-y divide-line">{filtered.map((entry) => { const rank = entries.findIndex((item) => item.name === entry.name && item.current === entry.current) + 1; return <tr key={`${entry.name}-${entry.current}`} className={entry.current ? 'bg-[#f2f8dd]' : 'hover:bg-cream/40'}><td className="px-6 py-4 font-mono text-sm font-bold text-[#7b877f]">#{rank}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl text-xs font-extrabold" style={{ backgroundColor: entry.color }}>{entry.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span><span className="text-sm font-bold">{entry.name}{entry.current && <span className="ml-2 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-white">You</span>}</span></div></td><td className="px-6 py-4 text-sm text-[#647168]">{entry.current ? `${currentRank} in this local cohort` : 'Fictional learner'}</td><td className="px-6 py-4 text-right text-sm font-extrabold text-forest">{entry.xp.toLocaleString()}</td></tr>; })}</tbody></table></div>
          {!filtered.length && <div className="p-10 text-center"><p className="font-extrabold">No learner matches “{query}”.</p><button type="button" onClick={() => setQuery('')} className="mt-3 text-sm font-bold text-forest underline">Clear search</button></div>}
        </section>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-xs leading-5 text-[#647168]"><Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-forest" /><p>The other names are fictional sample data. Your row comes only from progress saved in this browser; clearing browser storage removes it.</p></div>
      </div>
    </>
  );
}
