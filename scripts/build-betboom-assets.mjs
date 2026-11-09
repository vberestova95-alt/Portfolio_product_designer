/*
 * Builds the BetBoom PASS case images and clips from the designer's EN exports.
 *
 *   node scripts/build-betboom-assets.mjs --src <dir> [--only slot,slot]
 *
 * <dir> holds the PNG ×2 and MP4 exports from Figma «Portfolio · Case · BetBoom
 * PASS» (yEae1aMLgORY8UkZAsPqR5), named as in docs/review/betboom-pass/README.md
 * (e.g. 01-showcase-tasks-v2.png). The exports are ~60 MB, so they stay out of
 * the repo; only the built files land in src/assets/cases/betboom/.
 *
 * Phone screens are rounded like a 390-wide screen with a 44 px corner and kept
 * at their export size (×2). Wide pictures are scaled to `width`. Every WebP is
 * squeezed under the case budget (300 KB): quality first, then size.
 * Clips are re-encoded to H.264 without sound, under 2 MB.
 */
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises'
import { execFileSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../', import.meta.url))
const outDir = path.join(root, 'src/assets/cases/betboom')

const IMAGE_BUDGET = 300 * 1024
const PHONE = { width: 390, radius: 44 }

// slot → source file and how to treat it. Prefer -v2 where the designer made one.
const IMAGES = {
  // The static PASS cover, for its card on the home page. Not `cover`: that
  // file is the Gamification hub card's picture.
  'pass-cover': { file: '06-cover-v4.png' },
  // The season widget frame; the showcase itself is animated now, it stays
  // as the picture of the next case teaser.
  'showcase-entry-point': { file: '05-showcase-entry-point.png', phone: true },
  // Showcase posters: the first frame of each WebM, with its alpha, so nothing
  // shows behind the phone before the clip starts.
  'showcase-tasks-poster': { webm: 'showcase-tasks-anim-v3.webm', repaired: 'showcase-tasks' },
  'showcase-widget-poster': { webm: 'showcase-widget-anim-v3.webm', repaired: 'showcase-widget' },
  'showcase-task-detail-poster': { webm: 'showcase-task-detail-anim-v3.webm', repaired: 'showcase-task-detail' },
  'showcase-switching-poster': { webm: 'showcase-switching-anim-v3.webm', repaired: 'showcase-switching' },
  'showcase-category-bar-poster': { webm: 'showcase-category-bar-anim-v3.webm' },
  // Hero row, middle phone: the “These tasks conflict” popup, from the switching
  // clip. Not the open “Your tasks” widget: that UI is a second designer's.
  'hero-phone-switching': { webm: 'showcase-switching-anim-v3.webm', repaired: 'showcase-switching', at: 3 },
  // Posters of the v3 clips: the first frame of each, so the swap is seamless.
  'swap-conflict': { file: '10-switch-flow-anim-v3-poster.png', phone: true },
  'swap-return': { file: '11-switch-return-task.png', phone: true },
  'swap-switched': { file: '12-switch-task-switched.png', phone: true },
  'swap-cancel-limit': { file: '13-switch-cancel-limit-12h.png', phone: true },
  'tasks-before': { file: '14-tasks-before-asis.png', phone: true },
  'tasks-after': { file: '15-tasks-after-anim-v3-poster.png', phone: true },
  'top-carousel': { file: '16-top-carousel-v2.png', phone: true },
  'category-bar-1': { file: '17-rubricator-step1-v2.png', phone: true },
  'category-bar-2': { file: '18-rubricator-step2-v2.png', phone: true },
  'category-bar-3': { file: '19-rubricator-step3-v2.png', phone: true },
  'onboarding-welcome': { file: '20-onboarding-welcome-v3.png', phone: true },
  'onboarding-difficulty': { file: '21-onboarding-difficulty-v3.png', phone: true },
  // The header still carries Figma's “Title” placeholder; it is painted over
  // with the dimmed header's own colour (no text of ours put in its place).
  'onboarding-tooltip': {
    file: '22-onboarding-balance-tooltip.png',
    phone: true,
    paint: [{ left: 24, top: 216, width: 116, height: 64, from: [16, 248] }],
  },
  'entry-no-level': { file: '23-entry-profile-no-level.png', phone: true },
  // v2: the designer's take with a thin light edge (22 %), so the dark screen
  // does not merge with a dark ground.
  'entry-progress': { file: '24-entry-profile-progress-v2.png', phone: true },
  'entry-season-timer': { file: '25-entry-profile-season-timer.png', phone: true },
  'entry-max-level': { file: '26-entry-profile-max-level.png', phone: true },
  'entry-web': { file: '27-entry-web-sidebar.png', radius: 24 },
  // The user's pick: the very first "before" (Figma 14-2), not the v3 frame,
  // which already showed the new category bar.
  'desktop-before': { file: '28-desktop-before-slider.png', width: 1920 },
  'desktop-after': { file: '29-desktop-after-slider-v3b.png', width: 1920 },
  // Two thin edges of the card stacked behind the right one showed over its
  // top edge (y 424–447); the strip above the card is painted with the ground.
  'detail-reward-deadline': {
    file: '31-detail-reward-deadline-v3.png',
    width: 1800,
    paint: [{ left: 1780, top: 400, width: 1820, height: 62, from: [3000, 400] }],
  },
  'detail-category-filters': { file: '32-category-filters-screen-v3.png', phone: true },
  'desktop-after-anim-poster': { file: '29-desktop-after-anim-v3-poster.png', width: 1600 },
  // Drafts behind D1 and D3, picked by the user (v3, EN).
  // The fourth column (a phone) sat 100 px from the plate's right edge, the
  // first one 120 px from its left: the plate is widened by 20 px there.
  'draft-d1-card-grid': {
    file: 'd1-01-08-as-is-card-to-content-grid-v3-draft.png',
    width: 2400,
    widen: { at: 5600, by: 20 },
  },
  // Only the guideline note and the three columns of cards, with a 24 px
  // (48 px at ×2) margin of the plate's own grey: the title and the empty
  // third of the plate around them are gone, so the cards read larger.
  'draft-d1-condition-length': {
    file: 'd1-05-condition-text-length-v3-draft.png',
    width: 2400,
    crop: { left: 221, top: 546, width: 3374, height: 3350 },
  },
  'draft-d3-modal-a': { file: 'd3-04-modal-a-keep-switch-v3-draft.png', phone: true },
  'draft-d3-modal-b': { file: 'd3-05-modal-b-buttons-swapped-v3-draft.png', phone: true },
  'draft-d3-undo': { file: 'd3-06-undo-10s-v3-draft.png', phone: true },
  'draft-d3-cancel-task': { file: 'd3-09-03-as-is-to-cancel-task-v3-draft.png', width: 2400 },
  'category-bar-poster': { file: '33-category-bar-anim-v3-poster.png', width: 1800 },
  'detail-sport-esports': { file: '33-detail-sport-esports-rubricator-v2.png', width: 1800 },
  'detail-promo-task': { file: '34-top-promo-screen-v3.png', phone: true },
  'scheme-platforms': { file: '40-scheme-three-platforms-v3.png', width: 1800 },
  'scheme-task-types': { file: '41-scheme-task-types-v3.png', width: 1800 },
  'scheme-conflict-rule': { file: '42-scheme-conflict-rule.png', width: 1800 },
  'scheme-switching': { file: '43-scheme-switching-asis-tobe.png', width: 1800 },
  'scheme-onboarding': { file: '44-scheme-onboarding-contexts.png', width: 1800 },
  // v2: neater arrows. Its corners come transparent (r 40): `flatten` fills
  // them with the scheme's own ground, like the other schemes.
  'scheme-entry-points': { file: '45-scheme-entry-points-v2.png', width: 1800, flatten: true },
}

const CLIPS = {
  'redesign-cards': { file: '60-anim-redesign-cards-v3.mp4', width: 1800 },
  'switch-flow': { file: '10-switch-flow-anim-v3.mp4', width: 750 },
  'tasks-after': { file: '15-tasks-after-anim-v3.mp4', width: 750 },
  'category-bar': { file: '33-category-bar-anim-v3.mp4', width: 1800 },
  'desktop-after': { file: '29-desktop-after-anim-v3.mp4', width: 1600 },
  'ab-test': { file: '61-anim-ab-test.mp4', width: 1600 },
  // The original A/B clip, in Russian, shown next to the EN re-shoot. It lives
  // in the repo already (4.5 MB, 60 fps), so it is read from there, not --src.
  'ab-test-ru': { repoFile: 'src/assets/betboom-ab-test.mp4', width: 1600, fps: 30 },
}

/*
 * Files that go in as the designer exported them. A clip keeps its alpha only
 * in these two encodings — WebM VP9 (Chrome, Firefox) and HEVC .mov
 * (Safari) — and re-encoding with ffmpeg here would drop it.
 */
const COPIES = {
  'showcase-category-bar.webm': 'showcase-category-bar-anim-v3.webm',
  'showcase-category-bar.mov': 'showcase-category-bar-anim-v3.mov',
}

/*
 * Showcase clips that open on the task page. In the export the game badge on
 * the top task card is clipped by the card: its right side is cut flat (the
 * user: "the icon on the top tasks is cut off"). Each frame is repaired by
 * mirroring the badge's left half over the cut, then the clip is encoded again
 * in both alpha formats. The posters come from the repaired WebM.
 */
const BADGE_REPAIRS = {
  'showcase-tasks': 'showcase-tasks-anim-v3.webm',
  'showcase-widget': 'showcase-widget-anim-v3.webm',
  'showcase-task-detail': 'showcase-task-detail-anim-v3.webm',
  'showcase-switching': 'showcase-switching-anim-v3.webm',
}
// Where the top card's badge sits in the 1080×1440 v3 frame: its rows, its
// middle and its half height and half width. The phone's own edge is at x 841.
const BADGE = { top: 349, bottom: 389, middle: 369, halfHeight: 18.5, radius: 21, maxCut: 835 }

/*
 * Hero row, left phone: the profile with the season widget (the PASS entry
 * point) in the same phone as the showcase clips, so the three hero phones
 * share one frame, one scale and one crop. The flat screen goes into the
 * screen of a showcase frame, and the Dynamic Island is laid back on top.
 */
const HERO_PHONES = {
  'hero-phone-profile': { frame: 'showcase-widget-anim-v3-poster.png', screen: '05-showcase-entry-point.png' },
  // The Gamification hub hero: the profile with season progress, in the same
  // phone (the screen without the v2 edge — the phone gives it one).
  'hub-hero-phone': { frame: 'showcase-widget-anim-v3-poster.png', screen: '24-entry-profile-progress.png' },
}
// The screen and the island in the 1080×1440 v3 frame.
const V3_SCREEN = { left: 258, top: 110, width: 563, height: 1218, radius: 69 }
const V3_ISLAND = { left: 450, top: 127, width: 184, height: 56 }

function parseArgs(argv) {
  const args = { src: null, only: null }
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]
    if (key === '--src') args.src = path.resolve(argv[++i])
    else if (key === '--only') args.only = argv[++i].split(',')
    else throw new Error(`Unknown argument: ${key}`)
  }
  if (!args.src) throw new Error('--src <dir with the designer exports> is required')
  return args
}

