/*
 * First-party analytics: a tiny client that records what happens on the site
 * and ships it to our own endpoint (api/collect), which feeds the /stats
 * dashboard. Yandex.Metrika runs alongside for the webvisor. Both start only
 * after the visitor agrees — see consent.js.
 *
 * Nothing here identifies a person. A visitor is a random id in localStorage
 * (that is what tells new visitors from returning ones), a session is a random
 * id that expires after SESSION_IDLE_MS of inactivity.
 *
 * Clicks are classified by one delegated listener rather than handlers on every
 * link: the href already says what a link is (a case, mail, LinkedIn, the CV).
 * An element can override that with data-track="<kind>" and
 * data-track-id="<target>"; data-track-area on an ancestor names where on the
 * page the click came from (hero, cards, footer…).
 *
 * Opt out on your own devices with ?notrack=1 (and back in with ?notrack=0).
 */

import { readInitialLanguage } from '../i18n/language.js';

const ENDPOINT = '/api/collect';
const VISITOR_KEY = 'vb_vid';
const SESSION_KEY = 'vb_sid';
const OPT_OUT_KEY = 'vb_notrack';
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_MS = 5000;
// While the tab is visible, a ping this often keeps the visitor in "live now".
const HEARTBEAT_MS = 15000;
const SCROLL_MARKS = [25, 50, 75, 100];

// Internal paths that are a project, keyed to the id the dashboard shows.
const PROJECT_PATHS = {
  '/betboom-pass': 'betboom-pass',
  '/yandex-turkey': 'yandex-turkey',
  '/kokoc-group': 'kokoc-group',
  '/cat-app': 'cat-app',
  '/iquoto': 'iquoto',
  '/ds-plugins': 'ds-plugins',
  '/design-cringe': 'design-cringe',
  '/design-concepts': 'design-concepts',
  '/ai-projects': 'ai-projects',
  '/pet-injection-tracker': 'pet-injection-tracker',
};

const CONTACT_HOSTS = [
  ['linkedin.com', 'linkedin'],
  ['t.me', 'telegram'],
  ['telegram.me', 'telegram'],
  ['wa.me', 'whatsapp'],
];

const SOCIAL_HOSTS = [
  ['dribbble.com', 'dribbble'],
  ['behance.net', 'behance'],
  ['github.com', 'github'],
  ['instagram.com', 'instagram'],
  ['x.com', 'x'],
  ['twitter.com', 'x'],
  ['figma.com', 'figma'],
];

let state = null;

