import { defineConfig } from 'vite';

// The analytics dashboard (stats.html) ships only with the full portfolio; the
// standalone builds on Netlify (the case, the AI portfolio) have no API behind it.
const caseOnly = process.env.VITE_CASE_ONLY === 'true';
const aiOnly = process.env.VITE_AI_ONLY === 'true';

export default defineConfig({
  base: '/',
  build: {
    // The AI portfolio builds next to the main site, never over it.
    outDir: aiOnly ? 'dist-ai' : 'dist',
    rollupOptions: {
      input: caseOnly || aiOnly ? { main: 'index.html' } : { main: 'index.html', stats: 'stats.html' },
    },
  },
});
