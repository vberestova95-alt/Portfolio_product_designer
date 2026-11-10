import React, { useEffect } from 'react';
import { aiPortfolio } from './data/aiPortfolio.js';
import { content } from './data/content.js';
import { geneticsCard, geneticsCaseStudy } from './data/geneticsCase.js';
import { spotlessCard, spotlessCaseStudy } from './data/spotlessCase.js';
import { useLanguage, useUi } from './i18n/LanguageContext.jsx';
import { observeReveal } from './lib/reveal.js';
import { attachReturnNavigation } from './lib/returnNavigation.js';
import { AiLandingConcept } from './pages/AiLandingConcept.jsx';
import { AiProjectsConcept } from './pages/AiProjectsConcept.jsx';
import { ExperiencePage } from './pages/ExperiencePage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { CaseStudyPage } from './pages/BetboomPassPage.jsx';
import { DesignConceptsPage } from './pages/DesignConceptsPage.jsx';
import { NotFoundPage } from './pages/ErrorPage.jsx';
import {
  PetInjectionTrackerPage,
  getPetInjectionTrackerCaseStudy,
} from './pages/PetInjectionTrackerPage.jsx';

const CASE_ONLY_MODE = import.meta.env.VITE_CASE_ONLY === 'true';
// The AI portfolio subdomain: the landing at /, plus only the cases it links to.
const AI_ONLY_MODE = import.meta.env.VITE_AI_ONLY === 'true';
const AI_PORTFOLIO_PATH = '/ai-portfolio';
const SPOTLESS_PATH = '/spotless';
const GENETICS_PATH = '/genetics-audit';
// Cases that exist only on the AI landing, keyed by path.
const AI_LANDING_CASES_BY_PATH = {
  [SPOTLESS_PATH]: spotlessCaseStudy,
  [GENETICS_PATH]: geneticsCaseStudy,
};
const CASE_STUDY_KEYS_BY_PATH = {
  '/betboom-pass': 'betboomPassCaseStudy',
  '/betboom-gamification-hub': 'betboomGamificationHubCaseStudy',
  '/cat-app': 'catAppCaseStudy',
  '/iquoto': 'iquotoCaseStudy',
  '/kokoc-group': 'kokocCaseStudy',
  '/yandex-turkey': 'yandexTurkeyCaseStudy',
  '/ds-plugins': 'dsPluginsCaseStudy',
  '/design-cringe': 'designCringeCaseStudy',
};

// Cases that live under the AI projects page: their "more work" block lists
// the other AI projects rather than the main selected work.
const AI_CASE_PATHS = new Set(['/ds-plugins', '/design-cringe']);
const AI_PROJECTS_PATH = '/ai-projects';
const LISTING_PATHS = new Set([AI_PROJECTS_PATH, AI_PORTFOLIO_PATH]);
const EXPERIENCE_PATH = '/experience';
const PRIVACY_PATH = '/privacy';

const DETAIL_PATHS = new Set([
  ...Object.keys(CASE_STUDY_KEYS_BY_PATH),
  '/design-concepts',
  AI_PROJECTS_PATH,
  AI_PORTFOLIO_PATH,
  SPOTLESS_PATH,
  GENETICS_PATH,
  EXPERIENCE_PATH,
  PRIVACY_PATH,
]);
const PET_INJECTION_TRACKER_PATH = '/pet-injection-tracker';

function normalizePathname(pathname) {
  const rawPath = pathname || '/';
  const withoutIndex =
    rawPath === '/index.html' || rawPath.endsWith('/index.html')
      ? rawPath.slice(0, -'/index.html'.length) || '/'
      : rawPath;

  if (withoutIndex !== '/' && withoutIndex.endsWith('/')) {
    return withoutIndex.slice(0, -1);
  }

  return withoutIndex;
}

/*
 * The AI subdomain serves the landing at / and only the cases its cards link
 * to (plus the privacy page the footer links to). Anything else gets the 404.
 */
function getAiOnlyPathname(pathname, cards) {
  if (!AI_ONLY_MODE) {
    return pathname;
  }

  if (pathname === '/' || pathname === AI_PORTFOLIO_PATH) {
    return AI_PORTFOLIO_PATH;
  }

  if (pathname === AI_PROJECTS_PATH) {
    return AI_PROJECTS_PATH;
  }

  const allowed = new Set([...cards.map((item) => item.href), PRIVACY_PATH]);
  return allowed.has(pathname) ? pathname : null;
}

function getPageMetadata(pathname, currentCaseStudy, petCaseStudy, meta) {
  if (pathname === '/') {
    return {
      title: meta.homeTitle,
      description: meta.homeDescription,
    };
  }

  if (pathname === '/design-concepts') {
    return {
      title: meta.conceptsTitle,
      description: meta.conceptsDescription,
    };
  }

  if (pathname === EXPERIENCE_PATH) {
    return {
      title: meta.experienceTitle,
      description: meta.experienceDescription,
    };
  }

  if (pathname === PRIVACY_PATH) {
    return {
      title: meta.privacyTitle,
      description: meta.privacyDescription,
    };
  }

  if (pathname === AI_PROJECTS_PATH) {
    return {
      title: meta.aiProjectsTitle,
      description: meta.aiProjectsDescription,
    };
  }

  if (LISTING_PATHS.has(pathname)) {
    return aiPortfolio.meta;
  }

  if (pathname === PET_INJECTION_TRACKER_PATH) {
    return {
      title: `${petCaseStudy.hero.title} - ${meta.nameSuffix}`,
      description: petCaseStudy.hero.description,
    };
  }

  if (currentCaseStudy) {
    return {
      title: `${currentCaseStudy.hero.title} - ${meta.nameSuffix}`,
      description: currentCaseStudy.hero.description,
    };
  }

  return null;
}

