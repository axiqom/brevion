import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { MessageSquare, X, Send, ArrowRight, Mail } from 'lucide-react';
import { withBase } from '../lib/base';

type Role = 'bot' | 'user';
type Topic = 'quote' | 'certs' | 'cad' | 'materials' | 'dfm' | 'general';

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  actions?: boolean;
};

type Chip = {
  label: string;
  send?: string;
  href?: string;
};

type DeskReply = {
  bubbles: string[];
  topic: Topic;
  chips: Chip[];
  actions?: boolean;
};

const THREAD_KEY = 'milltrue-chat-v2-thread';
const TOPIC_KEY = 'milltrue-chat-v2-topic';
const LEGACY_KEYS = ['milltrue-chat-thread', 'milltrue-chat-topic'];

const OPENING_CHIPS: Chip[] = [
  { label: '24h quote', send: 'Need a 24h quote' },
  { label: 'AS9100 / ITAR', send: 'AS9100 / ITAR?' },
  { label: 'CAD upload', send: 'How do I upload CAD?' },
  { label: 'Tolerances', send: 'What tolerances and materials?' },
];

const CHIPS_BY_TOPIC: Record<Topic, Chip[]> = {
  quote: [
    { label: 'Start quote', href: 'intake' },
    { label: 'Full RFQ', href: 'rfq' },
    { label: 'Lead times', send: 'What is typical lead time?' },
    { label: 'Attach STEP', send: 'How do I attach a STEP file?' },
  ],
  certs: [
    { label: 'Start quote', href: 'intake' },
    { label: 'NDA?', send: 'Do you support NDAs?' },
    { label: 'FAI / AS9102', send: 'Do you offer AS9102 FAI?' },
    { label: 'Full RFQ', href: 'rfq' },
  ],
  cad: [
    { label: 'Start quote', href: 'intake' },
    { label: 'Full RFQ', href: 'rfq' },
    { label: 'Formats?', send: 'What CAD formats do you accept?' },
    { label: 'NDA first?', send: 'Do you support NDAs?' },
  ],
  materials: [
    { label: 'Start quote', href: 'intake' },
    { label: 'DFM review?', send: 'Do you do DFM review?' },
    { label: 'Lead times', send: 'What is typical lead time?' },
    { label: 'Full RFQ', href: 'rfq' },
  ],
  dfm: [
    { label: 'Start quote', href: 'intake' },
    { label: 'Full RFQ', href: 'rfq' },
    { label: 'Prototype timing', send: 'What is prototype lead time?' },
    { label: 'Upload CAD', send: 'How do I upload CAD?' },
  ],
  general: OPENING_CHIPS,
};

function detectTopic(input: string): Topic {
  const t = input.toLowerCase();
  if (/24\s*h|quote|rfq|pricing|price|cost|how\s*fast|turnaround|lead\s*time|bid/.test(t)) return 'quote';
  if (/as9100|itar|cert|fai|as9102|export|nda|compliance|quality\s*system/.test(t)) return 'certs';
  if (/upload|cad|step|stp|drawing|file|iges|dxf|dwg|solidworks|sldprt|zip|attach/.test(t)) return 'cad';
  if (/toleran|material|titanium|aluminum|aluminium|peek|inconel|stainless|delrin|ultem|±|0\.0001|alloy|plastic/.test(t))
    return 'materials';
  if (/dfm|design|engineer|prototype|production|cam|reverse\s*eng|machin/.test(t)) return 'dfm';
  return 'general';
}

