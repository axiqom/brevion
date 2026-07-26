import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { withBase } from '../lib/base';

const inputClass =
  'w-full min-h-11 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3.5 py-3 text-sm font-medium text-white transition-all placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white sm:rounded-2xl sm:px-4 sm:py-3.5';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-zinc-400';

const errorClass = 'mt-1.5 text-xs font-medium text-red-400';

type Fields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  need: string;
  preferred: 'email' | 'call' | '';
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.company.trim()) errors.company = 'Company is required.';
  if (!values.email.trim()) errors.email = 'Work email is required.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid work email.';
  if (!values.need.trim()) errors.need = 'Tell us what you need.';
  return errors;
}

export default function HeroContactForm() {
  const formId = useId();
  const [values, setValues] = useState<Fields>({
    name: '',
    company: '',
    email: '',
    phone: '',
    need: '',
    preferred: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
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
      <div
        className="rounded-2xl border border-zinc-700/70 bg-zinc-900/85 p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950">
          <CheckCircle2 size={24} aria-hidden="true" />
        </div>
        <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
          Got it — we will follow up.
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          Thanks for reaching out. An engineer will review your note and contact you shortly.
        </p>
        <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Preview only — nothing was submitted
        </p>
        <a
          href={withBase('rfq')}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Continue with full RFQ
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    );
  }

  const fieldIds = {
    name: `${formId}-name`,
    company: `${formId}-company`,
    email: `${formId}-email`,
    phone: `${formId}-phone`,
    need: `${formId}-need`,
    preferred: `${formId}-preferred`,
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-zinc-700/70 bg-zinc-900/85 p-4 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6"
      aria-labelledby={`${formId}-title`}
    >
      <div className="mb-4 border-b border-zinc-800 pb-4 sm:mb-5">
        <h2 id={`${formId}-title`} className="font-display text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
          Start a conversation
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Quick intake — no CAD required yet.</p>
      </div>

      <div className="space-y-3.5 sm:space-y-4">
        <div>
          <label className={labelClass} htmlFor={fieldIds.name}>
            Name *
          </label>
          <input
            id={fieldIds.name}
            type="text"
            autoComplete="name"
            className={inputClass}
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${fieldIds.name}-error` : undefined}
          />
          {errors.name ? (
            <p id={`${fieldIds.name}-error`} className={errorClass} role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldIds.company}>
            Company *
          </label>
          <input
            id={fieldIds.company}
            type="text"
            autoComplete="organization"
            className={inputClass}
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
            className={inputClass}
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

        <div>
          <label className={labelClass} htmlFor={fieldIds.need}>
            What do you need? *
          </label>
          <textarea
            id={fieldIds.need}
            rows={3}
            className={`${inputClass} min-h-[5.5rem] resize-none`}
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
                  className={`inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-full border px-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                    selected
                      ? 'border-white bg-white text-zinc-950'
                      : 'border-zinc-700 bg-zinc-950/50 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-5 space-y-3 sm:mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {submitting ? 'Sending…' : 'Send message'}
          {!submitting ? <ArrowRight size={16} aria-hidden="true" /> : null}
        </button>
        <p className="text-center text-[11px] font-medium text-zinc-500">
          Need drawings or CAD?{' '}
          <a href={withBase('rfq')} className="text-zinc-300 underline-offset-2 hover:text-white hover:underline">
            Full RFQ
          </a>
        </p>
      </div>
    </form>
  );
}
