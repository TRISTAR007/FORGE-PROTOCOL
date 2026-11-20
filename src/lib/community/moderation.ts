/**
 * Client-side message hygiene. This is a first line of defence that keeps
 * the chat friendlier and protects younger members; real moderation comes
 * from reports, blocks, moderators and the database rate limit.
 */

// Short, high-confidence list of slurs/profanity across the supported
// languages. Matching is whole-word and case-insensitive.
const BLOCKED_WORDS = [
  'fuck', 'fucking', 'shit', 'bitch', 'cunt', 'asshole', 'dick', 'pussy', 'whore', 'slut', 'faggot', 'retard',
  'nigger', 'nigga', 'kys',
  'puta', 'puto', 'mierda', 'pendejo', 'cabrón', 'cabron', 'gilipollas',
  'caralho', 'porra', 'buceta', 'viado',
  'merde', 'putain', 'connard', 'salope', 'enculé',
  'scheiße', 'scheisse', 'arschloch', 'fotze', 'hurensohn',
  'orospu', 'siktir', 'amına', 'piç',
  'anjing', 'bangsat', 'kontol', 'memek', 'goblok',
  'chutiya', 'madarchod', 'bhenchod', 'gaand',
  'كس', 'شرموطة', 'زب',
  '씨발', '병신', '개새끼',
  '傻逼', '操你妈',
  'くそ', 'ちんこ',
];

const WORD_RE = new RegExp(
  `(^|[\\s.,!?;:'"()\\[\\]-])(${BLOCKED_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=$|[\\s.,!?;:'"()\\[\\]-])`,
  'giu'
);
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// 9+ digits with optional spaces, dashes, dots or a leading + — phone numbers.
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;

export interface CleanResult {
  text: string;
  changed: boolean;
}

/** Masks blocked words and hides emails / phone numbers. */
export function cleanMessage(input: string): CleanResult {
  let text = input.replace(/\s+$/g, '').replace(/^\s+/g, '');
  const before = text;
  text = text.replace(WORD_RE, (_m, lead: string, word: string) => `${lead}${'*'.repeat([...word].length)}`);
  text = text.replace(EMAIL_RE, '[hidden]');
  text = text.replace(PHONE_RE, (m) => (m.replace(/\D/g, '').length >= 9 ? '[hidden]' : m));
  return { text, changed: text !== before };
}
