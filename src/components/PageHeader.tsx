import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-white/60">
      <div className="container-shell py-12 sm:py-16">
        <div className="max-w-3xl animate-fade-up">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-ink sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5d6b62] sm:text-lg">{description}</p>
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}
