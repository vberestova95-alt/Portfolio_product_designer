/*
 * One build, two deploys.
 *
 * The default target is the full portfolio on vberestova.com. index.html and
 * everything in public/ already carry its values, so that target needs no
 * rewriting after a build — what ships is what is committed.
 *
 * Setting VITE_CASE_ONLY=true (netlify.toml does this for its production
 * context) builds the standalone Pet Injection Tracker page on its own domain
 * instead. That target has to override the head metadata, robots.txt and
 * sitemap.xml inside dist/, otherwise the two deploys claim each other's URLs
 * and compete in search results.
 *
 * The same flag is read by the app itself (src/App.jsx) to collapse routing
 * down to the single case page.
 *
 * VITE_AI_ONLY=true (`npm run build:ai`) builds the AI portfolio for its own
 * subdomain into dist-ai/: the landing at /, the cases its cards open, and its
 * own head metadata, robots.txt and sitemap.xml.
 */
import { aiPortfolio } from '../src/data/aiPortfolio.js'

const portfolio = {
  id: 'portfolio',
  origin: 'https://vberestova.com',
  /*
   * Routes that get a pre-rendered index.html so a direct hit or a shared link
   * resolves without the host rewriting it. Pet Injection Tracker is
   * deliberately absent: it publishes on its own domain, not as a portfolio
   * route. Keep this in step with the rewrites in vercel.json.
   */
  routes: [
    'ai-portfolio',
    'ai-projects',
    'betboom-gamification-hub',
    'betboom-pass',
    'cat-app',
    'design-concepts',
    'design-cringe',
    'ds-plugins',
    'experience',
    // Reached only from the AI portfolio landing; kept out of sitemap.xml.
    'genetics-audit',
    'iquoto',
    'kokoc-group',
    'privacy',
    // Reached only from the AI portfolio landing; kept out of sitemap.xml.
    'spotless',
    'yandex-turkey',
  ],
  // Nothing to patch — see the note above.
  metadata: null,
}

const petInjectionTracker = {
  id: 'pet-injection-tracker',
  origin: 'https://pet-injection-tracker.netlify.app',
  routes: ['pet-injection-tracker'],
  metadata: {
    path: '/pet-injection-tracker',
    title: 'Pet Injection Tracker - Case Study',
    description:
      'Standalone case study for Pet Injection Tracker, a pet health side project designed to make recurring injections easier to log, share, and follow.',
    openGraphTitle: 'Pet Injection Tracker - Case Study',
    openGraphDescription:
      'Standalone case study for Pet Injection Tracker, a pet health side project designed to make recurring injections easier to log, share, and follow.',
  },
}

/*
 * Origin is a placeholder until the subdomain is confirmed. Routes are the
 * cases the landing links to (keep in step with its cards) plus the privacy
 * page the footer links to; the landing itself is dist-ai/index.html.
 */
const aiPortfolioSite = {
  id: 'ai-portfolio',
  origin: 'https://ai.vberestova.com',
  outDir: 'dist-ai',
  routes: [
    'betboom-pass',
    'cat-app',
    'design-cringe',
    'ds-plugins',
    'genetics-audit',
    'iquoto',
    'kokoc-group',
    'privacy',
    'spotless',
    'yandex-turkey',
  ],
  // The privacy page is reachable but not worth indexing here.
  sitemap: [
    '',
    'spotless',
    'genetics-audit',
    'ds-plugins',
    'cat-app',
    'design-cringe',
    'betboom-pass',
    'yandex-turkey',
    'kokoc-group',
    'iquoto',
  ],
  metadata: {
    path: '/',
    title: aiPortfolio.meta.title,
    description: aiPortfolio.meta.description,
    openGraphTitle: aiPortfolio.meta.title,
    openGraphDescription: aiPortfolio.meta.description,
  },
}

export function resolveDeployTarget(env = process.env) {
  if (env.VITE_AI_ONLY === 'true') {
    return aiPortfolioSite
  }

  return env.VITE_CASE_ONLY === 'true' ? petInjectionTracker : portfolio
}

// Where the build landed: dist/ unless the target builds elsewhere.
export function resolveDistDirectory(target) {
  return new URL(`../${target.outDir ?? 'dist'}/`, import.meta.url)
}
