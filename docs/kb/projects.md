# Проекты и ссылки
Реестр всех проектов, из которых портфолио берёт знания, и всех их ссылок. Ведёт docs-keeper
(правила — `.claude/skills/docs-keeper-guide`). **наш** — можно править, **только читать** — чужая команда / чужой проект.

Знания храним по всем проектам из `~/Desktop/Projects VS`, кроме папок портфолио. Попадёт ли проект на сайт
и что о нём публикуется — решает только пользователь; кейсы на сайте остаются как есть.

Все локальные папки — `~/Desktop/Projects VS/<папка>`. Репозитории — GitHub `vberestova95-alt`, если не сказано иное.
«—» в строке = в источниках проекта не нашли (README, `CLAUDE.md`, `docs/kb/`, память агентов, список артефактов).

## Отчёт «что я делала по всем проектам»
Сверено: 2026-10-30.
- Документ «Мой опыт с AI-инструментами» (Claude Docs, 22.10.2026): https://claude.ai/artifact/LunSGzMi2HDz8yKPsSh2wp —
  **только читать** (проект AI experience, не наш документ).
  Разделы: Коротко · Путь и таймлайн (сентябрь 2025 → 22.10.2026) · Какие задачи решаю с агентами · Сколько агентов
  одновременно · Как я пишу промпты · Продукты, собранные с AI (6 карточек: портфолио, Дизайн-кринжометр, DS-плагины,
  трекер инъекций, таск-менеджер в Telegram, фотопрогулки) · Технологии · Домены и хостинг · Экономика (~$134/мес) ·
  Время до первого деплоя (сайт ~24 ч, продукт с бэкендом ~4,3 дня).
- Черновик того же отчёта (Codex, первая версия, только по следам `portfolio-next`): `AI experience/AI-experience-report.md` — **только читать**.
- Наше дополнение с тем, что случилось после 22.10 (Fluffy Chumb v2, портфолио, команда агентов): `docs/kb/projects/ai-experience-report.md` — **наш**.

## Портфолио продуктового дизайнера (этот проект)
Сайт vberestova.com. Сверено: 2026-10-30.
- Прод: https://vberestova.com — **наш**
- Исходники: https://github.com/vberestova95-alt/Portfolio_product_designer, `Portfolio_product_designer` — **наш**
- Публикация (GitHub Pages, папка `/docs`): https://github.com/vberestova95-alt/Portfolio_product_designer_site — **наш**, деплой только после «да»
- Аналитика: дашборд https://vberestova.com/stats (`stats.html`, `api/collect.js`, `api/stats.js` — serverless на Vercel + Upstash Redis, `vercel.json`); Яндекс Метрика, счётчик 110240395 (`index.html`) — **наш**
- Документ «Портфолио — трекер кейсов и задач»: https://claude.ai/artifact/R88WKucQeL5qjJZt324Uqx — **наш**
- Рабочая папка Figma: https://www.figma.com/files/folder/278398524 — **наш**
- Figma «Portfolio · Fluffy Chumb case frames»: https://www.figma.com/design/9ga2w6jOKhMAWknjd54O5U — **наш** (Home EN 1:2, Routine EN 2:136, Home RU 1:202, Routine RU 2:140; приняты 2026-10-30)
- Dribbble: https://dribbble.com/Meoosh — оригиналы шотов архива
- База знаний: `docs/kb/`; команда агентов: `TEAM.md`, `BACKLOG.md`, `FUTURE.md` — **наш**
- Ранние названия репозитория (по памяти агентов и отчёту AI experience): `portfolio-codex2`, `portfolio-codex`, папка `portfolio-next` (сейчас пустая) — история, не править

## Портфолио продакт-менеджера
PM-версия того же сайта. На сайте дизайнера не показывается. Сверено: 2026-10-30.
- Прод (Netlify, временный домен, noindex): https://vberestova-pm.netlify.app — **только читать**
- `Portfolio_product_manager`, https://github.com/vberestova95-alt/Portfolio_product_manager (private) — **только читать**
- CV продакт-менеджера (PDF EN/RU, исходники `src/cv-*.html`): `CV-Product-Manager` — **только читать**
- Figma, документация: —

