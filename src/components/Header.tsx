import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { withBase } from '../lib/base';
import BrandLogo from './BrandLogo';

export type HeaderPage =
  | 'home'
  | 'capabilities'
  | 'industries'
  | 'work'
  | 'rfq'
  | 'about';

interface HeaderProps {
  currentPage?: HeaderPage;
}

const navLinks: { label: string; href: string; page?: HeaderPage }[] = [
  { label: 'Home', href: withBase(), page: 'home' },
  { label: 'Capabilities', href: withBase('capabilities'), page: 'capabilities' },
  { label: 'Industries', href: withBase('industries'), page: 'industries' },
  { label: 'Work', href: withBase('work'), page: 'work' },
  // Off-home pages land on home process section via /#process (base-aware).
  { label: 'Process', href: withBase('#process') },
];

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock + Escape + focus trap while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }
    document.documentElement.classList.add('nav-open');

    const focusables = () => {
      const roots = [menuRef.current, toggleRef.current].filter(Boolean) as HTMLElement[];
      return roots.flatMap((root) =>
        root === toggleRef.current
          ? [root]
          : Array.from(
              root.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
              ),
            ),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    // Move focus into the drawer for screen readers / keyboard users.
    const firstLink = menuRef.current?.querySelector<HTMLElement>('a, button');
    window.setTimeout(() => firstLink?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.documentElement.classList.remove('nav-open');
      window.removeEventListener('keydown', onKey);
      toggleRef.current?.focus();
    };
  }, [isMobileMenuOpen]);

  // Close drawer when viewport crosses into desktop nav.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setIsMobileMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-150 motion-reduce:transition-none ${
        scrolled || isMobileMenuOpen
          ? 'border-b border-aluminum/40 bg-porcelain/95 shadow-[0_8px_28px_rgba(69,63,58,0.08)] backdrop-blur-xl'
          : 'bg-porcelain/80 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16 md:h-[4.5rem]">
          <a
            href={withBase()}
            className="group flex min-h-11 max-w-[min(100%,11.5rem)] items-center gap-2.5 rounded-lg sm:max-w-none sm:gap-3"
            aria-label="Brevion home"
            aria-current={currentPage === 'home' ? 'page' : undefined}
            onClick={closeMenu}
          >
            <BrandLogo surface="header" />
          </a>

          <div className="hidden items-center gap-7 lg:flex xl:gap-9">
            {navLinks.map((link) => {
              const active = link.page != null && currentPage === link.page;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`rounded-sm text-[13px] font-semibold uppercase tracking-widest transition-colors duration-150 hover:text-gold ${
                    active ? 'text-carbon' : 'text-carbon/70'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href={withBase('rfq')}
              className="group flex min-h-11 items-center gap-2 rounded-lg bg-carbon px-5 py-2.5 text-sm font-semibold uppercase tracking-widest text-porcelain transition-colors duration-150 hover:bg-gold hover:text-carbon"
              aria-current={currentPage === 'rfq' ? 'page' : undefined}
            >
              Request a Quote
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-carbon lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls={menuId}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          className="border-b border-aluminum/50 bg-porcelain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="mx-auto max-w-7xl space-y-0.5">
            {navLinks.map((link) => {
              const active = link.page != null && currentPage === link.page;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex min-h-12 items-center rounded-lg px-2 py-3.5 text-base font-semibold uppercase tracking-widest transition-colors duration-150 hover:text-gold ${
                    active ? 'bg-aluminum/15 text-carbon' : 'text-carbon'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href={withBase('rfq')}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-carbon px-5 py-4 text-sm font-semibold uppercase tracking-widest text-porcelain transition-colors duration-150 hover:bg-gold hover:text-carbon"
              onClick={closeMenu}
              aria-current={currentPage === 'rfq' ? 'page' : undefined}
            >
              Request a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
