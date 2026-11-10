/**
 * Genetic testing lab website audit — AI-project case, shown only on the /ai-portfolio landing.
 * Same object shape as spotlessCase.js; sections follow the case frame from the case guide, without
 * Key flows. Audit and recommendations only: the concepts and the redesign are left out on purpose.
 * Under NDA: the client is never named. Frames are Figma exports with the name, logo, phones,
 * address, city, licence number, prices, people's photos and publications masked on the raster.
 * Copy: docs/review/genetics-case/copy.md. `caption` on featureMedia is stored for the frame
 * captions that are still in development; the page does not render it yet.
 */
import geneticsBacklog from '../assets/cases/genetics/genetics-audit-backlog.webp';
import geneticsContrast from '../assets/cases/genetics/genetics-audit-contrast.webp';
import geneticsMeasurements from '../assets/cases/genetics/genetics-audit-measurements.webp';
import geneticsRedundant from '../assets/cases/genetics/genetics-audit-redundant.webp';
import geneticsUsability from '../assets/cases/genetics/genetics-audit-usability.webp';
import geneticsVerdict from '../assets/cases/genetics/genetics-audit-verdict.webp';
import geneticsBrandbook from '../assets/cases/genetics/genetics-brandbook-laws.webp';
import geneticsCardImage from '../assets/cases/genetics/genetics-card.webp';
import geneticsHero from '../assets/cases/genetics/genetics-hero.webp';