const roundedMask = (width, height, radius) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#000"/></svg>`,
  )

/*
 * Fixes to a source picture before it is sized: `crop` keeps a box, `paint`
 * fills boxes with the colour at `from` (to hide a stray edge or placeholder),
 * `widen` repeats the pixel column at `at` `by` times (a wider plate with all
 * its edges intact). Coordinates are in the export's pixels.
 */
async function edit(file, spec) {
  if (!spec.crop && !spec.paint && !spec.widen) return file
  let image = sharp(file).ensureAlpha()
  if (spec.crop) image = image.extract(spec.crop)
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  let { width, height } = info
  let pixels = data
  for (const box of spec.paint ?? []) {
    const at = (box.from[1] * width + box.from[0]) * 4
    const colour = Buffer.from(pixels.subarray(at, at + 4))
    for (let y = box.top; y < box.top + box.height; y += 1) {
      for (let x = box.left; x < Math.min(box.left + box.width, width); x += 1) {
        pixels.set(colour, (y * width + x) * 4)
      }
    }
  }
  if (spec.widen) {
    const { at, by } = spec.widen
    const wider = Buffer.alloc((width + by) * height * 4)
    for (let y = 0; y < height; y += 1) {
      const row = pixels.subarray(y * width * 4, (y + 1) * width * 4)
      const out = y * (width + by) * 4
      row.copy(wider, out, 0, at * 4)
      for (let i = 0; i <= by; i += 1) row.copy(wider, out + (at + i) * 4, at * 4, (at + 1) * 4)
      row.copy(wider, out + (at + by) * 4, at * 4)
    }
    pixels = wider
    width += by
  }
  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer()
}

