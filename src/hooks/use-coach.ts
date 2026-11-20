'use client';

import { useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useProgress } from '@/context/progress-context';
import { getCoach, type Coach, type CoachEvent } from '@/lib/coaches';
import { coachLine, speakAsCoach } from '@/lib/coach-voice';
import { LOCALE_SPEECH, isLocale } from '@/i18n/config';

/** The person's chosen coach, plus helpers to get a line and speak it in the coach's voice. */
export function useCoach(override?: Coach) {
  const { settings } = useProgress();
  const locale = useLocale();
  const tVoice = useTranslations('voice');
  const coach = override ?? getCoach(settings.coachId);
  const speechLang = isLocale(locale) ? LOCALE_SPEECH[locale] : 'en-US';

  const generic = useCallback(
    (event: CoachEvent, vars: Record<string, string | number>) => tVoice(event, vars),
    [tVoice]
  );

  const line = useCallback(
    (event: CoachEvent, vars: Record<string, string | number> = {}, seed = 0) =>
      coachLine(coach, event, vars, locale, generic, seed),
    [coach, locale, generic]
  );

  /** Speaks a line if the voice coach is on (or `force` for previews). Returns the text. */
  const say = useCallback(
    (event: CoachEvent, vars: Record<string, string | number> = {}, seed = 0, force = false) => {
      const text = line(event, vars, seed);
      if (settings.voice || force) speakAsCoach(coach, text, speechLang);
      return text;
    },
    [line, settings.voice, coach, speechLang]
  );

  return useMemo(() => ({ coach, line, say, speechLang, locale }), [coach, line, say, speechLang, locale]);
}
