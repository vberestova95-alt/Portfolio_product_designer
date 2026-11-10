/**
 * Copy for the /ai-portfolio landing page (EN).
 * `source` on number tiles is a note for us — it is never rendered on the page.
 * Review copy with sources and open questions: docs/review/ai-landing/copy.md (main repo).
 */
export const aiPortfolio = {
  meta: {
    title: 'AI Portfolio - Vladislava Berestova',
    description:
      'Product designer who builds with AI agents: six products shipped from spec to code, and how the pipeline runs.',
  },

  hero: {
    eyebrow: 'AI Portfolio',
    title: 'Product designer who ships with AI agents',
    description:
      'In a year I went from my first Figma plugin to six products built with AI agents, three of them live. I set the goal and the direction, agents write the code, and the product decisions stay mine.',
  },

  pipeline: {
    title: 'How I work with AI',
    lead: 'I run agents the way a designer runs a dev team: references first, then short, exact edits.',
    steps: [
      {
        title: 'References, not descriptions',
        text: 'I start with the goal, screenshots, Figma frames and live links instead of long explanations.',
      },
      {
        title: 'Spec before code',
        text: 'For bigger products we agree on a plan first — the Cringe-meter spec was 42 KB, and the agent built from it without questions.',
      },
      {
        title: 'A team of agents',
        text: 'Up to 5 agents at once, each with a role: orchestrator, developer, designer, tester and others.',
      },
      {
        title: 'Numbered, exact edits',
        text: 'One fix at a time with real values, like "32 px gap", checked on desktop, tablet and phone.',
      },
      {
        title: 'Ships on my yes',
        text: 'Nothing is pushed or deployed until I approve it. What goes into the product is my call.',
      },
    ],
    tools: ['Claude Code', 'Codex', 'Figma MCP', 'Figma Make'],
  },

  numbers: {
    title: 'In numbers',
    items: [
      {
        value: '6',
        label: 'products built with AI, 3 of them live',
        source:
          'Report «Мой опыт с AI-инструментами» (22.10.2026), «Коротко» and «Продукты, собранные с AI». Fluffy Chumb (7th) not counted — see open questions.',
      },
      {
        value: '5',
        label: 'agents working in parallel at peak',
        source:
          'Report 22.10.2026, «Сколько агентов работает одновременно»: max 5 (1 main session + 4 subagents), 13.10.2026; usually 1–2.',
      },
      {
        value: '~24 h',
        label: 'from first commit to a live site',
        source:
          'Report 22.10.2026, «Время до первого деплоя»: vberestova.com 01.08 01:00 → 02.08 00:48; median of 3 projects — 24 h.',
      },
      {
        value: '~4 days',
        label: 'to ship a product with a backend',
        source:
          'Report 22.10.2026, «Время до первого деплоя»: Cringe-meter 16.07 15:37 (plan) → 20.07 23:55 (AWS Lambda), ~4.3 days.',
      },
      {
        value: '550+',
        label: 'automated tests across 3 Figma plugins',
        source: 'portfolioData.js aiProjects ds-plugins metrics; caseStudies.js DS Plugins stats and «Tests as a safety net».',
      },
    ],
  },

  cases: {
    title: 'Selected work',
    lead: 'Products I built myself with AI agents.',
    groups: [
      {
        id: 'ai',
        title: 'Built with AI',
        lead: 'Tools and side projects I took from the problem and the spec to working code.',
      },
    ],
  },
};
