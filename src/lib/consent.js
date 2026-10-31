/*
 * The visitor's answer to the consent banner. Nothing that counts visits runs
 * before a yes: Metrika and the first-party analytics both start from here.
 *
 * The answer is kept for a year, then the banner asks again. public/404.html
 * and public/500.html read the same record inline, so keep its shape in step.
 */
import { initAnalytics } from './analytics.js';
import { startMetrika } from './metrika.js';

const CONSENT_KEY = 'vb_consent';
const CONSENT_MS = 365 * 24 * 60 * 60 * 1000;
const OPEN_EVENT = 'consent:open';

export const GRANTED = 'granted';
export const DENIED = 'denied';

// The standalone case build has no /privacy route of its own.
export const PRIVACY_HREF =
  import.meta.env.VITE_CASE_ONLY === 'true' ? 'https://vberestova.com/privacy' : '/privacy';

/* GRANTED, DENIED, or null while the visitor has not answered. */
export function readConsent() {
  try {
    const consent = JSON.parse(window.localStorage.getItem(CONSENT_KEY));
    return consent && consent.until > Date.now() ? consent.choice : null;
  } catch {
    return null;
  }
}

function startTracking() {
  initAnalytics();
  startMetrika();
}

function expireCookie(name, domain) {
  document.cookie = `${name}=; path=/; max-age=0${domain ? `; domain=${domain}` : ''}`;
}

// Metrika sets its cookies on the widest domain it can, so try each level.
function clearTrackingData() {
  const parts = window.location.hostname.split('.');
  const domains = ['', ...parts.slice(0, -1).map((_, index) => `.${parts.slice(index).join('.')}`)];

  document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name.startsWith('_ym'))
    .forEach((name) => domains.forEach((domain) => expireCookie(name, domain)));

  for (const store of [window.localStorage, window.sessionStorage]) {
    Object.keys(store)
      .filter((key) => key.startsWith('_ym') || key === 'vb_vid' || key === 'vb_sid')
      .forEach((key) => store.removeItem(key));
  }
}

/* Called once on load: a yes from an earlier visit starts tracking right away. */
export function applyConsent() {
  if (readConsent() === GRANTED) {
    startTracking();
  }
}

export function decideConsent(choice) {
  const wasGranted = readConsent() === GRANTED;

  try {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ choice, until: Date.now() + CONSENT_MS }),
    );
  } catch {
    // Blocked storage: the answer holds for this page and the banner asks again.
  }

  if (choice === GRANTED) {
    startTracking();
    return;
  }

  try {
    clearTrackingData();
  } catch {
    // Blocked storage holds nothing to clear.
  }

  // Metrika has no off switch once it runs, so a withdrawn yes needs a clean page.
  if (wasGranted) {
    window.location.reload();
  }
}

export function openConsent() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onConsentOpen(listener) {
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}
