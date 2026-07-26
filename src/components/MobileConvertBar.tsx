import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { withBase } from '../lib/base';

const STORAGE_KEY = 'milltrue-mobile-convert-dismissed';

export default function MobileConvertBar() {
  const [visible, setVisible] = useState(false);
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

    const onScroll = () => {
      setVisible(window.scrollY > Math.min(window.innerHeight * 0.55, 480));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const show = !dismissed && visible;
    document.body.classList.toggle('has-mobile-convert', show);
    return () => document.body.classList.remove('has-mobile-convert');
  }, [dismissed, visible]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[45] bg-zinc-950/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl motion-reduce:transition-none md:hidden"
      role="region"
      aria-label="Quick contact"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <a
          href="#intake"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-4 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Request quote
        </a>
        <a
          href={withBase('rfq')}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-zinc-800 px-4 text-xs font-bold uppercase tracking-widest text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Full RFQ
          <ArrowRight size={14} aria-hidden="true" />
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

