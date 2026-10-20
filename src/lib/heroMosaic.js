/*
 * The hero's background: the panel cut into rounded squares, and a small logic
 * game in its right part.
 *
 * The game: three mosaics of 2×2 squares. Each piece is a cube with three
 * faces — a quarter of one film photo as it is, the same quarter set in
 * letters, and in black and white. A click rolls the piece — and the next piece
 * round the mosaic, clockwise — on to its next face, so the order of the
 * clicks matters. Bring all four to the same face and the mosaic is whole: the
 * photo, or its letters, or its motion take, depending on the way there. It lights
 * up, holds, and rolls over into the next photo, shuffled anew. Left alone for
 * a while, the mosaics solve themselves, one move at a time, so the idea shows.
 *
 * Around them, the squares show the same photo of me in two takes — set in the
 * letters of my name and role, or in black and white — or stay black, and trade
 * places on a slow timer. Every change is a cube turn in perspective: the old
 * face rolls away as the new one rolls in, the far edge shrinking back and
 * both faces shaded by their angle, so the squares read as solid. A solved
 * mosaic turns over whole, as one big cube, into its next photo.
 *
 * Everything is one canvas. The letter and dot renderings of a scene are drawn
 * once, panel-sized, into offscreen layers; a square is then a crop of a layer
 * or a quarter of a photo, so a frame only redraws the squares in motion.
 *
 * The composition leans right: the mosaics sit there, while the left part —
 * under the copy — keeps to letters and empty ground and sits darker, so the
 * copy keeps its contrast without a hard edge around it. On a phone the copy
 * is at the foot, so the shade rises from the bottom instead.
 *
 * Held still: the squares behind the top row stay empty, the summary sits in a
 * plate cut to the grid just above the headline (three squares wide on a
 * desktop, the full row on a phone), and a few more are kept empty for air.
 */

const WORD = 'VLADISLAVA BERESTOVA · PRODUCT DESIGNER ';
const GROUND = '#06080d';

/*
 * The grey squares (the `tones` option): flat faces, one a grey just off the
 * ground, the other a tone up.
 */
export const PLAIN_TONES = ['#12161c', '#20242b'];

// The same squares for a white block (`theme: 'light'`): a grey just off white, and a tone down.
export const LIGHT_TONES = ['#f2f4f8', '#e7eaf0'];

/*
 * Squares left empty for good on a desktop, for air in the pattern: [row,
 * column], where a negative row counts from the bottom and a column is a share
 * of the width (0 the first, 1 the last). Row 0 is the empty one behind the
 * nav. The mosaics take precedence where they overlap.
 */
export const EMPTY_SQUARES = [
  [1, 2 / 9],
  [1, 5 / 9],
  [1, 8 / 9],
  [1, 1],
  [2, 2 / 9],
  [2, 0.35],
  [2, 0.8],
  [-2, 0.6],
  [-1, 0.9],
];

// Unhurried: a turn reads as a solid cube rolling over, not a flicker.
const TURN_MS = 1400;
const CLICK_TURN_MS = 1000;
const BOARD_FLIP_MS = 1900;
const SWAP_EVERY_MS = 1600;
const SCENE_EVERY_MS = 18000;
const AUTO_EVERY_MS = 3400;
const IDLE_BEFORE_AUTO_MS = 8000;
const SOLVED_HOLD_MS = 1700;
const GLOW_MS = 1500;
const LIGHT_TURN_MS = 900;
const LIGHT_HOLD_MS = 2600;

// The cube turn is drawn in strips, each set at its own depth.
const TURN_STRIPS = 28;

// Up to three mosaics, each two squares a side.
const MAX_BOARDS = 3;

/*
 * Squares are rounded and set only a hair apart, so the grid reads as one
 * surface. A mosaic's pieces round only their outer corners, so the four read
 * as one cube.
 */
const tileGap = (compact) => (compact ? 2 : 3);
const tileRadius = (compact) => (compact ? 10 : 14);
const INNER_RADIUS = 3;

// A piece's faces, in the order a click rolls through them.
const SIDES = ['photo', 'text', 'motion'];

/*
 * A mosaic's four pieces, in turn order round the square: top left, top right,
 * bottom right, bottom left. [row, column] inside the mosaic.
 */
const RING = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0],
];

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

function pickWeighted(weights) {
  let roll = Math.random() * Object.values(weights).reduce((sum, w) => sum + w, 0);

  for (const [key, weight] of Object.entries(weights)) {
    roll -= weight;

    if (roll <= 0) {
      return key;
    }
  }

  return Object.keys(weights)[0];
}

function shuffle(list) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/* ------------------------------------------------------------- the puzzle */

// A click on piece i rolls it and the next piece round the ring on one face.
function applyMove(sides, i) {
  const next = [...sides];
  next[i] = (next[i] + 1) % SIDES.length;
  next[(i + 1) % 4] = (next[(i + 1) % 4] + 1) % SIDES.length;
  return next;
}

// Whole when all four show the same face — any of the three.
const isSolved = (sides) => sides.every((side) => side === sides[0]);
const encode = (sides) => sides.reduce((code, side) => code * SIDES.length + side, 0);

// The first move of a shortest solution — 81 states, so a plain search.
function nextBestMove(sides) {
  const seen = new Set([encode(sides)]);
  let frontier = [{ sides, first: -1 }];

  while (frontier.length) {
    const following = [];

    for (const { sides: state, first } of frontier) {
      for (let i = 0; i < 4; i += 1) {
        const moved = applyMove(state, i);
        const head = first === -1 ? i : first;

        if (isSolved(moved)) {
          return head;
        }

        const code = encode(moved);

        if (!seen.has(code)) {
          seen.add(code);
          following.push({ sides: moved, first: head });
        }
      }
    }

    frontier = following;
  }

  return 0;
}

// Shuffled by moves from a whole mosaic, so every deal can be solved.
function scramble() {
  let sides = [0, 0, 0, 0];
  let moves = 0;

  while (moves < 3 || isSolved(sides)) {
    sides = applyMove(sides, (Math.random() * 4) | 0);
    moves += 1;
  }

  return sides;
}

/* ------------------------------------------------------------- the layers */

/*
 * Cover-fits the scene to the panel, placing the photo's focus point (fx, fy,
 * as fractions of the photo) at (tx, ty) of the panel as far as the crop allows.
 */
