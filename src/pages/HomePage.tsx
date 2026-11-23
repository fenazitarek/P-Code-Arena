import { Link } from 'react-router-dom';
import { CodeWindow } from '../components/CodeWindow';
import { Icon, type IconName } from '../components/Icon';
import { ProblemCard } from '../components/ProblemCard';
import { SectionHeading } from '../components/SectionHeading';
import { Seo } from '../components/Seo';
import { nextLesson, useProgress } from '../context/ProgressContext';
import { lessons } from '../data/curriculum';
import { practiceProblems } from '../data/problems';

const heroCode = String.raw`#include <stdio.h>

int main(void) {
    int completed = 0;

    for (int day = 1; day <= 7; day++) {
        completed = completed + 1;
    }

    printf("Seven focused sessions.\n");
    return 0;
}`;

const path: { icon: IconName; step: string; title: string; body: string; to: string }[] = [
  { icon: 'book', step: '01', title: 'Understand one idea', body: 'Short lessons explain the mental model before asking you to memorize syntax.', to: '/learn' },
  { icon: 'terminal', step: '02', title: 'Run something real', body: 'Edit C code and compile it locally, with honest output instead of a canned demo.', to: `/learn/${lessons[0].id}` },
  { icon: 'target', step: '03', title: 'Practice with feedback', body: 'Solve focused problems and see exactly which checks pass or need another look.', to: '/practice' },
  { icon: 'trophy', step: '04', title: 'Build your own rhythm', body: 'Try a timed session, track XP, and return to the next small challenge.', to: '/arena' },
];

export function HomePage() {
  const { progress, xp } = useProgress();
  const next = nextLesson(progress.completedLessons);
  const started = progress.completedLessons.length > 0 || progress.completedProblems.length > 0;

  return (
    <>
      <Seo title="Learn C by building momentum" description="A calm, hands-on C programming studio with guided lessons, real local compilation, thoughtful practice, and browser-saved progress." />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-lime/35 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-lavender/50 blur-3xl" />
        <div className="container-shell relative grid items-center gap-12 py-14 lg:grid-cols-[1.03fr_0.97fr] lg:py-24">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-forest shadow-sm">
              <Icon name="spark" className="h-4 w-4" />A local-first C learning studio
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-extrabold leading-[1.03] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">Small lessons.<br /><span className="text-forest">Real code.</span><br />Steady progress.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5d6b62]">Learn C by doing: understand one concept, run it on your machine, then turn that knowledge into a solution you can explain.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/learn/${next.id}`} className="btn-primary">{started ? 'Continue learning' : 'Start with lesson one'}<Icon name="arrow-right" className="h-4 w-4" /></Link>
              <Link to="/practice" className="btn-secondary"><Icon name="code" className="h-4 w-4" />Browse practice</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#647168]">
              <span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-forest" />No account required</span>
              <span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-forest" />Progress stays local</span>
              <span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-forest" />Real GCC execution</span>
            </div>
          </div>
          <div className="relative animate-fade-up lg:pl-4" style={{ animationDelay: '100ms' }}>
            <CodeWindow code={heroCode} output="Seven focused sessions." />
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-soft sm:-left-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime"><Icon name="zap" className="h-5 w-5" /></span>
              <div><p className="text-xs font-semibold text-[#7b877f]">Your momentum</p><p className="text-sm font-extrabold">{xp} XP earned locally</p></div>
            </div>
            <div className="absolute -right-2 -top-4 hidden rounded-2xl bg-lavender px-4 py-3 shadow-card sm:block">
              <p className="text-xs font-semibold text-[#5f5789]">Today’s goal</p><p className="mt-0.5 text-sm font-extrabold text-[#383052]">One honest attempt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-8">
        <div className="container-shell grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ['10', 'guided lessons'],
            ['14', 'original problems'],
            ['C11', 'real local compiler'],
            ['0', 'accounts or API keys'],
          ].map(([value, label]) => (
            <div key={label} className="text-center sm:text-left"><p className="text-2xl font-extrabold tracking-tight text-forest sm:text-3xl">{value}</p><p className="mt-1 text-xs font-semibold text-[#7b877f] sm:text-sm">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="container-shell py-16 sm:py-24">
        <SectionHeading eyebrow="The learning loop" title="A clear path from first line to finished solution." description="You do not need a huge course or a perfect streak. You need a next step that feels small enough to begin." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {path.map((item) => (
            <Link key={item.step} to={item.to} className="surface-card group p-6 transition hover:-translate-y-1 hover:border-moss/40 hover:shadow-soft">
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-forest transition group-hover:bg-lime"><Icon name={item.icon} /></span><span className="font-mono text-xs text-[#a0aaa3]">{item.step}</span></div>
              <h3 className="mt-6 text-lg font-extrabold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#647168]">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#edf0e7] py-16 sm:py-24">
        <div className="container-shell">
          <SectionHeading eyebrow="Practice shelf" title="A few good problems to start with." description="Each one includes examples, hints, and real test cases. Solve at your own pace; repeating a problem never reduces your XP." action={<Link to="/practice" className="btn-secondary">See all practice<Icon name="arrow-right" className="h-4 w-4" /></Link>} />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {practiceProblems.slice(0, 3).map((problem, index) => <ProblemCard key={problem.id} problem={problem} index={index} />)}
          </div>
        </div>
      </section>

      <section className="container-shell py-16 sm:py-24">
        <div className="overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Your next small win</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">You already have enough to begin.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/65">Open the workspace, change one line, and run it. Understanding grows from noticing what happens next.</p>
            </div>
            <Link to={`/learn/${next.id}`} className="btn-lime">Open lesson {String(next.order).padStart(2, '0')}<Icon name="arrow-right" className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
