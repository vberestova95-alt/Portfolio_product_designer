/*
 * "Other projects" block at the end of each case (п. 21): 4 tiles with a dot,
 * a title, "Open case" and a round arrow button.
 *
 *   node e2e/other-projects.check.mjs
 *
 * Env:
 *   BASE=http://localhost:4173       EN build (npm run build && vite preview)
 *   RU_BASE=http://localhost:4174    optional: a throwaway build with RU_ENABLED=true
 *                                    (recipe in e2e/ru-media.check.mjs); RU runs only if set
 *   BASELINE=http://localhost:4175   optional: a build of the previous commit; the home
 *                                    page card styles are compared against it
 *   SHOTS=<dir>                      screenshots (default e2e/.shots)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:4173';
const RU_BASE = process.env.RU_BASE;
const BASELINE = process.env.BASELINE;
const SHOTS = process.env.SHOTS ?? path.join(here, '.shots');
mkdirSync(SHOTS, { recursive: true });

const ORDER = ['/betboom-pass', '/yandex-turkey', '/cat-app', '/kokoc-group', '/iquoto'];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
];

let total = 0;
const failed = [];
function check(name, ok, detail = '') {
  total += 1;
  if (!ok) failed.push(`${name}: ${detail}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

const close = (a, b, eps = 1.5) => Math.abs(a - b) <= eps;

async function blockState(page) {
  return page.evaluate(() => {
    const section = document.querySelector('.case-next');
    if (!section) return null;
    const tiles = [...section.querySelectorAll('.case-next__card')].map((a) => {
      const r = a.getBoundingClientRect();
      const part = (sel) => {
        const el = a.querySelector(sel);
        if (!el) return null;
        const er = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          w: er.width,
          h: er.height,
          text: el.textContent.trim(),
          bg: cs.backgroundColor,
          clipped: el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible',
          inside: er.left >= r.left - 1 && er.right <= r.right + 1 && er.top >= r.top - 1 && er.bottom <= r.bottom + 1,
        };
      };
      return {
        href: a.getAttribute('href'),
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        right: r.right,
        dot: part('.case-next__dot'),
        title: part('.case-next__title'),
        cta: part('.case-next__cta'),
        arrow: part('.case-next__arrow'),
      };
    });
    return {
      imgs: section.querySelectorAll('img, video, .case-next__media').length,
      heading: section.querySelector('h2')?.textContent.trim(),
      label: section.querySelector('.section-label')?.textContent.trim(),
      tiles,
      vw: document.documentElement.clientWidth,
      pageOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function checkCase(browser, base, lang, viewport, route) {
  const tag = `${lang.toUpperCase()} ${route} ${viewport.width}`;
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const url = `${base}${route}${lang === 'ru' ? '?lang=ru' : ''}`;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  const section = page.locator('.case-next');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900); // reveal animation
  const st = await blockState(page);
  if (!st) {
    check(`${tag}: block present`, false, 'no .case-next');
    await context.close();
    return;
  }
  const expected = ORDER.filter((h) => h !== route);
  check(`${tag}: 4 tiles in case order`, JSON.stringify(st.tiles.map((t) => t.href)) === JSON.stringify(expected), st.tiles.map((t) => t.href).join(', '));
  check(`${tag}: no preview images left in the block`, st.imgs === 0, `${st.imgs} img/video/media`);
  const partsOk = st.tiles.every((t) => t.dot && t.title && t.cta && t.arrow && t.dot.w > 0 && t.title.text && t.cta.text && t.arrow.w > 0);
  check(`${tag}: every tile has dot, title, CTA, arrow`, partsOk, st.tiles.map((t) => `${t.title?.text}|${t.cta?.text}`).join(', '));
  const dotsColoured = st.tiles.every((t) => t.dot && t.dot.bg !== 'rgba(0, 0, 0, 0)');
  const dotColours = new Set(st.tiles.map((t) => t.dot?.bg));
  check(`${tag}: dots are coloured, one colour per project`, dotsColoured && dotColours.size === st.tiles.length, [...dotColours].join(' / '));
  const ctaWord = lang === 'ru' ? /[А-Яа-яЁё]/ : /^Open case/;
  check(`${tag}: CTA text is ${lang.toUpperCase()}`, st.tiles.every((t) => ctaWord.test(t.cta?.text ?? '')), st.tiles[0]?.cta?.text);
  if (lang === 'ru') {
    check(`${tag}: heading is Russian`, /[А-Яа-яЁё]/.test(st.heading ?? ''), st.heading);
  }

  // Even tiles: equal width and height, rows aligned, nothing spills out.
  const w0 = st.tiles[0].w;
  const h0 = st.tiles[0].h;
  check(`${tag}: tiles equal size`, st.tiles.every((t) => close(t.w, w0) && close(t.h, h0)), st.tiles.map((t) => `${t.w.toFixed(0)}×${t.h.toFixed(0)}`).join(', '));
  const rows = [...new Set(st.tiles.map((t) => Math.round(t.y)))];
  const cols = [...new Set(st.tiles.map((t) => Math.round(t.x)))];
  check(`${tag}: grid ${cols.length}×${rows.length}, aligned`, rows.length * cols.length === st.tiles.length, `cols ${cols.join('/')}, rows ${rows.join('/')}`);
  check(
    `${tag}: parts inside tiles, no clipped titles`,
    st.tiles.every((t) => ['dot', 'title', 'cta', 'arrow'].every((k) => t[k].inside) && !t.title.clipped),
    st.tiles.filter((t) => !['dot', 'title', 'cta', 'arrow'].every((k) => t[k].inside) || t.title.clipped).map((t) => t.href).join(', '),
  );
  check(`${tag}: tiles within the viewport, no page h-scroll`, st.tiles.every((t) => t.right <= st.vw + 1) && st.pageOver <= 0, `page over ${st.pageOver}`);
  await section.screenshot({ path: path.join(SHOTS, `other-${lang}-${route.slice(1)}-${viewport.width}.png`) });

  // Keyboard focus: start from the heading, Tab onto the first tile.
  const first = page.locator('.case-next__card').first();
  const before = await first.evaluate((el) => {
    const cs = getComputedStyle(el);
    return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} | ${cs.boxShadow}`;
  });
  await page.locator('.case-next h2').click();
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return {
      isFirst: el === document.querySelector('.case-next__card'),
      fv: el.matches(':focus-visible'),
      style: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} | ${cs.boxShadow}`,
    };
  });
  check(
    `${tag}: keyboard focus visible on first tile`,
    focus.isFirst && focus.fv && focus.style !== before,
    `focused first ${focus.isFirst}, :focus-visible ${focus.fv}, style "${focus.style}"`,
  );
  await page.screenshot({ path: path.join(SHOTS, `other-${lang}-${route.slice(1)}-${viewport.width}-focus.png`), clip: await section.boundingBox().then((b) => ({ x: 0, y: Math.max(0, b.y), width: viewport.width, height: Math.min(b.height, viewport.height - Math.max(0, b.y)) })) }).catch(() => {});

  // Click → right case; Back → same scroll position on this case.
  if (viewport.width !== 1024) {
    await page.locator('.case-next h2').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const target = page.locator('.case-next__card').nth(1);
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const href = await target.getAttribute('href');
    const yBefore = await page.evaluate(() => window.scrollY);
    await Promise.all([page.waitForURL((u) => new URL(u).pathname === href, { timeout: 10000 }), target.click()]);
    const landed = new URL(page.url()).pathname;
    await page.waitForTimeout(800);
    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    check(`${tag}: tile opens ${href}`, landed === href && !!h1, `landed ${landed}, h1 "${h1?.trim()}"`);
    await page.goBack({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const back = await page.evaluate(() => ({ path: location.pathname, y: window.scrollY }));
    check(`${tag}: Back returns to the block`, back.path === route && Math.abs(back.y - yBefore) <= 80, `path ${back.path}, scrollY ${back.y} vs ${yBefore}`);
  }
  check(`${tag}: no page errors`, errors.length === 0, errors.join(' | '));
  await context.close();
}

// Home cards: compare computed styles with the baseline build.
const CARD_PROPS = ['display', 'position', 'width', 'height', 'padding', 'margin', 'background-color', 'background-image', 'color', 'font-size', 'font-weight', 'line-height', 'border-radius', 'transform', 'opacity', 'object-fit', 'gap', 'grid-template-columns'];
async function homeCardStyles(browser, base, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const dump = await page.evaluate((props) => {
    const out = [];
    document.querySelectorAll('.work-card').forEach((card, i) => {
      [card, ...card.querySelectorAll('*')].forEach((el, j) => {
        const cs = getComputedStyle(el);
        out.push(`${i}.${j} ${el.tagName}.${[...el.classList].join('.')} ` + props.map((p) => `${p}=${cs.getPropertyValue(p)}`).join(';'));
      });
    });
    return out;
  }, CARD_PROPS);
  const stack = page.locator('.case-cube, .work-stack').first();
  await stack.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, `home-${base === BASELINE ? 'baseline' : 'now'}-${viewport.width}.png`) });
  await context.close();
  return dump;
}

const browser = await chromium.launch();
try {
  const langs = [['en', BASE]];
  if (RU_BASE) langs.push(['ru', RU_BASE]);
  for (const [lang, base] of langs) {
    for (const viewport of VIEWPORTS) {
      for (const route of ORDER) {
        await checkCase(browser, base, lang, viewport, route);
      }
    }
  }
  if (BASELINE) {
    for (const viewport of VIEWPORTS) {
      const now = await homeCardStyles(browser, BASE, viewport);
      const was = await homeCardStyles(browser, BASELINE, viewport);
      const diff = now.filter((line, i) => line !== was[i]);
      check(`home ${viewport.width}: work cards identical to baseline (${now.length} nodes)`, now.length === was.length && diff.length === 0, diff.slice(0, 3).join(' || '));
    }
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