async function prepare(source, spec) {
  const file = await edit(source, spec)
  const meta = await sharp(file).metadata()
  const width = spec.width ? Math.min(spec.width, meta.width) : meta.width
  const height = Math.round((meta.height * width) / meta.width)
  const radius = spec.phone ? Math.round((PHONE.radius * width) / PHONE.width) : spec.radius ?? 0
  let image = sharp(file).resize(width, height)
  if (spec.flatten) {
    // The ground colour, from the middle of the top edge.
    const data = await sharp(file).extract({ left: Math.round(meta.width / 2), top: 4, width: 1, height: 1 })
      .removeAlpha().raw().toBuffer()
    image = image.flatten({ background: { r: data[0], g: data[1], b: data[2] } })
  }
  if (radius) {
    image = sharp(await image.png().toBuffer()).composite([
      { input: roundedMask(width, height, radius), blend: 'dest-in' },
    ])
  }
  return { buffer: await image.png().toBuffer(), width }
}

// Quality first, then 85 % steps of size, until the file fits the budget.
async function encode({ buffer, width }) {
  let size = width
  for (;;) {
    const scaled = size === width ? buffer : await sharp(buffer).resize(size).png().toBuffer()
    for (const quality of [84, 76, 68, 60]) {
      const webp = await sharp(scaled).webp({ quality, alphaQuality: 90, effort: 6 }).toBuffer()
      if (webp.length <= IMAGE_BUDGET) return { webp, quality, size }
    }
    size = Math.round(size * 0.85)
  }
}

