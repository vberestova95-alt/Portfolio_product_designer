import designCringeScore from '../assets/cases/design-cringe-score.jpg';
import designCringeLanding from '../assets/cases/design-cringe-landing.jpg';
import designCringeCategories from '../assets/cases/design-cringe-categories.jpg';
import designCringeIssues from '../assets/cases/design-cringe-issues.jpg';
import designCringeClean from '../assets/cases/design-cringe-clean.jpg';
import designCringeMobileBad from '../assets/cases/design-cringe-mobile-bad.jpg';
import designCringeMobileClean from '../assets/cases/design-cringe-mobile-clean.jpg';
import redesignVideo from '../assets/redesign-cards.mp4';
import betboomCaseHero from '../assets/betboom-case-hero.png';
import betboomFeaturedDesktop from '../assets/cases/betboom-featured-desktop.png';
import betboomHypothesis from '../assets/betboom-hypothesis.jpg';
import betboomCoverImage from '../assets/betboom-cover.png';
import betboomTopScreen from '../assets/betboom-top-screen.png';
import iquotoCaseHero from '../assets/cases/iquoto-desktop.png';
import iquotoAsIsVideo from '../assets/cases/iquoto-as-is.webm';
import iquotoFunnel from '../assets/cases/iquoto-funnel.svg';
import iquotoMapAsIs from '../assets/cases/iquoto-map-as-is.jpg';
import iquotoMapToBe from '../assets/cases/iquoto-map-to-be.jpg';
import iquotoVariants from '../assets/cases/iquoto-variants.png';
import iquotoResult from '../assets/cases/iquoto-result.png';
import betboomAbTestVideo from '../assets/betboom-ab-test.mp4';
import catAppScreens from '../assets/cases/cat-app-screens.svg';
import catWeeklyTrackerVideo from '../assets/cases/cat-weekly-tracker.mp4';
import catTrackerScreen from '../assets/cases/cat-tracker-screen1.png';
import catSolutionScreens from '../assets/cases/cat-solution-screens.png';
import catConceptScreens from '../assets/cases/cat-concept-screens.png';
import petTrackerCoverScreens from '../assets/cases/pet-tracker-cover-screens.png';
import kokocCaseHero from '../assets/cases/kokoc-main-desktop.png';
import kokocAbout from '../assets/cases/kokoc-about.png';
import kokocPrototype from '../assets/cases/kokoc-prototype.png';
import kokocConcept1 from '../assets/cases/kokoc-concept-1.png';
import kokocConcept2 from '../assets/cases/kokoc-concept-2.png';
import kokocVideo1 from '../assets/cases/kokoc-video-1.mp4';
import kokocVideoMenu from '../assets/cases/kokoc-video-menu.mp4';
import kokocVideoCards from '../assets/cases/kokoc-video-cards.mp4';
import yandexProdFinal from '../assets/cases/yandex-prod-final.mp4';
import yandexFeedVideo from '../assets/cases/yandex-feed-video.mp4';
import yandexFeedPersonal from '../assets/cases/yandex-feed-personal.png';
import yandexProdScreen from '../assets/cases/yandex-prod-screen1.png';
import yandexAbVariants from '../assets/cases/yandex-ab-variants.png';
import yandexDesktopPatterns from '../assets/cases/yandex-desktop-patterns.png';
import yandexFeedAlt from '../assets/cases/yandex-feed-alt.png';
import yandexFeedTop from '../assets/cases/yandex-feed-top.png';
import yandexFiltersFocus from '../assets/cases/yandex-filters-focus.png';
import yandexPersonalization from '../assets/cases/yandex-personalization.png';
import yandexMvpScreens from '../assets/cases/yandex-mvp-screens.png';
import yandexCoverScreens from '../assets/cases/yandex-cover-screens.png';
import yandexProcessCards from '../assets/cases/yandex-process-cards.png';
import yandexStoryFocus from '../assets/cases/yandex-story-focus.png';

const heroImage = betboomCoverImage;
const sportsTasksImage = betboomHypothesis;
const hypothesisResultImage = betboomCaseHero;

