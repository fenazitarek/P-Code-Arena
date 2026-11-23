import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" description="This Loopcraft page does not exist. Return to the C curriculum or practice shelf." />
      <section className="container-shell py-20 text-center sm:py-28">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-lavender text-[#514778]"><Icon name="search" className="h-8 w-8" /></span>
        <p className="eyebrow mt-6">404 · Off the path</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">This page has not been compiled yet.</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#647168]">The address may be outdated or mistyped. Your saved progress is still right where you left it.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/" className="btn-primary">Return home<Icon name="arrow-right" className="h-4 w-4" /></Link><Link to="/learn" className="btn-secondary">Open the curriculum</Link></div>
      </section>
    </>
  );
}
