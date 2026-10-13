import React from 'react';
import { useUi } from '../i18n/LanguageContext.jsx';
import { CaseStudyPage } from './BetboomPassPage.jsx';

export function getPetInjectionTrackerCaseStudy(catAppCaseStudy, text) {
  return {
    ...catAppCaseStudy,
    slug: 'pet-injection-tracker',
    hero: {
      ...catAppCaseStudy.hero,
      meta: text.meta,
      description: text.description,
    },
  };
}

export function PetInjectionTrackerPage({ caseStudy, profile }) {
  const text = useUi().pet;
  const standaloneProfile = profile
    ? {
        ...profile,
        name: text.brandName,
        contacts: profile.contacts.filter(
          (contact) => contact.label === 'LinkedIn' || contact.label === 'Dribbble',
        ).sort((left, right) => {
          const order = ['LinkedIn', 'Dribbble'];
          return order.indexOf(left.label) - order.indexOf(right.label);
        }),
        availability: {
          title: text.availabilityTitle,
          paragraphs: [text.availabilityText],
        },
      }
    : null;

  return (
    <CaseStudyPage
      caseStudy={caseStudy}
      cases={[]}
      profile={standaloneProfile}
      headerBrandHref="/pet-injection-tracker"
      showReturnHome={false}
      showSectionBackLink={false}
    />
  );
}
