/*
 * Builds the Fluffy Chumb (cat app) case images from screen exports.
 *
 *   node scripts/build-case-frames.mjs --lang en|ru
 *        [--only v2-screens,v2-cover,mvp,features,home-cover] [--draft] [--out <dir>] [--scale 1]
 *
 * With no --only it builds v2-screens, v2-cover, mvp and the feature frames;
 * home-cover (the case card on the home page) is built only when asked for.
 *
 * Sources live in src/assets/cases/src/ and are never imported by the app, so
 * Vite does not bundle them:
 *   fluffy-chumb/<lang>/<slot>.png — Figma frame exports at scale 2 (780 px wide)
 *     from «Fluffy Chumb · App — Final» (EoVlDmLhUGV5mSzlsvEMW0, read only).
 *     The node behind each slot is listed in SCREENS below; to swap a screen,
 *     export its node with download_assets (png, scale 2) into <slot>.png and
 *     update the node-id here.
 * The MVP band is cut from the existing pet-tracker-cover-screens.png: its three
 * screens are found by their alpha and laid out again whole, with a hairline and
 * a shadow so the light screens do not melt into a light page. The third screen
 * is a Safari screenshot: it is cut under the app's tab bar, losing the
 * browser's own bar, and its bottom corners are rounded again. That screen is
 * in Russian, so EN swaps it for fluffy-chumb/en/mvp-tracker.png (MVP.replacements)
 * and RU keeps it, writing the `.ru` band.
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
  // Not now and the dose check sheet: Final is being fixed, not exported yet.
  // 'not-now': { en: '374:16898', ru: '374:18735' },
  // 'not-now-skip': { en: '374:16970', ru: '374:18807' },
  // 'check-dose': { en: '387:9931', ru: '387:27190' },
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

const MVP = {
  source: path.join(casesDir, 'pet-tracker-cover-screens.png'),
  file: 'pet-tracker-mvp-screens',
  gap: 48,
  padding: 40,
  hairline: { width: 2, opacity: 0.12 },
  shadow: { offsetY: 12, blur: 18, opacity: 0.12 },
  // Per screen, left to right: `bottom` is the last source row to keep (y in
  // pet-tracker-cover-screens.png), `radius` the corner it is rounded with.
  trims: [null, null, { bottom: 1389, radius: 18 }],
  // Per language, screens that replace the cut ones (null keeps the cut). The
  // cut tracker shows the Russian «Лютик's Tracker · Винсувет», which stays on
  // the RU page; EN gets the same screen in English (a ×2 web screenshot,
  // square and opaque), fitted to the cut screen's width and rounded the same.
  replacements: {
    en: [null, null, { file: 'mvp-tracker.png', radius: 18 }],
    ru: [null, null, null],
  },
}

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

function placeholder(label, scale, { zoom = 1, crop = SCREEN.height } = {}) {
  const width = Math.round(SCREEN.width * zoom * scale)
  const height = Math.round(crop * zoom * scale)
  return sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
        `<rect width="${width}" height="${height}" rx="${SCREEN.radius * scale}" fill="#f1f1f1"/>` +
        `<text x="50%" y="50%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
        `font-size="${22 * scale}" fill="#9a9a9a">${label}</text></svg>`,
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
  const { scale } = args
  const missing = []
  const items = []
  for (const { slot, x, y, ...frame } of layout.slots) {
    const file = path.join(sourceDir, args.lang, `${slot}.png`)
    let image
    if (await exists(file)) image = await loadScreen(file, scale, frame)
    else if (args.draft) image = await placeholder(`${slot} — waiting for frame`, scale, frame)
    else {
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

// Finds the screens in the old MVP band by their opaque columns.
async function cutMvpScreens() {
  const { data, info } = await sharp(MVP.source).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const alpha = (x, y) => data[(y * info.width + x) * 4 + 3]
  const opaqueColumn = (x) => {
    for (let y = 0; y < info.height; y += 4) if (alpha(x, y) > 128) return true
    return false
  }
  const spans = []
  let start = -1
  for (let x = 0; x <= info.width; x += 1) {
    const opaque = x < info.width && opaqueColumn(x)
    if (opaque && start < 0) start = x
    if (!opaque && start >= 0) {
      spans.push([start, x - 1])
      start = -1
    }
  }
  return Promise.all(
    spans.map(async ([left, right]) => {
      let top = info.height
      let bottom = 0
      for (let y = 0; y < info.height; y += 1) {
        for (let x = left; x <= right; x += 2) {
          if (alpha(x, y) > 0) {
            top = Math.min(top, y)
            bottom = Math.max(bottom, y)
            break
          }
        }
      }
      const region = { left, top, width: right - left + 1, height: bottom - top + 1 }
      return { region, image: await sharp(MVP.source).extract(region).png().toBuffer() }
    }),
  )
}

async function trimMvpScreen(screen, trim) {
  if (!trim) return screen
  const height = trim.bottom - screen.region.top + 1
  const { width } = screen.region
  const image = await sharp(screen.image)
    .extract({ left: 0, top: 0, width, height })
    .composite([{ input: roundedMask(width, height, trim.radius), blend: 'dest-in' }])
    .png()
    .toBuffer()
  return { region: { ...screen.region, height }, image }
}

async function replaceMvpScreen(screen, { file, radius }, lang) {
  const { width } = screen.region
  const resized = await sharp(path.join(sourceDir, lang, file)).resize({ width }).png().toBuffer()
  const { height } = await sharp(resized).metadata()
  const image = await sharp(resized)
    .composite([{ input: roundedMask(width, height, radius), blend: 'dest-in' }])
    .png()
    .toBuffer()
  return { region: { ...screen.region, height }, image }
}

/*
 * Two takes on the same three screens: a row for wide screens, and a column
 * (`.mobile`) that a phone gets instead, so the screens keep a readable size.
 */
