import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { withBase } from '../lib/base';

interface HeaderProps {
  currentPage?: 'home' | 'rfq';
}

const navLinks = [
  { label: 'Capabilities', href: withBase('#capabilities') },
  { label: 'Proof', href: withBase('#proof') },
  { label: 'Projects', href: withBase('#projects') },
  { label: 'Contact', href: withBase('#intake') },
];

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-200 motion-reduce:transition-none ${
        scrolled || isMobileMenuOpen
          ? 'bg-zinc-950/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl'
          : 'bg-zinc-950/55 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-[4.5rem]">
          <a
            href={withBase()}
            className="group flex min-h-11 items-center gap-2.5 rounded-lg sm:gap-3"
            aria-label="Brevion home"
            aria-current={currentPage === 'home' ? 'page' : undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white md:h-10 md:w-10">
              <img
                src={withBase('brevion-mark.svg')}
                alt=""
                width={22}
                height={22}
                className="h-5 w-5 md:h-[22px] md:w-[22px]"
                aria-hidden="true"
              />
            </div>
            <span className="font-display text-lg font-bold uppercase tracking-[0.14em] text-white sm:text-xl sm:tracking-widest md:text-2xl">
              Brevion
            </span>
          </a>

          <div className="hidden items-center gap-8 lg:flex xl:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-sm text-[13px] font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href={withBase('rfq')}
              className="group flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
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
          className="border-b border-zinc-800/50 bg-zinc-950 px-4 pb-6 pt-1 lg:hidden"
        >
          <div className="space-y-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex min-h-11 items-center rounded-lg px-1 py-3 text-base font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href={withBase('rfq')}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
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
