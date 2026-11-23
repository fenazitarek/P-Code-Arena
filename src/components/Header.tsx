import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { ProfileDialog } from './ProfileDialog';

const navItems = [
  { to: '/learn', label: 'Learn' },
  { to: '/practice', label: 'Practice' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/arena', label: 'Timed arena' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/guide', label: 'Guide' },
];

export function Header() {
  const { progress, xp, level } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur-xl">
        <div className="container-shell flex h-[76px] items-center justify-between gap-5">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-forest shadow-sm' : 'text-[#647168] hover:bg-white/70 hover:text-ink'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard" className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 sm:flex" aria-label={`Dashboard, ${xp} XP, ${level.name} level`}>
              <Icon name="zap" className="h-4 w-4 text-forest" />
              <span className="text-sm font-extrabold">{xp}</span>
              <span className="text-xs font-semibold text-[#7b877f]">XP</span>
            </NavLink>
            <button type="button" onClick={() => setProfileOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-sm font-extrabold text-white transition hover:bg-ink" aria-label={`Open profile for ${progress.displayName}`}>
              {initials(progress.displayName)}
            </button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white lg:hidden" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" className="border-t border-line bg-white px-5 pb-5 pt-3 lg:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-[1200px] gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? 'bg-cream text-forest' : 'text-[#647168]'}`}>
                  {item.label}<Icon name="chevron-right" className="h-4 w-4" />
                </NavLink>
              ))}
              <NavLink to="/dashboard" className="mt-2 flex items-center justify-between rounded-xl bg-forest px-3 py-3 text-sm font-semibold text-white">
                Your dashboard <span>{xp} XP</span>
              </NavLink>
            </div>
          </nav>
        )}
      </header>
      {profileOpen && <ProfileDialog onClose={closeProfile} />}
    </>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LC';
}
