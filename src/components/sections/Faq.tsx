import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Can you machine titanium and other superalloys?',
    a: 'Yes. We specialize in hard metals including Titanium (Grade 2, 5), Inconel, and various stainless steels (17-4, 304, 316). Our machines are optimized for high-torque, rigid cutting required for these materials.',
  },
  {
    q: 'What is your minimum order quantity?',
    a: 'We have no strict minimum order quantity. We frequently run single-piece prototypes as well as 10,000+ piece production runs. Our quoting engine accounts for setup times appropriately.',
  },
  {
    q: 'How does prototype pricing differ from production?',
    a: 'Prototype pricing includes the full NRE (Non-Recurring Engineering) cost for programming and initial setup. Once a part transitions to production, these costs are amortized, and the per-unit price drops significantly.',
  },
  {
    q: 'What are your standard lead times?',
    a: 'Standard lead time is 2-3 weeks for prototypes and 4-6 weeks for production runs, depending on material availability and finishing requirements. We also offer expedited services for critical deadlines.',
  },
  {
    q: 'Can you help with part design?',
    a: 'Absolutely. Our engineering team frequently consults on Design for Manufacturability (DFM) to help reduce costs, improve tolerances, and simplify assembly.',
  },
  {
    q: 'What file formats do you accept?',
    a: 'We prefer STEP (.step or .stp) models accompanied by a PDF drawing for tolerances and callouts. We can also work with native SolidWorks, Fusion 360, and DXF files.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes. We regularly work with defense, aerospace, and advanced R&D clients. We are happy to sign your NDA before you share any ITAR or proprietary files.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-zinc-800 bg-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center md:mb-20">
          <h2 className="mb-6 font-display text-4xl font-bold uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950 md:rounded-[2rem]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center justify-between px-4 py-5 text-left sm:px-6 sm:py-6 md:px-8 md:py-8"
                >
                  <span className="pr-4 text-base font-bold text-white sm:pr-6 sm:text-lg md:text-xl">{faq.q}</span>
                  <ChevronDown
                    size={22}
                    className={`shrink-0 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0 text-base font-medium leading-relaxed text-zinc-400 md:px-8 md:pb-8 md:text-lg">
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
