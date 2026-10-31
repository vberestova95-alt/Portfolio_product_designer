/*
 * Receives the batches sent by src/lib/analytics.js and folds them into the
 * per-day aggregates described in _lib/keys.js.
 *
 * Two round trips per batch: one read of the page view and session it belongs
 * to (time on page arrives as running totals, so the stored total is needed to
 * add only the difference), then one pipeline of writes.
 *
 * It always answers 204 — the beacon cannot do anything with an error, and a
 * failure here must never surface on the site.
 */
import { classifySource, isBot, parseDevice, screenBucket } from './_lib/classify.js';
import {
  ALL_VISITORS,
  DAY_TTL,
  FEED,
  FEED_LENGTH,
  LIVE,
  LIVE_TTL,
  PAGEVIEW_TTL,
  SESSION_TTL,
  Z,
  dayKey,
  dayOf,
  hourOf,
  liveKey,
  pageviewKey,
  sessionKey,
  zKey,
} from './_lib/keys.js';
import { isConfigured, pipeline } from './_lib/redis.js';

const ALLOWED_HOSTS = (process.env.ANALYTICS_HOSTS || 'vberestova.com,www.vberestova.com')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const ID_PATTERN = /^[\w-]{6,64}$/;
const MAX_EVENTS = 60;
// One page view cannot honestly add more than this much reading time.
const MAX_PAGE_MS = 30 * 60 * 1000;
const SCROLL_DEPTHS = new Set([25, 50, 75, 100]);
const CLICK_KINDS = new Set(['project', 'contact', 'social', 'download', 'nav', 'outbound']);
const CONVERSION_KINDS = new Set(['contact', 'download']);
// Pages that are not a case: views of anything else count toward "viewed a case".
const NON_CASE_PATHS = new Set(['/', '/experience', '/ai-projects', '/design-concepts', '/privacy']);

function text(value, max = 120) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function readBody(req) {
  const { body } = req;

  if (!body) return null;
  if (typeof body === 'object' && !Buffer.isBuffer(body)) return body;

  try {
    return JSON.parse(Buffer.isBuffer(body) ? body.toString('utf8') : body);
  } catch {
    return null;
  }
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    return false;
  }

  try {
    return ALLOWED_HOSTS.includes(new URL(origin).host);
  } catch {
    return false;
  }
}

function toObject(flat) {
  // HGETALL over REST comes back as [field, value, field, value, …].
  const object = {};

  for (let index = 0; flat && index < flat.length; index += 2) {
    object[flat[index]] = flat[index + 1];
  }

  return object;
}

function header(req, name) {
  const value = req.headers[name];
  return value ? decodeURIComponent(String(value)) : '';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  res.status(204);

  const payload = readBody(req);
  const userAgent = req.headers['user-agent'] || '';

  if (
    !isConfigured() ||
    !payload ||
    !isAllowedOrigin(req) ||
    isBot(userAgent) ||
    !ID_PATTERN.test(payload.vid) ||
    !ID_PATTERN.test(payload.sid) ||
    !ID_PATTERN.test(payload.pv) ||
    !Array.isArray(payload.events)
  ) {
    res.end();
    return;
  }

  try {
    await record(payload, req, userAgent);
  } catch (error) {
    console.error('[collect]', error);
  }

  res.end();
}

