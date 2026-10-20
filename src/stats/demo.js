/*
 * Made-up data in the exact shape api/stats.js returns, so the dashboard can be
 * looked at locally (vite dev has no /api) and with ?demo=1 before real
 * traffic exists. Seeded, so a reload shows the same picture.
 */

function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const PAGES = [
  ['/', 1],
  ['/betboom-pass', 0.42],
  ['/yandex-turkey', 0.26],
  ['/cat-app', 0.22],
  ['/kokoc-group', 0.17],
  ['/iquoto', 0.14],
  ['/ai-projects', 0.12],
  ['/experience', 0.11],
  ['/design-concepts', 0.09],
  ['/ds-plugins', 0.06],
  ['/design-cringe', 0.04],
];

const rank = (pairs, scale) =>
  pairs.map(([key, share]) => ({ key, value: Math.max(0, Math.round(share * scale)) }));

function dayString(offset) {
  const date = new Date(Date.now() - offset * 86400000);
  return date.toISOString().slice(0, 10);
}

export function demoReport(rangeDays) {
  const random = seeded(rangeDays * 7919);
  const days = Array.from({ length: rangeDays }, (_, i) => dayString(rangeDays - 1 - i));
  const hourShape = (hour) => Math.max(0.05, Math.sin(((hour - 7) / 17) * Math.PI));

  const daily = days.map((day) => {
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    const base = (weekday === 0 || weekday === 6 ? 14 : 26) + random() * 18;
    const visitors = Math.round(base);
    const returningVisitors = Math.round(visitors * (0.18 + random() * 0.14));
    const sessions = Math.round(visitors * 1.15);
    const pageviews = Math.round(sessions * (2.1 + random()));
    const hours = Array.from({ length: 24 }, (_, hour) =>
      Math.round((pageviews / 12) * hourShape(hour) * (0.6 + random() * 0.8)),
    );

    return {
      day,
      visitors,
      newVisitors: visitors - returningVisitors,
      returningVisitors,
      pageviews,
      sessions,
      conversions: Math.round(visitors * (0.04 + random() * 0.05)),
      hours,
    };
  });

  const sum = (key) => daily.reduce((total, row) => total + row[key], 0);
  const visitors = Math.round(sum('visitors') * 0.82);
  const pageviews = sum('pageviews');
  const sessions = sum('sessions');
  const conversions = sum('conversions');
  const pages = rank(PAGES, pageviews / 2.4);

  const summary = (factor) => ({
    visitors: Math.round(visitors * factor),
    newVisitors: Math.round(visitors * 0.76 * factor),
    returningVisitors: Math.round(visitors * 0.27 * factor),
    sessions: Math.round(sessions * factor),
    pageviews: Math.round(pageviews * factor),
    pagesPerSession: (pageviews / sessions) * (0.95 + factor * 0.05),
    bounceRate: 0.38 + (1 - factor) * 0.1,
    avgEngagedMs: 52000 * factor,
    avgSessionMs: 118000 * factor,
    conversions: Math.round(conversions * factor),
    contactMenuOpen: Math.round(conversions * 1.9 * factor),
  });

  return {
    demo: true,
    generatedAt: Date.now(),
    timeZone: 'Europe/Moscow',
    range: { days: rangeDays, from: days[0], to: days[days.length - 1] },
    totals: { ...summary(1), allTimeVisitors: visitors * 3 + 412 },
    previous: summary(0.84),
    daily,
    hours: Array.from({ length: 24 }, (_, hour) =>
      daily.reduce((total, row) => total + row.hours[hour], 0),
    ),
    funnel: {
      visitors,
      viewedCase: Math.round(visitors * 0.58),
      openedContact: Math.round(visitors * 0.14),
      contacted: Math.round(visitors * 0.07),
    },
    breakdowns: {
      pages,
      landing: rank([['/', 0.71], ['/betboom-pass', 0.12], ['/cat-app', 0.08], ['/yandex-turkey', 0.05], ['/experience', 0.04]], sessions),
      time: pages.map(({ key, value }) => ({ key, value: value * (key === '/' ? 38000 : 64000 + random() * 70000) })),
      scrollSum: pages.map(({ key, value }) => ({ key, value: value * (key === '/' ? 48 : 55 + random() * 30) })),
      scroll25: pages.map(({ key, value }) => ({ key, value: Math.round(value * 0.86) })),
      scroll50: pages.map(({ key, value }) => ({ key, value: Math.round(value * (0.55 + random() * 0.2)) })),
      scroll75: pages.map(({ key, value }) => ({ key, value: Math.round(value * (0.3 + random() * 0.25)) })),
      scroll100: pages.map(({ key, value }) => ({ key, value: Math.round(value * (0.12 + random() * 0.25)) })),
      source: rank([['Direct', 0.34], ['LinkedIn', 0.27], ['Telegram', 0.16], ['Google', 0.09], ['hh.ru', 0.06], ['Dribbble', 0.04], ['AI assistants', 0.02], ['Other sites', 0.02]], sessions),
      referrer: rank([['linkedin.com', 0.27], ['t.me', 0.12], ['web.telegram.org', 0.04], ['google.com', 0.09], ['hh.ru', 0.06], ['dribbble.com', 0.04], ['chatgpt.com', 0.02]], sessions),
      campaign: rank([['autumn-search', 0.05], ['cv-email', 0.03]], sessions),
      device: rank([['desktop', 0.61], ['mobile', 0.35], ['tablet', 0.04]], sessions),
      os: rank([['macOS', 0.38], ['iOS', 0.24], ['Windows', 0.21], ['Android', 0.12], ['Linux', 0.03], ['iPadOS', 0.02]], sessions),
      browser: rank([['Chrome', 0.44], ['Safari', 0.31], ['Yandex', 0.09], ['Telegram', 0.06], ['Firefox', 0.04], ['LinkedIn app', 0.03], ['Edge', 0.03]], sessions),
      country: rank([['RU', 0.48], ['RS', 0.11], ['GE', 0.08], ['DE', 0.07], ['NL', 0.06], ['US', 0.05], ['TR', 0.04], ['AE', 0.03], ['KZ', 0.03]], sessions),
      city: rank([['Moscow, RU', 0.31], ['Saint Petersburg, RU', 0.11], ['Belgrade, RS', 0.09], ['Tbilisi, GE', 0.07], ['Berlin, DE', 0.05], ['Amsterdam, NL', 0.05]], sessions),
      lang: rank([['en', 0.72], ['ru', 0.28]], sessions),
      screen: rank([['1440–1919', 0.36], ['< 480', 0.33], ['1024–1439', 0.17], ['1920+', 0.09], ['768–1023', 0.05]], sessions),
      projectArea: rank([['betboom-pass|work-cards', 0.3], ['yandex-turkey|work-cards', 0.17], ['cat-app|work-cards', 0.14], ['kokoc-group|work-cards', 0.11], ['betboom-pass|more-work', 0.05], ['iquoto|more-work', 0.05], ['design-concepts|practice', 0.06], ['ai-projects|nav', 0.07]], sessions),
      conversionSource: rank([['LinkedIn', 0.43], ['Direct', 0.24], ['Telegram', 0.19], ['hh.ru', 0.14]], conversions),
      langSwitch: rank([['ru', 0.04], ['en', 0.01]], sessions),
      errors: rank([['404 /cases', 0.01], ['404 /portfolio', 0.004]], sessions),
      click_project: rank([['betboom-pass', 0.35], ['yandex-turkey', 0.2], ['cat-app', 0.16], ['kokoc-group', 0.13], ['iquoto', 0.09], ['design-concepts', 0.06], ['ai-projects', 0.07], ['ds-plugins', 0.04]], sessions),
      click_contact: rank([['linkedin', 0.42], ['email', 0.33], ['telegram', 0.25]], conversions * 0.7),
      click_social: rank([['dribbble', 0.05]], sessions),
      click_download: rank([['Vladislava-Berestova-CV.pdf', 1]], conversions * 0.3),
      click_nav: rank([['/experience', 0.09], ['/ai-projects', 0.07], ['/design-concepts', 0.05]], sessions),
      click_outbound: rank([['apps.apple.com', 0.01], ['figma.com', 0.01]], sessions),
    },
  };
}

