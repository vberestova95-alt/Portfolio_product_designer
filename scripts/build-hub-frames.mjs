/*
 * Builds the BetBoom Gamification hub case images from the designer's exports.
 *
 *   node scripts/build-hub-frames.mjs [--lang en] [--only slot,slot] [--out <dir>]
 *
 * Sources live in src/assets/cases/src/betboom-hub/<lang>/<slot>.png — Figma
 * exports at scale 2 (copied from docs/review/gamification-hub/frames/<lang>/),
 * never imported by the app, so Vite does not bundle them. Phone screens are
 * 375 or 393 wide in 1x; they are fitted to the 390 px case screen.
 *
 * Kinds of output (all WebP, transparent, under the 300 KB case budget):
 *   phone   — one screen at ×2, exactly 780 px wide, rounded 44, hairline
 *             inside the edge, no shadow (phoneRow adds it in CSS);
 *   band    — screens in a row like fluffy-chumb-v2-screens (425 px per slot,
 *             30 px margins), cut to the 844 px phone viewport, with hairline
 *             and shadow as in build-case-frames.mjs;
 *   desktop — a web screen scaled to 1800, rounded, hairline inside the edge;
 *   wide    — a finished composition or scheme, only scaled to 1800.
 * Output goes to src/assets/cases/betboom-hub/; RU files get a `.ru` suffix.
 */
