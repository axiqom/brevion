import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Phone, X } from 'lucide-react';
import { withBase } from '../lib/base';
import { CONTACT_EMAIL, CONTACT_MAILTO, PUBLIC_PHONE } from '../lib/site';

const STORAGE_KEY = 'brevion-mobile-convert-dismissed';

export default function MobileConvertBar() {
  const [anchorVisible, setAnchorVisible] = useState(true);
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

    const target =
      document.getElementById('intake') || document.getElementById('cta');
    if (!target || typeof IntersectionObserver === 'undefined') {
      setAnchorVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAnchorVisible(entry.isIntersecting && entry.intersectionRatio > 0.12);
      },
      { root: null, threshold: [0, 0.12, 0.35, 0.6], rootMargin: '-48px 0px 0px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setChatOpen(document.body.classList.contains('has-chat-open'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const show = !dismissed && !anchorVisible && !chatOpen;

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

  const telHref = PUBLIC_PHONE
    ? `tel:${PUBLIC_PHONE.replace(/[^\d+]/g, '')}`
    : '';

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
          href={CONTACT_MAILTO}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-aluminum/50 bg-porcelain text-carbon transition-colors duration-150 hover:text-gold"
          aria-label={`Email ${CONTACT_EMAIL}`}
        >
          <Mail size={18} aria-hidden="true" />
        </a>
        {telHref ? (
          <a
            href={telHref}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-aluminum/50 bg-porcelain text-carbon transition-colors duration-150 hover:text-gold"
            aria-label={`Call ${PUBLIC_PHONE}`}
          >
            <Phone size={18} aria-hidden="true" />
          </a>
        ) : null}
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