## Fluffy Chumb (Cat App v2)
Мобильное приложение (iOS + Android). На сайте: кейс Cat App (`/cat-app`, название Fluffy Chumb) и карточка в AI-проектах. Сверено: 2026-10-30.
История для кейса — `docs/kb/projects/fluffy-chumb.md`.
- Сайт (лендинг беты, Netlify, только RU): https://fluffychumb.com/ (= https://fluffy-chumb-beta.netlify.app) — **только читать**
- Сайт бренда: https://fluffy-chumb-brand.netlify.app — **только читать**
- Веб-приложение: https://app.fluffychumb.com — кнопка на лендинге скрыта, пока не заработает — **только читать**
- Веб-MVP (S3): http://my-fluffy-friend-ui.s3-website.ap-south-1.amazonaws.com — **только читать** (из `my-fluffy-friend-frontend/docs/kb`)
- Figma «Fluffy Chumb · App — Final»: https://www.figma.com/design/EoVlDmLhUGV5mSzlsvEMW0/Fluffy-Chumb-%C2%B7-App-%E2%80%94-Final?node-id=77-19 — **только читать**, актуальные экраны (MVP 77:19, «🚀 MVP · RU» 280:6149)
- Figma «Итерация 2» (всё после MVP): https://www.figma.com/design/2CFFlfRSesJ6V7JXsO7AFG — **только читать**
- Figma брендбук «Fluffy Chumb · Brand»: https://www.figma.com/design/3NmW3t5JyTHquSCjXHOccB — **только читать**
- Figma ранние: концепт https://www.figma.com/design/K0AIKQaBXCh4Oj7td2e3zc, «Fluffy pet» v1 https://www.figma.com/design/HUou9sNSeSRftnj8SZC49l, исходный Figma Make https://www.figma.com/design/ZqgzIWXoCkqdEyIEDbeiGf/Pet-Diabetes-Tracker-App — **только читать**
- Figma соцсетей (аватары TG): файл `uEOUmoQksZxSEcFL40m8GP` (из памяти агентов my-fluffy-friend-frontend) — **только читать**
- Документация проекта: https://claude.ai/artifact/4cZEb3knBmGrsi6QaoCzvY#f013bfa1-4f1d (вкладки «Fluffy Chumb — продукт, пользователи, MVP», «Трекеры: логика и референсы», «Ретроспектива процесса», «Команды») — **только читать**
- Артефакты бренда (Claude): «Fluffy Chumb Logo Flow» https://claude.ai/artifact/XwhDTFqQ1LeP53CwA6PY7s, «Fluffy Chumb Logo Motion» https://claude.ai/artifact/2yZzZUrKSXcmzWxf8AoDFo, «fluffy chumb soft cloud» https://claude.ai/artifact/DUsrgL4r1iprHuRyHBPAs9 — **только читать**
- Приложение: `fluffy-chumb-app`, https://github.com/vberestova95-alt/fluffy-chumb-app (`research/`, `BACKLOG.md`, `FUTURE.md`, `DESIGN-REVIEW.md`, `TEAM.md`) — **только читать**
- Веб-фронтенд (веб-MVP, код Valeriy Eisele): `my-fluffy-friend-frontend`, https://github.com/stenvl/my-fluffy-friend-frontend (`docs/kb/`) — **только читать**
- Бэкенд (stenvl, Go + DynamoDB + Cognito): репозиторий `my-fluffy-friend`, на этом Mac нет — адрес не записан
- Лендинг беты: `fluffy-chumb-landing` (не git; заявки — Netlify Forms) — **только читать**
- Бренд: `fluffy-chumb-brand` (+ `fluffy-chumb-brand-backups`) — **только читать**
- Аудит дизайн-системы: Figma https://www.figma.com/design/ftIKBrqW24YYtjtvNTfUjh, `design-system/audit/fluffy.json` — **только читать**

## Pet Injection Tracker
Трекер инъекций инсулина для кота, лендинг-кейс (вынесен из портфолио 2026-10-24). В портфолио — путь `/pet-injection-tracker` (сборка `VITE_CASE_ONLY=true`). Сверено: 2026-10-30.
- Сайт: https://pet-injection-tracker.netlify.app/pet-injection-tracker — **только читать**
- `Pet_injection_tracker`, https://github.com/vberestova95-alt/Pet_injection_tracker — **только читать**
- Figma, документация: —

## CringeDesign — «Дизайн-кринжометр»
Автоматический UX-аудит сайта по URL. На сайте: AI-проект `/design-cringe`. Сверено: 2026-10-30.
- Прод: https://designecringe.com (Tilda Zero Block) → API https://6mr77kfczf.execute-api.ap-south-1.amazonaws.com (AWS Lambda) — **только читать**
- Figma (дизайн и дизайн-система кринжометра): https://www.figma.com/design/kiNvkX2zmgcqxuRWJzhRoV — **только читать**
- `CringeDesign`, https://github.com/vberestova95-alt/CringeDesign (`docs/kb/`) — **только читать**
- Документация (Claude Docs): —

## Design System (хаб аудита)
Общий аудит дизайн-систем проектов. Сверено: 2026-10-30.
- Figma «Design System — аудит проектов»: https://www.figma.com/design/ftIKBrqW24YYtjtvNTfUjh — **только читать**
- `design-system`, https://github.com/vberestova95-alt/design-system (`docs/kb/`, `audit/*.json`) — **только читать**

