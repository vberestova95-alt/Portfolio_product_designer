/*
 * Browser Back after opening a case (release 2026-11-10), Chromium and WebKit, 1440 and 390.
 *
 *   BASE=http://localhost:4185 node e2e/back-navigation.check.mjs
 *
 * From /betboom-pass: the "Next case: Gamification hub" teaser at the top of the case and a card in
 * "Other projects"; from /betboom-gamification-hub: a card in "Other projects". The opened case starts
 * at the top; Back returns to the source page within 80 px of where the link was clicked.
 * Exit code 1 if something fails.
 */
import { chromium, webkit } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const TOL = 80;
const failed = [];
let total = 0;
function check(name, ok, detail = '') {
  total += 1;
  if (!ok) failed.push(`${name}: ${detail}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}
const CASES = [
  ['/betboom-pass', '.case-showcase__teaser', 'top teaser'],
  ['/betboom-pass', '.case-next__card', 'Other projects card'],
  ['/betboom-gamification-hub', '.case-next__card', 'Other projects card'],
];
for (const [bn, bt] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await bt.launch();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const [from, sel, label] of CASES) {
      const tag = `${bn} ${w} ${from} ${label}`;
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      await ctx.addInitScript(() => localStorage.setItem('vb_consent', JSON.stringify({ choice: 'denied', until: Date.now() + 864e5 })));
      const page = await ctx.newPage();
      await page.goto(BASE + from, { waitUntil: 'load' });
      await page.waitForTimeout(1000);
      const link = page.locator(sel).first();
      const href = await link.getAttribute('href');
      // Lazy images shift the layout while scrolling down: bring the link into view twice and let it settle.
      for (let k = 0; k < 3; k += 1) {
        await link.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(900);
      }
      const y0 = await page.evaluate(() => window.scrollY);
      await Promise.all([page.waitForURL((u) => new URL(u).pathname === href), link.click()]);
      await page.waitForTimeout(900);
      const y1 = await page.evaluate(() => window.scrollY);
      check(`${tag}: opened case starts at the top`, y1 < 80, `scrollY ${y1}`);
      await page.goBack({ waitUntil: 'load' });
      await page.waitForTimeout(1800);
      const r = await page.evaluate(() => ({ p: location.pathname, y: window.scrollY }));
      check(`${tag}: Back lands at the link`, r.p === from && Math.abs(r.y - y0) <= TOL, `path ${r.p}, scrollY ${r.y} vs ${y0} (diff ${r.y - y0})`);
      await ctx.close();
    }
  }
  await browser.close();
}
console.log(`\n${total - failed.length}/${total} passed.`);
if (failed.length) { console.log('\nFailed:'); failed.forEach((f) => console.log('  ' + f)); process.exit(1); }
