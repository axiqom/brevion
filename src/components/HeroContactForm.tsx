import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { withBase } from '../lib/base';

const inputClass =
  'w-full min-h-11 rounded-xl bg-zinc-800/70 px-3.5 py-3 text-sm font-medium text-white transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20 sm:rounded-2xl sm:px-4 sm:py-3.5';

const inputErrorClass =
  'w-full min-h-11 rounded-xl bg-zinc-800/70 border-l-2 border-red-400 px-3.5 py-3 text-sm font-medium text-white transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 sm:rounded-2xl sm:px-4 sm:py-3.5';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400';

const errorClass = 'mt-1.5 text-xs font-medium text-red-400';

const cardClass =
  'rounded-2xl bg-zinc-900/60 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:rounded-3xl sm:p-6';

type Fields = {
  company: string;
  email: string;
  need: string;
  phone: string;
  preferred: 'email' | 'call' | '';
};

type FieldErrors = Partial<Record<'company' | 'email' | 'need', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.company.trim()) errors.company = 'Company is required.';
  if (!values.email.trim()) errors.email = 'Work email is required.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid work email.';
  if (!values.need.trim()) errors.need = 'Tell us what you need.';
  return errors;
}

export default function HeroContactForm() {
  const formId = useId();
  const [values, setValues] = useState<Fields>({
    company: '',
    email: '',
    need: '',
    phone: '',
    preferred: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const setField = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === 'company' || key === 'email' || key === 'need') {
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    // Static Pages: client-only success (no external submit).
    window.setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 250);
  };

  if (submitted) {
    return (
      <div className={cardClass} role="status" aria-live="polite" aria-atomic="true">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950">
          <CheckCircle2 size={24} aria-hidden="true" />
        </div>
        <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
          Request received
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-zinc-300">
          Preview only — nothing was submitted. When email is live, here&apos;s what happens next:
        </p>
        <ol className="mb-6 space-y-3 text-sm font-medium text-zinc-300">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white">
              1
            </span>
            <span>
              Prefer drawings or CAD? Continue with the{' '}
              <a href={withBase('rfq')} className="text-white underline-offset-2 hover:underline">
                full RFQ
              </a>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white">
              2
            </span>
            <span>We&apos;ll reply within 24h with a quote path.</span>
          </li>
        </ol>
        <a
          href={withBase('rfq')}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200 sm:w-auto"
        >
          Full RFQ with CAD upload
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    );
  }

  const fieldIds = {
    company: `${formId}-company`,
    email: `${formId}-email`,
    need: `${formId}-need`,
    phone: `${formId}-phone`,
    preferred: `${formId}-preferred`,
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cardClass}
      aria-labelledby={`${formId}-title`}
    >
      <div className="mb-5 pb-2 sm:mb-6">
        <h2 id={`${formId}-title`} className="font-display text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
          Talk to engineering
        </h2>
        <p className="mt-1.5 text-sm leading-snug text-zinc-300">
          Three fields. Part, material, qty — CAD optional for now.
        </p>
      </div>

      <div className="space-y-3.5 sm:space-y-4">
        <div>
          <label className={labelClass} htmlFor={fieldIds.company}>
            Company *
          </label>
          <input
            id={fieldIds.company}
            type="text"
            autoComplete="organization"
            className={errors.company ? inputErrorClass : inputClass}
            value={values.company}
            onChange={(e) => setField('company', e.target.value)}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? `${fieldIds.company}-error` : undefined}
          />
          {errors.company ? (
            <p id={`${fieldIds.company}-error`} className={errorClass} role="alert">
              {errors.company}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldIds.email}>
            Work email *
          </label>
          <input
            id={fieldIds.email}
            type="email"
            autoComplete="email"
            inputMode="email"
            className={errors.email ? inputErrorClass : inputClass}
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${fieldIds.email}-error` : undefined}
          />
          {errors.email ? (
            <p id={`${fieldIds.email}-error`} className={errorClass} role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldIds.need}>
            What do you need? *
          </label>
          <textarea
            id={fieldIds.need}
            rows={3}
            className={`${errors.need ? inputErrorClass : inputClass} min-h-[5.5rem] resize-none`}
            placeholder="Part type, material, qty, timeline…"
            value={values.need}
            onChange={(e) => setField('need', e.target.value)}
            aria-invalid={Boolean(errors.need)}
            aria-describedby={errors.need ? `${fieldIds.need}-error` : undefined}
          />
          {errors.need ? (
            <p id={`${fieldIds.need}-error`} className={errorClass} role="alert">
              {errors.need}
            </p>
          ) : null}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowExtras((v) => !v)}
            className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-zinc-800/40 px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:bg-zinc-800/70 hover:text-zinc-200 sm:rounded-2xl sm:px-4"
            aria-expanded={showExtras}
            aria-controls={`${formId}-extras`}
          >
            Add phone / contact preference
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${showExtras ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {showExtras ? (
            <div id={`${formId}-extras`} className="mt-3.5 space-y-3.5 sm:mt-4 sm:space-y-4">
              <div>
                <label className={labelClass} htmlFor={fieldIds.phone}>
                  Phone
                </label>
                <input
                  id={fieldIds.phone}
                  type="tel"
                  autoComplete="tel"
                  className={inputClass}
                  value={values.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                />
              </div>

              <fieldset>
                <legend className={labelClass}>Preferred contact</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred contact">
                  {(
                    [
                      { value: 'email', label: 'Email' },
                      { value: 'call', label: 'Call' },
                    ] as const
                  ).map((opt) => {
                    const selected = values.preferred === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setField('preferred', selected ? '' : opt.value)}
                        className={`inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-full px-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                          selected
                            ? 'bg-white text-zinc-950'
                            : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-3 sm:mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {submitting ? 'Sending…' : 'Request quote'}
          {!submitting ? <ArrowRight size={16} aria-hidden="true" /> : null}
        </button>
        <p className="text-center text-[11px] font-medium leading-snug text-zinc-400">
          Engineer follow-up within 24h — preview submit only.
        </p>
        <p className="text-center text-[11px] font-medium text-zinc-500">
          Prefer email?{' '}
          <a
            href="mailto:sales@brevion.com"
            className="text-zinc-300 underline-offset-2 hover:text-white hover:underline"
          >
            sales@brevion.com
          </a>
          {' · '}
          <a href={withBase('rfq')} className="text-zinc-300 underline-offset-2 hover:text-white hover:underline">
            Full RFQ
          </a>
        </p>
      </div>
    </form>
  );
}
