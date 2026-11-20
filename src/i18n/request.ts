import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, matchAcceptLanguage, type Locale } from './config';

/**
 * Locale without URL prefixes: the person's explicit choice (cookie) wins,
 * otherwise their browser's Accept-Language, otherwise English.
 * Untranslated keys fall back to English, so a partial translation never
 * shows raw keys.
 */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : matchAcceptLanguage((await headers()).get('accept-language'));

  const english = (await import('../messages/en.json')).default;
  const messages =
    locale === DEFAULT_LOCALE ? english : deepMerge(english, (await import(`../messages/${locale}.json`)).default);

  return { locale, messages };
});

type Messages = { [key: string]: string | Messages };

function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const b = base[k];
    out[k] = typeof v === 'object' && typeof b === 'object' ? deepMerge(b, v) : v;
  }
  return out;
}
