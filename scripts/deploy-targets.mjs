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
 */

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

export function resolveDeployTarget(env = process.env) {
  return env.VITE_CASE_ONLY === 'true' ? petInjectionTracker : portfolio
}
