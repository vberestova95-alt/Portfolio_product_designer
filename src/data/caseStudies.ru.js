import dsPluginsCover from '../assets/cases/ds-plugins-card.webp';
import dsPluginsChangelog from '../assets/cases/ds-plugins-changelog.webp';
import dsPluginsManager from '../assets/cases/ds-plugins-manager.webp';
import dsPluginsManagerBatch from '../assets/cases/ds-plugins-manager-batch.webp';
import dsPluginsFoundation from '../assets/cases/ds-plugins-foundation.webp';
import designCringeScore from '../assets/cases/design-cringe-score.jpg';
import designCringeLanding from '../assets/cases/design-cringe-landing.jpg';
import designCringeCategories from '../assets/cases/design-cringe-categories.jpg';
import designCringeIssues from '../assets/cases/design-cringe-issues.jpg';
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
import petTrackerMvpScreens from '../assets/cases/pet-tracker-mvp-screens.webp';
import fluffyChumbV2Cover from '../assets/cases/fluffy-chumb-v2-cover.ru.webp';
import fluffyChumbV2Screens from '../assets/cases/fluffy-chumb-v2-screens.ru.webp';
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
    title: 'Fluffy Chumb',
    description:
      'Я сделала трекер уколов инсулина для своего кота. Интервью с пользователями MVP показали: уход — это не одна задача, а много мелких дел, которые делят несколько людей. Вторая версия — про гибкие трекеры и общую рутину дня.',
    meta: 'Трекер ухода за питомцем / Сайд-проект / MVP → v2',
    image: {
      src: fluffyChumbV2Cover,
      alt: 'Два экрана Fluffy Chumb: главная с трекерами питомца и дела на сегодня — сделанные, пропущенные и текущие',
    },
    stats: [
      { value: '2', label: 'группы пользователей в интервью' },
      { value: '12', label: 'бета-тестеров с лендинга' },
      { value: '1 → любые', label: 'трекеры, которые настраивает семья' },
    ],
    points: ['Codex', 'Claude Code', 'Figma Make'],
  },
  sections: [
    {
      id: 'mvp',
      navLabel: 'MVP',
      title: 'С чего начинали',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'MVP решал одну задачу: не пропустить укол инсулина и не колоть дважды в одно место. На главном экране — фото питомца с картой мест для уколов и неделя.',
            'Мы пользовались им сами. Чтобы понять, нужен ли продукт кому-то ещё, я дала MVP другим хозяевам и поговорила с ними.',
          ],
        },
        {
          type: 'imageBand',
          label: 'MVP',
          variant: 'bare',
          media: {
            type: 'image',
            src: petTrackerMvpScreens,
            alt: 'Экраны MVP: настройки питомца, приветствие и карта уколов на фото',
          },
        },
      ],
    },
    {
      id: 'process',
      navLabel: 'Процесс',
      title: 'Как шла работа',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'ordered-list',
              heading: 'От MVP до беты — шесть шагов',
              items: [
                'MVP — трекер уколов для своего кота.',
                'Анализ конкурентов.',
                'Интервью с двумя группами пользователей MVP.',
                'Гипотеза уточнена.',
                'Новое позиционирование и вторая версия.',
                'Тестовая сборка, лендинг и 12 бета-тестеров.',
              ],
            },
            {
              type: 'text',
              heading: 'Точка разворота',
              paragraphs: [
                'Интервью. После них продукт перестал быть трекером одной болезни и стал инструментом для всех, кто ухаживает за питомцем.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'research',
      navLabel: 'Исследование',
      title: 'Исследование',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Трекеры у конкурентов — это наборы предустановленных действий. Информации много, и большая её часть не нужна конкретному питомцу: человек ищет своё действие среди чужих.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Гипотеза до интервью',
              paragraphs: ['Пользователю важно настроить свой трекер, чтобы делать меньше действий.'],
            },
            {
              type: 'text',
              heading: 'После интервью',
              paragraphs: [
                'Сложный трекер полезен в моменте, но мешает, когда нужно простое действие. Настройка нужна не для того, чтобы добавить больше, а чтобы оставить только нужное и расширить, когда меняется лечение. А кроме того, трекером пользуется не один человек.',
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          title: 'Кого спрашивали',
          items: [
            'Группа 1 — семья: муж, жена и ребёнок. У кота диабет и протокол лечения. Родители хотят научить ребёнка ухаживать за котом, поэтому ребёнку должно быть понятно и интересно.',
            'Группа 2 — пара со взрослым котом с диабетом. Инсулин дважды в день, протокол постоянно меняется, помогает пет-ситтер.',
          ],
        },
        {
          type: 'painCards',
          heading: 'Что узнали',
          items: [
            'Лишняя структура отталкивает. Одному пользователю не нужно было ставить уколы — только мерить глюкозу. Он три раза воспользовался картой и бросил: карта его ограничивала.',
            'Уход делят несколько человек, и не всем нужен весь протокол. Ребёнку нужна одна понятная задача, а не схема лечения.',
            'Протокол лечения меняется. Инсулин — большая задача, но не единственная: появляются таблетки, у которых меняется время и длительность курса.',
            'Деликатные темы хотят вести отдельно. В трекере диабета для них не было места.',
            'В уходе участвуют люди вне семьи. Пет-ситтеру нужны актуальные рекомендации, а хозяевам — видеть, что сделано, не дёргая ситтера.',
          ],
        },
      ],
    },
    {
      id: 'decisions',
      navLabel: 'Решения',
      title: 'От инсайта к решению в v2',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Карта уколов мешала тому, кто только мерит глюкозу',
              paragraphs: ['Инсулин и глюкоза стали отдельными трекерами: тот, кто только мерит глюкозу, не видит карту уколов.'],
            },
            {
              type: 'text',
              heading: 'Ребёнку нужна понятная задача, а не весь протокол',
              paragraphs: ['У задачи есть исполнитель: человек заходит и видит то, что назначено ему.'],
            },
            {
              type: 'text',
              heading: 'Протокол меняется, появляются таблетки',
              paragraphs: ['Любой участник может создать новый трекер; время и ритм настраиваются.'],
            },
            {
              type: 'text',
              heading: 'Деликатным темам нет места',
              paragraphs: ['Отдельный свой трекер под каждую тему.'],
            },
            {
              type: 'text',
              heading: 'Пет-ситтеру нужны актуальные рекомендации',
              paragraphs: ['Профилем питомца можно поделиться: ситтер видит задачи и отмечает сделанное.'],
            },
            {
              type: 'text',
              heading: 'Хозяева не хотят контролировать ситтера',
              paragraphs: ['В делах на сегодня видно, кто что сделал, а напоминания приходят на телефон каждому — спрашивать не нужно.'],
            },
          ],
        },
      ],
    },
    {
      id: 'v2',
      navLabel: 'Версия 2',
      title: 'Что вошло во вторую версию',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Новое позиционирование: не трекер диабета, а Fluffy Chumb — трекер ухода, который меняется вместе с питомцем. Уход собирается из своих трекеров, и диабет остался одним из них.',
          ],
        },
        {
          type: 'imageBand',
          label: 'Версия 2',
          media: {
            type: 'image',
            src: fluffyChumbV2Screens,
            alt: 'Экраны Fluffy Chumb: главная, выбор трекеров, трекеры, конструктор трекера, инсулин, история и семья',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Общий уход',
              items: [
                'Дела на сегодня — задачи из расписаний всех трекеров в одном списке: отметить, пропустить с причиной или отложить.',
                'У задачи видно, для кого она и кто её сделал, — каждый держит фокус на своей части протокола.',
                'Семья — приглашение по email, в том числе пет-ситтера, с ролью Owner или Can edit.',
                'Напоминания — уведомления на телефоне, каждый включает у себя. Пуш всей семье — следующий шаг.',
                'История и экспорт врачу — 7 или 30 дней, графики и текстовая сводка, которой можно поделиться.',
              ],
            },
            {
              type: 'list',
              heading: 'Гибкие трекеры',
              items: [
                'Конструктор трекера: имя, поля (число, шкала, да / нет, заметка), плитка со своей формой и мехом, ритм, закрепить на главной.',
                'Простые трекеры для таблеток, витаминов, прогулок и еды; Mood — готовый пресет.',
                'Диабет — готовый набор из Insulin и Glucose, и каждый работает отдельно: карта уколов — только для тех, кто колет.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'beta',
      navLabel: 'Бета',
      title: 'Бета',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Я собрала тестовую сборку и запустила посадочный лендинг для поиска бета-тестеров. Нашлись 12 человек, готовых тестировать продукт.',
          ],
        },
        {
          type: 'siteLink',
          label: 'Лендинг беты -',
          href: 'https://fluffychumb.com/',
          text: 'fluffychumb.com',
        },
        {
          type: 'noteCard',
          title: 'Что покажет бета',
          items: [
            'Доходят ли люди до первого своего трекера и сколько времени уходит на настройку.',
            'Сколько человек в семье реально отмечают задачи.',
            'Возвращаются ли в приложение те, кому нужно одно простое действие.',
          ],
        },
        {
          type: 'noteCard',
          title: 'Чему научилась',
          paragraphs: [
            'Трекер, сделанный под себя, точно решал мою задачу и мешал чужой. Интервью показали, что продукт не про болезнь, а про людей вокруг питомца и кто из них что делает.',
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
      'Бонусная программа, которая начиналась как маркетинговый инструмент для киберспорта. За год я превратила её в продуктовый раздел, способный вместить и классический спорт, — не потеряв аудиторию, которая там уже была.',
    meta: 'Продуктовый дизайнер / 2025–2026',
    image: {
      src: heroImage,
      alt: 'Главный экран кейса BetBoom PASS',
    },
    stats: [
      { value: '+75%', label: 'Retention' },
      { value: '+60%', label: 'DAU' },
      { value: 'NDA', label: 'Пользователи' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'О проекте',
      title: 'О проекте',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Что такое BetBoom Pass',
              paragraphs: [
                'Пользователи выполняют задания и получают награды: фрибеты, игровые скины, призы. На первый взгляд — ничего сложного.',
                'Сложность была в том, для кого это делалось. На старте всё было заточено под геймеров и фанатов киберспорта, и их привычки работали. Всё новое не должно было их задеть.',
              ],
            },
            {
              type: 'text',
              heading: 'Как он оказался внутри основного продукта',
              paragraphs: [
                'Всё начиналось как маркетинговый инструмент. К моему приходу это уже был полноценный раздел основного продукта — и в приложении, и в вебе, — а исходная отдельная платформа продолжала работать параллельно. Две поверхности, одна механика.',
              ],
            },
            {
              type: 'text',
              heading: 'Настоящая цель',
              paragraphs: [
                'Привести в геймификацию новую аудиторию через задания по классическому спорту и поднять LTV по всем сегментам.',
                'Футбол, баскетбол, хоккей, теннис, настольный теннис. Совсем другая публика, чем игроки в Dota и CS, — и всё на одном экране.',
              ],
            },
            {
              type: 'list',
              heading: 'Что мы отслеживали',
              items: [
                'MAU -> WAU -> DAU',
                'Retention (D7, D30)',
                'Churn rate — ранний сигнал, что мы что-то ломаем для старой аудитории',
              ],
            },
            {
              type: 'list',
              heading: 'Что делала я',
              items: [
                'Начала с нуля и сама собрала требования',
                'UX и пользовательские сценарии',
                'Прототипы и визуальная концепция',
                'Все презентации для стейкхолдеров',
                'Распределяла дизайн-задачи и координировала других дизайнеров',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'hypothesis',
      navLabel: 'A/B-тест',
      title: 'Запуск A/B-теста',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Прежде чем что-то редизайнить, я хотела понять, примет ли киберспортивная аудитория классический спорт в принципе.',
            'Гипотеза: более широкий каталог заданий повышает вовлечённость, не выталкивает текущую аудиторию и даёт пространство для роста.',
          ],
        },
        {
          type: 'imageBand',
          label: 'Новые задания по классическому спорту',
          media: {
            type: 'video',
            src: betboomAbTestVideo,
            alt: 'Новые задания по классическому спорту в BetBoom PASS',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Что мы хотели выяснить',
              paragraphs: [
                'Нужна ли продукту новая категория заданий вообще — и выдержит ли её механика, не навредив тому, что уже работало.',
              ],
            },
            {
              type: 'text',
              heading: 'Как мы его провели',
              paragraphs: [
                'A/B-тест на элементах геймификации: карточки заданий по футболу, баскетболу, хоккею и теннису добавили в существующий каталог.',
              ],
            },
            {
              type: 'text',
              heading: 'Что получили',
              paragraphs: [
                'Реакция оказалась положительной, а сильнее всех из четырёх видов спорта выступил футбол.',
                'Это изменило взгляд на задачу. Речь шла не об обновлении контента, а о рычаге роста для retention и DAU.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: hypothesisResultImage,
            alt: 'Результаты проверки гипотезы в интерфейсе BetBoom PASS',
          },
        },
        {
          type: 'noteCard',
          title: 'Три вывода из теста',
          items: [
            'Задания по классическому спорту заходят',
            'Текущая аудитория осталась',
            'Механика способна выдержать больше, чем сейчас',
          ],
          paragraphs: [
            'А значит, следующая проблема была структурной: сама карточка и логика раздела вокруг неё.',
          ],
        },
      ],
    },
    {
      id: 'redesign',
      navLabel: 'Редизайн',
      title: 'Редизайн карточки задания',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Аудитории классического спорта от карточки нужно было другое. Не атмосфера, а условия и награды — коротко и ясно. Поэтому я сместила акцент с иллюстрации на информацию.',
          ],
        },
        {
          type: 'noteCard',
          title: 'Что было не так со старой карточкой',
          compact: true,
          items: [
            'Иллюстрация забирала всё внимание.',
            'Заголовок не объяснял условия.',
            'На первом месте был тип задания — а аналитика показывала, что люди фильтруют по категории.',
          ],
        },
        {
          type: 'featureMedia',
          wide: true,
          media: {
            type: 'video',
            src: redesignVideo,
            alt: 'Карточка задания BetBoom PASS до и после редизайна',
          },
        },
        {
          type: 'bento',
          label: 'Анатомия новой карточки',
          tiles: [
            {
              src: betboomFeaturedDesktop,
              alt: 'Фильтры по категориям и сортировка над сеткой заданий',
              span: 'full',
              zoom: 1.5,
              fx: '47%',
              fy: '52.6%',
              caption: 'Фильтры перевели на категории — именно так люди и искали.',
            },
            {
              src: betboomFeaturedDesktop,
              alt: 'Крупный план одной карточки задания',
              span: 'half',
              zoom: 3.6,
              fx: '20.5%',
              fy: '58.6%',
              caption: 'Условие стоит первым, иллюстрация больше с ним не спорит.',
            },
            {
              src: betboomFeaturedDesktop,
              alt: 'Карточка задания с таймером обратного отсчёта',
              span: 'half',
              zoom: 3.6,
              fx: '47%',
              fy: '74.5%',
              caption: 'Награду и дедлайн видно, не открывая карточку.',
            },
            {
              src: betboomFeaturedDesktop,
              alt: 'Сетка карточек заданий по разным видам спорта',
              span: 'wide',
              zoom: 1.8,
              fx: '47%',
              fy: '66.5%',
              caption: 'Одна сетка вмещает и киберспорт, и классический спорт — без разделения раздела.',
            },
            {
              src: betboomTopScreen,
              alt: 'Промо-задание на главном экране платформы',
              span: 'third',
              zoom: 3.6,
              fx: '72%',
              fy: '54.3%',
              caption: 'Промо-задания используют ту же анатомию.',
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'Что потянула за собой карточка',
          items: [
            'Новые фильтры',
            'Новые категории заданий',
            'Обновлённая логика виджетов',
            'Промо-задания',
          ],
          paragraphs: [
            'Одна карточка никогда не бывает просто карточкой. Когда гипотеза подтвердилась, мы взялись за слой вокруг неё — в основном чтобы не тащить старые решения каждый раз, когда добавляем новую механику.',
          ],
        },
      ],
    },
    {
      id: 'mechanics',
      navLabel: 'Механика',
      title: 'Новая механика',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Проблема',
              paragraphs: [
                'Больше заданий — больше повторов. Раздел начал восприниматься как шум.',
              ],
            },
            {
              type: 'text',
              heading: 'Что я сделала',
              paragraphs: [
                'Механику уровней. Она придала сценарию понятную форму и позволила каталогу расти, не раздувая интерфейс.',
              ],
            },
            {
              type: 'list',
              heading: 'Почему это было важно',
              items: [
                'Пользователи наконец понимали, сколько стоит награда и чего она от них потребует',
                'Бизнес получил каталог, который можно наполнять дальше',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'active-tasks',
      navLabel: 'Активные задания',
      title: 'Активные задания',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Проблема',
              paragraphs: [
                'Больше спортивных заданий — больше заданий, которые противоречат друг другу. Два хоккейных задания на два разных матча, оба активны — система не могла засчитать оба, поэтому просто не давала их взять.',
              ],
            },
            {
              type: 'text',
              heading: 'Что я сделала',
              paragraphs: [
                'Модальное окно, которое объясняет конфликт в момент, когда он возникает. Правило осталось прежним — исчезло ощущение, что упёрся в стену.',
              ],
            },
            {
              type: 'list',
              heading: 'Две задачи этого окна',
              items: [
                'Оставить путь назад к уже запущенному заданию',
                'Читаться как правило, а не как баг',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Результат',
      title: 'Результат',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Спустя год BetBoom Pass — это уже не маркетинговый инструмент с прикрученным сбоку продуктом. Это раздел, который можно расширять без редизайна каждый раз.',
          ],
        },
        {
          type: 'beforeAfterSlider',
          before: {
            src: hypothesisResultImage,
            alt: 'Интерфейс BetBoom PASS до редизайна',
          },
          after: {
            src: sportsTasksImage,
            alt: 'Интерфейс BetBoom PASS после редизайна',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'stats',
              heading: 'Ключевые метрики',
              stats: [
                { value: '+75%', label: 'Retention' },
                { value: '+60%', label: 'DAU' },
                { value: 'NDA', label: 'Пользователи' },
              ],
            },
            {
              type: 'list',
              heading: 'С чем остался продукт',
              items: [
                'Классический спорт прижился — аудитория его приняла',
                'Новые задания добавляются, не затрагивая механику',
                'Больше каталог — больше потенциала LTV по сегментам',
                'Люди возвращаются в раздел, а не заходят один раз',
                'Следующее изменение не придётся начинать с отката этого',
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
      'Семь человек из десяти бросали регистрацию на шаге с персональными данными. Весь проект я выясняла, какую часть этих данных мы обязаны запрашивать по закону, — и убирала всё остальное.',
    meta: 'Продуктовый дизайнер / 2022',
    image: {
      src: iquotoCaseHero,
      alt: 'Главный экран кейса IQuoto',
    },
    stats: [
      { value: '70%', label: 'уходили на шаге с персональными данными' },
      { value: '5', label: 'шагов в исходном сценарии' },
      { value: 'NDA', label: 'результаты тестов на стороне клиента' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'О продукте',
      title: 'О продукте',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'IQuoto — онлайн-платформа для трейдинга с несколькими классами активов, рассчитанная и на новичков, и на опытных трейдеров.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Проблема',
              paragraphs: [
                'Трейдинговые платформы запрашивают много, и многое из этого обязательно — так решает регулятор. Но где-то между требованиями закона и тем, что требовала форма, мы теряли больше 70% людей на шаге с личной информацией.',
                'Вся воронка — от регистрации до первого значимого действия в продукте:',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            type: 'image',
            src: iquotoFunnel,
            alt: 'Воронка регистрации IQuoto',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'ordered-list',
              heading: 'К чему я стремилась',
              items: [
                'Больше людей доходят до конца регистрации.',
                'Меньше людей уходят на середине.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'as-is',
      navLabel: 'AS IS',
      title: 'Текущий сценарий регистрации (AS IS)',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Вот всё, что мы запрашивали, прежде чем подпустить человека к продукту:',
          ],
        },
        {
          type: 'featureMedia',
          wide: true,
          media: {
            type: 'video',
            src: iquotoAsIsVideo,
            alt: 'Запись текущего сценария регистрации',
          },
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'Я разложила весь путь по шагам. О трении гораздо проще спорить, когда оно висит на стене.',
          ],
        },
        {
          type: 'imageBand',
          label: 'Сценарий регистрации AS IS',
          media: {
            src: iquotoMapAsIs,
            alt: 'Карта процесса регистрации AS IS',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Где болело',
              items: [
                'Пять шагов, и на каждом — ещё больше данных.',
                'И всё это до того, как продукт хоть что-то дал взамен.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'На что я поставила',
          items: [
            'Меньше шагов в рамках юридических ограничений — выше конверсия.',
            'Чем меньше запрашиваешь, тем меньше сопротивление.',
            'Обсуждали бонус за регистрацию. Отказались — он лечит симптом.',
          ],
        },
      ],
    },
    {
      id: 'to-be',
      navLabel: 'TO BE',
      title: 'Новый сценарий регистрации (TO BE)',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Короче карта: меньше шагов, быстрее путь к продукту. Я согласовала её с аналитиками и юристами клиента до того, как кто-то нарисовал хоть один экран.',
          ],
        },
        {
          type: 'beforeAfterSlider',
          before: {
            src: iquotoMapToBe,
            alt: 'Процесс регистрации TO BE',
          },
          after: {
            src: iquotoMapAsIs,
            alt: 'Процесс регистрации AS IS',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'stats',
              heading: 'Разница',
              stats: [
                { value: '5 -> 3', label: 'шага вместо пяти' },
                { value: '-40%', label: 'полей ввода' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'variants',
      navLabel: 'Варианты',
      title: 'Варианты дизайна',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Клиент хотел анимированную регистрацию. Я сделала обе версии и отстояла простую.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'ordered-list',
              heading: 'Почему победила простая форма',
              items: [
                'Анимированный сценарий добавляет действия и шаги ровно там, где воронка и так протекает.',
                'Люди заполняют формы не по порядку и перечитывают поля, пока печатают. Анимированная версия этого не позволяла.',
                'Бюджет на разработку был фиксированным. Разрастание скоупа здесь было реальным риском, а не гипотетическим.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            type: 'image',
            src: iquotoVariants,
            alt: 'Два варианта регистрации: анимированный и классический',
          },
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Результат',
      title: 'Результат',
      parts: [
        {
          type: 'featureMedia',
          media: {
            type: 'image',
            src: iquotoResult,
            alt: 'Финальные экраны редизайна IQuoto',
          },
        },
        {
          type: 'noteCard',
          title: 'Чем всё закончилось',
          items: [
            'Три шага вместо пяти — с соблюдением всех юридических требований.',
            'Гораздо меньше вопросов к пользователю до того, как он что-то увидит.',
            'Согласовано и юристами, и аналитиками.',
          ],
          paragraphs: [
            'В прод это так и не вышло. Клиент не утвердил бюджет, и рост конверсии остался прогнозом. Какое-то время я следила за проектом — наработки ушли в общий редизайн платформы, а не только в регистрацию. Это уже кое-что, но всё-таки не запуск.',
          ],
        },
        {
          type: 'collapsible',
          title: 'Другие экраны, над которыми я работала',
          items: [
            'KYC-сценарий',
            'Пополнение',
            'Дашборд',
            'Банковские счета',
            'Внутренний перевод',
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
    title: 'Яндекс Новости (Турция)',
    description:
      'Турецкие читатели не доверяют одному источнику новостей, поэтому проверяют три. Я спроектировала ленту, которая считает это нормой, а не борется с этим.',
    meta: 'Продуктовый дизайнер / Дискавери, исследование и концепт',
    image: {
      src: yandexCoverScreens,
      alt: 'Три мобильных экрана Яндекс Новостей для Турции',
    },
    stats: [
      { value: '13', label: 'участников исследования' },
      { value: '75-80%', label: 'времени на новости — со смартфона' },
      { value: 'DAU / retention', label: 'метрики после запуска' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'О проекте',
      title: 'О проекте',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Задача',
              paragraphs: [
                'Сделать сервис, который собирает в одном месте новостные сайты, развлекательные медиа, авторские платформы, блоги и посты из соцсетей.',
                'Продуктовая идея — дать людям сформировать собственное мнение, видя сразу несколько источников. Бизнес-идея — сделать Яндекс именем, которому доверяют в новостях, и удержать это чтение внутри экосистемы.',
              ],
            },
            {
              type: 'text',
              heading: 'Что считалось успехом',
              paragraphs: [
                'Новый продукт на турецком рынке, новая аудитория и больше доверия со стороны тех, кто уже с нами.',
                'Измеряли по DAU и retention.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'research',
      navLabel: 'Исследование',
      title: 'Исследование аудитории',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Исследование проводила команда Яндекса, я работала с его результатами. Об этом стоит сказать прямо, а не намекать на обратное.',
            'Оно изучало повседневные новостные привычки в Турции: какие продукты приходят в голову первыми, как люди проверяют новость и что мешает им доверять источнику.',
          ],
        },
        {
          type: 'collapsible',
          title: 'Кто участвовал в исследовании',
          items: [
            '13 участников, мужчины и женщины поровну.',
            'Возраст аудитории: 18–45 лет.',
            'В выборку вошли жители крупных турецких городов, читающие новости онлайн.',
            'Ключевой фокус — mobile-first: для значительной части аудитории смартфон был основным способом выхода в интернет.',
          ],
        },
        {
          type: 'insightCards',
          heading: 'Как люди на самом деле читают новости',
          items: [
            'Никто не пользуется одной платформой. Соцсети, традиционные новостные сайты и агрегаторы работают параллельно — Twitter, Google и Bundle упоминали снова и снова.',
            'Что ценили: скорость, доступ к первоисточнику и возможность быстро сверить одну и ту же новость в разных изданиях.',
          ],
        },
        {
          type: 'painCards',
          heading: 'Что мешало',
          items: [
            'Чтобы собрать картину одного события, приходится прыгать между платформами.',
            'Большинство новостей приходит через уведомления, так что агрегатор живёт или умирает в зависимости от их качества.',
            'Доверие к традиционным СМИ низкое. Люди по привычке перепроверяют и ищут нейтральные формулировки.',
            'Реклама и перегруженные интерфейсы отправляют людей прямиком к конкуренту.',
          ],
        },
      ],
    },
    {
      id: 'solution',
      navLabel: 'Концепт',
      title: 'Концепт',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Концепт — mobile-first персонализированная лента. Не стена контента, а главная с видимыми рычагами управления.',
            'Интересы, которые выбираешь сам, источники, которые видно и можно отключить, и достаточно прозрачности, чтобы подборка новостей никогда не казалась случайной.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Как я над этим работала',
              paragraphs: [
                'Моей задачей были смысл и структура главной. UI-слой принадлежал другой команде Яндекса, с которой у меня не было прямой связи, поэтому я начала с того, на что могла повлиять: несколько подходов к самой новостной карточке.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexProcessCards,
            alt: 'Ранние поиски форматов новостной карточки',
          },
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'Из этого выросли три направления главной. Второе отпало быстро — источники в горизонтальном скролле было мучительно листать. Первое и третье ушли на A/B-тест по глубине скролла и времени на странице: первое показывает несколько новостей сразу, третье — меньше, но стягивает весь фокус на одну главную карточку.',
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexAbVariants,
            alt: 'Три концепта главной для A/B-теста',
          },
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'Точных цифр теста я так и не увидела. Но продакшн-версия говорит сама за себя — команда выбрала третий концепт с фокусной карточкой.',
          ],
        },
        {
          type: 'phonePair',
          label: 'Финальное направление в продакшне',
          items: [
            {
              type: 'video',
              src: yandexProdFinal,
              alt: 'Видео интерфейса финального направления в продакшне',
            },
            {
              type: 'image',
              src: yandexProdScreen,
              alt: 'Продакшн-экран финального направления новостной ленты',
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'Что дожило до реализации',
          items: [
            'Выбор интересов на онбординге, который можно пропустить без последствий.',
            'Управление источниками внутри продукта, а не в глубине настроек.',
            'Лента «Для вас», построенная на релевантности.',
            'Переход к полной новости без потери контекста, из которого вы пришли.',
          ],
          paragraphs: [
            'Мысль, которую я постоянно отстаивала: это не очередной агрегатор. Это настраиваемая среда, где видно, почему до тебя дошла тема, и это можно изменить в два касания.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Настройка ленты',
              paragraphs: [
                'Интересы задаются в несколько касаний, без пошагового мастера. Эти категории — отправная точка. Дальше видно, какие источники формируют ленту, и ненужные можно отключить.',
                'Под капотом LLM группирует статьи в сюжеты и решает, какие источники в них попадут. Отключите источник — и его материалы сразу исчезнут из главных новостей и страниц категорий, а не при следующем обновлении.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexPersonalization,
            alt: 'Экран управления интересами и источниками',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Сама лента',
              paragraphs: [
                'Из этих настроек складывается персональная логика: что приходит и в каком порядке. Больше релевантности, дольше внимание, лучше retention — на эту цепочку мы и ставили.',
                'По умолчанию лента начинается с того, что в Турции читают чаще всего: политика, финансы, экономика, еда, спорт, технологии.',
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
              alt: 'Видео персонализированной новостной ленты',
            },
            {
              type: 'image',
              src: yandexFeedPersonal,
              alt: 'Персонализированная лента новостей «Для вас»',
            },
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Чтение одной новости',
              paragraphs: [
                'Детальная страница показывает одно событие глазами нескольких изданий сразу — в кратком пересказе, чтобы понять суть, не читая пять статей.',
                'Смысл не только в самой новости, но и в источнике. Когда видишь, насколько по-разному рассказывают об одном событии, начинаешь составлять мнение о том, кто рассказывает. А ссылка на полную статью всегда под рукой.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: yandexStoryFocus,
            alt: 'Детальная страница новости с несколькими источниками',
          },
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Результат',
      title: 'Результат',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Метрики после запуска остались у клиента — так обычно и бывает в аутстаф-проектах. Я передала макеты, готовые к A/B-тестированию, а по тому, что вышло в прод, понятно, чем всё закончилось.',
          ],
        },
        {
          type: 'noteCard',
          title: 'Что я после себя оставила',
          items: [
            'Mobile-first концепт, построенный вокруг того, как в Турции на самом деле читают новости.',
            'Описанные ключевые сценарии: интересы, управление источниками, «Для вас» и переход к полной новости.',
            'Два варианта главной, готовые к A/B-тесту по глубине скролла и времени на странице.',
            'В запущенном продукте — направление с фокусной карточкой.',
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
      'Компания переросла собственный сайт. У меня был месяц, чтобы пересобрать его к юбилею: конкурентный анализ, прототипы и визуальная концепция вместе с арт-директором.',
    meta: 'Продуктовый дизайнер / Редизайн корпоративного сайта',
    image: {
      src: kokocCaseHero,
      alt: 'Главный экран кейса Kokoc Group',
    },
    stats: [
      { value: '30+', label: 'агентств и сервисов внутри платформы' },
      { value: '1 месяц', label: 'на запуск к юбилею компании' },
      { value: 'NDA', label: 'внутренние метрики клиента' },
    ],
  },
  sections: [
    {
      id: 'about',
      navLabel: 'О проекте',
      title: 'О проекте',
      parts: [
        {
          type: 'siteLink',
          label: 'Сайт проекта -',
          href: 'https://kokocgroup.ru/',
          text: 'kokocgroup.ru',
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Кто они',
              paragraphs: [
                'Международная платформа для роста бизнеса, объединяющая более 30 агентств и сервисов digital-маркетинга: SEO, performance-медиа, веб-аналитика, разработка и поддержка, SMM и многое другое.',
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
            alt: 'Обзор Kokoc Group',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Проблема',
              paragraphs: [
                'Бизнес изменился, а сайт — нет. Он описывал компанию меньше и проще, чем та, что существовала на деле, и в нём не было места для структуры, к которой компания уже двигалась.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'Чего мы на самом деле добивались',
          icon: '💡',
          paragraphs: [
            'Узнаваемость, ясность, доверие. Ничего из этого дизайн не даёт сам по себе — сайт должен был отразить изменения, которые и так происходили внутри компании.',
            'Это же означало, что чистой метрики успеха нет. Результат проявился бы косвенно: видимость в инфополе, брендовый спрос, NPS и со временем конверсия из контактов в брифы.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Что делала я',
              items: [
                'Собрала требования',
                'Конкурентный анализ',
                'Прототипирование',
                'Визуальная концепция вместе с арт-директором',
                'Презентовала проект стейкхолдерам',
                'Анимировала отдельные элементы и подготовила передачу в разработку',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'prototype',
      navLabel: 'Прототип',
      title: 'Прототипирование',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Большая часть времени на прототипирование ушла не на отрисовку, а на то, чтобы разобраться в бизнесе: как на самом деле устроена платформа, что делают конкуренты, несколько встреч с командой. Потом каждый раздел я показывала клиенту отдельно, чтобы в конце не было сюрпризов.',
          ],
        },
        {
          type: 'imageBand',
          media: {
            type: 'image',
            src: kokocPrototype,
            alt: 'Прототипы страниц Kokoc Group',
          },
        },
      ],
    },
    {
      id: 'concept',
      navLabel: 'Концепт',
      title: 'Разработка концепции',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Первый экран должен был продать идею с 3D и моушеном ещё до того, как кто-то её реализовал, поэтому анимации я собрала сама — прогнала готовые иллюстрации через Luma AI. Этого хватило, чтобы получить согласие. Потом подключился моушен-дизайнер и довёл всё как следует.',
          ],
        },
        {
          type: 'bento',
          label: 'Эксперименты с моушеном',
          tiles: [
            {
              type: 'video',
              src: kokocVideo1,
              alt: 'Анимация первого экрана Kokoc Group',
              span: 'full',
              variant: 'kokoc-hero-motion',
              zoom: 0.65,
              caption: 'Первый экран — идея с 3D и моушеном, которую я показала первой.',
            },
            {
              type: 'video',
              src: kokocVideoMenu,
              alt: 'Анимация меню Kokoc Group',
              span: 'half',
              variant: 'kokoc-light-motion',
              zoom: 1.067,
              caption: 'Навигационное меню.',
            },
            {
              type: 'video',
              src: kokocVideoCards,
              alt: 'Анимация карточек Kokoc Group',
              span: 'half',
              variant: 'kokoc-light-motion',
              zoom: 1.067,
              caption: 'Карточки услуг.',
            },
            {
              src: kokocConcept1,
              alt: 'Визуальная концепция Kokoc Group, вариант первый',
              span: 'wide',
              variant: 'kokoc-light-frame',
              zoom: 1.05,
              caption: 'Визуальное направление 1.',
            },
            {
              src: kokocConcept2,
              alt: 'Визуальная концепция Kokoc Group, вариант второй',
              span: 'third',
              variant: 'kokoc-light-frame',
              zoom: 1.4,
              fx: '38%',
              fy: '30%',
              caption: 'Визуальное направление 2.',
            },
          ],
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Результат',
      title: 'Результат',
      parts: [
        {
          type: 'noteCard',
          title: 'Чем всё закончилось',
          items: [
            'Запустились за месяц — как раз к юбилею.',
            'Хорошие отзывы и от клиентов, и от внутренних команд.',
          ],
        },
        {
          type: 'siteLink',
          label: 'Сайт проекта -',
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
    title: 'Дизайн-кринжометр',
    description:
      'Вставляешь ссылку — получаешь процент кринжа и список того, что именно не так. Инструмент дизайн-ревью, который измеряет отрисованную страницу, а не гадает. Собран и запущен за неделю.',
    meta: 'Сайд-проект / Инструмент для дизайнеров',
    image: {
      src: designCringeScore,
      alt: 'Результат кринжометра: 73% у перегруженного интернет-магазина',
    },
    stats: [
      { value: '29', label: 'правил в 9 категориях' },
      { value: '88', label: 'автотестов' },
      { value: '1 неделя', label: 'от плана до живого сайта' },
    ],
    points: ['React', 'Playwright', 'AWS Lambda', 'Tilda'],
  },
  sections: [
    {
      id: 'idea',
      navLabel: 'Идея',
      title: 'Идея',
      parts: [
        {
          type: 'siteLink',
          label: 'Сайт -',
          href: 'https://designecringe.com/',
          text: 'designecringe.com',
        },
        {
          type: 'richTextLead',
          paragraphs: [
            'Любой дизайнер за секунду видит, что со страницей что-то не так. Объяснить почему — гораздо дольше, а «выглядит дёшево» — не тот фидбек, с которым можно работать.',
            'Кринжометр превращает это ощущение в число и список: контраст ниже WCAG, кнопки, в которые не попасть пальцем, двенадцать шрифтов, попап в первые три секунды.',
          ],
        },
        {
          type: 'imageBand',
          media: {
            type: 'image',
            src: designCringeLanding,
            alt: 'Стартовый экран кринжометра с полем для ссылки',
          },
        },
      ],
    },
    {
      id: 'approach',
      navLabel: 'Подход',
      title: 'От регулярок к настоящему браузеру',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Первая версия',
              paragraphs: [
                'Небольшой Node-сервер искал регулярками по сырому HTML: marquee и blink, Comic Sans, неоновые цвета, автоплей, капс. Было смешно, но слепо — HTML ничего не говорит о контрасте, отступах и раскладке, которые видит человек.',
              ],
            },
            {
              type: 'text',
              heading: 'Вторая версия',
              paragraphs: [
                'Теперь страница рендерится в headless Chromium дважды — на 1280 и на 375 пикселей. Анализатор читает вычисленные стили, реальные цвета и размеры элементов и возвращает скриншоты как доказательство.',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'Правило, которое я держала с самого начала',
          paragraphs: [
            'Дизайн не оценивает нейросеть. Скоринг детерминированный: одна и та же страница всегда получает одно и то же число, и каждый его пункт ведёт к правилу, которое можно прочитать. AI писал со мной код, но голоса в результате у него нет.',
          ],
        },
      ],
    },
    {
      id: 'rules',
      navLabel: 'Правила',
      title: 'Что считается кринжем',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Правила взяты из источников, которым дизайнеры и так доверяют: эвристики Nielsen Norman, WCAG 2.2, нормы типографики, теория цвета и каталог дарк-паттернов Гарри Бригнулла. Плюс отдельная категория веб-реликтов — для совсем исторических находок.',
          ],
        },
        {
          type: 'imageBand',
          label: 'Разбивка по категориям',
          media: {
            type: 'image',
            src: designCringeCategories,
            alt: 'Оценка по девяти категориям дизайна',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Девять категорий',
              items: [
                'Доступность — контраст, размер тап-зон, фокус, заголовки, alt',
                'Типографика — длина строки, интерлиньяж, число шрифтов, минимальный кегль',
                'Цвет — размер палитры, неоновые конфликты, перебор градиентов',
                'Раскладка — переполнение, плотность первого экрана, воздух',
                'Дарк-паттерны — confirmshaming, фальшивая срочность, навязчивые попапы',
                'CTA, медиа, мобильная версия и веб-реликты',
              ],
            },
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Как считается оценка',
              paragraphs: [
                'У каждого правила есть вес по важности — критично, важно или мелочь — и он растёт с тем, насколько страница вышла за порог. У каждой категории есть потолок, чтобы одна провальная область не решала весь вердикт. На выходе — процент кринжа от 0 до 100 и вердикт, который называет худшую категорию.',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: designCringeIssues,
            alt: 'Список найденных проблем с пометками «критично», «важно» и «мелочь»',
          },
        },
      ],
    },
    {
      id: 'mobile',
      navLabel: 'Мобильная',
      title: 'Кринж и не кринж',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Перегруженный магазин получает 73% и красное кольцо. Чистый продуктовый сайт — 25% и зелёное. Оба измерены одними и теми же правилами, на десктопе и на телефоне.',
          ],
        },
        {
          type: 'phonePair',
          items: [
            {
              type: 'image',
              src: designCringeMobileBad,
              alt: 'Мобильный результат с высоким процентом кринжа',
            },
            {
              type: 'image',
              src: designCringeMobileClean,
              alt: 'Мобильный результат с низким процентом кринжа',
            },
          ],
        },
      ],
    },
    {
      id: 'launch',
      navLabel: 'Запуск',
      title: 'Запуск',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Что понадобилось, чтобы выложить',
              items: [
                'Headless-браузер в AWS Lambda за API Gateway, инфраструктура на Terraform',
                'Защита от запросов во внутренние сети, кэш и лимит параллельных рендеров',
                'Бюджетный алерт и ограничение частоты запросов, чтобы вирусный день не превратился в счёт',
                'Фронтенд встроен в страницу на Tilda, чтобы сайт было легко редактировать',
              ],
            },
          ],
        },
        {
          type: 'noteCard',
          title: 'Где он сейчас',
          items: [
            'Работает на designecringe.com.',
            'Следующая задача — калибровка: олдскульный сайт пока может набрать меньше, чем современный, который лучше прячет свои проблемы.',
          ],
        },
      ],
    },
  ],
};

export const dsPluginsCaseStudy = {
  slug: 'ds-plugins',
  backHref: '/ai-projects',
  hero: {
    title: 'Плагины для дизайн-системы',
    description:
      'Три плагина для Figma, которые снимают рутину с поддержки дизайн-системы: отслеживают изменения компонентов, ведут версии и передают токены в разработку в понятном ей формате.',
    meta: 'Внутренние инструменты / Дизайн-системы',
    image: {
      src: dsPluginsCover,
      alt: 'Окна плагинов DS Changelog, DS Manager и DS Foundation Export',
    },
    stats: [
      { value: '3', label: 'плагина — от идеи до рабочей сборки' },
      { value: '550+', label: 'автотестов' },
      { value: 'до $12,6K', label: 'в год потенциальной экономии на софте' },
    ],
    points: ['Figma Plugin API', 'React', 'TypeScript'],
  },
  sections: [
    {
      id: 'problem',
      navLabel: 'Проблема',
      title: 'Проблема',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Когда компонент дизайн-системы меняется, фронтенд и QA узнают об этом поздно и не полностью. Пропал вариант, цвет переехал на другой токен — и кто-то узнаёт об этом из бага.',
            'Описывать каждую правку руками долго и ненадёжно. Платные инструменты закрывают куски этой задачи, но ни один не совпадает с тем, как наша команда реально передаёт работу.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Чего я хотела от инструментов',
              items: [
                'Замечать каждое изменение компонента, а не только те, что помнит дизайнер',
                'Чётко говорить, какие правки сломают код',
                'Собирать сообщение, документацию и JSON без перепечатывания',
                'Передавать переменные и текстовые стили в разработку в структурированном виде',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'changelog',
      navLabel: 'Changelog',
      title: 'DS Changelog',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Первый плагин фиксирует базовое состояние компонента и потом сравнивает с ним текущее. Свойства, варианты, размеры, auto layout, заливки, типографика, привязки токенов и дерево слоёв — всего тринадцать областей.',
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: dsPluginsChangelog,
            alt: 'DS Changelog: выбранные компоненты, список изменений и превью сообщения в Slack',
          },
        },
        {
          type: 'insightCards',
          heading: 'Каждое изменение получает одну из четырёх пометок',
          items: [
            'Ломающее — сломает существующий код, фронтенд реагирует обязательно.',
            'Визуальное — меняется внешний вид, QA перепроверяет.',
            'Дополнение — обратно совместимо, к сведению.',
            'Документация — не влияет ни на код, ни на пиксели.',
          ],
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Решение остаётся за дизайнером',
              paragraphs: [
                'Список — черновик, а не приговор. Клик по изменению перематывает холст к нужному слою, ложные срабатывания можно снять, для разработки — оставить комментарий. На выходе сообщение для Slack или в Markdown, JSON-спецификация и страница с изменениями прямо в Figma-файле.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'manager',
      navLabel: 'Manager',
      title: 'DS Manager',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Первая версия каждый запуск воспринимала как новый старт. В реальной работе компонент живёт годами, поэтому второй плагин построен вокруг его жизненного цикла: постоянная запись, версии, проверка и утверждение.',
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: dsPluginsManager,
            alt: 'DS Manager: каталог компонентов, карточка компонента с версиями и отчёт проверки',
          },
        },
        {
          type: 'blocks',
          blocks: [
            {
              type: 'list',
              heading: 'Что он добавляет',
              items: [
                'Каталог всех компонентов файла с версиями и статусами',
                'Базовую, утверждённую и опубликованную версии с историей',
                'Номер следующей версии, предложенный по типу изменений',
                'Проверку: нет состояния фокуса, маленькая зона нажатия, отступы вне сетки',
                'Пакетную обработку и экспорт из шести файлов на каждый компонент',
              ],
            },
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: dsPluginsManagerBatch,
            alt: 'DS Manager: история версий, дифф документации и пакетная выгрузка',
          },
        },
        {
          type: 'noteCard',
          title: 'Маленькие правила, которые важны',
          items: [
            'Обновление документации показывается диффом до сохранения.',
            'Текст, который дизайнер поправил руками, никогда не перезаписывается.',
            'Догадка подписана как догадка — «проверьте» вместо ложной ошибки.',
          ],
        },
      ],
    },
    {
      id: 'foundation',
      navLabel: 'Основы',
      title: 'DS Foundation Export',
      parts: [
        {
          type: 'richTextLead',
          paragraphs: [
            'Третий плагин отвечает за базовый слой: коллекции переменных и режимы, текстовые стили, тени и иконки. Он раскладывает переменные по категориям, подсвечивает то, что сломает генерацию токенов, и выгружает ровно то, что прошло проверку.',
          ],
        },
        {
          type: 'featureMedia',
          media: {
            src: dsPluginsFoundation,
            alt: 'DS Foundation Export: источники, проверка с ошибками и предупреждениями, итог выгрузки',
          },
        },
      ],
    },
    {
      id: 'process',
      navLabel: 'Процесс',
      title: 'Как я это собирала',
      parts: [
        {
          type: 'blocks',
          blocks: [
            {
              type: 'text',
              heading: 'Сначала спецификация, потом код',
              paragraphs: [
                'С AI я работала так же, как с разработчиком: подробная спецификация с пронумерованными разделами, этапами и критериями готовности. Спека для DS Manager вышла больше чем на тысячу строк, и код до сих пор ссылается на её разделы.',
              ],
            },
            {
              type: 'text',
              heading: 'Тесты как страховка',
              paragraphs: [
                'У каждого плагина есть тесты на основную логику — всего больше 550. Именно они позволили пересобрать второй плагин примерно за два дня и не сломать первый.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'result',
      navLabel: 'Результат',
      title: 'Результат',
      parts: [
        {
          type: 'noteCard',
          title: 'Где это сейчас',
          items: [
            'Три рабочих плагина, собранных и готовых к установке в Figma.',
            'До $12,6K в год потенциальной экономии на платных инструментах для дизайн-системы.',
            'Дальше — публикация в Figma Community и подключение выгрузки к бэкенду команды.',
          ],
        },
      ],
    },
  ],
};
