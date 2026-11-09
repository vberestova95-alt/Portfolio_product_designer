/*
 * Builds the Fluffy Chumb (cat app) case images from screen exports.
 *
 *   node scripts/build-case-frames.mjs --lang en|ru
 *        [--only v2-screens,v2-cover,features,story,home-cover] [--draft] [--out <dir>] [--scale 1]
 *
 * With no --only it builds v2-screens, v2-cover and the feature frames;
 * home-cover (the case card on the home page) and the story bands are built
 * only when asked for.
 *
 * Sources live in src/assets/cases/src/ and are never imported by the app, so
 * Vite does not bundle them:
 *   fluffy-chumb/<lang>/<slot>.png — Figma frame exports at scale 2 (780 px wide)
 *     from «Fluffy Chumb · App — Final» (EoVlDmLhUGV5mSzlsvEMW0, read only).
 *     The node behind each slot is listed in SCREENS below; to swap a screen,
 *     export its node with download_assets (png, scale 2) into <slot>.png and
 *     update the node-id here.
 *
 * Output goes next to the old files under new names (feature frames into
 * fluffy-chumb/features/); RU files get a `.ru` suffix.
 * --draft fills a missing slot with a labelled placeholder (for review only —
 * pass --out to keep drafts out of the repo).
 */
import { mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../', import.meta.url))
const casesDir = path.join(root, 'src/assets/cases')
const sourceDir = path.join(casesDir, 'src/fluffy-chumb')

// Figma nodes per slot in Final: EN page 77:19 (Beta · EN), RU page 280:6149
// (Beta · RU). Trackers and the builder come from the Archive page: those are
// the versions the app ships, the new mockups R2·116/117 are not built yet.
// Home and Routine still hold the old exports from «Portfolio · Fluffy Chumb
// case frames» (1:2 / 1:202, 2:136 / 2:140): Fluffy Chumb is fixing these
// frames in Final, so re-export them from the nodes below once they are done,
// then rebuild v2-cover, v2-screens and home-cover.
const SCREENS = {
  home: { en: '373:8005', ru: '374:18247' },
  routine: { en: '371:5680', ru: '374:18294' },
  'choose-trackers': { en: '387:9295', ru: '387:26554' },
  trackers: { en: '387:9384', ru: '387:26643' },
  'build-the-look': { en: '387:9459', ru: '387:26718' },
  insulin: { en: '387:9694', ru: '387:26953' },
  history: { en: '387:10162', ru: '387:27421' },
  family: { en: '387:10272', ru: '387:27531' },
  // Feature frames (the bento in the v2 section).
  'map-site-marked': { en: '387:9777', ru: '387:27036' },
  'map-adding-site': { en: '387:9885', ru: '387:27144' },
  'builder-name': { en: '387:9413', ru: '387:26672' },
  'builder-fields': { en: '387:9436', ru: '387:26695' },
  'builder-rhythm': { en: '387:9530', ru: '387:26789' },
  'history-export': { en: '387:10212', ru: '387:27471' },
  'family-invite': { en: '387:10347', ru: '387:27606' },
  glucose: { en: '387:9996', ru: '387:27255' },
  'log-insulin': { en: '387:9717', ru: '387:26976' },
  // Web MVP (May 2026): screens recorded by Fluffy Chumb on a mock, not Figma
  // (docs/review/cat-app-2026-11/30-web-mvp-*-v2@2x.png). The web app is in
  // English only, so RU uses the same files (SHARED_SLOTS).
  'web-mvp-week-map': {},
  'web-mvp-injection-form': {},
  'web-mvp-new-marker': {},
  'web-mvp-history': {},
  // The dose check sheet is a still from the app recording, not Figma:
  // flows/sc1-a.mp4 at 6.8 s (EN) and sc1-a.ru.mp4 at 6.2 s (RU), the sheet
  // fully open over the map, status bar as recorded. Once Fluffy Chumb fixes
  // Final, export 387:9931 / 387:27190 into check-dose.png instead.
  'check-dose': {},
  // Step 5 band: stills from the app recording by Fluffy Chumb (R2·193,
  // docs/review/cat-app-2026-11/v2-band-stills), 9:41 status bar: the Not now
  // sheet, the same sheet with a skip reason picked, and today's routine with
  // no «Done by» marks. Final 374:16898 / 374:16970 (RU 374:18735 / 374:18807)
  // can replace the sheets once it is fixed.
  'not-now': {},
  'not-now-skip': {},
  'routine-recorded': {},
}

// Slots read from en/ for both languages (the web MVP is English only).
const SHARED_SLOTS = new Set(['web-mvp-week-map', 'web-mvp-injection-form', 'web-mvp-new-marker', 'web-mvp-history'])

// --draft: a phone-shaped stand-in for a frame that is not exported yet.
const PLACEHOLDER = {
  note: { en: 'To be replaced', ru: 'Будет заменено' },
  titles: {
    routine: { en: 'Today’s routine', ru: 'Дела на сегодня' },
    'not-now': { en: 'Not now', ru: 'Не сейчас' },
    'not-now-skip': { en: 'Skip with a reason', ru: 'Пропуск с причиной' },
    'check-dose': { en: 'Check the dose', ru: 'Сверка дозы' },
  },
}

// Geometry in 1x px, measured from the current pet-tracker-v2-*.webp. A slot
// shows the top `crop` px of its frame (default: the 844 px phone viewport,
// whatever the frame height) at `zoom`.
const SCREEN = { width: 390, height: 844, radius: 44 }
const SHADOW = { offsetY: 8, blur: 12, opacity: 0.1 }
const HAIRLINE = { width: 1, opacity: 0.06 }

const LAYOUTS = {
  'v2-screens': {
    file: 'fluffy-chumb-v2-screens',
    size: [3005, 940],
    slots: ['home', 'choose-trackers', 'trackers', 'build-the-look', 'insulin', 'history', 'family'].map(
      (slot, index) => ({ slot, x: 30 + index * 425, y: 40 }),
    ),
  },
  // The preview: Home with its trackers and the start of the routine, whole
  // frame; the routine tasks lower and to the right, cut under the last task.
  // Both screens stay inside x 225–1127 and below y 130: the phone work card
  // shows the cover at 150% width, centred and lifted by 9% (global.css).
  'v2-cover': {
    file: 'fluffy-chumb-v2-cover',
    size: [1352, 1220],
    slots: [
      { slot: 'home', x: 244, y: 140, zoom: 1.05, crop: 961 },
      { slot: 'routine', x: 698, y: 240, zoom: 1.05, crop: 860 },
    ],
  },
  // The case card on the home page: Trackers, Home and Insulin, the middle one
  // raised, the right one cut by the bottom edge. Measured from the current
  // fluffy-chumb-home-cover.webp. Build it only after Home is re-exported.
  'home-cover': {
    file: 'fluffy-chumb-home-cover',
    size: [1627, 1537],
    slots: [
      { slot: 'trackers', x: 6, y: 316, zoom: 1.33, crop: 820 },
      { slot: 'home', x: 555, y: 176, zoom: 1.33, crop: 844 },
      { slot: 'insulin', x: 1104, y: 404, zoom: 1.33, crop: 850 },
    ],
  },
}

// Feature frames: whole phone screens in a row, one picture per feature, for
// the bento tiles in the v2 section. Two screens make 870×924, four 1710×924.
const FEATURE_GAP = 30
const featureLayout = (file, slots, options = {}) => ({
  ...options,
  file,
  size: [FEATURE_GAP + slots.length * (SCREEN.width + FEATURE_GAP), FEATURE_GAP + SCREEN.height + 50],
  slots: slots.map((slot, index) => ({ slot, x: FEATURE_GAP + index * (SCREEN.width + FEATURE_GAP), y: FEATURE_GAP })),
})

const FEATURES = {
  // The cat photo is heavy: a lower quality keeps the picture under 300 KB.
  'feature-injection-map': featureLayout('fluffy-chumb/features/injection-map', ['map-site-marked', 'map-adding-site'], {
    quality: 80,
  }),
  // 'feature-not-now': featureLayout('fluffy-chumb/features/not-now', ['not-now', 'not-now-skip']),
  'feature-builder': featureLayout('fluffy-chumb/features/builder', [
    'builder-name',
    'builder-fields',
    'build-the-look',
    'builder-rhythm',
  ]),
  'feature-history': featureLayout('fluffy-chumb/features/history', ['history', 'history-export']),
  'feature-family': featureLayout('fluffy-chumb/features/family', ['family', 'family-invite']),
}
Object.assign(LAYOUTS, FEATURES)

// Story bands for the «from diagnosis to v2» steps (mvp and process sections),
// shown as `imageBand` with `variant: 'bare'`. Three whole screens make the
// 1778×1238 band; seven make the 3005×940 one, like v2-screens. Each band has a
// `.mobile` take for phones: a column of three, or two columns of seven.
// Scales are fixed so each file stays under 300 KB and sharp on its screen:
// rows at 1x (already 2–3× their width on the page), the narrow column at 2x.
const STORY_ZOOM = 1.385
const storyRow = (file, slots) =>
  slots.length === 3
    ? {
        file,
        scale: 1,
        size: [1778, 1238],
        slots: slots.map((slot, index) => ({ slot, x: 33 + index * 586, y: 30, zoom: STORY_ZOOM })),
      }
    : {
        file,
        scale: 1,
        size: [30 + (slots.length - 1) * 425 + SCREEN.width + 35, 940],
        slots: slots.map((slot, index) => ({ slot, x: 30 + index * 425, y: 40 })),
      }
const storyMobile = (file, slots) => {
  const columns = slots.length > 3 ? 2 : 1
  const rows = Math.ceil(slots.length / columns)
  return {
    file: `${file}.mobile`,
    scale: columns > 1 ? 1 : 2,
    size: [40 * 2 + columns * SCREEN.width + (columns - 1) * 30, 40 * 2 + rows * SCREEN.height + (rows - 1) * 40],
    slots: slots.map((slot, index) => ({
      slot,
      x: 40 + (index % columns) * (SCREEN.width + 30),
      y: 40 + Math.floor(index / columns) * (SCREEN.height + 40),
    })),
  }
}
const STORY_BANDS = {
  // Step 3: shared care, shown with v2 frames.
  'story-shared': ['family-invite', 'family', 'history'],
  // Step 5: version two.
  'story-v2': ['glucose', 'routine-recorded', 'not-now', 'not-now-skip', 'map-site-marked', 'map-adding-site', 'check-dose'],
}
const STORY = {}
for (const [name, slots] of Object.entries(STORY_BANDS)) {
  const file = `fluffy-chumb/story/${name.replace('story-', '')}`
  STORY[name] = storyRow(file, slots)
  STORY[`${name}-mobile`] = storyMobile(file, slots)
}

// Step 2: the web MVP and version two, the same three steps in the same order
// (the injection map, the dose pop-up, history), for the case's before / after
// slider. Both pictures share one geometry, so the screens stay put when it moves.
// No text inside: the slider's tabs say Before and After.
const beforeAfter = (file, slots) => ({
  file,
  // 1.5x: the slider is about 1000 px wide on a desktop.
  scale: 1.5,
  size: [40 * 2 + slots.length * SCREEN.width + (slots.length - 1) * 40, 40 + SCREEN.height + 60],
  slots: slots.map((slot, index) => ({ slot, x: 40 + index * (SCREEN.width + 40), y: 40 })),
})
STORY['story-web-mvp-before'] = beforeAfter('fluffy-chumb/story/web-mvp-before', [
  'web-mvp-week-map',
  'web-mvp-injection-form',
  'web-mvp-history',
])
// The map on the whole screen, the sheet once a site is placed, History.
STORY['story-web-mvp-after'] = beforeAfter('fluffy-chumb/story/web-mvp-after', [
  'map-adding-site',
  'check-dose',
  'history',
])
Object.assign(LAYOUTS, STORY)

function parseArgs(argv) {
  const args = { lang: 'en', only: null, draft: false, out: casesDir, scale: 1 }
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]
    if (key === '--draft') args.draft = true
    else if (key === '--lang') args.lang = argv[++i]
    else if (key === '--only') args.only = argv[++i].split(',')
    else if (key === '--out') args.out = path.resolve(argv[++i])
    else if (key === '--scale') args.scale = Number(argv[++i])
    else throw new Error(`Unknown argument: ${key}`)
  }
  if (!['en', 'ru'].includes(args.lang)) throw new Error('--lang must be en or ru')
  return args
}