export const geneticsCaseStudy = {
  slug: 'genetics-audit',
  backHref: '/ai-portfolio',
  hero: {
    title: 'Genetic Testing Lab Website Audit',
    description:
      'A genetic testing laboratory had a strong concept for its new website and a draft that did not hold together. I audited the draft with an AI agent, measured where the design system broke, and turned the findings into rules and a 24-task backlog.',
    meta: 'Client project under NDA / Design audit',
    image: {
      src: geneticsHero,
      alt: 'Audit verdict: scores by area, from 9/10 for the concept to 3/10 for typography',
    },
    stats: [
      { value: '5', label: 'key screens measured by script' },
      { value: '7 of 17', label: 'colour pairs failed WCAG AA' },
      { value: '24', label: 'backlog tasks in 3 waves' },
    ],
    points: ['Figma', 'Claude', 'Figma MCP'],
  },
  sections: [
    {
      id: 'problem',
      navLabel: 'Problem',
      title: 'A Strong Idea, a Draft Execution',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'People come to a genetics lab worried. Many are pregnant or facing a serious diagnosis. The site has to explain complex tests calmly and clearly.',
            'The client saw itself closer to a scientific medical centre than to an online shop. Its team felt neither the old site nor the new draft told visitors where they had landed.',
            'I was handed a ready concept, Manifestation, and a draft of the key screens. The idea was strong. The execution did not hold together.',
          ],
        },
        {
          type: 'painCards',
          items: [
            'No answer on the first screen. The home page had no headline offer. Proof of trust sat more than three screens down.',
            'A system that disagrees with itself. 16 font sizes, 14 corner radii for 4 tokens, 44 text styles.',
            'Hard to read. The main button had a contrast of 3.76:1, below the WCAG AA minimum.',
          ],
        },
      ],
    },
    {
      id: 'context',
      navLabel: 'Context',
      title: 'What I Started With',
      parts: [
        {
          type: 'noteCard',
          title: 'Role, team, timeline',
          items: [
            'Role: design audit, together with an AI agent',
            'Team: solo with an AI agent',
            'Timeline: about 4 weeks, July–August 2026',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The product',
              paragraphs: [
                'A full-cycle genetic testing laboratory with two audiences. Patients buy tests for themselves. Doctors, clinics and researchers order lab services.',
                'The concept asked for pages for patients to feel more alive, and pages for business and science to stay restrained.',
              ],
            },
            {
              type: 'list',
              heading: 'What I was given',
              items: [
                'The Manifestation concept: glass, focus, living shapes, magazine-style layouts.',
                'A moodboard with 3 directions and a 25-slide presentation.',
                'A component library with 559 components.',
                'Draft screens: home, catalogue, test page, and the science service page in light and dark themes.',
              ],
            },
            {
              type: 'list',
              heading: 'What I did',
              items: [
                'Audited the draft in three layers: the design system, usability heuristics and accessibility.',
                'Ranked the problems and turned them into a backlog and a set of rules.',
                'Worked with an AI agent: it ran the measurements across screens, I set the method and made the calls.',
              ],
            },
            {
              type: 'list',
              heading: 'Constraints',
              items: [
                'Client under NDA: no name, brand or prices in this case.',
                "The brand typeface was not available to the agent's Figma plugin.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'audit',
      navLabel: 'Audit',
      title: 'The Audit',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            "I audited the draft in three layers: the design system, Nielsen's usability heuristics, and WCAG 2.1 AA.",
            'The agent walked through the 5 key screens by script and counted styles, sizes, radii and colours. So the findings are numbers from the file, not impressions.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'stats',
              heading: 'The verdict: the idea is strong, the execution is a draft',
              stats: [
                { value: '9/10', label: 'the concept' },
                { value: '8/10', label: 'the component library, 559 components' },
                { value: '4/10', label: 'how closely screens follow the tokens' },
                { value: '3/10', label: 'typography' },
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsVerdict,
            alt: 'Audit verdict: scores by area, from 9/10 for the concept to 3/10 for typography',
          },
          caption: 'The verdict: a strong idea, a draft execution.',
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Measured: where the system breaks',
              items: [
                'Text styles were applied to only 46–96% of text, depending on the screen.',
                '16 font sizes across the screens.',
                '14 corner radii, while the kit had 4 radius tokens.',
                '44 text styles.',
                '0 status colours: nothing for success, warning or error.',
                'Arial and Verdana on the test page, next to the brand fonts.',
                'Grey #d9d9d9 placeholders and plain #000000 used 61 times.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsMeasurements,
            alt: 'Measurement table for 5 key screens with counts of font sizes, radii and text styles',
          },
          caption: 'Measured by script: 16 font sizes, 14 radii for 4 tokens, 44 text styles.',
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Contrast: 7 of 17 key pairs fail AA',
              paragraphs: [
                'I checked 17 key text and background pairs against WCAG 2.1 AA. 7 failed.',
                'The worst one was the most used: the main button, at 3.76:1.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsContrast,
            alt: 'WCAG 2.1 AA contrast table for 17 colour pairs, with failing pairs marked',
          },
          caption: '7 of 17 key pairs fail AA, including the main button at 3.76:1.',
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Promises that did not reach the screens',
              items: [
                'The moodboard promised a green accent. No screen used it.',
                'The presentation had no before and after, no hover states and not a single metric.',
              ],
            },
            {
              type: 'list',
              heading: 'Usability: P0 to P2',
              items: [
                'Home: no headline offer, and proof of trust below three screens.',
                'Catalogue: no sorting, the price is not highlighted, and a round icon stands in for a button.',
                'Test page: the comparison of test options is cut off, and nothing says what happens after the result.',
                'Everywhere: no interface states, no keyboard focus, no mobile layout for the catalogue and the test page.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsUsability,
            alt: 'Usability findings by screen, each with a priority from P0 to P2',
          },
          caption:
            'Usability issues ranked P0 to P2, from the missing headline offer to absent keyboard focus.',
        },
        {
          type: 'insightCards',
          heading: 'What the audit showed',
          items: [
            'I1. The kit was rich, the rules were missing. 559 components, yet 16 font sizes and 14 radii. Without rules, every screen drifted.',
            'I2. Accessibility failed where it matters most. The main button failed AA. For worried readers, legibility is part of care.',
            'I3. Too many versions of the same thing. 13 button sets and 5 service card variants did one job.',
          ],
        },
      ],
    },
    {
      id: 'recommendations',
      navLabel: 'Recommendations',
      title: 'What to Fix, and in What Order',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The audit showed the problem was missing rules, not a weak idea. So the recommendations keep the concept and fix how it is applied.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'A backlog of 24 tasks in 3 waves',
              paragraphs: ['So the team knows what to fix first.', 'From insights I1–I3 · Recommendation'],
            },
            {
              type: 'text',
              heading: 'Cut what repeats',
              paragraphs: ['13 button sets down to 3, 5 service cards down to 1.', 'From insight I3 · Recommendation'],
            },
            {
              type: 'text',
              heading: 'Violet 700 for actions',
              paragraphs: [
                'It is already in the palette and reaches 5.77:1 on white, against 3.76:1 for the current main button.',
                'From insight I2 · Recommendation',
              ],
            },
            {
              type: 'text',
              heading: 'Five laws that turn the concept into checkable rules',
              paragraphs: ['A screen that breaks a law does not pass.', 'From insight I1 · Recommendation'],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsBacklog,
            alt: 'Audit backlog: 24 tasks grouped into 3 waves',
          },
          caption: 'The audit turned into a plan: 24 tasks in 3 waves.',
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsRedundant,
            alt: 'What to remove: button sets and service card variants',
          },
          caption: 'Less to maintain: 13 button sets down to 3, 5 service cards down to 1.',
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'The five laws',
              items: [
                'I. Clarity over effect. Glass, blur and gradient never stand between a person and information.',
                'II. One accent per screen. Violet is an event, not a fill.',
                'III. Data is strict, care is soft. Soft shapes where a person is worried, a strict grid and numbers where they study.',
                'IV. Every card answers four questions: what it is, how much, how fast, what to press.',
                'V. Science comes before payment. Proof such as the licence, the volume of work and years in practice appears along the way, not in a separate section.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: geneticsBrandbook,
            alt: "Five laws for the website design, each with do and don't examples",
          },
          caption: 'Five laws that turn the concept into rules a screen can pass or fail.',
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: 'Where It Is Now',
      parts: [
        {
          type: 'noteCard',
          title: 'Handed over, not measured yet',
          items: [
            'The audit, the rules and a 24-task backlog in 3 waves were handed over.',
            'The site has not launched, so there are no product numbers yet.',
          ],
        },
      ],
    },
    {
      id: 'learned',
      navLabel: 'What I learned',
      title: 'What I Learned',
      parts: [
        {
          type: 'noteCard',
          items: [
            'An agent makes an audit faster: it counts sizes, radii and contrast across every key screen, so I start from numbers.',
            'But it mixes up facts. Figures about the company differed between versions of the draft. Every fact goes back to the client before it ships.',
          ],
        },
      ],
    },
  ],
};

/** Card for the AI-projects group on /ai-portfolio — same shape as an aiProjects.items entry. */
export const geneticsCard = {
  id: 'genetics-audit',
  title: 'Genetic Testing Lab Website Audit',
  category: 'Web / Design Audit',
  description:
    "An audit of a genetic testing laboratory's website draft: measured system issues, WCAG contrast, usability, and a 24-task plan to fix them.",
  metrics: ['Design audit', 'Under NDA', 'Not launched'],
  surface: 'lavender',
  image: {
    src: geneticsCardImage,
    alt: 'Audit verdict for a genetic testing lab website: scores by area, from 9/10 for the concept to 3/10 for typography',
  },
  href: '/genetics-audit',
};
