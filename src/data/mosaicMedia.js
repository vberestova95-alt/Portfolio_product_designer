import profilePhoto from '../assets/profile-photo.jpg';

/*
 * The photos the mosaic backgrounds are made of (lib/heroMosaic.js) — shared by
 * the home hero, its AI-projects card and the AI projects page.
 */
const FILM_PHOTO_FILES = import.meta.glob('../assets/film/*.jpg', {
  eager: true,
  import: 'default',
});

// Photos of me (files named me-*), bar the snowboard one in the lilac jacket
// and the close portrait.
const PHOTOS_OF_ME = Object.entries(FILM_PHOTO_FILES)
  .filter(([path]) => /\/me-(?!board|portrait)[^/]+$/.test(path))
  .map(([, src]) => src);

/*
 * The scenes set in letters and blurred in motion across the whole block. The
 * portrait leads; its face is pinned to the right part, clear of the copy.
 */
export const MOSAIC_SCENES = [
  { src: profilePhoto, fx: 0.42, fy: 0.44, tx: 0.74, ty: 0.42 },
  ...PHOTOS_OF_ME.map((src) => ({ src, fx: 0.5, fy: 0.4, tx: 0.74, ty: 0.42 })),
];

// The game's photos: photos of me, the warm red-and-yellow shots, and the
// cloudy mountains.
const PHOTO_NAMES =
  /\/(me-(?!board|portrait)[^/]+|flowers-pink|lemons|yellow-car|sneakers-color|blossom-branch|mountains-fog|mountains-ridge|hike-poles)\.jpg$/;

export const MOSAIC_PHOTOS = Object.entries(FILM_PHOTO_FILES)
  .filter(([path]) => PHOTO_NAMES.test(path))
  .map(([, src]) => src);
