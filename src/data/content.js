/*
 * Every piece of page content, per language. The `.ru.js` files mirror the
 * English ones export for export, so a page never has to know which language
 * it was handed.
 */
import * as casesEn from './caseStudies.js';
import * as casesRu from './caseStudies.ru.js';
import * as portfolioEn from './portfolioData.js';
import * as portfolioRu from './portfolioData.ru.js';

export const content = {
  en: { ...portfolioEn, ...casesEn },
  ru: { ...portfolioRu, ...casesRu },
};
