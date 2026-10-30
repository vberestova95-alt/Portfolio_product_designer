/*
 * Pre-deploy check for vberestova.com (BACKLOG п. 9).
 *
 * Plain Node + the `playwright` library (no @playwright/test in the project).
 *
 *   npm run build && npx vite preview --port 4173 --strictPort
 *   node e2e/predeploy.spec.mjs
 *
 * Env:
 *   BASE=http://localhost:4173   server to test
 *   SHOTS=/path/to/dir           where screenshots go (default: e2e/.shots)
 *
 * Exit code 1 if any check fails. Prints a PASS/FAIL line per check.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? 'http://localhost:4173';
const SHOTS = process.env.SHOTS ?? path.join(here, '.shots');
mkdirSync(SHOTS, { recursive: true });

// Expected order of cases on the home page and in "more work" blocks.
const CASE_ORDER = [
  { id: 'betboom-pass', href: '/betboom-pass', title: 'BetBoom PASS' },
  { id: 'yandex-news', href: '/yandex-turkey', title: 'Yandex News Turkey' },
  { id: 'cat-app', href: '/cat-app', title: 'Fluffy Chumb' },
  { id: 'kokoc-group', href: '/kokoc-group', title: 'Kokoc Group' },
  { id: 'iquoto', href: '/iquoto', title: 'IQuoto' },
];
const HERO_LINKS = CASE_ORDER.slice(0, 3).map((c) => c.href);
const CASE_COVERS = {
  'betboom-pass': /betboom-cover/,
  'yandex-news': /yandex-cover/,
  'cat-app': /fluffy-chumb-v2-cover-[^.]+\.webp/,
  // kokoc-main-desktop.png and kokoc-about.png are byte-identical; Vite emits one file.
  'kokoc-group': /kokoc-(main-desktop|about)/,
  iquoto: /iquoto-desktop/,
};

// scripts/deploy-targets.mjs → portfolio.routes
const ROUTES = [
  'ai-projects',
  'betboom-pass',
  'cat-app',
  'design-concepts',
  'design-cringe',
  'ds-plugins',
  'experience',
  'iquoto',
  'kokoc-group',
  'yandex-turkey',
];
const CASE_ROUTES = ['betboom-pass', 'cat-app', 'iquoto', 'kokoc-group', 'yandex-turkey'];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  phone: { width: 390, height: 844 },
};

const results = [];
const notes = new Set();
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

async function openPage(browser, viewport, url) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const problems = [];
  // Yandex Metrika beacons (mc.yandex.ru, *.yandex.net) are third-party; in a
  // sandbox without their certs they fail with ERR_CERT_*. Kept out of the
  // verdict and printed as a note instead.
  const thirdParty = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const where = msg.location()?.url ?? '';
    if (/yandex\.(ru|net|com)/.test(where) || /ERR_CERT_/.test(msg.text())) {
      thirdParty.push(`console: ${msg.text()}`);
      return;
    }
    problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400) problems.push(`http ${res.status()}: ${res.url()}`);
  });
  page.on('requestfailed', (req) => {
    const failure = req.failure()?.errorText ?? '';
    // Media requests are routinely aborted when a video is paused or swapped.
    if (failure.includes('ERR_ABORTED') && ['media', 'fetch'].includes(req.resourceType())) return;
    if (/yandex\.(ru|net|com)/.test(new URL(req.url()).hostname)) {
      thirdParty.push(`requestfailed ${failure}: ${req.url()}`);
      return;
    }
    problems.push(`requestfailed ${failure}: ${req.url()}`);
  });
  const response = await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 60000 });
  page.on('close', () => {
    if (thirdParty.length) notes.add([...new Set(thirdParty)].join(' | '));
  });
  return { context, page, problems, status: response?.status() };
}

// Scroll top→bottom so lazy images and reveal animations fire, then back up.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  // Wait for images that are still decoding.
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? null
          : new Promise((r) => {
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
              setTimeout(r, 8000);
            }),
      ),
    ),
  );
}

async function brokenImages(page) {
  return page.evaluate(() =>
    [...document.images]
      .filter((img) => img.getAttribute('src'))
      // A lazy image inside a display:none branch (e.g. a desktop-only shot on
      // a phone) never loads by design — not broken.
      .filter((img) => !(img.loading === 'lazy' && img.getClientRects().length === 0))
      .filter((img) => !(img.complete && img.naturalWidth > 0))
      .map((img) => img.getAttribute('src')),
  );
}

async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    window.scrollTo(0, 0);
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, over: doc.scrollWidth - doc.clientWidth };
  });
}

async function checkHome(browser) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const tag = `home ${viewport.width}`;
    const { context, page, problems, status } = await openPage(browser, viewport, '/');
    check(`${tag}: status 200`, status === 200, `got ${status}`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(SHOTS, `home-${viewport.width}-hero.png`) });

    const hero = await page.evaluate(() => {
      const nav = document.querySelector('.hero-panel .mosaic-links');
      if (!nav) return null;
      return [...nav.querySelectorAll('a')].map((a) => {
        const r = a.getBoundingClientRect();
        const visible = r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth;
        return { href: a.getAttribute('href'), visible };
      });
    });
    // On a phone the hero fits only two mosaics (known, not a bug).
    const expectedHero = viewport.width < 600 ? HERO_LINKS.slice(0, 2) : HERO_LINKS;
    check(
      `${tag}: hero mosaics link to ${expectedHero.join(', ')}`,
      !!hero && JSON.stringify(hero.map((h) => h.href)) === JSON.stringify(expectedHero),
      hero ? `got ${hero.map((h) => `${h.href}${h.visible ? '' : '(offscreen)'}`).join(', ')}` : 'no hero mosaic nav',
    );

    const cards = await page.evaluate(() =>
      [...document.querySelectorAll('.case-cube__face .work-card, .work-stack > .work-card')].map((card) => ({
        id: [...card.classList].find((c) => c.startsWith('work-card--') && !/--(ink|paper|pet|mint|graphite|blue)$/.test(c))?.slice(11),
        href: card.querySelector('.work-card__hit')?.getAttribute('href'),
        imgs: [...card.querySelectorAll('img')].map((i) => i.getAttribute('src')),
      })),
    );
    check(
      `${tag}: card stack has 5 cases in new order`,
      JSON.stringify(cards.map((c) => c.id)) === JSON.stringify(CASE_ORDER.map((c) => c.id)) &&
        JSON.stringify(cards.map((c) => c.href)) === JSON.stringify(CASE_ORDER.map((c) => c.href)),
      cards.map((c) => `${c.id}→${c.href}`).join(', '),
    );
    const coverIssues = cards
      .filter((c) => !CASE_COVERS[c.id] || !CASE_COVERS[c.id].test(c.imgs[0] ?? ''))
      .map((c) => `${c.id}: ${c.imgs[0]}`);
    const firstImgs = cards.map((c) => c.imgs[0]);
    const unique = new Set(firstImgs).size === firstImgs.length;
    check(`${tag}: every card has its own cover`, coverIssues.length === 0 && unique, coverIssues.join('; ') || (unique ? '' : 'duplicate covers'));

    await scrollThrough(page);
    const broken = await brokenImages(page);
    check(`${tag}: no broken images`, broken.length === 0, broken.join(', '));
    const overflow = await horizontalOverflow(page);
    check(`${tag}: no horizontal scroll`, overflow.over <= 0, `scrollWidth ${overflow.scrollWidth} / clientWidth ${overflow.clientWidth}`);
    await page.screenshot({ path: path.join(SHOTS, `home-${viewport.width}-full.png`), fullPage: true }).catch(() => {});

    // Screenshot each card face of the stack: scroll to the cube section stepwise.
    const cube = page.locator('.case-cube, .work-stack').first();
    if (await cube.count()) {
      await cube.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SHOTS, `home-${viewport.width}-stack.png`) });
    }

    check(`${tag}: console/network clean`, problems.length === 0, problems.join(' | '));
    await context.close();
  }
}

async function checkRoutes(browser) {
  for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.phone]) {
    for (const route of ROUTES) {
      const tag = `/${route} ${viewport.width}`;
      const { context, page, problems, status } = await openPage(browser, viewport, `/${route}`);
      check(`${tag}: status 200`, status === 200, `got ${status}`);
      const title = await page.title();
      const errorPage = await page.locator('text=/page not found|something went wrong/i').count();
      check(`${tag}: renders (no error page)`, errorPage === 0, `title "${title}"`);
      await scrollThrough(page);
      const broken = await brokenImages(page);
      check(`${tag}: no broken images`, broken.length === 0, broken.join(', '));
      const overflow = await horizontalOverflow(page);
      check(`${tag}: no horizontal scroll`, overflow.over <= 0, `scrollWidth ${overflow.scrollWidth} / clientWidth ${overflow.clientWidth}`);

      if (CASE_ROUTES.includes(route)) {
        const next = await page.evaluate(() =>
          [...document.querySelectorAll('.case-next a')].map((a) => a.getAttribute('href')),
        );
        const expected = CASE_ORDER.map((c) => c.href).filter((h) => h !== `/${route}`);
        check(`${tag}: "more work" in new order`, JSON.stringify(next) === JSON.stringify(expected), `got ${next.join(', ')}`);
      }
      await page.screenshot({ path: path.join(SHOTS, `route-${route}-${viewport.width}.png`) });
      check(`${tag}: console/network clean`, problems.length === 0, problems.join(' | '));
      await context.close();
    }
  }
}

async function checkCatApp(browser) {
  for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.phone]) {
    const tag = `/cat-app ${viewport.width}`;
    const { context, page, problems } = await openPage(browser, viewport, '/cat-app');
    await page.waitForTimeout(800);
    const heroSrc = await page.locator('.case-hero__media img').first().getAttribute('src');
    check(`${tag}: hero is the new preview`, /fluffy-chumb-v2-cover-[^.]+\.webp/.test(heroSrc ?? ''), heroSrc ?? 'no hero img');
    const bodyText = await page.locator('main, body').first().innerText();
    check(`${tag}: invite line has no "Owner or Can edit"`, !/Owner or Can edit/i.test(bodyText), '');
    check(`${tag}: no RU text in MVP / flows (EN page)`, !/Лютик|Инсувет|Винсувет/.test(bodyText), '');
    await page.locator('.case-hero').first().screenshot({ path: path.join(SHOTS, `cat-app-${viewport.width}-hero.png`) });

    await scrollThrough(page);
    const bands = await page.evaluate(() =>
      [...document.querySelectorAll('.case-image-band')].map((band) => {
        const img = band.querySelector('img');
        const cs = getComputedStyle(band);
        const ics = img ? getComputedStyle(img) : null;
        const ir = img?.getBoundingClientRect();
        const br = band.getBoundingClientRect();
        return {
          cls: band.className,
          src: img?.getAttribute('src'),
          currentSrc: img?.currentSrc,
          bandBg: cs.backgroundColor + ' ' + cs.backgroundImage,
          bandPadding: cs.padding,
          imgBg: ics ? ics.backgroundColor + ' ' + ics.backgroundImage : null,
          objectFit: ics?.objectFit,
          naturalRatio: img ? img.naturalWidth / img.naturalHeight : null,
          renderedRatio: ir ? ir.width / ir.height : null,
          inside: ir ? ir.left >= br.left - 1 && ir.right <= br.right + 1 && ir.top >= br.top - 1 && ir.bottom <= br.bottom + 1 : null,
          inViewportWidth: ir ? ir.left >= -1 && ir.right <= window.innerWidth + 1 : null,
          loaded: img ? img.complete && img.naturalWidth > 0 : false,
          bandScrollWidth: band.scrollWidth,
          bandClientWidth: band.clientWidth,
          overflowX: cs.overflowX,
        };
      }),
    );
    const mvp = bands.find((b) => /pet-tracker-mvp-screens/.test(b.src ?? ''));
    const v2 = bands.find((b) => /fluffy-chumb-v2-screens/.test(b.src ?? ''));
    check(`${tag}: v2 strip present and loaded`, !!v2 && v2.loaded, v2 ? v2.src : 'missing');
    const noBacking =
      !!mvp &&
      /--bare/.test(mvp.cls) &&
      /rgba\(0, 0, 0, 0\) none/.test(mvp.bandBg) &&
      /rgba\(0, 0, 0, 0\) none/.test(mvp.imgBg) &&
      mvp.bandPadding === '0px';
    check(`${tag}: MVP strip has no backing`, noBacking, mvp ? `band bg "${mvp.bandBg}", img bg "${mvp.imgBg}", padding ${mvp.bandPadding}` : 'missing');
    const ratioOk = !!mvp && mvp.loaded && Math.abs(mvp.naturalRatio - mvp.renderedRatio) / mvp.naturalRatio < 0.02;
    const ratioDetail = mvp
      ? `natural ${mvp.naturalRatio?.toFixed(3)} vs rendered ${mvp.renderedRatio?.toFixed(3)}, object-fit ${mvp.objectFit}`
      : 'missing';
    const pageOverflow = await horizontalOverflow(page);
    if (viewport.width > 640) {
      // Desktop: the horizontal strip, three screens whole.
      check(`${tag}: MVP strip is the EN horizontal picture`, !!mvp && /pet-tracker-mvp-screens-[^./]+\.webp/.test(mvp.currentSrc ?? ''), mvp?.currentSrc ?? 'missing');
      check(`${tag}: MVP strip shown whole (not cropped)`, ratioOk && mvp.inside && mvp.inViewportWidth, `${ratioDetail}, inside ${mvp?.inside}`);
    } else {
      // Phone (≤640): <picture> swaps in a vertical .mobile image that fits the width.
      check(`${tag}: MVP strip uses the EN .mobile picture`, !!mvp && /pet-tracker-mvp-screens\.mobile-[^./]+\.webp/.test(mvp.currentSrc ?? ''), mvp?.currentSrc ?? 'missing');
      check(`${tag}: MVP strip keeps proportions and fits the width`, ratioOk && mvp.inside && mvp.inViewportWidth, `${ratioDetail}, inside ${mvp?.inside}`);
      check(
        `${tag}: MVP strip has no sideways scroll`,
        !!mvp && mvp.bandScrollWidth <= mvp.bandClientWidth,
        mvp ? `band scrollWidth ${mvp.bandScrollWidth} / clientWidth ${mvp.bandClientWidth}, overflow-x ${mvp.overflowX}` : 'missing',
      );
    }
    check(`${tag}: page has no horizontal scroll`, pageOverflow.over <= 0, `scrollWidth ${pageOverflow.scrollWidth} / clientWidth ${pageOverflow.clientWidth}`);

    // Lightbox: clicking the MVP strip opens the same take the page shows.
    {
      const img = page.locator('.case-image-band img[src*="pet-tracker-mvp-screens"]').first();
      await img.scrollIntoViewIfNeeded();
      await img.click();
      const box = page.locator('.case-lightbox__img');
      const opened = await box.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
      const boxSrc = opened ? await box.getAttribute('src') : null;
      const loaded = opened ? await box.evaluate((el) => el.complete && el.naturalWidth > 0) : false;
      const wantMobile = viewport.width <= 640;
      const okSrc = !!boxSrc && (wantMobile ? /pet-tracker-mvp-screens\.mobile-[^./]+\.webp/.test(boxSrc) : /pet-tracker-mvp-screens-[^./]+\.webp/.test(boxSrc));
      check(`${tag}: MVP lightbox opens the EN ${wantMobile ? '.mobile' : 'horizontal'} picture`, opened && okSrc && loaded, boxSrc ?? 'lightbox did not open');
      if (opened) {
        await page.screenshot({ path: path.join(SHOTS, `cat-app-${viewport.width}-mvp-lightbox.png`) });
        await page.locator('.case-lightbox__close').click();
      }
    }
    for (const [name, sel] of [['mvp', 'img[src*="pet-tracker-mvp-screens"]'], ['v2', 'img[src*="fluffy-chumb-v2-screens"]']]) {
      const band = page.locator('.case-image-band', { has: page.locator(sel) }).first();
      if (await band.count()) {
        await band.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await band.screenshot({ path: path.join(SHOTS, `cat-app-${viewport.width}-${name}.png`) });
      }
    }
    await page.screenshot({ path: path.join(SHOTS, `cat-app-${viewport.width}-full.png`), fullPage: true }).catch(() => {});
    check(`${tag}: console/network clean`, problems.length === 0, problems.join(' | '));
    await context.close();
  }
}

// Key flows on /cat-app: 2 flows × 2 clips, preload none, play on screen.
const FLOW_MEDIA = /\/sc[14]-[ab](\.ru)?-[^/]+\.(mp4|webm)$/;
const FLOW_POSTER = /\/sc[14]-[ab](\.ru)?\.poster-[^/]+\.webp$/;

async function videoStates(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('.case-flow')].map((flow) =>
      [...flow.querySelectorAll('video')].map((v) => {
        const r = v.getBoundingClientRect();
        return {
          paused: v.paused,
          time: v.currentTime,
          muted: v.muted,
          loop: v.loop,
          playsInline: v.playsInline,
          preload: v.getAttribute('preload'),
          controls: v.controls,
          poster: v.getAttribute('poster'),
          currentSrc: v.currentSrc,
          sources: [...v.querySelectorAll('source')].map((x) => x.getAttribute('src')),
          networkState: v.networkState,
          error: v.error ? v.error.code : null,
          onScreen: r.bottom > 0 && r.top < window.innerHeight,
        };
      }),
    ),
  );
}

async function checkFlowVideos(browser) {
  for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.phone]) {
    for (const reduced of [false, true]) {
      const tag = `/cat-app ${viewport.width} key flows${reduced ? ' (reduced motion)' : ''}`;
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
      const page = await context.newPage();
      const mediaHits = [];
      const posterHits = [];
      const problems = [];
      page.on('request', (req) => {
        const url = req.url();
        if (FLOW_MEDIA.test(url)) mediaHits.push(url);
        if (FLOW_POSTER.test(url)) posterHits.push(url);
      });
      page.on('response', (res) => {
        if (res.status() >= 400 && /\/assets\//.test(res.url())) problems.push(`http ${res.status()}: ${res.url()}`);
      });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      await page.goto(`${BASE}/cat-app`, { waitUntil: 'load' });
      await page.waitForTimeout(1500);

      const initial = await videoStates(page);
      check(`${tag}: 2 flows × 2 clips`, initial.length === 2 && initial.every((f) => f.length === 2), JSON.stringify(initial.map((f) => f.length)));
      const flat = initial.flat();
      check(
        `${tag}: clips are muted, loop, playsInline, preload=none, have a poster`,
        flat.length === 4 && flat.every((v) => v.muted && v.loop && v.playsInline && v.preload === 'none' && v.poster),
        flat.map((v) => `${v.muted}/${v.loop}/${v.playsInline}/${v.preload}/${!!v.poster}`).join(' '),
      );
      check(`${tag}: EN clips (no .ru sources)`, flat.every((v) => v.sources.every((src) => !/\.ru[-.]/.test(src))), flat.flatMap((v) => v.sources).join(', '));
      check(`${tag}: no clip downloaded before scrolling`, mediaHits.length === 0, mediaHits.join(', '));
      check(`${tag}: controls ${reduced ? 'shown' : 'hidden'}`, flat.every((v) => v.controls === reduced), flat.map((v) => v.controls).join(','));

      // Bring flow 1 clips on screen one by one.
      const flow1 = page.locator('.case-flow').nth(0).locator('video');
      const flow2 = page.locator('.case-flow').nth(1).locator('video');
      const flow1Played = [];
      for (let i = 0; i < 2; i += 1) {
        await flow1.nth(i).evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(2500);
        const st = (await videoStates(page))[0][i];
        flow1Played.push(st);
        if (i === 0) {
          await page.screenshot({ path: path.join(SHOTS, `cat-app-${viewport.width}-flows${reduced ? '-reduced' : ''}.png`) });
        }
      }
      const atFlow1 = await videoStates(page);
      if (!reduced) {
        check(
          `${tag}: flow 1 clips play when on screen`,
          flow1Played.every((v) => !v.paused && v.time > 0 && v.error === null),
          flow1Played.map((v) => `paused ${v.paused}, t ${v.time.toFixed(2)}, src ${v.currentSrc.split('/').pop()}, err ${v.error}`).join(' | '),
        );
        const offscreen2 = atFlow1[1].filter((v) => !v.onScreen);
        check(
          `${tag}: flow 2 clips off screen are paused`,
          offscreen2.length > 0 && offscreen2.every((v) => v.paused),
          atFlow1[1].map((v) => `onScreen ${v.onScreen}, paused ${v.paused}`).join(' | '),
        );
        // Scroll flow 1 away: it pauses.
        await flow2.nth(1).evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(2000);
        const after = await videoStates(page);
        const away = after[0].filter((v) => !v.onScreen);
        check(
          `${tag}: flow 1 pauses after scrolling away`,
          away.length > 0 && away.every((v) => v.paused),
          after[0].map((v) => `onScreen ${v.onScreen}, paused ${v.paused}`).join(' | '),
        );
        check(`${tag}: flow 2 plays when on screen`, after[1].some((v) => v.onScreen && !v.paused && v.time > 0), after[1].map((v) => `onScreen ${v.onScreen}, paused ${v.paused}, t ${v.time.toFixed(2)}`).join(' | '));
      } else {
        await flow2.nth(1).evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(1500);
        const after = (await videoStates(page)).flat();
        check(`${tag}: all clips stay paused at 0`, after.every((v) => v.paused && v.time === 0), after.map((v) => `paused ${v.paused}, t ${v.time}`).join(' | '));
        check(`${tag}: no clip downloaded`, mediaHits.length === 0, mediaHits.join(', '));
      }

      // Posters: every poster requested and decodable.
      const posters = await page.evaluate(async () =>
        Promise.all(
          [...document.querySelectorAll('.case-flow video')].map(
            (v) =>
              new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ src: v.getAttribute('poster'), ok: img.naturalWidth > 0 });
                img.onerror = () => resolve({ src: v.getAttribute('poster'), ok: false });
                img.src = v.getAttribute('poster');
              }),
          ),
        ),
      );
      check(`${tag}: posters load`, posters.length === 4 && posters.every((p) => p.ok), posters.map((p) => `${p.src.split('/').pop()} ${p.ok}`).join(', '));
      check(`${tag}: EN posters`, posters.every((p) => !/\.ru\./.test(p.src)), '');

      // Every source URL responds 200 (no broken src).
      const srcs = [...new Set(flat.flatMap((v) => v.sources))];
      const statuses = [];
      for (const src of srcs) {
        const res = await page.request.head(new URL(src, BASE).toString());
        statuses.push({ src, status: res.status(), type: res.headers()['content-type'] });
      }
      check(
        `${tag}: all clip sources respond 200 with video type`,
        statuses.length === 8 && statuses.every((x) => x.status === 200 && /^video\//.test(x.type ?? '')),
        statuses.filter((x) => x.status !== 200 || !/^video\//.test(x.type ?? '')).map((x) => `${x.src} ${x.status} ${x.type}`).join(', ') || `${statuses.length} sources`,
      );
      check(`${tag}: no asset errors`, problems.length === 0, problems.join(' | '));
      await context.close();
    }
  }
}

async function checkLangRu(browser) {
  for (const url of ['/?lang=ru', '/cat-app?lang=ru', '/kokoc-group?lang=ru']) {
    const { context, page, problems, status } = await openPage(browser, VIEWPORTS.desktop, url);
    const lang = await page.evaluate(() => document.documentElement.lang);
    const h1 = (await page.locator('h1').first().textContent().catch(() => '')) ?? '';
    check(`${url}: status 200, renders`, status === 200 && h1.trim().length > 0, `lang="${lang}", h1 "${h1.trim().slice(0, 40)}"`);
    check(`${url}: falls back to English (RU_ENABLED=false)`, !/[А-Яа-яЁё]/.test(h1), h1.trim().slice(0, 40));
    await scrollThrough(page);
    const broken = await brokenImages(page);
    check(`${url}: no broken images`, broken.length === 0, broken.join(', '));
    check(`${url}: console/network clean`, problems.length === 0, problems.join(' | '));
    await context.close();
  }
}

const browser = await chromium.launch();
try {
  await checkHome(browser);
  await checkRoutes(browser);
  await checkCatApp(browser);
  await checkFlowVideos(browser);
  await checkLangRu(browser);
} finally {
  await browser.close();
}

if (notes.size) {
  console.log('\nThird-party notes (not counted):');
  for (const n of notes) console.log(`- ${n}`);
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots: ${SHOTS}`);
if (failed.length) {
  console.log('\nFailed:');
  for (const f of failed) console.log(`- ${f.name}: ${f.detail}`);
  process.exitCode = 1;
}