const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  )

const roundedMask = (width, height, radius) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#000"/></svg>`,
  )

// Touch-ups on recorded stills, in source px. A fill repaints a box with one
// clean column of it stretched sideways (the cards' own colour and gradient).
const PATCHES = {
  // RU routine: the cut-off article titles under the tab bar («шага», «скачет
  // глюкоза»); EN shows bare cards there.
  'routine-recorded': {
    ru: [
      { top: 1662, bottom: 1688, left: 33, right: 376, ref: 40 },
      { top: 1662, bottom: 1688, left: 403, right: 746, ref: 410 },
    ],
  },
}

async function patchScreen(file, fills) {
  const layers = []
  for (const { top, bottom, left, right, ref } of fills) {
    const column = await sharp(file).extract({ left: ref, top, width: 1, height: bottom - top }).toBuffer()
    layers.push({ input: await sharp(column).resize(right - left, bottom - top, { fit: 'fill', kernel: 'nearest' }).png().toBuffer(), left, top })
  }
  return sharp(file).composite(layers).png().toBuffer()
}

// A Figma export cropped to the phone viewport and rounded.
async function loadScreen(file, scale, { zoom = 1, crop = SCREEN.height } = {}) {
  const width = Math.round(SCREEN.width * zoom * scale)
  const height = Math.round(crop * zoom * scale)
  const exported = await sharp(file).metadata()
  const cropHeight = Math.round((exported.width * crop) / SCREEN.width)
  return sharp(file)
    .extract({ left: 0, top: 0, width: exported.width, height: Math.min(cropHeight, exported.height) })
    .resize(width, height, { fit: 'cover', position: 'top' })
    .composite([{ input: roundedMask(width, height, SCREEN.radius * zoom * scale), blend: 'dest-in' }])
    .png()
    .toBuffer()
}

