/**
 * MillTrue hybrid desk brain — client-side only.
 * Parses free-text like a human message, fills soft slots, composes plain-text
 * replies (ack + answer + next-step). No LLM / API keys.
 */

export type Intent =
  | 'quote'
  | 'certs'
  | 'cad'
  | 'materials'
  | 'dfm'
  | 'hello'
  | 'thanks'
  | 'other';

export type Chip = {
  label: string;
  send?: string;
  href?: string;
};

export type DeskReply = {
  bubbles: string[];
  topic: Intent;
  chips: Chip[];
  actions?: boolean;
};

export type Slots = {
  material?: string;
  cert?: string;
  urgency?: string;
  partType?: string;
  quantity?: string;
  runType?: 'prototype' | 'production';
  cadMention?: boolean;
  nda?: boolean;
  itar?: boolean;
};

export type ConversationState = {
  lastIntents: Intent[];
  slots: Slots;
  turnCount: number;
  usefulAnswers: number;
  lastTopic: Intent | null;
};

export const STATE_KEY = 'milltrue-chat-v4-state';

/** Soft shortcuts only — work-oriented, never a cert/lead-time/tolerance menu. */
const OPENING_CHIPS: Chip[] = [
  { label: 'Need a quote', send: 'I need a quote on a part' },
  { label: 'CAD upload', send: 'How do I upload CAD?' },
];

const CHIPS_BY_INTENT: Record<Intent, Chip[]> = {
  quote: [
    { label: 'Attach STEP', send: 'How do I attach a STEP file?' },
    { label: 'Describe the job', send: 'It is a titanium bracket, prototype qty 10' },
  ],
  certs: [
    { label: 'Get a quote', send: 'I need a quote on a part' },
    { label: 'Upload CAD', send: 'How do I upload CAD?' },
  ],
  cad: [
    { label: 'CAD formats', send: 'What CAD formats do you accept?' },
    { label: 'Get a quote', send: 'I need a quote on a part' },
  ],
  materials: [
    { label: 'DFM review', send: 'Do you do DFM review?' },
    { label: 'Get a quote', send: 'I need a quote on a part' },
  ],
  dfm: [
    { label: 'Upload CAD', send: 'How do I upload CAD?' },
    { label: 'Get a quote', send: 'I need a quote on a part' },
  ],
  hello: OPENING_CHIPS,
  thanks: [
    { label: 'Get a quote', send: 'I need a quote on a part' },
  ],
  other: OPENING_CHIPS,
};

const MATERIAL_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\btitanium\b|\bti-?6al-?4v\b|\bti64\b/i, label: 'titanium' },
  { re: /\baluminum\b|\baluminium\b|\b6061\b|\b7075\b/i, label: 'aluminum' },
  { re: /\bstainless\b|\b17-4\b|\b316\b|\b304\b/i, label: 'stainless' },
  { re: /\binconel\b|\bnickel\s*alloy\b/i, label: 'Inconel' },
  { re: /\bpeek\b/i, label: 'PEEK' },
  { re: /\bultem\b/i, label: 'Ultem' },
  { re: /\bdelrin\b|\bacetal\b/i, label: 'Delrin' },
];

const CERT_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bas9100\b/i, label: 'AS9100' },
  { re: /\bas9102\b|\bfai\b/i, label: 'AS9102 FAI' },
  { re: /\bitar\b/i, label: 'ITAR' },
  { re: /\bnda\b|non[-\s]?disclosure|confidential/i, label: 'NDA' },
];

