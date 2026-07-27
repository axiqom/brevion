import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { withBase } from '../lib/base';

export type ExpandableCardItem = {
  id: string;
  num?: string;
  title: string;
  line: string;
  img?: string;
  alt?: string;
  objectClass?: string;
  span?: string;
  facts: string[];
  rfqSlug?: string;
  minHeightClass?: string;
};

type Props = {
  item: ExpandableCardItem;
  open: boolean;
  onToggle: () => void;
};

export function ExpandableCard({ item, open, onToggle }: Props) {
  const panelId = useId();
  const articleRef = useRef<HTMLElement>(null);
  const isDark = Boolean(item.img);
  const rfqHref = item.rfqSlug
    ? withBase(`rfq?capability=${item.rfqSlug}`)
    : withBase('rfq');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onToggle]);

  // After expand on small screens, gently bring the card into view.
  useEffect(() => {
    if (!open || !articleRef.current) return;
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    if (!narrow) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => {
      articleRef.current?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }, 180);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <article
      ref={articleRef}
      className={`group relative flex flex-col overflow-hidden rounded-xl outline-none transition-[min-height,transform] duration-300 motion-reduce:transition-none md:rounded-2xl ${
        open
          ? ''
          : (item.minHeightClass ?? 'min-h-[260px] sm:min-h-[320px] lg:min-h-[380px]')
      } ${item.span ?? ''} ${
        isDark ? 'bg-carbon' : 'border border-aluminum/35 bg-aluminum/12'
      } ${open ? '' : 'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0'}`}
    >
      {item.img ? (
        <>
          <img
            src={item.img}
            alt={item.alt ?? ''}
            className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-700 motion-reduce:transition-none ${
              item.objectClass ?? 'object-center'
            } ${open ? 'scale-[1.03] opacity-40' : 'opacity-75 group-hover:scale-[1.04] group-hover:opacity-90'}`}
            loading="lazy"
            decoding="async"
          />
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              open
                ? 'bg-gradient-to-t from-carbon via-carbon/90 to-carbon/55'
                : 'bg-gradient-to-t from-carbon/95 via-carbon/45 to-carbon/10'
            }`}
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="relative z-10 flex min-h-[inherit] flex-1 flex-col">
        <button
          type="button"
          className={`flex w-full flex-1 flex-col p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain sm:p-7 md:p-10 ${
            open ? 'pb-3 sm:pb-4 md:pb-5' : ''
          }`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          {item.num ? (
            <span
              className={`mb-4 font-display text-xl font-bold tabular-nums tracking-tight sm:mb-5 sm:text-2xl md:text-3xl ${
                isDark ? 'text-porcelain/45' : 'text-aluminum'
              }`}
            >
              {item.num}
            </span>
          ) : (
            <span className="mb-auto" aria-hidden="true" />
          )}

          <div className={`flex items-end justify-between gap-3 sm:gap-4 ${open ? '' : 'mt-auto'}`}>
            <div className="min-w-0 flex-1">
              <h3
                className={`mb-2 text-lg font-bold uppercase tracking-tight sm:text-xl md:text-2xl ${
                  isDark ? 'text-porcelain' : 'text-carbon'
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`max-w-sm text-sm font-medium leading-relaxed md:text-base ${
                  isDark ? 'text-porcelain/65' : 'text-carbon/60'
                }`}
              >
                {item.line}
              </p>
              {!open && (
                <span
                  className={`mt-3 inline-flex min-h-10 items-center text-xs font-semibold uppercase tracking-widest sm:mt-4 ${
                    isDark ? 'text-porcelain/80' : 'text-carbon/70'
                  }`}
                >
                  Take a closer look
                </span>
              )}
            </div>
            <span
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 ${
                isDark
                  ? 'border-porcelain/30 text-porcelain'
                  : 'border-aluminum/60 text-carbon'
              } ${open ? (isDark ? 'bg-porcelain/15' : 'bg-aluminum/25') : ''}`}
              aria-hidden="true"
            >
              {open ? <ChevronDown size={20} className="rotate-180" /> : <Plus size={20} />}
            </span>
          </div>
        </button>

        <div
          id={panelId}
          className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="px-5 pb-5 sm:px-7 sm:pb-7 md:px-10 md:pb-10">
              <ul
                className={`mb-5 space-y-2.5 border-t pt-4 text-sm font-medium leading-relaxed sm:mb-6 sm:pt-5 md:text-base ${
                  isDark
                    ? 'border-porcelain/15 text-porcelain/75'
                    : 'border-aluminum/35 text-carbon/70'
                }`}
              >
                {item.facts.map((fact) => (
                  <li key={fact} className="flex gap-3">
                    <span
                      className={`mt-2 h-1 w-1 shrink-0 rounded-sm ${isDark ? 'bg-gold' : 'bg-carbon'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">{fact}</span>
                  </li>
                ))}
              </ul>
              <a
                href={rfqHref}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold uppercase tracking-widest transition-colors duration-150 sm:w-auto sm:justify-start sm:px-0 ${
                  isDark
                    ? 'bg-porcelain/10 text-porcelain hover:bg-porcelain/15 hover:text-gold sm:bg-transparent'
                    : 'bg-carbon/5 text-carbon hover:text-gold sm:bg-transparent'
                }`}
              >
                Request a Quote →
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type GridProps = {
  items: ExpandableCardItem[];
  columnsClass?: string;
};

export default function ExpandableCardGrid({
  items,
  columnsClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6',
}: GridProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={`min-w-0 ${columnsClass}`}>
      {items.map((item) => (
        <ExpandableCard
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}
