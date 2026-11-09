/**
 * Spotless — small AI-project case, shown only on the /ai-portfolio landing.
 * Same object shape as designCringeCaseStudy in caseStudies.js.
 * Frames: Playwright captures of the Spotless build (dist), EN UI, windows cut out of their backdrop. The scan is a film photo from
 * src/assets/film with synthetic dust added, so the before/after pair is illustrative, not a real roll.
 * Facts: Spotless README.md, docs/kb/context.md, docs/kb/decisions.md, git log (5 commits, 23–24.10.2026),
 * src/exporter.ts. Not deployed; no prices, no users besides the author.
 */
import spotlessAfter from '../assets/cases/spotless-after.webp';
import spotlessBefore from '../assets/cases/spotless-before.webp';
import spotlessBrush from '../assets/cases/spotless-brush.webp';
import spotlessCardImage from '../assets/cases/spotless-card.webp';
import spotlessUpload from '../assets/cases/spotless-upload.webp';

export const spotlessCaseStudy = {
  slug: 'spotless',
  backHref: '/ai-portfolio',
  hero: {
    title: 'Spotless',
    description:
      'A browser tool that cleans dust, hairs, scratches and streaks from film scans. I built it for my own scans: everything runs on the device, and photos are never uploaded.',
    meta: 'Side project / Photo tooling',
    image: {
      // The film roll window, cut out on transparency: shown whole, no backdrop.
      src: spotlessCardImage,
      alt: 'Spotless film roll: three scans with dust, scratch and streak counts',
    },
    stats: [
      { value: '2 days', label: 'from first commit to the brush' },
      { value: '0', label: 'photos uploaded to a server' },
      { value: '3', label: 'defect types: dust, scratches, streaks' },
    ],
    points: ['React', 'TypeScript', 'Web Workers', 'Claude Code'],
  },
  sections: [
    {
      id: 'idea',
      navLabel: 'Idea',
      title: 'The Idea',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Every film scan comes back with dust, hairs and scratches. Cleaning them by hand is slow, one spot at a time.',
            'I wanted my black-and-white negatives clean for this portfolio. Spotless finds the defects and fills them in, with grain that matches the photo. Colour scans work too.',
          ],
        },
        {
          type: 'imageBand',
          // The window is cut out of its backdrop, so no plate around it either.
          variant: 'bare',
          media: {
            type: 'image',
            src: spotlessUpload,
            alt: 'Spotless upload screen with a drop zone for film scans',
          },
        },
      ],
    },
    {
      id: 'approach',
      navLabel: 'Approach',
      title: 'How It Works',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'What happens to a scan',
              items: [
                'The image is checked for thin, contrasting spots and lines against the local grain',
                'Each find is sorted into dust, a scratch or a full-frame streak',
                'Busy texture is rejected, so fabric and edges stay untouched',
                'Holes are filled from the surroundings, then grain is added back',
              ],
            },
            {
              type: 'text',
              heading: 'Fast on the device',
              paragraphs: [
                'Processing runs in a pool of Web Workers. Previews are made at 2000 px; full resolution is used only on export, as JPEG or PNG, into a zip or a folder.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'One rule from the start',
          paragraphs: [
            'Photos never leave the browser. There is no server to upload to, so there is nothing to trust.',
          ],
        },
      ],
    },
    {
      id: 'detail',
      navLabel: 'Detail',
      title: 'Stop Erasing the Picture',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The first version, still called Dustoff, cleaned too eagerly. On my test scans it removed lips, frame rims and fabric along with the dust.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'What changed the same day',
              items: [
                'Thresholds follow the local grain, with an absolute contrast floor',
                'Spots on uneven backgrounds — edges, stripes, rims — are skipped',
                'A scratch has to be hairline-thin, strong and long',
                'Dark defects get stricter rules than light ones',
              ],
            },
          ],
        },
        {
          type: 'beforeAfterSlider',
          before: {
            src: spotlessBefore,
            alt: 'Film scan with dust and hairs before cleaning',
          },
          after: {
            src: spotlessAfter,
            alt: 'The same film scan after cleaning in Spotless',
          },
        },
      ],
    },
    {
      id: 'brush',
      navLabel: 'Brush',
      title: 'For What It Misses',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Stricter rules brought the opposite problem: long pale scratches and drying marks slipped through.',
            'So I added two things. A detector looks for faint lines in 8 directions at 2 scales. And the detail view got a brush: paint over anything detection missed.',
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: spotlessBrush,
            alt: 'Spotless detail view with the brush painting over a faint scratch',
          },
        },
      ],
    },
    {
      id: 'status',
      navLabel: 'Status',
      title: 'Where It Is Now',
      parts: [
        {
          type: 'noteCard',
          title: 'Not public yet',
          items: [
            'Works locally, in English and Russian. Not deployed yet.',
            'So far I am the only user. Next: decide where it lives and which feature comes first.',
          ],
        },
      ],
    },
  ],
};

/** Card for the AI-projects group on /ai-portfolio — same shape as an aiProjects.items entry. */
export const spotlessCard = {
  id: 'spotless',
  title: 'Spotless',
  category: 'Web Tool / Film Scans',
  description:
    'Cleans dust, hairs, scratches and streaks from film scans right in the browser — photos are never uploaded.',
  metrics: ['In the browser', 'Not deployed yet'],
  // Existing surface reused; developer may add a dedicated one.
  surface: 'blue',
  image: {
    src: spotlessCardImage,
    alt: 'Spotless film roll: three scans with dust, scratch and streak counts',
  },
  href: '/spotless',
};
