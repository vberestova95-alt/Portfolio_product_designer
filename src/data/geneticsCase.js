/**
 * Genetic testing lab: audit and redesign — AI-project case, shown only on the /ai-portfolio landing.
 * Same object shape as spotlessCase.js; sections follow the 8-part case frame from the case guide.
 * Under NDA: the client is never named. Frames are Figma exports with the name, logo, phones,
 * address, licence number, prices, people's photos and publications masked on the raster.
 * Copy is a placeholder until the editor's draft (docs/review/genetics-case/copy.md) is approved;
 * every `[? …]` string is waiting for it.
 */
import geneticsAfter from '../assets/cases/genetics/genetics-after.webp';
import geneticsBacklog from '../assets/cases/genetics/genetics-audit-backlog.webp';
import geneticsContrast from '../assets/cases/genetics/genetics-audit-contrast.webp';
import geneticsMeasurements from '../assets/cases/genetics/genetics-audit-measurements.webp';
import geneticsRedundant from '../assets/cases/genetics/genetics-audit-redundant.webp';
import geneticsUsability from '../assets/cases/genetics/genetics-audit-usability.webp';
import geneticsVerdict from '../assets/cases/genetics/genetics-audit-verdict.webp';
import geneticsBefore from '../assets/cases/genetics/genetics-before.webp';
import geneticsBrandbook from '../assets/cases/genetics/genetics-brandbook-laws.webp';
import geneticsCardImage from '../assets/cases/genetics/genetics-card.webp';
import geneticsHero from '../assets/cases/genetics/genetics-hero.webp';
import geneticsUikit from '../assets/cases/genetics/genetics-uikit.webp';

export const geneticsCaseStudy = {
  slug: 'genetics-audit',
  backHref: '/ai-portfolio',
  hero: {
    title: 'Genetic Testing Lab: Audit & Redesign',
    description: '[? One-line summary: what the product is, my role, the scale.]',
    meta: '[? Client work under NDA / Medical website]',
    image: {
      src: geneticsHero,
      alt: 'Redesigned home page of a genetic testing lab: an offer above search, frequent queries and a trust strip',
    },
    stats: [
      { value: '[? 24]', label: '[? tasks in the audit backlog]' },
      { value: '[? 7 of 17]', label: '[? colour pairs failing WCAG AA]' },
      { value: '[? 5]', label: '[? key screens audited]' },
    ],
    points: ['Figma', '[? tools]'],
  },
  sections: [
    {
      id: 'problem',
      navLabel: 'Problem',
      title: '[? Problem]',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: ['[? Who was hurting and what the business wanted.]'],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsBefore,
            alt: 'Four screens of the original concept side by side: home, catalogue, test page and science service',
          },
        },
      ],
    },
    {
      id: 'context',
      navLabel: 'Context',
      title: '[? Context]',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: ['[? Product, timeline, team, constraints and what I did.]'],
        },
      ],
    },
    {
      id: 'research',
      navLabel: 'Audit',
      title: '[? The Audit]',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: ['[? Method: system audit, Nielsen heuristics, WCAG 2.1 AA.]'],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsVerdict,
            alt: 'Audit verdict: a strong idea with a rough execution, scored from 3 to 9 out of 10 by area',
          },
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsMeasurements,
            alt: 'Measurements across five key screens: font sizes, radii, text styles and colours per screen',
          },
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsContrast,
            alt: 'Contrast table: 17 colour pairs, which fail WCAG AA and what to change',
          },
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsUsability,
            alt: 'Usability findings by screen, ranked from P0 to P2, with the reason and the fix',
          },
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsRedundant,
            alt: 'What felt redundant: thirteen button sets, five near-identical service cards and more',
          },
        },
      ],
    },
    {
      id: 'decisions',
      navLabel: 'Decisions',
      title: '[? Decisions]',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: ['[? From findings to rules: the brand book and UI Kit v2.]'],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsBrandbook,
            alt: 'Five laws of the brand book, each with what is allowed and what is not',
          },
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsUikit,
            alt: 'UI Kit v2: buttons, chips, status badges, fields, fact tiles and service cards',
          },
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsAfter,
            alt: 'The same four screens rebuilt by the brand book rules in concept v4',
          },
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: '[? Result]',
      parts: [
        {
          type: 'featureMedia',
          media: {
            src: geneticsBacklog,
            alt: 'Working backlog: 24 tasks with effect, effort and wave',
          },
        },
        {
          type: 'noteCard',
          title: '[? Not measured yet]',
          items: ['[? What happened next and what we watch.]'],
        },
      ],
    },
    {
      id: 'learned',
      navLabel: 'What I learned',
      title: '[? What I Learned]',
      parts: [
        {
          type: 'noteCard',
          title: '[? Takeaway]',
          items: ['[? 1–3 conclusions in my own words.]'],
        },
      ],
    },
  ],
};

/** Card for the AI-projects group on /ai-portfolio — same shape as an aiProjects.items entry. */
export const geneticsCard = {
  id: 'genetics-audit',
  title: 'Genetic Testing Lab',
  category: 'Audit & Redesign / Medical Website',
  description: '[? One line about the audit and the redesign.]',
  metrics: ['[? 24 tasks]', 'Under NDA'],
  surface: 'lavender',
  image: {
    src: geneticsCardImage,
    alt: 'Redesigned first screen of a genetic testing lab website with an offer and a search field',
  },
  href: '/genetics-audit',
};
