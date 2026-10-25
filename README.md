# Portfolio — Product Designer

Source of [vberestova.com](https://vberestova.com): a React + Vite site in English and Russian
(language switch in the header, texts in `src/data/*.ru.js` and `src/i18n/ui.js`).

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The output is generated in `dist/`. `postbuild` pre-renders an `index.html` for every route
listed in `scripts/deploy-targets.mjs`.

## Deploys

- **vberestova.com** — the built `dist/` is published to the `docs/` folder of
  `Portfolio_product_designer_site` and served by GitHub Pages (`public/CNAME`).
- **Pet Injection Tracker** — the same build with `VITE_CASE_ONLY=true` (see `netlify.toml`)
  ships only that case to its own Netlify site.
- `api/` and `stats.html` are the visit analytics: serverless functions for Vercel
  (`vercel.json`) and the `/stats` dashboard.
