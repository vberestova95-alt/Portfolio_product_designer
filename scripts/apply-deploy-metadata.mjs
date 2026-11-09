/*
 * Rewrites the crawlable parts of dist/ for whichever deploy target this build
 * belongs to. Runs before create-static-routes.mjs, so the route copies inherit
 * the patched head.
 *
 * A no-op for the portfolio target: its values live in index.html and public/
 * and ship untouched.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { resolveDeployTarget, resolveDistDirectory } from './deploy-targets.mjs'

const target = resolveDeployTarget()
const distDirectory = resolveDistDirectory(target)

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/*
 * Every replacement has to hit exactly one tag. A silent miss would ship the
 * portfolio's title and canonical on the standalone domain, which is the one
 * failure this script exists to prevent — so a miss fails the build instead.
 *
 * [^>]* spans newlines, which matters because Vite keeps the multi-line
 * attribute formatting from the source index.html.
 */
function replaceTag(html, { pattern, replacement, label }) {
  const matches = html.match(new RegExp(pattern, 'g'))

  if (!matches || matches.length !== 1) {
    throw new Error(
      `apply-deploy-metadata: expected exactly one ${label} tag in dist/index.html, found ${matches?.length ?? 0}.`,
    )
  }

  // Function form, so a `$` inside a description is not read as a backreference.
  return html.replace(pattern, () => replacement)
}

async function patchIndexHtml(target) {
  const indexUrl = new URL('index.html', distDirectory)
  const { metadata, origin } = target
  const canonicalUrl = `${origin}${metadata.path}`

  const replacements = [
    {
      label: '<title>',
      pattern: /<title>[\s\S]*?<\/title>/,
      replacement: `<title>${escapeAttribute(metadata.title)}</title>`,
    },
    {
      label: 'name="description"',
      pattern: /<meta\b[^>]*\bname="description"[^>]*>/,
      replacement: `<meta name="description" content="${escapeAttribute(metadata.description)}" />`,
    },
    {
      label: 'property="og:title"',
      pattern: /<meta\b[^>]*\bproperty="og:title"[^>]*>/,
      replacement: `<meta property="og:title" content="${escapeAttribute(metadata.openGraphTitle)}" />`,
    },
    {
      label: 'property="og:description"',
      pattern: /<meta\b[^>]*\bproperty="og:description"[^>]*>/,
      replacement: `<meta property="og:description" content="${escapeAttribute(metadata.openGraphDescription)}" />`,
    },
    {
      label: 'property="og:url"',
      pattern: /<meta\b[^>]*\bproperty="og:url"[^>]*>/,
      replacement: `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`,
    },
    {
      label: 'rel="canonical"',
      pattern: /<link\b[^>]*\brel="canonical"[^>]*>/,
      replacement: `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
    },
  ]

  const html = replacements.reduce(replaceTag, await readFile(indexUrl, 'utf8'))

  await writeFile(indexUrl, html)
}

async function writeCrawlerFiles(target) {
  const { origin, routes, sitemap = routes } = target

  await writeFile(
    new URL('robots.txt', distDirectory),
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  )

  const entries = sitemap.map((route) => `  <url><loc>${origin}/${route}</loc></url>`).join('\n')

  await writeFile(
    new URL('sitemap.xml', distDirectory),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
  )
}

if (target.metadata) {
  await patchIndexHtml(target)
  await writeCrawlerFiles(target)
  // public/CNAME points the portfolio at its apex domain; it means nothing here.
  await rm(new URL('CNAME', distDirectory), { force: true })
  console.log(`apply-deploy-metadata: built for "${target.id}" (${target.origin}).`)
} else {
  console.log(`apply-deploy-metadata: built for "${target.id}", metadata left as committed.`)
}
