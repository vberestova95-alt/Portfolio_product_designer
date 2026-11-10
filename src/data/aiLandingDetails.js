import dsCard from '../assets/cases/ds-plugins-card.webp';
import dsManager from '../assets/cases/ds-plugins-manager.webp';
import catScreens from '../assets/cases/fluffy-chumb-v2-screens.webp';
import catInjections from '../assets/cases/fluffy-chumb/features/injection-map.webp';
import catHistory from '../assets/cases/fluffy-chumb/features/history.webp';
import catBuilder from '../assets/cases/fluffy-chumb/features/builder.webp';
import catTiles from '../assets/cases/fluffy-chumb/brand/07-tool-tiles.webp';
import cringeScore from '../assets/cases/design-cringe-score.jpg';
import cringeCategories from '../assets/cases/design-cringe-categories.jpg';
import spotlessBrush from '../assets/cases/spotless-brush.webp';
import spotlessUpload from '../assets/cases/spotless-upload.webp';
import geneticsContrast from '../assets/cases/genetics/genetics-audit-contrast.webp';

/*
 * The details the AI landing's swirl shows, by case: square pieces cut from
 * the case screenshots — a button, a chart, a row of chips, a progress bar —
 * so each circle reads as one piece of interface. `crop` is [left, top, side]
 * in the screenshot's own pixels.
 */
export const aiLandingDetails = {
  '/ds-plugins': [
    { src: dsCard, crop: [660, 406, 300] },
    { src: dsManager, crop: [985, 410, 360] },
    { src: dsManager, crop: [10, 180, 280] },
  ],
  '/cat-app': [
    { src: catScreens, crop: [1718, 340, 360] },
    { src: catInjections, crop: [152, 440, 600] },
    { src: catScreens, crop: [2590, 304, 380] },
    { src: catHistory, crop: [124, 493, 640] },
    { src: catBuilder, crop: [1770, 833, 700] },
    { src: catTiles, crop: [171, 21, 175] },
    { src: catBuilder, crop: [2618, 917, 680] },
    { src: catBuilder, crop: [88, 520, 680] },
  ],
  '/design-cringe': [
    { src: cringeScore, crop: [300, 0, 300] },
    { src: cringeCategories, crop: [350, 20, 380] },
    { src: cringeCategories, crop: [1180, 20, 380] },
  ],
  '/spotless': [
    { src: spotlessBrush, crop: [1360, 33, 360] },
    { src: spotlessBrush, crop: [479, 332, 400] },
    { src: spotlessUpload, crop: [599, 297, 460] },
    { src: spotlessBrush, crop: [1360, 352, 360] },
    { src: spotlessUpload, crop: [340, 650, 400] },
  ],
  '/genetics-audit': [
    { src: geneticsContrast, crop: [369, 341, 420] },
    { src: geneticsContrast, crop: [534, 161, 360] },
  ],
};
