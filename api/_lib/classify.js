/*
 * Turning raw request data into the buckets the dashboard groups by. Kept
 * coarse on purpose: a portfolio gets tens of visits a day, so "iOS / Safari"
 * says more than an exact build number would.
 */

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|headless|lighthouse|pagespeed|vercel-screenshot|python-requests|curl|wget/i;

export function isBot(userAgent) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function parseDevice(userAgent, touch) {
  const ua = userAgent || '';

  let os = 'Other';
  if (/iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch)) os = 'iPadOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  let browser = 'Other';
  if (/YaBrowser/.test(ua)) browser = 'Yandex';
  else if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/.test(ua)) browser = 'Samsung';
  else if (/Firefox|FxiOS/.test(ua)) browser = 'Firefox';
  else if (/Telegram/.test(ua)) browser = 'Telegram';
  else if (/LinkedInApp/.test(ua)) browser = 'LinkedIn app';
  else if (/Instagram/.test(ua)) browser = 'Instagram';
  else if (/Chrome|CriOS/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua)) browser = 'Safari';

  let device = 'desktop';
  if (os === 'iPadOS' || /Tablet|iPad/.test(ua) || (os === 'Android' && !/Mobile/.test(ua))) {
    device = 'tablet';
  } else if (/Mobi|iPhone|Android/.test(ua)) {
    device = 'mobile';
  }

  return { device, os, browser };
}

// Hosts grouped into the sources worth telling apart, first match wins.
const SOURCE_RULES = [
  [/linkedin\.com|lnkd\.in/, 'LinkedIn'],
  [/t\.me|telegram/, 'Telegram'],
  [/google\./, 'Google'],
  [/yandex\.|ya\.ru/, 'Yandex'],
  [/bing\.com|duckduckgo|ecosia|search\.brave/, 'Other search'],
  [/dribbble\.com/, 'Dribbble'],
  [/behance\.net/, 'Behance'],
  [/hh\.ru|headhunter/, 'hh.ru'],
  [/habr\.com|getmatch|career\.habr/, 'Habr'],
  [/facebook\.com|instagram\.com|t\.co|twitter\.com|x\.com|vk\.com|threads/, 'Social'],
  [/mail\.google|outlook|mail\.yandex|e\.mail\.ru/, 'Email'],
  [/chatgpt\.com|openai|perplexity|claude\.ai|gemini/, 'AI assistants'],
  [/notion\.|figma\.com|read\.cv/, 'Work tools'],
];

/*
 * Where a session came from. A UTM source beats the referrer — a link shared
 * as ?utm_source=hh is more honest than an empty referrer from an app.
 */
export function classifySource(referrer, utm) {
  if (utm?.source) {
    return { source: titleCase(utm.source), host: utm.source.toLowerCase() };
  }

  if (!referrer) {
    return { source: 'Direct', host: '' };
  }

  const host = referrer.split('/')[0].replace(/^www\./, '').toLowerCase();
  const rule = SOURCE_RULES.find(([pattern]) => pattern.test(host));

  return { source: rule ? rule[1] : 'Other sites', host };
}

function titleCase(value) {
  const known = {
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    tg: 'Telegram',
    hh: 'hh.ru',
    google: 'Google',
    yandex: 'Yandex',
    email: 'Email',
    dribbble: 'Dribbble',
    behance: 'Behance',
  };
  const key = value.toLowerCase();
  return known[key] || value.slice(0, 1).toUpperCase() + value.slice(1);
}

export function screenBucket(screen) {
  const width = Number.parseInt(String(screen || '').split('x')[0], 10);

  if (!width) return 'unknown';
  if (width < 480) return '< 480';
  if (width < 768) return '480–767';
  if (width < 1024) return '768–1023';
  if (width < 1440) return '1024–1439';
  if (width < 1920) return '1440–1919';
  return '1920+';
}