function drawScene(ctx, w, h, scene) {
  const { img, fx = 0.5, fy = 0.4, tx = 0.5, ty = 0.3 } = scene;
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = Math.min(0, Math.max(w - dw, tx * w - fx * dw));
  const dy = Math.min(0, Math.max(h - dh, ty * h - fy * dh));

  ctx.drawImage(img, dx, dy, dw, dh);
}

function sampleScene(scene, cols, rows) {
  const probe = document.createElement('canvas');
  probe.width = cols;
  probe.height = rows;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  drawScene(ctx, cols, rows, scene);
  return ctx.getImageData(0, 0, cols, rows).data;
}

// Lifts the photo's colour so the letters read on the near-black ground.
function tone(data, i, gain) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const k = gain * (0.55 + lum * 0.7);

  return {
    lum,
    color: `${Math.min(255, r * k) | 0},${Math.min(255, g * k) | 0},${Math.min(255, b * k) | 0}`,
  };
}

function makeLayer(w, h, dpr) {
  const layer = document.createElement('canvas');
  layer.width = Math.round(w * dpr);
  layer.height = Math.round(h * dpr);
  const ctx = layer.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, w, h);
  return { layer, ctx };
}

// The site's own caps: Manrope, semibold, tracked out.
const TEXT_WEIGHT = 600;
const textFont = (size) => `${TEXT_WEIGHT} ${size}px Manrope, system-ui, sans-serif`;

function buildTextLayer(scene, w, h, dpr, compact) {
  const { layer, ctx } = makeLayer(w, h, dpr);
  const size = compact ? 9 : 12;
  const tracking = size * 0.14;
  const lineH = size * 1.9;
  const rows = Math.ceil(h / lineH);

  ctx.font = textFont(size);
  ctx.textBaseline = 'top';

  // A proportional face, so each glyph advances by its own width; the photo is
  // sampled on a fine grid and read at each glyph's centre.
  const advance = {};
  for (const char of new Set(WORD)) {
    advance[char] = ctx.measureText(char).width + tracking;
  }

  const sampleStep = compact ? 3 : 4;
  const sampleCols = Math.ceil(w / sampleStep);
  const data = sampleScene(scene, sampleCols, rows);

  for (let row = 0; row < rows; row += 1) {
    // Each line starts further into the word, so the columns don't stack.
    let index = (row * 7) % WORD.length;
    let x = -((row * 23) % 60);

    while (x < w) {
      const char = WORD[index % WORD.length];
      const width = advance[char];
      index += 1;

      if (char !== ' ' && x + width > 0) {
        const col = Math.min(sampleCols - 1, Math.max(0, Math.floor((x + width / 2) / sampleStep)));
        const { lum, color } = tone(data, (row * sampleCols + col) * 4, 1.15);
        // Contrast is pushed so the photo still reads through the letters.
        ctx.fillStyle = `rgba(${color},${(0.08 + 0.92 * lum ** 1.5).toFixed(3)})`;
        ctx.fillText(char, x, row * lineH + (lineH - size) / 2);
      }

      x += width;
    }
  }

  return layer;
}

/*
 * The motion take: the photo in black and white with a touch more contrast —
 * no smear, no grain.
 */
function buildMotionLayer(scene, w, h, dpr) {
  const { layer, ctx } = makeLayer(w, h, dpr);
  ctx.filter = 'grayscale(1) contrast(1.1)';
  drawScene(ctx, w, h, scene);
  ctx.filter = 'none';
  return layer;
}

/* ------------------------------------------------------------------ mosaic */

/*
 * Options beyond the media: `copy` and `anchor` place the summary's plate
 * above the headline; `header` keeps the row behind a nav empty; `shade(xf,
 * yf, compact)` says how much a square at that point of the block sits under
 * copy (0–1) — the home hero's own lean is the default; `emptySquares` are the
 * squares held empty (EMPTY_SQUARES on the home page); `maxBoards` caps the
 * game's mosaics (0 for none). With no `scenes`, the faces are plain — the
 * letters and the black-and-white take set on a soft grey ground of their own, no photo in
 * them. `reveal: 'hover'` leaves the block black until the pointer passes:
 * the squares under it roll over into faces and roll back a while later.
 * `tones: [a, b]` swaps both faces for flat colours — no photo, no letters.
 * `theme: 'light'` sets the squares on white: white ground and gaps, the copy's
 * shade fading to white, a lighter shade on a turn.
 *
 * `assemble: true` turns the mosaics into a hover piece: they sit as plain
 * squares, and while the pointer is over the block their pieces roll over one
 * by one into a photo, falling apart again once it leaves — the next photo
 * from the deck each time. `below` (an element) keeps the mosaics under it.
 *
 * `count: n` lights only n squares, at random, the rest left empty: never
 * side by side and no more than two to a row, so they scatter rather than line
 * up. Now and then one of them moves to a fresh spot.
 */
