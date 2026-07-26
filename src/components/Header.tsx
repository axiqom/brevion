import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentPage?: 'home' | 'rfq';
}

const navLinks = [
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Industries', href: '/#industries' },
  { label: 'Projects', href: '/#projects' },
  { label: 'About', href: '/#about' },
  { label: 'Resources', href: '/#resources' },
];

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <a
            href="/"
            className="group flex min-h-11 items-center gap-2.5 rounded-lg sm:gap-3"
            aria-label="MillTrue home"
            aria-current={currentPage === 'home' ? 'page' : undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white transition-transform group-hover:scale-105 md:h-10 md:w-10">
              <img
                src="/milltrue-mark.svg"
                alt=""
                width={22}
                height={22}
                className="h-5 w-5 md:h-[22px] md:w-[22px]"
                aria-hidden="true"
              />
            </div>
            <span className="font-display text-lg font-bold uppercase tracking-[0.14em] text-white sm:text-xl sm:tracking-widest md:text-2xl">
              MillTrue
            </span>
          </a>

          <div className="hidden items-center space-x-6 lg:flex lg:space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-sm text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/rfq"
              className="group flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
              aria-current={currentPage === 'rfq' ? 'page' : undefined}
            >
              Request Quote
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>

          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-white lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="space-y-1 border-b border-zinc-800 bg-zinc-950 px-4 pb-6 pt-2 lg:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex min-h-11 items-center rounded-lg py-3 text-base font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/rfq"
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={currentPage === 'rfq' ? 'page' : undefined}
          >
            Request Quote
          </a>
        </div>
      )}
    </nav>
  );
}
