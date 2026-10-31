/*
 * Phone hero pairs (п. 24): at ≤640px the two mosaics take BetBoom PASS + Yandex
 * News Turkey and Fluffy Chumb + Kokoc Group in turn — by the count
 * (PAIR_HOLD_MS, 7 s) and by a tap on the first screen's empty space. A tap on a
 * card opens the case. Past 640 the hero is as on the live site, 3 cases.
 *
 *   node e2e/hero-pairs.check.mjs
 *
 * Env:
 *   BASE=http://localhost:4173       EN build
 *   RU_BASE=http://localhost:4174    optional: throwaway build with RU_ENABLED=true
 *   PROD=https://vberestova.com      optional: compares 1440/1024/768/641 with the live site
 *   ONLY=chromium-en,webkit-en,chromium-ru,webkit-ru,regress    default: all there is
 *   SHOTS=<dir>
 *
 * About 12 minutes per browser and language. Timing is measured inside the page.
 *
 * "What is on screen" is read from the canvas, not from the DOM: each quarter of
 * a card is compared with the same quarter of the four covers, so a check can
 * tell the picture from the link. A tap records that reading as the finger lands
 * (pointerdown, capture), and the case that opened is checked against it.
 *
 * Emulation only: Playwright's Chromium and WebKit with a touch profile, not a
 * real iPhone. WebKit has no way here to swipe, so a swipe is Chromium only.
 * The hidden tab is simulated (document.hidden is overridden).
 */