export function attachHeroMosaic(
  canvas,
  {
    scenes = [],
    photos = [],
    copy,
    anchor,
    header,
    shade,
    emptySquares = [],
    maxBoards = MAX_BOARDS,
    reveal = 'always',
    tones = null,
    theme = 'dark',
    assemble = false,
    below = null,
    count = 0,
  },
) {
  if (!canvas) {
    return undefined;
  }

  const hoverOnly = reveal === 'hover';
  const light = theme === 'light';
  const ground = light ? '#ffffff' : GROUND;
  const copyShade = light ? '255,255,255' : '6,8,13';
  // A turning face darkens as it goes edge-on; on white, only a little.
  const turnShade = light ? 0.35 : 1;
  const pointerTarget = hoverOnly ? canvas.parentElement : canvas;

  const host = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loadedScenes = [];
  let deck = [];
  let sceneIndex = 0;
  let layers = null;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let size = 0;
  let cols = 0;
  let rows = 0;
  let tiles = [];
  let boards = [];
  let headerBottom = 0;
  let hover = null;
  let lastPlay = 0;

  let frame = 0;
  let swapTimer = 0;
  let sceneTimer = 0;
  let autoTimer = 0;
  let resizeTimer = 0;
  const pending = new Set();
  let visible = true;
  let destroyed = false;

  // Matches the stylesheet's phone block (max-width: 640px).
  const compact = () => width <= 640;
  const tileAt = (row, col) => tiles[row * cols + col];

  function later(fn, ms) {
    const id = window.setTimeout(() => {
      pending.delete(id);

      if (!destroyed) {
        fn();
      }
    }, ms);
    pending.add(id);
  }

  /* ---------------------------------------------------------------- faces */

  // How much a square belongs to the copy's side of the panel: 1 under the
  // copy at the bottom left, 0 in the right part.
  function copyWeight(tile) {
    const xf = ((tile.col + 0.5) * size) / width;
    const yf = ((tile.row + 0.5) * size) / height;

    if (shade) {
      return shade(xf, yf, compact());
    }

    if (compact()) {
      return smoothstep(0.35, 0.62, yf);
    }

    // The headline runs most of the width along the floor, so that band counts too.
    const left = (1 - smoothstep(0.3, 0.64, xf)) * (0.5 + 0.5 * smoothstep(0.2, 0.7, yf));
    const floor = 0.9 * smoothstep(0.6, 0.78, yf);

    return Math.max(left, floor);
  }

  // Letters, the motion take or black ground — never the same as the square has now.
  function ambientFace(tile) {
    const weights = tile.copy > 0.5 ? { text: 4.5, void: 3.5, motion: 0.8 } : { text: 3, motion: 2.4, void: 1.4 };
    const current = tile.to?.kind;
    const kind = pickWeighted(current in weights ? { ...weights, [current]: 0 } : weights);

    return { kind };
  }

  /* -------------------------------------------------------------- drawing */

  /*
   * A square's cell, snapped to whole device pixels. Squares are a fractional
   * size, and an unsnapped clear leaves half-cleared pixels on the edges, where
   * each frame's seam would pile up into a bright line.
   */
  function cellRect(tile) {
    const snap = (v) => Math.round(v * dpr) / dpr;
    const x = snap(tile.col * size);
    const y = snap(tile.row * size);

    return { x, y, w: snap((tile.col + 1) * size) - x, h: snap((tile.row + 1) * size) - y };
  }

  // The tile inside its cell: half the gap off each side.
  function innerBox(cell) {
    const half = tileGap(compact()) / 2;
    return { x: cell.x + half, y: cell.y + half, w: cell.w - half * 2, h: cell.h - half * 2 };
  }

  // A piece rounds only the corner on the mosaic's outside.
  function radiiFor(tile) {
    const R = tileRadius(compact());

    if (!tile.board || (assemble && !tile.board.assembled)) {
      return R;
    }

    const radii = [INNER_RADIUS, INNER_RADIUS, INNER_RADIUS, INNER_RADIUS];
    radii[tile.slot] = R; // slots run TL, TR, BR, BL — the order roundRect takes too
    return radii;
  }

  const isEmpty = (face) => !face || face.kind === 'void' || face.kind === 'blank';

  /*
   * Draws a face into `dest` on `g` (the panel by default). `src` is the
   * tile's own box on the panel — layers are cropped there.
   */
  function paintFace(face, src, dest, g = ctx) {
    if (!face || dest.w <= 0.2 || dest.h <= 0.2) {
      return;
    }

    if (isEmpty(face)) {
      g.fillStyle = ground;
      g.fillRect(dest.x, dest.y, dest.w, dest.h);
      return;
    }

    if (face.kind === 'piece') {
      // An assembling piece carries its photo, so a re-deal mid-turn leaves it be.
      const { faces } = face.board;
      const img = face.img ?? face.board.img;
      const [pr, pc] = RING[face.slot];

      if (!img) {
        return;
      }

      // The photo face: a quarter of the photo's centred square, in colour.
      if (SIDES[face.side] === 'photo') {
        const side = Math.min(img.width, img.height);
        const half = side / 2;
        g.drawImage(
          img,
          (img.width - side) / 2 + pc * half,
          (img.height - side) / 2 + pr * half,
          half,
          half,
          dest.x,
          dest.y,
          dest.w,
          dest.h,
        );
        return;
      }

      // Letters or motion: a quarter of the mosaic's own rendering of the photo.
      const layer = faces?.[SIDES[face.side]];

      if (layer) {
        const quarter = layer.width / 2;
        g.drawImage(layer, pc * quarter, pr * quarter, quarter, quarter, dest.x, dest.y, dest.w, dest.h);
      }

      return;
    }

    const layer = face.layer ?? layers?.[face.kind];

    if (layer) {
      g.drawImage(layer, src.x * dpr, src.y * dpr, src.w * dpr, src.h * dpr, dest.x, dest.y, dest.w, dest.h);
    }
  }

  // Two scratch canvases a turning square paints its faces into.
  const scratch = [document.createElement('canvas'), document.createElement('canvas')];

  function faceTexture(face, box, index, radii) {
    const tex = scratch[index];
    const w = Math.max(1, Math.round(box.w * dpr));
    const h = Math.max(1, Math.round(box.h * dpr));

    if (tex.width !== w || tex.height !== h) {
      tex.width = w;
      tex.height = h;
    }

    const g = tex.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, box.w, box.h);

    // Rounded like the tile itself, so the whole tile turns, corners and all.
    if (radii !== undefined) {
      g.save();
      g.beginPath();
      g.roundRect(0, 0, box.w, box.h, radii);
      g.clip();
    }

    paintFace(face, box, { x: 0, y: 0, w: box.w, h: box.h }, g);

    if (radii !== undefined) {
      g.restore();
    }

    return tex;
  }

  /*
   * The tile flip: the whole square turns over about its middle, in
   * perspective — the near edge swells, the far one shrinks back — showing its
   * old face for the first half of the turn and its new face for the second,
   * darkening as it turns edge-on. Drawn in strips, each scaled by its depth.
   */
  function paintFlip(texA, texB, box, t, axis) {
    const theta = t * Math.PI;
    const firstHalf = theta < Math.PI / 2;
    const tex = firstHalf ? texA : texB;
    const angle = firstHalf ? theta : theta - Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    if (!tex || Math.abs(cos) < 0.01) {
      return;
    }

    const across = axis === 'y' ? box.h : box.w;
    const breadth = axis === 'y' ? box.w : box.h;
    const s = across / 2;
    const depth = across * 2.4;
    const centre = axis === 'y' ? box.y + box.h / 2 : box.x + box.w / 2;
    const middle = axis === 'y' ? box.x + box.w / 2 : box.y + box.h / 2;
    const tw = tex.width;
    const th = tex.height;
    const shadeAlpha = 0.6 * Math.abs(sin);

    for (let i = 0; i < TURN_STRIPS; i += 1) {
      const k0 = i / TURN_STRIPS;
      const k1 = (i + 1) / TURN_STRIPS;
      const u0 = -s + 2 * s * k0;
      const u1 = -s + 2 * s * k1;
      // Kept within the square at full swell, so the turn never spills.
      const f0 = Math.min(1.08, depth / (depth - u0 * sin));
      const f1 = Math.min(1.08, depth / (depth - u1 * sin));
      const a0 = centre + u0 * cos * f0;
      const a1 = centre + u1 * cos * f1;
      const lo = Math.min(a0, a1);
      const run = Math.abs(a1 - a0) + 0.6;
      const span = breadth * ((f0 + f1) / 2);

      if (axis === 'y') {
        ctx.drawImage(tex, 0, k0 * th, tw, (k1 - k0) * th, middle - span / 2, lo, span, run);
      } else {
        ctx.drawImage(tex, k0 * tw, 0, (k1 - k0) * tw, th, lo, middle - span / 2, run, span);
      }
    }

    // The turn's shade, kept to the tile's own outline as it turns.
    if (shadeAlpha > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(0,0,0,${(shadeAlpha * turnShade).toFixed(3)})`;
      ctx.fillRect(box.x - 20, box.y - 20, box.w + 40, box.h + 40);
      ctx.restore();
    }
  }

  /*
   * The cube turn in perspective. The square is the front of a cube; it
   * rotates about its centre, the old face rolling away (left, or up) as the
   * next one rolls in. Each face is drawn in thin strips, each scaled by its
   * depth, so the far edge shrinks back; the cube eases back a little mid-turn
   * so its leading corner stays inside the square, and each face is shaded by
   * how far it has turned from the viewer.
   */
  function paintCube(texA, texB, box, t, axis) {
    const phi = (t * Math.PI) / 2;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    const across = axis === 'y' ? box.h : box.w;
    const breadth = axis === 'y' ? box.w : box.h;
    const s = across / 2;
    const depth = across * 1.5;
    const ease = 1 - 0.2 * Math.sin(2 * phi);
    const centre = axis === 'y' ? box.y + box.h / 2 : box.x + box.w / 2;
    const middle = axis === 'y' ? box.x + box.w / 2 : box.y + box.h / 2;

    const faces = [
      // Front face: points (u, s), u from -s to s.
      {
        tex: texA,
        shown: phi < Math.PI / 2 - 1e-3,
        point: (k) => {
          const u = -s + 2 * s * k;
          return [u * cos - s * sin, u * sin + s * cos];
        },
        shade: 0.78 * (1 - cos),
      },
      // The next face, on the far side of the leading edge: points (s, v).
      {
        tex: texB,
        shown: phi > 1e-3,
        point: (k) => {
          const v = s - 2 * s * k;
          return [s * cos - v * sin, s * sin + v * cos];
        },
        shade: 0.78 * (1 - sin),
      },
    ];

    for (const face of faces) {
      if (!face.shown || !face.tex) {
        continue;
      }

      const tw = face.tex.width;
      const th = face.tex.height;

      for (let i = 0; i < TURN_STRIPS; i += 1) {
        const k0 = i / TURN_STRIPS;
        const k1 = (i + 1) / TURN_STRIPS;
        const [x0, z0] = face.point(k0);
        const [x1, z1] = face.point(k1);
        // Never larger than the square itself, so nothing spills past it.
        const f0 = Math.min(1, (depth / (depth + (s - z0))) * ease);
        const f1 = Math.min(1, (depth / (depth + (s - z1))) * ease);
        const a0 = centre + x0 * f0;
        const a1 = centre + x1 * f1;

        if (a1 - a0 < 0.05) {
          continue;
        }

        const span = breadth * ((f0 + f1) / 2);
        // A hair of overlap so the strips close up without seams.
        const run = a1 - a0 + 0.6;

        if (axis === 'y') {
          ctx.drawImage(face.tex, 0, k0 * th, tw, (k1 - k0) * th, middle - span / 2, a0, span, run);
        } else {
          ctx.drawImage(face.tex, k0 * tw, 0, (k1 - k0) * tw, th, a0, middle - span / 2, run, span);
        }

        if (face.shade > 0.01) {
          ctx.fillStyle = `rgba(0,0,0,${(face.shade * turnShade).toFixed(3)})`;

          if (axis === 'y') {
            ctx.fillRect(middle - span / 2, a0, span, run);
          } else {
            ctx.fillRect(a0, middle - span / 2, run, span);
          }
        }
      }
    }
  }

  function isHovered(tile) {
    if (!hover || tile.board !== hover.board) {
      return false;
    }

    return tile.slot === hover.slot || tile.slot === (hover.slot + 1) % 4;
  }

  // Returns true while the square still has something moving to draw.
  function drawTile(tile, now) {
    const cell = cellRect(tile);
    const box = innerBox(cell);
    const t = tile.start ? Math.min(1, Math.max(0, (now - tile.start) / tile.duration)) : 1;
    const turning = tile.start && t < 1 && tile.from;

    // The cell's ground (the gaps between tiles), then the tile clipped to its rounding.
    ctx.globalAlpha = 1;
    ctx.fillStyle = ground;
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);

    if (tile.held) {
      tile.start = 0;
      tile.from = null;
      return false;
    }

    ctx.save();
    ctx.beginPath();

    if (turning) {
      // Mid-turn the tile is free of its outline — kept only to its own cell —
      // so the square itself is seen to turn over.
      ctx.rect(cell.x, cell.y, cell.w, cell.h);
      ctx.clip();

      const radii = radiiFor(tile);
      // The tile is a cube: its face, rounded corners and all, rolls away
      // over the edge as the next face of the cube rolls in.
      paintCube(
        faceTexture(tile.from, box, 0, radii),
        faceTexture(tile.to, box, 1, radii),
        box,
        easeInOut(t),
        tile.axis,
      );
    } else {
      ctx.roundRect(box.x, box.y, box.w, box.h, radiiFor(tile));
      ctx.clip();
      paintFace(tile.to, box, box);
    }

    // The copy's shade; the mosaics take only a little of it.
    const shade = 0.72 * tile.copy * (tile.board ? 0.4 : 1);

    if (shade > 0.01) {
      ctx.fillStyle = `rgba(${copyShade},${Math.min(0.88, shade).toFixed(3)})`;
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }

    // No outlines anywhere: a solved mosaic flashes warm light over its pieces,
    // and the pieces a click would turn lift a little under the pointer.
    let glowing = false;

    if (tile.board?.glowStart) {
      const g = (now - tile.board.glowStart) / GLOW_MS;

      if (g >= 0 && g < 1) {
        ctx.fillStyle = `rgba(255,236,196,${(0.32 * (1 - g) ** 2).toFixed(3)})`;
        ctx.fillRect(box.x, box.y, box.w, box.h);
      }

      glowing = g < 1;
    }

    if (isHovered(tile) && !turning) {
      ctx.fillStyle = 'rgba(247,248,252,0.12)';
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }

    ctx.restore();

    if (tile.start && t >= 1) {
      tile.start = 0;
      tile.from = null;
    }

    return Boolean(tile.start) || glowing;
  }

  /* ------------------------------------------------------ whole-mosaic turn */

  // The mosaic's box on the panel: from its first piece's tile to its third's.
  function boardBox(board) {
    const a = innerBox(cellRect(board.cells[0]));
    const c = innerBox(cellRect(board.cells[2]));
    return { x: a.x, y: a.y, w: c.x + c.w - a.x, h: c.y + c.h - a.y };
  }

  // The mosaic as it stands, drawn into a canvas of its own — rounded pieces
  // and gaps included — so it can turn over as one.
  function boardTexture(board) {
    const box = boardBox(board);
    const tex = document.createElement('canvas');
    tex.width = Math.max(1, Math.round(box.w * dpr));
    tex.height = Math.max(1, Math.round(box.h * dpr));
    const g = tex.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    board.cells.forEach((tile) => {
      const own = innerBox(cellRect(tile));
      const local = { x: own.x - box.x, y: own.y - box.y, w: own.w, h: own.h };

      g.save();
      g.beginPath();
      g.roundRect(local.x, local.y, local.w, local.h, radiiFor(tile));
      g.clip();
      paintFace(tile.to, own, local, g);
      g.restore();
    });

    return tex;
  }

  function drawBoardFlip(board, now) {
    const { flip } = board;
    const t = Math.min(1, Math.max(0, (now - flip.start) / flip.duration));

    const first = cellRect(board.cells[0]);
    const last = cellRect(board.cells[2]);
    const area = { x: first.x, y: first.y, w: last.x + last.w - first.x, h: last.y + last.h - first.y };

    ctx.fillStyle = ground;
    ctx.fillRect(area.x, area.y, area.w, area.h);

    // Kept to the mosaic's own cells, so no frame of the turn is left behind outside them.
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.w, area.h);
    ctx.clip();
    paintCube(flip.from, flip.to, boardBox(board), easeInOut(t), flip.axis);
    ctx.restore();

    if (t < 1) {
      return true;
    }

    // Landed: the pieces take over again, and the new photo is in play.
    board.flip = null;
    board.locked = false;
    board.cells.forEach((tile) => {
      tile.dirty = true;
    });
    return true;
  }

  function render(now) {
    frame = 0;
    let moving = false;

    for (const board of boards) {
      if (board.flip) {
        moving = drawBoardFlip(board, now) || moving;
      }
    }

    for (const tile of tiles) {
      if (tile.board?.flip) {
        continue;
      }

      if (tile.start || tile.dirty || tile.board?.glowStart) {
        tile.dirty = false;
        moving = drawTile(tile, now) || moving;
      }
    }

    if (moving) {
      requestRender();
    }
  }

  function requestRender() {
    if (!frame && !destroyed) {
      frame = requestAnimationFrame(render);
    }
  }

  function setFace(tile, face, duration, { delay = 0, axis = 'x' } = {}) {
    // A square still mid-turn starts the new one from where it is headed.
    tile.from = tile.to ?? { kind: 'void' };
    tile.to = face;
    tile.axis = axis;
    tile.duration = reduceMotion ? 1 : duration;
    tile.start = performance.now() + (reduceMotion ? 0 : delay);
    requestRender();
  }

  /* ------------------------------------------------------------- mosaics */

  function nextPhoto() {
    if (!deck.length) {
      return null;
    }

    // The deck goes round; photos already on a mosaic are skipped.
    const onBoards = new Set(boards.map((board) => board.img));

    for (let i = 0; i < deck.length; i += 1) {
      const img = deck.shift();
      deck.push(img);

      if (!onBoards.has(img)) {
        return img;
      }
    }

    return deck[0];
  }

  function showBoard(board, { duration = TURN_MS, stagger = 180, axis = 'y', delay = 0 } = {}) {
    board.cells.forEach((tile, slot) => {
      setFace(tile, { kind: 'piece', board, slot, side: board.sides[slot] }, duration, {
        delay: delay + slot * stagger,
        axis,
      });
    });
  }

  // The letter and dot faces of a mosaic's photo, drawn mosaic-sized.
  function buildBoardFaces(img) {
    const side = size * 2;
    const scene = { img, fx: 0.5, fy: 0.5, tx: 0.5, ty: 0.5 };

    return {
      text: buildTextLayer(scene, side, side, dpr, compact()),
      motion: buildMotionLayer(scene, side, side, dpr),
    };
  }

  function dealPhoto(board) {
    board.img = nextPhoto();
    board.faces = board.img && !assemble ? buildBoardFaces(board.img) : null;
    board.sides = scramble();
    board.glowStart = 0;
  }

  // First deal: the pieces roll in one after another.
  function dealBoard(board, options) {
    dealPhoto(board);
    board.locked = false;
    showBoard(board, options);
  }

  // After a solve: the whole mosaic turns over, as one cube, into the next photo.
  function flipBoard(board) {
    const from = boardTexture(board);
    dealPhoto(board);

    board.cells.forEach((tile, slot) => {
      tile.to = { kind: 'piece', board, slot, side: board.sides[slot] };
      tile.from = null;
      tile.start = 0;
    });

    board.flip = {
      from,
      to: boardTexture(board),
      start: performance.now(),
      duration: reduceMotion ? 1 : BOARD_FLIP_MS,
      axis: Math.random() < 0.5 ? 'x' : 'y',
    };
    requestRender();
  }

  // One move on a mosaic: two pieces roll on to their next face, side by side.
  function play(board, slot) {
    if (board.locked) {
      return;
    }

    board.sides = applyMove(board.sides, slot);

    [slot, (slot + 1) % 4].forEach((s) => {
      setFace(board.cells[s], { kind: 'piece', board, slot: s, side: board.sides[s] }, CLICK_TURN_MS, {
        axis: 'x',
      });
    });

    if (isSolved(board.sides)) {
      board.locked = true;
      board.glowStart = performance.now() + CLICK_TURN_MS;
      requestRender();

      later(() => {
        board.glowStart = 0;
        flipBoard(board);
      }, CLICK_TURN_MS + SOLVED_HOLD_MS);
    }
  }

  // An assembling mosaic's resting face: one of the two plain tones.
  function plainFace() {
    return { kind: Math.random() < 0.5 ? 'text' : 'motion' };
  }

  // Hover: the pieces roll over one by one into the photo, mosaic after mosaic.
  function assembleBoards() {
    boards.forEach((board, index) => {
      if (board.dealt) {
        dealPhoto(board);
      }

      board.dealt = true;
      board.assembled = true;
      board.cells.forEach((tile, slot) => {
        setFace(tile, { kind: 'piece', board, slot, side: 0, img: board.img }, TURN_MS * 0.8, {
          delay: index * 260 + slot * 150,
          axis: slot % 2 ? 'x' : 'y',
        });
      });
    });
  }

  // …and fall apart into plain squares once the pointer leaves.
  function scatterBoards() {
    boards.forEach((board) => {
      board.assembled = false;
      board.cells.forEach((tile, slot) => {
        setFace(tile, plainFace(), TURN_MS * 0.8, {
          delay: slot * 90,
          axis: Math.random() < 0.5 ? 'x' : 'y',
        });
      });
    });
  }

  // Left alone, one mosaic takes its next best move.
  function autoPlay() {
    if (!visible || performance.now() - lastPlay < IDLE_BEFORE_AUTO_MS) {
      return;
    }

    const open = boards.filter((board) => !board.locked && board.img);

    if (open.length) {
      const board = open[(Math.random() * open.length) | 0];
      play(board, nextBestMove(board.sides));
    }
  }

  /*
   * Where the mosaics go: the right part, above the headline's row, side by
   * side — every other one a row lower where there is room, so they step like
   * a staircase rather than sit in a bar.
   */
  function placeBoards(firstRow, headlineRow) {
    const count = Math.min(maxBoards, Math.floor(cols / 2));

    if (count < 1) {
      return [];
    }

    const startCol = cols - count * 2;
    const placed = [];

    const fits = (row, col) =>
      row >= firstRow &&
      row + 1 < headlineRow &&
      [0, 1].every((dr) =>
        [0, 1].every((dc) => {
          const tile = tileAt(row + dr, col + dc);
          return tile && tile.held !== 'blank' && tile.held !== 'plate';
        }),
      );

    for (let k = 0; k < count; k += 1) {
      const col = startCol + k * 2;
      const stepped = k % 2 === 1 && fits(firstRow + 1, col) ? firstRow + 1 : firstRow;

      if (fits(stepped, col)) {
        placed.push({ row: stepped, col });
      }
    }

    return placed.map(({ row, col }) => {
      const board = {
        cells: [],
        sides: [0, 0, 0, 0],
        img: null,
        faces: null,
        locked: false,
        glowStart: 0,
        flip: null,
      };

      RING.forEach(([dr, dc], slot) => {
        const tile = tileAt(row + dr, col + dc);
        tile.held = null;
        tile.board = board;
        tile.slot = slot;
        board.cells.push(tile);
      });

      return board;
    });
  }

  /* --------------------------------------------------------------- layout */

  // A face filled with one flat colour, panel-sized like the photo layers.
  function toneLayer(color) {
    const { layer, ctx } = makeLayer(width, height, dpr);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    return layer;
  }

  function buildLayers() {
    if (tones) {
      return { text: toneLayer(tones[0]), motion: toneLayer(tones[1]) };
    }

    const scene = loadedScenes[sceneIndex];

    return {
      text: buildTextLayer(scene, width, height, dpr, compact()),
      motion: buildMotionLayer(scene, width, height, dpr),
    };
  }

  function layout() {
    const rect = host.getBoundingClientRect();
    // The layout box, not the rect: on the case cube the host may be mid-turn.
    width = Math.max(1, host.offsetWidth);
    height = Math.max(1, host.offsetHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Medium squares: about 160px on a desktop, 96px on a phone.
    const target = compact() ? 96 : Math.min(180, Math.max(130, width / 10));
    cols = Math.max(3, Math.round(width / target));
    size = width / cols;
    rows = Math.ceil(height / size);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    layers = buildLayers();

    /*
     * While the top row is pinned as a bar (lib/pinnedHeader.js) it is out of
     * the panel's flow, and the spacer just before it holds its place — so the
     * spacer is measured instead. That is the case on a return to the page with
     * the scroll restored: measuring the bar itself then gave no row at all,
     * and the squares filled the space behind the nav.
     */
    if (header) {
      const pinned = header.classList.contains('is-pinned');
      const holder = pinned ? header.previousElementSibling : header;

      if (holder) {
        headerBottom = holder.getBoundingClientRect().bottom - rect.top;
      }
    }

    // Measured where the headline sits in the flow, before any lift below.
    const lifted = Number(anchor?.dataset.lift || 0);
    const anchorTop = anchor ? anchor.getBoundingClientRect().top - rect.top + lifted : height;
    const headlineRow = Math.floor(anchorTop / size);
    const plate = placeCopy(rect, headlineRow);

    /*
     * On a phone the plate takes the full row above the one the headline
     * starts in, which could leave most of a row's height between them. The
     * headline is lifted to sit just under the plate instead.
     */
    if (anchor) {
      // The gap is kept under the text's last line, wherever that ends. When
      // the headline is already too close, the summary moves up instead —
      // pushing the headline down would run it into the panel's foot.
      copy.style.removeProperty('--copy-shift');
      let textBottom = headlineRow * size;
      if (plate) {
        textBottom = 0;
        [...copy.children].forEach((line) => {
          textBottom = Math.max(textBottom, line.getBoundingClientRect().bottom - rect.top);
        });
      }
      const room = compact() && plate ? anchorTop - textBottom - 32 : 0;
      // Past a small phone the headline keeps its place at the foot and the
      // summary follows it, either way; lifting it would leave the foot empty.
      const follow = width > 480;
      const lift = follow ? 0 : Math.max(0, room);
      if (room < 0 || (follow && room)) {
        copy.style.setProperty('--copy-shift', `${room}px`);
      }
      anchor.dataset.lift = String(lift);
      anchor.style.transform = lift ? `translateY(${-lift}px)` : '';
    }
    const firstRow = Math.ceil(headerBottom / size - 1e-6);
    const previous = tiles;

    tiles = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const tile = { col, row, from: null, to: null, start: 0, duration: TURN_MS, dirty: true };
        tile.copy = copyWeight(tile);

        if (row < firstRow) {
          tile.held = 'blank';
        } else if (
          plate &&
          row >= plate.row &&
          row < plate.row + plate.rows &&
          col >= plate.col &&
          col < plate.col + plate.cols
        ) {
          tile.held = 'plate';
        }

        tiles.push(tile);
      }
    }

    boards.forEach((board) => {
      board.locked = true;
    });
    const belowRow = below
      ? Math.ceil((below.getBoundingClientRect().bottom - rect.top) / size - 1e-6)
      : 0;
    boards = placeBoards(Math.max(firstRow, belowRow), headlineRow);

    // On a phone nothing but the photos sits above the summary — not even
    // over the lower mosaic of the staircase.
    if (compact() && plate) {
      tiles.forEach((tile) => {
        if (tile.row < plate.row && !tile.held && !tile.board) {
          tile.held = 'void';
        }
      });
    }

    // The chosen empty squares, on a desktop, wherever no mosaic has taken them.
    if (!compact()) {
      emptySquares.forEach(([row, share]) => {
        const tile = tileAt(row < 0 ? rows + row : row, Math.min(cols - 1, Math.round(share * (cols - 1))));

        if (tile && !tile.held && !tile.board) {
          tile.held = 'void';
        }
      });
    }

    // First paint: the squares roll in one by one; after a resize they come back at once.
    const now = performance.now();
    const lit = count ? scatter(count) : null;

    tiles.forEach((tile) => {
      if (lit && !tile.held && !tile.board && !lit.has(tile)) {
        tile.lit = false;
        tile.to = { kind: 'void' };
        tile.dirty = true;
      } else if (lit && lit.has(tile)) {
        tile.lit = true;
        setFace(tile, { kind: Math.random() < 0.5 ? 'text' : 'motion' }, TURN_MS * 1.2, {
          delay: previous.length ? 0 : Math.random() * 2400,
          axis: Math.random() < 0.5 ? 'x' : 'y',
        });
      } else if (tile.held) {
        tile.to = { kind: tile.held };
        drawTile(tile, now);
      } else if (!tile.board && hoverOnly) {
        tile.to = { kind: 'void' };
        tile.dirty = true;
      } else if (!tile.board) {
        setFace(tile, ambientFace(tile), TURN_MS * 1.2, {
          delay: previous.length ? 0 : Math.random() * 2400,
          axis: Math.random() < 0.5 ? 'x' : 'y',
        });
      }
    });

    boards.forEach((board, index) => {
      if (assemble) {
        dealPhoto(board);
        board.cells.forEach((tile) => {
          setFace(tile, plainFace(), TURN_MS * 1.2, {
            delay: previous.length ? 0 : Math.random() * 2400,
            axis: Math.random() < 0.5 ? 'x' : 'y',
          });
        });
      } else {
        dealBoard(board, { delay: previous.length ? 0 : 1200 + index * 500 });
      }
    });
  }

  /*
   * The summary's plate: the row of squares just above the one the headline
   * starts in, so it never runs into the headline. Its text lines up with the
   * headline's left edge.
   */
  function placeCopy(rect, headlineRow) {
    if (!copy || !anchor) {
      return null;
    }

    const plate = {
      col: 0,
      cols: compact() ? cols : Math.min(3, cols),
      rows: 1,
      row: headlineRow - 1,
    };

    if (plate.row < 0 || plate.row * size < headerBottom) {
      copy.classList.remove('is-placed');
      return null;
    }

    const half = tileGap(compact()) / 2;
    copy.style.left = `${plate.col * size + half}px`;
    copy.style.top = `${plate.row * size + half}px`;
    copy.style.width = `${plate.cols * size - half * 2}px`;
    copy.style.height = `${plate.rows * size - half * 2}px`;
    copy.style.borderRadius = `${tileRadius(compact())}px`;
    copy.style.setProperty(
      '--copy-inset',
      `${Math.max(16, anchor.getBoundingClientRect().left - rect.left)}px`,
    );
    copy.classList.add('is-placed');

    return plate;
  }

  /* ------------------------------------------------------------ animation */

  /*
   * Where a lit square may go: clear of the copy, whole within the block (not
   * cut by its edge), not beside another lit one (corners may touch), and no
   * more than `perRow` to a row.
   */
  function canLight(tile, lit, perRow = 2, apart = true) {
    if (tile.held || tile.board || tile.copy >= 0.5 || lit.has(tile)) {
      return false;
    }

    if ((tile.row + 1) * size > height + 2 || (tile.col + 1) * size > width + 2) {
      return false;
    }

    const inRow = [...lit].filter((other) => other.row === tile.row).length;
    const beside = [...lit].some(
      (other) => Math.abs(other.row - tile.row) + Math.abs(other.col - tile.col) === 1,
    );

    return inRow < perRow && !(apart && beside);
  }

  // `n` squares picked at random under those rules — fewer if the block is too small.
  function scatter(n) {
    const lit = new Set();

    // Two to a row where there are rows enough; a shallow block allows three,
    // and at a pinch two side by side.
    [
      [2, true],
      [3, true],
      [3, false],
    ].forEach(([perRow, apart]) => {
      for (const tile of shuffle(tiles)) {
        if (lit.size >= n) {
          break;
        }

        if (canLight(tile, lit, perRow, apart)) {
          lit.add(tile);
        }
      }
    });

    return lit;
  }

  // One lit square goes dark and another lights up somewhere else.
  function moveOne() {
    const lit = new Set(tiles.filter((tile) => tile.lit));
    const moving = [...lit].filter((tile) => !tile.start);

    if (!moving.length) {
      return;
    }

    const from = moving[(Math.random() * moving.length) | 0];
    lit.delete(from);
    const options = tiles.filter((tile) => tile !== from && canLight(tile, lit, 3));

    if (!options.length) {
      return;
    }

    const to = options[(Math.random() * options.length) | 0];
    from.lit = false;
    to.lit = true;
    setFace(from, { kind: 'void' }, TURN_MS, { axis: Math.random() < 0.5 ? 'x' : 'y' });
    setFace(to, { kind: Math.random() < 0.5 ? 'text' : 'motion' }, TURN_MS, {
      delay: 400,
      axis: Math.random() < 0.5 ? 'x' : 'y',
    });
  }

  function swapOne() {
    if (!visible || !tiles.length) {
      return;
    }

    // Fewer squares, so fewer moves: one every few seconds, not every tick.
    if (count) {
      if (Math.random() < 0.4) {
        moveOne();
      }
      return;
    }

    const idle = tiles.filter((tile) => !tile.start && !tile.held && !tile.board);

    if (idle.length) {
      const tile = idle[(Math.random() * idle.length) | 0];
      setFace(tile, ambientFace(tile), TURN_MS, { axis: Math.random() < 0.5 ? 'x' : 'y' });
    }
  }

  // The next photo of me takes over the letters and the motion take, rolling in from the left.
  function nextScene() {
    if (!visible || loadedScenes.length < 2) {
      return;
    }

    sceneIndex = (sceneIndex + 1) % loadedScenes.length;
    const previous = layers;
    layers = buildLayers();

    tiles.forEach((tile) => {
      if (!tile.held && !tile.board && (tile.to?.kind === 'text' || tile.to?.kind === 'motion')) {
        const kind = tile.to.kind;
        // The outgoing face keeps the old layer for the length of the turn.
        tile.to = { kind, layer: previous[kind] };
        setFace(tile, { kind }, TURN_MS, {
          delay: (tile.col / cols) * 2400 + Math.random() * 300,
          axis: 'x',
        });
      }
    });
  }

  function tileFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / size);
    const row = Math.floor((event.clientY - rect.top) / size);

    return col >= 0 && col < cols && row >= 0 && row < rows ? tileAt(row, col) : null;
  }

  function setHover(next) {
    if (hover?.board === next?.board && hover?.slot === next?.slot) {
      return;
    }

    [hover, next].forEach((entry) => {
      entry?.board.cells.forEach((tile) => {
        tile.dirty = true;
      });
    });
    hover = next;
    canvas.style.cursor = next ? 'pointer' : 'default';
    requestRender();
  }

  // Hover mode: the square under the pointer rolls over into a face.
  function lightTile(tile) {
    if (!tile || tile.held || tile.board) {
      return;
    }

    tile.litAt = performance.now();

    if (isEmpty(tile.to) && !tile.start) {
      const weights = { text: 3, motion: 2 };
      setFace(tile, { kind: pickWeighted(weights) }, LIGHT_TURN_MS, {
        axis: Math.random() < 0.5 ? 'x' : 'y',
      });
    }
  }

  // …and rolls back to black once the pointer has been gone a while.
  function dimTiles() {
    const now = performance.now();

    tiles.forEach((tile) => {
      if (tile.litAt && !tile.start && now - tile.litAt > LIGHT_HOLD_MS) {
        tile.litAt = 0;
        setFace(tile, { kind: 'void' }, TURN_MS, { axis: Math.random() < 0.5 ? 'x' : 'y' });
      }
    });
  }

  function handlePointerMove(event) {
    if (assemble) {
      return;
    }

    const tile = tileFromEvent(event);

    if (hoverOnly) {
      lightTile(tile);
    }

    setHover(tile?.board && !tile.board.locked ? { board: tile.board, slot: tile.slot } : null);
  }

  function handlePointerLeave() {
    setHover(null);
  }

  function handleClick(event) {
    if (assemble) {
      return;
    }

    const tile = tileFromEvent(event);

    if (tile?.board) {
      lastPlay = performance.now();
      play(tile.board, tile.slot);
    }
  }

  function start() {
    if (reduceMotion) {
      return;
    }

    if (hoverOnly) {
      swapTimer = window.setInterval(dimTiles, 400);
      return;
    }

    swapTimer = window.setInterval(swapOne, SWAP_EVERY_MS);
    sceneTimer = window.setInterval(nextScene, SCENE_EVERY_MS);
    if (!assemble) {
      autoTimer = window.setInterval(autoPlay, AUTO_EVERY_MS);
    }
  }

  /* ---------------------------------------------------------------- setup */

  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (loadedScenes.length && (host.offsetWidth !== width || host.offsetHeight !== height)) {
        layout();
      }
    }, 160);
  });

  // Off screen, nothing swaps; a hidden tab stops the timers' work too.
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && !document.hidden;
  });

  const handleVisibility = () => {
    visible = !document.hidden;
  };

  // The letters are drawn once into a layer, so Manrope has to be in first.
  const fontReady = document.fonts
    ? document.fonts.load(textFont(12), WORD).catch(() => null)
    : Promise.resolve();

  /*
   * With no photos, the faces are set on a ground of their own: a soft grey
   * falling off to black, so the letters and the black-and-white take still have light and shade.
   */
  function plainScene() {
    const ground = document.createElement('canvas');
    ground.width = 320;
    ground.height = 200;
    const g = ground.getContext('2d');
    const light = g.createRadialGradient(230, 60, 10, 200, 90, 260);
    light.addColorStop(0, '#9aa0aa');
    light.addColorStop(0.5, '#4a4f58');
    light.addColorStop(1, '#14171d');
    g.fillStyle = light;
    g.fillRect(0, 0, 320, 200);
    return { img: ground, fx: 0.5, fy: 0.5, tx: 0.5, ty: 0.5 };
  }

  Promise.all([
    Promise.all(scenes.map((scene) => loadImage(scene.src))),
    Promise.all(photos.map(loadImage)),
    fontReady,
  ]).then(([sceneImages, photoImages]) => {
    if (destroyed) {
      return;
    }

    sceneImages.forEach((img, index) => {
      if (img) {
        loadedScenes.push({ ...scenes[index], img });
      }
    });
    deck = shuffle(photoImages.filter(Boolean));

    if (!loadedScenes.length) {
      loadedScenes.push(plainScene());
    }

    layout();
    canvas.classList.add('is-ready');
    canvas.addEventListener('click', handleClick);
    // In hover mode the whole block listens, so the copy over it doesn't block the reveal.
    pointerTarget.addEventListener('pointermove', handlePointerMove);
    pointerTarget.addEventListener('pointerleave', handlePointerLeave);

    if (assemble) {
      host.addEventListener('pointerenter', assembleBoards);
      host.addEventListener('pointerleave', scatterBoards);
    }

    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    document.addEventListener('visibilitychange', handleVisibility);
    start();
  });

  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    window.clearInterval(swapTimer);
    window.clearInterval(sceneTimer);
    window.clearInterval(autoTimer);
    window.clearTimeout(resizeTimer);
    pending.forEach((id) => window.clearTimeout(id));
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', handleVisibility);
    canvas.removeEventListener('click', handleClick);
    pointerTarget.removeEventListener('pointermove', handlePointerMove);
    pointerTarget.removeEventListener('pointerleave', handlePointerLeave);
    host.removeEventListener('pointerenter', assembleBoards);
    host.removeEventListener('pointerleave', scatterBoards);
  };
}