const INTENT_PHRASES: Array<{ intent: Intent; weight: number; phrases: RegExp[] }> = [
  {
    intent: 'hello',
    weight: 3,
    phrases: [/^\s*(hi|hey|hello|howdy)\b/i, /\bgood\s*(morning|afternoon|evening)\b/i],
  },
  {
    intent: 'thanks',
    weight: 3,
    phrases: [/\bthanks?\b/i, /\bthank\s*you\b/i, /\bappreciate\s*(it|that)\b/i, /\bperfect\b/i, /\bgreat\b.*\bhelp/i],
  },
  {
    intent: 'quote',
    weight: 4,
    phrases: [
      /\bquote\b/i,
      /\brfq\b/i,
      /\bpricing\b|\bprice\b|\bcost\b|\bbid\b/i,
      /\b24\s*h\b|\b24-hour\b/i,
      /\bhow\s*fast\b|\bturnaround\b|\blead\s*time/i,
      /\bneed\s*(a\s*)?(quote|price)/i,
      /\bthis\s*week\b|\basap\b|\burgent\b/i,
    ],
  },
  {
    intent: 'certs',
    weight: 4,
    phrases: [
      /\bas9100\b/i,
      /\bas9102\b|\bfai\b/i,
      /\bitar\b/i,
      /\bnda\b|non[-\s]?disclosure/i,
      /\bcert(ification|s)?\b/i,
      /\bcompliance\b|\bquality\s*system\b|\bexport\b/i,
    ],
  },
  {
    intent: 'cad',
    weight: 3,
    phrases: [
      /\bcad\b|\bstep\b|\bstp\b|\biges\b|\bdxf\b|\bdwg\b/i,
      /\bsolidworks\b|\bsldprt\b/i,
      /\bupload\b|\battach(ing|ment)?\b|\bfile\s*type|\bdrawing\b|\bzip\b/i,
      /\bformats?\b/i,
    ],
  },
  {
    intent: 'materials',
    weight: 3,
    phrases: [
      /\bmaterial(s)?\b|\btoleran/i,
      /\btitanium\b|\baluminum\b|\baluminium\b|\bstainless\b|\binconel\b/i,
      /\bpeek\b|\bultem\b|\bdelrin\b|\balloy\b|\bplastic\b/i,
      /\b±\s*0\.0001|\b0\.0001\b/i,
    ],
  },
  {
    intent: 'dfm',
    weight: 3,
    phrases: [
      /\bdfm\b/i,
      /\bdesign\s*for\s*manufact/i,
      /\breverse\s*eng/i,
      /\bprototype\b|\bproduction\b/i,
      /\bmachine\b|\bmachining\b|\bcan\s+you\s+machine\b/i,
      /\bcam\b|\bengineer(ing)?\b/i,
    ],
  },
];

function pick<T>(variants: T[], seed: number): T {
  return variants[Math.abs(seed) % variants.length];
}

