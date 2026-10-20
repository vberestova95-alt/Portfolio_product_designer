/*
 * The /stats dashboard. Two feeds from api/stats.js:
 *   - the live poll every LIVE_MS while the tab is visible (who is here now,
 *     the latest events, today's numbers);
 *   - the period report on load, on a range change and every REPORT_MS.
 *
 * The password is kept in this browser's localStorage. Opening the dashboard
 * also marks this browser as "don't count me" for the site's own tracker.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarList,
  ColumnChart,
  Funnel,
  Heatmap,
  Legend,
  Meter,
  Sparkline,
  TooltipProvider,
} from './charts.jsx';
import { demoLive, demoReport } from './demo.js';
import {
  ago,
  areaName,
  contactName,
  countryName,
  dayLabel,
  decimal,
  deviceName,
  duration,
  fileName,
  flag,
  number,
  pageName,
  percent,
  projectName,
  weekdayIndex,
} from './format.js';

const LIVE_MS = 5000;
const REPORT_MS = 60000;
const KEY_STORAGE = 'vb_stats_key';
const OPT_OUT_KEY = 'vb_notrack';
const DEMO =
  import.meta.env.DEV || new URLSearchParams(window.location.search).has('demo');

const RANGES = [
  { days: 1, label: 'Сегодня' },
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '90 дней' },
];

const VISITOR_SERIES = [
  { key: 'newVisitors', label: 'Новые', color: '--s1' },
  { key: 'returningVisitors', label: 'Вернувшиеся', color: '--s2' },
];

const HOUR_SERIES = [{ key: 'pageviews', label: 'Просмотры', color: '--s1' }];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the dashboard still works, it just asks again next time.
  }
}

async function request(query, key) {
  const response = await fetch(`/api/stats?${query}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.code = body.error;
    throw error;
  }

  return response.json();
}

function useVisible() {
  const [visible, setVisible] = useState(document.visibilityState === 'visible');

  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return visible;
}

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(timer);
  }, [interval]);

  return now;
}

/* ---------- login ---------- */

function Login({ onSubmit, error, busy }) {
  const [value, setValue] = useState('');

  return (
    <main className="login">
      <form
        className="card login__card"
        onSubmit={(event) => {
          event.preventDefault();
          if (value) onSubmit(value);
        }}
      >
        <span className="brand">v.b.</span>
        <h1>Аналитика сайта</h1>
        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus
          />
        </label>
        {error ? <p className="login__error">{error}</p> : null}
        <button type="submit" className="button" disabled={busy || !value}>
          {busy ? 'Проверяю…' : 'Войти'}
        </button>
      </form>
    </main>
  );
}

function NotConfigured() {
  return (
    <main className="login">
      <div className="card login__card">
        <span className="brand">v.b.</span>
        <h1>Аналитика ещё не подключена</h1>
        <p className="muted">
          В настройках проекта на Vercel нужны переменные окружения: база Upstash Redis
          (<code>KV_REST_API_URL</code>, <code>KV_REST_API_TOKEN</code>) и пароль
          дашборда <code>STATS_PASSWORD</code>. После добавления — передеплой.
        </p>
      </div>
    </main>
  );
}

/* ---------- pieces ---------- */

function Delta({ current, previous, upIsGood = true, format = 'percent' }) {
  if (!previous) {
    return <span className="delta delta--flat">нет данных за прошлый период</span>;
  }

  const change = format === 'points' ? current - previous : (current - previous) / previous;
  const flat = Math.abs(change) < 0.005;
  const good = flat ? null : change > 0 === upIsGood;
  const arrow = flat ? '→' : change > 0 ? '↑' : '↓';
  const text =
    format === 'points'
      ? `${change > 0 ? '+' : ''}${decimal(change * 100, 1)} п.п.`
      : `${change > 0 ? '+' : ''}${Math.round(change * 100)}%`;

  return (
    <span className={`delta ${flat ? 'delta--flat' : good ? 'delta--good' : 'delta--bad'}`}>
      <span aria-hidden="true">{arrow}</span> {text}
      <span className="delta__vs"> к прошлому периоду</span>
    </span>
  );
}

