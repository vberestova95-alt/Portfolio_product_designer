import React, { useLayoutEffect, useRef, useState } from 'react';

/*
 * The case's collapsible, with pictures: the same trigger and list, then a row
 * of dated tiles and a wide picture under them (the cat app's brand story).
 * Pictures make the body taller than the shared collapsible's fixed max-height,
 * so the open height is measured. Clicking a picture opens the page lightbox.
 */
export function CatCollapsibleMedia({ part }) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const bodyRef = useRef(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!isOpen || !body) {
      return undefined;
    }

    // Images load and the width changes after opening: follow the content.
    const update = () => setHeight(body.scrollHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body.firstElementChild);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div className={`cat-collapsible${isOpen ? ' is-open' : ''}`}>
      <button
        className="cat-collapsible__trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span className="cat-collapsible__title">{part.title}</span>
        <svg className="cat-collapsible__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        ref={bodyRef}
        className="cat-collapsible__body"
        style={{ maxHeight: isOpen ? height : 0 }}
        aria-hidden={!isOpen}
      >
        <div className="cat-collapsible__inner">
          {part.items?.length ? (
            <ul className="case-bullet-list">
              {part.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {part.tiles?.length ? (
            <div className="cat-collapsible__tiles">
              {part.tiles.map((tile) => (
                <figure key={tile.src} className="cat-collapsible__tile">
                  <div className="cat-collapsible__plate">
                    <img src={tile.src} alt={tile.alt} loading="lazy" />
                  </div>
                  <figcaption>
                    <span>{tile.date}</span>
                    {tile.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}

          {part.wide ? (
            <figure className="cat-collapsible__wide">
              <img src={part.wide.src} alt={part.wide.alt} loading="lazy" />
              <figcaption>
                <span>{part.wide.date}</span>
                {part.wide.caption}
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </div>
  );
}
