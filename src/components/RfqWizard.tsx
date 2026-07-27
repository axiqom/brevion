import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type DragEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
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
  X,
  Shield,
} from 'lucide-react';
import { withBase } from '../lib/base';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Contact', 'Files', 'Details', 'Timeline', 'Review'] as const;
const DRAFT_KEY = 'brevion-rfq-draft';
const MAX_FILE_MB = 50;
const ACCEPT =
  '.step,.stp,.iges,.igs,.pdf,.dxf,.dwg,.sldprt,.sldasm,.zip';

const CAPABILITY_NOTES: Record<string, string> = {
  engineering: 'Capability focus: Engineering / DFM — CAD review and manufacturability before cut.',
  manufacturing: 'Capability focus: Manufacturing — 3/4/5-axis mill, CNC turn, proto → production.',
  quality: 'Capability focus: Quality — CMM, AS9102 FAI when required, material traceability.',
  finishing: 'Capability focus: Finishing — anodize Type II/III, powder coat, heat treat, hardware.',
};

type Draft = {
  step: number;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  material: string;
  qty: string;
  tolerance: string;
  finish: string;
  runType: string;
  needBy: string;
  notes: string;
  capability: string;
  fileNames: string[];
};

const emptyDraft = (): Draft => ({
  step: 1,
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  material: '',
  qty: '',
  tolerance: 'standard',
  finish: '',
  runType: '',
  needBy: '',
  notes: '',
  capability: '',
  fileNames: [],
});

const inputClass =
  'w-full min-h-11 rounded-xl bg-zinc-800/70 px-3.5 py-3.5 text-sm font-medium text-white transition-colors placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 sm:rounded-2xl sm:px-4 sm:py-3.5';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400 sm:mb-2';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    return { ...emptyDraft(), ...JSON.parse(raw) };
  } catch {
    return emptyDraft();
  }
}

