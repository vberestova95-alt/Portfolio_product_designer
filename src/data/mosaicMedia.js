/*
 * The photos the mosaic backgrounds are made of (lib/heroMosaic.js) — shared by
 * the home hero, its AI-projects card and the AI projects page.
 */
const FILM_PHOTO_FILES = import.meta.glob('../assets/film/*.jpg', {
  eager: true,
  import: 'default',
});

// The game's photos: photos of me, the warm red-and-yellow shots, and the
// cloudy mountains.
const PHOTO_NAMES =
  /\/(me-(?!board|portrait)[^/]+|flowers-pink|lemons|yellow-car|sneakers-color|blossom-branch|mountains-fog|mountains-ridge|hike-poles)\.jpg$/;

export const MOSAIC_PHOTOS = Object.entries(FILM_PHOTO_FILES)
  .filter(([path]) => PHOTO_NAMES.test(path))
  .map(([, src]) => src);
