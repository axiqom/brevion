import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { MessageSquare, X, Send, ArrowRight } from 'lucide-react';
import { withBase } from '../lib/base';
import {
  OPENING_CHIPS,
  emptyState,
  loadState,
  respond,
  saveState,
  type Chip,
  type ConversationState,
  type DeskReply,
} from '../lib/milltrueChatBrain';

type Role = 'bot' | 'user';

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  /** Start quote / Full RFQ under this bot turn */
  actions?: boolean;
  /** In-thread suggestion pills (send-only) under this bot turn */
  suggestions?: Chip[];
};

const THREAD_KEY = 'milltrue-chat-v4-thread';
const LEGACY_KEYS = [
  'milltrue-chat-thread',
  'milltrue-chat-topic',
  'milltrue-chat-v2-thread',
  'milltrue-chat-v2-topic',
  'milltrue-chat-v3-thread',
  'milltrue-chat-v3-topic',
];

function suggestionChips(chips: Chip[]): Chip[] {
  return chips.filter((c) => Boolean(c.send)).slice(0, 4);
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
  const [deskState, setDeskState] = useState<ConversationState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const runRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const messagesRef = useRef<ChatMessage[]>([]);
  const deskRef = useRef<ConversationState>(emptyState());

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    deskRef.current = deskState;
  }, [deskState]);

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
      const loaded = loadState();
      setDeskState(loaded);
      deskRef.current = loaded;
    } catch {
      try {
        localStorage.removeItem(THREAD_KEY);
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
    if (!hydrated) return;
    saveState(deskState);
  }, [deskState, hydrated]);

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

  /** Clear stale suggestion pills from prior bot turns so only the latest turn shows them. */
  const clearThreadSuggestions = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (m.suggestions?.length ? { ...m, suggestions: undefined } : m)),
    );
  }, []);

  const deliverReply = useCallback(async (reply: DeskReply) => {
    runRef.current = { cancelled: false };
    setTyping(true);
    const delay = prefersReducedMotion() ? 80 : 280;
    await sleep(delay);
    if (runRef.current.cancelled) return;
    setTyping(false);

    const nextSuggestions = suggestionChips(reply.chips);

    for (let i = 0; i < reply.bubbles.length; i++) {
      if (runRef.current.cancelled) return;
      const isLast = i === reply.bubbles.length - 1;
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: reply.bubbles[i],
          actions: isLast ? reply.actions : false,
          suggestions: isLast ? nextSuggestions : undefined,
        },
      ]);
      if (!isLast) {
        setTyping(true);
        await sleep(prefersReducedMotion() ? 60 : 220);
        if (runRef.current.cancelled) return;
        setTyping(false);
      }
    }
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
        text: 'Hi — ask in plain language about quotes, certs, CAD, or materials. I will remember what you share and steer you toward a quote when it makes sense.',
        suggestions: OPENING_CHIPS,
      },
    ]);
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
    clearThreadSuggestions();
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setInput('');
    const { reply, state } = respond(text, deskRef.current);
    deskRef.current = state;
    setDeskState(state);
    void deliverReply(reply);
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
      style={{ height: 'min(34rem, calc(100dvh - 5.5rem))' }}
    >
      <header className="flex shrink-0 items-center gap-3 px-3.5 pb-2.5 pt-3.5 sm:px-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-200"
          aria-hidden="true"
        >
          MT
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-white">MillTrue</p>
          <p className="truncate text-xs text-zinc-500">Ask about quotes, certs, CAD</p>
        </div>
        <a
          href="mailto:sales@milltrue.com"
          className="sr-only focus:not-sr-only focus:absolute focus:right-14 focus:top-3 focus:rounded-md focus:bg-zinc-800 focus:px-2 focus:py-1 focus:text-xs focus:text-zinc-200"
        >
          Email sales
        </a>
        <button
          type="button"
          onClick={close}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-white"
          aria-label="Close chat"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div
        ref={threadRef}
        className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3.5 pb-3 sm:px-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        data-milltrue-chat-thread="true"
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-2xl rounded-br-md bg-white text-zinc-950'
                  : 'rounded-2xl rounded-bl-md bg-zinc-800/90 text-zinc-200'
              }`}
            >
              {m.text}
            </div>

            {m.role === 'bot' && m.actions ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5" data-milltrue-chat-actions="true">
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
                  className="inline-flex min-h-10 items-center rounded-full bg-zinc-800 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-700"
                >
                  Full RFQ
                </a>
              </div>
            ) : null}

            {m.role === 'bot' && m.suggestions && m.suggestions.length > 0 ? (
              <div
                className="mt-1.5 flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                data-milltrue-chat-suggestions="true"
              >
                {m.suggestions.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => s.send && sendText(s.send)}
                    className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-zinc-900/80 px-3 text-xs font-medium text-zinc-300 ring-1 ring-zinc-700/80 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {typing ? (
          <div className="flex justify-start" aria-label="Typing">
            <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-zinc-800/90 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:240ms]" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 px-3 pb-3 pt-1 sm:px-4" data-milltrue-chat-composer="true">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onComposerKey}
            placeholder="Message…"
            className="min-h-11 flex-1 rounded-full bg-zinc-800/70 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/15"
            aria-label="Message"
          />
          <button
            type="button"
            onClick={() => sendText(input)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-zinc-950 transition-colors hover:bg-zinc-200"
            aria-label="Send"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