import { chromium, webkit, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:4173';
const RU_BASE = process.env.RU_BASE;
const PROD = process.env.PROD;
const SHOTS = process.env.SHOTS ?? path.join(here, '.shots');
const ONLY = process.env.ONLY?.split(',');
mkdirSync(SHOTS, { recursive: true });

const HOLD = 7000;
const BUSY = 1730; // the longest a turn runs: 240 + 3 × 130 + 1100 ms
const PAIRS = [['/betboom-pass', '/yandex-turkey'], ['/cat-app', '/kokoc-group']];
const THREE = ['/betboom-pass', '/yandex-turkey', '/cat-app'];
// Past 640 the hero shows as many of the three as fit, as live: 800×844 three,
// 641×900 two, 641×844 one, 844×390 none. `regress` holds them to the live site.
const fromStart = (list) => same(list, THREE.slice(0, list.length));
const YANDEX = { en: 'Yandex News Turkey', ru: 'Яндекс Новости Турция' };
const pairText = (pair, lang) => (pair ? 'Fluffy Chumb, Kokoc Group' : `BetBoom PASS, ${YANDEX[lang]}`);

let total = 0;
const failed = [];
function check(name, ok, detail = '') {
  total += 1;
  if (!ok) failed.push(`${name}${detail ? `: ${detail}` : ''}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sleep = (page, ms) => page.waitForTimeout(ms);

const phoneOf = (width, height = 844) => ({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const iPhoneOf = (width = 390, height = 844) => ({ ...devices['iPhone 13'], viewport: { width, height } });

const DENY_CONSENT = () => {
  try {
    localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 }));
  } catch {}
};

// In the page: turns as they happen, the canvas read against the covers, and
// what was on screen as a finger landed (survives the navigation it causes).
const PROBE = () => {
  window.__turns = [];
  const links = () => [...document.querySelectorAll('.hero-panel .mosaic-link')];
  new MutationObserver((records) => {
    if (records.some((r) => r.target.matches?.('.hero-panel .mosaic-link'))) {
      window.__turns.push({ t: performance.now(), hrefs: links().map((a) => a.getAttribute('href')) });
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['href'] });

  const CASE_OF = { 'betboom-pass': '/betboom-pass', 'yandex-news': '/yandex-turkey', 'cat-app': '/cat-app', 'kokoc-group': '/kokoc-group' };
  const RIVAL = { '/betboom-pass': '/cat-app', '/cat-app': '/betboom-pass', '/yandex-turkey': '/kokoc-group', '/kokoc-group': '/yandex-turkey' };
  const N = 12;
  const tmp = document.createElement('canvas');
  tmp.width = N;
  tmp.height = N;
  const g = tmp.getContext('2d', { willReadFrequently: true });
  const grab = (src, x, y, w, h) => {
    g.clearRect(0, 0, N, N);
    g.drawImage(src, x, y, w, h, 0, 0, N, N);
    return g.getImageData(0, 0, N, N).data.slice();
  };

  window.__prep = async () => {
    const truth = {};
    for (const [id, href] of Object.entries(CASE_OF)) {
      const src = document.querySelector(`.work-card--${id} .work-card__visual img, .work-card--${id} img`)?.getAttribute('src');
      if (!src) continue;
      const img = new Image();
      img.src = src;
      await img.decode();
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const half = side / 2;
      truth[href] = [0, 1].map((r) => [0, 1].map((c) => grab(img, (img.naturalWidth - side) / 2 + c * half, r * half, half, half)));
    }
    window.__truth = truth;
  };

  // Nearest cover for each quarter of a link's card, and the one most quarters show.
  function pieces(link) {
    const canvas = document.querySelector('.hero-mosaic--index');
    const box = canvas.getBoundingClientRect();
    const k = canvas.width / box.width;
    const r = link.getBoundingClientRect();
    const [x, y, w, h] = [(r.left - box.left) * k, (r.top - box.top) * k, r.width * k, r.height * k];
    const own = link.getAttribute('href');
    const seen = [];
    const two = [];
    for (const pr of [0, 1]) {
      for (const pc of [0, 1]) {
        const data = grab(canvas, x + (pc * w) / 2, y + (pr * h) / 2, w / 2, h / 2);
        const distTo = (ref) => {
          let dist = 0;
          for (let i = 0; i < data.length; i += 4) {
            dist += Math.abs(data[i] - ref[i]) + Math.abs(data[i + 1] - ref[i + 1]) + Math.abs(data[i + 2] - ref[i + 2]);
          }
          return dist;
        };
        const covers = Object.entries(window.__truth ?? {}).map(([href, grid]) => ({ href, dist: distTo(grid[pr][pc]) }));
        seen.push(covers.reduce((a, b) => (b.dist < a.dist ? b : a), { dist: Infinity }).href);
        // Mid-turn a shaded frame can land near a third cover: only the two that
        // take this place count.
        const pair = covers.filter((c) => c.href === own || c.href === RIVAL[own]);
        two.push(pair.reduce((a, b) => (b.dist < a.dist ? b : a), { dist: Infinity }).href);
      }
    }
    const count = {};
    two.forEach((s) => { count[s] = (count[s] ?? 0) + 1; });
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const shown = top.length > 1 && top[0][1] === top[1][1] ? 'mixed' : top[0][0];
    return { seen, two, shown };
  }

  window.__snap = () => {
    const now = performance.now();
    const last = window.__turns.at(-1);
    return {
      dt: last ? Math.round(now - last.t) : null,
      turns: window.__turns.length,
      links: links().map((a) => {
        const label = a.querySelector('.mosaic-link__label');
        return {
          href: a.getAttribute('href'),
          chip: a.querySelector('.mosaic-link__title')?.textContent,
          opacity: Number(getComputedStyle(label).opacity),
          active: a.classList.contains('is-active'),
          ...pieces(a),
        };
      }),
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  };

  addEventListener('pointerdown', (e) => {
    if (!window.__truth) return;
    const snap = window.__snap();
    snap.link = e.target.closest?.('a')?.getAttribute('href') ?? null;
    try { localStorage.setItem('__tap', JSON.stringify(snap)); } catch {}
  }, true);
};

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/yandex\.|ERR_CERT_|ERR_FAILED/.test(`${m.text()} ${m.location()?.url ?? ''}`)) errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return errors;
}

async function open(browserType, options, { consent = 'denied' } = {}) {
  const browser = await browserType.launch();
  const context = await browser.newContext(options);
  if (consent === 'denied') await context.addInitScript(DENY_CONSENT);
  await context.addInitScript(PROBE);
  await context.route(/mc\.yandex\.ru|\/api\/collect/, (route) => route.abort());
  const page = await context.newPage();
  return { browser, context, page, errors: watchErrors(page) };
}

async function home(page, base, lang, { settle = true } = {}) {
  await page.goto(`${base}/${lang === 'ru' ? '?lang=ru' : ''}`, { waitUntil: 'load' });
  await page.waitForSelector('.hero-panel .mosaic-link', { timeout: 15000 });
  if (settle) await sleep(page, 2600); // the first deal of the pieces
  await page.evaluate(() => window.__prep());
}

const snap = (page) => page.evaluate(() => window.__snap());
const hrefs = (s) => s.links.map((l) => l.href);
const turnsSince = async (page, n) => (await page.evaluate(() => window.__turns.length)) - n;
const turnCount = (page) => page.evaluate(() => window.__turns.length);
const tap = (page, [x, y]) => page.touchscreen.tap(x, y);

// The first screen at 390×844: black squares, a grey one, the copy, the margin.
const spots = async (page) => page.evaluate(() => {
  const mid = (sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
  };
  const panel = document.querySelector('.hero-panel').getBoundingClientRect();
  const links = [...document.querySelectorAll('.hero-panel .mosaic-link')].map((a) => a.getBoundingClientRect());
  const plate = document.querySelector('.hero-panel__plate').getBoundingClientRect();
  const h1 = document.querySelector('.hero-panel h1').getBoundingClientRect();
  return {
    black: [Math.round(panel.width - 40), Math.round(links[0].top + 40)],
    blackLeft: [40, Math.round(links[0].bottom + 40)],
    grey: [Math.round(panel.width - 30), Math.round((plate.bottom + h1.top) / 2)],
    lead: mid('.hero-panel__lead'),
    title: mid('.hero-panel h1'),
    margin: [6, Math.round(panel.bottom - 20)],
  };
});

const cardSpot = async (page, place) => page.evaluate((i) => {
  const r = document.querySelectorAll('.hero-panel .mosaic-link')[i].getBoundingClientRect();
  return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 3)];
}, place);
const chipSpot = async (page, place) => page.evaluate((i) => {
  const r = document.querySelectorAll('.hero-panel .mosaic-link__label')[i].getBoundingClientRect();
  return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
}, place);

const leftHome = (page) => page.waitForURL((u) => new URL(u).pathname !== '/', { timeout: 6000, waitUntil: 'commit' }).then(() => true, () => false);
const openedPath = (page) => new URL(page.url()).pathname;
const readTap = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('__tap') ?? 'null'));

// At rest: both cards show the case their link leads to, chips say the same.
function atRest(s, pair) {
  const wrong = s.links.filter((l) => l.seen.some((x) => x !== l.href));
  const out = [];
  if (pair !== undefined && !same(hrefs(s), PAIRS[pair])) out.push(`links ${hrefs(s).join(', ')}`);
  if (wrong.length) out.push(`picture ≠ link: ${wrong.map((l) => `${l.href} shows ${l.seen.join('/')}`).join('; ')}`);
  if (s.links.some((l) => l.opacity < 0.99)) out.push(`chip faded: ${s.links.map((l) => l.opacity).join('/')}`);
  if (!s.links.at(-1)?.active) out.push('last chip not active');
  return out.join(' | ');
}

/* ---------------------------------------------------------- 1. start, round */

async function startAndRound({ browserType, options, base, lang, tag }) {
  const { browser, page, errors } = await open(browserType, options);
  await home(page, base, lang, { settle: false });
  await sleep(page, 2600);
  let s = await snap(page);
  check(`${tag} 1: starts on BetBoom + Yandex, pictures match`, !atRest(s, 0), atRest(s, 0) || hrefs(s).join(', '));
  check(`${tag} 1: chips read ${pairText(0, lang)}`, same(s.links.map((l) => l.chip), ['BetBoom PASS', YANDEX[lang]]), s.links.map((l) => l.chip).join(', '));
  check(`${tag} 1: no sideways scroll`, s.over <= 0, `over ${s.over}`);
  await page.screenshot({ path: path.join(SHOTS, `pairs-${tag}-pair1.png`) });

  // By the count, four turns running: the long hold.
  await page.waitForFunction(() => window.__turns.length >= 4, null, { timeout: HOLD * 4 + 6000 }).catch(() => {});
  const turns = await page.evaluate(() => window.__turns);
  const gaps = turns.slice(1).map((t, i) => Math.round(t.t - turns[i].t));
  check(`${tag} 5: 4 turns on the count`, turns.length === 4, `${turns.length} turns`);
  check(`${tag} 5: a turn every 7 s, no speeding up`, gaps.length === 3 && gaps.every((g) => Math.abs(g - HOLD) < 350), `gaps ${gaps.join(', ')} ms`);
  check(`${tag} 1: the round alternates`, same(turns.map((t) => t.hrefs), [PAIRS[1], PAIRS[0], PAIRS[1], PAIRS[0]]), turns.map((t) => t.hrefs[0]).join(' → '));
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 5: back on the first pair after 4 turns, nothing out of step`, !atRest(s, 0), atRest(s, 0) || 'ok');

  // By the count, a turn lands whole.
  await page.waitForFunction((n) => window.__turns.length > n, 4, { timeout: HOLD + 2000 }).catch(() => {});
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 1: second pair by the count, pictures match`, !atRest(s, 1), atRest(s, 1) || 'ok');
  check(`${tag} 1: chips read Fluffy Chumb, Kokoc Group`, same(s.links.map((l) => l.chip), ['Fluffy Chumb', 'Kokoc Group']), s.links.map((l) => l.chip).join(', '));
  await page.screenshot({ path: path.join(SHOTS, `pairs-${tag}-pair2.png`) });
  check(`${tag} 5: no errors in the long hold`, errors.length === 0, errors.join(' | '));

  // By a tap.
  await home(page, base, lang);
  const at = await spots(page);
  await tap(page, at.black);
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 1: second pair by a tap`, !atRest(s, 1), atRest(s, 1) || 'ok');
  await tap(page, at.black);
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 1: a further tap goes back to the first pair`, !atRest(s, 0), atRest(s, 0) || 'ok');
  await browser.close();
}

/* ---------------------------------------------------- 2. the tap opens a case */

async function tapsOpen({ browserType, options, base, lang, tag }) {
  const { browser, page, errors } = await open(browserType, options);
  for (const pair of [0, 1]) {
    for (const place of [0, 1]) {
      for (const [name, spot] of [['card', cardSpot], ['chip', chipSpot]]) {
        await home(page, base, lang);
        if (pair) {
          await tap(page, (await spots(page)).black);
          await sleep(page, BUSY + 100);
        }
        await tap(page, await spot(page, place));
        await leftHome(page);
        check(`${tag} 2: at rest, ${name} ${PAIRS[pair][place]} opens it`, openedPath(page) === PAIRS[pair][place], openedPath(page));
      }
    }
  }

  // Mid-turn: what was on screen as the finger landed against what opened.
  const sweep = async (name, dts, start, places = [0, 1]) => {
    for (const dt of dts) {
      for (const place of places) {
        const shot = await start(dt, place);
        const rec = await readTap(page);
        const link = rec?.links?.[place];
        const opened = openedPath(page);
        const seen = link?.shown;
        const ok = !!link && (seen === opened || seen === 'mixed');
        // Not a FAIL: the link leads to the new case from a turn's first moment, by
        // design (heroMosaic.js, `pairs`), so for ~1 s the picture is the old one.
        // Counted and printed; the user decides whether that is acceptable.
        midTurn.total += 1;
        if (!ok) midTurn.off.push(`${name} +${dt} ms card ${place + 1}`);
        console.log(`${ok ? 'PASS' : 'FINDING'}  ${tag} 2: ${name} +${dt} ms, card ${place + 1}: the case on screen opens  — real +${rec?.dt} ms; on screen ${seen} (${link?.two.join(' ')}), chip "${link?.chip}" opacity ${link?.opacity?.toFixed(2)}; opened ${opened}`);
      }
    }
  };

  const byTap = (extra) => async (dt, place) => {
    await home(page, base, lang);
    const at = await spots(page);
    if (extra) {
      await tap(page, at.black);
      await sleep(page, BUSY + 100);
    }
    const spot = await cardSpot(page, place);
    await tap(page, at.black);
    if (dt) await sleep(page, dt);
    await tap(page, spot);
    await leftHome(page);
    return null;
  };
  const byCount = async (dt, place) => {
    await home(page, base, lang);
    const spot = await cardSpot(page, place);
    await page.waitForFunction(() => window.__turns.length >= 1, null, { timeout: HOLD + 2000, polling: 'raf' });
    if (dt) await sleep(page, dt);
    await tap(page, spot);
    await leftHome(page);
    return null;
  };

  const midTurn = { total: 0, off: [] };
  await sweep('turn by a tap', [0, 150, 300, 500, 700, 900, 1200, 1800], byTap(false));
  await sweep('turn back by a tap', [0, 300, 700, 1200], byTap(true));
  await sweep('turn by the count', [0, 300, 900], byCount);
  console.log(`INFO  ${tag} 2: taps during a turn — ${midTurn.off.length} of ${midTurn.total} open a case other than the one pictured at that moment`);
  check(`${tag} 2: no errors`, errors.length === 0, errors.join(' | '));
  await browser.close();
}

/* -------------------------------------------- 3. what turns and what does not */

async function whereTaps({ browserType, options, base, lang, tag, swipe }) {
  const { browser, context, page, errors } = await open(browserType, options);
  await home(page, base, lang);
  const at = await spots(page);

  for (const [name, spot] of Object.entries(at)) {
    await home(page, base, lang);
    await tap(page, spot);
    await sleep(page, 120);
    const s = await snap(page);
    check(`${tag} 3: a tap on ${name} ${spot} turns the pair`, same(hrefs(s), PAIRS[1]) && s.turns === 1 && openedPath(page) === '/', `turns ${s.turns}, ${hrefs(s).join(', ')}`);
  }

  // The logo reloads the page by design; it must not count as a turn first.
  await home(page, base, lang);
  const brand = await page.evaluate(() => {
    const r = document.querySelector('.hero-panel__brand').getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  await page.evaluate(() => { window.__stale = true; });
  await tap(page, brand);
  await page.waitForFunction(() => !window.__stale, null, { timeout: 8000 }).catch(() => {});
  await page.waitForSelector('.hero-panel .mosaic-link');
  await sleep(page, 400);
  let s = await page.evaluate(() => ({ links: [...document.querySelectorAll('.hero-panel .mosaic-link')].map((a) => a.getAttribute('href')), turns: window.__turns.length }));
  check(`${tag} 3: logo reloads, first pair, no turn`, same(s.links, PAIRS[0]) && s.turns === 0, `${s.links.join(', ')}, turns ${s.turns}`);

  // Burger: no turn; the open menu: no turn, and a tap outside only closes it.
  await home(page, base, lang);
  const burger = await page.evaluate(() => {
    const r = document.querySelector('.nav-menu__burger').getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  await tap(page, burger);
  await sleep(page, 600);
  check(`${tag} 3: burger opens the menu, no turn`, (await turnCount(page)) === 0 && (await page.locator('.nav-menu.is-open').count()) === 1, `turns ${await turnCount(page)}`);
  await page.screenshot({ path: path.join(SHOTS, `pairs-${tag}-menu.png`) });
  await tap(page, [195, 20]); // above the sheet: with the language row in RU it reaches y 332
  await sleep(page, 700);
  check(`${tag} 3: a tap past the open menu closes it, no turn`, (await turnCount(page)) === 0 && (await page.locator('.nav-menu.is-open').count()) === 0, `turns ${await turnCount(page)}, open ${await page.locator('.nav-menu.is-open').count()}`);
  await tap(page, at.black);
  await sleep(page, 120);
  check(`${tag} 3: after the menu a tap turns again`, (await turnCount(page)) === 1, `turns ${await turnCount(page)}`);

  // Selected text: a tap only clears it.
  await home(page, base, lang);
  await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.hero-panel__lead'));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  await tap(page, at.lead);
  await sleep(page, 300);
  check(`${tag} 3: a tap with text selected does not turn`, (await turnCount(page)) === 0, `turns ${await turnCount(page)}`);
  await page.evaluate(() => getSelection().removeAllRanges());
  await tap(page, at.lead);
  await sleep(page, 120);
  check(`${tag} 3: with the selection gone a tap turns`, (await turnCount(page)) === 1, `turns ${await turnCount(page)}`);

  if (swipe) {
    await home(page, base, lang);
    const cdp = await context.newCDPSession(page);
    const scrollY = () => page.evaluate(() => window.scrollY);
    await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 500, yDistance: -300, gestureSourceType: 'touch', speed: 1200 });
    await sleep(page, 200);
    check(`${tag} 3: a swipe on empty space scrolls, no turn`, (await scrollY()) > 100 && (await turnCount(page)) === 0, `scrollY ${await scrollY()}, turns ${await turnCount(page)}`);
    await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 300, yDistance: 600, gestureSourceType: 'touch', speed: 1800 });
    await sleep(page, 200);
    const card = await cardSpot(page, 0);
    await cdp.send('Input.synthesizeScrollGesture', { x: card[0], y: card[1], yDistance: -150, gestureSourceType: 'touch', speed: 1200 });
    await sleep(page, 200);
    check(`${tag} 3: a swipe starting on a card scrolls, opens nothing, no turn`, (await scrollY()) > 50 && openedPath(page) === '/' && (await turnCount(page)) === 0, `scrollY ${await scrollY()}, turns ${await turnCount(page)}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await cdp.send('Input.synthesizeScrollGesture', { x: 300, y: 500, xDistance: -160, yDistance: 0, gestureSourceType: 'touch', speed: 1200 });
    await sleep(page, 200);
    check(`${tag} 3: a sideways swipe does not turn`, (await turnCount(page)) === 0, `turns ${await turnCount(page)}`);
    // A long press: down, 800 ms, up.
    const [x, y] = at.black;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(page, 800);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(page, 300);
    check(`${tag} 3: a long press does not turn`, (await turnCount(page)) === 0, `turns ${await turnCount(page)}`);
    await tap(page, at.black);
    await sleep(page, 120);
    check(`${tag} 3: after all that a tap still turns`, (await turnCount(page)) === 1, `turns ${await turnCount(page)}`);
  }
  check(`${tag} 3: no errors`, errors.length === 0, errors.join(' | '));
  await browser.close();
}

