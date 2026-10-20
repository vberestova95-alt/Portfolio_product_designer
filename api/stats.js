/*
 * Read side of the analytics, for the /stats dashboard. Two shapes:
 *
 *   GET /api/stats?days=30   the period report: totals against the previous
 *                            period, a per-day series and every breakdown
 *   GET /api/stats?live=1    the cheap poll: who is on the site right now,
 *                            the latest events and today's headline numbers
 *
 * Breakdowns are merged across days by Redis itself (ZUNION, PFCOUNT over many
 * keys), so a 90-day report costs about as many commands as a 7-day one — this
 * matters on the free Upstash plan, which counts commands.
 *
 * Access is a single shared password in STATS_PASSWORD, sent as a bearer token.
 */
import { timingSafeEqual } from 'node:crypto';
import {
  ALL_VISITORS,
  FEED,
  LIVE,
  TIME_ZONE,
  Z,
  dayKey,
  dayOf,
  liveKey,
  zKey,
} from './_lib/keys.js';
import { isConfigured, pipeline } from './_lib/redis.js';

const RANGES = new Set([1, 7, 30, 90]);
// A visitor counts as "on the site" while their tab keeps pinging (every 15 s).
const ACTIVE_MS = 45 * 1000;
const FEED_SIZE = 60;
const TOP = 25;

const CLICK_KINDS = ['project', 'contact', 'social', 'download', 'nav', 'outbound'];

// Every ranked breakdown the report returns: response field → zset name.
const BREAKDOWNS = {
  pages: Z.pages,
  landing: Z.landing,
  time: Z.time,
  scrollSum: Z.scrollSum,
  scroll25: Z.scroll(25),
  scroll50: Z.scroll(50),
  scroll75: Z.scroll(75),
  scroll100: Z.scroll(100),
  source: Z.source,
  referrer: Z.referrer,
  campaign: Z.campaign,
  device: Z.device,
  os: Z.os,
  browser: Z.browser,
  country: Z.country,
  city: Z.city,
  lang: Z.lang,
  screen: Z.screen,
  projectArea: Z.projectArea,
  conversionSource: Z.conversionSource,
  langSwitch: Z.langSwitch,
  errors: Z.errors,
  ...Object.fromEntries(CLICK_KINDS.map((kind) => [`click_${kind}`, Z.clicks(kind)])),
};

// Per-page breakdowns are joined by path in the client, so they are not cut.
const UNCUT = new Set(['pages', 'time', 'scrollSum', 'scroll25', 'scroll50', 'scroll75', 'scroll100']);

const COUNTERS = [
  'pageviews',
  'sessions',
  'multi_page_sessions',
  'engaged_ms',
  'conversions',
  'contact_menu_open',
];

