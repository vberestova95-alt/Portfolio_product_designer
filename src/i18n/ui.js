/*
 * Interface strings that live in components rather than in the content files.
 * Content itself (cases, experience, profile copy) is translated in the
 * `*.ru.js` siblings under src/data — see data/content.js.
 */
export const ui = {
  ru: {
    meta: {
      homeTitle: 'Владислава Берестова — продуктовый дизайнер',
      homeDescription:
        'Портфолио Владиславы Берестовой — продуктового дизайнера сложных цифровых систем, дизайн-систем и продуктового UX.',
      conceptsTitle: 'Дизайн-концепты — Владислава Берестова',
      conceptsDescription:
        'Самостоятельные исследования интерфейсов и концепты для портфолио: арт-дирекшн, визуальные системы и работа с интерфейсом.',
      nameSuffix: 'Владислава Берестова',
    },
    nav: {
      contactLinks: 'Контакты',
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      language: 'Язык сайта',
      switchTo: 'Switch to English',
    },
    home: {
      heroTitle: {
        start: 'Продуктовый',
        accent: 'дизайнер',
        // Line breaks are set per language in HomePage.
        rest: ['сложных', 'цифровых', 'систем'],
      },
      openCase: 'Открыть кейс',
      viewProject: 'Смотреть проект',
      practiceTitle: {
        start: 'Фокус на',
        accent: 'дизайн-системах',
        end: ', AI-воркфлоу и внутренних инструментах',
      },
      practiceCopy:
        'Люблю сложные продуктовые задачи — от дискавери до запуска. Работаю в тесной связке с продакт-менеджерами, разработчиками, исследователями и стейкхолдерами, чтобы превратить неопределённость в понятное продуктовое направление.',
      experienceTitle:
        'Продуктовая работа в in-house командах, агентствах, стартапах и на фрилансе',
      achievementsLabel: 'Ключевые достижения',
      achievementsTitle:
        'Запускаю, масштабирую, проверяю гипотезы и улучшаю то, как команды проектируют',
      clientsLabel: 'Клиенты и продукты',
    },
    case: {
      before: 'До',
      after: 'После',
      dragToCompare: 'Потяните, чтобы сравнить',
      projectLink: 'Ссылка на проект',
      moreWork: 'Ещё работы',
      otherProjects: 'Другие проекты',
      openCase: 'Открыть кейс',
      allWork: 'Все работы',
      closeImage: 'Закрыть изображение',
    },
    pet: {
      brandName: 'Берестова Владислава',
      meta: 'Отдельный кейс / Pet-tech концепт',
      description:
        'Моей кошке нужен инсулин дважды в день. Пропуск — это серьёзно, а заметки в телефоне — плохое место, чтобы это отслеживать. Поэтому я сделала то, чего мне не хватало.',
      availabilityTitle: 'Ищу пользователей для тестирования',
      availabilityText:
        'Если у вашего питомца есть регулярные уколы, буду рада поговорить и посмотреть, как этот сценарий ложится на реальные привычки.',
    },
    error: {
      portfolio: 'Продуктовое портфолио',
      report: 'Сообщить о проблеме',
      footerLeft: 'Проектирую сложные цифровые системы',
      footerRight: 'Армения / 2026',
      notFound: {
        label: 'Страница не найдена',
        titleStart: 'Эта страница',
        titleAccent: 'выпала',
        titleEnd: ' из системы',
        description:
          'Возможно, ссылка устарела или страница переехала. Избранные работы — на своём месте.',
        primaryLabel: 'К избранным работам',
      },
      runtime: {
        label: 'Неожиданная ошибка интерфейса',
        titleStart: 'Что-то пошло',
        titleAccent: 'не по сетке',
        titleEnd: '',
        description:
          'Интерфейс столкнулся с неожиданной ошибкой. Обычно помогает перезагрузить страницу.',
        primaryLabel: 'Перезагрузить страницу',
      },
    },
  },
  en: {
    meta: {
      homeTitle: 'Vladislava Berestova - Product Designer',
      homeDescription:
        'Portfolio of Vladislava Berestova, a product designer focused on complex digital systems, design systems, and product-led UX.',
      conceptsTitle: 'Design Concepts - Vladislava Berestova',
      conceptsDescription:
        'Independent interface studies and portfolio concepts exploring art direction, visual systems, and interface craft.',
      nameSuffix: 'Vladislava Berestova',
    },
    nav: {
      contactLinks: 'Contact links',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      language: 'Site language',
      switchTo: 'Переключить на русский',
    },
    home: {
      heroTitle: {
        start: 'Product',
        accent: 'Designer',
        rest: ['for', 'complex', 'digital systems'],
      },
      openCase: 'Open case study',
      viewProject: 'View project',
      practiceTitle: {
        start: 'Focused on',
        accent: 'design systems',
        end: ', AI-assisted workflows, and internal tools',
      },
      practiceCopy:
        'I enjoy solving complex product challenges from discovery to delivery, working closely with product managers, engineers, researchers, and stakeholders to turn ambiguity into a coherent product direction.',
      experienceTitle:
        'Product work across in-house teams, agencies, startup environments, and freelance delivery',
      achievementsLabel: 'Key Achievements',
      achievementsTitle:
        'A track record of shipping, scaling, validating, and improving the way teams design',
      clientsLabel: 'Clients and products',
    },
    case: {
      before: 'Before',
      after: 'After',
      dragToCompare: 'Drag to compare',
      projectLink: 'Project link',
      moreWork: 'More work',
      otherProjects: 'Other projects',
      openCase: 'Open case',
      allWork: 'All work',
      closeImage: 'Close image',
    },
    pet: {
      brandName: 'Berestova Vladislava',
      meta: 'Standalone case study / Pet-tech concept',
      description:
        'My cat needs insulin twice a day. Missing one matters, and a notes app is a bad place to track that, so I built the thing I wanted to exist.',
      availabilityTitle: 'Looking for users for testing',
      availabilityText:
        'If your pet has a routine with recurring injections, I would love to talk and see how this flow fits real habits.',
    },
    error: {
      portfolio: 'Product portfolio',
      report: 'Report an issue',
      footerLeft: 'Designing complex digital systems',
      footerRight: 'Armenia / 2026',
      notFound: {
        label: 'Page not found',
        titleStart: 'This page slipped',
        titleAccent: 'out of',
        titleEnd: ' the system',
        description:
          'The link may be outdated, or the page may have moved. The selected work is still exactly where it should be.',
        primaryLabel: 'Back to selected work',
      },
      runtime: {
        label: 'Unexpected interface error',
        titleStart: 'Something went',
        titleAccent: 'off-grid',
        titleEnd: '',
        description:
          'The interface hit an unexpected error. Reloading usually puts everything back in place.',
        primaryLabel: 'Reload the page',
      },
    },
  },
};
