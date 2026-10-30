/*
 * RU media on /cat-app — only for a build with RU switched on.
 *
 * RU is off on the site (RU_ENABLED = false), so make a throwaway copy, never
 * touching the repo:
 *   R=<scratch dir>; cp -R index.html stats.html vite.config.js package.json src public scripts $R/
 *   ln -s "$PWD/node_modules" $R/node_modules
 *   sed -i '' 's/const RU_ENABLED = false;/const RU_ENABLED = true;/' $R/src/i18n/language.js
 *   (cd $R && npx vite build && npx vite preview --port 4174 --strictPort)
 *   BASE=http://localhost:4174 node e2e/ru-media.check.mjs
 *
 * Checks at 1440 and 390: the RU page loads only `.ru` flow clips, `.ru`
 * posters and the `.ru` MVP strip (the `.mobile.ru` one on a phone), the
 * lightbox opens the same RU file, and no EN flow/MVP file is requested.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4174';
const FLOW = /\/sc[14]-[ab](\.ru)?(\.poster)?-[^/]+\.(mp4|webm|webp)$/;
const MVP = /\/pet-tracker-mvp-screens(\.mobile)?(\.ru)?-[^/]+\.webp$/;
const isRu = (url) => /\.ru[.-][^/]*\.\w+$/.test(url.split('/').pop());

let failed = 0;
let total = 0;
const check = (name, ok, detail = '') => {
  total += 1;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const tag = `RU /cat-app ${viewport.width}`;
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const hits = [];
    const errors = [];
    page.on('request', (req) => {
      const url = req.url();
      if (FLOW.test(url) || MVP.test(url)) hits.push(url);
    });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (res) => {
      if (res.status() >= 400 && /\/assets\//.test(res.url())) errors.push(`http ${res.status()} ${res.url()}`);
    });

    const res = await page.goto(`${BASE}/cat-app?lang=ru`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    const lang = await page.evaluate(() => document.documentElement.lang);
    const h2 = await page.locator('.case-hero__description').first().innerText();
    check(`${tag}: page is Russian`, res.status() === 200 && lang === 'ru' && /[А-Яа-яЁё]/.test(h2), `status ${res.status()}, lang ${lang}`);

    // Walk the page, then make every flow clip play once.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    const videos = page.locator('.case-flow video');
    const count = await videos.count();
    for (let i = 0; i < count; i += 1) {
      await videos.nth(i).evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(1500);
    }
    const playing = await page.evaluate(() =>
      [...document.querySelectorAll('.case-flow video')].map((v) => ({ src: v.currentSrc, t: v.currentTime })),
    );
    check(`${tag}: 4 RU clips played`, playing.length === 4 && playing.every((v) => isRu(v.src) && v.t > 0), playing.map((v) => `${v.src.split('/').pop()} t ${v.t.toFixed(1)}`).join(', '));

    const mvp = await page.evaluate(() => document.querySelector('.case-image-band img[src*="pet-tracker-mvp-screens"]')?.currentSrc ?? '');
    const wantMobile = viewport.width <= 640;
    check(
      `${tag}: MVP strip is the RU ${wantMobile ? '.mobile' : 'horizontal'} file`,
      isRu(mvp) && (wantMobile ? /\.mobile\.ru-/.test(mvp) : !/\.mobile/.test(mvp)),
      mvp.split('/').pop(),
    );
    const img = page.locator('.case-image-band img[src*="pet-tracker-mvp-screens"]').first();
    await img.scrollIntoViewIfNeeded();
    await img.click();
    const box = page.locator('.case-lightbox__img');
    const opened = await box.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
    const boxSrc = opened ? await box.getAttribute('src') : '';
    check(`${tag}: lightbox opens the same RU file`, opened && boxSrc === mvp, (boxSrc ?? '').split('/').pop());

    const enHits = [...new Set(hits.filter((u) => !isRu(u)))];
    const ruHits = [...new Set(hits.filter(isRu))];
    check(`${tag}: no EN flow / MVP file requested`, enHits.length === 0, enHits.map((u) => u.split('/').pop()).join(', '));
    check(`${tag}: RU files requested`, ruHits.length >= 5, ruHits.map((u) => u.split('/').pop()).join(', '));
    check(`${tag}: no errors`, errors.length === 0, errors.join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(`\n${total - failed}/${total} passed.`);
process.exitCode = failed ? 1 : 0;
