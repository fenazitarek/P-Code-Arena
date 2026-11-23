import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { Workspace } from '../components/Workspace';
import { useProgress } from '../context/ProgressContext';
import { getLesson, lessons } from '../data/curriculum';
import { NotFoundPage } from './NotFoundPage';

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = getLesson(lessonId);
  const { progress, completeLesson } = useProgress();
  const [notice, setNotice] = useState('');

  if (!lesson) return <NotFoundPage />;

  const completed = progress.completedLessons.includes(lesson.id);
  const previous = lessons[lesson.order - 2];
  const next = lessons[lesson.order];

  function markComplete() {
    if (!lesson) return;
    const awarded = completeLesson(lesson);
    setNotice(awarded ? 'Lesson complete. You earned 10 XP.' : 'This lesson is already marked complete.');
  }

  return (
    <>
      <Seo title={lesson.title} description={lesson.summary} />
      <div className="border-b border-line bg-white/60">
        <div className="container-shell flex flex-wrap items-center gap-2 py-4 text-xs font-semibold text-[#7b877f]">
          <Link to="/learn" className="hover:text-forest">C curriculum</Link><Icon name="chevron-right" className="h-3.5 w-3.5" /><span>{lesson.module}</span><Icon name="chevron-right" className="h-3.5 w-3.5" /><span className="text-ink">Lesson {lesson.order}</span>
        </div>
      </div>
      <div className="container-shell grid gap-10 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-card p-4">
            <div className="flex items-center justify-between px-2"><p className="text-sm font-extrabold">Course lessons</p><span className="text-xs font-bold text-[#7b877f]">{progress.completedLessons.length}/{lessons.length}</span></div>
            <nav className="mt-3 grid gap-1" aria-label="Lesson navigation">
              {lessons.map((item) => (
                <Link key={item.id} to={`/learn/${item.id}`} aria-current={item.id === lesson.id ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${item.id === lesson.id ? 'bg-forest text-white' : 'text-[#647168] hover:bg-cream'}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] ${progress.completedLessons.includes(item.id) ? 'bg-lime text-ink' : item.id === lesson.id ? 'bg-white/15 text-white' : 'bg-cream text-[#7b877f]'}`}>{progress.completedLessons.includes(item.id) ? <Icon name="check" className="h-3.5 w-3.5" /> : item.order}</span>
                  <span className="line-clamp-1">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3"><span className="pill bg-lavender text-[#514778]">Lesson {String(lesson.order).padStart(2, '0')}</span><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7b877f]"><Icon name="clock" className="h-4 w-4" />{lesson.duration} min read</span><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7b877f]"><Icon name="zap" className="h-4 w-4" />10 XP</span></div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{lesson.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#647168]">{lesson.summary}</p>
          </header>

          <section className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-7" aria-labelledby="lesson-goals">
            <h2 id="lesson-goals" className="text-lg font-extrabold">By the end, you can…</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {lesson.objectives.map((objective) => <li key={objective} className="flex items-start gap-2 text-sm leading-6 text-[#647168]"><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e2f1e8] text-[#286044]"><Icon name="check" className="h-3 w-3" /></span>{objective}</li>)}
            </ul>
          </section>

          <div className="mt-10 space-y-9">
            {lesson.sections.map((section, index) => (
              <section key={section.heading} aria-labelledby={`lesson-section-${index}`}>
                <h2 id={`lesson-section-${index}`} className="text-2xl font-extrabold tracking-tight">{section.heading}</h2>
                <p className="mt-3 text-base leading-8 text-[#526258]">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10">
            <Workspace id={`lesson-${lesson.id}`} initialCode={lesson.code} />
            <div className="mt-4 rounded-2xl border border-[#d8d2f1] bg-lavender/60 p-4 text-sm leading-6 text-[#514778]"><strong className="font-extrabold">Expected output: </strong><span className="font-mono text-[13px]">{lesson.expectedOutput}</span></div>
          </div>

          <section className="mt-10 rounded-3xl bg-ink p-6 text-white sm:p-8" aria-labelledby="lesson-takeaway">
            <div className="flex items-center gap-2 text-lime"><Icon name="spark" className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Keep this idea</p></div>
            <h2 id="lesson-takeaway" className="mt-3 text-xl font-extrabold">The takeaway</h2>
            <p className="mt-2 leading-7 text-white/70">{lesson.takeaway}</p>
          </section>

          <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><p className="text-sm font-extrabold">{completed ? 'Lesson complete' : 'Ready to close this lesson?'}</p><p className="mt-1 text-sm text-[#647168]">{completed ? 'You can revisit the workspace any time.' : 'Mark it complete to record 10 XP in this browser.'}</p>{notice && <p className="mt-2 text-sm font-semibold text-forest" role="status">{notice}</p>}</div>
            <button type="button" onClick={markComplete} className={completed ? 'btn-secondary' : 'btn-primary'}><Icon name="check" className="h-4 w-4" />{completed ? 'Completed' : 'Mark complete'}</button>
          </div>

          <nav className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6" aria-label="Previous and next lessons">
            {previous ? <Link to={`/learn/${previous.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline"><Icon name="arrow-left" className="h-4 w-4" />Previous lesson</Link> : <span />}
            {next ? <Link to={`/learn/${next.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline">Next lesson<Icon name="arrow-right" className="h-4 w-4" /></Link> : <Link to="/practice" className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline">Start practice<Icon name="arrow-right" className="h-4 w-4" /></Link>}
          </nav>
        </article>
      </div>
    </>
  );
}
