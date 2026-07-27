import { useEffect, useState } from 'react';
import { ArrowRight, Mail, X } from 'lucide-react';
import { withBase } from '../lib/base';

const STORAGE_KEY = 'brevion-mobile-convert-dismissed';

export default function MobileConvertBar() {
  const [ctaVisible, setCtaVisible] = useState(true);
  const [dismissed, setDismissed] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

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

    const cta = document.getElementById('cta');
    if (!cta || typeof IntersectionObserver === 'undefined') {
      setCtaVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCtaVisible(entry.isIntersecting && entry.intersectionRatio > 0.12);
      },
      { root: null, threshold: [0, 0.12, 0.35, 0.6], rootMargin: '-48px 0px 0px 0px' },
    );
    observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  // Yield bottom chrome to the chat panel while it is open.
  useEffect(() => {
    const sync = () => setChatOpen(document.body.classList.contains('has-chat-open'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const show = !dismissed && !ctaVisible && !chatOpen;

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
      className="mobile-convert-bar fixed inset-x-0 bottom-0 z-[45] border-t border-aluminum/40 bg-porcelain/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_28px_rgba(69,63,58,0.10)] backdrop-blur-xl motion-reduce:transition-none md:hidden"
      role="region"
      aria-label="Quick contact"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <a
          href={withBase('rfq')}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-carbon px-3 text-xs font-semibold uppercase tracking-widest text-porcelain transition-colors duration-150 hover:bg-gold hover:text-carbon"
        >
          Request a Quote
          <ArrowRight size={14} aria-hidden="true" />
        </a>
        <a
          href="mailto:sales@brevion.com"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-aluminum/50 bg-porcelain text-carbon transition-colors duration-150 hover:text-gold"
          aria-label="Email sales@brevion.com"
        >
          <Mail size={18} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-aluminum/50 bg-porcelain text-aluminum transition-colors duration-150 hover:text-carbon"
          aria-label="Dismiss convert bar"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
