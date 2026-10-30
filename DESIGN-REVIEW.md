# Сверка дизайна

## 2026-10-30 — СВЕРКА 3: картинки кейса Cat App ↔ Figma «Fluffy Chumb · App — Final»
Источник: fileKey `EoVlDmLhUGV5mSzlsvEMW0`, страница MVP `77:19` (только читать). Сверял design-sync (субагент), в Figma ничего не писал.
Скриншоты сверки лежали во временной папке сессии — могут пропасть, при нужде переснять по node-id.

**Итог:** почти всё совпадает. Устарел один экран — «Build the look» (конструктор, шаг 3 из 4).

### Картинки кейса (`catAppCaseStudy`, `src/data/caseStudies.js`; RU использует те же файлы)

| Файл | Где | Статус |
|---|---|---|
| `src/assets/cases/pet-tracker-v2-cover.webp` | обложка кейса (`hero.image`), также `portfolioData.js:173`, `:259` | Family = 78:11449 ок; Home = archive 289:25865 (визуально актуален); **Build the look устарел** → 78:10975 |
| `src/assets/cases/pet-tracker-v2-screens.webp` | «What Went Into Version Two», лента «Version 2» | Home — archive 289:25865; Choose trackers 78:10323 ок; Trackers 78:10852 ок; **Build the look устарел** → 78:10975; Insulin 78:10538 ок; History 78:11090 ок; Family 78:11449 ок |
| `src/assets/cases/pet-tracker-cover-screens.png` | «Where It Started», лента «MVP» | старый MVP намеренно — не менять |
| `src/assets/cases/cat-app-screens.svg` | импорт в `caseStudies.js:26`, `caseStudies.ru.js:26` | не используется — мёртвый импорт |

**Build the look сейчас (S6·10, 78:10975):** другой порядок форм (выбрана 3-я во 2-м ряду), формы без белых подложек,
порядок меха pink, blue, peach (выбран), mint, beige, grey, white; убрана подсказка «Insulin, Glucose and Mood keep their own looks.».
Есть страница «R2·65 Look · варианты» (342:5658) — экран, похоже, ещё дорабатывают.

**Home:** в MVP нет базового кадра с фото + трекерами + рутиной сразу; есть состояния 306:6127 (без фото), 306:6002 (ничего не запланировано),
78:10502 (тост «Dose logged»). Кадр из archive взят сознательно (коммит 0b90da0).

### Чего нет в кейсе, но полезно (Final)
- Sign in — 78:10258: «Pet Health Companion…» — новое позиционирование.
- Rhythm and reminders — 78:11030 (S6·11): ритм, время «reminder for the family», Pin to Home, «Remind me — on this phone». Есть и на fluffychumb.com.
- Not now — 285:6129, 285:6252 (R2·47): «Remind me later» и Skip с причинами + заметка для семьи — иллюстрирует инсайт про няню.
- Log insulin · Done & skipped — 162:3957 (метки «by Max»); варианты 78:10551, 162:4058.
- Pick a mood — 78:10816, 227:13202; Vitamins yes/no — 78:10682; Walks (custom) — 78:10788.
- Invite by email — 78:11479; Invitation 78:11548; Accepted 78:11566.
- Export — 78:11414, 78:11434 («Export for the vet»); Choose trackers · Custom added — 227:13725.

### Ответы пользователя, 2026-10-30
- **Актуальное — только страница 77:19 файла Final** (https://www.figma.com/design/EoVlDmLhUGV5mSzlsvEMW0/Fluffy-Chumb-%C2%B7-App-%E2%80%94-Final?node-id=77-19). Значит: Home из archive 289:25865 заменить кадром со страницы 77:19; Build the look → 78:10975; кадры из других страниц и файлов не брать.
- **Русская версия кейса — русские кадры.** Источник русских кадров уточнить: на 77:19 их может не быть (design-sync видел отдельную страницу «MVP · RU» 280:6149) — если на 77:19 нет, спросить пользователя, можно ли брать с 280:6149.

### Открытые вопросы — решает пользователь (1, 2, 4 закрыты ответами выше)
1. Переснять Build the look с 78:10975 (обложка + лента v2) — или ждать, пока доработают R2·65?
2. Оставить Home из archive 289:25865?
3. Добавлять ли в ленту v2 Not now (285:6252) и Rhythm (78:11030)?
4. RU-кейс показывает английские кадры; в Final есть «MVP · RU» (280:6149), fluffychumb.com на русском. Делать RU-кадры?
5. Текст, не картинки: в «Shared care» сказано «invite … as Owner or Can edit», а подпись к S8·02 в Final — «Без Can edit / Can view; письмо не уходит». Похоже, выбора роли при приглашении в MVP нет — сверить с пунктом 2 (docs-keeper).