// The first frame of a VP9 WebM with its alpha: ffmpeg needs libvpx to decode it.
function firstFrame(webm, at = 0) {
  return execFileSync('ffmpeg', [
    '-loglevel', 'error', '-c:v', 'libvpx-vp9', '-ss', String(at), '-i', webm,
    '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-',
  ])
}

const luma = (frame, i) => frame[i] + frame[i + 1] + frame[i + 2]

// Finds the flat cuts (a column of badge pixels with background right after)
// and paints the missing right side as a mirror of the left one. The centre
// comes from the badge's own left edge: while the carousel slides, the card
// moves under the badge and the cut wanders.
function repairBadge(frame, width) {
  const solid = (x, y) => luma(frame, (y * width + x) * 4) > 140
  for (let x = 300; x < BADGE.maxCut; x += 1) {
    let lit = 0
    let after = 0
    for (let y = BADGE.top + 2; y < BADGE.bottom - 3; y += 1) {
      const v = luma(frame, (y * width + x) * 4)
      const next = luma(frame, (y * width + x + 1) * 4)
      if (v > 140 && v < 330) lit += 1
      if (next > 140) after += 1
    }
    if (lit < 20 || after >= 4) continue
    // The badge's left edge in each row: the start of the solid run that
    // reaches the cut.
    const lefts = new Map()
    for (let y = BADGE.top; y <= BADGE.bottom; y += 1) {
      if (!solid(x, y)) continue
      let left = x
      while (left > x - 2 * BADGE.radius && solid(left - 1, y)) left -= 1
      lefts.set(y, left)
    }
    if (lefts.size < 20) continue
    // The third smallest edge: a row or two run on along the card's top border.
    const centre = [...lefts.values()].sort((a, b) => a - b)[2] + BADGE.radius
    if (centre > x) continue
    // The badge's own fill, from just inside the cut (the logo is brighter).
    const fill = [0, 0, 0]
    let samples = 0
    for (let y = BADGE.top + 10; y <= BADGE.bottom - 10; y += 1) {
      const at = (y * width + x - 1) * 4
      const v = luma(frame, at)
      if (v <= 140 || v >= 330) continue
      for (let c = 0; c < 3; c += 1) fill[c] += frame[at + c]
      samples += 1
    }
    if (!samples) continue
    for (let c = 0; c < 3; c += 1) fill[c] /= samples
    // The missing right side is drawn as the badge's shape (an oval a little
    // wider than tall), anti-aliased, in the badge's fill.
    for (let y = BADGE.top; y <= BADGE.bottom; y += 1) {
      const dy = (y + 0.5 - BADGE.middle) / BADGE.halfHeight
      if (Math.abs(dy) >= 1) continue
      const right = centre + 0.5 + BADGE.radius * Math.sqrt(1 - dy * dy)
      for (let rx = x + 1; rx < right + 1; rx += 1) {
        const cover = Math.min(1, Math.max(0, right - rx))
        const to = (y * width + rx) * 4
        for (let c = 0; c < 3; c += 1) frame[to + c] = Math.round(frame[to + c] * (1 - cover) + fill[c] * cover)
      }
    }
    x += 2 * BADGE.radius
  }
}

