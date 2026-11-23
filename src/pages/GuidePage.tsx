import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { Seo } from '../components/Seo';
import { useProgress } from '../context/ProgressContext';

const levels = [
  { name: 'Starter', xp: 0, note: 'Your first runnable idea.' },
  { name: 'Builder', xp: 150, note: 'A reliable practice rhythm.' },
  { name: 'Explorer', xp: 500, note: 'Several concepts start connecting.' },
  { name: 'Trailblazer', xp: 1000, note: 'You can combine tools independently.' },
  { name: 'Mentor', xp: 2000, note: 'Deep practice and clear explanations.' },
];

export function GuidePage() {
  const { xp, level, levelProgress } = useProgress();

  return (
    <>
      <Seo title="How Loopcraft works" description="Learn how lessons, XP, local progress, rankings, and the GCC workspace operate in this local-first C programming app." />
      <PageHeader eyebrow="Guide" title="Know what happens when you press Run." description="Loopcraft is designed to be understandable: your content, your progress, and your compiler all have clear boundaries.">
        <Link to="/learn/first-program" className="btn-primary">Try the first lesson<Icon name="arrow-right" className="h-4 w-4" /></Link>
        <Link to="/practice" className="btn-secondary">Open the practice shelf</Link>
      </PageHeader>

      <div className="container-shell py-12 sm:py-16">
        <section className="grid gap-6 lg:grid-cols-3">
          {[
            { icon: 'book' as const, title: 'Learn in small units', body: 'Each lesson explains one idea and gives you a runnable example. Marking a lesson complete records 10 XP.' },
            { icon: 'terminal' as const, title: 'Run real C locally', body: 'The workspace sends source code to a small local Express server. GCC compiles it, and the server runs the result with limits.' },
            { icon: 'shield' as const, title: 'Keep progress in your browser', body: 'Completed activities, display name, code drafts, and arena times use localStorage. There is no cloud account or tracking service.' },
          ].map((item) => <article key={item.title} className="surface-card p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime"><Icon name={item.icon} className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-extrabold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-[#647168]">{item.body}</p></article>)}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div><p className="eyebrow">Progress system</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">XP records finished work, not attempts.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#647168]">Lessons earn 10 XP. Practice problems earn 30, 60, or 100 XP. Challenges earn 120 or 180 XP. Repeating an activity never awards XP again.</p><div className="mt-7 space-y-3">{levels.map((item) => <div key={item.name} className={`flex items-center gap-4 rounded-2xl border p-4 ${level.name === item.name ? 'border-forest bg-[#f2f8dd]' : 'border-line bg-white'}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${level.name === item.name ? 'bg-forest text-white' : 'bg-cream text-[#7b877f]'}`}>{item.xp}</span><div className="flex-1"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold">{item.name}</h3><span className="text-xs font-semibold text-[#7b877f]">{item.xp.toLocaleString()} XP</span></div><p className="mt-1 text-xs text-[#647168]">{item.note}</p></div></div>)}</div></div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit"><div className="rounded-3xl bg-ink p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Your current level</p><p className="mt-3 text-3xl font-extrabold">{level.name}</p><p className="mt-1 text-sm text-white/60">{xp.toLocaleString()} total XP</p><ProgressBar value={levelProgress.percent} label={`Level progress: ${levelProgress.percent}%`} className="mt-5 bg-white/15" barClassName="bg-lime" /><p className="mt-3 text-xs text-white/55">{levelProgress.remaining ? `${levelProgress.remaining} XP until the next level.` : 'Highest local level reached.'}</p><Link to="/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-lime hover:underline">Open dashboard<Icon name="arrow-right" className="h-4 w-4" /></Link></div><div className="surface-card p-5"><h3 className="text-sm font-extrabold">What “verified” means</h3><p className="mt-2 text-xs leading-5 text-[#647168]">A problem is recorded only after every test passes. Compiler errors, timeouts, unavailable services, and failed checks never award XP.</p></div></aside>
        </section>

        <section className="mt-16 rounded-[32px] bg-[#edf0e7] p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2"><div><p className="eyebrow">Local workspace</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Useful limits, explained plainly.</h2><p className="mt-4 text-sm leading-7 text-[#647168]">The runner is meant for classroom-scale programs, not untrusted production workloads. It binds to loopback, avoids shell execution, compiles in a temporary folder, caps output, stops long-running programs, and removes temporary files afterward.</p><ul className="mt-5 space-y-3 text-sm text-[#526258]"><li className="flex gap-2"><Icon name="check" className="h-4 w-4 shrink-0 text-forest" />C11 compilation with GCC</li><li className="flex gap-2"><Icon name="check" className="h-4 w-4 shrink-0 text-forest" />Two-second default run limit</li><li className="flex gap-2"><Icon name="check" className="h-4 w-4 shrink-0 text-forest" />64 KB default output limit</li><li className="flex gap-2"><Icon name="check" className="h-4 w-4 shrink-0 text-forest" />Local request throttling</li></ul></div><div className="rounded-3xl bg-ink p-6 text-white"><div className="flex items-center gap-2 text-lime"><Icon name="terminal" className="h-5 w-5" /><h3 className="font-extrabold">Run it on your machine</h3></div><pre className="code-scroll mt-5 overflow-x-auto rounded-2xl bg-black/20 p-4 font-mono text-sm leading-7 text-[#e7efe8]"><code>{`npm install\nnpm run dev`}</code></pre><p className="mt-4 text-xs leading-6 text-white/55">Open the local URL printed by Vite. If GCC is missing, the workspace will say so instead of pretending a program ran.</p><Link to="/rankings" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-lime hover:underline">About local rankings<Icon name="arrow-right" className="h-4 w-4" /></Link></div></div>
        </section>

        <section className="mt-16"><p className="eyebrow">Questions</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">A few useful answers.</h2><div className="mt-6 grid gap-4 lg:grid-cols-2">{[
          { question: 'Do I need an account?', answer: 'No. This local edition uses a browser profile name and localStorage. It does not include authentication, cloud synchronization, or password storage.' },
          { question: 'Can I use another browser or computer?', answer: 'Not automatically. Progress belongs to the browser profile where it was created. Clearing site data or using private browsing can remove it.' },
          { question: 'Is the timed arena multiplayer?', answer: 'No. It is focused solo practice against a countdown. There are no remote opponents, rooms, or matchmaking services.' },
          { question: 'What if GCC is not installed?', answer: 'The interface still works, but compilation returns a clear setup message. Install a GCC toolchain and make sure gcc is available on PATH, or set CC_PATH in .env.' },
          { question: 'Are the rankings real student data?', answer: 'No. The sample learners are fictional. Only your current local row is based on your saved activity.' },
          { question: 'Can I paste private information into code?', answer: 'Please do not. Although execution is local, source and input are still processed by your machine and should contain only learning examples.' },
        ].map((item) => <details key={item.question} className="surface-card group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold">{item.question}<Icon name="chevron-down" className="h-4 w-4 shrink-0 transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-[#647168]">{item.answer}</p></details>)}</div></section>
      </div>
    </>
  );
}
