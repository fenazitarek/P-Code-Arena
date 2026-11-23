import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const { progress, xp, level, levelProgress, setDisplayName, resetProgress } = useProgress();
  const [name, setName] = useState(progress.displayName);
  const [resetArmed, setResetArmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDisplayName(name);
    setSaved(true);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="profile-title" onKeyDown={handleDialogKeyDown} className="max-h-[90vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Your local profile</p>
            <h2 id="profile-title" className="mt-2 text-2xl font-extrabold tracking-tight">A learner, not a leaderboard number.</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-[#647168] hover:bg-cream" aria-label="Close profile">
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-cream p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#647168]">Current level</p>
              <p className="mt-1 text-xl font-extrabold">{level.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-forest">{xp}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7b877f]">total XP</p>
            </div>
          </div>
          <ProgressBar value={levelProgress.percent} label={`Progress to the next level: ${levelProgress.percent}%`} className="mt-4" />
          <p className="mt-2 text-xs text-[#647168]">{levelProgress.remaining ? `${levelProgress.remaining} XP to ${getNextLevelName(xp)}` : 'You reached the highest local level.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="display-name" className="field-label">Display name</label>
          <div className="flex gap-2">
            <input ref={inputRef} id="display-name" className="field-input" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} maxLength={32} autoComplete="nickname" />
            <button type="submit" className="btn-primary shrink-0">Save</button>
          </div>
          <p className="mt-2 min-h-5 text-xs text-[#647168]" aria-live="polite">{saved ? 'Saved in this browser.' : 'Used on your local rankings page.'}</p>
        </form>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line p-4">
            <p className="text-2xl font-extrabold">{progress.completedLessons.length}</p>
            <p className="mt-1 text-xs font-semibold text-[#647168]">lessons complete</p>
          </div>
          <div className="rounded-2xl border border-line p-4">
            <p className="text-2xl font-extrabold">{progress.completedProblems.length}</p>
            <p className="mt-1 text-xs font-semibold text-[#647168]">problems solved</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#ead7b8] bg-[#fff9ef] p-4">
          <div className="flex items-start gap-3">
            <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-[#8a5a12]" />
            <div>
              <p className="text-sm font-bold text-[#74501b]">Reset local progress</p>
              <p className="mt-1 text-xs leading-5 text-[#806b4b]">This removes completed lessons, solved problems, XP, arena times, and activity from this browser. It cannot be undone.</p>
              {resetArmed ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="rounded-full bg-[#934141] px-4 py-2 text-xs font-bold text-white" onClick={() => { resetProgress(); setResetArmed(false); setSaved(false); }}>Yes, reset everything</button>
                  <button type="button" className="rounded-full border border-[#d9c7aa] px-4 py-2 text-xs font-bold text-[#74501b]" onClick={() => setResetArmed(false)}>Cancel</button>
                </div>
              ) : (
                <button type="button" className="mt-3 text-xs font-bold text-[#934141] underline underline-offset-4" onClick={() => setResetArmed(true)}>Reset my progress</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNextLevelName(xp: number) {
  if (xp < 150) return 'Builder';
  if (xp < 500) return 'Explorer';
  if (xp < 1000) return 'Trailblazer';
  if (xp < 2000) return 'Mentor';
  return 'Mentor';
}
