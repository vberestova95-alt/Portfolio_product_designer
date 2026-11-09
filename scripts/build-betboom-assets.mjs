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
import { execFileSync } from 'node:child_process'
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
  // Poster of the cover animation: its first frame, transparent around the screens.
  'cover-anim-poster': { file: '06-cover-anim-v4-poster.png' },
  // The season widget frame; the showcase itself is animated now, it stays
  // as the picture of the next case teaser.
  'showcase-entry-point': { file: '05-showcase-entry-point.png', phone: true },
  // Showcase posters: the first frame of each WebM, with its alpha, so nothing
  // shows behind the phone before the clip starts.
  'showcase-tasks-poster': { webm: 'showcase-tasks-anim-v3.webm' },
  'showcase-widget-poster': { webm: 'showcase-widget-anim-v3.webm' },
  'showcase-task-detail-poster': { webm: 'showcase-task-detail-anim-v3.webm' },
  'showcase-switching-poster': { webm: 'showcase-switching-anim-v3.webm' },
  'showcase-category-bar-poster': { webm: 'showcase-category-bar-anim-v3.webm' },
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
  'onboarding-tooltip': { file: '22-onboarding-balance-tooltip.png', phone: true },
  'entry-no-level': { file: '23-entry-profile-no-level.png', phone: true },
  'entry-progress': { file: '24-entry-profile-progress.png', phone: true },
  'entry-season-timer': { file: '25-entry-profile-season-timer.png', phone: true },
  'entry-max-level': { file: '26-entry-profile-max-level.png', phone: true },
  'entry-web': { file: '27-entry-web-sidebar.png', radius: 24 },
  'desktop-before': { file: '28-desktop-before-slider-v3.png', width: 1920 },
  'desktop-after': { file: '29-desktop-after-slider-v3b.png', width: 1920 },
  'task-detail': { file: '30-task-detail-v3.png', phone: true },
  'detail-reward-deadline': { file: '31-detail-reward-deadline-v3.png', width: 1800 },
  'detail-category-filters': { file: '32-category-filters-screen-v3.png', phone: true },
  'desktop-after-anim-poster': { file: '29-desktop-after-anim-v3-poster.png', width: 1600 },
  // Drafts behind D1 and D3, picked by the user (v3, EN).
  'draft-d1-card-grid': { file: 'd1-01-08-as-is-card-to-content-grid-v3-draft.png', width: 2400 },
  'draft-d1-condition-length': { file: 'd1-05-condition-text-length-v3-draft.png', width: 2400 },
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
  'scheme-entry-points': { file: '45-scheme-entry-points.png', width: 1800 },
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
 * Files that go in as the designer exported them. The cover animation keeps its
 * alpha only in these two encodings — WebM VP9 (Chrome, Firefox) and HEVC .mov
 * (Safari) — and re-encoding with ffmpeg here would drop it.
 */
const COPIES = {
  'cover-anim.webm': '06-cover-anim-v4.webm',
  'cover-anim.mov': '06-cover-anim-v4.mov',
  'showcase-tasks.webm': 'showcase-tasks-anim-v3.webm',
  'showcase-tasks.mov': 'showcase-tasks-anim-v3.mov',
  'showcase-widget.webm': 'showcase-widget-anim-v3.webm',
  'showcase-widget.mov': 'showcase-widget-anim-v3.mov',
  'showcase-task-detail.webm': 'showcase-task-detail-anim-v3.webm',
  'showcase-task-detail.mov': 'showcase-task-detail-anim-v3.mov',
  'showcase-switching.webm': 'showcase-switching-anim-v3.webm',
  'showcase-switching.mov': 'showcase-switching-anim-v3.mov',
  'showcase-category-bar.webm': 'showcase-category-bar-anim-v3.webm',
  'showcase-category-bar.mov': 'showcase-category-bar-anim-v3.mov',
}

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

async function prepare(file, spec) {
  const meta = await sharp(file).metadata()
  const width = spec.width ? Math.min(spec.width, meta.width) : meta.width
  const height = Math.round((meta.height * width) / meta.width)
  const radius = spec.phone ? Math.round((PHONE.radius * width) / PHONE.width) : spec.radius ?? 0
  let image = sharp(file).resize(width, height)
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
function firstFrame(webm) {
  return execFileSync('ffmpeg', [
    '-loglevel', 'error', '-c:v', 'libvpx-vp9', '-i', webm,
    '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-',
  ])
}

async function buildImage(slot, spec, src) {
  const input = spec.webm ? firstFrame(path.join(src, spec.webm)) : path.join(src, spec.file)
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

for (const [slot, spec] of Object.entries(IMAGES)) {
  if (wanted(slot)) await buildImage(slot, spec, args.src)
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