async function buildMvp(args) {
  const cut = await cutMvpScreens()
  if (cut.length !== 3) throw new Error(`MVP band: expected 3 screens, found ${cut.length}`)
  const screens = await Promise.all(
    cut.map((screen, i) => {
      const replacement = MVP.replacements[args.lang][i]
      return replacement ? replaceMvpScreen(screen, replacement, args.lang) : trimMvpScreen(screen, MVP.trims[i])
    }),
  )
  const { padding, gap } = MVP
  const suffix = args.lang === 'ru' ? '.ru' : ''

  const rowHeight = Math.max(...screens.map((screen) => screen.region.height))
  let x = padding
  const row = screens.map((screen) => {
    const item = { image: screen.image, x, y: padding }
    x += screen.region.width + gap
    return item
  })
  await writeMvp(args, `${MVP.file}${suffix}`, [x - gap + padding, rowHeight + padding * 2], row)

  const columnWidth = Math.max(...screens.map((screen) => screen.region.width))
  let y = padding
  const column = screens.map((screen) => {
    const item = { image: screen.image, x: padding + Math.round((columnWidth - screen.region.width) / 2), y }
    y += screen.region.height + gap
    return item
  })
  await writeMvp(args, `${MVP.file}.mobile${suffix}`, [columnWidth + padding * 2, y - gap + padding], column)
}

async function writeMvp(args, file, size, items) {
  const png = await compose(size, items, { shadow: MVP.shadow, hairline: MVP.hairline })
  const target = path.join(args.out, `${file}.webp`)
  const info = await sharp(png).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(target)
  console.log(`${path.relative(root, target)}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}

const args = parseArgs(process.argv.slice(2))
await mkdir(args.out, { recursive: true })
const targets = args.only ?? ['v2-screens', 'v2-cover', 'mvp', 'features']
for (const name of targets) {
  if (name === 'mvp') await buildMvp(args)
  else if (name === 'features') for (const feature of Object.keys(FEATURES)) await buildLayout(feature, args)
  else if (LAYOUTS[name]) await buildLayout(name, args)
  else throw new Error(`Unknown target: ${name}`)
}