/* ------------------------------------------------------ 4. the consent banner */

async function banner({ browserType, options, base, lang, tag }) {
  const fresh = async () => {
    const run = await open(browserType, options, { consent: null });
    await home(run.page, base, lang);
    return run;
  };
  const heroBox = (page) => page.evaluate(() => {
    const box = (sel) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10);
    };
    return { panel: box('.hero-panel'), canvas: box('.hero-mosaic--index'), h1: box('.hero-panel h1'), plate: box('.hero-panel__plate'), links: [...document.querySelectorAll('.hero-panel .mosaic-link')].map((a) => a.getBoundingClientRect().top) };
  });

  // Card under the open banner.
  for (const [name, pick] of [['card', (s) => cardSpot(s, 1)], ['chip', (s) => chipSpot(s, 1)]]) {
    const { browser, page } = await fresh();
    const b = await page.locator('.consent-banner').boundingBox();
    const spot = await pick(page);
    check(`${tag} 4: ${name} ${spot} is clear of the banner at y ${Math.round(b.y)}–${Math.round(b.y + b.height)}`, spot[1] < b.y, '');
    await tap(page, spot);
    await leftHome(page);
    check(`${tag} 4: banner open, tap on the ${name} opens the case`, openedPath(page) === '/yandex-turkey', openedPath(page));
    await browser.close();
  }

  const { browser, page, errors, context } = await fresh();
  const consent = page.locator('.consent-banner');
  const b = await consent.boundingBox();
  check(`${tag} 4: banner shown at about y 640–830`, Math.abs(b.y - 640) < 30 && Math.abs(b.y + b.height - 830) < 30, `y ${Math.round(b.y)}–${Math.round(b.y + b.height)}, x ${Math.round(b.x)}–${Math.round(b.x + b.width)}`);
  await page.screenshot({ path: path.join(SHOTS, `pairs-${tag}-banner.png`) });
  const at = await spots(page);

  // Empty space with the banner up.
  await tap(page, at.black);
  await sleep(page, BUSY + 100);
  let s = await snap(page);
  check(`${tag} 4: banner open, tap on empty space turns`, !atRest(s, 1), atRest(s, 1) || 'ok');

  // The banner itself does not.
  const n = await turnCount(page);
  const onText = await page.evaluate(() => {
    const r = document.querySelector('.consent-banner__text').getBoundingClientRect();
    return [r.left + 10, r.top + 10];
  });
  await tap(page, onText);
  await sleep(page, 300);
  await tap(page, [b.x + b.width / 2, b.y + b.height - 6]); // not a corner: it is rounded, a tap there goes past it
  await sleep(page, 300);
  check(`${tag} 4: a tap on the banner does not turn`, (await turnsSince(page, n)) === 0 && openedPath(page) === '/', `turns +${await turnsSince(page, n)}`);

  // The count runs behind it.
  await sleep(page, HOLD + 800);
  check(`${tag} 4: the count runs with the banner open`, (await turnsSince(page, n)) >= 1, `turns +${await turnsSince(page, n)}`);
  await sleep(page, BUSY);

  const closeWith = async (run, buttonClass, name) => {
    const before = await heroBox(run.page);
    await run.page.locator(buttonClass).click();
    await sleep(run.page, 500);
    const after = await heroBox(run.page);
    check(`${tag} 4: ${name}: banner closed`, (await run.page.locator('.consent-banner').count()) === 0);
    check(`${tag} 4: ${name}: hero did not move`, same(before, after), same(before, after) ? '' : `${JSON.stringify(before)} → ${JSON.stringify(after)}`);
    const count = await turnCount(run.page);
    await tap(run.page, (await spots(run.page)).black);
    await sleep(run.page, BUSY + 100);
    check(`${tag} 4: ${name}: tap on empty space turns`, (await turnsSince(run.page, count)) === 1, `turns +${await turnsSince(run.page, count)}`);
    const want = (await snap(run.page)).links[0].href;
    await tap(run.page, await cardSpot(run.page, 0));
    await leftHome(run.page);
    check(`${tag} 4: ${name}: tap on a card opens the case`, openedPath(run.page) === want, openedPath(run.page));
  };

  await closeWith({ page }, '.consent-banner__button:not(.consent-banner__button--accept)', 'decline');
  check(`${tag} 4: no errors with the banner`, errors.length === 0, errors.join(' | '));
  await context.close();
  await browser.close();

  const second = await fresh();
  await closeWith(second, '.consent-banner__button--accept', 'accept');
  await second.browser.close();
}

