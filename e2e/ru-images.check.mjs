/*
 * RU card images (RU is off on the site, so this checks the data directly).
 *   node e2e/ru-images.check.mjs
 * Each RU case must keep its own cover; Fluffy Chumb uses the .ru.webp cover.
 */
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
let failed = 0;
const check = (name, ok, detail) => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  — ${detail}`); };
try {
  const en = await server.ssrLoadModule('/src/data/portfolioData.js');
  const ru = await server.ssrLoadModule('/src/data/portfolioData.ru.js');
  const enById = Object.fromEntries(en.cases.map((c) => [c.id, c]));
  check('RU order matches EN', JSON.stringify(ru.cases.map((c) => c.id)) === JSON.stringify(en.cases.map((c) => c.id)), ru.cases.map((c) => c.id).join(', '));
  for (const c of ru.cases) {
    const src = c.image?.src ?? '';
    if (c.id === 'cat-app') {
      check('RU cat-app cover is .ru.webp', /fluffy-chumb-v2-cover\.ru\.webp/.test(src), src);
    } else {
      check(`RU ${c.id} cover same as EN`, src === enById[c.id].image.src, src);
    }
    check(`RU ${c.id} alt is Russian`, /[А-Яа-яЁё]/.test(c.image?.alt ?? ''), c.image?.alt ?? '');
  }
  const kokoc = ru.cases.find((c) => c.id === 'kokoc-group');
  check('RU kokoc cover is kokoc image', /kokoc/.test(kokoc.image.src), kokoc.image.src);
} finally {
  await server.close();
}
process.exitCode = failed ? 1 : 0;
