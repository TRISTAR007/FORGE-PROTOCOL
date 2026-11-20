/**
 * Coach voices on the browser's built-in speech engine (free, offline-
 * capable, no API keys). Each coach gets their own pitch + speaking rate
 * and a voice of the preferred gender when the device has one, in the
 * person's language. English speakers hear each coach's own personality
 * lines; other languages use translated generic lines.
 */
import { fillLine, pickLine, type Coach, type CoachEvent } from '@/lib/coaches';

const FEMALE_HINTS = [
  'female', 'woman', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'susan', 'hazel', 'aria',
  'jenny', 'sonia', 'libby', 'natasha', 'joanna', 'kendra', 'kimberly', 'ivy', 'salli', 'monica', 'paulina', 'amelie',
  'anna', 'helena', 'sabina', 'kyoko', 'haruka', 'ayumi', 'nanami', 'sunhi', 'yuna', 'tingting', 'xiaoxiao', 'huihui',
  'lekha', 'kalpana', 'swara', 'damayanti', 'gadis', 'laila', 'hoda', 'zeynep', 'yelda', 'luciana', 'francisca',
  'elvira', 'denise', 'katja', 'hedda', 'amala', 'google uk english female',
];
const MALE_HINTS = [
  'male', 'david', 'mark', 'daniel', 'alex', 'fred', 'george', 'guy', 'ryan', 'thomas', 'oliver', 'james', 'arthur',
  'aaron', 'rishi', 'jorge', 'diego', 'pablo', 'raul', 'henri', 'paul', 'hans', 'stefan', 'conrad', 'ichiro', 'keita',
  'otoya', 'takumi', 'kangkang', 'yunyang', 'hemant', 'prabhat', 'ardi', 'naayf', 'tolga', 'google uk english male',
];

let cachedVoices: SpeechSynthesisVoice[] = [];

function voices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length) cachedVoices = list;
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => voices());
}

function scoreVoice(v: SpeechSynthesisVoice, lang: string, gender: 'female' | 'male'): number {
  const name = v.name.toLowerCase();
  const vLang = v.lang.toLowerCase();
  const want = lang.toLowerCase();
  let score = 0;
  if (vLang === want) score += 40;
  else if (vLang.split('-')[0] === want.split('-')[0]) score += 30;
  else return -1;
  const hints = gender === 'female' ? FEMALE_HINTS : MALE_HINTS;
  const opposite = gender === 'female' ? MALE_HINTS : FEMALE_HINTS;
  if (hints.some((h) => name.includes(h))) score += 20;
  if (opposite.some((h) => name.includes(h))) score -= 15;
  if (/natural|neural|premium|enhanced|online/.test(name)) score += 8;
  if (v.localService) score += 2;
  return score;
}

export function pickVoice(lang: string, gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices()) {
    const s = scoreVoice(v, lang, gender);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best;
}

/** Speaks `text` in the coach's voice. `lang` is a BCP-47 tag like "en-US" or "ja-JP". */
export function speakAsCoach(coach: Coach, text: string, lang: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voice = pickVoice(lang, coach.voice.gender);
    if (voice) u.voice = voice;
    u.pitch = coach.voice.pitch;
    u.rate = coach.voice.rate;
    window.speechSynthesis.speak(u);
  } catch {
    // Speech is a nicety — never let it break the session.
  }
}

/**
 * The line a coach says for an event: their own English personality line,
 * or a translated generic line for other languages.
 */
export function coachLine(
  coach: Coach,
  event: CoachEvent,
  vars: Record<string, string | number>,
  locale: string,
  generic: (event: CoachEvent, vars: Record<string, string | number>) => string,
  seed = 0
): string {
  if (locale.startsWith('en')) return fillLine(pickLine(coach, event, seed), vars);
  return generic(event, vars);
}
