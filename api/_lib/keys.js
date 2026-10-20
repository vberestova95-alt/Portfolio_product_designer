/*
 * The Redis layout, shared by the collector and the dashboard API.
 *
 * Everything is pre-aggregated per day (in the site owner's time zone), so the
 * dashboard reads a handful of keys per day instead of scanning raw events:
 *
 *   d:<day>:c            hash  counters (pageviews, sessions, conversions…)
 *   d:<day>:h            hash  pageviews by hour "00"…"23"
 *   d:<day>:uv / uv_new / uv_ret
 *                        HLL   unique visitors / first-time / returning
 *   d:<day>:f_case / f_intent / f_contact
 *                        HLL   funnel: viewed a case / opened "contact me" /
 *                              clicked a contact or downloaded the CV
 *   d:<day>:z:<name>     zset  ranked breakdowns, see Z below
 *
 * Plus a few rolling keys for the live view: the sessions seen recently, what
 * each is looking at, and the last events.
 */

export const TIME_ZONE = process.env.ANALYTICS_TZ || 'Europe/Moscow';
export const DAY_TTL = 60 * 60 * 24 * 400;
export const PAGEVIEW_TTL = 60 * 60 * 24;
export const SESSION_TTL = 60 * 60 * 2;
export const FEED_LENGTH = 300;

export const Z = {
  pages: 'pages', // pageviews by path
  landing: 'landing', // first page of a session
  time: 'time', // engaged ms by path (sum)
  scrollSum: 'scroll_sum', // max scroll % by path (sum over pageviews)
  scroll: (depth) => `scroll_${depth}`, // pageviews by path that reached depth
  source: 'source', // sessions by source group
  referrer: 'referrer', // sessions by referring host
  campaign: 'campaign', // sessions by utm_campaign
  device: 'device',
  os: 'os',
  browser: 'browser',
  country: 'country',
  city: 'city',
  lang: 'lang',
  screen: 'screen',
  clicks: (kind) => `click_${kind}`, // clicks by target id, per kind
  projectArea: 'project_area', // project clicks by "id|area"
  conversionSource: 'conv_source', // contact + CV clicks by session source
  langSwitch: 'lang_switch',
  errors: 'errors',
};

export const LIVE = 'live'; // zset: session id → last seen ms
export const FEED = 'feed'; // list of recent events, newest first
export const ALL_VISITORS = 'all:uv'; // HLL of every visitor ever

export const dayKey = (day, suffix) => `d:${day}:${suffix}`;
export const zKey = (day, name) => dayKey(day, `z:${name}`);
export const pageviewKey = (id) => `pv:${id}`;
export const sessionKey = (id) => `s:${id}`;
// JSON snapshot of what a live session is looking at; expires on its own.
export const liveKey = (id) => `live:${id}`;
export const LIVE_TTL = 60 * 10;

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const hourFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  hourCycle: 'h23',
});

export function dayOf(ms) {
  return dayFormat.format(new Date(ms));
}

export function hourOf(ms) {
  return hourFormat.format(new Date(ms)).padStart(2, '0');
}