function saveDraft(draft: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export default function RfqWizard() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadDraft();
    const params = new URLSearchParams(window.location.search);
    const cap = (params.get('capability') || '').toLowerCase().trim();
    if (cap && CAPABILITY_NOTES[cap]) {
      loaded.capability = cap;
      if (!loaded.notes.includes(CAPABILITY_NOTES[cap])) {
        loaded.notes = loaded.notes
          ? `${loaded.notes}\n\n${CAPABILITY_NOTES[cap]}`
          : CAPABILITY_NOTES[cap];
      }
    }
    setDraft(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isSubmitted) return;
    saveDraft({
      ...draft,
      fileNames: files.map((f) => f.name),
    });
  }, [draft, files, hydrated, isSubmitted]);

  const update = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), TOTAL_STEPS);
    setDraft((prev) => ({ ...prev, step: clamped }));
    setAnimKey((k) => k + 1);
  };

  const handleNext = () => goTo(draft.step + 1);
  const handlePrev = () => goTo(draft.step - 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    clearDraft();
    setIsSubmitted(true);
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    setFiles((prev) => {
      const names = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const merged = [...prev];
      for (const f of incoming) {
        const key = `${f.name}:${f.size}`;
        if (!names.has(key)) {
          merged.push(f);
          names.add(key);
        }
      }
      return merged;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const step = draft.step;

  if (isSubmitted) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 sm:py-16">
        <div className="animate-fade-up relative z-10 w-full max-w-2xl rounded-[1.5rem] bg-zinc-900/60 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-10 md:rounded-[2.5rem] md:p-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-zinc-950 sm:mb-8 sm:h-20 sm:w-20 sm:rounded-3xl">
            <CheckCircle2 size={40} aria-hidden="true" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-bold uppercase tracking-tight text-white sm:mb-4 sm:text-4xl">
            RFQ received
          </h2>
          <p className="mb-2 text-base font-medium text-zinc-300 sm:text-lg">
            Preview only — nothing was uploaded or emailed.
          </p>
          <p className="mb-8 text-sm leading-relaxed text-zinc-400 sm:mb-10 sm:text-base">
            When production intake is live, an engineer reviews your package and replies within{' '}
            <span className="text-white">24h</span> with a quote path and DFM notes.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href={withBase()}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Home
            </a>
            <a
              href={withBase('#intake')}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-800 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-700"
            >
              Talk again
            </a>
            <a
              href="mailto:sales@brevion.com"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
            >
              Email sales
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[85vh] flex-col overflow-x-hidden bg-zinc-950 px-4 py-8 pb-20 sm:py-12 md:py-20">
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="mb-6 md:mb-10">
          <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white sm:h-9 sm:w-9">
              <img
                src={withBase('brevion-mark.svg')}
                alt=""
                width={18}
                height={18}
                className="h-4 w-4"
                aria-hidden="true"
              />
            </div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
              Brevion RFQ
            </p>
          </div>
          <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl md:mb-8">
            Request a quote
          </h1>
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="truncate text-xs font-bold uppercase tracking-[0.2em] text-white">
              {STEP_LABELS[step - 1]}
            </span>
          </div>
          <div className="mb-3 hidden gap-1 sm:flex" aria-label="RFQ steps">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => goTo(n)}
                  className={`flex-1 rounded-lg px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-zinc-800/80 text-white'
                      : done
                        ? 'text-zinc-300 hover:text-white'
                        : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <span className="block tabular-nums text-zinc-500">{n}</span>
                  {label}
                </button>
              );
            })}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900/80">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {step < TOTAL_STEPS ? (
            <p className="mt-3 text-xs font-medium text-zinc-500">
              Up next:{' '}
              {STEP_LABELS.slice(step)
                .map((l) => l)
                .join(' → ')}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex min-h-0 flex-col rounded-2xl bg-zinc-900/60 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:min-h-[520px] sm:rounded-3xl sm:p-6 md:min-h-[560px] md:p-10 lg:p-12"
        >
          <div key={animKey} className="animate-fade-in flex-grow">
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-2 flex items-start gap-3 border-b border-zinc-800/60 pb-6 sm:items-center sm:gap-4 sm:pb-8">
                  <div className="shrink-0 rounded-xl bg-zinc-800/90 p-2.5 text-white sm:rounded-2xl sm:p-3">
                    <Briefcase size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                      Who should we reach?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-base">
                      Start with contact details. Next you&apos;ll upload CAD/drawings, then part
                      specs and timeline — draft saves automatically in this browser.
                    </p>
                  </div>
                </div>
                {draft.capability && CAPABILITY_NOTES[draft.capability] ? (
                  <p className="rounded-2xl bg-zinc-800/50 px-4 py-3 text-sm font-medium text-zinc-300">
                    Prefill: {CAPABILITY_NOTES[draft.capability]}
                  </p>
                ) : null}
                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
                  <div>
                    <label className={labelClass} htmlFor="rfq-first">
                      First Name
                    </label>
                    <input
                      id="rfq-first"
                      type="text"
                      autoComplete="given-name"
                      required
                      className={inputClass}
                      value={draft.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-last">
                      Last Name
                    </label>
                    <input
                      id="rfq-last"
                      type="text"
                      autoComplete="family-name"
                      required
                      className={inputClass}
                      value={draft.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="rfq-company">
                      Company
                    </label>
                    <input
                      id="rfq-company"
                      type="text"
                      autoComplete="organization"
                      required
                      className={inputClass}
                      value={draft.company}
                      onChange={(e) => update('company', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-email">
                      Work email
                    </label>
                    <input
                      id="rfq-email"
                      type="email"
                      autoComplete="email"
                      required
                      className={inputClass}
                      value={draft.email}
                      onChange={(e) => update('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-phone">
                      Phone <span className="normal-case tracking-normal text-zinc-600">(optional)</span>
                    </label>
                    <input
                      id="rfq-phone"
                      type="tel"
                      autoComplete="tel"
                      className={inputClass}
                      value={draft.phone}
                      onChange={(e) => update('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex h-full flex-col space-y-6 sm:space-y-8">
                <div className="mb-2 flex items-start gap-3 border-b border-zinc-800/60 pb-6 sm:items-center sm:gap-4 sm:pb-8">
                  <div className="shrink-0 rounded-xl bg-zinc-800/90 p-2.5 text-white sm:rounded-2xl sm:p-3">
                    <FileUp size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                      Upload CAD & drawings
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      STEP + PDF preferred. Files stay in this browser only until production upload is wired.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-zinc-800/40 px-4 py-3.5">
                  <Shield size={18} className="mt-0.5 shrink-0 text-zinc-300" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-zinc-300">
                    <span className="font-bold text-white">NDA-ready.</span> We regularly sign NDAs
                    before ITAR or proprietary files leave your firewall. Prefer to NDA first?{' '}
                    <a
                      href="mailto:sales@brevion.com?subject=NDA%20before%20RFQ"
                      className="text-white underline-offset-2 hover:underline"
                    >
                      Email sales@brevion.com
                    </a>
                    .
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`flex min-h-[200px] flex-grow cursor-pointer flex-col items-center justify-center rounded-2xl bg-zinc-800/40 p-6 transition-colors focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-[240px] sm:rounded-3xl sm:p-10 ${
                    dragOver ? 'bg-zinc-800/70 ring-1 ring-white/30' : 'hover:bg-zinc-800/55'
                  }`}
                  aria-label="Upload CAD or drawing files"
                >
                  <UploadCloud size={44} className="mb-4 text-zinc-500" aria-hidden="true" />
                  <p className="mb-2 text-center text-lg font-bold text-white sm:text-xl">
                    Drag & drop files here
                  </p>
                  <p className="mb-1 text-center text-sm font-medium text-zinc-400">
                    STEP, IGES, PDF, DXF, DWG, SolidWorks, ZIP
                  </p>
                  <p className="mb-5 text-center text-xs font-medium text-zinc-500">
                    Up to ~{MAX_FILE_MB} MB per file in production · preview keeps names only across reloads
                  </p>
                  <span className="inline-flex min-h-11 items-center rounded-full bg-zinc-800 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-700">
                    Browse files
                  </span>
                </div>

                {files.length > 0 ? (
                  <ul className="flex flex-wrap gap-2" aria-label="Selected files">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${f.size}-${i}`}
                        className="inline-flex max-w-full items-center gap-2 rounded-full bg-zinc-800/80 py-2 pl-3.5 pr-2 text-sm font-medium text-zinc-200"
                      >
                        <CheckCircle2 size={14} className="shrink-0 text-zinc-400" aria-hidden="true" />
                        <span className="truncate">{f.name}</span>
                        <span className="shrink-0 text-xs text-zinc-500">{formatBytes(f.size)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : draft.fileNames.length > 0 ? (
                  <p className="text-xs font-medium text-zinc-500">
                    Previous draft listed: {draft.fileNames.join(', ')}. Re-select files to attach them
                    again in this session.
                  </p>
                ) : null}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-2 flex items-start gap-3 border-b border-zinc-800/60 pb-6 sm:items-center sm:gap-4 sm:pb-8">
                  <div className="shrink-0 rounded-xl bg-zinc-800/90 p-2.5 text-white sm:rounded-2xl sm:p-3">
                    <Settings size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                    Part details
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="rfq-material">
                      Material
                    </label>
                    <select
                      id="rfq-material"
                      className={`${inputClass} appearance-none`}
                      value={draft.material}
                      onChange={(e) => update('material', e.target.value)}
                    >
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
                      value={draft.qty}
                      onChange={(e) => update('qty', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="rfq-tolerance">
                      Tolerance Requirements
                    </label>
                    <select
                      id="rfq-tolerance"
                      className={`${inputClass} appearance-none`}
                      value={draft.tolerance}
                      onChange={(e) => update('tolerance', e.target.value)}
                    >
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
                      value={draft.finish}
                      onChange={(e) => update('finish', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-2 flex items-start gap-3 border-b border-zinc-800/60 pb-6 sm:items-center sm:gap-4 sm:pb-8">
                  <div className="shrink-0 rounded-xl bg-zinc-800/90 p-2.5 text-white sm:rounded-2xl sm:p-3">
                    <Calendar size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                    Timeline
                  </h2>
                </div>
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Run Type</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
                      {(
                        [
                          { value: 'prototype', title: 'Prototype', desc: '1-10 parts for testing' },
                          { value: 'production', title: 'Production', desc: 'Scheduled repeat runs' },
                        ] as const
                      ).map((opt) => {
                        const selected = draft.runType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => update('runType', opt.value)}
                            className={`relative flex min-h-11 cursor-pointer flex-col rounded-2xl bg-zinc-800/40 p-4 text-left transition-colors sm:p-5 ${
                              selected ? 'bg-zinc-800 ring-1 ring-white/40' : 'hover:bg-zinc-800/60'
                            }`}
                            aria-pressed={selected}
                          >
                            <span className="mb-1 text-base font-bold uppercase text-white md:text-lg">
                              {opt.title}
                            </span>
                            <span className="text-sm font-medium text-zinc-400">{opt.desc}</span>
                          </button>
                        );
                      })}
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
                      value={draft.needBy}
                      onChange={(e) => update('needBy', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="mb-2 flex items-start gap-3 border-b border-zinc-800/60 pb-6 sm:items-center sm:gap-4 sm:pb-8">
                  <div className="shrink-0 rounded-xl bg-zinc-800/90 p-2.5 text-white sm:rounded-2xl sm:p-3">
                    <MessageSquare size={24} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                    Review & notes
                  </h2>
                </div>
                <div className="rounded-2xl bg-zinc-800/40 p-4 text-sm text-zinc-400 sm:p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Summary</p>
                  <ul className="space-y-1.5 font-medium text-zinc-300">
                    <li>
                      {[draft.firstName, draft.lastName].filter(Boolean).join(' ') || '—'} ·{' '}
                      {draft.company || '—'} · {draft.email || '—'}
                    </li>
                    <li>
                      Files: {files.length > 0 ? files.map((f) => f.name).join(', ') : 'None selected'}
                    </li>
                    <li>
                      {draft.material || 'Material TBD'} · Qty {draft.qty || '—'} ·{' '}
                      {draft.runType || 'Run type TBD'}
                    </li>
                  </ul>
                </div>
                <div>
                  <label className={labelClass} htmlFor="rfq-notes">
                    Additional Notes
                  </label>
                  <textarea
                    id="rfq-notes"
                    rows={6}
                    placeholder="Certifications (AS9100, ITAR), end-use environment, assembly needs…"
                    className={`${inputClass} min-h-[10rem] resize-none`}
                    value={draft.notes}
                    onChange={(e) => update('notes', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-800/60 pt-5 sm:mt-10 sm:pt-6 md:mt-16 md:pt-8">
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
