import { defineConfig } from 'vite';

// The analytics dashboard (stats.html) ships only with the full portfolio; the
// standalone case build on Netlify has no API behind it.
const caseOnly = process.env.VITE_CASE_ONLY === 'true';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: caseOnly ? { main: 'index.html' } : { main: 'index.html', stats: 'stats.html' },
    },
  },
});
