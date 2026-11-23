import { Link } from 'react-router-dom';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 rounded-full" aria-label="Loopcraft home">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${light ? 'bg-lime text-ink' : 'bg-ink text-lime'}`}>
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m7 7-4 5 4 5M17 7l4 5-4 5M14 5l-4 14" />
        </svg>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Loopcraft</span>
    </Link>
  );
}