/* ------------------------------------------------------------- 5. the count */

async function count({ browserType, options, base, lang, tag }) {
  const { browser, page, errors } = await open(browserType, options);
  await home(page, base, lang);
  const at = await spots(page);

  // Off screen.
  await tap(page, at.black);
  await sleep(page, 1000);
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.hero-shell').getBoundingClientRect().bottom + window.scrollY + 300));
  await sleep(page, 300);
  let n = await turnCount(page);
  await sleep(page, HOLD + 2000);
  check(`${tag} 5: hero off screen, the count stands`, (await turnsSince(page, n)) === 0, `turns +${await turnsSince(page, n)}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction((c) => window.__turns.length > c, n, { timeout: HOLD + 1500 }).catch(() => {});
  check(`${tag} 5: back on screen, the count resumes`, (await turnsSince(page, n)) === 1, `turns +${await turnsSince(page, n)}`);

  // Hidden tab (simulated).
  await sleep(page, 1000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  n = await turnCount(page);
  await sleep(page, HOLD + 1500);
  check(`${tag} 5: hidden tab, the count stands`, (await turnsSince(page, n)) === 0, `turns +${await turnsSince(page, n)}`);
  await page.evaluate(() => {
    delete document.hidden;
    delete document.visibilityState;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction((c) => window.__turns.length > c, n, { timeout: HOLD + 1500 }).catch(() => {});
  check(`${tag} 5: visible again, the count resumes`, (await turnsSince(page, n)) === 1, `turns +${await turnsSince(page, n)}`);

  // A tap starts the count again.
  await sleep(page, 4500);
  n = await turnCount(page);
  await tap(page, at.black);
  await page.waitForFunction((c) => window.__turns.length > c + 1, n, { timeout: HOLD + 2500 }).catch(() => {});
  const gaps = await page.evaluate(() => window.__turns.slice(-2).map((t) => t.t));
  const gap = Math.round(gaps[1] - gaps[0]);
  check(`${tag} 5: after a tap the count starts again from 7 s`, Math.abs(gap - HOLD) < 350, `${gap} ms from the tap's turn to the next`);
  check(`${tag} 5: no errors`, errors.length === 0, errors.join(' | '));
  await browser.close();
}

/* -------------------------------------------- 6. tap storms, width and rotation */

async function storm({ browserType, options, base, lang, tag }) {
  const { browser, page, errors } = await open(browserType, options);
  await home(page, base, lang);
  const at = await spots(page);

  for (let i = 0; i < 6; i += 1) {
    await tap(page, at.black);
    await sleep(page, 60);
  }
  let s = await snap(page);
  check(`${tag} 6: six quick taps, one turn`, s.turns === 1, `turns ${s.turns}`);
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 6: after the storm the cards match`, !atRest(s, 1), atRest(s, 1) || 'ok');

  await tap(page, at.black);
  await sleep(page, 700);
  await tap(page, at.black);
  await sleep(page, 200);
  await tap(page, at.black);
  s = await snap(page);
  check(`${tag} 6: taps during a turn wait, no second turn`, s.turns === 2, `turns ${s.turns}`);
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 6: after taps during a turn the cards match`, !atRest(s, 0), atRest(s, 0) || 'ok');
  await tap(page, at.black);
  await sleep(page, 120);
  check(`${tag} 6: the next tap turns as usual`, (await snap(page)).turns === 3, `turns ${(await snap(page)).turns}`);
  await sleep(page, BUSY);

  // Width through 640, mid-turn, both ways. The pair stays where it was.
  const across = [
    ['resize 390 → 800 → 390', 800, 844],
    ['rotate 844×390 and back', 844, 390],
    ['resize 390 → 641 → 390', 641, 844],
  ];
  for (const [name, w, h] of across) {
    for (const pair of [0, 1]) {
      await home(page, base, lang);
      await tap(page, at.black); // pair 2 turning
      if (!pair) {
        await sleep(page, BUSY + 100);
        await tap(page, at.black); // pair 1 turning
      }
      await sleep(page, 400);
      await page.setViewportSize({ width: w, height: h });
      await sleep(page, 900);
      await page.evaluate(() => window.__prep());
      await sleep(page, 1200);
      s = await snap(page);
      const wide = s.links.filter((l) => l.seen.some((x) => x !== l.href));
      check(`${tag} 6: ${name}, past 640: the cases from the start, cards match`, fromStart(hrefs(s)) && !wide.length && s.over <= 0, `${hrefs(s).join(', ')}; over ${s.over}${wide.length ? `; wrong ${wide.map((l) => `${l.href}: ${l.seen.join('/')}`).join('; ')}` : ''}`);
      await page.setViewportSize({ width: 390, height: 844 });
      await sleep(page, 2000);
      s = await snap(page);
      check(`${tag} 6: ${name} on pair ${pair + 1}, back at 390: same pair, cards match`, !atRest(s, pair), atRest(s, pair) || 'ok');
      await tap(page, at.black);
      await sleep(page, BUSY + 100);
      s = await snap(page);
      check(`${tag} 6: ${name} on pair ${pair + 1}: tap still turns`, !atRest(s, 1 - pair), atRest(s, 1 - pair) || 'ok');
    }
  }

  // Bouncing on the breakpoint.
  await home(page, base, lang);
  await tap(page, at.black);
  for (let i = 0; i < 6; i += 1) {
    await page.setViewportSize({ width: i % 2 ? 640 : 641, height: 844 });
    await sleep(page, 220);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(page, 2200);
  s = await snap(page);
  check(`${tag} 6: bouncing on 640/641 mid-turn leaves the cards whole`, !atRest(s, 1), atRest(s, 1) || 'ok');
  await tap(page, await cardSpot(page, 0));
  await leftHome(page);
  check(`${tag} 6: and the card opens its case`, openedPath(page) === s.links[0].href, openedPath(page));
  check(`${tag} 6: no errors`, errors.length === 0, errors.join(' | '));
  await browser.close();
}

/* ----------------------------------------------------------------- 7. back */

async function back({ browserType, options, base, lang, tag }) {
  const errors = [];
  for (const pair of [0, 1]) {
    // A browser of its own each time: a goto('/') on a page just brought back with
    // "back" lands on the case instead, on the live site too (see TEST-REPORT).
    const run = await open(browserType, options);
    const { browser, page } = run;
    errors.push(...run.errors);
    await home(page, base, lang);
    if (pair) {
      await tap(page, (await spots(page)).black);
      await sleep(page, BUSY + 100);
    }
    await tap(page, await cardSpot(page, 0));
    await leftHome(page);
    await sleep(page, 800);
    await page.goBack({ waitUntil: 'load' });
    await page.waitForSelector('.hero-panel .mosaic-link');
    await sleep(page, 2600);
    // lib/returnNavigation.js takes the page back to the case's card, as live: the hero is off
    // screen, so its count stands, and a tap at the hero's place hits a work card.
    const y = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(page, 600);
    await page.evaluate(() => window.__prep());
    let s = await snap(page);
    const now = PAIRS.findIndex((p) => same(p, hrefs(s)));
    check(`${tag} 7: back from pair ${pair + 1}: home whole, cards match`, now >= 0 && !atRest(s, now), `scroll was ${y}, pair ${now + 1}${atRest(s, now) ? `, ${atRest(s, now)}` : ''}`);
    const n = await turnCount(page);
    await tap(page, (await spots(page)).black);
    await sleep(page, BUSY + 100);
    s = await snap(page);
    check(`${tag} 7: back from pair ${pair + 1}: tap turns`, !atRest(s, 1 - now), atRest(s, 1 - now) || 'ok');
    await page.waitForFunction((c) => window.__turns.length > c + 1, n, { timeout: HOLD + 1500 }).catch(() => {});
    check(`${tag} 7: back from pair ${pair + 1}: the count runs`, (await turnsSince(page, n)) === 2, `turns +${await turnsSince(page, n)}`);
    errors.push(...run.errors.filter((e) => !errors.includes(e)));
    await browser.close();
  }
  check(`${tag} 7: no errors`, errors.length === 0, errors.join(' | '));
}

/* ------------------------------------------------------- 8. reduced motion */

async function reduced({ browserType, options, base, lang, tag }) {
  const { browser, page, errors } = await open(browserType, { ...options, reducedMotion: 'reduce' });
  await home(page, base, lang);
  let s = await snap(page);
  check(`${tag} 8 reduced: first pair, cards match`, !atRest(s, 0), atRest(s, 0) || 'ok');
  await sleep(page, HOLD + 1500);
  check(`${tag} 8 reduced: no turn by itself`, (await turnCount(page)) === 0, `turns ${await turnCount(page)}`);
  const at = await spots(page);
  await tap(page, at.black);
  await sleep(page, 60);
  s = await snap(page);
  check(`${tag} 8 reduced: a tap lands at once, without a roll`, !atRest(s, 1), `+${s.dt} ms: ${atRest(s, 1) || 'whole'}`);
  await sleep(page, HOLD + 1500);
  check(`${tag} 8 reduced: no count after a tap`, (await turnCount(page)) === 1, `turns ${await turnCount(page)}`);
  await tap(page, at.black);
  await sleep(page, 60);
  s = await snap(page);
  check(`${tag} 8 reduced: and back at once`, !atRest(s, 0), atRest(s, 0) || 'whole');
  await tap(page, await cardSpot(page, 1));
  await leftHome(page);
  check(`${tag} 8 reduced: card opens the case`, openedPath(page) === '/yandex-turkey', openedPath(page));
  check(`${tag} 8 reduced: no errors`, errors.length === 0, errors.join(' | '));
  await browser.close();
}

/* ------------------------------------------------------------ 9. keyboard */

async function keyboard({ browserType, options, base, lang, tag }) {
  const { browser, page, errors } = await open(browserType, options);
  await home(page, base, lang);
  // WebKit (Safari) moves focus to links and buttons with Alt+Tab.
  const TAB = browserType === webkit ? 'Alt+Tab' : 'Tab';
  const BACK = browserType === webkit ? 'Alt+Shift+Tab' : 'Shift+Tab';
  const focus = () => page.evaluate(() => {
    const el = document.activeElement;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const panel = document.querySelector('.hero-panel').getBoundingClientRect();
    return {
      name: el.getAttribute('href') ?? el.textContent.trim().slice(0, 60),
      cls: String(el.className),
      box: [r.left, r.top, r.width, r.height].map(Math.round),
      inPanel: r.left >= panel.left && r.right <= panel.right && r.top >= panel.top && r.bottom <= panel.bottom,
      fv: el.matches(':focus-visible'),
      outline: `${cs.outlineStyle} ${cs.outlineWidth}`,
      over: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el,
    };
  });
  const live = () => page.evaluate(() => {
    const el = document.querySelector('.hero-panel [aria-live]');
    return { text: el?.textContent.trim(), mode: el?.getAttribute('aria-live') };
  });

  const order = [];
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press(TAB);
    const f = await focus();
    order.push(f.name || f.cls);
    if (/hero-panel__next/.test(f.cls)) break;
  }
  const iNext = order.length - 1;
  check(
    `${tag} 9: Tab reaches the two links, then the button`,
    order.at(-1).length > 0 && order[iNext - 2] === PAIRS[0][0] && order[iNext - 1] === PAIRS[0][1],
    order.join(' → '),
  );

  const nextOf = { 0: 'Next cases', 1: 'Следующие кейсы' };
  const word = nextOf[lang === 'ru' ? 1 : 0];
  let f = await focus();
  check(`${tag} 9: the button shows on focus, in the hero, 44 px tall, with an outline`, /hero-panel__next/.test(f.cls) && f.fv && f.box[3] >= 44 && f.box[2] > 60 && f.inPanel && f.over && !/^none/.test(f.outline), JSON.stringify(f));
  check(`${tag} 9: label names the next pair`, f.name === `${word}: ${pairText(1, lang)}`, f.name);
  await page.screenshot({ path: path.join(SHOTS, `pairs-${tag}-focus.png`) });

  await page.keyboard.press('Enter');
  await sleep(page, BUSY + 100);
  let s = await snap(page);
  f = await focus();
  let l = await live();
  const shownWord = lang === 'ru' ? 'Сейчас на экране' : 'Now showing';
  check(`${tag} 9: Enter turns the pair, cards match`, !atRest(s, 1), atRest(s, 1) || 'ok');
  check(`${tag} 9: focus stays on the button`, /hero-panel__next/.test(f.cls) && f.fv, f.cls);
  check(`${tag} 9: label now names the first pair`, f.name === `${word}: ${pairText(0, lang)}`, f.name);
  check(`${tag} 9: aria-live polite says what is on screen`, l.mode === 'polite' && l.text === `${shownWord}: ${pairText(1, lang)}`, `${l.mode} "${l.text}"`);

  await page.keyboard.press('Space');
  await sleep(page, BUSY + 100);
  s = await snap(page);
  check(`${tag} 9: Space turns back`, !atRest(s, 0), atRest(s, 0) || 'ok');

  const n = await turnCount(page);
  await sleep(page, HOLD + 1500);
  check(`${tag} 9: the count stands while the button has focus`, (await turnsSince(page, n)) === 0, `turns +${await turnsSince(page, n)}`);

  // Off the block: the count comes back; nothing stays hanging.
  await page.keyboard.press(TAB);
  f = await focus();
  const outside = !(await page.evaluate(() => document.querySelector('.hero-panel').contains(document.activeElement)));
  await page.waitForFunction((c) => window.__turns.length > c, n, { timeout: HOLD + 1500 }).catch(() => {});
  check(`${tag} 9: focus leaves the hero, the count resumes`, outside && (await turnsSince(page, n)) === 1, `focus on ${f.name || f.cls}, outside ${outside}, turns +${await turnsSince(page, n)}`);
  const auto = await live();
  check(`${tag} 9: a turn by the count is not read out`, auto.mode === 'off', `${auto.mode} "${auto.text}"`);

  // A focused link leads to the pair on screen.
  await sleep(page, BUSY + 100);
  await page.keyboard.press(BACK);
  await page.keyboard.press(BACK);
  f = await focus();
  s = await snap(page);
  const want = s.links.at(-1).href;
  check(`${tag} 9: Shift+Tab lands on the second link`, f.name === want, `${f.name}, want ${want}`);
  await page.keyboard.press('Enter');
  await leftHome(page);
  check(`${tag} 9: Enter on the link opens the case on screen`, openedPath(page) === want, openedPath(page));
  check(`${tag} 9: no errors`, errors.length === 0, errors.join(' | '));
  await browser.close();
}

