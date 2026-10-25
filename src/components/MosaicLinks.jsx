import React from 'react';

// Below this width a mosaic carries its name in a smaller chip.
const SMALL_MOSAIC = 160;

/*
 * The links over a mosaic index (lib/heroMosaic.js, `nav`): one per mosaic,
 * laid over its four squares wherever the script placed them, with the name in
 * its corner. Hovering or focusing one asks the mosaic to assemble into that
 * preview; leaving it lets the squares fall apart again.
 *
 * `active` is the mosaic open on its own (the index's cycle): its name shows
 * as if hovered.
 *
 * `decorative` links repeat a link the card already has: they still answer
 * the pointer, but stay out of the tab order and away from screen readers.
 */
export function MosaicLinks({
  items,
  boxes,
  canvasRef,
  label,
  theme = 'dark',
  decorative = false,
  active = null,
}) {
  const send = (type, index) => {
    canvasRef.current?.dispatchEvent(new CustomEvent(type, { detail: index }));
  };

  return (
    <nav
      className={`mosaic-links mosaic-links--${theme}`}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      {boxes.map(({ index, x, y, w, h }) => {
        const item = items[index];

        return (
          <a
            key={item.id ?? index}
            className={`mosaic-link${w < SMALL_MOSAIC ? ' mosaic-link--small' : ''}${
              index === active ? ' is-active' : ''
            }`}
            href={item.href}
            tabIndex={decorative ? -1 : undefined}
            style={{ left: x, top: y, width: w, height: h }}
            onPointerEnter={() => send('mosaic:show', index)}
            onPointerLeave={() => send('mosaic:hide', index)}
            onFocus={() => send('mosaic:show', index)}
            onBlur={() => send('mosaic:hide', index)}
          >
            <span className="mosaic-link__label">
              {item.tag ? <span className="mosaic-link__tag">{item.tag}</span> : null}
              <span className="mosaic-link__title">{item.title}</span>
              <span className="mosaic-link__arrow" aria-hidden="true">
                →
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