import { mkdir, access, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../', import.meta.url))
const sourceRoot = path.join(root, 'src/assets/cases/src/betboom-hub')
const outDir = path.join(root, 'src/assets/cases/betboom-hub')

const IMAGE_BUDGET = 300 * 1024
const QUALITIES = [86, 80, 74, 68, 60, 52]

// Geometry in 1x px, as in build-case-frames.mjs.
const SCREEN = { width: 390, height: 844, radius: 44 }
const SHADOW = { offsetY: 8, blur: 12, opacity: 0.1 }
const HAIRLINE = { width: 1, opacity: 0.06 }
const PHONE_SCALE = 2
const DESKTOP = { width: 1800, radius: 24, hairline: 2, hairlineOpacity: 0.08 }
const WIDE = { width: 1800 }

const K2 = ['k2-01-planned', 'k2-02-active-no-progress', 'k2-03-active-progress', 'k2-04-under-24h',
  'k2-05-no-gift', 'k2-06-ended-joined', 'k2-07-ended-not-joined']
const K3 = ['k3-01-signed-out', 'k3-02-no-seasons', 'k3-03-error', 'k3-04-update']

// A row of `slots` laid out like v2-screens: x = 30 + i * 425, y = 40.
const band = (slots, scale) => ({
  kind: 'band',
  scale,
  size: [30 + slots.length * 425, 940],
  slots: slots.map((slot, index) => ({ slot, x: 30 + index * 425, y: 40 })),
})

const phone = (slot) => ({ kind: 'phone', slot })

const TARGETS = {
  'd2-card-large': phone('d2-card-large'),
  'd2-card-small': phone('d2-card-small'),
  'd3-header-id': phone('d3-header-id'),
  'd3-header-name': phone('d3-header-name'),
  'd3-header-nickname': phone('d3-header-nickname'),
  'k1-hub': phone('k1-hub'),
  ...Object.fromEntries(K3.map((slot) => [slot, phone(slot)])),
  's3-hub-dark': phone('s3-hub-dark'),
  's3-hub-light': phone('s3-hub-light'),
  'k4-web-mobile': phone('k4-web-mobile'),
  // The season from planned to ended, in scenario order (3005×940).
  'k2-season-lifecycle': band(K2, 1),
  // Four edge cases; scale 1.7 keeps them readable and under 3005 px (2941×1598).
  'k3-edge-cases': band(K3, 1.7),
  'k4-web-desktop': { kind: 'desktop', slot: 'k4-web-desktop' },
  'd1-widget-v1-v2-dark': { kind: 'wide', slot: 'd1-widget-v1-v2-dark' },
  'd1-widget-v1-v2-light': { kind: 'wide', slot: 'd1-widget-v1-v2-light' },
  'scheme-r-user-path': { kind: 'wide', slot: 'scheme-r-user-path' },
  'scheme-s1-business-vs-hub': { kind: 'wide', slot: 'scheme-s1-business-vs-hub' },
  'scheme-s2-hub-ia': { kind: 'wide', slot: 'scheme-s2-hub-ia' },
}

function parseArgs(argv) {
  const args = { lang: 'en', only: null, out: outDir }
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]
    if (key === '--lang') args.lang = argv[++i]
    else if (key === '--only') args.only = argv[++i].split(',')
    else if (key === '--out') args.out = path.resolve(argv[++i])
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

/*
 * A Figma export fitted to the 390 px screen and rounded. `crop` cuts it to the
 * top `crop` px (1x) — the phone viewport in bands; without it the whole frame
 * stays, scaled by width only, so proportions never change.
 */
async function loadScreen(file, scale, { crop } = {}) {
  const exported = await sharp(file).metadata()
  const width = Math.round(SCREEN.width * scale)
  const fullHeight = Math.round((exported.height * width) / exported.width)
  const height = crop ? Math.min(Math.round(crop * scale), fullHeight) : fullHeight
  const resized = await sharp(file).resize(width, fullHeight).png().toBuffer()
  return sharp(resized)
    .extract({ left: 0, top: 0, width, height })
    .composite([{ input: roundedMask(width, height, SCREEN.radius * scale), blend: 'dest-in' }])
    .png()
    .toBuffer()
}

// Black copy of the screen's own shape: the base for its shadow and hairline.
const silhouette = (screen) => sharp(screen).linear([0, 0, 0, 1], [0, 0, 0, 0]).png().toBuffer()

/*
 * Lays the screens on a transparent canvas: one shadow layer under everything,
 * then each screen over a hairline grown 1–2 px out of its own alpha
 * (the same recipe as compose() in build-case-frames.mjs).
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
      return { input: grown, left: items[i].x - grow, top: items[i].y - grow }
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

/*
 * One phone screen, exactly 780 px wide: no room around it and no shadow of its
 * own — phoneRow draws the shadow in CSS, like for betboom/entry-*.webp.
 */
async function buildPhone(spec, source) {
  const scale = PHONE_SCALE
  const image = await loadScreen(source(spec.slot), scale)
  return withInnerHairline(image, {
    radius: SCREEN.radius * scale,
    width: HAIRLINE.width * scale,
    opacity: HAIRLINE.opacity,
  })
}

async function buildBand(spec, source) {
  const { scale } = spec
  const items = await Promise.all(
    spec.slots.map(async ({ slot, x, y }) => ({
      image: await loadScreen(source(slot), scale, { crop: SCREEN.height }),
      x: Math.round(x * scale),
      y: Math.round(y * scale),
    })),
  )
  const size = spec.size.map((value) => Math.round(value * scale))
  return compose(size, items, { shadow: SHADOW, hairline: HAIRLINE, scale })
}

// A hairline drawn just inside the rounded edge, so the size stays as it is.
async function withInnerHairline(image, { radius, width: stroke, opacity }) {
  const { width, height } = await sharp(image).metadata()
  const inset = stroke / 2
  const rim = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect x="${inset}" y="${inset}" width="${width - stroke}" height="${height - stroke}" ` +
      `rx="${radius - inset}" fill="none" stroke="#000" stroke-opacity="${opacity}" ` +
      `stroke-width="${stroke}"/></svg>`,
  )
  return sharp(image).composite([{ input: rim }]).png().toBuffer()
}

// A web screen: scaled, rounded, with a hairline inside the edge.
async function buildDesktop(spec, source) {
  const { width, radius, hairline, hairlineOpacity } = DESKTOP
  const resized = await sharp(source(spec.slot)).resize({ width }).png().toBuffer()
  const { height } = await sharp(resized).metadata()
  const rounded = await sharp(resized)
    .composite([{ input: roundedMask(width, height, radius), blend: 'dest-in' }])
    .png()
    .toBuffer()
  return withInnerHairline(rounded, { radius, width: hairline, opacity: hairlineOpacity })
}

const buildWide = (spec, source) => sharp(source(spec.slot)).resize({ width: WIDE.width }).png().toBuffer()

const BUILDERS = { phone: buildPhone, band: buildBand, desktop: buildDesktop, wide: buildWide }

// Quality steps down until the file fits the budget; the size never shrinks.
async function encode(png) {
  let webp
  for (const quality of QUALITIES) {
    webp = await sharp(png).webp({ quality, alphaQuality: 90, effort: 6 }).toBuffer()
    if (webp.length <= IMAGE_BUDGET) return { webp, quality, fits: true }
  }
  return { webp, quality: QUALITIES.at(-1), fits: false }
}

const args = parseArgs(process.argv.slice(2))
const sourceDir = path.join(sourceRoot, args.lang)
const source = (slot) => path.join(sourceDir, `${slot}.png`)
const suffix = args.lang === 'ru' ? '.ru' : ''
await mkdir(args.out, { recursive: true })

const names = args.only ?? Object.keys(TARGETS)
const over = []
for (const name of names) {
  const spec = TARGETS[name]
  if (!spec) throw new Error(`Unknown target: ${name}`)
  const slots = spec.slots ? spec.slots.map(({ slot }) => slot) : [spec.slot]
  const missing = []
  for (const slot of slots) if (!(await exists(source(slot)))) missing.push(slot)
  if (missing.length) {
    console.log(`skip ${name} [${args.lang}]: missing ${missing.join(', ')}`)
    continue
  }
  const png = await BUILDERS[spec.kind](spec, source)
  const { webp, quality, fits } = await encode(png)
  const target = path.join(args.out, `${name}${suffix}.webp`)
  await writeFile(target, webp)
  const { width, height } = await sharp(webp).metadata()
  console.log(`${path.relative(root, target)}  ${width}×${height}  q${quality}  ${Math.round(webp.length / 1024)} KB`)
  if (!fits) over.push(name)
}
if (over.length) console.warn(`! over the 300 KB budget: ${over.join(', ')}`)