export const catAppCaseStudy = {
  slug: 'cat-app',
  backHref: '/',
  hero: {
    title: 'Pet Injection Tracker',
    description:
      'My cat needs insulin twice a day. Missing one matters, and a notes app is a bad place to track that — so I built the thing I wanted to exist.',
    meta: 'Pet-tech concept / Side project',
    image: {
      src: petTrackerCoverScreens,
      alt: 'Three mobile screens from the Pet Injection Tracker',
    },
    stats: [
      { value: '2', label: 'happy users' },
      { value: '1', label: 'healthy cat' },
      { value: 'infinite', label: 'reasons to show a cat a phone' },
    ],
    points: ['Codex', 'Claude Code', 'Figma Make'],
  },
  sections: [
    {
      id: 'goal',
      navLabel: 'Goal',
      title: 'Product Goal',
      parts: [
        {
          type: 'noteCard',
          title: 'What it has to do',
          items: [
            'Log an injection in seconds.',
            'Keep track of which spot comes next.',
            'Show the state of the week without asking for it.',
            'Hold the whole history in one place.',
            'Ask as little of the owner as possible.',
          ],
        },
      ],
    },
    {
      id: 'solution',
      navLabel: 'Solution',
      title: 'Solution',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The tracker is built on a photo of the pet. It had to work for several people in a household with no explanation, which rules out anything resembling a form.',
            'The photo does the navigation. It also changes what the app feels like — a care routine rather than a spreadsheet.',
          ],
        },
        {
          type: 'imageBand',
          media: {
            type: 'image',
            src: catSolutionScreens,
            alt: 'Concept screens for the pet injection tracker',
          },
        },
      ],
    },
    {
      id: 'concept',
      navLabel: 'Concept',
      title: 'Core Concept',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Three things on the home screen',
              items: [
                'The pet.',
                'Injection markers you can tap.',
                'The week.',
              ],
            },
          ],
        },
        {
          type: 'imageBand',
          label: 'Key screens',
          media: {
            type: 'image',
            src: catConceptScreens,
            alt: 'Several screens from the cat app concept',
          },
        },
      ],
    },
    {
      id: 'tracker',
      navLabel: 'Tracker',
      title: 'Visual Weekly Tracker',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'One marker, one injection.',
            'No reports, no second screen — the week is legible from where you already are.',
          ],
        },
        {
          type: 'phonePair',
          items: [
            {
              type: 'video',
              src: catWeeklyTrackerVideo,
              alt: 'Video of the visual weekly tracker for pet injections',
            },
            {
              type: 'image',
              src: catTrackerScreen,
              alt: 'Weekly injection tracker screen for pets',
            },
          ],
        },
        {
          type: 'insightCards',
          heading: 'Answerable in one look',
          items: [
            'What is done.',
            'What was missed.',
            'What is next.',
          ],
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: 'Result',
      parts: [
        {
          type: 'noteCard',
          title: 'Where it is now',
          items: [
            'In beta.',
            'I am looking for people with a similar routine — I want to test the flow against real habits, not just mine.',
          ],
        },
      ],
    },
  ],
};

