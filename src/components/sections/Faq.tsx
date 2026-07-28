import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../../lib/faq';
import { withBase } from '../../lib/base';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../../lib/site';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="scroll-mt-28 border-t border-aluminum/40 bg-aluminum/10 py-20 sm:py-24 md:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-aluminum">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-display text-3xl font-bold uppercase tracking-tight text-carbon md:text-4xl lg:text-5xl"
          >
            Answers buyers ask first
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-carbon/60 md:text-lg">
            Materials, MOQ, lead times, files, NDA, and how to start a quote with Brevion.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border border-aluminum/35 bg-porcelain shadow-[0_10px_28px_rgba(69,63,58,0.06)]"
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex min-h-11 w-full items-center justify-between px-4 py-5 text-left sm:px-6 sm:py-6 md:px-8 md:py-8"
                  >
                    <span className="pr-4 text-base font-bold text-carbon sm:pr-6 sm:text-lg md:text-xl">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={22}
                      className={`shrink-0 text-aluminum transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0 text-base font-medium leading-relaxed text-carbon/65 md:px-8 md:pb-8 md:text-lg">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:justify-center sm:gap-4">
          <a
            href={withBase('rfq')}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-carbon px-6 py-3 text-xs font-semibold uppercase tracking-widest text-porcelain transition-colors duration-150 hover:bg-gold hover:text-carbon sm:min-h-11 sm:w-auto sm:text-sm"
          >
            Request a Quote
          </a>
          <a
            href={CONTACT_MAILTO}
            className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-widest text-carbon transition-colors duration-150 hover:text-gold"
          >
            Email {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </section>
  );
}
