import { useRef, useState, type FormEvent, type DragEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  FileUp,
  Settings,
  Calendar,
  MessageSquare,
  Briefcase,
} from 'lucide-react';
import { withBase } from '../lib/base';

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Contact', 'Files', 'Details', 'Timeline', 'Review'] as const;

const inputClass =
  'w-full min-h-11 rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3.5 font-medium text-white transition-all placeholder-zinc-700 focus:border-white focus:outline-none focus:ring-1 focus:ring-white sm:px-5 sm:py-4';

const labelClass = 'mb-2.5 block text-xs font-bold uppercase tracking-widest text-zinc-400 sm:mb-3';

export default function RfqWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [animKey, setAnimKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goTo = (next: number) => {
    setStep(next);
    setAnimKey((k) => k + 1);
  };

  const handleNext = () => goTo(Math.min(step + 1, TOTAL_STEPS));
  const handlePrev = () => goTo(Math.max(step - 1, 1));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles(Array.from(e.target.files));
    }
  };

  if (isSubmitted) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 sm:py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(600px,80vw)] w-[min(600px,80vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800/30 blur-[120px]" />
        <div className="animate-fade-up relative z-10 w-full max-w-2xl rounded-[1.5rem] border border-zinc-800 bg-zinc-900/50 p-6 text-center shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-10 md:rounded-[2.5rem] md:p-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-lg sm:mb-8 sm:h-20 sm:w-20 sm:rounded-3xl md:mb-10 md:h-24 md:w-24">
            <CheckCircle2 size={40} aria-hidden="true" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-bold uppercase tracking-tight text-white sm:mb-4 sm:text-4xl md:mb-6 md:text-5xl">
            Thank you.
          </h2>
          <p className="mb-2 text-lg font-medium text-zinc-400 sm:mb-3 sm:text-xl md:mb-4 md:text-2xl">
            Your files have been received.
          </p>
          <p className="mb-8 text-sm text-zinc-500 sm:mb-10 sm:text-base md:mb-12 md:text-lg">
            An engineer will review your project and you'll hear back shortly.
          </p>
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-zinc-600 sm:mb-8">
            Preview only — nothing was submitted
          </p>
          <a
            href={withBase()}
            className="inline-flex min-h-11 items-center rounded-full bg-zinc-800 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-zinc-700 hover:text-zinc-200"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[85vh] flex-col overflow-x-hidden bg-zinc-950 px-4 py-8 pb-20 sm:py-12 md:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[min(500px,60vw)] w-[min(1000px,140vw)] -translate-x-1/2 rounded-full bg-zinc-900/50 blur-[120px]" />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="mb-8 md:mb-16">
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="truncate text-xs font-bold uppercase tracking-[0.2em] text-white">
              {STEP_LABELS[step - 1]}
            </span>
          </div>
          {/* Desktop step labels */}
          <div className="mb-3 hidden gap-1 sm:flex" aria-hidden="true">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`flex-1 text-center text-[10px] font-bold uppercase tracking-wider ${
                  i + 1 <= step ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
            <div
              className="h-full rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.35)] transition-[width] duration-300 ease-in-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex min-h-0 flex-col rounded-[1.5rem] border border-zinc-800 bg-zinc-900/50 p-4 shadow-2xl backdrop-blur-xl sm:min-h-[520px] sm:rounded-[2rem] sm:p-6 md:min-h-[600px] md:rounded-[2.5rem] md:p-12 lg:p-16"
        >
          <div key={animKey} className="animate-fade-in flex-grow">
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-6 sm:mb-8 sm:items-center sm:gap-4 sm:pb-8 md:mb-10 md:gap-5 md:pb-10">
                  <div className="shrink-0 rounded-xl bg-zinc-800 p-2.5 text-white sm:rounded-2xl sm:p-3 md:p-4">
                    <Briefcase size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    Tell us about your project.
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
                  <div>
                    <label className={labelClass} htmlFor="rfq-first">
                      First Name
                    </label>
                    <input id="rfq-first" type="text" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-last">
                      Last Name
                    </label>
                    <input id="rfq-last" type="text" required className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="rfq-company">
                      Company
                    </label>
                    <input id="rfq-company" type="text" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-email">
                      Email
                    </label>
                    <input id="rfq-email" type="email" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-phone">
                      Phone
                    </label>
                    <input id="rfq-phone" type="tel" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex h-full flex-col space-y-6 sm:space-y-8">
                <div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-6 sm:mb-8 sm:items-center sm:gap-4 sm:pb-8 md:mb-10 md:gap-5 md:pb-10">
                  <div className="shrink-0 rounded-xl bg-zinc-800 p-2.5 text-white sm:rounded-2xl sm:p-3 md:p-4">
                    <FileUp size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    Upload Files
                  </h2>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".step,.stp,.pdf,.dxf,.zip"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="flex min-h-[220px] flex-grow cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/50 p-6 transition-all hover:border-zinc-500 sm:min-h-[280px] sm:rounded-3xl sm:p-10 md:p-16"
                >
                  <UploadCloud size={48} className="mb-4 text-zinc-600 sm:mb-5 md:mb-6" aria-hidden="true" />
                  <p className="mb-2 text-center text-lg font-bold text-white sm:text-xl md:mb-3 md:text-2xl">
                    Drag & Drop files here
                  </p>
                  <p className="mb-5 text-center text-sm font-medium text-zinc-500 sm:mb-6 md:mb-8 md:text-base">
                    Supported: STEP, PDF, DXF, ZIP
                  </p>
                  <span className="inline-flex min-h-11 items-center rounded-full border border-zinc-700 bg-zinc-800 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-700">
                    Browse Files
                  </span>
                  {files.length > 0 && (
                    <div className="mt-6 w-full max-w-md sm:mt-8">
                      <p className="mb-3 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Selected Files:
                      </p>
                      <ul className="space-y-2 text-left text-sm font-medium text-zinc-300 sm:text-base">
                        {files.map((f, i) => (
                          <li key={`${f.name}-${i}`} className="flex items-start gap-3 break-all">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white" aria-hidden="true" />
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-6 sm:mb-8 sm:items-center sm:gap-4 sm:pb-8 md:mb-10 md:gap-5 md:pb-10">
                  <div className="shrink-0 rounded-xl bg-zinc-800 p-2.5 text-white sm:rounded-2xl sm:p-3 md:p-4">
                    <Settings size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    Part Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="rfq-material">
                      Material
                    </label>
                    <select id="rfq-material" className={`${inputClass} appearance-none`}>
                      <option value="">Select Material...</option>
                      <option value="aluminum">Aluminum (6061, 7075)</option>
                      <option value="stainless">Stainless Steel (304, 316, 17-4)</option>
                      <option value="titanium">Titanium (Grade 2, Ti-6Al-4V)</option>
                      <option value="plastic">Plastics (Delrin, PEEK, Ultem)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-qty">
                      Quantity
                    </label>
                    <input
                      id="rfq-qty"
                      type="number"
                      min={1}
                      placeholder="e.g. 50"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-tolerance">
                      Tolerance Requirements
                    </label>
                    <select id="rfq-tolerance" className={`${inputClass} appearance-none`}>
                      <option value="standard">Standard (±0.005")</option>
                      <option value="tight">Tight (±0.001")</option>
                      <option value="extreme">Extreme (±0.0001")</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="rfq-finish">
                      Required Finish
                    </label>
                    <input
                      id="rfq-finish"
                      type="text"
                      placeholder="e.g. As Machined, Anodize Type II Black, Bead Blast"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-6 sm:mb-8 sm:items-center sm:gap-4 sm:pb-8 md:mb-10 md:gap-5 md:pb-10">
                  <div className="shrink-0 rounded-xl bg-zinc-800 p-2.5 text-white sm:rounded-2xl sm:p-3 md:p-4">
                    <Calendar size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    Timeline
                  </h2>
                </div>
                <div className="space-y-6 sm:space-y-8 md:space-y-10">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Run Type</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
                      <label className="relative flex min-h-11 cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 shadow-sm transition-colors has-[:checked]:border-white has-[:checked]:bg-zinc-800 sm:p-5 md:p-6">
                        <input type="radio" name="runType" value="prototype" className="sr-only" />
                        <div className="flex flex-col">
                          <span className="mb-1 text-base font-bold uppercase text-white sm:mb-2 md:text-lg">
                            Prototype
                          </span>
                          <span className="text-sm font-medium text-zinc-400">1-10 parts for testing</span>
                        </div>
                      </label>
                      <label className="relative flex min-h-11 cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 shadow-sm transition-colors has-[:checked]:border-white has-[:checked]:bg-zinc-800 sm:p-5 md:p-6">
                        <input type="radio" name="runType" value="production" className="sr-only" />
                        <div className="flex flex-col">
                          <span className="mb-1 text-base font-bold uppercase text-white sm:mb-2 md:text-lg">
                            Production
                          </span>
                          <span className="text-sm font-medium text-zinc-400">Scheduled repeat runs</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-date">
                      Need By Date
                    </label>
                    <input
                      id="rfq-date"
                      type="date"
                      className={`${inputClass} [color-scheme:dark]`}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-6 sm:mb-8 sm:items-center sm:gap-4 sm:pb-8 md:mb-10 md:gap-5 md:pb-10">
                  <div className="shrink-0 rounded-xl bg-zinc-800 p-2.5 text-white sm:rounded-2xl sm:p-3 md:p-4">
                    <MessageSquare size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    Anything else?
                  </h2>
                </div>
                <div>
                  <label className={labelClass} htmlFor="rfq-notes">
                    Additional Notes
                  </label>
                  <textarea
                    id="rfq-notes"
                    rows={6}
                    placeholder="Tell us about specific challenges, end-use environment, required certifications (e.g. AS9100, ITAR), or assembly needs."
                    className={`${inputClass} min-h-[10rem] resize-none`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-800 pt-5 sm:mt-10 sm:pt-6 md:mt-16 md:pt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex min-h-11 items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200 sm:px-8 md:px-10 md:py-4"
              >
                Next <ArrowRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200 sm:px-8 md:px-10 md:py-4"
              >
                Submit Project
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
