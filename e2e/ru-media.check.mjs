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
 * posters and the `.ru` story pictures, the pairs slider shows the .ru web MVP
 * pair, and no EN flow file is requested. (The old pet-tracker-mvp-screens strip
 * is gone from the page. The full RU page check is cat-app-preview.check.mjs.)
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4174';
const FLOW = /\/sc[14]-[ab](\.ru)?(\.poster)?-[^/]+\.(mp4|webm|webp)$/;
const MVP = /\/web-mvp-(before|after)(\.ru)?-[^/]+\.webp$/;
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

    // The web MVP is one pairs slider: the web MVP screens stay English (before, shared file), the v2 side is the .ru file.
    const pair = await page.evaluate(() => [...document.querySelectorAll('.cat-ba-slider__img')].map((i) => i.currentSrc));
    check(`${tag}: pairs slider: EN web MVP before, RU v2 after`, pair.length === 2 && !isRu(pair[0]) && isRu(pair[1]) && /web-mvp-before/.test(pair[0]) && /web-mvp-after/.test(pair[1]), pair.map((u) => u.split('/').pop()).join(', '));
    const old = await page.evaluate(() => document.querySelectorAll('img[src*="pet-tracker-mvp-screens"]').length);
    check(`${tag}: old MVP strip is gone`, old === 0, `${old} images`);
    const brandSrcs = await page.evaluate(() => [...document.querySelectorAll('.cat-collapsible img')].map((i) => i.currentSrc || i.src));
    check(`${tag}: brand frames are the shared (non-.ru) files`, brandSrcs.length === 6 && brandSrcs.every((u) => !isRu(u)), `${brandSrcs.length} images`);

    // web-mvp-before is English on purpose (the web MVP screens are in English).
    const enHits = [...new Set(hits.filter((u) => !isRu(u) && !/web-mvp-before/.test(u)))];
    const ruHits = [...new Set(hits.filter(isRu))];
    check(`${tag}: no EN flow / web MVP file requested`, enHits.length === 0, enHits.map((u) => u.split('/').pop()).join(', '));
    check(`${tag}: RU files requested`, ruHits.length >= 5, ruHits.map((u) => u.split('/').pop()).join(', '));
    check(`${tag}: no errors`, errors.length === 0, errors.join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(`\n${total - failed}/${total} passed.`);
process.exitCode = failed ? 1 : 0;
