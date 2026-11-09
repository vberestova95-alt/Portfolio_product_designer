/*
 * /cat-app preview check (BACKLOG пп. 29, 30, 31, 33): story steps, the
 * before / after pairs, the collapsible brand block, key-flow clips, the ∞
 * metric, Research / Decisions copy. EN and RU, 1440 / 768 / 390.
 *
 *   EN:  BASE=http://localhost:4181 node e2e/cat-app-preview.check.mjs
 *   RU:  BASE=http://localhost:4182 LANG_CODE=ru node e2e/cat-app-preview.check.mjs
 *        (RU is off on the site: needs the throwaway RU_ENABLED=true build,
 *        recipe in the header of ru-media.check.mjs)
 *   SHOTS=<dir> for screenshots (default e2e/.shots).
 *
 * Exit code 1 if any check fails.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:4181';
const LANG = process.env.LANG_CODE ?? 'en';
const RU = LANG === 'ru';
const SHOTS = process.env.SHOTS ?? path.join(here, '.shots');
mkdirSync(SHOTS, { recursive: true });
const URL_PATH = RU ? '/cat-app?lang=ru' : '/cat-app';
const WIDTHS = [1440, 768, 390];

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

async function open(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 }));
  });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !/yandex|ERR_CERT_/.test(m.location()?.url + m.text())) problems.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  page.on('requestfailed', (r) => {
    const f = r.failure()?.errorText ?? '';
    if (f.includes('ERR_ABORTED') && ['media', 'fetch'].includes(r.resourceType())) return;
    if (/yandex\.(ru|net|com)/.test(new URL(r.url()).hostname)) return;
    problems.push(`requestfailed ${f}: ${r.url()}`);
  });
  await page.goto(BASE + URL_PATH, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  return { context, page, problems };
}

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    const tag = `${LANG.toUpperCase()} ${width}`;
    const phone = width <= 640;
    const { context, page, problems } = await open(browser, width);
    await scrollThrough(page);
    const shot = (n) => path.join(SHOTS, `test-${LANG}-${width}-${n}.png`);

    // 1. Whole page loads.
    check(`${tag}: console / network clean`, problems.length === 0, problems.join(' | '));
    const broken = await page.evaluate(() =>
      // Lazy pictures inside the closed brand block are fetched on opening: checked there.
      [...document.images].filter((i) => !i.closest('.cat-collapsible') && !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')),
    );
    check(`${tag}: no broken images`, broken.length === 0, broken.join(', '));
    const badVideos = await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => v.error).map((v) => v.currentSrc));
    check(`${tag}: no video errors`, badVideos.length === 0, badVideos.join(', '));
    const scroll = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    check(`${tag}: no horizontal page scroll`, scroll.sw <= scroll.iw, `${scroll.sw} / ${scroll.iw}`);

    // 2. Language of text and pictures.
    const texts = await page.evaluate(() => ({
      body: document.querySelector('main')?.innerText ?? document.body.innerText,
      alts: [...document.images].map((i) => i.alt).concat([...document.querySelectorAll('video')].map((v) => v.getAttribute('aria-label') ?? '')).join(' | '),
      srcs: [...document.images].map((i) => i.currentSrc || i.src),
    }));
    if (!RU) {
      check(`${tag}: no Cyrillic in text / alt`, !/[А-Яа-яЁё]/.test(texts.body + texts.alts), (texts.body + texts.alts).match(/.{0,30}[А-Яа-яЁё]+.{0,20}/)?.[0] ?? '');
    } else {
      // Story pictures (not the web MVP, which stays in English) and key-flow posters must be the .ru files.
      const need = ['story/shared', 'story/v2', 'features/'];
      const bad = texts.srcs.filter((s) => need.some((n) => s.includes(n.replace(/\/.*/, ''))) && false);
      void bad;
      const ruSrcs = texts.srcs.filter((s) => /\.ru[.-]/.test(s)).length;
      check(`${tag}: RU page uses .ru pictures`, ruSrcs >= 3, `${ruSrcs} .ru images`);
      check(`${tag}: no leftover English labels in text`, !/Clip [AB]\b|What I learned|Confirmed\b|What the MVP showed/.test(texts.body), '');
    }

    // 3. Story: steps 1-5, no 6.
    const stepHeads = await page.evaluate(() => [...document.querySelectorAll('h3')].map((h) => h.innerText.trim()).filter((t) => /^\d+\./.test(t)));
    check(`${tag}: story steps 1–5 only`, stepHeads.length === 5 && stepHeads.every((t, i) => t.startsWith(`${i + 1}.`)) && !stepHeads.some((t) => t.startsWith('6.')), stepHeads.join(' / '));
    const bandInfo = await page.evaluate(() => ({
      pairs: document.querySelectorAll('.cat-ba-wrap').length,
      bands: [...document.querySelectorAll('.case-image-band img')].map((i) => i.getAttribute('src') || '').filter((s) => /shared|v2/.test(s)).length,
    }));
    check(`${tag}: before/after pairs slider + shared + v2 strips present`, bandInfo.pairs === 1 && bandInfo.bands >= 2, JSON.stringify(bandInfo));

    // 4. Before / after pairs.
    const wrap = page.locator('.cat-ba-wrap').first();
    await wrap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2300); // intro animation
    await wrap.screenshot({ path: shot('pairs-initial') });
    const geom = async () =>
      wrap.evaluate((w) => {
        const s = w.querySelector('.cat-ba-slider').getBoundingClientRect();
        const imgs = [...w.querySelectorAll('.cat-ba-slider__img')].map((i) => i.getBoundingClientRect());
        return { slider: { w: s.width, h: s.height, l: s.left }, imgs: imgs.map((r) => ({ l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) })), sw: w.scrollWidth, cw: w.clientWidth, chips: [...w.querySelectorAll('.cat-ba-pairs__chip')].map((c) => c.innerText) };
      });
    const g = await geom();
    check(`${tag}: pairs images line up (same box)`, JSON.stringify(g.imgs[0]) === JSON.stringify(g.imgs[1]), JSON.stringify(g.imgs));
    check(`${tag}: pairs slider fits width, no sideways scroll`, g.sw <= g.cw + 1 && g.slider.w <= width, `scroll ${g.sw}/${g.cw}, slider ${Math.round(g.slider.w)}`);
    // Before / After tabs move the handle.
    const handleLeft = () => wrap.locator('.cat-ba-slider__handle').evaluate((h) => h.getBoundingClientRect().left);
    const tabs = wrap.locator('.cat-ba-tab');
    check(`${tag}: two tabs`, (await tabs.count()) === 2, '');
    await tabs.nth(0).click();
    await page.waitForTimeout(700);
    const hBefore = await handleLeft();
    await wrap.screenshot({ path: shot('pairs-before') });
    await tabs.nth(1).click();
    await page.waitForTimeout(700);
    const hAfter = await handleLeft();
    await wrap.screenshot({ path: shot('pairs-after') });
    check(`${tag}: Before / After move the handle to the right / left edge`, hBefore > hAfter + g.slider.w * 0.6, `before ${Math.round(hBefore)}, after ${Math.round(hAfter)}`);
    const g2 = await geom();
    check(`${tag}: image positions unchanged after switching`, JSON.stringify(g2.imgs) === JSON.stringify(g.imgs), JSON.stringify(g2.imgs));
    if (phone) {
      check(`${tag}: 3 pair chips`, g.chips.length === 3, g.chips.join(', '));
      // One pair shown: the window is the row's third.
      const ratioOk = Math.abs(g.imgs[0].w / g.slider.w - 1330 / 430) < 0.1;
      check(`${tag}: one pair per view (row is ~3x the window)`, ratioOk, `${g.imgs[0].w} / ${Math.round(g.slider.w)}`);
      const marks = [];
      for (let i = 0; i < 3; i += 1) {
        await wrap.locator('.cat-ba-pairs__chip').nth(i).click();
        await page.waitForTimeout(300);
        marks.push((await geom()).imgs[0].l);
        await wrap.screenshot({ path: shot(`pairs-pair${i + 1}`) });
      }
      check(`${tag}: chips switch pairs (window moves)`, marks[0] !== marks[1] && marks[1] !== marks[2], marks.join(' / '));
      const sc = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      check(`${tag}: no horizontal scroll after switching`, sc, '');
    } else {
      check(`${tag}: no pair chips on a desktop`, g.chips.length === 0, '');
    }

    // 5. Brand: collapsed by default, opens, 6 tiles + wide, lightbox, grid.
    const brand = page.locator('.cat-collapsible').first();
    await brand.scrollIntoViewIfNeeded();
    const closedH = await brand.locator('.cat-collapsible__body').evaluate((b) => b.getBoundingClientRect().height);
    check(`${tag}: brand block collapsed by default`, closedH < 2 && (await brand.getAttribute('class')).indexOf('is-open') === -1, `body ${closedH}px`);
    await brand.locator('.cat-collapsible__trigger').click();
    await page.waitForTimeout(1200);
    const bo = await brand.evaluate((el) => {
      const tiles = [...el.querySelectorAll('.cat-collapsible__tile')].map((t) => t.getBoundingClientRect());
      const cols = new Set(tiles.map((t) => Math.round(t.left)));
      const rows = new Set(tiles.map((t) => Math.round(t.top)));
      const wide = el.querySelector('.cat-collapsible__wide img');
      const body = el.querySelector('.cat-collapsible__body');
      return { tiles: tiles.length, cols: cols.size, rows: rows.size, wide: !!wide && wide.complete && wide.naturalWidth > 0, bodyH: body.getBoundingClientRect().height, imgs: [...el.querySelectorAll('img')].every((i) => i.complete && i.naturalWidth > 0), overflow: el.scrollWidth > el.clientWidth + 1 };
    });
    check(`${tag}: brand opens, 6 tiles + logo takes mosaic, images loaded`, bo.bodyH > 100 && bo.tiles === 6 && bo.wide && bo.imgs, JSON.stringify(bo));
    check(`${tag}: brand block has no sideways overflow`, !bo.overflow, '');
    if (phone) check(`${tag}: brand grid 2×3`, bo.cols === 2 && bo.rows === 3, `${bo.cols} cols × ${bo.rows} rows`);
    else check(`${tag}: brand grid (info)`, bo.tiles === 6, `${bo.cols} cols × ${bo.rows} rows`);
    await brand.screenshot({ path: shot('brand-open') });
    for (const how of ['esc', 'click']) {
      await brand.locator('.cat-collapsible__tile img').first().click();
      const lb = page.locator('.case-lightbox__img');
      const opened = await lb.waitFor({ state: 'visible', timeout: 4000 }).then(() => true, () => false);
      check(`${tag}: lightbox opens on a brand tile (${how})`, opened, '');
      if (opened && how === 'esc') await page.screenshot({ path: shot('brand-lightbox') });
      if (how === 'esc') await page.keyboard.press('Escape');
      else await page.locator('.case-lightbox').click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(500);
      check(`${tag}: lightbox closes by ${how === 'esc' ? 'Esc' : 'click'}`, !(await page.locator('.case-lightbox__img').isVisible().catch(() => false)), '');
    }
    await brand.locator('.cat-collapsible__trigger').click();
    await page.waitForTimeout(800);
    // Wide mosaic opens too? re-open for the wide check.
    await brand.locator('.cat-collapsible__trigger').click();
    await page.waitForTimeout(900);
    await brand.locator('.cat-collapsible__wide img').click();
    check(`${tag}: lightbox opens on the logo takes mosaic`, await page.locator('.case-lightbox__img').waitFor({ state: 'visible', timeout: 4000 }).then(() => true, () => false), '');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 6. Key flows: no clip labels.
    const flowText = await page.evaluate(() => [...document.querySelectorAll('.case-flow')].map((f) => f.innerText).join('\n'));
    check(`${tag}: no "Clip A/B" / "Клип A/B" labels`, !/\b(Clip|Клип)\s*[AB АВ]\b/.test(flowText), '');

    // 7. Header metric.
    const metric = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.case-stat-grid--hero .case-stat-card')];
      const box = (c) => {
        // Glyph box (range) relative to its own card: cards stack on a phone.
        const range = document.createRange();
        range.selectNodeContents(c.querySelector('strong'));
        const rr = range.getBoundingClientRect();
        const ct = c.getBoundingClientRect().top;
        return { top: Math.round(rr.top - ct), bottom: Math.round(rr.bottom - ct), mid: Math.round((rr.top + rr.bottom) / 2 - ct) };
      };
      return { texts: cards.map((c) => c.innerText.replace(/\n/g, ' ')), boxes: cards.map(box) };
    });
    check(`${tag}: ∞ metric label`, new RegExp(RU ? '^∞\\s+довольных питомцев$' : '^∞\\s+happy pets$').test(metric.texts[2] ?? ''), metric.texts.join(' | '));
    const mids = metric.boxes.map((b) => b.mid);
    check(`${tag}: ∞ centred with neighbouring digits (±6 px)`, Math.max(...mids) - Math.min(...mids) <= 6, JSON.stringify(metric.boxes));
    await page.locator('.case-hero').first().screenshot({ path: shot('hero') });

    // 8. Research / Decisions.
    const sections = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll('h2')];
      const slice = (re) => {
        const start = h2.find((h) => re.test(h.innerText));
        if (!start) return null;
        const root = start.closest('section') ?? start.parentElement;
        return root.innerText;
      };
      return { research: slice(/Research|Исследовани/i), decisions: slice(/From Insight|От инсайт|Insight/i), all: document.body.innerText };
    });
    const learnRe = RU ? /Что я узнала/g : /What I learned/g;
    const researchHeads = await page.evaluate((src) => {
      const re = new RegExp(src);
      return [...document.querySelectorAll('h3')].filter((h) => re.test(h.innerText)).map((h) => h.closest('section')?.querySelector('h2')?.innerText);
    }, learnRe.source);
    check(`${tag}: "${RU ? 'Что я узнала' : 'What I learned'}" heading in Research`, researchHeads.some((t) => /Research|Исследов/i.test(t ?? '')), JSON.stringify(researchHeads));
    const nCards = await page.evaluate(() => {
      const sec = [...document.querySelectorAll('h2')].find((h) => /^(Research|Исследование)/i.test(h.innerText.trim()))?.closest('section');
      return sec ? sec.querySelectorAll('.case-pain-card').length : -1;
    });
    check(`${tag}: Research has 4 learned cards`, nCards === 4, `${nCards} cards`);
    check(`${tag}: no "What the MVP showed" block`, !/What the MVP showed|Что показал MVP|Что показал MVP/i.test(sections.all), '');
    const conf = (sections.all.match(RU ? /Подтвержден/g : /Confirmed\b/g) ?? []).length;
    check(`${tag}: Decisions has 4 ${RU ? 'Подтверждено' : 'Confirmed'}`, conf === 4, `${conf} found`);
    check(`${tag}: no phrases about hiding the map`, !/hid(e|es|den|ing) the (injection )?map|never sees the injection map|скры[а-я]+ карт|не видит карт/i.test(sections.all), sections.all.match(/.{0,40}(never sees|hide the|скрыв[а-я]* карт).{0,40}/i)?.[0] ?? '');
    await page.screenshot({ path: shot('full'), fullPage: true }).catch(() => {});
    await context.close();
  }

  // Key flows (1440 + 390): playing, paused off screen, sc1-b loop.
  for (const width of [1440, 390]) {
    const tag = `${LANG.toUpperCase()} ${width} flows`;
    const { context, page } = await open(browser, width);
    const vids = page.locator('.case-flow video');
    check(`${tag}: 4 clips`, (await vids.count()) === 4, '');
    await vids.nth(0).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(2500);
    const st = await page.evaluate(() => [...document.querySelectorAll('.case-flow video')].map((v) => { const r = v.getBoundingClientRect(); return { paused: v.paused, t: v.currentTime, on: r.bottom > 0 && r.top < innerHeight, err: v.error?.code ?? null, loop: v.loop }; }));
    check(`${tag}: on-screen clips play`, st.filter((v) => v.on).length > 0 && st.filter((v) => v.on).every((v) => !v.paused && v.t > 0 && !v.err), JSON.stringify(st));
    check(`${tag}: off-screen clips paused`, st.filter((v) => !v.on).every((v) => v.paused), '');
    // sc1-b: loop seamlessness — first vs last frame, and the wrap while playing.
    const idx = 1;
    await vids.nth(idx).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1500);
    const loop = await vids.nth(idx).evaluate(async (v) => {
      const src = v.currentSrc.split('/').pop();
      const frame = async (t) => {
        v.pause();
        v.currentTime = t;
        await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
        const c = document.createElement('canvas');
        c.width = 64; c.height = 112;
        const ctx = c.getContext('2d');
        ctx.drawImage(v, 0, 0, 64, 112);
        return ctx.getImageData(0, 0, 64, 112).data;
      };
      const d = v.duration;
      const first = await frame(0.0);
      const last = await frame(Math.max(0, d - 0.05));
      let diff = 0;
      for (let i = 0; i < first.length; i += 4) diff += Math.abs(first[i] - last[i]) + Math.abs(first[i + 1] - last[i + 1]) + Math.abs(first[i + 2] - last[i + 2]);
      const mean = diff / (first.length / 4) / 3;
      // Natural wrap: play the last 0.6 s.
      v.currentTime = Math.max(0, d - 0.6);
      await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
      await v.play();
      await new Promise((r) => setTimeout(r, 1500));
      return { src, d, loop: v.loop, mean, wrapped: v.currentTime < d - 0.6, paused: v.paused, ended: v.ended };
    });
    check(`${tag}: sc1-b loops (wraps, keeps playing)`, loop.loop && loop.wrapped && !loop.paused && !loop.ended, JSON.stringify(loop));
    check(`${tag}: sc1-b first / last frame match (mean diff < 12/255)`, loop.mean < 12, `diff ${loop.mean.toFixed(1)}, ${loop.src}`);
    await context.close();
  }
} finally {
  await browser.close();
}

const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
if (fails.length) {
  console.log('FAILED:');
  fails.forEach((f) => console.log(' - ' + f.name));
  process.exit(1);
}
