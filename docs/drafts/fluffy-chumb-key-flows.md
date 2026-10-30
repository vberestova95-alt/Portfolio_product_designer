# Fluffy Chumb — блок «Ключевые сценарии» (Key flows), EN + RU

Автор: editor (BACKLOG п. 14в). Те же тексты — в документе проекта: Fluffy Chumb → «4 · Ключевые сценарии».
Факты — `research/fluffy-chumb-scenarios.md`, разделы 1 и 4, с поправкой на записанные видео.
Секция по `case-guide`: `scenarios` / Key flows.

Для developer:
- На каждый сценарий — пара клипов A и B (`phonePair` с `type: 'video'`, у каждого клипа `label` или `alt`).
- Подпись к клипу — строка «Клип A / B».
- Пункт «следующий шаг» — последняя строка текста сценария.
- Интервью подтвердили только часть про диабет. Формулировок «пользователи сказали» здесь нет и добавлять их не нужно.

Вступление:
- RU: Два сценария из MVP, по два коротких клипа на каждый. Интервью подтвердили только часть про диабет; семья и приглашение — гипотезы. Что после MVP, помечено «следующий шаг».
- EN: Two flows from the MVP, two short clips each. Interviews confirmed only the diabetes part; the household and invitation flows are hypotheses. Anything after the MVP is marked “next step”.

---

## Сценарий 1 / Flow 1

| | RU | EN |
|---|---|---|
| Заголовок | Утренняя доза: кто уже сделал укол | Morning dose: who already gave the shot |
| Проблема | Утром за котом с диабетом смотрят двое. Легко сделать укол дважды или решить, что его сделал другой. | Two people look after a diabetic cat in the morning. It's easy to inject twice, or for each to think the other one did it. |
| Решение | Доза отмечается на карте уколов и проверяется перед сохранением. В делах на сегодня у задачи появляется подпись «кто и когда» — её видит вся семья. | The dose is marked on the injection map and checked before saving. Today's routine then shows who did it and when, for the whole household. |
| Клип A | Anna ставит точку на карте, проверяет дозу в «Проверьте дозу» и сохраняет — «Сделано · Anna · 08:00». | Anna marks the spot on the map, checks the dose and saves — “Done by Anna · 08:00”. |
| Клип B | Max открывает приложение и видит, что доза уже сделана: «Сделано · Anna · 08:00». | Max opens the app and sees the dose is already done: “Done by Anna · 08:00”. |
| Следующий шаг | Предупреждение, если ту же дозу пытаются отметить второй раз. | A warning when someone tries to log the same dose twice. |

## Сценарий 2 / Flow 2 (сценарий 4 в research)

| | RU | EN |
|---|---|---|
| Заголовок | Приглашение в семью | Inviting someone into the household |
| Проблема | Инструкции по уходу разбросаны по чатам и запискам. У второго человека нет доступа к данным питомца. | Care instructions are scattered across chats and notes. The second person has no access to the pet's data. |
| Решение | Владелец приглашает человека по email; тот принимает приглашение после входа и видит ту же рутину и историю. Роль не выбирается: приглашённый может вносить изменения, а доступ можно убрать в любой момент. | The owner invites someone by email; they accept after signing in and see the same routine and history. There is no role to pick: the invitee gets Can edit, and access can be removed at any time. |
| Клип A | Anna приглашает max@example.com заботиться о Meow. | Anna invites max@example.com to care for Meow. |
| Клип B | Max принимает приглашение — Meow появляется в списке «Ваши питомцы» с пометкой «Доступ от другого владельца». | Max accepts — Meow appears in “Your pets”, marked “Shared with you”. |
| Следующий шаг | Временный доступ для пет-ситтера на даты поездки. | Temporary access for a pet sitter, limited to the trip dates. |

---

## Заметки для переноса в код

- **Имена кота разные.** В сценарии 2 кот зовётся Meow, а в остальном кейсе и в моке сценария 1 — Lutik. Подписи повторяют то, что в видео; уточнить у пользователя, не смущает ли разница.
- **Роли.** На сайте в блоке Version 2 сейчас «invite … as Owner or Can edit». Это расходится с текстом выше («роль не выбирается»). Вопрос открыт в документе проекта; при переносе блока стоит поправить и ту строку, но только по задаче.
- **RU-подписи** сверены с RU-скриншотами `fluffy-chumb-app/e2e/out/portfolio/sc*-ru-*.png`: «Проверьте дозу», «Сделано · Anna · 08:00», «Ваши питомцы», «Доступ от другого владельца», «Доступ можно убрать в любой момент». RU-клипы: `sc1-A-ru`, `sc1-B-ru`, `sc4-A-ru`, `sc4-B-ru` (.mp4 / .webm).