export function App() {
  const { lang } = useLanguage();
  const ui = useUi();
  const {
    achievements,
    additionalAchievements,
    cases,
    clients,
    experiences,
    aiProjects,
    designConceptTeaser,
    designConcepts,
    profile,
    ...caseStudies
  } = content[lang];
  const petInjectionTrackerCaseStudy = getPetInjectionTrackerCaseStudy(
    caseStudies.catAppCaseStudy,
    ui.pet,
  );

  const currentBrowserPathname =
    typeof window === 'undefined' ? '/' : normalizePathname(window.location.pathname);
  const aiWork = [...aiProjects.items, spotlessCard, geneticsCard];
  // The concept pages show frames from each AI case, found by the card's link.
  const aiCaseStudies = {
    '/ds-plugins': caseStudies.dsPluginsCaseStudy,
    '/cat-app': caseStudies.catAppCaseStudy,
    '/design-cringe': caseStudies.designCringeCaseStudy,
    ...AI_LANDING_CASES_BY_PATH,
  };
  const pathname = CASE_ONLY_MODE
    ? PET_INJECTION_TRACKER_PATH
    : getAiOnlyPathname(currentBrowserPathname, aiWork);
  const foundCaseStudy =
    AI_LANDING_CASES_BY_PATH[pathname] ??
    caseStudies[CASE_STUDY_KEYS_BY_PATH[pathname]] ??
    null;
  // On the AI subdomain every way back leads to the landing, which is its home.
  const currentCaseStudy =
    AI_ONLY_MODE && foundCaseStudy ? { ...foundCaseStudy, backHref: '/' } : foundCaseStudy;
  const metadata = getPageMetadata(
    pathname,
    currentCaseStudy,
    petInjectionTrackerCaseStudy,
    ui.meta,
  );

  useEffect(() => observeReveal(), []);

  useEffect(() => {
    if (CASE_ONLY_MODE) {
      return undefined;
    }

    return attachReturnNavigation({
      pathname,
      detailPaths: DETAIL_PATHS,
      listingPaths: LISTING_PATHS,
      normalizePathname,
    });
  }, [pathname]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !CASE_ONLY_MODE ||
      currentBrowserPathname === PET_INJECTION_TRACKER_PATH
    ) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      '',
      `${PET_INJECTION_TRACKER_PATH}${window.location.search}${window.location.hash}`,
    );
  }, [currentBrowserPathname]);

  useEffect(() => {
    if (AI_ONLY_MODE && currentBrowserPathname === AI_PORTFOLIO_PATH) {
      window.history.replaceState(
        window.history.state,
        '',
        `/${window.location.search}${window.location.hash}`,
      );
    }
  }, [currentBrowserPathname]);

  useEffect(() => {
    if (!metadata) {
      return;
    }

    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const openGraphTitle = document.querySelector('meta[property="og:title"]');
    const openGraphDescription = document.querySelector('meta[property="og:description"]');
    const openGraphUrl = document.querySelector('meta[property="og:url"]');
    const siteOrigin =
      typeof window === 'undefined' ? 'https://vberestova.com' : window.location.origin;
    const canonicalPath = AI_ONLY_MODE && pathname === AI_PORTFOLIO_PATH ? '/' : pathname;
    const canonicalUrl = `${siteOrigin}${canonicalPath}`;

    document.title = metadata.title;
    description?.setAttribute('content', metadata.description);
    canonical?.setAttribute('href', canonicalUrl);
    openGraphTitle?.setAttribute('content', metadata.title);
    openGraphDescription?.setAttribute('content', metadata.description);
    openGraphUrl?.setAttribute('content', canonicalUrl);
  }, [metadata?.title, metadata?.description, pathname]);

  if (pathname === '/design-concepts') {
    return <DesignConceptsPage archive={designConcepts} profile={profile} />;
  }

  if (pathname === EXPERIENCE_PATH) {
    return <ExperiencePage experiences={experiences} profile={profile} />;
  }

  if (pathname === PRIVACY_PATH) {
    return <PrivacyPage profile={profile} />;
  }

  // Concept (feat/37): the AI projects ring and the landing are two pages again.
  if (pathname === AI_PROJECTS_PATH) {
    return (
      <AiProjectsConcept
        intro={aiProjects.intro}
        projects={aiWork}
        caseStudies={aiCaseStudies}
        profile={profile}
        standalone={AI_ONLY_MODE}
      />
    );
  }

  if (pathname === AI_PORTFOLIO_PATH) {
    return (
      <AiLandingConcept
        page={aiPortfolio}
        projects={aiWork}
        caseStudies={aiCaseStudies}
        profile={profile}
        standalone={AI_ONLY_MODE}
      />
    );
  }

  if (pathname === PET_INJECTION_TRACKER_PATH) {
    return (
      <PetInjectionTrackerPage caseStudy={petInjectionTrackerCaseStudy} profile={profile} />
    );
  }

  if (currentCaseStudy) {
    return (
      <CaseStudyPage
        caseStudy={currentCaseStudy}
        cases={
          AI_ONLY_MODE || pathname in AI_LANDING_CASES_BY_PATH
            ? aiWork
            : AI_CASE_PATHS.has(pathname)
              ? aiProjects.items
              : cases
        }
        profile={profile}
        showReturnHome={!AI_ONLY_MODE}
      />
    );
  }

  if (pathname !== '/') {
    return <NotFoundPage />;
  }

  return (
    <HomePage
      profile={profile}
      cases={cases}
      aiProjects={aiProjects}
      designConceptTeaser={designConceptTeaser}
      designConcepts={designConcepts}
      achievements={achievements}
      additionalAchievements={additionalAchievements}
      experiences={experiences}
      clients={clients}
    />
  );
}
