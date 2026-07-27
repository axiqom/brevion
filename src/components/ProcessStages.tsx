import { useState } from 'react';

const stages = [
  {
    label: 'Upload CAD',
    fact: 'STEP or drawing. We confirm material and quantity before review.',
  },
  {
    label: 'Review',
    fact: 'Design and manufacturability check. Questions back if geometry needs clarity.',
  },
  {
    label: 'Quote',
    fact: 'Lead time and price for the scope you sent. No platform markup language.',
  },
  {
    label: 'Manufacture',
    fact: 'Programmed and cut on multi-axis equipment for the approved process.',
  },
  {
    label: 'Inspect',
    fact: 'Dimensional checks at defined stages. Documentation when specified.',
  },
  {
    label: 'Deliver',
    fact: 'Parts packed and shipped to the address on the order.',
  },
];

export default function ProcessStages() {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <div>
      <div
        className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-6 md:gap-3 md:overflow-visible md:pb-0"
        role="tablist"
        aria-label="Manufacturing process stages"
      >
        {stages.map((s, idx) => {
          const selected = idx === active;
          return (
            <button
              key={s.label}
              type="button"
              role="tab"
              id={`process-tab-${idx}`}
              aria-selected={selected}
              aria-controls="process-panel"
              tabIndex={selected ? 0 : -1}
              className={`min-h-11 shrink-0 rounded-xl border px-4 py-4 text-left transition-colors duration-150 md:rounded-2xl md:px-5 md:py-6 ${
                selected
                  ? 'border-carbon bg-carbon text-porcelain'
                  : 'border-aluminum/30 bg-aluminum/10 text-carbon hover:border-aluminum/60'
              }`}
              onClick={() => setActive(idx)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  setActive((i) => (i + 1) % stages.length);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setActive((i) => (i - 1 + stages.length) % stages.length);
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  setActive(0);
                } else if (e.key === 'End') {
                  e.preventDefault();
                  setActive(stages.length - 1);
                }
              }}
            >
              <span
                className={`mb-3 block font-display text-xl font-bold tabular-nums tracking-tight md:text-2xl ${
                  selected ? 'text-porcelain/45' : 'text-aluminum'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="block text-sm font-semibold uppercase tracking-wide md:text-base">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="process-panel"
        role="tabpanel"
        aria-labelledby={`process-tab-${active}`}
        className="mt-8 rounded-xl border border-aluminum/30 bg-aluminum/10 px-6 py-7 md:mt-10 md:rounded-2xl md:px-8 md:py-9"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-aluminum">
          {stage.label}
        </p>
        <p className="max-w-2xl text-base font-medium leading-relaxed text-carbon md:text-lg">
          {stage.fact}
        </p>
      </div>
    </div>
  );
}
