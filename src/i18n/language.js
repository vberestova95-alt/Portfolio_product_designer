/*
 * Site language. English is the default; Russian is one click away in the top
 * bar. The choice is remembered per browser, and `?lang=en` in a link wins over
 * both — so an English link can be sent to someone without them having to find
 * the switch.
 */
export const LANGUAGES = ['ru', 'en'];
export const DEFAULT_LANGUAGE = 'en';

const STORAGE_KEY = 'site-lang';

function isLanguage(value) {
  return LANGUAGES.includes(value);
}

export function readInitialLanguage() {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const fromQuery = new URLSearchParams(window.location.search).get('lang');

  if (isLanguage(fromQuery)) {
    storeLanguage(fromQuery);
    return fromQuery;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (isLanguage(stored)) {
      return stored;
    }
  } catch {
    // Storage can be blocked (private mode, disabled cookies) — fall through.
  }

  return DEFAULT_LANGUAGE;
}

export function storeLanguage(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not remembered, but the switch still works for this visit.
  }
}
