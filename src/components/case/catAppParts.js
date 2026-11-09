import { CatBeforeAfterPairs } from './CatBeforeAfterPairs.jsx';
import { CatCollapsibleMedia } from './CatCollapsibleMedia.jsx';
import './catAppParts.css';

/*
 * Case part types only the cat app uses, by `type`. SectionPart looks a part up
 * here before its own types, so these live outside the shared case page.
 */
export const catAppParts = {
  beforeAfterPairs: CatBeforeAfterPairs,
  collapsibleMedia: CatCollapsibleMedia,
};
