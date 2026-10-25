import React, { useEffect } from 'react';
import { content } from './data/content.js';
import { useLanguage, useUi } from './i18n/LanguageContext.jsx';
import { observeReveal } from './lib/reveal.js';
import { attachReturnNavigation } from './lib/returnNavigation.js';
import { AiProjectsPage } from './pages/AiProjectsPage.jsx';
import { ExperiencePage } from './pages/ExperiencePage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { CaseStudyPage } from './pages/BetboomPassPage.jsx';
import { DesignConceptsPage } from './pages/DesignConceptsPage.jsx';
import { NotFoundPage } from './pages/ErrorPage.jsx';
import {
  PetInjectionTrackerPage,
  getPetInjectionTrackerCaseStudy,
} from './pages/PetInjectionTrackerPage.jsx';

const CASE_ONLY_MODE = import.meta.env.VITE_CASE_ONLY === 'true';
const CASE_STUDY_KEYS_BY_PATH = {
  '/betboom-pass': 'betboomPassCaseStudy',
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
const LISTING_PATHS = new Set([AI_PROJECTS_PATH]);
const EXPERIENCE_PATH = '/experience';

const DETAIL_PATHS = new Set([
  ...Object.keys(CASE_STUDY_KEYS_BY_PATH),
  '/design-concepts',
  AI_PROJECTS_PATH,
  EXPERIENCE_PATH,
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

  if (pathname === AI_PROJECTS_PATH) {
    return {
      title: meta.aiProjectsTitle,
      description: meta.aiProjectsDescription,
    };
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
  const pathname = CASE_ONLY_MODE ? PET_INJECTION_TRACKER_PATH : currentBrowserPathname;
  const currentCaseStudy = caseStudies[CASE_STUDY_KEYS_BY_PATH[pathname]] ?? null;
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
    const canonicalUrl = `${siteOrigin}${pathname === '/' ? '/' : pathname}`;

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

  if (pathname === AI_PROJECTS_PATH) {
    return <AiProjectsPage archive={aiProjects} profile={profile} />;
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
        cases={AI_CASE_PATHS.has(pathname) ? aiProjects.items : cases}
        profile={profile}
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