function isAuthorized(req) {
  const expected = process.env.STATS_PASSWORD || '';
  const given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (!expected || !given) {
    return false;
  }

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// The last `count` days ending today, oldest first, in the site's time zone.
function lastDays(count, offset = 0) {
  const days = [];
  const now = Date.now();

  for (let index = count - 1 + offset; index >= offset; index -= 1) {
    days.push(dayOf(now - index * 24 * 60 * 60 * 1000));
  }

  // Around a DST change two offsets can land on one date; keep each day once.
  return [...new Set(days)];
}

function toObject(flat) {
  const object = {};

  for (let index = 0; flat && index < flat.length; index += 2) {
    object[flat[index]] = Number(flat[index + 1]);
  }

  return object;
}

// ZUNION … WITHSCORES comes back lowest first as [member, score, …].
function toRanking(flat, limit) {
  const rows = [];

  for (let index = 0; flat && index < flat.length; index += 2) {
    rows.push({ key: flat[index], value: Number(flat[index + 1]) });
  }

  rows.sort((a, b) => b.value - a.value);
  return limit ? rows.slice(0, limit) : rows;
}

function sumCounters(dailyCounters) {
  const totals = Object.fromEntries(COUNTERS.map((name) => [name, 0]));
  const hours = Array(24).fill(0);

  for (const counters of dailyCounters) {
    for (const name of COUNTERS) {
      totals[name] += counters[name] || 0;
    }

    for (let hour = 0; hour < 24; hour += 1) {
      hours[hour] += counters[`h${String(hour).padStart(2, '0')}`] || 0;
    }
  }

  return { totals, hours };
}

function summarize(totals, visitors) {
  const { pageviews, sessions, multi_page_sessions: multi, engaged_ms: engagedMs } = totals;

  return {
    visitors: visitors.all,
    newVisitors: visitors.new,
    returningVisitors: visitors.returning,
    sessions,
    pageviews,
    pagesPerSession: sessions ? pageviews / sessions : 0,
    bounceRate: sessions ? Math.max(0, sessions - multi) / sessions : 0,
    avgEngagedMs: pageviews ? engagedMs / pageviews : 0,
    avgSessionMs: sessions ? engagedMs / sessions : 0,
    conversions: totals.conversions,
    contactMenuOpen: totals.contact_menu_open,
  };
}

async function report(rangeDays) {
  const days = lastDays(rangeDays);
  const previousDays = lastDays(rangeDays, rangeDays);
  const keysFor = (list, name) => list.map((day) => dayKey(day, name));
  const zKeysFor = (name) => days.map((day) => zKey(day, name));

  const breakdownNames = Object.keys(BREAKDOWNS);
  const commands = [
    ...days.map((day) => ['HGETALL', dayKey(day, 'c')]),
    ...days.map((day) => ['PFCOUNT', dayKey(day, 'uv')]),
    ...days.map((day) => ['PFCOUNT', dayKey(day, 'uv_new')]),
    ...days.map((day) => ['PFCOUNT', dayKey(day, 'uv_ret')]),
    ['PFCOUNT', ...keysFor(days, 'uv')],
    ['PFCOUNT', ...keysFor(days, 'uv_new')],
    ['PFCOUNT', ...keysFor(days, 'uv_ret')],
    ['PFCOUNT', ...keysFor(days, 'f_case')],
    ['PFCOUNT', ...keysFor(days, 'f_intent')],
    ['PFCOUNT', ...keysFor(days, 'f_contact')],
    ['PFCOUNT', ALL_VISITORS],
    ...previousDays.map((day) => ['HGETALL', dayKey(day, 'c')]),
    ['PFCOUNT', ...keysFor(previousDays, 'uv')],
    ['PFCOUNT', ...keysFor(previousDays, 'uv_new')],
    ['PFCOUNT', ...keysFor(previousDays, 'uv_ret')],
    ...breakdownNames.map((name) => {
      const keys = zKeysFor(BREAKDOWNS[name]);
      return ['ZUNION', keys.length, ...keys, 'WITHSCORES'];
    }),
  ];

  const results = await pipeline(commands);
  let cursor = 0;
  const take = (count) => results.slice(cursor, (cursor += count));
  const one = () => results[cursor++];

  const dailyCounters = take(days.length).map(toObject);
  const dailyVisitors = take(days.length);
  const dailyNew = take(days.length);
  const dailyReturning = take(days.length);
  const visitors = { all: one(), new: one(), returning: one() };
  const funnel = {
    visitors: visitors.all,
    viewedCase: one(),
    openedContact: one(),
    contacted: one(),
  };
  const allTimeVisitors = one();
  const previousCounters = take(previousDays.length).map(toObject);
  const previousVisitors = { all: one(), new: one(), returning: one() };

  const breakdowns = {};
  for (const name of breakdownNames) {
    breakdowns[name] = toRanking(one(), UNCUT.has(name) ? 0 : TOP);
  }

  const current = sumCounters(dailyCounters);
  const previous = sumCounters(previousCounters);

  return {
    generatedAt: Date.now(),
    timeZone: TIME_ZONE,
    range: { days: rangeDays, from: days[0], to: days[days.length - 1] },
    totals: { ...summarize(current.totals, visitors), allTimeVisitors },
    previous: summarize(previous.totals, previousVisitors),
    daily: days.map((day, index) => ({
      day,
      visitors: dailyVisitors[index],
      newVisitors: dailyNew[index],
      returningVisitors: dailyReturning[index],
      pageviews: dailyCounters[index].pageviews || 0,
      sessions: dailyCounters[index].sessions || 0,
      conversions: dailyCounters[index].conversions || 0,
      hours: Array.from(
        { length: 24 },
        (_, hour) => dailyCounters[index][`h${String(hour).padStart(2, '0')}`] || 0,
      ),
    })),
    hours: current.hours,
    funnel,
    breakdowns,
  };
}

async function live() {
  const now = Date.now();
  const today = dayOf(now);
  const [sessionIds, feed, counters, visitors] = await pipeline([
    ['ZRANGEBYSCORE', LIVE, now - ACTIVE_MS, '+inf'],
    ['LRANGE', FEED, 0, FEED_SIZE - 1],
    ['HGETALL', dayKey(today, 'c')],
    ['PFCOUNT', dayKey(today, 'uv')],
  ]);

  const snapshots = sessionIds.length
    ? (await pipeline([['MGET', ...sessionIds.map(liveKey)]]))[0]
    : [];
  const parse = (value) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };
  const today_ = toObject(counters);

  return {
    now,
    active: snapshots.map(parse).filter(Boolean).sort((a, b) => b.ts - a.ts),
    feed: feed.map(parse).filter(Boolean),
    today: {
      visitors,
      pageviews: today_.pageviews || 0,
      sessions: today_.sessions || 0,
      conversions: today_.conversions || 0,
    },
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  if (!process.env.STATS_PASSWORD || !isConfigured()) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  if (!isAuthorized(req)) {
    // Slow down guessing; a real visit only ever pays this once.
    await new Promise((resolve) => setTimeout(resolve, 800));
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    if (req.query?.live) {
      res.status(200).json(await live());
      return;
    }

    const days = Number(req.query?.days) || 7;
    res.status(200).json(await report(RANGES.has(days) ? days : 7));
  } catch (error) {
    console.error('[stats]', error);
    res.status(500).json({ error: 'failed' });
  }
}