/* -------------------------------------------------------------- 10. widths */

async function narrow({ browserType, optionsOf, base, lang, tag }) {
  for (const [w, h] of [[320, 568], [360, 740], [414, 896], [480, 800], [528, 800], [600, 800], [640, 800], [568, 320], [640, 360]]) {
    const { browser, page, errors } = await open(browserType, optionsOf(w, h));
    await home(page, base, lang);
    const s = await snap(page);
    const size = `${w}×${h}`;
    const geo = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const panel = document.querySelector('.hero-panel').getBoundingClientRect();
      const boxes = [...document.querySelectorAll('.hero-panel .mosaic-link')].map((a) => {
        const r = a.getBoundingClientRect();
        const c = a.querySelector('.mosaic-link__label').getBoundingClientRect();
        return { href: a.getAttribute('href'), box: [r.left, r.top, r.width, r.height].map(Math.round), chipInside: c.left >= r.left - 1 && c.right <= r.right + 1 && c.right <= vw };
      });
      const hasNext = !!document.querySelector('.hero-panel__next');
      return { vw, panelH: Math.round(panel.height), boxes, hasNext };
    });
    console.log(`INFO  ${tag} ${size}: panel ${geo.panelH}, cards ${JSON.stringify(geo.boxes.map((b) => [b.href, ...b.box]))}, next button ${geo.hasNext}`);
    check(`${tag} 10 ${size}: no sideways scroll`, s.over <= 0, `over ${s.over}`);
    check(`${tag} 10 ${size}: at least one card`, geo.boxes.length >= 1, `${geo.boxes.length} cards`);
    check(`${tag} 10 ${size}: two cards at a time`, geo.boxes.length === 2 || w < 336, `${geo.boxes.length} cards: ${hrefs(s).join(', ')}`);
    check(`${tag} 10 ${size}: chips fit their cards`, geo.boxes.every((b) => b.chipInside), '');
    check(`${tag} 10 ${size}: pictures match links`, s.links.every((l) => l.seen.every((x) => x === l.href)), s.links.map((l) => `${l.href}: ${l.seen.join('/')}`).join('; '));
    await page.screenshot({ path: path.join(SHOTS, `pairs-${tag}-${w}x${h}.png`) });
    if (geo.boxes.length) {
      const n = s.turns;
      await page.evaluate(() => document.querySelector('.hero-panel__plate').scrollIntoView({ block: 'center' }));
      await sleep(page, 200);
      const free = await page.evaluate(() => {
        const plate = document.querySelector('.hero-panel__plate').getBoundingClientRect();
        return [Math.round(plate.left + plate.width / 2), Math.round(plate.top + plate.height / 2)];
      });
      await tap(page, free);
      await sleep(page, 200);
      check(`${tag} 10 ${size}: a tap on the copy turns`, (await turnCount(page)) === n + 1, `turns +${(await turnCount(page)) - n}`);
    }
    check(`${tag} 10 ${size}: no errors`, errors.length === 0, errors.join(' | '));
    await browser.close();
  }
}

