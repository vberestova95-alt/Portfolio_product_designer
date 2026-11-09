# e2e — проверки перед деплоем

Playwright стоит как библиотека (`playwright` в devDependencies, без `@playwright/test`), поэтому сценарии — обычные
Node-скрипты. Запускать из корня проекта (иначе Node не найдёт `playwright`).

```bash
npm run build
npx vite preview --port 4173 --strictPort        # порт сначала занять в TEAM.md → «Общие ресурсы»
node e2e/predeploy.spec.mjs                      # BASE=http://localhost:4173, SHOTS=<папка для скриншотов>
node e2e/ru-images.check.mjs                     # RU-данные карточек через vite ssrLoadModule, сервер не нужен
node e2e/hero-pairs.check.mjs                   # смена пар в хиро на ≤640 (Chromium + WebKit iPhone 13); RU_BASE, PROD=https://vberestova.com, ONLY=chromium-en,webkit-en,chromium-ru,webkit-ru,regress; ~12 мин на браузер и язык
node e2e/other-projects.check.mjs              # блок «Other projects»; RU_BASE=…4174 для RU, BASELINE=<сборка прошлого коммита> для сравнения главной
node e2e/cat-app-preview.check.mjs                    # /cat-app: шаги истории, пары до/после, бренд, ключевые флоу, метрика ∞, Research/Decisions; 1440/768/390. RU: BASE=…4182 LANG_CODE=ru, SHOTS=<папка>
node e2e/webkit-safari.check.mjs                # Playwright WebKit: 8 страниц на 1440/390 (консоль, картинки, h-scroll), .mov/.webm с альфой, шаги showcase PASS, «Назад» из Other projects; нужен `npx playwright install webkit`
node e2e/back-navigation.check.mjs              # «Назад» из тизера Gamification hub и карточек Other projects (Chromium + WebKit, 1440/390): страница встаёт к ссылке, допуск 80 px
BASE=http://localhost:4174 node e2e/ru-media.check.mjs   # RU-ролики и лента; нужна временная сборка с RU_ENABLED=true (рецепт в шапке файла)
```

Код выхода 1 — что-то упало; в конце печатается список FAIL.

- `predeploy.spec.mjs` — главная (1440/1024/390): ссылки мозаик хиро, порядок и обложки карточек, горизонтальная прокрутка,
  битые картинки, консоль; все маршруты из `scripts/deploy-targets.mjs` (1440/390); блок «следующие кейсы»; /cat-app (герой,
  лента v2, лента MVP без подложки и без обрезки); `?lang=ru`. Порядок кейсов — константа `CASE_ORDER` в начале файла:
  меняется порядок на сайте — правим её.
- `cat-app-preview.check.mjs` — /cat-app целиком (пп. 29–33): без битых картинок и ошибок, шаги 1–5, слайдер beforeAfterPairs (на 390 — чипы пар), брендинг (свёрнут, 6 плиток, лайтбокс, сетка 2×3 на 390), нет «Clip A/B», клипы играют и sc1-b зацикливается, ∞ в шапке, 4 карточки Research, 4 «Confirmed / Подтверждено».
- `home-fluffy-cards.check.mjs` — карточки Fluffy Chumb на главной и в /ai-projects (1440/390): новые тексты, нет старых формулировок, картинки, ссылка, консоль. RU: `BASE=…4182 LANG_CODE=ru`.
- `ru-images.check.mjs` — у каждого RU-кейса своя обложка, у Fluffy Chumb `.ru.webp`.

Особенности:
- Карточки: на 1440 — в `.case-cube__face`, на 1024 и 390 — в `.work-stack`.
- На телефоне в хиро помещаются 2 мозаики из 3 — так задумано.
- Метрика (`*.yandex.net`) в песочнице падает по сертификату — вынесена в заметки, в итог не идёт.
- `waitUntil: 'networkidle'` иногда не дожидается на страницах с видео (Yandex, Kokoc) — для кликов брать `load`.
- С п. 24 на ≤640 в хиро две мозаики за раз: BetBoom + Yandex ↔ Fluffy Chumb + Kokoc, по таймеру 7 с и по тапу на пустое место. `predeploy` проверяет только первую пару и кнопку, подробности — `hero-pairs.check.mjs`. Селектор ссылок — `.hero-panel .mosaic-link`: такие же мозаики есть на карточках ниже.
- На 320 (ширина меньше 336) в хиро одна мозаика: сетка из 3 колонок вмещает один блок 2×2. Yandex и Kokoc из хиро там недоступны, так же было и до п. 24.
- `hero-pairs` читает, что на экране, с canvas: сравнивает четверти карточки с четвертями обложек. Запись тапа — в `localStorage.__tap` на `pointerdown`, поэтому её можно прочитать уже на странице кейса.
- Свайп проверяется только в Chromium (`Input.synthesizeScrollGesture`); в WebKit у Playwright нет такого способа. Скрытая вкладка эмулируется подменой `document.hidden`.
- Баннер согласия (`vb_consent`) закрывает низ экрана: сценарии заранее ставят ответ «denied» через `addInitScript`; раздел 4 в `hero-pairs` идёт в чистом браузере с баннером. Метрика при этом блокируется через `route`, на проде тоже.
- В WebKit фокус по ссылкам и кнопкам — `Alt+Tab`, не `Tab` (так ведёт себя Safari).
