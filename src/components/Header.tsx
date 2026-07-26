import { useState } from 'react';
import { Menu, X, ArrowRight, Cuboid } from 'lucide-react';

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
            className="group flex items-center gap-3 rounded-lg"
            aria-label="AERIS home"
            aria-current={currentPage === 'home' ? 'page' : undefined}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-950 transition-transform group-hover:scale-105 md:h-10 md:w-10">
              <Cuboid size={20} aria-hidden="true" />
            </div>
            <span className="font-display text-xl font-bold uppercase tracking-widest text-white md:text-2xl">
              AERIS
            </span>
          </a>

          <div className="hidden items-center space-x-8 md:flex lg:space-x-10">
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
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
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
            className="rounded-lg p-2 text-white md:hidden"
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
          className="space-y-1 border-b border-zinc-800 bg-zinc-950 px-4 pb-6 pt-2 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block rounded-lg py-3 text-base font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/rfq"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
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