// Past 640: tap and count leave the hero alone; three cases.
async function wide({ browserType, optionsOf, base, tag }) {
  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024], [641, 900]]) {
    const { browser, page, errors } = await open(browserType, optionsOf(w, h));
    await home(page, base, 'en');
    let s = await snap(page);
    const size = `${w}×${h}`;
    check(`${tag} 10 ${size}: ${w > 700 ? 'three cases' : 'cases from the start'}, cards match`, (w > 700 ? same(hrefs(s), THREE) : fromStart(hrefs(s))) && s.links.every((l) => l.seen.every((x) => x === l.href)), s.links.map((l) => `${l.href}: ${l.seen.join('/')}`).join('; '));
    check(`${tag} 10 ${size}: no next button`, (await page.locator('.hero-panel__next').count()) === 0);
    const plate = await page.evaluate(() => {
      const r = document.querySelector('.hero-panel__plate').getBoundingClientRect();
      return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
    });
    await tap(page, plate);
    await sleep(page, HOLD + 1500);
    s = await snap(page);
    check(`${tag} 10 ${size}: tap and count do not turn`, s.turns === 0 && fromStart(hrefs(s)), `turns ${s.turns}, ${hrefs(s).join(', ')}`);
    check(`${tag} 10 ${size}: no sideways scroll, no errors`, s.over <= 0 && !errors.length, `over ${s.over} ${errors.join(' | ')}`);
    await browser.close();
  }
}

