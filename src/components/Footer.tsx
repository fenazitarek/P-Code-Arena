import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const footerLinks = [
  { to: '/learn', label: 'Learn C' },
  { to: '/practice', label: 'Practice' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/arena', label: 'Timed arena' },
  { to: '/guide', label: 'How it works' },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#647168]">A local-first studio for learning C through short lessons, real compilation, and deliberate practice.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Explore</h2>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.to}><Link className="text-sm text-[#647168] transition hover:text-forest" to={link.to}>{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Local by design</h2>
          <p className="mt-4 text-sm leading-6 text-[#647168]">Your progress stays in this browser. Code runs on your own machine through the local GCC workspace.</p>
          <Link to="/guide" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">Read the workspace guide</Link>
        </div>
      </div>
      <div className="border-t border-line py-5">
        <div className="container-shell flex flex-col gap-2 text-xs text-[#7b877f] sm:flex-row sm:items-center sm:justify-between">
          <p>Loopcraft · Original local learning project</p>
          <p>Built for curiosity, not comparison.</p>
        </div>
      </div>
    </footer>
  );
}
