import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { MessageSquare, X, Send, ArrowRight, Mail } from 'lucide-react';
import { withBase } from '../lib/base';

type Role = 'bot' | 'user' | 'system';

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

type ContactDraft = {
  name: string;
  email: string;
};

const CONTACT_KEY = 'milltrue-chat-contact';
const THREAD_KEY = 'milltrue-chat-thread';

const QUICK_PROMPTS = [
  'Need a 24h quote',
  'AS9100 / ITAR?',
  'Upload CAD / RFQ',
  'Tolerances & materials',
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function matchReply(input: string): string {
  const t = input.toLowerCase();

  if (/24\s*h|quote|rfq|pricing|lead\s*time|how\s*fast/.test(t)) {
    return 'Most quote paths return within 24h once we have part type, material, and qty. For drawings or CAD, use the full RFQ — or start a short note on the home intake.';
  }
  if (/as9100|itar|cert|fai|as9102|export/.test(t)) {
    return 'We run AS9100-minded process discipline and an ITAR-ready workflow. AS9102 FAI is available when your print requires it. NDAs are routine before proprietary or controlled files.';
  }
  if (/upload|cad|step|stp|drawing|file|iges|dxf/.test(t)) {
    return 'Preferred package: STEP (.step/.stp) plus a PDF drawing for tolerances and callouts. We also accept IGES, DXF/DWG, SolidWorks, and ZIP. Open the full RFQ to attach files — NDA first if needed.';
  }
  if (/toleran|material|titanium|aluminum|peek|inconel|stainless|±|0\.0001/.test(t)) {
    return 'Critical dims held to ±0.0001" where the print demands it. Materials include aerospace metals (Al, Ti, stainless, specialty alloys) and engineering plastics (Delrin, PEEK, Ultem). DFM review happens before chips fly.';
  }
  if (/dfm|design|engineer|prototype|production/.test(t)) {
    return 'Engineering desk covers CAD/reverse engineering, DFM analysis, and CAM. Prototype lead times are typically 2–3 weeks; production 4–6 weeks depending on material and finish.';
  }
  if (/hello|hi\b|hey|thanks|thank/.test(t)) {
    return 'MillTrue manufacturing desk. Ask about quotes, certs, tolerances, or CAD upload — or use the handoffs below to reach an engineer.';
  }

  return 'I can answer from MillTrue site claims only (24h quotes, ±0.0001", AS9100 / ITAR-ready, DFM, CAD formats). For anything else, start a quote, open the full RFQ, or email sales@milltrue.com.';
}

function loadContact(): ContactDraft {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    if (!raw) return { name: '', email: '' };
    const parsed = JSON.parse(raw) as ContactDraft;
    return { name: parsed.name || '', email: parsed.email || '' };
  } catch {
    return { name: '', email: '' };
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function MillTrueChat() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'MillTrue desk — aerospace & defense CNC. Ask about quotes, AS9100/ITAR, tolerances, or CAD upload. Preview messaging only; no live agent yet.',
    },
  ]);
  const [contact, setContact] = useState<ContactDraft>({ name: '', email: '' });
  const [showCapture, setShowCapture] = useState(false);
  const [captureDone, setCaptureDone] = useState(false);
  const [pendingSend, setPendingSend] = useState<string | null>(null);
  const [captureErrors, setCaptureErrors] = useState<{ name?: string; email?: string }>({});

  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const c = loadContact();
    setContact(c);
    if (c.name && c.email) setCaptureDone(true);
    try {
      const raw = localStorage.getItem(THREAD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THREAD_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    const sync = () => setBarVisible(document.body.classList.contains('has-mobile-convert'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => {
      prevFocus.current?.focus();
      launcherRef.current?.focus();
    }, 0);
  }, []);

  const openPanel = () => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', onKeyDown);
    return () => panel.removeEventListener('keydown', onKeyDown);
  }, [open, showCapture]);

  const pushBot = (text: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: uid(), role: 'bot', text }]);
    }, 450 + Math.min(600, text.length * 8));
  };

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setInput('');
    pushBot(matchReply(text));
  };

  const requestSend = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    if (!captureDone) {
      setPendingSend(text);
      setShowCapture(true);
      return;
    }
    sendText(text);
  };

  const handleCapture = (e: FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string } = {};
    if (!contact.name.trim()) errors.name = 'Name required.';
    if (!contact.email.trim()) errors.email = 'Work email required.';
    else if (!EMAIL_RE.test(contact.email.trim())) errors.email = 'Enter a valid email.';
    setCaptureErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      localStorage.setItem(
        CONTACT_KEY,
        JSON.stringify({ name: contact.name.trim(), email: contact.email.trim() }),
      );
    } catch {
      /* ignore */
    }
    setCaptureDone(true);
    setShowCapture(false);
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: 'system',
        text: `Contact saved locally for ${contact.name.trim()}. Preview only — message not delivered.`,
      },
    ]);
    if (pendingSend) {
      const next = pendingSend;
      setPendingSend(null);
      sendText(next);
    }
  };

  const onComposerKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      requestSend(input);
    }
  };

  const intakeHref = withBase('#intake');
  const rfqHref = withBase('rfq');

  return (
    <div className="pointer-events-none fixed inset-0 z-[46] overflow-hidden">
      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : openPanel())}
        className={`pointer-events-auto fixed right-4 z-[47] inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-zinc-900/90 px-4 text-white shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-[transform,opacity,bottom] duration-200 hover:bg-zinc-800 motion-reduce:transition-none md:right-6 ${
          barVisible ? 'bottom-[5.75rem]' : 'bottom-5 md:bottom-6'
        } ${open ? 'scale-95 opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close messaging' : 'Open messaging'}
      >
        <MessageSquare size={20} aria-hidden="true" />
        <span className="hidden text-xs font-bold uppercase tracking-widest sm:inline">Message</span>
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="MillTrue messaging"
        className={`pointer-events-auto fixed right-3 z-[48] flex w-[min(100%-1.5rem,22.5rem)] flex-col overflow-hidden rounded-2xl bg-zinc-950/95 shadow-[0_28px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-[opacity,transform] duration-200 motion-reduce:transition-none sm:right-6 sm:w-[24rem] ${
          barVisible ? 'bottom-[5.75rem]' : 'bottom-5 md:bottom-6'
        } ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
        style={{ maxHeight: 'min(34rem, calc(100dvh - 6rem))' }}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
              MillTrue
            </p>
            <p className="mt-0.5 text-xs font-medium text-zinc-500">Manufacturing desk · preview</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
            aria-label="Close messaging"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={threadRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 pb-3 sm:px-5"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-white text-zinc-950'
                    : m.role === 'system'
                      ? 'bg-zinc-900/80 text-zinc-400'
                      : 'bg-zinc-800/80 text-zinc-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing ? (
            <div className="flex justify-start" aria-label="Typing">
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-zinc-800/80 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:240ms]" />
              </div>
            </div>
          ) : null}
        </div>

        {!showCapture ? (
          <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => requestSend(p)}
                className="inline-flex min-h-11 items-center rounded-full bg-zinc-800/70 px-3.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}

        {showCapture ? (
          <form onSubmit={handleCapture} className="space-y-3 border-t border-zinc-800/60 px-4 py-3 sm:px-5">
            <p className="text-xs font-medium text-zinc-400">
              Optional handoff — name and work email stored locally before send (preview).
            </p>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500" htmlFor={`${panelId}-name`}>
                Name
              </label>
              <input
                id={`${panelId}-name`}
                type="text"
                autoComplete="name"
                className="w-full min-h-11 rounded-xl bg-zinc-800/70 px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              />
              {captureErrors.name ? (
                <p className="mt-1 text-xs text-red-400" role="alert">
                  {captureErrors.name}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500" htmlFor={`${panelId}-email`}>
                Work email
              </label>
              <input
                id={`${panelId}-email`}
                type="email"
                autoComplete="email"
                className="w-full min-h-11 rounded-xl bg-zinc-800/70 px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
              {captureErrors.email ? (
                <p className="mt-1 text-xs text-red-400" role="alert">
                  {captureErrors.email}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white text-xs font-bold uppercase tracking-widest text-zinc-950 hover:bg-zinc-200"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCapture(false);
                  const next = pendingSend;
                  setPendingSend(null);
                  if (next) sendText(next);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-800 px-4 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-700"
              >
                Skip
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-zinc-800/60 px-3 py-3 sm:px-4">
            <div className="mb-2 flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onComposerKey}
                placeholder="Ask about quote, certs, CAD…"
                className="min-h-11 flex-1 rounded-full bg-zinc-800/70 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Message"
              />
              <button
                type="button"
                onClick={() => requestSend(input)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-zinc-950 transition-colors hover:bg-zinc-200"
                aria-label="Send message"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <a
                href={intakeHref}
                onClick={close}
                className="inline-flex min-h-10 items-center gap-1 rounded-full bg-zinc-800/80 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-700"
              >
                Start quote <ArrowRight size={12} aria-hidden="true" />
              </a>
              <a
                href={rfqHref}
                onClick={close}
                className="inline-flex min-h-10 items-center rounded-full bg-zinc-800/80 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-700"
              >
                Full RFQ
              </a>
              <a
                href="mailto:sales@milltrue.com"
                className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white"
              >
                <Mail size={12} aria-hidden="true" /> Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