// The covers: new files, loaded, 16 px corners transparent.
async function covers({ base, lang, tag }) {
  for (const width of [1440, 390]) {
    const { browser, page, errors } = await open(chromium, { viewport: { width, height: 900 } });
    await page.goto(`${base}/${lang === 'ru' ? '?lang=ru' : ''}`, { waitUntil: 'load' });
    await sleep(page, 1500);
    const out = await page.evaluate(async () => {
      const list = [];
      for (const id of ['yandex-news', 'cat-app']) {
        const img = document.querySelector(`.work-card--${id} .work-card__visual img`);
        img.loading = 'eager';
        await img.decode().catch(() => {});
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const a = (x, y) => ctx.getImageData(x, y, 1, 1).data[3];
        list.push({ id, src: img.getAttribute('src').split('/').pop(), ok: img.complete && img.naturalWidth > 0, corners: [a(0, 0), a(c.width - 1, 0), a(0, c.height - 1), a(c.width - 1, c.height - 1)] });
      }
      return list;
    });
    const wantFc = lang === 'ru' ? /fluffy-chumb-home-cover\.ru-/ : /fluffy-chumb-home-cover-/;
    for (const cv of out) {
      const name = cv.id === 'cat-app' ? wantFc.test(cv.src) : /yandex-cover-r16-/.test(cv.src);
      check(`${tag} 10 ${width}: ${cv.id} cover is the new file, loaded, corners transparent`, name && cv.ok && cv.corners.every((x) => x === 0), `${cv.src}, corners ${cv.corners.join('/')}`);
    }
    check(`${tag} 10 ${width}: no errors`, errors.length === 0, errors.join(' | '));
    await browser.close();
  }
}

