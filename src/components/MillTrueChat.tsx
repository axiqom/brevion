import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { MessageSquare, X, Send, ArrowRight, Mail, Check } from 'lucide-react';
import { withBase } from '../lib/base';

type Role = 'bot' | 'user' | 'system';
type Topic = 'quote' | 'certs' | 'cad' | 'materials' | 'dfm' | 'general';

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  streaming?: boolean;
  actions?: boolean;
  seen?: boolean;
};

type ContactDraft = {
  name: string;
  email: string;
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

const CONTACT_KEY = 'milltrue-chat-contact';
const THREAD_KEY = 'milltrue-chat-thread';
const TOPIC_KEY = 'milltrue-chat-topic';
const SESSION_NUDGE_KEY = 'milltrue-chat-session-nudge';
const WELCOME_DONE_KEY = 'milltrue-chat-welcome-done';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OPENING_CHIPS: Chip[] = [
  { label: 'Need a 24h quote', send: 'Need a 24h quote' },
  { label: 'AS9100 / ITAR?', send: 'AS9100 / ITAR?' },
  { label: 'Upload CAD', send: 'How do I upload CAD?' },
  { label: 'Tolerances', send: 'What tolerances and materials?' },
];

const CHIPS_BY_TOPIC: Record<Topic, Chip[]> = {
  quote: [
    { label: 'Attach STEP', send: 'How do I attach a STEP file?' },
    { label: 'Typical lead time?', send: 'What is typical lead time?' },
    { label: 'Talk to engineering', href: 'intake' },
    { label: 'Full RFQ', href: 'rfq' },
  ],
  certs: [
    { label: 'Need NDA?', send: 'Do you support NDAs?' },
    { label: 'Start quote', href: 'intake' },
    { label: 'Upload CAD', send: 'How do I upload CAD?' },
    { label: 'FAI / AS9102', send: 'Do you offer AS9102 FAI?' },
  ],
  cad: [
    { label: 'Start quote', href: 'intake' },
    { label: 'Open RFQ', href: 'rfq' },
    { label: 'NDA first?', send: 'Do you support NDAs?' },
    { label: 'Accepted formats?', send: 'What CAD formats do you accept?' },
  ],
  materials: [
    { label: 'Start quote', href: 'intake' },
    { label: 'DFM review?', send: 'Do you do DFM review?' },
    { label: 'Lead times', send: 'What is typical lead time?' },
    { label: 'Titanium / PEEK', send: 'Can you machine titanium and PEEK?' },
  ],
  dfm: [
    { label: 'Start quote', href: 'intake' },
    { label: 'Prototype timing', send: 'What is prototype lead time?' },
    { label: 'Upload CAD', send: 'How do I upload CAD?' },
    { label: 'Certs', send: 'AS9100 / ITAR?' },
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
        'NDAs are routine before proprietary or controlled files.',
        'Send the agreement to sales@milltrue.com, or start the RFQ and note NDA-required — we will not open CAD until paperwork is set.',
      ],
      chips: CHIPS_BY_TOPIC.certs,
      actions: true,
    };
  }

  if (/format|accept|file\s*type|extension/.test(t) && topic === 'cad') {
    return {
      topic: 'cad',
      bubbles: [
        'Preferred: STEP (.step/.stp) plus a PDF drawing for tolerances and callouts.',
        'Also accepted: IGES, DXF/DWG, SolidWorks, and ZIP. Open Full RFQ to attach — NDA first if needed.',
      ],
      chips: CHIPS_BY_TOPIC.cad,
      actions: true,
    };
  }

  if (/fai|as9102/.test(t)) {
    return {
      topic: 'certs',
      bubbles: [
        'AS9102 FAI is available when your print requires it.',
        'Call it out on the RFQ or in a short note and engineering will confirm scope before chips fly.',
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
        'Have drawings or CAD? Start a short note on home intake, or open Full RFQ to attach files.',
      ],
      chips: CHIPS_BY_TOPIC.quote,
      actions: true,
    };
  }

  if (topic === 'certs') {
    return {
      topic: 'certs',
      bubbles: [
        'We run AS9100-minded process discipline and an ITAR-ready workflow.',
        'AS9102 FAI is available when required. NDAs are routine before proprietary or controlled files.',
      ],
      chips: CHIPS_BY_TOPIC.certs,
      actions: true,
    };
  }

  if (topic === 'cad') {
    return {
      topic: 'cad',
      bubbles: [
        'Preferred package: STEP plus a PDF drawing for tolerances and callouts.',
        'Open Full RFQ to attach files — or Start quote on the home intake if you only need a short note first.',
      ],
      chips: CHIPS_BY_TOPIC.cad,
      actions: true,
    };
  }

  if (topic === 'materials') {
    return {
      topic: 'materials',
      bubbles: [
        'Critical dims held to ±0.0001\" where the print demands it.',
        'Materials include aerospace metals (Al, Ti, stainless, specialty alloys) and engineering plastics (Delrin, PEEK, Ultem). DFM happens before chips fly.',
      ],
      chips: CHIPS_BY_TOPIC.materials,
      actions: true,
    };
  }

  if (topic === 'dfm') {
    return {
      topic: 'dfm',
      bubbles: [
        'Engineering desk covers CAD/reverse engineering, DFM analysis, and CAM.',
        'Prototype lead times are typically 2–3 weeks; production 4–6 weeks depending on material and finish.',
      ],
      chips: CHIPS_BY_TOPIC.dfm,
      actions: true,
    };
  }

  if (/hello|hi\b|hey|good\s*(morning|afternoon)|thanks|thank/.test(t)) {
    const bias = lastTopic && lastTopic !== 'general' ? lastTopic : 'general';
    return {
      topic: bias,
      bubbles: [
        'MillTrue manufacturing desk — here.',
        'Ask about quotes, certs, tolerances, or CAD upload. Or use Start quote / Full RFQ below.',
      ],
      chips: CHIPS_BY_TOPIC[bias],
    };
  }

  const fallbackChips =
    lastTopic && lastTopic !== 'general' ? CHIPS_BY_TOPIC[lastTopic] : CHIPS_BY_TOPIC.general;

  return {
    topic: lastTopic || 'general',
    bubbles: [
      'I can answer from MillTrue site claims only — 24h quotes, ±0.0001\", AS9100 / ITAR-ready, DFM, CAD formats.',
      'For anything else: Start quote, open Full RFQ, or email sales@milltrue.com.',
    ],
    chips: fallbackChips,
    actions: true,
  };
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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function jitter(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number, signal?: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (!signal?.cancelled) resolve();
      else resolve();
    }, ms);
  });
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
  const [contact, setContact] = useState<ContactDraft>({ name: '', email: '' });
  const [showCapture, setShowCapture] = useState(false);
  const [captureDone, setCaptureDone] = useState(false);
  const [pendingSend, setPendingSend] = useState<string | null>(null);
  const [captureErrors, setCaptureErrors] = useState<{ name?: string; email?: string }>({});
  const [unread, setUnread] = useState(0);
  const [launcherPulse, setLauncherPulse] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const runRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const idleTimer = useRef<number | null>(null);
  const openedOnce = useRef(false);
  const idleNudgeSent = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const c = loadContact();
    setContact(c);
    if (c.name && c.email) setCaptureDone(true);

    let restored = false;
    try {
      const raw = localStorage.getItem(THREAD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed.map((m) => ({ ...m, streaming: false })));
          restored = true;
          setWelcomePlayed(true);
        }
      }
      const topicRaw = localStorage.getItem(TOPIC_KEY) as Topic | null;
      if (topicRaw && topicRaw in CHIPS_BY_TOPIC) {
        setLastTopic(topicRaw);
        setChips(CHIPS_BY_TOPIC[topicRaw]);
      }
      if (localStorage.getItem(WELCOME_DONE_KEY) === '1') setWelcomePlayed(true);
    } catch {
      /* ignore */
    }

    if (!restored) setMessages([]);
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onMq);
    setHydrated(true);

    return () => {
      runRef.current.cancelled = true;
      mq.removeEventListener('change', onMq);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const persistable = messages
        .filter((m) => !m.streaming)
        .slice(-40)
        .map(({ id, role, text, actions, seen }) => ({ id, role, text, actions, seen }));
      localStorage.setItem(THREAD_KEY, JSON.stringify(persistable));
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

  // Soft proactive nudge once per session if chat never opened
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_NUDGE_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    const delay = jitter(10000, 15000);
    const t = window.setTimeout(() => {
      if (openedOnce.current) return;
      setLauncherPulse(true);
      setUnread(1);
      try {
        sessionStorage.setItem(SESSION_NUDGE_KEY, '1');
      } catch {
        /* ignore */
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => {
      prevFocus.current?.focus();
      launcherRef.current?.focus();
    }, 0);
  }, []);

  const streamBubble = useCallback(async (text: string, actions?: boolean) => {
    const id = uid();
    const reduced = prefersReducedMotion();

    if (reduced) {
      setMessages((prev) => [...prev, { id, role: 'bot', text, actions }]);
      return;
    }

    setMessages((prev) => [...prev, { id, role: 'bot', text: '', streaming: true, actions }]);
    const words = text.split(/(\s+)/);
    let acc = '';
    for (let i = 0; i < words.length; i++) {
      if (runRef.current.cancelled) return;
      acc += words[i];
      const snapshot = acc;
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: snapshot } : m)));
      if (words[i].trim()) {
        await sleep(jitter(18, 42), runRef.current);
      }
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text, streaming: false, actions } : m)),
    );
  }, []);

  const deliverReply = useCallback(
    async (reply: DeskReply) => {
      runRef.current.cancelled = false;
      setTyping(true);
      setMessages((prev) => {
        const lastUserIdx = [...prev].reverse().findIndex((m) => m.role === 'user');
        if (lastUserIdx === -1) return prev;
        const idx = prev.length - 1 - lastUserIdx;
        return prev.map((m, i) => (i === idx ? { ...m, seen: true } : m));
      });

      await sleep(jitter(420, 880), runRef.current);
      if (runRef.current.cancelled) return;

      setTyping(false);
      for (let i = 0; i < reply.bubbles.length; i++) {
        if (runRef.current.cancelled) return;
        const isLast = i === reply.bubbles.length - 1;
        await streamBubble(reply.bubbles[i], isLast ? reply.actions : false);
        if (!isLast) {
          setTyping(true);
          await sleep(jitter(320, 620), runRef.current);
          setTyping(false);
        }
      }

      setLastTopic(reply.topic);
      setChips(reply.chips);
    },
    [streamBubble],
  );

  const playWelcome = useCallback(async () => {
    if (welcomePlayed) return;
    setWelcomePlayed(true);
    try {
      localStorage.setItem(WELCOME_DONE_KEY, '1');
    } catch {
      /* ignore */
    }

    const returning = (() => {
      try {
        return localStorage.getItem(THREAD_KEY) && JSON.parse(localStorage.getItem(THREAD_KEY) || '[]').length > 0;
      } catch {
        return false;
      }
    })();

    // Returning visitors with empty visible thread get a short line
    if (returning && messagesRef.current.length === 0) {
      setTyping(true);
      await sleep(jitter(400, 700));
      setTyping(false);
      await streamBubble('Welcome back — what are you quoting today?');
      setChips(lastTopic ? CHIPS_BY_TOPIC[lastTopic] : OPENING_CHIPS);
      return;
    }

    if (messagesRef.current.length > 0) return;

    setTyping(true);
    await sleep(jitter(450, 800));
    setTyping(false);
    await streamBubble('MillTrue engineering desk — aerospace & defense CNC.');
    setTyping(true);
    await sleep(jitter(380, 650));
    setTyping(false);
    await streamBubble('What are you quoting today?');
    setChips(OPENING_CHIPS);
  }, [welcomePlayed, streamBubble, lastTopic]);

  const openPanel = () => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    openedOnce.current = true;
    setUnread(0);
    setLauncherPulse(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open || !hydrated) return;
    if (messages.length === 0 && !welcomePlayed) {
      void playWelcome();
    } else if (messages.length === 0 && welcomePlayed) {
      // Returning session cleared somehow — soft welcome back
      void (async () => {
        setTyping(true);
        await sleep(jitter(350, 600));
        setTyping(false);
        await streamBubble('Welcome back — what are you quoting today?');
        setChips(lastTopic ? CHIPS_BY_TOPIC[lastTopic] : OPENING_CHIPS);
      })();
    }
  }, [open, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Idle nudge inside open panel (once)
  useEffect(() => {
    if (!open) {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      return;
    }
    if (idleNudgeSent.current || typing) return;

    const reset = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        if (idleNudgeSent.current || !open || typing) return;
        idleNudgeSent.current = true;
        void (async () => {
          setTyping(true);
          await sleep(jitter(300, 500));
          setTyping(false);
          await streamBubble('Still here if you need a quote path, certs check, or CAD upload.');
        })();
      }, 20000);
    };

    reset();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [open, messages, typing, streamBubble]);

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

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    idleNudgeSent.current = true;
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setInput('');
    const reply = buildReply(text, lastTopic);
    void deliverReply(reply);
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
    if (chip.send) requestSend(chip.send);
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
        text: `Got it — we'll reply to ${contact.name.trim()} at ${contact.email.trim()}. Desk notes stay on this device until production messaging is wired.`,
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
  const bottomClass = barVisible ? 'bottom-[5.75rem]' : 'bottom-5 md:bottom-6';

  return (
    <div className="pointer-events-none fixed inset-0 z-[46] overflow-hidden">
      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : openPanel())}
        className={`pointer-events-auto fixed right-4 z-[47] inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-zinc-900/90 px-4 text-white shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-[transform,opacity,bottom] duration-200 hover:bg-zinc-800 motion-reduce:transition-none md:right-6 ${bottomClass} ${
          open ? 'scale-95 opacity-0 pointer-events-none' : 'opacity-100'
        } ${launcherPulse && !open ? 'ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-zinc-950' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close messaging' : unread ? `Open messaging, ${unread} unread` : 'Open messaging'}
      >
        <span className="relative inline-flex">
          <MessageSquare size={20} aria-hidden="true" />
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ${
              launcherPulse && !reduceMotion ? 'animate-pulse' : ''
            }`}
            aria-hidden="true"
          />
          {unread > 0 ? (
            <span className="absolute -bottom-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-zinc-950">
              {unread}
            </span>
          ) : null}
        </span>
        <span className="hidden text-xs font-bold uppercase tracking-widest sm:inline">Message</span>
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="MillTrue messaging"
        className={`pointer-events-auto fixed right-3 z-[48] flex w-[min(100%-1.5rem,22.5rem)] flex-col overflow-hidden rounded-2xl bg-zinc-950/95 shadow-[0_28px_90px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-[opacity,transform] duration-200 motion-reduce:transition-none sm:right-6 sm:w-[24rem] ${bottomClass} ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        style={{ maxHeight: 'min(34rem, calc(100dvh - 6rem))' }}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="flex items-start gap-3">
            <div
              className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800/90"
              aria-hidden="true"
            >
              <span className="font-display text-[10px] font-bold tracking-wider text-white">MT</span>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
            </div>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
                MillTrue
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                    !reduceMotion ? 'animate-pulse' : ''
                  }`}
                  aria-hidden="true"
                />
                Engineering desk · Online
              </p>
            </div>
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
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
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
                {m.streaming ? (
                  <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-zinc-400 align-middle" aria-hidden="true" />
                ) : null}
              </div>
              {m.role === 'user' && m.seen ? (
                <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  <Check size={10} aria-hidden="true" /> Seen
                </span>
              ) : null}
              {m.role === 'bot' && m.actions && !m.streaming ? (
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
                    Open RFQ
                  </a>
                </div>
              ) : null}
            </div>
          ))}
          {typing ? (
            <div className="flex justify-start" aria-label="Desk is typing">
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-zinc-800/80 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:240ms]" />
              </div>
            </div>
          ) : null}
        </div>

        {!showCapture && chips.length > 0 ? (
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

        {showCapture ? (
          <form onSubmit={handleCapture} className="space-y-3 border-t border-zinc-800/60 px-4 py-3 sm:px-5">
            <p className="text-xs font-medium text-zinc-400">Who should we reply to?</p>
            <div>
              <label
                className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                htmlFor={`${panelId}-name`}
              >
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
              <label
                className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                htmlFor={`${panelId}-email`}
              >
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
            {typing ? (
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Desk is typing…
              </p>
            ) : null}
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
            <p className="mt-2 px-1 text-[9px] leading-snug text-zinc-600">
              Guided desk answers from site claims — not a live agent yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