function storage(kind) {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function read(kind, key) {
  try {
    return storage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(kind, key, value) {
  try {
    storage(kind)?.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the visit just counts as new.
  }
}

function randomId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePath(pathname) {
  const path = (pathname || '/').replace(/\/index\.html$/, '') || '/';
  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

function readOptOut() {
  const flag = new URLSearchParams(window.location.search).get('notrack');

  if (flag === '1' || flag === '0') {
    write('localStorage', OPT_OUT_KEY, flag);
  }

  return read('localStorage', OPT_OUT_KEY) === '1';
}

function resolveVisitor() {
  const existing = read('localStorage', VISITOR_KEY);

  if (existing) {
    return { id: existing, isNew: false };
  }

  const id = randomId();
  write('localStorage', VISITOR_KEY, id);
  return { id, isNew: true };
}

function resolveSession() {
  const now = Date.now();
  const raw = read('localStorage', SESSION_KEY);
  let session = null;

  try {
    session = raw ? JSON.parse(raw) : null;
  } catch {
    session = null;
  }

  const isFresh = !session || now - session.last > SESSION_IDLE_MS;
  const next = isFresh ? { id: randomId(), last: now, pages: 0 } : session;
  next.last = now;
  next.pages += 1;
  write('localStorage', SESSION_KEY, JSON.stringify(next));

  return { id: next.id, isNew: isFresh, page: next.pages };
}

function touchSession() {
  const raw = read('localStorage', SESSION_KEY);

  try {
    const session = JSON.parse(raw);
    session.last = Date.now();
    write('localStorage', SESSION_KEY, JSON.stringify(session));
  } catch {
    // Nothing stored; the next page view starts a session anyway.
  }
}

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};

  for (const key of ['source', 'medium', 'campaign', 'content', 'term']) {
    const value = params.get(`utm_${key}`);

    if (value) {
      utm[key] = value.slice(0, 100);
    }
  }

  // A shared link often only carries ?ref=linkedin.
  if (!utm.source && params.get('ref')) {
    utm.source = params.get('ref').slice(0, 100);
  }

  return Object.keys(utm).length ? utm : undefined;
}

// Same-site referrers are navigation inside the visit, not a traffic source.
function readReferrer() {
  if (!document.referrer) {
    return '';
  }

  try {
    const url = new URL(document.referrer);
    return url.host === window.location.host ? '' : `${url.host}${url.pathname}`.slice(0, 200);
  } catch {
    return '';
  }
}

function matchHost(host, table) {
  const found = table.find(([domain]) => host === domain || host.endsWith(`.${domain}`));
  return found ? found[1] : null;
}

/*
 * What a link is, from its href: { kind, id } or null for links that are not
 * worth counting (in-page anchors, the logo back home).
 */
function classifyLink(anchor) {
  const href = anchor.getAttribute('href') || '';

  if (href.startsWith('mailto:')) {
    return { kind: 'contact', id: 'email' };
  }

  if (href.startsWith('tel:')) {
    return { kind: 'contact', id: 'phone' };
  }

  let url;

  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }

  if (/\.pdf$/i.test(url.pathname) || anchor.hasAttribute('download')) {
    return { kind: 'download', id: url.pathname.split('/').pop() };
  }

  if (url.host === window.location.host) {
    const path = normalizePath(url.pathname);

    if (PROJECT_PATHS[path]) {
      return { kind: 'project', id: PROJECT_PATHS[path] };
    }

    // Same-page anchors and the current page are not navigation.
    if (path === normalizePath(window.location.pathname)) {
      return null;
    }

    return { kind: 'nav', id: path };
  }

  const host = url.host.replace(/^www\./, '');
  const contact = matchHost(host, CONTACT_HOSTS);

  if (contact) {
    return { kind: 'contact', id: contact };
  }

  const social = matchHost(host, SOCIAL_HOSTS);

  if (social) {
    return { kind: 'social', id: social };
  }

  return { kind: 'outbound', id: host };
}

// Where on the page a click happened: the nearest marked area or landmark, so
// the nav inside the hero reads as "nav", not "hero".
function resolveArea(element) {
  const area = element.closest('[data-track-area], header, nav, footer');

  if (!area) {
    return 'page';
  }

  return area.getAttribute('data-track-area') || area.tagName.toLowerCase();
}

function labelOf(element) {
  const text = (element.getAttribute('aria-label') || element.textContent || '').trim();
  return text.replace(/\s+/g, ' ').slice(0, 80);
}

function handleClick(event) {
  const element = event.target instanceof Element ? event.target : null;
  const target = element?.closest('[data-track], a[href]');

  if (!target) {
    return;
  }

  const explicit = target.getAttribute('data-track');
  const link =
    explicit
      ? { kind: explicit, id: target.getAttribute('data-track-id') || labelOf(target) }
      : classifyLink(target);

  if (!link) {
    return;
  }

  track('click', {
    kind: link.kind,
    id: link.id,
    area: resolveArea(target),
    label: labelOf(target),
  });

  // Leaving the page: send now rather than on the next tick.
  if (target.tagName === 'A' && target.getAttribute('target') !== '_blank') {
    flush();
  }
}

function scrollPercent() {
  const root = document.documentElement;
  const scrollable = root.scrollHeight - window.innerHeight;

  if (scrollable <= 0) {
    return 100;
  }

  return Math.min(100, Math.round(((window.scrollY + 1) / scrollable) * 100));
}

function handleScroll() {
  const percent = scrollPercent();

  if (percent > state.maxScroll) {
    state.maxScroll = percent;
  }

  for (const mark of SCROLL_MARKS) {
    if (percent >= mark && !state.scrollMarks.has(mark)) {
      state.scrollMarks.add(mark);
      track('scroll', { depth: mark });
    }
  }
}

function tickEngagement() {
  if (state.visibleSince) {
    state.engagedMs += Date.now() - state.visibleSince;
    state.visibleSince = Date.now();
  }
}

function handleVisibility() {
  if (document.visibilityState === 'visible') {
    state.visibleSince = Date.now();
    touchSession();
    return;
  }

  tickEngagement();
  state.visibleSince = 0;
  sendPageSummary();
  flush();
}

/*
 * One summary per page view with how long it was actually looked at and how
 * far it was scrolled. Sent every time the tab is hidden, each time with the
 * running totals, so the server keeps the last one it got.
 */
function sendPageSummary() {
  const summary = { ms: Math.round(state.engagedMs), scroll: state.maxScroll };
  const key = `${summary.ms}:${summary.scroll}`;

  // Hiding the tab and leaving the page both land here back to back.
  if (key === state.lastSummary) {
    return;
  }

  state.lastSummary = key;
  track('engage', summary);
}

function heartbeat() {
  if (document.visibilityState !== 'visible') {
    return;
  }

  tickEngagement();
  touchSession();
  track('ping', { ms: Math.round(state.engagedMs), scroll: state.maxScroll });
  flush();
}

function flush() {
  if (!state || !state.queue.length) {
    return;
  }

  const body = JSON.stringify({
    vid: state.visitor.id,
    sid: state.session.id,
    pv: state.pageviewId,
    events: state.queue.splice(0),
  });

  if (import.meta.env.DEV) {
    console.debug('[analytics]', JSON.parse(body));
    return;
  }

  const blob = new Blob([body], { type: 'application/json' });

  if (navigator.sendBeacon?.(ENDPOINT, blob)) {
    return;
  }

  fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
}

/* Record an event. Safe to call before init or when tracking is off. */
export function track(type, data = {}) {
  if (!state) {
    return;
  }

  state.queue.push({
    type,
    ts: Date.now(),
    path: state.path,
    ...data,
  });
}

export function initAnalytics() {
  if (typeof window === 'undefined' || state) {
    return;
  }

  const optedOut = readOptOut();
  const isLocal = /^(localhost|127\.|192\.168\.|\[::1\])/.test(window.location.hostname);

  if (optedOut || (isLocal && !import.meta.env.DEV) || navigator.webdriver) {
    return;
  }

  const visitor = resolveVisitor();
  const session = resolveSession();

  state = {
    visitor,
    session,
    pageviewId: randomId(),
    path: normalizePath(window.location.pathname),
    queue: [],
    engagedMs: 0,
    visibleSince: document.visibilityState === 'visible' ? Date.now() : 0,
    maxScroll: 0,
    scrollMarks: new Set(),
    lastSummary: '',
  };

  track('pageview', {
    newVisitor: visitor.isNew,
    newSession: session.isNew,
    pageInSession: session.page,
    referrer: session.isNew ? readReferrer() : '',
    utm: readUtm(),
    lang: readInitialLanguage(),
    browserLang: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    touch: navigator.maxTouchPoints > 0,
  });
  flush();

  document.addEventListener('click', handleClick, { capture: true });
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', () => {
    tickEngagement();
    sendPageSummary();
    flush();
  });

  let scrollFrame = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          handleScroll();
        });
      }
    },
    { passive: true },
  );

  // Short pages never scroll: count what is already on screen once it settles.
  window.setTimeout(handleScroll, 1500);
  window.setInterval(heartbeat, HEARTBEAT_MS);
  window.setInterval(flush, FLUSH_MS);
}