// The same build against the live site: boxes, links, chips, hover and the round.
async function regress() {
  const hero = (page) => page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return [r.left, r.top, r.width, r.height].map((v) => Math.round(v));
    };
    return {
      panel: box(document.querySelector('.hero-panel')),
      plate: box(document.querySelector('.hero-panel__plate')),
      h1: box(document.querySelector('.hero-panel h1')),
      lead: document.querySelector('.hero-panel__lead').textContent,
      links: [...document.querySelectorAll('.hero-panel .mosaic-link')].map((a) => ({ href: a.getAttribute('href'), box: box(a), text: a.textContent, small: a.classList.contains('mosaic-link--small') })),
    };
  });

  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024], [641, 900]]) {
    const size = `${w}×${h}`;
    const read = async (base, name) => {
      const { browser, page, errors } = await open(chromium, { viewport: { width: w, height: h } });
      await home(page, base, 'en', { settle: false });
      await sleep(page, 1800);
      const layout = await hero(page);
      await page.screenshot({ path: path.join(SHOTS, `regress-${name}-${w}.png`) });

      // The round: which link is open over 12 s.
      const seq = [];
      for (let i = 0; i < 48; i += 1) {
        const active = await page.evaluate(() => document.querySelector('.hero-panel .mosaic-link.is-active')?.getAttribute('href') ?? null);
        if (active && seq.at(-1) !== active) seq.push(active);
        await sleep(page, 250);
      }

      // Hover: the card comes whole, its chip shows; away, it falls apart.
      const hover = {};
      for (let place = 0; place < layout.links.length; place += 1) {
        const link = page.locator('.hero-panel .mosaic-link').nth(place);
        await link.hover();
        await sleep(page, 2000);
        const s = await snap(page);
        const l = s.links[place];
        hover[`card${place + 1}`] = { whole: l.seen.every((x) => x === l.href), chip: l.opacity, active: l.active };
        await page.mouse.move(5, 5);
        await sleep(page, 1800);
      }
      await browser.close();
      return { layout, seq, hover, errors };
    };

    const local = await read(BASE, 'local');
    check(`regress ${size}: no errors, local`, local.errors.length === 0, local.errors.join(' | '));
    check(`regress ${size}: hover makes each card whole, chip shows`, Object.values(local.hover).every((x) => x.whole && x.chip > 0.9 && x.active), JSON.stringify(local.hover));
    if (PROD) {
      const live = await read(PROD, 'prod');
      check(`regress ${size}: hero layout, links, chips as live`, same(local.layout, live.layout), same(local.layout, live.layout) ? `${local.layout.links.length} cards` : `${JSON.stringify(local.layout)} vs ${JSON.stringify(live.layout)}`);
      check(`regress ${size}: hover as live`, same(local.hover, live.hover), same(local.hover, live.hover) ? '' : `${JSON.stringify(local.hover)} vs ${JSON.stringify(live.hover)}`);
      check(`regress ${size}: the round goes through the same cards as live`, same([...new Set(local.seq)].sort(), [...new Set(live.seq)].sort()), `local ${local.seq.join(' ')} | live ${live.seq.join(' ')}`);
    }
  }
}

const runs = [
  { key: 'chromium-en', browserType: chromium, options: phoneOf(390), optionsOf: phoneOf, base: BASE, lang: 'en', swipe: true },
  { key: 'webkit-en', browserType: webkit, options: iPhoneOf(), optionsOf: iPhoneOf, base: BASE, lang: 'en', swipe: false },
];
if (RU_BASE) {
  runs.push(
    { key: 'chromium-ru', browserType: chromium, options: phoneOf(390), optionsOf: phoneOf, base: RU_BASE, lang: 'ru', swipe: true },
    { key: 'webkit-ru', browserType: webkit, options: iPhoneOf(), optionsOf: iPhoneOf, base: RU_BASE, lang: 'ru', swipe: false },
  );
}

for (const run of runs) {
  if (ONLY && !ONLY.includes(run.key)) continue;
  const args = { ...run, tag: run.key };
  await startAndRound(args);
  await tapsOpen(args);
  await whereTaps(args);
  await banner(args);
  await count(args);
  await storm(args);
  await back(args);
  await reduced(args);
  await keyboard(args);
  await narrow(args);
  if (run.lang === 'en') await wide(args);
  if (run.browserType === chromium) await covers(args);
}
if (!ONLY || ONLY.includes('regress')) await regress();

console.log(`\n${total - failed.length}/${total} passed. Screenshots: ${SHOTS}`);
if (failed.length) {
  console.log('\nFailed:');
  failed.forEach((f) => console.log(`- ${f}`));
  process.exitCode = 1;
}
