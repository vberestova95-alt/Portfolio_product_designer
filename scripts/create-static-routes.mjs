/*
 * Copies the built index.html into a directory per route, so a direct hit on a
 * case URL resolves as a static file. Which routes exist depends on the deploy
 * target — see deploy-targets.mjs.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { resolveDeployTarget } from './deploy-targets.mjs'

const { routes } = resolveDeployTarget()

const distDirectory = new URL('../dist/', import.meta.url)
const source = new URL('index.html', distDirectory)

await Promise.all(
  routes.map(async (route) => {
    const routeDirectory = new URL(`${route}/`, distDirectory)
    await mkdir(routeDirectory, { recursive: true })
    await copyFile(source, new URL('index.html', routeDirectory))
  }),
)