## Плагины Figma для дизайн-систем
На сайте: AI-проект `/ds-plugins`. Сверено: 2026-10-30.
- DS Changelog: `design-plugin-documentation`, https://github.com/vberestova95-alt/design-plugin-documentation (`docs/kb/`) — **только читать**
- Component Change Tracker (бывший figma-plugin): `design-plugin-task-manager`, https://github.com/vberestova95-alt/design-plugin-task-manager (`docs/kb/`) — **только читать**
- DS Foundation Export: `design-plugin-tokens`, https://github.com/vberestova95-alt/design-plugin-tokens (`docs/kb/`) — **только читать**
- Архив монорепозитория: https://github.com/vberestova95-alt/Plugins (private, archived) — **только читать**
- Figma: страница «Плагины» в аудите https://www.figma.com/design/ftIKBrqW24YYtjtvNTfUjh — **только читать**
- DS Manager утерян (старый ноутбук) — по `design-system/docs/kb/context.md`

## Spotless
Очистка сканов плёнки в браузере (бывший Dustoff). Сверено: 2026-10-30.
- `Spotless`, https://github.com/vberestova95-alt/Spotless (`docs/kb/`) — **только читать**
- Figma (Foundations, Components, Screens, Flows): https://www.figma.com/design/HPQy25M2BmzhznpBC9H5Yh — **только читать** (в URL имя файла «Designe-cringe»)
- Сайт: — (не задеплоен)

## Фотопрогулки на плёнку — Portfolio_photographer
Двуязычный статичный сайт фотосессий на плёнку. Сверено: 2026-10-30.
- `Portfolio_photographer`, https://github.com/vberestova95-alt/Portfolio_photographer (`docs/kb/`) — **только читать**
- Сайт: — (по отчёту AI experience — «есть только в GitHub»); Figma: —

## Task Manager — Telegram Mini App
Собран из макета Figma через Figma MCP (25.03.2026). Сверено: 2026-10-30.
- `task manager`, https://github.com/vberestova95-alt/Task-manager — **только читать**
- Сайт: — (не опубликован); Figma: — (адрес макета в README не указан)

## Без репозитория
Сверено: 2026-10-30.
- AI experience: `AI experience` (отчёт, см. выше) — **только читать**
- Upwork covers: `Upwork-covers` (8 обложек кейсов) + артефакты «Upwork Portfolio Covers» https://claude.ai/artifact/LeNkMfAcfPscEZXfYoFaYC, «Vladislava Berestova — Product Designer · Upwork Profile & Portfolio» https://claude.ai/artifact/JJR2p5vVYj7KNz4RjSU2X4 — **только читать**

## Артефакты Claude без локальной папки
Сверено: 2026-10-30. Все — **только читать**; к какому проекту относятся — открытый вопрос.
- Август 2026, перенос VIP-статуса (вероятно, BetBoom — не проверено): «Перенос VIP-статуса» https://claude.ai/artifact/U3gtHpkvbBSuA7Q85JBY2Z, «Мобильный сценарий переноса» https://claude.ai/artifact/FHNJ4gr2N37HK8XrYFaBCE, «UI переноса статуса» https://claude.ai/artifact/XTzu3KqYn9HeFFmyMT3Udt, «Что поменяли и почему» https://claude.ai/artifact/CjxqzSEDczpJsNhe1Cnc3D, «Двенадцать предложений по флоу» https://claude.ai/artifact/DH3L7zWC9uRdPGBoAj19dk, «Кто что делает» https://claude.ai/artifact/77gTBz4sKpVfemsJ4ApziN, «Окно первой ставки» https://claude.ai/artifact/2sY3estPgcxJLSmW8njqZC
- Август 2026, дизайн-система: «Segment Control — документация, применение, изменения» https://claude.ai/artifact/AboA54nK8ZpwAWWRzJUdt6, «Кнопки: перестройка компонентов» https://claude.ai/artifact/J53qS9vkt3jhTaboGiWW5Z
- «Медкарта питомца» (поделились с пользователем): https://claude.ai/artifact/TmiKK5bCqKQntxCxfteSsG

## Открытые вопросы
- Артефакты августа 2026 (перенос VIP-статуса, «Окно первой ставки», Segment Control, кнопки) — к какому проекту и кейсу относятся (BetBoom?).
- «Медкарта питомца» — чей документ и связан ли с Fluffy Chumb.
- Figma-макеты Task Manager, фотопрогулок, PM-портфолио и Pet Injection Tracker — есть ли.
- Опубликован ли где-то сайт фотопрогулок и Spotless.
- Какие кейсы сайта без отдельной папки (BetBoom, Yandex News, Kokoc, iQuoto, Design concepts) связаны с какими источниками.
- Бэкенд Fluffy Chumb `my-fluffy-friend` — адрес репозитория.
