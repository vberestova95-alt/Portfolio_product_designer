/*
 * Safari-risk pass in Playwright WebKit (release 2026-11-10).
 *
 *   npx playwright install webkit   # once
 *   BASE=http://localhost:4185 SHOTS=<dir> node e2e/webkit-safari.check.mjs
 *
 * 1. Every page, 1440 and 390: no console errors / page errors, no broken images,
 *    no horizontal scroll.
 * 2. Alpha clips (.mov HEVC-alpha for Safari, .webm elsewhere) on the BetBoom PASS and
 *    Gamification hub heroes, the PASS showcase and the home cards: the video really plays
 *    (readyState, videoWidth, currentTime moves), is not an empty rectangle, and
 *    transparency is not black (share of opaque near-black pixels in a canvas read-back).
 * 3. Back from a case opened via "Other projects" on /betboom-pass lands on the same spot.
 *
 * Exit code 1 if something fails.
 */
import { webkit } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:4173';
const SHOTS = process.env.SHOTS ?? path.join(here, '.shots');
mkdirSync(SHOTS, { recursive: true });

const PAGES = ['/', '/betboom-pass', '/betboom-gamification-hub', '/cat-app', '/ai-portfolio', '/ai-projects', '/spotless', '/genetics-audit'];
const WIDTHS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const failed = [];
let total = 0;
function check(name, ok, detail = '') {
  total += 1;
  if (!ok) failed.push(`${name}: ${detail}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}
const slug = (p) => (p === '/' ? 'home' : p.slice(1));
const NOISE = /yandex\.(net|ru)|mc\.yandex|metrika|ERR_CERT|net::ERR_(BLOCKED|FAILED|ABORTED)|Load failed|due to access control checks/i;

const browser = await webkit.launch();
try {
  // 1. Plain pass.
  for (const vp of WIDTHS) {
    for (const route of PAGES) {
      const tag = `WebKit ${route} ${vp.width}`;
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
      await ctx.addInitScript(() => localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 })));
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && !NOISE.test(m.text()) && errs.push(`console: ${m.text()}`));
      await page.route(/mc\.yandex/, (r) => r.abort());
      await page.goto(BASE + route, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      // Walk down the page so lazy images load.
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += vp.height * 0.8) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(600);
      const st = await page.evaluate(() => ({
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.split('/').pop()),
        over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      check(`${tag}: no console/page errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
      check(`${tag}: no broken images`, st.broken.length === 0, st.broken.join(', '));
      check(`${tag}: no horizontal scroll`, st.over <= 0, `over ${st.over}`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(SHOTS, `webkit-${slug(route)}-${vp.width}.png`), fullPage: true }).catch(() => {});
      await ctx.close();
    }
  }

  // 2. Alpha clips.
  async function videoReport(page) {
    return page.evaluate(async () => {
      const out = [];
      for (const v of document.querySelectorAll('video')) {
        // Showcase clips of other steps sit stacked and idle until selected.
        const idle = !!v.closest('.case-showcase__frame') && !v.closest('.case-showcase__frame.is-active');
        if (idle) continue;
        const r = v.getBoundingClientRect();
        v.scrollIntoView({ block: 'center' });
        await new Promise((res) => setTimeout(res, 700));
        const t0 = v.currentTime;
        await new Promise((res) => setTimeout(res, 900));
        let dark = null;
        let alphaMean = null;
        try {
          const c = document.createElement('canvas');
          const w = (c.width = 64);
          const hh = (c.height = 64);
          const g = c.getContext('2d', { willReadFrequently: true });
          g.drawImage(v, 0, 0, w, hh);
          const d = g.getImageData(0, 0, w, hh).data;
          let n = 0;
          let a = 0;
          let k = 0;
          for (let i = 0; i < d.length; i += 4) {
            n += 1;
            a += d[i + 3];
            if (d[i + 3] > 240 && d[i] < 12 && d[i + 1] < 12 && d[i + 2] < 12) k += 1;
          }
          dark = k / n;
          alphaMean = a / n / 255;
        } catch (e) {
          dark = 'err:' + e.message;
        }
        out.push({
          src: (v.currentSrc || '').split('/').pop(),
          poster: (v.poster || '').split('/').pop(),
          rs: v.readyState,
          vw: v.videoWidth,
          vh: v.videoHeight,
          paused: v.paused,
          moved: v.currentTime > t0,
          w: Math.round(r.width),
          h: Math.round(r.height),
          dark,
          alphaMean,
          err: v.error ? v.error.code : null,
        });
      }
      return out;
    });
  }
  // The hub has no video (stills only), so it is covered by the plain pass above.
  for (const route of ['/betboom-pass', '/']) {
    for (const vp of WIDTHS) {
      const tag = `WebKit video ${route} ${vp.width}`;
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
      await ctx.addInitScript(() => localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 })));
      const page = await ctx.newPage();
      await page.goto(BASE + route, { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      const vids = await videoReport(page);
      console.log(`   ${tag}: ${JSON.stringify(vids)}`);
      check(`${tag}: ${vids.length} videos found`, vids.length > 0, '');
      for (const v of vids) {
        const name = `${tag}: ${v.src || '(no src)'}`;
        check(`${name} loaded, no error`, v.rs >= 2 && v.vw > 0 && v.err === null, `readyState ${v.rs}, ${v.vw}×${v.vh}, err ${v.err}`);
        check(`${name} visible size`, v.w > 40 && v.h > 40, `${v.w}×${v.h}`);
      }
      await page.screenshot({ path: path.join(SHOTS, `webkit-video-${slug(route)}-${vp.width}.png`) }).catch(() => {});
      await ctx.close();
    }
  }

  // 2b. PASS showcase: every step's clip (.mov in Safari) plays and keeps its transparency.
  for (const vp of WIDTHS) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 })));
    const page = await ctx.newPage();
    await page.goto(BASE + '/betboom-pass', { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    // On phones only the active step is listed; the dots switch steps.
    const dots = page.locator('.case-showcase__dots button');
    const steps = vp.width > 760 ? page.locator('.case-showcase__steps button') : dots;
    const n = await steps.count();
    check(`WebKit showcase ${vp.width}: steps found`, n === 5, `${n} steps`);
    for (let i = 0; i < n; i++) {
      await steps.nth(i).scrollIntoViewIfNeeded();
      await steps.nth(i).click();
      await page.waitForTimeout(1800);
      const r = await page.evaluate(() => {
        const v = document.querySelector('.case-showcase__frame.is-active');
        if (!v) return null;
        if (v.tagName !== 'VIDEO') return { tag: v.tagName, ok: v.complete && v.naturalWidth > 0 };
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(v, 0, 0, 64, 64);
        const d = g.getImageData(0, 0, 64, 64).data;
        let a = 0;
        let k = 0;
        for (let j = 0; j < d.length; j += 4) {
          a += d[j + 3];
          if (d[j + 3] > 240 && d[j] < 12 && d[j + 1] < 12 && d[j + 2] < 12) k += 1;
        }
        return { tag: 'VIDEO', src: v.currentSrc.split('/').pop(), rs: v.readyState, paused: v.paused, t: v.currentTime, alpha: a / 4096 / 255, black: k / 4096 };
      });
      const tag = `WebKit showcase ${vp.width} step ${i + 1}`;
      if (!r) check(`${tag}: active frame`, false, 'none');
      else if (r.tag !== 'VIDEO') check(`${tag}: still image decoded`, r.ok, r.tag);
      else {
        check(`${tag}: ${r.src} plays`, r.rs >= 2 && r.t > 0, `readyState ${r.rs}, t ${r.t.toFixed(2)}, paused ${r.paused}`);
        check(`${tag}: transparency kept (not black)`, r.alpha < 0.98 && r.black < 0.35, `mean alpha ${r.alpha.toFixed(2)}, opaque black ${(r.black * 100).toFixed(1)}%`);
      }
      await page.locator('.case-showcase').screenshot({ path: path.join(SHOTS, `webkit-showcase-${vp.width}-step${i + 1}.png`) }).catch(() => {});
    }
    await ctx.close();
  }

  // 3. Back from a case opened via "Other projects".
  for (const vp of WIDTHS) {
    const tag = `WebKit back ${vp.width}`;
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 })));
    const page = await ctx.newPage();
    await page.goto(BASE + '/betboom-pass', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const card = page.locator('.case-next__card').nth(1);
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const href = await card.getAttribute('href');
    const y0 = await page.evaluate(() => window.scrollY);
    await Promise.all([page.waitForURL((u) => new URL(u).pathname === href), card.click()]);
    await page.waitForTimeout(900);
    const y1 = await page.evaluate(() => window.scrollY);
    check(`${tag}: opened case starts at the top`, y1 < 80, `scrollY ${y1}`);
    await page.goBack({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const back = await page.evaluate(() => ({ p: location.pathname, y: window.scrollY }));
    check(`${tag}: Back returns to /betboom-pass at the block`, back.p === '/betboom-pass' && Math.abs(back.y - y0) <= 80, `path ${back.p}, scrollY ${back.y} vs ${y0}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log(`\n${total - failed.length}/${total} passed. Screenshots: ${SHOTS}`);
if (failed.length) {
  console.log('\nFailed:');
  failed.forEach((f) => console.log(`- ${f}`));
  process.exitCode = 1;
}