function placeholder(label, scale, { zoom = 1, crop = SCREEN.height } = {}, note = '') {
  const width = Math.round(SCREEN.width * zoom * scale)
  const height = Math.round(crop * zoom * scale)
  const size = 22 * zoom * scale
  return sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
        `<rect width="${width}" height="${height}" rx="${SCREEN.radius * zoom * scale}" fill="#f1f1f1"/>` +
        `<text x="50%" y="50%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
        `font-size="${size}" fill="#6f6f6f">${label}</text>` +
        (note
          ? `<text x="50%" y="${height / 2 + size * 1.6}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
            `font-size="${size * 0.8}" fill="#9a9a9a">${note}</text>`
          : '') +
        `</svg>`,
    ),
  )
    .png()
    .toBuffer()
}

// Black copy of the screen's own shape: the base for its shadow and hairline.
const silhouette = (screen) => sharp(screen).linear([0, 0, 0, 1], [0, 0, 0, 0]).png().toBuffer()

/*
 * Lays the screens on a transparent canvas: one shadow layer under everything,
 * then each screen over a hairline grown 1–2 px out of its own alpha.
 */
async function compose([canvasWidth, canvasHeight], items, { shadow, hairline, scale = 1 }) {
  const blank = { width: canvasWidth, height: canvasHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  const shapes = await Promise.all(items.map((item) => silhouette(item.image)))

  const shadowLayer = await sharp({ create: blank })
    .composite(shapes.map((input, i) => ({ input, left: items[i].x, top: items[i].y + Math.round(shadow.offsetY * scale) })))
    .png()
    .toBuffer()
    .then((buffer) =>
      sharp(buffer)
        .blur(shadow.blur * scale)
        .linear([1, 1, 1, shadow.opacity], [0, 0, 0, 0])
        .png()
        .toBuffer(),
    )

  const rims = await Promise.all(
    shapes.map(async (shape, i) => {
      const grow = Math.max(1, Math.round(hairline.width * scale))
      const { width, height } = await sharp(shape).metadata()
      // sharp keeps one linear() per pipeline, so each step is its own pass.
      const padded = await sharp(shape)
        .extend({ top: grow, bottom: grow, left: grow, right: grow, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
      const solid = await sharp(padded)
        .blur(Math.max(0.6, grow * 0.6))
        .linear([1, 1, 1, 6], [0, 0, 0, 0])
        .png()
        .toBuffer()
      const grown = await sharp(solid).linear([1, 1, 1, hairline.opacity], [0, 0, 0, 0]).png().toBuffer()
      return { input: grown, left: items[i].x - grow, top: items[i].y - grow, width, height }
    }),
  )

  return sharp({ create: blank })
    .composite([
      { input: shadowLayer, left: 0, top: 0 },
      ...items.flatMap((item, i) => [
        { input: rims[i].input, left: rims[i].left, top: rims[i].top },
        { input: item.image, left: item.x, top: item.y },
      ]),
    ])
    .png()
    .toBuffer()
}

async function buildLayout(name, args) {
  const layout = LAYOUTS[name]
  // A layout may fix its own scale: wide bands are already large at 1x.
  const scale = layout.scale ?? args.scale
  const missing = []
  const items = []
  for (const { slot, x, y, ...frame } of layout.slots) {
    const file = path.join(sourceDir, SHARED_SLOTS.has(slot) ? 'en' : args.lang, `${slot}.png`)
    let image
    const patch = PATCHES[slot]?.[args.lang]
    if (await exists(file)) image = await loadScreen(patch ? await patchScreen(file, patch) : file, scale, frame)
    else if (args.draft) {
      const title = PLACEHOLDER.titles[slot]?.[args.lang] ?? slot
      image = await placeholder(title, scale, frame, PLACEHOLDER.note[args.lang])
    } else {
      missing.push(`${slot} (${SCREENS[slot]?.[args.lang] ?? 'no node-id yet'})`)
      continue
    }
    items.push({ image, x: Math.round(x * scale), y: Math.round(y * scale) })
  }
  if (missing.length) {
    console.log(`skip ${name} [${args.lang}]: missing ${missing.join(', ')}`)
    return
  }
  const size = layout.size.map((value) => Math.round(value * scale))
  const png = await compose(size, items, { shadow: SHADOW, hairline: HAIRLINE, scale })
  const suffix = args.lang === 'ru' ? '.ru' : ''
  const target = path.join(args.out, `${layout.file}${suffix}.webp`)
  await mkdir(path.dirname(target), { recursive: true })
  const info = await sharp(png).webp({ quality: layout.quality ?? 86, alphaQuality: 90, effort: 6 }).toFile(target)
  console.log(`${path.relative(root, target)}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}

const args = parseArgs(process.argv.slice(2))
await mkdir(args.out, { recursive: true })
const targets = args.only ?? ['v2-screens', 'v2-cover', 'features']
for (const name of targets) {
  if (name === 'features') for (const feature of Object.keys(FEATURES)) await buildLayout(feature, args)
  else if (name === 'story') for (const band of Object.keys(STORY)) await buildLayout(band, args)
  else if (LAYOUTS[name]) await buildLayout(name, args)
  else throw new Error(`Unknown target: ${name}`)
}
