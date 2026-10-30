# Кейс «Сайт портфолио — как выстроена работа» — черновик

Автор: editor (BACKLOG п. 13). Каркас — навык `case-guide` (8 секций). Факты — только из
`research/portfolio-site-case-facts.md` (дальше [F], с номером раздела) и файлов, на которые он ссылается.
Статус: черновик для пользователя. Публиковать ли кейс, решает пользователь.

Пометки в тексте:
- `[цитата — ждёт согласия]` — слова пользователя из журналов сессий. Без «да» в итоговый текст не идут.
- `[? …]` — факта нет; вопрос продублирован в конце файла.
- Данных «после» меньше суток: один рабочий отрезок (48 мин) и один деплой. Это сказано в тексте прямо.

Даты — по системным часам и git (2026-10-30). В бэклоге та же работа подписана 31.10 [F, оговорка про даты].
`[? какая дата верная]`

---

## RU

### 0. Хиро

**Заголовок:** Портфолио, которое собирает команда агентов

**Подзаголовок:** Сайт я делала в одной сессии с AI: просила — получала — сама находила ошибки на проде. Я собрала
команду из 8 ролей с правилами, бэклогом и базой знаний. Первые результаты есть, но данных пока меньше суток.

**Мета:** Сайт портфолио / Процесс и инструменты · 2026-10

**Цифры** (все с источником):
- 8 ролей агентов, общих для всех проектов [F1]
- 4 исполнителя параллельно за 48 минут [F3]
- 25 мин от просьбы до деплоя в первой задаче команды — одна задача, не среднее [F3]

**Инструменты:** Claude Code (агенты, навыки), Claude Docs, Figma, React 18 + Vite 5, GitHub Pages [F1]

**Роль · команда · срок:** `[? моя роль формулировкой пользователя]` · 8 ролей агентов + я как заказчик и единственная, кто говорит «да» ·
роли созданы 2026-10-29, первая задача оркестратору — 2026-10-30 01:53 [F1, F3]

### 1. Проблема

До команды сайт делался в одной сессии без ролей. Ошибки находила я, и уже на проде.

- **Неактуальные макеты на проде.** Кейс Cat App выкатили 3 раза за 26 минут. Две повторные выкладки были после моих жалоб:
  `[цитата — ждёт согласия: «Ты что-то не то собрал, это не актуальная уже давно версия»]`,
  `[цитата — ждёт согласия: «тут опять не актуальные макеты»]`. Сверки макетов перед деплоем не было [F3].
- **Факты в кейсе не сверялись с источником.** «12 beta testers», «2 user groups» и «у задачи есть исполнитель» не подтвердились, когда
  их наконец сверили [F2].
- **База знаний отставала.** Саммари сессии 27.10 закоммичено через 3 дня [F3, F5].

### 2. Контекст

- **Сайт:** vberestova.com, React 18 + Vite 5, тексты EN и RU. Деплой: `npm run build` → `dist/` → репозиторий публикации → GitHub Pages [F1].
- **Кейсы собираются из других проектов.** Например, Fluffy Chumb: у него своя команда и свой оркестратор, портфолио его источники только читает [F2].
- **Ограничения:**
  - коммит, пуш, деплой и публикация документов — только после моего «да»;
  - что публикуется на сайте, решаю только я [F1, «Правила»].
- **Что делала я:** `[? что делала пользователь сама — постановка ролей, правила, решения по кейсам; формулировка за пользователем]`.
  Просьба «команда для всех проектов» — 2026-10-29 00:45 `[цитата — ждёт согласия: «сделаем эту команду для всех проектов»]` [F1].

### 3. Исследование: что мешало и что проверяли

У этого кейса нет интервью. Исследование — разбор собственной работы по git, коммитам сайта публикации и журналам сессий [F, источники].

**Что увидели до команды** (13.10 — 30.10 00:26):

| Показатель | До | Источник |
|---|---|---|
| Коммиты исходников | 26 за 8 активных дней | [F3], `git log` |
| Деплои | 16 | [F3], коммиты репозитория публикации |
| От коммита до деплоя | 2 с – 7,5 мин у 15 из 15 деплоев — коммиты делаются пачкой в конце, так что эта мера не показывает работу | [F3] |
| От просьбы до деплоя | 3 ч 08 мин, 59 мин, 34 мин (+2 повторных деплоя) | [F3], журналы сессий |

**Гипотеза до:** если раздать работу ролям с зонами файлов и сверкой до деплоя, повторных выкладок станет меньше, а задачи пойдут параллельно.
**Статус:** гипотеза. Данных «после» — один отрезок 01:53–02:41 и один деплой [F3].

### 4. Ключевые сценарии

1. **От просьбы до деплоя через оркестратора** (п. 8, кадры Fluffy Chumb):
   - 02:12:59 — просьба;
   - 02:15 — запущен developer;
   - 02:20 — запущен designer;
   - 02:36:55 — моё «да» на деплой;
   - 02:37:51 — деплой, через 56 с после «да» [F3].
