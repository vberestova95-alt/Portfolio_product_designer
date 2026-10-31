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
      experienceTitle: 'Опыт и контакты — Владислава Берестова',
      experienceDescription:
        'Опыт продуктового дизайнера Владиславы Берестовой и контакты для связи.',
      aiProjectsTitle: 'AI-проекты — Владислава Берестова',
      aiProjectsDescription:
        'Продукты, которые я спроектировала и собрала сама вместе с AI: плагины для дизайн-системы, анализатор дизайна и трекер для питомца.',
      privacyTitle: 'Политика конфиденциальности — Владислава Берестова',
      privacyDescription: 'Какие данные собирает сайт, зачем и как отказаться.',
      nameSuffix: 'Владислава Берестова',
    },
    nav: {
      contactLinks: 'Контакты',
      siteNav: 'Разделы сайта',
      links: {
        aiProjects: 'AI-проекты',
        dribbble: 'Dribbble',
        experience: 'Опыт',
      },
      contactMe: 'Связаться со мной',
      contactVia: {
        linkedin: 'LinkedIn',
        email: 'Написать на почту',
        telegram: 'Telegram',
      },
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      language: 'Язык сайта',
      switchTo: 'Switch to English',
    },
    consent: {
      label: 'Согласие на статистику',
      message:
        'Мне интересно узнать, какие проекты привлекают внимание посетителей и как они взаимодействуют с ними. С вашего согласия сайт использует cookie для сбора аналитики.',
      policy: 'Политика конфиденциальности',
      settings: 'Настройки cookie',
      accept: 'Принять',
      decline: 'Отказаться',
    },
    privacyPage: {
      title: 'Политика конфиденциальности',
      description:
        'Это личное портфолио: здесь нет аккаунтов и форм. Статистика включается, только если вы согласились.',
      updated: 'Обновлено 31 октября 2026',
      sections: [
        {
          title: 'Кто отвечает за данные',
          paragraphs: ['Владислава Берестова, автор сайта. По любым вопросам о данных пишите на почту:'],
          showEmail: true,
        },
        {
          title: 'Что работает всегда',
          paragraphs: ['Без этого сайт не работает как задумано, поэтому согласие здесь не запрашивается:'],
          items: [
            'В браузере хранятся выбранный язык и ваш ответ на вопрос о статистике. Ответ хранится 12 месяцев.',
            'Шрифты загружаются из Google Fonts, поэтому Google получает ваш IP-адрес.',
            'Хостинг (GitHub Pages, для кейса Pet Injection Tracker — Netlify) может записывать технические данные запросов.',
          ],
        },
        {
          title: 'Что включается с согласия',
          paragraphs: ['Яндекс Метрика: cookie, IP-адрес, данные об устройстве и браузере, просмотренные страницы, клики, прокрутка и запись действий на странице (Вебвизор).', 'Собственная статистика:'],
          items: [
            'случайные идентификаторы посетителя и визита в браузере;',
            'просмотренные страницы, клики по ссылкам, глубина прокрутки, время на странице;',
            'откуда вы пришли, метки ссылки, язык, часовой пояс, размер экрана;',
            'тип устройства, система и браузер;',
            'страна и город, определённые по IP-адресу. Сам IP-адрес в статистике не сохраняется.',
          ],
        },
        {
          title: 'Зачем это нужно',
          paragraphs: [
            'Чтобы понимать, какие работы смотрят, откуда приходят посетители и что на сайте стоит улучшить. Данные не используются для рекламы и не продаются.',
          ],
        },
        {
          title: 'Кто получает данные и сколько их хранят',
          paragraphs: [
            'Данные Метрики обрабатывает Яндекс по своим условиям. Собственная статистика работает на Vercel и Upstash. Эти сервисы могут хранить данные за пределами вашей страны.',
            'В собственной статистике данные визита хранятся до суток, дневные итоги — 400 дней. Лента последних 300 событий хранится с сокращённым идентификатором посетителя.',
          ],
          link: { href: 'https://yandex.ru/legal/metrica_termsofuse/ru/', label: 'Условия Яндекс Метрики' },
        },
        {
          title: 'Ваш выбор',
          paragraphs: [
            'Вы можете отказаться или передумать в любой момент: ссылка «Настройки cookie» есть внизу страниц. После отказа статистика выключается, а её cookie и идентификаторы удаляются из этого браузера.',
            'Чтобы узнать, какие данные о вас есть, исправить или удалить их, напишите на почту из первого раздела.',
          ],
        },
      ],
    },
    experiencePage: {
      title: 'Опыт и контакты',
      description:
        '7 лет в продуктовом дизайне: in-house команды, агентства, стартапы и фриланс. Ниже — где я работала и как со мной связаться.',
      contactsTitle: 'Контакты',
      emailLabel: 'Почта',
      contactLinks: {
        Dribbble: 'Шоты и концепты',
        LinkedIn: 'Профиль',
        CV: 'Скачать резюме (PDF)',
      },
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
      practiceLink: 'Смотреть все проекты',
      practiceCleared: {
        title: 'Чисто.',
        copy: 'Вот бы так выглядел каждый файл в Figma.',
        restore: 'Вернуть кубики',
      },
      experienceTitle:
        'Продуктовая работа в in-house командах, агентствах, стартапах и на фрилансе',
      achievementsLabel: 'Ключевые достижения',
      achievementsTitle:
        'Запускаю, масштабирую, проверяю гипотезы и улучшаю то, как команды проектируют',
      clientsLabel: 'Клиенты и продукты',
      gameStart: 'Начать игру',
      gameLabel: 'картинок собрано',
      gameDone: 'Все найдены!',
      gameClose: 'Закрыть игру',
      heroCasesLabel: 'Главные кейсы',
      aboutTitle: 'Обо мне',
      aboutCopy: [
        'В свободное время я снимаю на плёнку, хожу в горы, катаюсь на сноуборде и занимаюсь живописью.',
        'Я люблю игры, особенно головоломки, поэтому придумала для вас игру с моими фотографиями.',
      ],
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
      back: 'Назад',
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
      experienceTitle: 'Experience and Contacts - Vladislava Berestova',
      experienceDescription:
        'Product design experience of Vladislava Berestova and ways to get in touch.',
      aiProjectsTitle: 'AI Projects - Vladislava Berestova',
      aiProjectsDescription:
        'Products I designed and built myself with AI: design system plugins for Figma, a design analyzer, and a pet care tracker.',
      privacyTitle: 'Privacy policy - Vladislava Berestova',
      privacyDescription: 'What data this site collects, why, and how to opt out.',
      nameSuffix: 'Vladislava Berestova',
    },
    nav: {
      contactLinks: 'Contact links',
      siteNav: 'Site sections',
      links: {
        aiProjects: 'AI projects',
        dribbble: 'Dribbble',
        experience: 'Experience',
      },
      contactMe: 'Contact me',
      contactVia: {
        linkedin: 'LinkedIn',
        email: 'Send an email',
        telegram: 'Telegram',
      },
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      language: 'Site language',
      switchTo: 'Переключить на русский',
    },
    consent: {
      label: 'Consent to statistics',
      message:
        'I’m curious to see which projects catch your eye and how you explore them. With your consent, this site uses cookies to collect analytics.',
      policy: 'Privacy policy',
      settings: 'Cookie settings',
      accept: 'Accept',
      decline: 'Decline',
    },
    privacyPage: {
      title: 'Privacy policy',
      description:
        'This is a personal portfolio with no accounts or forms. Statistics only run if you agree to them.',
      updated: 'Updated 31 October 2026',
      sections: [
        {
          title: 'Who is responsible',
          paragraphs: ['Vladislava Berestova, the author of this site. For any question about your data, write to:'],
          showEmail: true,
        },
        {
          title: 'What always runs',
          paragraphs: ['The site needs these to work as intended, so they do not ask for consent:'],
          items: [
            'Your browser stores your language and your answer about statistics. The answer is kept for 12 months.',
            'Fonts load from Google Fonts, so Google receives your IP address.',
            'Hosting (GitHub Pages, and Netlify for the Pet Injection Tracker case) may log technical request data.',
          ],
        },
        {
          title: 'What runs with your consent',
          paragraphs: ['Yandex Metrica: cookies, IP address, device and browser data, pages viewed, clicks, scrolling and recordings of on-page actions (Webvisor).', 'The site\'s own statistics:'],
          items: [
            'random visitor and visit IDs stored in your browser;',
            'pages viewed, link clicks, scroll depth and time on page;',
            'where you came from, link tags, language, time zone and screen size;',
            'device type, operating system and browser;',
            'country and city worked out from your IP address. The IP address itself is not kept in the statistics.',
          ],
        },
        {
          title: 'Why',
          paragraphs: [
            'To understand which work people look at, where they come from and what to improve. The data is not used for advertising and is not sold.',
          ],
        },
        {
          title: 'Who receives data and for how long',
          paragraphs: [
            'Yandex processes Metrica data under its own terms. The site\'s own statistics run on Vercel and Upstash. These services may store data outside your country.',
            'In the site\'s own statistics, visit data is kept for up to a day and daily totals for 400 days. A feed of the latest 300 events keeps a shortened visitor ID.',
          ],
          link: { href: 'https://yandex.com/legal/metrica_termsofuse/', label: 'Yandex Metrica terms' },
        },
        {
          title: 'Your choice',
          paragraphs: [
            'You can decline or change your mind at any time with the “Cookie settings” link at the bottom of the pages. Declining turns statistics off and removes their cookies and IDs from this browser.',
            'To find out what data exists about you, or to correct or delete it, write to the email in the first section.',
          ],
        },
      ],
    },
    experiencePage: {
      title: 'Experience and contacts',
      description:
        'Seven years of product design across in-house teams, agencies, startups and freelance. Below: where I have worked and how to reach me.',
      contactsTitle: 'Contacts',
      emailLabel: 'Email',
      contactLinks: {
        Dribbble: 'Shots and concepts',
        LinkedIn: 'Profile',
        CV: 'Download CV (PDF)',
      },
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
      practiceLink: 'View all projects',
      practiceCleared: {
        title: 'Spotless.',
        copy: 'If only every Figma file looked like this.',
        restore: 'Bring the cubes back',
      },
      experienceTitle:
        'Product work across in-house teams, agencies, startup environments, and freelance delivery',
      achievementsLabel: 'Key Achievements',
      achievementsTitle:
        'A track record of shipping, scaling, validating, and improving the way teams design',
      clientsLabel: 'Clients and products',
      gameStart: 'Start game',
      gameLabel: 'pictures found',
      gameDone: 'All found!',
      gameClose: 'Close the game',
      heroCasesLabel: 'Main cases',
      aboutTitle: 'About me',
      aboutCopy: [
        'In my free time I shoot film, hike in the mountains, snowboard and paint.',
        'I love games, especially puzzles, so I made one for you with my photos.',
      ],
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
      back: 'Back',
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