function Tile({ label, value, hint, delta, trend, hero = false }) {
  return (
    <div className={`card tile${hero ? ' tile--hero' : ''}`}>
      <span className="tile__label">{label}</span>
      <span className="tile__value">{value}</span>
      {delta}
      {hint ? <span className="tile__hint">{hint}</span> : null}
      {trend ? <Sparkline values={trend} /> : null}
    </div>
  );
}

function Card({ title, subtitle, children, className = '', aside }) {
  return (
    <section className={`card panel ${className}`}>
      <header className="panel__head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="panel__sub">{subtitle}</p> : null}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

const feedText = (event) => {
  switch (event.type) {
    case 'pageview':
      return {
        icon: '👀',
        text: `Просмотр · ${pageName(event.path)}`,
        sub: event.referrer ? `переход с ${event.referrer.split('/')[0].replace(/^www\./, '')}` : '',
      };
    case 'contact_menu_open':
      return { icon: '💬', text: 'Открыто меню «Связаться»', sub: pageName(event.path) };
    case 'click':
      if (event.kind === 'project')
        return { icon: '🗂', text: `Клик по проекту · ${projectName(event.id)}`, sub: `${pageName(event.path)}, ${areaName(event.area)}` };
      if (event.kind === 'contact')
        return { icon: '✉️', text: `Контакт · ${contactName(event.id)}`, sub: pageName(event.path), strong: true };
      if (event.kind === 'download')
        return { icon: '📄', text: `Скачивание · ${fileName(event.id)}`, sub: pageName(event.path), strong: true };
      if (event.kind === 'social')
        return { icon: '🔗', text: `Соцсеть · ${contactName(event.id)}`, sub: pageName(event.path) };
      if (event.kind === 'nav')
        return { icon: '↪️', text: `Переход · ${pageName(event.id)}`, sub: pageName(event.path) };
      return { icon: '↗️', text: `Внешняя ссылка · ${event.id}`, sub: pageName(event.path) };
    default:
      return { icon: '•', text: event.type, sub: '' };
  }
};

const deviceIcon = (device) => (device === 'mobile' ? '📱' : device === 'tablet' ? '📲' : '💻');

function LivePanel({ live, now }) {
  const active = live?.active || [];

  return (
    <div className="live">
      <section className="card panel live__now">
        <header className="panel__head">
          <div>
            <h2>
              <span className="pulse" aria-hidden="true" /> Сейчас на сайте
            </h2>
            <p className="panel__sub">Вкладка открыта и активна за последние 45 секунд</p>
          </div>
        </header>
        <div className="live__count">{number(active.length)}</div>
        {active.length ? (
          <ul className="sessions">
            {active.map((session) => (
              <li key={`${session.vid}-${session.since}`} className="sessions__row">
                <span className="sessions__icon" aria-hidden="true">{deviceIcon(session.device)}</span>
                <span className="sessions__main">
                  <strong>{pageName(session.path)}</strong>
                  <span className="muted">
                    {flag(session.country)} {session.city || countryName(session.country)} ·{' '}
                    {session.os}, {session.browser} · {session.source}
                  </span>
                </span>
                <span className="sessions__time">{duration(now - session.since)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Никого. Лента справа покажет, когда кто-то зайдёт.</p>
        )}
        {live?.today ? (
          <dl className="live__today">
            <div><dt>Посетителей сегодня</dt><dd>{number(live.today.visitors)}</dd></div>
            <div><dt>Просмотров</dt><dd>{number(live.today.pageviews)}</dd></div>
            <div><dt>Контактов</dt><dd>{number(live.today.conversions)}</dd></div>
          </dl>
        ) : null}
      </section>

      <section className="card panel live__feed">
        <header className="panel__head">
          <div>
            <h2>Лента событий</h2>
            <p className="panel__sub">Последние действия на сайте, новые сверху</p>
          </div>
        </header>
        {live?.feed?.length ? (
          <ol className="feed">
            {live.feed.map((event, index) => {
              const item = feedText(event);
              return (
                <li key={`${event.ts}-${index}`} className={`feed__row${item.strong ? ' feed__row--strong' : ''}`}>
                  <span className="feed__icon" aria-hidden="true">{item.icon}</span>
                  <span className="feed__main">
                    <span>{item.text}</span>
                    <span className="muted">
                      {[item.sub, `${flag(event.country)} ${deviceName(event.device || '')}`, event.source]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <time className="feed__time">{ago(event.ts, now)}</time>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="empty">Событий пока нет</p>
        )}
      </section>
    </div>
  );
}

function DepthTable({ breakdowns }) {
  const byPath = (name) => Object.fromEntries((breakdowns[name] || []).map((row) => [row.key, row.value]));
  const time = byPath('time');
  const scrollSum = byPath('scrollSum');
  const reach75 = byPath('scroll75');
  const reach100 = byPath('scroll100');

  const rows = (breakdowns.pages || [])
    .filter((row) => row.value > 0)
    .map((row) => ({
      path: row.key,
      views: row.value,
      avgTime: (time[row.key] || 0) / row.value,
      avgScroll: Math.min(1, (scrollSum[row.key] || 0) / row.value / 100),
      reach75: Math.min(1, (reach75[row.key] || 0) / row.value),
      reach100: Math.min(1, (reach100[row.key] || 0) / row.value),
    }));

  if (!rows.length) return <p className="empty">Пока нет данных</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Страница</th>
            <th className="num">Просмотры</th>
            <th className="num">Время</th>
            <th>Средний скролл</th>
            <th className="num">До 75%</th>
            <th className="num">До конца</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.path}>
              <td>{pageName(row.path)}</td>
              <td className="num">{number(row.views)}</td>
              <td className="num">{duration(row.avgTime)}</td>
              <td>
                <span className="meter-cell">
                  <Meter value={row.avgScroll} />
                  <span className="num">{percent(row.avgScroll)}</span>
                </span>
              </td>
              <td className="num">{percent(row.reach75)}</td>
              <td className="num">{percent(row.reach100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- report ---------- */

function Report({ report }) {
  const { totals, previous, daily, breakdowns: b, funnel } = report;
  const isToday = report.range.days === 1;
  const trend = (key) => (daily.length > 1 ? daily.map((row) => row[key]) : null);

  const projectRows = (b.click_project || []).map((row) => {
    const areas = (b.projectArea || [])
      .filter((item) => item.key.startsWith(`${row.key}|`))
      .map((item) => ({ label: areaName(item.key.split('|')[1]), value: number(item.value) }));
    return { key: row.key, label: projectName(row.key), value: row.value, unit: 'кликов', extra: areas };
  });

  const areaTotals = {};
  for (const item of b.projectArea || []) {
    const area = item.key.split('|')[1];
    areaTotals[area] = (areaTotals[area] || 0) + item.value;
  }
  const areaRows = Object.entries(areaTotals)
    .sort((x, y) => y[1] - x[1])
    .map(([area, value]) => ({ key: area, label: areaName(area), value, unit: 'кликов' }));

  const contactRows = [
    ...(b.click_contact || []).map((row) => ({ key: `c-${row.key}`, label: contactName(row.key), value: row.value, unit: 'кликов' })),
    ...(b.click_download || []).map((row) => ({ key: `d-${row.key}`, label: fileName(row.key), value: row.value, unit: 'скачиваний' })),
  ].sort((x, y) => y.value - x.value);

  const heat = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const row of daily) {
      const weekday = weekdayIndex(row.day);
      row.hours.forEach((value, hour) => {
        grid[weekday][hour] += value;
      });
    }
    return grid;
  }, [daily]);

  const hourly = report.hours.map((pageviews, hour) => ({ pageviews, title: `${hour}:00–${hour + 1}:00` }));
  const conversionRate = totals.visitors ? funnel.contacted / totals.visitors : 0;
  const previousRate = previous.visitors ? previous.conversions / previous.visitors : 0;
  const ranked = (rows, name = (key) => key, unit = 'сессий') =>
    (rows || []).map((row) => ({ key: row.key, label: name(row.key), value: row.value, unit }));

  return (
    <>
      <div className="tiles">
        <Tile
          hero
          label="Уникальные посетители"
          value={number(totals.visitors)}
          delta={<Delta current={totals.visitors} previous={previous.visitors} />}
          hint={`Всего за всё время: ${number(totals.allTimeVisitors)}`}
          trend={trend('visitors')}
        />
        <Tile
          label="Новые"
          value={number(totals.newVisitors)}
          delta={<Delta current={totals.newVisitors} previous={previous.newVisitors} />}
          trend={trend('newVisitors')}
        />
        <Tile
          label="Вернувшиеся"
          value={number(totals.returningVisitors)}
          delta={<Delta current={totals.returningVisitors} previous={previous.returningVisitors} />}
          hint="Пришли не в первый раз"
          trend={trend('returningVisitors')}
        />
        <Tile
          label="Просмотры"
          value={number(totals.pageviews)}
          delta={<Delta current={totals.pageviews} previous={previous.pageviews} />}
          hint={`${number(totals.sessions)} сессий`}
          trend={trend('pageviews')}
        />
        <Tile
          label="Глубина просмотра"
          value={decimal(totals.pagesPerSession)}
          delta={<Delta current={totals.pagesPerSession} previous={previous.pagesPerSession} />}
          hint="Страниц за сессию"
        />
        <Tile
          label="Время на странице"
          value={duration(totals.avgEngagedMs)}
          delta={<Delta current={totals.avgEngagedMs} previous={previous.avgEngagedMs} />}
          hint={`За сессию: ${duration(totals.avgSessionMs)}`}
        />
        <Tile
          label="Отказы"
          value={percent(totals.bounceRate)}
          delta={<Delta current={totals.bounceRate} previous={previous.bounceRate} upIsGood={false} format="points" />}
          hint="Сессии с одной страницей"
        />
        <Tile
          label="Конверсия в контакт"
          value={percent(conversionRate, 1)}
          delta={<Delta current={conversionRate} previous={previousRate} format="points" />}
          hint={`${number(totals.conversions)} кликов по контактам и CV`}
          trend={trend('conversions')}
        />
      </div>

      <Card
        title={isToday ? 'Просмотры по часам' : 'Посетители по дням'}
        subtitle={isToday ? 'Сегодня, по времени сайта' : 'Новые и вернувшиеся за каждый день'}
        aside={isToday ? null : <Legend series={VISITOR_SERIES} />}
        className="span-2"
      >
        {isToday ? (
          <ColumnChart
            data={hourly}
            series={HOUR_SERIES}
            label={(_, hour) => String(hour)}
            ariaLabel="Просмотры по часам за сегодня"
          />
        ) : (
          <ColumnChart
            data={daily}
            series={VISITOR_SERIES}
            label={(row) => dayLabel(row.day)}
            ariaLabel="Новые и вернувшиеся посетители по дням"
          />
        )}
      </Card>

      <div className="grid-2">
        <Card title="Воронка" subtitle="От захода на сайт до контакта, уникальные посетители">
          <Funnel
            stages={[
              { label: 'Зашли на сайт', value: funnel.visitors },
              { label: 'Открыли кейс', value: funnel.viewedCase },
              { label: 'Открыли «Связаться»', value: funnel.openedContact },
              { label: 'Написали или скачали CV', value: funnel.contacted },
            ]}
          />
        </Card>
        <Card title="Контакты и CV" subtitle={`Меню «Связаться» открывали ${number(totals.contactMenuOpen)} раз`}>
          <BarList rows={contactRows} empty="Пока никто не кликал по контактам" />
          <h3 className="panel__h3">Откуда приходят те, кто пишет</h3>
          <BarList rows={ranked(b.conversionSource, undefined, 'контактов')} empty="Пока нет данных" />
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Самые кликаемые проекты" subtitle="Клики по карточкам и ссылкам на кейсы">
          <BarList rows={projectRows} empty="Пока нет кликов" />
        </Card>
        <Card title="Откуда кликают на проекты" subtitle="Какой блок сайта ведёт в кейсы">
          <BarList rows={areaRows} empty="Пока нет кликов" />
          <h3 className="panel__h3">Переходы по разделам</h3>
          <BarList rows={ranked(b.click_nav, pageName, 'переходов')} empty="Пока нет переходов" />
        </Card>
      </div>

      <Card
        title="Глубина просмотра страниц"
        subtitle="Активное время — только пока вкладка на экране. Скролл — насколько далеко пролистали."
        className="span-2"
      >
        <DepthTable breakdowns={b} />
      </Card>

      <div className="grid-3">
        <Card title="Источники" subtitle="Откуда пришли, по сессиям">
          <BarList rows={ranked(b.source)} />
        </Card>
        <Card title="Сайты-источники" subtitle="Referrer и utm_source">
          <BarList rows={ranked(b.referrer)} empty="Пока только прямые заходы" />
        </Card>
        <Card title="Страницы входа" subtitle="С какой страницы начали">
          <BarList rows={ranked(b.landing, pageName)} />
          {b.campaign?.length ? (
            <>
              <h3 className="panel__h3">UTM-кампании</h3>
              <BarList rows={ranked(b.campaign)} />
            </>
          ) : null}
        </Card>
      </div>

      <div className="grid-3">
        <Card title="Устройства">
          <BarList rows={(b.device || []).map((row) => ({ key: row.key, label: deviceName(row.key), icon: deviceIcon(row.key), value: row.value, unit: 'сессий' }))} />
          <h3 className="panel__h3">Ширина экрана, px</h3>
          <BarList rows={ranked(b.screen)} />
        </Card>
        <Card title="ОС и браузеры">
          <BarList rows={ranked(b.os)} limit={6} />
          <h3 className="panel__h3">Браузеры</h3>
          <BarList rows={ranked(b.browser)} limit={6} />
        </Card>
        <Card title="География">
          <BarList rows={(b.country || []).map((row) => ({ key: row.key, label: countryName(row.key), icon: flag(row.key), value: row.value, unit: 'сессий' }))} />
          <h3 className="panel__h3">Города</h3>
          <BarList rows={ranked(b.city)} limit={6} />
        </Card>
      </div>

      {!isToday ? (
        <Card title="Когда заходят" subtitle="Просмотры по дням недели и часам, по времени сайта" className="span-2">
          <Heatmap grid={heat} rowLabels={WEEKDAYS} />
        </Card>
      ) : null}

      <div className="grid-3">
        <Card title="Язык сайта" subtitle="На каком языке открыли">
          <BarList rows={ranked(b.lang, (key) => key.toUpperCase())} />
          {b.langSwitch?.length ? (
            <>
              <h3 className="panel__h3">Переключили язык на</h3>
              <BarList rows={ranked(b.langSwitch, (key) => key.toUpperCase(), 'раз')} />
            </>
          ) : null}
        </Card>
        <Card title="Соцсети и внешние ссылки">
          <BarList rows={ranked(b.click_social, contactName, 'кликов')} empty="Пока нет кликов" />
          <h3 className="panel__h3">Другие внешние ссылки</h3>
          <BarList rows={ranked(b.click_outbound, undefined, 'кликов')} empty="Пока нет кликов" />
        </Card>
        <Card title="Битые ссылки" subtitle="Заходы на несуществующие страницы">
          <BarList rows={ranked(b.errors, undefined, 'раз')} empty="Ни одного 404 — отлично" />
        </Card>
      </div>
    </>
  );
}

/* ---------- app ---------- */

export function StatsApp() {
  const [key, setKey] = useState(() => (DEMO ? 'demo' : readStorage(KEY_STORAGE)));
  const [days, setDays] = useState(() => Number(readStorage('vb_stats_range')) || 7);
  const [report, setReport] = useState(null);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [notConfigured, setNotConfigured] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastLive, setLastLive] = useState(0);
  const [excludeMe, setExcludeMe] = useState(() => readStorage(OPT_OUT_KEY) !== '0');
  const visible = useVisible();
  const now = useNow();

  useEffect(() => {
    writeStorage(OPT_OUT_KEY, excludeMe ? '1' : '0');
  }, [excludeMe]);

  const handleError = useCallback((error) => {
    if (error.status === 401) {
      writeStorage(KEY_STORAGE, null);
      setKey(null);
      setAuthError('Неверный пароль');
    } else if (error.code === 'not_configured') {
      setNotConfigured(true);
    }
  }, []);

  const loadReport = useCallback(async () => {
    if (!key) return;
    setLoading(true);

    try {
      setReport(DEMO ? demoReport(days) : await request(`days=${days}`, key));
      writeStorage(KEY_STORAGE, DEMO ? null : key);
      setAuthError('');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [key, days, handleError]);

  const loadLive = useCallback(async () => {
    if (!key) return;

    try {
      setLive(DEMO ? demoLive() : await request('live=1', key));
      setLastLive(Date.now());
    } catch (error) {
      handleError(error);
    }
  }, [key, handleError]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (!key || paused || !visible) return undefined;

    loadLive();
    const liveTimer = window.setInterval(loadLive, LIVE_MS);
    const reportTimer = window.setInterval(loadReport, REPORT_MS);

    return () => {
      window.clearInterval(liveTimer);
      window.clearInterval(reportTimer);
    };
  }, [key, paused, visible, loadLive, loadReport]);

  if (notConfigured) return <NotConfigured />;

  if (!key) {
    return <Login onSubmit={(value) => { setAuthError(''); setKey(value); }} error={authError} busy={loading} />;
  }

  const isLive = !paused && visible && now - lastLive < LIVE_MS * 3;

  return (
    <TooltipProvider>
      <div className="dash">
        <header className="topbar">
          <div className="topbar__title">
            <a className="brand" href="/">v.b.</a>
            <h1>Аналитика</h1>
            {report?.demo ? <span className="chip chip--demo">Демо-данные</span> : null}
          </div>

          <div className="topbar__controls">
            <div className="segmented" role="group" aria-label="Период">
              {RANGES.map((range) => (
                <button
                  key={range.days}
                  type="button"
                  aria-pressed={days === range.days}
                  onClick={() => {
                    setDays(range.days);
                    writeStorage('vb_stats_range', String(range.days));
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`chip live-chip${isLive ? ' is-live' : ''}`}
              onClick={() => setPaused((value) => !value)}
              title={paused ? 'Продолжить обновление' : 'Поставить на паузу'}
            >
              <span className="pulse" aria-hidden="true" />
              {paused ? 'Пауза' : isLive ? `Live · ${ago(lastLive, now)}` : 'Подключаюсь…'}
            </button>
          </div>
        </header>

        <LivePanel live={live} now={now} />

        <div className={`report${loading ? ' is-loading' : ''}`}>
          {report ? <Report report={report} /> : <p className="empty">Загружаю отчёт…</p>}
        </div>

        <footer className="dash__footer">
          <label className="check">
            <input type="checkbox" checked={excludeMe} onChange={(event) => setExcludeMe(event.target.checked)} />
            Не считать мои визиты с этого браузера
          </label>
          <span className="muted">
            {report ? `Время: ${report.timeZone} · обновлено ${ago(report.generatedAt, now)}` : ''}
          </span>
          {DEMO ? null : (
            <button
              type="button"
              className="link-button"
              onClick={() => {
                writeStorage(KEY_STORAGE, null);
                setKey(null);
                setReport(null);
                setLive(null);
              }}
            >
              Выйти
            </button>
          )}
        </footer>
      </div>
    </TooltipProvider>
  );
}
