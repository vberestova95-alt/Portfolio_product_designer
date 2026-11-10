/*
 * Fluffy Chumb cards on the home page and where aiProjects renders them (the
 * pre-п. 34 texts: п. 34 was cancelled), images load,
 * link goes to /cat-app, console / network clean. 1440 and 390.
 *
 *   EN: BASE=http://localhost:4181 node e2e/home-fluffy-cards.check.mjs
 *   RU: BASE=http://localhost:4182 LANG_CODE=ru node e2e/home-fluffy-cards.check.mjs
 * SHOTS=<dir> for screenshots.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE ?? 'http://localhost:4181';
const RU = process.env.LANG_CODE === 'ru';
const SHOTS = process.env.SHOTS ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '.shots');
mkdirSync(SHOTS, { recursive: true });
const q = RU ? '?lang=ru' : '';
const NEW = RU
  ? [/настраивают свои трекеры и делят дела на день/, /Свои трекеры ухода и общая рутина дня/]
  : [/set up their own trackers and share the day’s tasks/, /Custom care trackers and a shared daily routine/];
const OLD = /share the day’s care tasks|A shared daily care routine|делят дела по уходу на день|Общая рутина ухода на день/;

let total = 0;
let failed = 0;
const check = (name, ok, detail = '') => {
  total += 1;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    for (const [route, label, expected] of [['/', 'home', NEW[0]], ['/ai-projects', 'ai-projects', NEW[1]]]) {
      const tag = `${RU ? 'RU' : 'EN'} ${label} ${width}`;
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      await ctx.addInitScript(() => localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 })));
      const page = await ctx.newPage();
      const problems = [];
      page.on('pageerror', (e) => problems.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !/yandex|ERR_CERT_/.test(m.location()?.url + m.text())) problems.push(m.text()); });
      page.on('response', (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
      await page.goto(BASE + route + q, { waitUntil: 'load' });
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(600);
      // The card's text lives in the DOM even when stacked / off screen.
      const info = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('a, article, li, div')].filter((e) => /Fluffy Chumb/.test(e.innerText || '') && e.querySelector('img'));
        const all = document.body.innerText;
        return { all, cardCount: nodes.length };
      });
      check(`${tag}: Fluffy Chumb card text present`, expected.test(info.all), expected.source);
      check(`${tag}: no п. 34 wording`, !OLD.test(info.all), info.all.match(OLD)?.[0] ?? '');
      const link = await page.evaluate(() => [...document.querySelectorAll('a[href="/cat-app"]')].length);
      check(`${tag}: link(s) to /cat-app`, link >= 1, `${link}`);
      const broken = await page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0) && i.loading !== 'lazy').map((i) => i.src));
      check(`${tag}: no broken images`, broken.length === 0, broken.join(', '));
      const cover = await page.evaluate(() => [...document.images].filter((i) => /fluffy-chumb/.test(i.currentSrc || i.src)).map((i) => i.complete && i.naturalWidth > 0));
      check(`${tag}: Fluffy Chumb cover loaded`, cover.length > 0 && cover.every(Boolean), JSON.stringify(cover));
      check(`${tag}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), '');
      check(`${tag}: console / network clean`, problems.length === 0, problems.join(' | '));
      // Screenshot of the card.
      const card = page.locator('a[href="/cat-app"]').first();
      if (await card.count()) {
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SHOTS, `test-34revert-${RU ? 'ru' : 'en'}-${label}-${width}.png`) });
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`\n${total - failed}/${total} passed`);
process.exitCode = failed ? 1 : 0;
