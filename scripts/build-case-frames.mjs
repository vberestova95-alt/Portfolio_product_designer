/*
 * Builds the Fluffy Chumb (cat app) case images from screen exports.
 *
 *   node scripts/build-case-frames.mjs --lang en|ru [--only v2-screens,v2-cover,mvp]
 *                                      [--draft] [--out <dir>] [--scale 1]
 *
 * Sources live in src/assets/cases/src/ and are never imported by the app, so
 * Vite does not bundle them:
 *   fluffy-chumb/<lang>/<slot>.png — Figma frame exports at scale 2 (780 px wide).
 *     Home and Routine come from «Portfolio · Fluffy Chumb case frames»
 *     (9ga2w6jOKhMAWknjd54O5U), the rest from «Fluffy Chumb · App — Final»
 *     (EoVlDmLhUGV5mSzlsvEMW0); both are read only.
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
 * Output goes next to the old files under new names; RU files get a `.ru` suffix.
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

// Figma nodes per slot. Home and Routine — the case frames file, page 0:1
// (390×961); the rest — Final, EN page 77:19 (MVP), RU page 280:6149 (MVP · RU).
const SCREENS = {
  home: { en: '1:2', ru: '1:202' },
  routine: { en: '2:136', ru: '2:140' },
  'choose-trackers': { en: '78:10323', ru: '280:6182' },
  trackers: { en: '78:10852', ru: '280:6632' },
  'build-the-look': { en: '78:10975', ru: '280:6716' },
  insulin: { en: '78:10538', ru: '280:6384' },
  history: { en: '78:11090', ru: '280:6831' },
  family: { en: '78:11449', ru: '280:6919' },
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
}

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
  const info = await sharp(png).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(target)
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
const targets = args.only ?? ['v2-screens', 'v2-cover', 'mvp']
for (const name of targets) {
  if (name === 'mvp') await buildMvp(args)
  else if (LAYOUTS[name]) await buildLayout(name, args)
  else throw new Error(`Unknown target: ${name}`)
}
