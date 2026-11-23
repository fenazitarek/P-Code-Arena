import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { Seo } from '../components/Seo';
import { nextLesson, useProgress } from '../context/ProgressContext';
import { lessonModules, lessons } from '../data/curriculum';

export function LearnPage() {
  const { progress, xp } = useProgress();
  const next = nextLesson(progress.completedLessons);
  const percent = Math.round((progress.completedLessons.length / lessons.length) * 100);

  return (
    <>
      <Seo title="C curriculum" description="Ten short, original C programming lessons covering program structure, variables, input, conditions, loops, functions, arrays, strings, and pointers." />
      <PageHeader eyebrow="Learn C" title="A curriculum that earns its place." description="Start with a runnable program and add one idea at a time. Every lesson includes an editable workspace, so reading and doing stay connected.">
        <Link to={`/learn/${next.id}`} className="btn-primary">{progress.completedLessons.length ? 'Continue the course' : 'Begin lesson one'}<Icon name="arrow-right" className="h-4 w-4" /></Link>
        <Link to="/guide" className="btn-secondary">How progress works</Link>
      </PageHeader>

      <div className="container-shell py-10 sm:py-14">
        <section className="surface-card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center" aria-labelledby="course-progress-title">
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime"><Icon name="book" className="h-6 w-6" /></span><div><p className="eyebrow">C foundations</p><h2 id="course-progress-title" className="mt-1 text-xl font-extrabold">From a first program to pointers</h2></div></div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#647168]">Ten focused lessons · roughly 96 minutes of core reading · 10 XP per completed lesson. This local edition deliberately focuses on C.</p>
            <ProgressBar value={percent} label={`Course completion: ${percent}%`} className="mt-5 max-w-xl" />
          </div>
          <div className="flex gap-8 lg:pr-6">
            <div><p className="text-3xl font-extrabold text-forest">{progress.completedLessons.length}<span className="text-lg text-[#9aa49d]">/{lessons.length}</span></p><p className="mt-1 text-xs font-semibold text-[#7b877f]">lessons done</p></div>
            <div><p className="text-3xl font-extrabold text-forest">{xp}</p><p className="mt-1 text-xs font-semibold text-[#7b877f]">total XP</p></div>
          </div>
        </section>

        <div className="mt-12 space-y-12">
          {lessonModules.map((module, moduleIndex) => {
            const moduleLessons = lessons.filter((lesson) => lesson.module === module.name);
            const completed = moduleLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
            return (
              <section key={module.name} aria-labelledby={`module-${moduleIndex}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div><p className="eyebrow">Module {String(moduleIndex + 1).padStart(2, '0')}</p><h2 id={`module-${moduleIndex}`} className="mt-2 text-2xl font-extrabold tracking-tight">{module.name}</h2><p className="mt-1 text-sm text-[#647168]">{module.description}</p></div>
                  <span className="text-xs font-bold text-[#7b877f]">{completed}/{moduleLessons.length} complete</span>
                </div>
                <div className="mt-5 grid gap-3">
                  {moduleLessons.map((lesson) => {
                    const isComplete = progress.completedLessons.includes(lesson.id);
                    return (
                      <Link key={lesson.id} to={`/learn/${lesson.id}`} className="surface-card group flex items-center gap-4 p-4 transition hover:border-moss/40 hover:shadow-card sm:gap-5 sm:p-5">
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-mono text-sm font-bold ${isComplete ? 'bg-[#e2f1e8] text-[#286044]' : 'bg-cream text-[#7b877f]'}`}>{isComplete ? <Icon name="check" className="h-5 w-5" /> : String(lesson.order).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1"><h3 className="font-extrabold tracking-tight group-hover:text-forest">{lesson.title}</h3><p className="mt-1 line-clamp-1 text-sm text-[#647168]">{lesson.summary}</p></div>
                        <span className="hidden items-center gap-1.5 text-xs font-semibold text-[#7b877f] sm:inline-flex"><Icon name="clock" className="h-3.5 w-3.5" />{lesson.duration} min</span>
                        <Icon name="chevron-right" className="h-5 w-5 shrink-0 text-[#9aa49d] transition group-hover:translate-x-1 group-hover:text-forest" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
