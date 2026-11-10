/*
 * Copies the built index.html into a directory per route, so a direct hit on a
 * case URL resolves as a static file. Which routes exist depends on the deploy
 * target — see deploy-targets.mjs.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { resolveDeployTarget, resolveDistDirectory } from './deploy-targets.mjs'

const target = resolveDeployTarget()
const { routes } = target

const distDirectory = resolveDistDirectory(target)
const source = new URL('index.html', distDirectory)

await Promise.all(
  routes.map(async (route) => {
    const routeDirectory = new URL(`${route}/`, distDirectory)
    await mkdir(routeDirectory, { recursive: true })
    await copyFile(source, new URL('index.html', routeDirectory))
  }),
)