const LIVE_PATHS = ['/', '/betboom-pass', '/cat-app', '/yandex-turkey', '/experience'];

export function demoLive() {
  const now = Date.now();
  const random = seeded(Math.floor(now / 10000));
  const people = [
    { device: 'desktop', os: 'macOS', browser: 'Chrome', country: 'RU', city: 'Moscow', source: 'LinkedIn' },
    { device: 'mobile', os: 'iOS', browser: 'Telegram', country: 'RS', city: 'Belgrade', source: 'Telegram' },
    { device: 'desktop', os: 'Windows', browser: 'Yandex', country: 'RU', city: 'Kazan', source: 'hh.ru' },
  ].slice(0, 1 + Math.floor(random() * 3));

  const active = people.map((person, index) => ({
    ...person,
    ts: now - Math.round(random() * 20000),
    path: LIVE_PATHS[Math.floor(random() * LIVE_PATHS.length)],
    vid: `demo${index}abc`,
    since: now - Math.round((1 + random() * 6) * 60000),
  }));

  const feedTypes = [
    { type: 'pageview' },
    { type: 'click', kind: 'project', id: 'betboom-pass', area: 'work-cards' },
    { type: 'contact_menu_open' },
    { type: 'click', kind: 'contact', id: 'linkedin', area: 'nav' },
    { type: 'click', kind: 'download', id: 'Vladislava-Berestova-CV.pdf', area: 'footer' },
    { type: 'pageview', referrer: 'www.linkedin.com/feed/' },
  ];

  const feed = Array.from({ length: 14 }, (_, index) => {
    const person = active[index % active.length];
    return {
      ...feedTypes[index % feedTypes.length],
      ts: now - index * 47000 - Math.round(random() * 20000),
      path: LIVE_PATHS[index % LIVE_PATHS.length],
      vid: person.vid,
      device: person.device,
      country: person.country,
      source: person.source,
    };
  });

  return {
    demo: true,
    now,
    active,
    feed,
    today: { visitors: 23, pageviews: 61, sessions: 27, conversions: 2 },
  };
}