function buildReply(input: string, lastTopic: Topic | null): DeskReply {
  const t = input.toLowerCase();
  const topic = detectTopic(input);

  if (/nda|non.?disclosure|confidential/.test(t)) {
    return {
      topic: 'certs',
      bubbles: [
        'NDAs are routine before proprietary or controlled files. Email sales@milltrue.com, or note NDA-required on the RFQ — we will not open CAD until paperwork is set.',
      ],
      chips: CHIPS_BY_TOPIC.certs,
      actions: true,
    };
  }

  if (/format|accept|file\s*type|extension/.test(t) && topic === 'cad') {
    return {
      topic: 'cad',
      bubbles: [
        'Preferred: STEP (.step/.stp) plus a PDF drawing. Also: IGES, DXF/DWG, SolidWorks, ZIP. Open Full RFQ to attach.',
      ],
      chips: CHIPS_BY_TOPIC.cad,
      actions: true,
    };
  }

  if (/fai|as9102/.test(t)) {
    return {
      topic: 'certs',
      bubbles: [
        'AS9102 FAI is available when your print requires it. Call it out on the RFQ and engineering will confirm scope.',
      ],
      chips: CHIPS_BY_TOPIC.certs,
      actions: true,
    };
  }

  if (topic === 'quote' || /24\s*h|quote|rfq|pricing|lead\s*time|how\s*fast|turnaround|bid/.test(t)) {
    return {
      topic: 'quote',
      bubbles: [
        'Most quote paths return within 24h once we have part type, material, and qty.',
        'Start a short note or open Full RFQ to attach drawings.',
      ],
      chips: CHIPS_BY_TOPIC.quote,
      actions: true,
    };
  }

  if (topic === 'certs') {
    return {
      topic: 'certs',
      bubbles: [
        'AS9100-minded process discipline and an ITAR-ready workflow. AS9102 FAI and NDAs available when required.',
      ],
      chips: CHIPS_BY_TOPIC.certs,
      actions: true,
    };
  }

  if (topic === 'cad') {
    return {
      topic: 'cad',
      bubbles: [
        'Preferred package: STEP plus a PDF drawing for tolerances. Open Full RFQ to attach — or Start quote for a short note first.',
      ],
      chips: CHIPS_BY_TOPIC.cad,
      actions: true,
    };
  }

  if (topic === 'materials') {
    return {
      topic: 'materials',
      bubbles: [
        'Critical dims held to ±0.0001" where the print demands it. Aerospace metals and engineering plastics (Delrin, PEEK, Ultem). DFM before chips fly.',
      ],
      chips: CHIPS_BY_TOPIC.materials,
      actions: true,
    };
  }

  if (topic === 'dfm') {
    return {
      topic: 'dfm',
      bubbles: [
        'CAD/reverse engineering, DFM, and CAM before cut. Prototypes typically 2–3 weeks; production 4–6 weeks depending on material and finish.',
      ],
      chips: CHIPS_BY_TOPIC.dfm,
      actions: true,
    };
  }

  if (/hello|hi\b|hey|good\s*(morning|afternoon)|thanks|thank/.test(t)) {
    const bias = lastTopic && lastTopic !== 'general' ? lastTopic : 'general';
    return {
      topic: bias,
      bubbles: ['Ask about quotes, certs, tolerances, or CAD — or jump straight to Start quote / Full RFQ.'],
      chips: CHIPS_BY_TOPIC[bias],
      actions: true,
    };
  }

  const fallbackChips =
    lastTopic && lastTopic !== 'general' ? CHIPS_BY_TOPIC[lastTopic] : CHIPS_BY_TOPIC.general;

  return {
    topic: lastTopic || 'general',
    bubbles: [
      'I can cover 24h quotes, ±0.0001", AS9100 / ITAR-ready, DFM, and CAD formats. For anything else: Start quote, Full RFQ, or sales@milltrue.com.',
    ],
    chips: fallbackChips,
    actions: true,
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function clearLegacyStorage() {
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export default function MillTrueChat() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<Chip[]>(OPENING_CHIPS);
  const [lastTopic, setLastTopic] = useState<Topic | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const runRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    clearLegacyStorage();
    try {
      const raw = localStorage.getItem(THREAD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed.slice(-40));
          setWelcomeDone(true);
        }
      }
      const topicRaw = localStorage.getItem(TOPIC_KEY) as Topic | null;
      if (topicRaw && topicRaw in CHIPS_BY_TOPIC) {
        setLastTopic(topicRaw);
        setChips(CHIPS_BY_TOPIC[topicRaw]);
      }
    } catch {
      try {
        localStorage.removeItem(THREAD_KEY);
        localStorage.removeItem(TOPIC_KEY);
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);
    return () => {
      runRef.current.cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(THREAD_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages, hydrated]);

  useEffect(() => {
    if (!lastTopic) return;
    try {
      localStorage.setItem(TOPIC_KEY, lastTopic);
    } catch {
      /* ignore */
    }
  }, [lastTopic]);

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
    runRef.current.cancelled = true;
    setTyping(false);
    setOpen(false);
    window.setTimeout(() => {
      prevFocus.current?.focus();
      launcherRef.current?.focus();
    }, 0);
  }, []);

  const deliverReply = useCallback(async (reply: DeskReply) => {
    runRef.current = { cancelled: false };
    setTyping(true);
    const delay = prefersReducedMotion() ? 80 : 280;
    await sleep(delay);
    if (runRef.current.cancelled) return;
    setTyping(false);

    for (let i = 0; i < reply.bubbles.length; i++) {
      if (runRef.current.cancelled) return;
      const isLast = i === reply.bubbles.length - 1;
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'bot', text: reply.bubbles[i], actions: isLast ? reply.actions : false },
      ]);
      if (!isLast) {
        setTyping(true);
        await sleep(prefersReducedMotion() ? 60 : 220);
        if (runRef.current.cancelled) return;
        setTyping(false);
      }
    }

    setLastTopic(reply.topic);
    setChips(reply.chips);
  }, []);

  const playWelcome = useCallback(async () => {
    if (welcomeDone || messagesRef.current.length > 0) return;
    setWelcomeDone(true);
    setTyping(true);
    await sleep(prefersReducedMotion() ? 60 : 220);
    if (runRef.current.cancelled) return;
    setTyping(false);
    setMessages([
      {
        id: uid(),
        role: 'bot',
        text: 'Hi — ask a common CNC question below, or type your own. I steer you to a quote when you are ready.',
      },
    ]);
    setChips(OPENING_CHIPS);
  }, [welcomeDone]);

  const openPanel = () => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    runRef.current = { cancelled: false };
    setOpen(true);
  };

  useEffect(() => {
    if (!open || !hydrated) return;
    if (messages.length === 0 && !welcomeDone) {
      void playWelcome();
    }
  }, [open, hydrated, messages.length, welcomeDone, playWelcome]);

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
  }, [open]);

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setInput('');
    void deliverReply(buildReply(text, lastTopic));
  };

  const handleChip = (chip: Chip) => {
    if (chip.href === 'intake') {
      close();
      window.location.href = withBase('#intake');
      return;
    }
    if (chip.href === 'rfq') {
      close();
      window.location.href = withBase('rfq');
      return;
    }
    if (chip.send) sendText(chip.send);
  };

  const onComposerKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText(input);
    }
  };

  const intakeHref = withBase('#intake');
  const rfqHref = withBase('rfq');
  const bottomClass = barVisible ? 'bottom-[5.75rem]' : 'bottom-5 md:bottom-6';

  // P0: when closed, mount ONLY the launcher — no overlay shell, no hidden dialog in DOM.
  if (!open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={openPanel}
        className={`pointer-events-auto fixed right-4 z-[47] inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-zinc-900/90 px-4 text-white shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-[transform,opacity,bottom] duration-200 hover:bg-zinc-800 motion-reduce:transition-none md:right-6 ${bottomClass}`}
        aria-expanded={false}
        aria-controls={panelId}
        aria-label="Open chat"
        data-milltrue-chat-launcher="true"
      >
        <MessageSquare size={20} aria-hidden="true" />
        <span className="hidden text-xs font-bold uppercase tracking-widest sm:inline">Chat</span>
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-label="MillTrue chat"
      data-milltrue-chat-panel="true"
      className={`pointer-events-auto fixed right-3 z-[48] flex w-[min(100%-1.5rem,22.5rem)] flex-col overflow-hidden rounded-2xl bg-zinc-950/95 shadow-[0_28px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:right-6 sm:w-[24rem] ${bottomClass}`}
      style={{ maxHeight: 'min(32rem, calc(100dvh - 6rem))' }}
    >
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
              MillTrue chat
            </p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400">Quick answers → quote / RFQ</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
            aria-label="Close chat"
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
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-white text-zinc-950' : 'bg-zinc-800/80 text-zinc-200'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'bot' && m.actions ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <a
                    href={intakeHref}
                    onClick={close}
                    className="inline-flex min-h-10 items-center gap-1 rounded-full bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-950 hover:bg-zinc-200"
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
                </div>
              ) : null}
            </div>
          ))}
          {typing ? (
            <div className="flex justify-start" aria-label="Loading answer">
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-zinc-800/80 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:240ms]" />
              </div>
            </div>
          ) : null}
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-5">
            {chips.slice(0, 4).map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => handleChip(c)}
                className="inline-flex min-h-11 items-center rounded-full bg-zinc-800/70 px-3.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}

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
              aria-label="Ask a question"
            />
            <button
              type="button"
              onClick={() => sendText(input)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-zinc-950 transition-colors hover:bg-zinc-200"
              aria-label="Send question"
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
          <p className="mt-2 px-1 text-[9px] leading-snug text-zinc-600">
            FAQ answers from site claims — not a live agent.
          </p>
        </div>
      </div>
  );
}
