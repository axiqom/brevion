export type FaqItem = { q: string; a: string };

/** Shared FAQ for UI + FAQPage JSON-LD. Honest facts only — no invented certs/SLA. */
export const faqs: FaqItem[] = [
  {
    q: 'What materials can you machine?',
    a: 'Brevion machines common metals and engineering plastics — including titanium, aluminum, stainless, Inconel, Delrin, PEEK, and Ultem. Tell us the material on the print and we will confirm fit.',
  },
  {
    q: 'Is there a minimum order quantity?',
    a: 'No strict MOQ. Brevion runs single-piece prototypes and larger production lots. Setup time is priced into the quote either way.',
  },
  {
    q: 'How does prototype pricing differ from production?',
    a: 'Prototype quotes include one-time setup and programming. On production runs that setup is spread across more parts, so the per-piece price usually drops.',
  },
  {
    q: 'What are your typical lead times?',
    a: 'Prototypes are often a few weeks. Production runs take longer depending on material and finish. Faster options can be discussed when deadlines are tight — we do not invent a fixed SLA on this page.',
  },
  {
    q: 'What file formats do you accept?',
    a: 'STEP (.step / .stp) plus a PDF drawing work best. SolidWorks, Fusion 360, DXF, and ZIP packages are also accepted.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes. Brevion regularly works under NDAs. We will sign yours before you share proprietary or controlled files.',
  },
  {
    q: 'How do I get a quote?',
    a: 'Use the home intake (company, work email, need), open the full RFQ with CAD when ready, or email sales@brevion.com. Chat can also hand you to Start quote or Full RFQ.',
  },
  {
    q: 'What happens after I submit?',
    a: 'This preview does not send files or email yet. Use mailto sales@brevion.com or the full RFQ path so your request still reaches the desk until a live backend is connected.',
  },
];
