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
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-150 motion-reduce:transition-none ${
        scrolled || isMobileMenuOpen
          ? 'border-b border-aluminum/40 bg-porcelain/95 shadow-[0_8px_28px_rgba(69,63,58,0.08)] backdrop-blur-xl'
          : 'bg-porcelain/80 backdrop-blur-md'
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
            <img
              src={withBase('brand/mark-dark.png')}
              alt=""
              width={40}
              height={36}
              className="h-9 w-auto shrink-0 md:h-10"
              aria-hidden="true"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold uppercase tracking-[0.14em] text-carbon sm:text-xl sm:tracking-widest md:text-2xl">
                Brevion
              </span>
              <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.3em] text-aluminum sm:block">
                Systems
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-8 lg:flex xl:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-sm text-[13px] font-semibold uppercase tracking-widest text-carbon/70 transition-colors duration-150 hover:text-gold"
              >
                {link.label}
              </a>
            ))}
            <a
              href={withBase('rfq')}
              className="group flex min-h-11 items-center gap-2 rounded-lg bg-carbon px-5 py-2.5 text-sm font-semibold uppercase tracking-widest text-porcelain transition-colors duration-150 hover:bg-gold hover:text-carbon"
              aria-current={currentPage === 'rfq' ? 'page' : undefined}
            >
              Request Quote
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>

          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-carbon lg:hidden"
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
          className="border-b border-aluminum/50 bg-porcelain px-4 pb-6 pt-1 lg:hidden"
        >
          <div className="space-y-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex min-h-11 items-center rounded-lg px-1 py-3 text-base font-semibold uppercase tracking-widest text-carbon transition-colors duration-150 hover:text-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href={withBase('rfq')}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-carbon px-5 py-4 text-sm font-semibold uppercase tracking-widest text-porcelain transition-colors duration-150 hover:bg-gold hover:text-carbon"
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