export const betboomPassCaseStudy = {
  slug: 'betboom-pass',
  backHref: '/',
  hero: {
    title: 'BetBoom PASS',
    description:
      'A bonus programme that started life as an esports marketing tool. Over a year I turned it into a product section that could carry classic sports too, without losing the audience that was already there.',
    meta: 'Product Designer / 2025-2026',
    image: {
      src: heroImage,
      alt: 'Hero screen of the BetBoom PASS case study',
    },
    stats: [
      { value: '+75%', label: 'Retention' },
      { value: '+60%', label: 'DAU' },
      { value: 'NDA', label: 'Users' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'About',
      title: 'About the Project',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'What BetBoom Pass is',
              paragraphs: [
                'Users complete tasks and earn rewards: free bets, in-game skins, prizes. Simple enough on the surface.',
                'The catch was who it was built for. At launch the whole thing was shaped around gamers and esports fans, and those habits were working. Anything we added had to leave them alone.',
              ],
            },
            {
              type: 'text',
              heading: 'How it ended up inside the core product',
              paragraphs: [
                'It began as a marketing tool. By the time I joined it had grown into a real section of the core product, live in both the app and on web — while the original standalone platform kept running alongside it. Two surfaces, one set of mechanics.',
              ],
            },
            {
              type: 'text',
              heading: 'The actual goal',
              paragraphs: [
                'Bring a new audience into the gamification flow with classic sports tasks, and lift LTV across segments.',
                'Football, basketball, hockey, tennis, table tennis. A very different crowd from Dota and CS players, sharing the same screen.',
              ],
            },
            {
              type: 'list',
              heading: 'What we watched',
              items: [
                'MAU -> WAU -> DAU',
                'Retention (D7, D30)',
                'Churn rate — the early warning that we were breaking things for the old audience',
              ],
            },
            {
              type: 'list',
              heading: 'What I did',
              items: [
                'Started from nothing and gathered the requirements myself',
                'UX and user flows',
                'Prototypes and the visual concept',
                'Every stakeholder presentation',
                'Split the design work and coordinated the other designers',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'hypothesis',
      navLabel: 'A/B Test',
      title: 'Running the A/B Test',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Before redesigning anything, I wanted to know whether the esports audience would tolerate classic sports at all.',
            'The hypothesis: a wider task catalog raises engagement, does not push the current audience out, and gives us room to grow.',
          ],
        },
        {
          type: 'imageBand',
          label: 'New classic sports tasks',
          media: {
            type: 'video',
            src: betboomAbTestVideo,
            alt: 'New classic sports tasks in BetBoom PASS',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'What we wanted to find out',
              paragraphs: [
                'Whether the product actually needed a new category of tasks at all — and whether the mechanic could carry it without damaging what already worked.',
              ],
            },
            {
              type: 'text',
              heading: 'How we ran it',
              paragraphs: [
                'An A/B test on the gamification elements, with task cards for football, basketball, hockey, and tennis dropped into the existing catalog.',
              ],
            },
            {
              type: 'text',
              heading: 'What came back',
              paragraphs: [
                'The response was positive, and football pulled the strongest numbers of the four.',
                'That reframed the whole thing. This was not a content update — it was a growth lever for retention and DAU.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: hypothesisResultImage,
            alt: 'Hypothesis validation results in the BetBoom PASS interface',
          },
        },
        {
          type: 'noteCard',
          title: 'Three things the test settled',
          items: [
            'Classic sports tasks land well',
            'The existing audience stayed put',
            'The mechanic can carry more than it currently does',
          ],
          paragraphs: [
            'Which meant the next problem was structural: the card itself, and the logic of the section around it.',
          ],
        },
      ],
    },
    {
      id: 'redesign',
      navLabel: 'Redesign',
      title: 'Task Card Redesign',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The classic sports audience wanted different things from the card. Not atmosphere — rules and rewards, stated plainly. So I pulled the emphasis off the illustration and put it on the information.',
          ],
        },
        {
          type: 'noteCard',
          title: 'What was wrong with the old card',
          compact: true,
          items: [
            'The illustration took all the attention.',
            'The title did not explain the rules.',
            'It led with task type — but analytics showed people filter by category.',
          ],
        },
        {
          type: 'featureMedia',
          wide: true,
          media: {
            type: 'video',
            src: redesignVideo,
            alt: 'BetBoom PASS task card redesign before and after',
          },
        },
        {
          type: 'bento',
          label: 'Anatomy of the new card',
          tiles: [
            {
              src: betboomFeaturedDesktop,
              alt: 'Category filters and sorting above the task grid',
              span: 'full',
              zoom: 1.5,
              fx: '47%',
              fy: '52.6%',
              caption: 'Filters moved to category, because that is how people actually searched.',
            },
            {
              src: betboomFeaturedDesktop,
              alt: 'Close-up of a single task card',
              span: 'half',
              zoom: 3.6,
              fx: '20.5%',
              fy: '58.6%',
              caption: 'The condition sits first, the illustration no longer competes with it.',
            },
            {
              src: betboomFeaturedDesktop,
              alt: 'Task card with a countdown timer',
              span: 'half',
              zoom: 3.6,
              fx: '47%',
              fy: '74.5%',
              caption: 'Reward and deadline are readable without opening the card.',
            },
            {
              src: betboomFeaturedDesktop,
              alt: 'Grid of task cards across sports categories',
              span: 'wide',
              zoom: 1.8,
              fx: '47%',
              fy: '66.5%',
              caption: 'One grid holds esports and classic sports without splitting the section.',
            },
            {
              src: betboomTopScreen,
              alt: 'Promo task card on the platform home screen',
              span: 'third',
              zoom: 3.6,
              fx: '72%',
              fy: '54.3%',
              caption: 'Promo tasks reuse the same anatomy.',
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'What followed the card',
          items: [
            'New filters',
            'New task categories',
            'Updated widget logic',
            'Promo tasks',
          ],
          paragraphs: [
            'One card is never one card. Once the hypothesis held, we went after the layer around it — mostly to stop inheriting old decisions every time we added a mechanic.',
          ],
        },
      ],
    },
    {
      id: 'mechanics',
      navLabel: 'Mechanic',
      title: 'A New Mechanic',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The problem',
              paragraphs: [
                'More tasks meant more repetition. The section started to read as noise.',
              ],
            },
            {
              type: 'text',
              heading: 'What I did',
              paragraphs: [
                'A levels mechanic. It gave the scenario a shape people could follow, and let the catalog grow without the interface growing with it.',
              ],
            },
            {
              type: 'list',
              heading: 'Why it mattered',
              items: [
                'Users could finally tell what a reward was worth and what it would cost them',
                'The business got a catalog it could keep filling',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'active-tasks',
      navLabel: 'Active Tasks',
      title: 'Active Tasks',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The problem',
              paragraphs: [
                'More sports tasks meant tasks that contradicted each other. Two hockey tasks on two different matches, both active — the system could not count them both, so it simply would not let you.',
              ],
            },
            {
              type: 'text',
              heading: 'What I did',
              paragraphs: [
                'A modal that explains the conflict at the moment it happens. The rule did not change; the feeling of hitting a wall did.',
              ],
            },
            {
              type: 'list',
              heading: 'The two things it has to do',
              items: [
                'Leave a way back to the task already running',
                'Read as a rule, not as a bug',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: 'Result',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'A year in, BetBoom Pass is no longer a marketing tool with a product bolted on. It is a section that can be extended without a redesign every time.',
          ],
        },
        {
          type: 'beforeAfterSlider',
          before: {
            src: hypothesisResultImage,
            alt: 'BetBoom PASS interface before the redesign',
          },
          after: {
            src: sportsTasksImage,
            alt: 'BetBoom PASS interface after the redesign',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'stats',
              heading: 'Key metrics',
              stats: [
                { value: '+75%', label: 'Retention' },
                { value: '+60%', label: 'DAU' },
                { value: 'NDA', label: 'Users' },
              ],
            },
            {
              type: 'list',
              heading: 'Where it left the product',
              items: [
                'Classic sports stuck — the audience took to them',
                'New tasks can be added without touching the mechanic',
                'A bigger catalog means more LTV headroom across segments',
                'People come back to the section instead of visiting it once',
                'The next change will not have to start by undoing this one',
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const iquotoCaseStudy = {
  slug: 'iquoto',
  backHref: '/',
  hero: {
    title: 'IQuoto',
    description:
      'Seven out of ten people abandoned registration at the personal data step. I spent the project figuring out how much of that data we were legally required to ask for, and cutting the rest.',
    meta: 'Product Designer / 2022',
    image: {
      src: iquotoCaseHero,
      alt: 'Hero screen of the IQuoto case study',
    },
    stats: [
      { value: '70%', label: 'dropped off at the personal data step' },
      { value: '5', label: 'steps in the original flow' },
      { value: 'NDA', label: 'client-side test results' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'About',
      title: 'About the Product',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'IQuoto is an online trading platform covering several asset classes, aimed at beginners and experienced traders alike.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The problem',
              paragraphs: [
                'Trading platforms ask for a lot, and much of it is not optional — regulation decides that. But somewhere between what the law requires and what the form demanded, we were losing more than 70% of people at the personal information step.',
                'The full funnel, from registration to the first meaningful action in the product:',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            type: 'image',
            src: iquotoFunnel,
            alt: 'IQuoto registration funnel',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'ordered-list',
              heading: 'What I was aiming at',
              items: [
                'More people finishing registration.',
                'Fewer people leaving in the middle of it.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'as-is',
      navLabel: 'AS IS',
      title: 'Current Registration Flow (AS IS)',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'This is everything we asked for before letting anyone near the product:',
          ],
        },
        {
          type: 'featureMedia',
          wide: true,
          media: {
            type: 'video',
            src: iquotoAsIsVideo,
            alt: 'Recording of the current registration flow',
          },
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'I mapped the whole journey step by step. Friction is much easier to argue about once it is on a wall.',
          ],
        },
        {
          type: 'imageBand',
          label: 'Registration flow AS IS',
          media: {
            src: iquotoMapAsIs,
            alt: 'Registration process map AS IS',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Where it hurt',
              items: [
                'Five steps, each one collecting more data.',
                'All of it demanded before the product gave anything back.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'What I bet on',
          items: [
            'Fewer steps, still inside the legal constraints, means higher conversion.',
            'Less information asked means less resistance to giving it.',
            'A registration bonus came up. We decided against it — it treats the symptom.',
          ],
        },
      ],
    },
    {
      id: 'to-be',
      navLabel: 'TO BE',
      title: 'New Registration Flow (TO BE)',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'A shorter map: fewer steps, faster route to the product. I took it through the client analytics and legal teams before anyone drew a screen.',
          ],
        },
        {
          type: 'beforeAfterSlider',
          before: {
            src: iquotoMapToBe,
            alt: 'Registration process TO BE',
          },
          after: {
            src: iquotoMapAsIs,
            alt: 'Registration process AS IS',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'stats',
              heading: 'The difference',
              stats: [
                { value: '5 -> 3', label: 'steps instead of five' },
                { value: '-40%', label: 'input fields' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'variants',
      navLabel: 'Options',
      title: 'Design Options',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The client wanted the registration flow animated. I built both versions and made the case for the plain one.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'ordered-list',
              heading: 'Why the plain form won',
              items: [
                'An animated flow adds actions and steps at the exact point where the funnel is already leaking.',
                'People fill forms out of order and re-read fields while typing. The animated version made that impossible.',
                'The development budget was fixed. Scope creep here was a real risk, not a hypothetical one.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            type: 'image',
            src: iquotoVariants,
            alt: 'Two registration options: animated and classic',
          },
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: 'Result',
      parts: [
        {
          type: 'featureMedia',
          media: {
            type: 'image',
            src: iquotoResult,
            alt: 'Final screens of the IQuoto redesign',
          },
        },
        {
          type: 'noteCard',
          title: 'How it ended',
          items: [
            'Three steps instead of five, with the legal requirements intact.',
            'Far less asked of the user before they see anything.',
            'Signed off by both legal and analytics.',
          ],
          paragraphs: [
            'It never shipped. The client did not approve the budget, so the conversion lift stayed a projection. I checked in on it for a while afterwards — the work fed into the wider platform redesign rather than the registration flow alone, which is not nothing, but it is not a launch either.',
          ],
        },
        {
          type: 'collapsible',
          title: 'Other screens I worked on',
          items: [
            'KYC flow',
            'Deposit',
            'Dashboard',
            'Bank accounts',
            'Internal transfer',
          ],
        },
      ],
    },
  ],
};

export const yandexTurkeyCaseStudy = {
  slug: 'yandex-turkey',
  backHref: '/',
  hero: {
    title: 'Yandex News (Turkey)',
    description:
      'Turkish readers do not trust a single news source, so they check three. I designed a feed that treats that as the normal behaviour instead of working against it.',
    meta: 'Product Designer / Discovery, research, and concept',
    image: {
      src: yandexCoverScreens,
      alt: 'Three mobile screens from the Yandex News product for Turkey',
    },
    stats: [
      { value: '13', label: 'research participants' },
      { value: '75-80%', label: 'of news time spent on smartphones' },
      { value: 'DAU / retention', label: 'post-launch metrics' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'About',
      title: 'About the Project',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The brief',
              paragraphs: [
                'Build a service that pulls together news sites, entertainment media, author platforms, blogs, and social posts into one place.',
                'The product idea was to let people form their own view by seeing several sources at once. The business idea was to make Yandex a name people trust for news, and to keep that reading inside the ecosystem.',
              ],
            },
            {
              type: 'text',
              heading: 'What success meant',
              paragraphs: [
                'A new product in the Turkish market, a new audience, and more trust from the people already there.',
                'Measured on DAU and retention.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'research',
      navLabel: 'Research',
      title: 'Audience Research',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The Yandex team ran the research; I worked from their findings. Worth stating plainly rather than implying otherwise.',
            'It looked at everyday news habits in Turkey: which products come to mind first, how people check a story, and what stops them trusting a source.',
          ],
        },
        {
          type: 'collapsible',
          title: 'Who was in the study',
          items: [
            '13 participants, with men and women represented equally.',
            'Audience age range: 18-45.',
            'The sample included users from large Turkish cities who read news online.',
            'The key focus was mobile-first: smartphones were the primary gateway to the internet for a significant share of the audience.',
          ],
        },
        {
          type: 'insightCards',
          heading: 'How people actually read news',
          items: [
            'Nobody uses one platform. Social media, traditional news sites, and aggregators run in parallel — Twitter, Google, and Bundle came up again and again.',
            'What they valued: speed, reaching the original source, and being able to check the same story across outlets quickly.',
          ],
        },
        {
          type: 'painCards',
          heading: 'What was getting in the way',
          items: [
            'Piecing together one event means jumping between platforms.',
            'Most news arrives through notifications, so an aggregator lives or dies on alert quality.',
            'Trust in traditional media is low. People double-check by habit and hunt for neutral wording.',
            'Ads and cluttered interfaces send people straight to a competitor.',
          ],
        },
      ],
    },
    {
      id: 'solution',
      navLabel: 'Concept',
      title: 'Concept',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The concept is a mobile-first personalised feed. Not a wall of content — a homepage with visible levers.',
            'Interests you pick, sources you can see and switch off, and enough transparency that the mix of stories never feels arbitrary.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'How I worked on it',
              paragraphs: [
                'My job was the meaning and structure of the homepage. The UI layer belonged to another Yandex team I had no direct line to, so I started where I could: several approaches to the news card itself.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexProcessCards,
            alt: 'Early explorations of news card formats',
          },
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'Three homepage directions came out of it. The second died quickly — sources in a horizontal scroll were miserable to browse. One and three went to A/B testing on scroll depth and time on page: the first shows several stories at once, the third shows fewer but pulls all the focus onto a single main card.',
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexAbVariants,
            alt: 'Three homepage concepts used for the A/B test',
          },
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'I never saw the exact test numbers. But the production version speaks for itself — the team went with the third concept and its focal card.',
          ],
        },
        {
          type: 'phonePair',
          label: 'Final direction in production',
          items: [
            {
              type: 'video',
              src: yandexProdFinal,
              alt: 'Production interface video for the final direction',
            },
            {
              type: 'image',
              src: yandexProdScreen,
              alt: 'Production screen of the final news feed direction',
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'What survived into the build',
          items: [
            'Interests at onboarding, skippable without penalty.',
            'Source management inside the product, not buried in settings.',
            'A For You feed built around relevance.',
            'A route into the full story that does not lose the context you came from.',
          ],
          paragraphs: [
            'The distinction I kept arguing for: this is not another aggregator. It is a configurable environment where you can see why a topic reached you and change it in two taps.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Setting up the feed',
              paragraphs: [
                'Interests get set in a few taps, no setup wizard. Those categories are the starting point. From there you can see which sources are feeding you and switch off the ones you do not want.',
                'Underneath, an LLM clusters articles into storylines and decides which sources make the cut. Turn a source off and its material leaves top stories and the category pages immediately — not on the next refresh.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexPersonalization,
            alt: 'Interests and source management screen',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The feed itself',
              paragraphs: [
                'Those settings add up to a personal logic for what arrives and in what order. More relevance, longer attention, better retention — that was the chain we were betting on.',
                'Out of the box it starts from what Turkey reads most: politics, finance, economics, food, sports, technology.',
              ],
            },
          ],
        },
        {
          type: 'phonePair',
          items: [
            {
              type: 'video',
              src: yandexFeedVideo,
              alt: 'Personalized news feed video',
            },
            {
              type: 'image',
              src: yandexFeedPersonal,
              alt: 'Personalized For You news feed',
            },
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Reading one story',
              paragraphs: [
                'The detail view puts the same event through several outlets at once, summarised so you get the substance without reading five articles.',
                'The point is not only the story. It is the source. Seeing how differently one event gets told is what makes you form a view about who is telling it — and the link out to the full article is always there if you want it.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexStoryFocus,
            alt: 'Story detail view with multiple sources',
          },
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: 'Result',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Post-launch metrics stayed with the client, which is how outstaff projects usually go. I handed over designs ready for A/B testing; what shipped tells me which way it went.',
          ],
        },
        {
          type: 'noteCard',
          title: 'What I left them with',
          items: [
            'A mobile-first concept shaped around how Turkey actually reads news.',
            'The core scenarios defined: interests, source management, For You, and the route into a full story.',
            'Two homepage options ready for A/B testing on scroll depth and time on page.',
            'The shipped product runs the focal-card direction.',
          ],
        },
      ],
    },
  ],
};

export const kokocCaseStudy = {
  slug: 'kokoc-group',
  backHref: '/',
  hero: {
    title: 'Kokoc Group',
    description:
      'The company had outgrown its own website. I had one month to rebuild it in time for the anniversary — competitive analysis, prototypes, and the visual concept with the art director.',
    meta: 'Product Designer / Corporate website redesign',
    image: {
      src: kokocCaseHero,
      alt: 'Hero screen of the Kokoc Group case study',
    },
    stats: [
      { value: '30+', label: 'agencies and services inside the platform' },
      { value: '1 month', label: 'to launch for the company anniversary' },
      { value: 'NDA', label: 'client-side internal metrics' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'About',
      title: 'About the Project',
      parts: [
        {
          type: 'siteLink',
          label: 'Project site -',
          href: 'https://kokocgroup.ru/',
          text: 'kokocgroup.ru',
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Who they are',
              paragraphs: [
                'An international business growth platform holding more than 30 agencies and digital marketing services — SEO, performance media, web analytics, development and support, SMM, and a long tail beyond that.',
              ],
            },
          ],
        },
        {
          type: 'imageBand',
          variant: 'kokoc-about',
          media: {
            type: 'image',
            src: kokocAbout,
            alt: 'Overview of Kokoc Group',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'The problem',
              paragraphs: [
                'The business had changed shape and the site had not. It described a smaller, simpler company than the one that existed, and it had no room to grow into the structure they were already moving toward.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'What we were actually chasing',
          icon: '💡',
          paragraphs: [
            'Awareness, clarity, trust. None of which design delivers on its own — the site had to carry a change that was happening inside the company anyway.',
            'That also meant no clean success metric. It would show up indirectly: visibility in the information space, branded demand, NPS, and eventually the contacts-to-briefs conversion.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'What I did',
              items: [
                'Gathered the requirements',
                'Competitive analysis',
                'Prototyping',
                'Built the visual concept with the art director',
                'Presented the project to stakeholders',
                'Animated individual elements and prepared the handoff',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'prototype',
      navLabel: 'Prototype',
      title: 'Prototyping',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Most of the prototyping time went into understanding the business rather than drawing. How the platform actually works, what competitors do, several sessions with the team. Then each section went to the client on its own, so nothing arrived as a surprise at the end.',
          ],
        },
        {
          type: 'imageBand',
          media: {
            type: 'image',
            src: kokocPrototype,
            alt: 'Kokoc Group page prototypes',
          },
        },
      ],
    },
    {
      id: 'concept',
      navLabel: 'Concept',
      title: 'Concept Development',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The first screen had to sell a 3D and motion idea before anyone had built it, so I mocked the animations up myself — ready-made illustrations run through Luma AI. Enough to get agreement. A motion designer joined afterwards and took it properly.',
          ],
        },
        {
          type: 'bento',
          label: 'Motion explorations',
          tiles: [
            {
              type: 'video',
              src: kokocVideo1,
              alt: 'Kokoc Group hero section animation',
              span: 'full',
              variant: 'kokoc-hero-motion',
              zoom: 0.65,
              caption: 'Hero section — the 3D and motion idea I presented first.',
            },
            {
              type: 'video',
              src: kokocVideoMenu,
              alt: 'Kokoc Group menu animation',
              span: 'half',
              variant: 'kokoc-light-motion',
              zoom: 1.067,
              caption: 'Navigation menu.',
            },
            {
              type: 'video',
              src: kokocVideoCards,
              alt: 'Kokoc Group card animation',
              span: 'half',
              variant: 'kokoc-light-motion',
              zoom: 1.067,
              caption: 'Service cards.',
            },
            {
              src: kokocConcept1,
              alt: 'Kokoc Group visual concept option one',
              span: 'wide',
              variant: 'kokoc-light-frame',
              zoom: 1.05,
              caption: 'Visual direction one.',
            },
            {
              src: kokocConcept2,
              alt: 'Kokoc Group visual concept option two',
              span: 'third',
              variant: 'kokoc-light-frame',
              zoom: 1.4,
              fx: '38%',
              fy: '30%',
              caption: 'Visual direction two.',
            },
          ],
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Result',
      title: 'Result',
      parts: [
        {
          type: 'noteCard',
          title: 'How it ended',
          items: [
            'Launched in one month, in time for the anniversary.',
            'Good reception from both clients and the internal teams.',
          ],
        },
        {
          type: 'siteLink',
          label: 'Project site -',
          href: 'https://kokocgroup.ru/',
          text: 'kokocgroup.ru',
        },
      ],
    },
  ],
};

export const designCringeCaseStudy = {
  slug: 'design-cringe',
  backHref: '/ai-projects',
  hero: {
    title: 'Design Cringe-meter',
    description:
      'Paste a link, get a cringe percentage and a list of exactly what is wrong. A design review tool that measures the rendered page instead of guessing, built and shipped in a week.',
    meta: 'Side project / Design tooling',
    image: {
      src: designCringeScore,
      alt: 'Cringe-meter result: 73% for an overloaded e-commerce site',
    },
    stats: [
      { value: '29', label: 'rules across 9 categories' },
      { value: '88', label: 'automated tests' },
      { value: '1 week', label: 'from plan to a live site' },
    ],
    points: ['React', 'Playwright', 'AWS Lambda', 'Tilda'],
  },
  sections: [
    {
      id: 'idea',
      navLabel: 'Idea',
      title: 'The Idea',
      parts: [
        {
          type: 'siteLink',
          label: 'Live -',
          href: 'https://designecringe.com/',
          text: 'designecringe.com',
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'Every designer can tell a page is off in a second. Explaining why takes much longer — and "it feels cheap" is not feedback anyone can act on.',
            'The cringe-meter turns that gut feeling into a number and a list: contrast that fails WCAG, tap targets too small to hit, twelve fonts, a popup in the first three seconds.',
          ],
        },
        {
          type: 'imageBand',
          media: {
            type: 'image',
            src: designCringeLanding,
            alt: 'Cringe-meter start screen with a URL field',
          },
        },
      ],
    },
    {
      id: 'approach',
      navLabel: 'Approach',
      title: 'From Regex to a Real Browser',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Version one',
              paragraphs: [
                'A small Node server searching the raw HTML with regular expressions: marquee and blink tags, Comic Sans, neon hex colours, autoplay, shouting caps. It was funny, and it was blind — the HTML says nothing about the contrast, spacing or layout people actually see.',
              ],
            },
            {
              type: 'text',
              heading: 'Version two',
              paragraphs: [
                'The page is now rendered in headless Chromium twice, at 1280 and 375 pixels wide. The analyzer reads computed styles, real colours and element sizes, and returns screenshots as evidence.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'One rule I kept from the start',
          paragraphs: [
            'No AI judges the design. The score is deterministic: the same page always gets the same number, and every point of it traces back to a rule you can read. AI wrote the code with me; it does not get a vote on the result.',
          ],
        },
      ],
    },
    {
      id: 'rules',
      navLabel: 'Rules',
      title: 'What Counts as Cringe',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'The rules come from sources designers already trust: Nielsen Norman heuristics, WCAG 2.2, typography norms, colour theory and Harry Brignull’s catalogue of dark patterns — plus a category of web relics for the truly historic finds.',
          ],
        },
        {
          type: 'imageBand',
          label: 'Breakdown by category',
          media: {
            type: 'image',
            src: designCringeCategories,
            alt: 'Score breakdown across nine design categories',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Nine categories',
              items: [
                'Accessibility — contrast, target size, focus, headings, alt text',
                'Typography — line length, line height, font count, minimum size',
                'Colour — palette size, neon clashes, gradient overload',
                'Layout — overflow, first-screen density, whitespace',
                'Dark patterns — confirmshaming, fake urgency, nagging popups',
                'CTA, media, mobile and web relics',
              ],
            },
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'How the score is built',
              paragraphs: [
                'Each rule has a weight by severity — critical, major or minor — scaled by how far past the threshold the page goes. Every category has a cap, so one terrible area cannot decide the whole verdict. The result is a cringe percentage from 0 to 100 and a verdict that names the worst category.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: designCringeIssues,
            alt: 'List of found issues marked critical, major and minor',
          },
        },
      ],
    },
    {
      id: 'mobile',
      navLabel: 'Mobile',
      title: 'Cringe and Not',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'An overloaded store scores 73% with a red ring. A clean product site lands at 25% and a green one. Both are measured by the same rules, on desktop and on a phone.',
          ],
        },
        {
          type: 'phonePair',
          items: [
            {
              type: 'image',
              src: designCringeMobileBad,
              alt: 'Mobile result with a high cringe score',
            },
            {
              type: 'image',
              src: designCringeMobileClean,
              alt: 'Mobile result with a low cringe score',
            },
          ],
        },
      ],
    },
    {
      id: 'launch',
      navLabel: 'Launch',
      title: 'Shipping It',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'What it took to put online',
              items: [
                'A headless browser in AWS Lambda behind API Gateway, set up with Terraform',
                'Protection against requests to private networks, a cache and a limit on parallel renders',
                'A budget alert and rate limits, so a viral day does not become a bill',
                'The frontend embedded into a Tilda page, so the site stays easy to edit',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'Where it is now',
          items: [
            'Live at designecringe.com.',
            'Calibration is the next job: an old-school site can still score lower than a modern one that hides its problems better.',
          ],
        },
      ],
    },
  ],
};