async function repairClip(slot, file, src) {
  const width = 1080
  const height = 1440
  const size = width * height * 4
  const raw = ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-r', '30', '-i', '-']
  const encoders = [
    spawn('ffmpeg', ['-y', '-loglevel', 'error', ...raw, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
      '-b:v', '0', '-crf', '30', '-row-mt', '1', '-auto-alt-ref', '0', path.join(outDir, `${slot}.webm`)]),
    spawn('ffmpeg', ['-y', '-loglevel', 'error', ...raw, '-c:v', 'hevc_videotoolbox', '-alpha_quality', '0.75',
      '-b:v', '650k', '-tag:v', 'hvc1', '-movflags', '+faststart', path.join(outDir, `${slot}.mov`)]),
  ]
  const done = encoders.map((encoder) => new Promise((resolve, reject) => {
    encoder.on('close', (code) => (code ? reject(new Error(`${slot}: ffmpeg exited ${code}`)) : resolve()))
  }))
  const decoder = spawn('ffmpeg', ['-loglevel', 'error', '-c:v', 'libvpx-vp9', '-i', path.join(src, file),
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'])
  let pending = Buffer.alloc(0)
  let frames = 0
  for await (const chunk of decoder.stdout) {
    pending = Buffer.concat([pending, chunk])
    while (pending.length >= size) {
      const frame = Buffer.from(pending.subarray(0, size))
      pending = pending.subarray(size)
      repairBadge(frame, width)
      frames += 1
      await Promise.all(encoders.map((encoder) =>
        encoder.stdin.write(frame) ? null : new Promise((resolve) => encoder.stdin.once('drain', resolve))))
    }
  }
  encoders.forEach((encoder) => encoder.stdin.end())
  await Promise.all(done)
  for (const ext of ['webm', 'mov']) {
    const { size: bytes } = await stat(path.join(outDir, `${slot}.${ext}`))
    console.log(`${slot}.${ext}  ${frames} frames, badge repaired  ${Math.round(bytes / 1024)} KB`)
  }
}

async function buildHeroPhone(slot, spec, src) {
  const frame = path.join(src, spec.frame)
  const { left, top, width, height, radius } = V3_SCREEN
  const screen = await sharp(path.join(src, spec.screen))
    .resize(width, height)
    .composite([{ input: roundedMask(width, height, radius), blend: 'dest-in' }])
    .png()
    .toBuffer()
  const island = await sharp(frame)
    .extract(V3_ISLAND)
    .composite([{ input: roundedMask(V3_ISLAND.width, V3_ISLAND.height, V3_ISLAND.height / 2), blend: 'dest-in' }])
    .png()
    .toBuffer()
  const buffer = await sharp(frame)
    .composite([
      { input: screen, left, top },
      { input: island, left: V3_ISLAND.left, top: V3_ISLAND.top },
    ])
    .png()
    .toBuffer()
  const { webp, quality, size } = await encode({ buffer, width: 1080 })
  await writeFile(path.join(outDir, `${slot}.webp`), webp)
  console.log(`${slot}.webp  ${size}px  q${quality}  ${Math.round(webp.length / 1024)} KB`)
}

async function buildImage(slot, spec, src) {
  const clip = spec.repaired ? path.join(outDir, `${spec.repaired}.webm`) : path.join(src, spec.webm ?? '')
  const input = spec.webm ? firstFrame(clip, spec.at) : path.join(src, spec.file)
  const prepared = await prepare(input, spec)
  const { webp, quality, size } = await encode(prepared)
  const target = path.join(outDir, `${slot}.webp`)
  await writeFile(target, webp)
  console.log(`${slot}.webp  ${size}px  q${quality}  ${Math.round(webp.length / 1024)} KB`)
}

async function buildClip(slot, spec, src) {
  const target = path.join(outDir, `${slot}.mp4`)
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', spec.repoFile ? path.join(root, spec.repoFile) : path.join(src, spec.file),
    '-an',
    '-vf', `scale=${spec.width}:-2${spec.fps ? `,fps=${spec.fps}` : ''}`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    target,
  ])
  const { size } = await stat(target)
  console.log(`${slot}.mp4  ${spec.width}px  ${Math.round(size / 1024)} KB`)
  if (size > 2 * 1024 * 1024) console.warn(`  ! ${slot}.mp4 is over the 2 MB budget`)
}

const args = parseArgs(process.argv.slice(2))
await mkdir(outDir, { recursive: true })
const wanted = (slot) => !args.only || args.only.includes(slot)

// Before the images: the showcase posters are cut from the repaired clips.
for (const [slot, file] of Object.entries(BADGE_REPAIRS)) {
  if (wanted(slot)) await repairClip(slot, file, args.src)
}
for (const [slot, spec] of Object.entries(IMAGES)) {
  if (wanted(slot)) await buildImage(slot, spec, args.src)
}
for (const [slot, spec] of Object.entries(HERO_PHONES)) {
  if (wanted(slot)) await buildHeroPhone(slot, spec, args.src)
}
for (const [slot, spec] of Object.entries(CLIPS)) {
  if (wanted(slot)) await buildClip(slot, spec, args.src)
}
for (const [target, file] of Object.entries(COPIES)) {
  if (!wanted(target)) continue
  await copyFile(path.join(args.src, file), path.join(outDir, target))
  const { size } = await stat(path.join(outDir, target))
  console.log(`${target}  copied  ${Math.round(size / 1024)} KB`)
}