function seedFrom(text: string, turn: number): number {
  let h = turn * 31;
  for (let i = 0; i < text.length; i++) h = (h + text.charCodeAt(i) * (i + 1)) % 997;
  return h;
}

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[!?.,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function emptyState(): ConversationState {
  return {
    lastIntents: [],
    slots: {},
    turnCount: 0,
    usefulAnswers: 0,
    lastTopic: null,
  };
}

export function loadState(): ConversationState {
  if (typeof sessionStorage === 'undefined') return emptyState();
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ConversationState;
    if (!parsed || typeof parsed !== 'object') return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      slots: { ...emptyState().slots, ...(parsed.slots || {}) },
      lastIntents: Array.isArray(parsed.lastIntents) ? parsed.lastIntents.slice(-8) : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: ConversationState): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function extractSlots(raw: string, prior: Slots): { slots: Slots; askedNda: boolean; askedFai: boolean } {
  const next: Slots = { ...prior };
  const t = raw;
  let askedNda = false;
  let askedFai = false;

  for (const m of MATERIAL_PATTERNS) {
    if (m.re.test(t)) {
      next.material = m.label;
      break;
    }
  }

  for (const c of CERT_PATTERNS) {
    if (c.re.test(t)) {
      if (c.label === 'NDA') {
        next.nda = true;
        askedNda = true;
      } else if (c.label === 'ITAR') {
        next.itar = true;
      } else if (c.label === 'AS9102 FAI') {
        next.cert = c.label;
        askedFai = true;
      } else {
        next.cert = c.label;
      }
    }
  }

  if (/\basap\b|\burgent\b|\bthis\s*week\b|\bby\s*friday\b|\bneed\s*(it\s*)?(soon|fast)\b/i.test(t)) {
    next.urgency = /this\s*week|by\s*friday/i.test(t) ? 'this week' : 'urgent';
  } else if (/\blead\s*time|\bturnaround|\bhow\s*fast|\b24\s*h/i.test(t)) {
    next.urgency = next.urgency || 'lead-time question';
  }

  if (/\bbracket/i.test(t)) next.partType = 'brackets';
  else if (/\bhousing/i.test(t)) next.partType = 'housings';
  else if (/\bmanifold/i.test(t)) next.partType = 'manifolds';
  else if (/\bfixture/i.test(t)) next.partType = 'fixtures';
  else if (/\bpart(s)?\b/i.test(t) && !next.partType) next.partType = 'parts';

  const qty = t.match(/\b(\d{1,5})\s*(pc|pcs|ea|pieces?|parts?|qty)\b/i) || t.match(/\bqty[:\s]*(\d{1,5})\b/i);
  if (qty) next.quantity = qty[1];

  if (/\bprototype|proto\b/i.test(t)) next.runType = 'prototype';
  else if (/\bproduction|prod\s*run|volume\b/i.test(t)) next.runType = 'production';

  if (/\bcad\b|\bstep\b|\bstp\b|\bdrawing\b|\bupload\b|\battach|\bfile\b|\bzip\b/i.test(t)) {
    next.cadMention = true;
  }

  return { slots: next, askedNda, askedFai };
}

function scoreIntents(normalized: string, raw: string): Intent[] {
  const scores = new Map<Intent, number>();

  for (const group of INTENT_PHRASES) {
    let hit = 0;
    for (const re of group.phrases) {
      if (re.test(raw) || re.test(normalized)) hit += 1;
    }
    if (hit > 0) {
      scores.set(group.intent, (scores.get(group.intent) || 0) + hit * group.weight);
    }
  }

  // Soft slot bumps so compound messages surface materials/certs alongside quote
  if (MATERIAL_PATTERNS.some((m) => m.re.test(raw))) {
    scores.set('materials', (scores.get('materials') || 0) + 4);
    scores.set('dfm', (scores.get('dfm') || 0) + 2);
  }
  if (/\bas9100\b|\bitar\b|\bas9102\b|\bfai\b|\bnda\b/i.test(raw)) {
    scores.set('certs', (scores.get('certs') || 0) + 5);
  }
  if (/\bmachine\b|\bmachining\b|\bcan\s+you\s+(make|cut|mill)\b/i.test(raw)) {
    scores.set('dfm', (scores.get('dfm') || 0) + 3);
  }

  const ranked = [...scores.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([intent]) => intent);

  if (!ranked.length) return ['other'];

  // Drop polite wrappers from primary ranking when substantive intents exist
  const substantive = ranked.filter((i) => i !== 'hello' && i !== 'thanks');
  if (substantive.length) return substantive.slice(0, 4);
  return ranked.slice(0, 2);
}

function primaryTopic(intents: Intent[], state: ConversationState): Intent {
  const first = intents[0];
  if (first && first !== 'other') return first;
  if (state.lastTopic && state.lastTopic !== 'other') return state.lastTopic;
  return 'other';
}

function isQuoteReady(slots: Slots, intents: Intent[]): boolean {
  const wantsQuote = intents.includes('quote') || Boolean(slots.urgency);
  const hasSubstance =
    Boolean(slots.material) ||
    Boolean(slots.cert) ||
    Boolean(slots.partType) ||
    Boolean(slots.cadMention) ||
    Boolean(slots.quantity) ||
    Boolean(slots.runType);
  return wantsQuote && hasSubstance;
}

function slotAck(slots: Slots, seed: number): string | null {
  const bits: string[] = [];
  if (slots.material) bits.push(slots.material);
  if (slots.partType) bits.push(slots.partType);
  if (slots.cert) bits.push(slots.cert);
  if (slots.itar) bits.push('ITAR');
  if (slots.urgency && slots.urgency !== 'lead-time question') bits.push(slots.urgency);

  if (!bits.length) return null;

  const focus = bits.slice(0, 3).join(', ');
  return pick(
    [
      `Got it — ${focus}.`,
      `Understood on ${focus}.`,
      `Noted: ${focus}.`,
    ],
    seed,
  );
}

function answerForIntent(
  intent: Intent,
  slots: Slots,
  seed: number,
  turn?: { askedNda?: boolean; askedFai?: boolean },
): string {
  switch (intent) {
    case 'quote':
      return pick(
        [
          'Most quote paths come back within 24h once we have part type, material, and qty.',
          'We target a quote path within 24h when the basics are clear — part, material, quantity.',
          'Quote turnaround is usually within 24h after we have enough to size the job.',
        ],
        seed,
      );
    case 'certs':
      // Prefer the most specific ask in THIS turn (NDA / FAI) even if AS9100 is already in slots
      if (turn?.askedNda) {
        return pick(
          [
            'NDAs are routine before proprietary or controlled files. Email sales@milltrue.com, or mark NDA-required on the RFQ — we will not open CAD until paperwork is set.',
            'Happy to sign an NDA first. Reach sales@milltrue.com or note it on the RFQ; controlled files stay closed until then.',
          ],
          seed,
        );
      }
      if (turn?.askedFai || slots.cert === 'AS9102 FAI') {
        return 'AS9102 FAI is available when your print requires it. Call it out on the RFQ and engineering will confirm scope.';
      }
      return pick(
        [
          'We run AS9100-minded process discipline with an ITAR-ready workflow. AS9102 FAI and NDAs are available when required.',
          'AS9100-minded controls and ITAR-ready handling are in place; FAI or NDA can be layered when your program needs them.',
        ],
        seed,
      );
    case 'cad':
      return pick(
        [
          'Preferred package is STEP (.step/.stp) plus a PDF drawing for tolerances. IGES, DXF/DWG, SolidWorks, or a ZIP also work — Full RFQ is the attach path.',
          'Send STEP with a PDF drawing when you can. We also take IGES, DXF/DWG, SolidWorks, and ZIP packages on the Full RFQ.',
        ],
        seed,
      );
    case 'materials':
      return pick(
        [
          'Critical dims held to ±0.0001" where the print demands it. Aerospace metals and engineering plastics (Delrin, PEEK, Ultem) are in the shop mix.',
          'We hold tight tolerances to print — including ±0.0001" on critical dims — across aerospace metals and plastics like Delrin, PEEK, and Ultem.',
        ],
        seed,
      );
    case 'dfm':
      return pick(
        [
          'CAD/reverse engineering, DFM, and CAM happen before cut. Prototypes typically 2–3 weeks; production 4–6 weeks depending on material and finish.',
          'We DFM the job before chips fly. Prototype windows are usually 2–3 weeks; production often 4–6 weeks based on material and finish.',
        ],
        seed,
      );
    case 'hello':
      return pick(
        [
          'Hey — I can help with quotes, certs, CAD, materials, and lead times.',
          'Hi — ask in plain language about machining, certs, or getting a quote.',
        ],
        seed,
      );
    case 'thanks':
      return pick(
        ['Glad that helped.', 'You are welcome.', 'Anytime.'],
        seed,
      );
    default:
      return pick(
        [
          'I can help with quotes, certs, CAD, materials, and lead times — rephrase anytime, or start a short quote when you are ready.',
          'Not sure I caught that. I cover quotes, AS9100/ITAR, CAD formats, materials, and lead times — or you can start a quote.',
        ],
        seed,
      );
  }
}

function nextStep(slots: Slots, intents: Intent[], usefulAnswers: number, seed: number): string | null {
  if (intents.includes('thanks') && intents.length === 1) {
    return pick(
      ['Want a quick quote path, or anything else on certs or CAD?', 'I can also point you to Start quote or Full RFQ if useful.'],
      seed,
    );
  }

  if (intents.includes('hello') && intents.length === 1) {
    return pick(
      ['What are you trying to machine or quote?', 'Tell me the part, material, or cert need and I will steer you.'],
      seed,
    );
  }

  if (!slots.material && (intents.includes('quote') || intents.includes('dfm'))) {
    return pick(
      ['What material and roughly what quantity are you looking at?', 'If you share material and qty, I can point you at the right quote path.'],
      seed,
    );
  }

  if (slots.material && !slots.cadMention && intents.includes('quote')) {
    return pick(
      ['If you have a STEP or drawing, Full RFQ is the cleanest attach path.', 'CAD helps — STEP plus a PDF drawing is ideal when you are ready.'],
      seed,
    );
  }

  if (slots.nda || intents.includes('certs')) {
    if (!slots.material && usefulAnswers < 2) {
      return 'If this is heading to a quote, material and qty help us size it.';
    }
  }

  if (isQuoteReady(slots, intents) || usefulAnswers >= 1) {
    return pick(
      [
        'When you want next steps, use Start quote for a short note or Full RFQ to attach files.',
        'Ready when you are — Start quote for a quick note, or Full RFQ if drawings are ready.',
      ],
      seed,
    );
  }

  return null;
}

function composeBubbles(
  intents: Intent[],
  slots: Slots,
  state: ConversationState,
  raw: string,
  turn: { askedNda: boolean; askedFai: boolean },
): string[] {
  const seed = seedFrom(raw, state.turnCount);
  const ack = slotAck(slots, seed);
  const primary = intents[0] || 'other';
  const secondary = intents.slice(1).filter((i) => i !== primary && i !== 'hello' && i !== 'thanks');

  // Follow-up that leans on memory (e.g. "what about NDA?" after titanium quote)
  const memoryOnly =
    intents.length === 1 &&
    (primary === 'certs' || primary === 'cad' || primary === 'materials' || primary === 'dfm') &&
    (Boolean(state.slots.material) || Boolean(state.slots.partType) || Boolean(state.slots.cert));

  const answers: string[] = [];
  answers.push(answerForIntent(primary, slots, seed, turn));

  // Fold second intent into the same conversational beat (compound messages)
  if (secondary[0]) {
    const extra = answerForIntent(secondary[0], slots, seed + 7, turn);
    // Keep compound replies prose-like: merge into one or two bubbles
    if (primary === 'quote' || secondary[0] === 'quote' || secondary[0] === 'certs' || secondary[0] === 'materials') {
      answers[0] = `${answers[0]} ${extra}`;
    } else {
      answers.push(extra);
    }
  } else if (slots.cert && primary === 'quote' && !turn.askedNda) {
    answers[0] = `${answers[0]} ${answerForIntent('certs', slots, seed + 3, turn)}`;
  } else if (slots.material && primary === 'quote' && !answers[0].toLowerCase().includes(slots.material.toLowerCase())) {
    answers[0] = `${answers[0]} ${slots.material} is in scope for us.`;
  }

  if (memoryOnly && state.slots.material) {
    answers[0] = pick(
      [
        `For the ${state.slots.material}${state.slots.partType ? ` ${state.slots.partType}` : ''} we were talking about — ${answers[0]}`,
        `Still on your ${state.slots.material} job: ${answers[0]}`,
      ],
      seed + 11,
    );
  }

  const step = nextStep(slots, intents, state.usefulAnswers, seed + 5);
  const bubbles: string[] = [];

  // On NDA follow-ups, skip re-acking material/cert so the answer stays plain
  const useAck = ack && !turn.askedNda && (slots.material || slots.cert || slots.partType || slots.urgency);

  // Prefer staggered ack + answer (messenger feel) over one dense dump
  if (useAck && ack) {
    bubbles.push(ack);
    // Leave room for optional next-step on the answer bubble (cap 2 total)
    bubbles.push(answers[0]);
  } else {
    bubbles.push(...answers);
  }

  if (step) {
    const last = bubbles[bubbles.length - 1];
    if (last && last.length + step.length < 300 && !intents.includes('thanks')) {
      bubbles[bubbles.length - 1] = `${last} ${step}`;
    } else {
      bubbles.push(step);
    }
  }

  // Cap at 2 bubbles for messenger feel
  return bubbles.slice(0, 2).map((b) => b.replace(/\s+/g, ' ').trim());
}

/**
 * At most 0–2 soft shortcuts. Never a permanent menu.
 * When quote/RFQ actions are already showing, skip chips (CTA buttons are enough).
 */
function suggestionChipsFor(topic: Intent, slots: Slots, showActionsSoon: boolean): Chip[] {
  if (showActionsSoon) return [];
  const base = CHIPS_BY_INTENT[topic] || OPENING_CHIPS;
  if (slots.nda || slots.cadMention) {
    return [{ label: 'Get a quote', send: 'I need a quote on a part' }].slice(0, 1);
  }
  return base.filter((c) => Boolean(c.send)).slice(0, 2);
}

/**
 * Main entry: update conversation state and build a plain-text desk reply.
 */
export function respond(input: string, prior?: ConversationState): { reply: DeskReply; state: ConversationState } {
  const state = prior ? { ...prior, slots: { ...prior.slots }, lastIntents: [...prior.lastIntents] } : loadState();
  const raw = input.trim();
  const normalized = normalizeText(raw);
  const intents = scoreIntents(normalized, raw);
  const extracted = extractSlots(raw, state.slots);
  const slots = extracted.slots;
  const turn = { askedNda: extracted.askedNda, askedFai: extracted.askedFai };

  const topic = primaryTopic(intents, state);
  const useful =
    intents.some((i) => i !== 'hello' && i !== 'thanks' && i !== 'other') ||
    Boolean(slots.material) ||
    Boolean(slots.cert) ||
    Boolean(slots.cadMention);

  const nextState: ConversationState = {
    lastIntents: [...state.lastIntents, ...intents].slice(-8),
    slots,
    turnCount: state.turnCount + 1,
    usefulAnswers: state.usefulAnswers + (useful ? 1 : 0),
    lastTopic: topic === 'hello' || topic === 'thanks' ? state.lastTopic || topic : topic,
  };

  const bubbles = composeBubbles(intents, slots, state, raw, turn);
  const quoteReady = isQuoteReady(slots, intents);
  const showActions = quoteReady || nextState.usefulAnswers >= 1 || intents.includes('quote') || intents.includes('cad');

  const reply: DeskReply = {
    bubbles,
    topic,
    chips: suggestionChipsFor(topic, slots, showActions),
    actions: showActions,
  };

  saveState(nextState);
  return { reply, state: nextState };
}

export { OPENING_CHIPS, CHIPS_BY_INTENT };
