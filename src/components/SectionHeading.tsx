import type { ReactNode } from 'react';

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-base leading-7 text-[#647168]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