async function record({ vid, sid, pv, events }, req, userAgent) {
  const now = Date.now();
  const batch = events.slice(0, MAX_EVENTS).filter((event) => event && typeof event === 'object');

  const [storedPageview, storedSession] = await pipeline([
    ['HGETALL', pageviewKey(pv)],
    ['HGETALL', sessionKey(sid)],
  ]);

  const page = toObject(storedPageview);
  let session = toObject(storedSession);
  const commands = [];
  const touched = new Set();

  const today = dayOf(now);
  const hincr = (day, field, by = 1) => {
    const key = dayKey(day, 'c');
    touched.add(key);
    commands.push(['HINCRBY', key, field, by]);
  };
  const zincr = (day, name, member, by = 1) => {
    if (!member && member !== 0) return;
    const key = zKey(day, name);
    touched.add(key);
    commands.push(['ZINCRBY', key, by, String(member)]);
  };
  const pfadd = (day, name) => {
    const key = dayKey(day, name);
    touched.add(key);
    commands.push(['PFADD', key, vid]);
  };
  const feed = (event, extra) => {
    commands.push([
      'LPUSH',
      FEED,
      JSON.stringify({
        ts: now,
        type: event.type,
        path: page.path || text(event.path, 200),
        vid: vid.slice(0, 8),
        device: session.device,
        country: session.country,
        source: session.source,
        ...extra,
      }),
    ]);
  };

  for (const event of batch) {
    const path = text(event.path, 200) || '/';

    switch (event.type) {
      case 'pageview': {
        if (page.path) {
          // A resent beacon: this page view is already counted.
          break;
        }

        const newSession = event.newSession === true || !session.start;
        page.path = path;
        page.day = today;
        page.ms = '0';
        page.scroll = '0';

        if (newSession) {
          const { device, os, browser } = parseDevice(userAgent, event.touch === true);
          const { source, host } = classifySource(text(event.referrer, 200), event.utm);
          session = {
            start: String(now),
            source,
            device,
            os,
            browser,
            country: header(req, 'x-vercel-ip-country') || 'unknown',
            city: header(req, 'x-vercel-ip-city'),
          };

          hincr(today, 'sessions');
          zincr(today, Z.landing, path);
          zincr(today, Z.source, source);
          zincr(today, Z.referrer, host);
          zincr(today, Z.campaign, text(event.utm?.campaign, 100));
          zincr(today, Z.device, device);
          zincr(today, Z.os, os);
          zincr(today, Z.browser, browser);
          zincr(today, Z.country, session.country);
          zincr(today, Z.city, session.city && `${session.city}, ${session.country}`);
          zincr(today, Z.lang, text(event.lang, 8) || 'unknown');
          zincr(today, Z.screen, screenBucket(event.screen));
          pfadd(today, event.newVisitor === true ? 'uv_new' : 'uv_ret');
        }

        if (event.pageInSession === 2) {
          // The session went past its landing page: not a bounce.
          hincr(today, 'multi_page_sessions');
        }

        hincr(today, 'pageviews');
        hincr(today, `h${hourOf(now)}`);
        zincr(today, Z.pages, path);
        pfadd(today, 'uv');
        commands.push(['PFADD', ALL_VISITORS, vid]);

        if (!NON_CASE_PATHS.has(path)) {
          pfadd(today, 'f_case');
        }

        feed(event, { referrer: newSession ? text(event.referrer, 200) : undefined });
        break;
      }

      case 'click': {
        const kind = text(event.kind, 20);
        const id = text(event.id, 120);
        const area = text(event.area, 40);

        if (!CLICK_KINDS.has(kind) || !id) break;

        zincr(today, Z.clicks(kind), id);

        if (kind === 'project') {
          zincr(today, Z.projectArea, `${id}|${area}`);
        }

        if (CONVERSION_KINDS.has(kind)) {
          hincr(today, 'conversions');
          pfadd(today, 'f_contact');
          zincr(today, Z.conversionSource, session.source || 'Direct');
        }

        feed(event, { kind, id, area });
        break;
      }

      case 'contact_menu_open':
        hincr(today, 'contact_menu_open');
        pfadd(today, 'f_intent');
        feed(event);
        break;

      case 'lang_switch':
        zincr(today, Z.langSwitch, text(event.to, 8));
        break;

      case 'error_page':
        zincr(today, Z.errors, `${text(event.code, 4)} ${path}`);
        break;

      case 'scroll': {
        const depth = Number(event.depth);

        if (SCROLL_DEPTHS.has(depth)) {
          zincr(page.day || today, Z.scroll(depth), page.path || path);
        }
        break;
      }

      case 'engage':
      case 'ping': {
        if (!page.path) break;

        // Running totals from the page: add only what is new since last time.
        const ms = Math.min(MAX_PAGE_MS, Math.max(0, Number(event.ms) || 0));
        const scroll = Math.min(100, Math.max(0, Number(event.scroll) || 0));
        const msDelta = Math.round(ms - Number(page.ms || 0));
        const scrollDelta = Math.round(scroll - Number(page.scroll || 0));

        if (msDelta > 0) {
          zincr(page.day, Z.time, page.path, msDelta);
          hincr(page.day, 'engaged_ms', msDelta);
          page.ms = String(ms);
        }

        if (scrollDelta > 0) {
          zincr(page.day, Z.scrollSum, page.path, scrollDelta);
          page.scroll = String(scroll);
        }
        break;
      }

      default:
        break;
    }
  }

  if (page.path) {
    commands.push(
      ['HSET', pageviewKey(pv), ...Object.entries(page).flat()],
      ['EXPIRE', pageviewKey(pv), PAGEVIEW_TTL],
    );
  }

  if (session.start) {
    commands.push(
      ['HSET', sessionKey(sid), ...Object.entries(session).flat()],
      ['EXPIRE', sessionKey(sid), SESSION_TTL],
      ['ZADD', LIVE, now, sid],
      [
        'SET',
        liveKey(sid),
        JSON.stringify({
          ts: now,
          path: page.path || '/',
          vid: vid.slice(0, 8),
          device: session.device,
          os: session.os,
          browser: session.browser,
          country: session.country,
          city: session.city,
          source: session.source,
          since: Number(session.start),
        }),
        'EX',
        LIVE_TTL,
      ],
    );
  }

  // Keep the rolling keys small: the live set holds the last 10 minutes.
  const stale = now - LIVE_TTL * 1000;
  commands.push(['LTRIM', FEED, 0, FEED_LENGTH - 1], ['ZREMRANGEBYSCORE', LIVE, 0, stale]);

  for (const key of touched) {
    commands.push(['EXPIRE', key, DAY_TTL]);
  }

  await pipeline(commands);
}
