import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What materials can you machine?',
    a: 'Common metals and engineering plastics — including titanium, aluminum, stainless, Inconel, Delrin, PEEK, and Ultem. Tell us the material and we will confirm fit.',
  },
  {
    q: 'Is there a minimum order quantity?',
    a: 'No strict minimum. We run single-piece prototypes and larger production runs. Setup time is priced into the quote either way.',
  },
  {
    q: 'How does prototype pricing differ from production?',
    a: 'Prototype quotes include the one-time setup and programming work. On production runs, that setup is spread across more parts, so the per-piece price usually drops.',
  },
  {
    q: 'What are your typical lead times?',
    a: 'Prototypes are often a few weeks. Production runs take a bit longer, depending on material and finish. We can discuss faster options when deadlines are tight.',
  },
  {
    q: 'Can you help with part design?',
    a: 'Yes. We review your design before we cut metal — and suggest changes that make parts easier or cheaper to make when it helps.',
  },
  {
    q: 'What file formats do you accept?',
    a: 'STEP models (.step or .stp) plus a PDF drawing work best. We also take SolidWorks, Fusion 360, DXF, and ZIP packages.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes. We regularly work under NDAs. Happy to sign yours before you share proprietary or controlled files.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-aluminum/40 bg-aluminum/10 py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-14">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-carbon md:text-4xl lg:text-5xl">
            FAQ
          </h2>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border border-aluminum/35 bg-porcelain shadow-[0_10px_28px_rgba(69,63,58,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center justify-between px-4 py-5 text-left sm:px-6 sm:py-6 md:px-8 md:py-8"
                >
                  <span className="pr-4 text-base font-bold text-carbon sm:pr-6 sm:text-lg md:text-xl">{faq.q}</span>
                  <ChevronDown
                    size={22}
                    className={`shrink-0 text-aluminum transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
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
      </div>
    </section>
  );
}
