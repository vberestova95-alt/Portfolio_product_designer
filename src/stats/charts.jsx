/*
 * Hand-rolled chart pieces for the dashboard — a few small forms rather than a
 * charting library. All share one tooltip (TooltipProvider) and the colour
 * roles in stats.css: --s1 / --s2 for series, text tokens for every label.
 *
 * Every value a tooltip shows is also on screen somewhere (a direct label, a
 * table, a tile), so the tooltip only ever adds convenience.
 */
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { number } from './format.js';

const TooltipContext = createContext(null);

export function TooltipProvider({ children }) {
  const [tip, setTip] = useState(null);

  const show = useCallback((event, title, rows) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX ?? rect.left + rect.width / 2;
    const y = event.clientY ?? rect.top;
    setTip({ x, y, title, rows });
  }, []);
  const hide = useCallback(() => setTip(null), []);
  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <TooltipContext.Provider value={value}>
      {children}
      {tip ? (
        <div
          className="tip"
          role="status"
          style={{
            left: Math.min(tip.x + 14, window.innerWidth - 220),
            top: Math.max(8, tip.y - 12),
          }}
        >
          {tip.title ? <div className="tip__title">{tip.title}</div> : null}
          {tip.rows.map((row) => (
            <div className="tip__row" key={row.label}>
              {row.color ? <span className="tip__key" style={{ background: row.color }} /> : null}
              <strong>{row.value}</strong>
              <span>{row.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  return useContext(TooltipContext);
}

// Hover and keyboard focus both open the same tooltip.
function tipHandlers(tooltip, title, rows) {
  return {
    tabIndex: 0,
    onPointerMove: (event) => tooltip.show(event, title, rows),
    onPointerLeave: tooltip.hide,
    onFocus: (event) => tooltip.show(event, title, rows),
    onBlur: tooltip.hide,
  };
}

function niceMax(value) {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power * 4 >= value) * power;
  return step * 4;
}

/*
 * Columns over time, optionally two stacked series. Columns are capped at 24px
 * with a 2px surface gap between stacked segments; the rounded end is at the
 * top only.
 */
export function ColumnChart({ data, series, label, height = 220, ariaLabel }) {
  const tooltip = useTooltip();
  const wrapRef = useRef(null);
  const totals = data.map((row) => series.reduce((sum, s) => sum + (row[s.key] || 0), 0));
  const max = niceMax(Math.max(1, ...totals));
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];
  const plotH = height - 28;
  const labelEvery = Math.ceil(data.length / 10);

  return (
    <div className="columns" ref={wrapRef} style={{ height }} role="img" aria-label={ariaLabel}>
      <div className="columns__axis" style={{ height: plotH }}>
        {ticks.map((tick) => (
          <span key={tick} style={{ bottom: `${(tick / max) * 100}%` }}>
            {number(tick)}
          </span>
        ))}
      </div>
      <div className="columns__plot" style={{ height: plotH }}>
        {ticks.map((tick) => (
          <i key={tick} className="columns__grid" style={{ bottom: `${(tick / max) * 100}%` }} />
        ))}
        {data.map((row, index) => {
          const rows = series.map((s) => ({
            label: s.label,
            value: number(row[s.key] || 0),
            color: `var(${s.color})`,
          }));

          return (
            <div
              key={label(row, index)}
              className="columns__slot"
              {...tipHandlers(tooltip, row.title || label(row, index), rows)}
            >
              <div className="columns__stack" style={{ height: `${(totals[index] / max) * 100}%` }}>
                {series
                  .map((s) => ({ s, value: row[s.key] || 0 }))
                  .filter(({ value }) => value > 0)
                  .reverse()
                  .map(({ s, value }) => (
                    <span
                      key={s.key}
                      className="columns__seg"
                      style={{ flexGrow: value, background: `var(${s.color})` }}
                    />
                  ))}
              </div>
              <span className="columns__x">
                {index % labelEvery === 0 || data.length <= 10 ? label(row, index) : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Legend({ series }) {
  return (
    <ul className="legend">
      {series.map((s) => (
        <li key={s.key}>
          <span className="legend__swatch" style={{ background: `var(${s.color})` }} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/*
 * Ranked horizontal bars: label, bar, value at the tip. One series, so one
 * colour for every bar — length already says which is bigger.
 */
export function BarList({ rows, format = number, empty = 'Пока нет данных', limit = 8, note }) {
  const tooltip = useTooltip();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, limit);
  const max = Math.max(1, ...rows.map((row) => row.value));
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  if (!rows.length) {
    return <p className="empty">{empty}</p>;
  }

  return (
    <div className="bars">
      {visible.map((row) => (
        <div
          className="bars__row"
          key={row.key}
          {...tipHandlers(tooltip, row.label, [
            { label: row.unit || 'всего', value: format(row.value) },
            ...(total ? [{ label: 'доля', value: `${Math.round((row.value / total) * 100)}%` }] : []),
            ...(row.extra || []),
          ])}
        >
          <span className="bars__label">
            {row.icon ? <span className="bars__icon">{row.icon}</span> : null}
            <span className="bars__text">{row.label}</span>
            {row.sub ? <span className="bars__sub">{row.sub}</span> : null}
          </span>
          <span className="bars__track">
            <span className="bars__fill" style={{ width: `${Math.max(1.5, (row.value / max) * 100)}%` }} />
          </span>
          <span className="bars__value">{format(row.value)}</span>
        </div>
      ))}
      {rows.length > limit ? (
        <button type="button" className="link-button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Свернуть' : `Показать все (${rows.length})`}
        </button>
      ) : null}
      {note ? <p className="note">{note}</p> : null}
    </div>
  );
}

/*
 * Funnel: each stage as a bar against the first, with the step conversion
 * (from the stage before) written out — that drop is what the funnel is for.
 */
export function Funnel({ stages }) {
  const tooltip = useTooltip();
  const top = Math.max(1, stages[0]?.value || 0);

  return (
    <ol className="funnel">
      {stages.map((stage, index) => {
        const previous = index ? stages[index - 1].value : stage.value;
        const step = previous ? stage.value / previous : 0;

        return (
          <li
            key={stage.label}
            className="funnel__stage"
            {...tipHandlers(tooltip, stage.label, [
              { label: 'посетителей', value: number(stage.value) },
              { label: 'от всех', value: `${Math.round((stage.value / top) * 100)}%` },
              ...(index ? [{ label: 'от прошлого шага', value: `${Math.round(step * 100)}%` }] : []),
            ])}
          >
            <div className="funnel__head">
              <span className="funnel__label">{stage.label}</span>
              <span className="funnel__value">
                <strong>{number(stage.value)}</strong>
                {index ? <span className="funnel__step">{Math.round(step * 100)}% от шага выше</span> : null}
              </span>
            </div>
            <span className="funnel__track">
              <span className="funnel__fill" style={{ width: `${Math.max(1, (stage.value / top) * 100)}%` }} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/*
 * Weekday × hour grid, one hue light→dark. Empty cells keep the faintest step
 * so the grid itself stays readable.
 */
export function Heatmap({ grid, rowLabels }) {
  const tooltip = useTooltip();
  const max = Math.max(1, ...grid.flat());

  return (
    <div className="heat" role="img" aria-label="Просмотры по дням недели и часам">
      <div className="heat__hours">
        <span />
        {Array.from({ length: 24 }, (_, hour) => (
          <span key={hour}>{hour % 3 === 0 ? hour : ''}</span>
        ))}
      </div>
      {grid.map((row, rowIndex) => (
        <div className="heat__row" key={rowLabels[rowIndex]}>
          <span className="heat__label">{rowLabels[rowIndex]}</span>
          {row.map((value, hour) => (
            <span
              key={hour}
              className="heat__cell"
              style={{ '--heat': value ? 0.12 + (value / max) * 0.88 : 0 }}
              {...tipHandlers(tooltip, `${rowLabels[rowIndex]}, ${hour}:00–${hour + 1}:00`, [
                { label: 'просмотров', value: number(value) },
              ])}
            />
          ))}
        </div>
      ))}
      <div className="heat__scale">
        <span>меньше</span>
        {[0.12, 0.34, 0.56, 0.78, 1].map((step) => (
          <span key={step} className="heat__cell heat__cell--key" style={{ '--heat': step }} />
        ))}
        <span>больше</span>
      </div>
    </div>
  );
}

// 12-ish point trend line in the de-emphasis colour, last point accented.
export function Sparkline({ values }) {
  if (!values || values.length < 2) return null;

  const width = 120;
  const height = 32;
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (width - 6) + 3,
    height - 3 - (value / max) * (height - 6),
  ]);
  const last = points[points.length - 1];

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points.map((p) => p.join(',')).join(' ')} />
      <circle cx={last[0]} cy={last[1]} r="3.5" />
    </svg>
  );
}

// Thin 0–100% meter for table cells: the fill on a lighter track of its hue.
export function Meter({ value }) {
  return (
    <span className="meter" aria-hidden="true">
      <span style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </span>
  );
}