2. **Сверка до сборки.** design-sync сверяет кадры с макетами проекта-источника раньше, чем developer собирает картинки [F4].
3. **Сверка фактов кейса.** docs-keeper сверяет текст кейса с источниками Fluffy Chumb. Найденное уходит мне на решение, а не на сайт [F2, F4].
4. **Пауза и продолжение по бэклогу.** Пауза на ночь записана в `BACKLOG.md` («Завтра начать с…»), утром работа продолжилась по этой записи [F4].

`[? картинка: схема ролей и сообщений ЗАДАЧА / ГОТОВО / СВЕРКА / ЗАПРОС / ЗНАНИЯ — SVG, рисует designer]`

### 5. Решения: что сделали и почему

| Что мешало | Что сделали | Статус |
|---|---|---|
| Неактуальные макеты находила я на проде | Роль design-sync. Сверка с макетом — до сборки кадров. Она нашла 1 устаревший экран и Home из архива до сборки [F4] | подтверждено одним случаем |
| Факты в кейсе без источника | docs-keeper и researcher дают факты с источником, гипотезы помечены. В тексте Fluffy Chumb нашли 2 неверных и 7 неточных мест до правки кейса [F4] | подтверждено одним случаем |
| Всё в одной сессии, задачи по очереди | Оркестратор раздаёт задачи субагентам по ролям. Зоны файлов не пересекаются, общие файлы — у одного исполнителя [F1] | 4 исполнителя за 48 мин, 3 пункта закрыто [F3] |
| Ручная сборка кадров EN и RU | `scripts/build-case-frames.mjs`: EN и RU — одной командой с `--lang`, замена экрана = замена node-id [F4] | сделано |
| Чужие проекты можно случайно поправить | Правило «только читать», реестр ссылок `docs/kb/projects.md` с пометками «наш / только читать» [F2] | сделано; запросов к чужой команде ещё не было [F2] |
| Знания терялись между сессиями | `docs/kb/`: 12 решений с «почему» и источниками, саммари сессий [F1, F4] | сделано; база всё ещё отстаёт [F5] |
| Роль нужна в нескольких проектах | Роли общие (`~/.claude/agents/`), подключаются навыком `team-init`. tester появился в Fluffy Chumb и в тот же день в портфолио [F2] | сделано |

### 6. Результат

**Честно: данных «после» меньше суток.** Один рабочий отрезок (48 мин) и один деплой [F3].

- Первая задача команды: 25 мин от просьбы до деплоя, ноль повторных выкладок [F3].
- Сравнить с «до» напрямую нельзя:
  - в п. 8 был больший объём: EN + RU, новый скрипт, новый макет;
  - сверку сделали заранее [F3].
- За 48 мин: 4 субагента, закрыто 3 пункта бэклога [F3].
- Коммитов и деплоев в день «после» — 2 и 1. По дням сравнить нельзя [F3].

**Что ещё мешает** [F5]:
- RU-версию нельзя открыть в браузере (`RU_ENABLED = false`).
- В «Проверить пользователю» копятся 6 пунктов.
- tester до первого деплоя не запускался.
- Даты в бэклоге разъехались с часами.
- Пауза и запуск приходят через вторую сессию.

**Что смотрим дальше, 1–2 недели** [F, «Чего не хватает»]:
- деплоев в неделю;
- доля повторных деплоев после жалобы;
- время «просьба → деплой»;
- время «в работе / готово» в `BACKLOG.md`.

### 7. Чему научилась

`[? выводы — своими словами пользователя; editor не пишет за неё. Кандидаты из фактов: сверка до деплоя дешевле, чем исправление на проде;
коммит — плохая мера работы, нужна мера «просьба → деплой»]`

---

## EN

*Перевод черновика RU. По `case-guide` перевод идёт после согласования основного языка: если RU поменяется, EN обновлю вслед.*

### 0. Hero

**Title:** A portfolio built by a team of agents

**Subtitle:** I used to build the site in a single AI session: ask, get a result, then find the bugs in production myself.
I set up a team of 8 roles with rules, a backlog and a knowledge base. There are first results, but less than a day of data.

**Meta:** Portfolio site / Process and tooling · 2026-10

**Stats:**
- 8 agent roles shared across all projects
- 4 executors in parallel within 48 minutes
- 25 min from request to deploy on the team's first task — one task, not an average

**Tools:** Claude Code (agents, skills), Claude Docs, Figma, React 18 + Vite 5, GitHub Pages

**Role · team · timeline:** `[? my role, in the user's words]` · 8 agent roles + me as the client and the only one who says “yes” ·
roles created 2026-10-29, first task to the orchestrator 2026-10-30 01:53

### 1. Problem

Before the team, the site was built in one session with no roles. I found the mistakes myself, already in production.

- **Outdated mockups in production.** The Cat App case was deployed 3 times in 26 minutes. Two redeploys followed my complaints
  `[quote — awaiting consent ×2]`. Nobody checked the mockups before deploying.
