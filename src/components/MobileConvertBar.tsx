import { useEffect, useState } from 'react';
import { ArrowRight, Mail, X } from 'lucide-react';
import { withBase } from '../lib/base';

const STORAGE_KEY = 'milltrue-mobile-convert-dismissed';

export default function MobileConvertBar() {
  const [intakeVisible, setIntakeVisible] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setDismissed(false);

    const intake = document.getElementById('intake');
    if (!intake || typeof IntersectionObserver === 'undefined') {
      setIntakeVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntakeVisible(entry.isIntersecting && entry.intersectionRatio > 0.12);
      },
      { root: null, threshold: [0, 0.12, 0.35, 0.6], rootMargin: '-48px 0px 0px 0px' },
    );
    observer.observe(intake);
    return () => observer.disconnect();
  }, []);

  const show = !dismissed && !intakeVisible;

  useEffect(() => {
    document.body.classList.toggle('has-mobile-convert', show);
    return () => document.body.classList.remove('has-mobile-convert');
  }, [show]);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[45] bg-zinc-950/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl motion-reduce:transition-none md:hidden"
      role="region"
      aria-label="Quick contact"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <a
          href="#intake"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-3 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Request quote
        </a>
        <a
          href={withBase('rfq')}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-zinc-800 px-3 text-xs font-bold uppercase tracking-widest text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Full RFQ
          <ArrowRight size={14} aria-hidden="true" />
        </a>
        <a
          href="mailto:sales@milltrue.com"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          aria-label="Email sales@milltrue.com"
        >
          <Mail size={18} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          aria-label="Dismiss convert bar"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
