import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readInitialLanguage, storeLanguage } from './language.js';
import { ui } from './ui.js';

/*
 * The default value matters: the runtime error page renders from the error
 * boundary, outside the provider, and still has to come out in the visitor's
 * language.
 */
const initialLanguage = readInitialLanguage();

const LanguageContext = createContext({
  lang: initialLanguage,
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage);

  const setLang = useCallback((next) => {
    storeLanguage(next);
    setLangState(next);

    // Drop a stale ?lang= so a reload does not switch the language back.
    const url = new URL(window.location.href);

    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang');
      window.history.replaceState(window.history.state, '', url);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/* Interface strings for the current language — see ui.js. */
export function useUi() {
  return ui[useContext(LanguageContext).lang];
}