- **Case facts were not checked against the source.** “12 beta testers”, “2 user groups” and “every task has an assignee” failed once checked.
- **The knowledge base lagged behind.** The 27.10 session summary was committed 3 days later.

### 2. Context

- **The site:** vberestova.com, React 18 + Vite 5, EN and RU. Deploy: `npm run build` → `dist/` → publishing repo → GitHub Pages.
- **Cases come from other projects.** Fluffy Chumb, for example, has its own team and orchestrator; the portfolio only reads its sources.
- **Constraints:** commit, push, deploy and publishing documents only after my “yes”; only I decide what goes on the site.
- **What I did:** `[? in the user's words]`. The ask “a team for every project” — 2026-10-29 00:45 `[quote — awaiting consent]`.

### 3. Research: what got in the way

No interviews here: the research is a review of my own work through git, publishing-repo commits and session logs.

| Measure | Before | Note |
|---|---|---|
| Source commits | 26 over 8 active days | |
| Deploys | 16 | |
| Commit to deploy | 2 s – 7.5 min for 15 of 15 deploys | commits land in a batch at the end, so this does not measure the work |
| Request to deploy | 3 h 08 min, 59 min, 34 min (+2 redeploys) | from session logs |

**Hypothesis:** roles with separate file zones and a check before deploy mean fewer redeploys and work in parallel.
**Status:** hypothesis. “After” data is one stretch, 01:53–02:41, and one deploy.

### 4. Key flows

1. **Request to deploy through the orchestrator** (frames for Fluffy Chumb):
   - 02:12:59 — request;
   - 02:15 — developer started;
   - 02:20 — designer started;
   - 02:36:55 — my “yes”;
   - 02:37:51 — deploy, 56 s after the “yes”.
2. **Check before build.** design-sync compares frames with the source project's mockups before developer builds the images.
3. **Fact check.** docs-keeper checks the case text against the source project; findings come to me, not to the site.
4. **Pause and resume through the backlog.** The overnight pause is written in `BACKLOG.md`; work resumed from that note.

### 5. Decisions

| What got in the way | What changed | Status |
|---|---|---|
| I found outdated mockups in production | design-sync role checks against the mockup before frames are built; it caught 1 outdated screen and an archived Home | confirmed once |
| Case facts had no source | docs-keeper and researcher supply facts with sources and mark hypotheses; 2 wrong and 7 inaccurate spots found before the case was edited | confirmed once |
| One session, tasks one after another | The orchestrator assigns tasks to role subagents; file zones don't overlap, shared files have one owner | 4 executors in 48 min, 3 items closed |
| Building EN and RU frames by hand | `build-case-frames.mjs`: EN and RU from one command with `--lang`; swapping a screen = swapping a node-id | done |
| Other projects could be edited by accident | A “read only” rule and a link registry marked “ours / read only” | done; no request to another team yet |
| Knowledge got lost between sessions | `docs/kb/`: 12 decisions with the “why” and sources, session summaries | done; still lags behind |
| A role is needed in several projects | Shared roles connected with `team-init`; tester appeared in Fluffy Chumb and the portfolio the same day | done |

### 6. Result

**Honestly: less than a day of “after” data.** One stretch of work (48 min) and one deploy.

- The team's first task: 25 min from request to deploy, no redeploys. It can't be compared directly with “before”:
  it was bigger (EN + RU, a new script, a new mockup) and the check was done in advance.
- In 48 min: 4 subagents, 3 backlog items closed.
- Still in the way:
  - the RU version can't be opened in the browser;
  - 6 items wait for a manual check;
  - tester did not run before the first deploy;
  - backlog dates drifted from the clock.
- Next 1–2 weeks:
  - deploys per week;
  - share of redeploys after a complaint;
  - request-to-deploy time.

### 7. What I learned

`[? in the user's own words]`

---

## Цитаты на согласие

1. «Ты что-то не то собрал, это не актуальная уже давно версия» — 2026-10-30 00:14:26, журнал 5cb56bea; секция 1.
2. «тут опять не актуальные макеты» — 2026-10-30 00:23:19, журнал 5cb56bea; секция 1.
3. «сделаем эту команду для всех проектов» — 2026-10-29 00:45, журнал 413d3849; секция 2.

## Открытые вопросы

1. Какая дата верная — 30 или 31 октября? В бэклоге «31.10», часы и git — 30.10.
2. Согласна ли пользователь на цитаты 1–3? Без согласия они уходят из текста, факт повторных деплоев остаётся.
3. Граница «до / после» — 2026-10-30 01:53 (первая задача оркестратору). Три деплоя Cat App в 00:00–00:26 считаем «до»?
4. Роль и «что делала я» — формулировка пользователя.
5. Выводы (секция 7) — словами пользователя.
6. Картинки: схема ролей и сообщений (SVG), лента сценария «просьба → деплой». Нужен ли скриншот бэклога или документа?
7. Публиковать ли кейс и где: основные кейсы или AI-проекты?
