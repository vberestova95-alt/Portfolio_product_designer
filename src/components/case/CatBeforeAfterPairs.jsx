import React, { useCallback, useEffect, useState } from 'react';
import { useUi } from '../../i18n/LanguageContext.jsx';

const PHONE_QUERY = '(max-width: 640px)';

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isPhone;
}

/*
 * Before / after for screens that come in pairs (the cat app's web MVP against
 * version two). Two pictures of one geometry: `columns` screens in a row.
 * On a desktop it is the case slider over the whole row; on a phone the row is
 * too small to read, so the slider shows one pair at a time, cropped from the
 * same pictures, and the chips under it switch pairs.
 *
 * `crop` describes the row in picture units: its width and height, where the
 * first pair's window starts and how wide each window is.
 *
 * Unlike the shared slider, Before shows `before`: the left side of the handle
 * is the old picture, the right side the new one.
 */
export function CatBeforeAfterPairs({ part }) {
  const text = useUi().case;
  const isPhone = useIsPhone();
  const [pair, setPair] = useState(0);
  const [position, setPosition] = useState(50);
  const [animated, setAnimated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { before, after, crop, pairs } = part;

  useEffect(() => {
    const steps = [
      [500, 68],
      [950, 32],
      [1450, 50],
    ];

    const timers = steps.map(([delay, value]) =>
      setTimeout(() => {
        setAnimated(true);
        setPosition(value);
      }, delay),
    );
    const resetTimer = setTimeout(() => setAnimated(false), 2000);

    return () => {
      [...timers, resetTimer].forEach(clearTimeout);
    };
  }, []);

  const moveTo = useCallback((value) => {
    setAnimated(true);
    setPosition(value);
    setTimeout(() => setAnimated(false), 480);
  }, []);

  const updatePosition = useCallback((clientX, element) => {
    const rect = element.getBoundingClientRect();
    const nextValue = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, nextValue)));
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!isDragging) {
        return;
      }

      updatePosition(event.clientX, event.currentTarget);
    },
    [isDragging, updatePosition],
  );

  const handleTouchMove = useCallback(
    (event) => {
      updatePosition(event.touches[0].clientX, event.currentTarget);
    },
    [updatePosition],
  );

  const activeTab = position >= 55 ? 'before' : position <= 45 ? 'after' : null;
  const transition = animated ? '460ms cubic-bezier(0.2, 0.8, 0.2, 1)' : null;
  // The tabs move the clip to the very edge, so no strip of the other layer
  // shows there; the handle stops short of the edge to stay in reach.
  const handleLeft = Math.min(96, Math.max(4, position));
  const handleStyle = transition
    ? { left: `${handleLeft}%`, transition: `left ${transition}` }
    : { left: `${handleLeft}%` };
  // Each layer is cut at the handle: the pictures are transparent between the
  // screens, so the old one must not show through the new one.
  const clipTransition = transition ? { transition: `clip-path ${transition}` } : {};
  const beforeStyle = { clipPath: `inset(0 ${100 - position}% 0 0)`, ...clipTransition };
  const afterStyle = { clipPath: `inset(0 0 0 ${position}%)`, ...clipTransition };

  // The window into the row: the whole row on a desktop, one pair on a phone.
  const windowStart = isPhone ? crop.start + pair * crop.window : 0;
  const windowWidth = isPhone ? crop.window : crop.width;
  const frameStyle = { aspectRatio: `${windowWidth} / ${crop.height}` };
  const imageStyle = {
    width: `${(crop.width / windowWidth) * 100}%`,
    marginLeft: `${(-windowStart / windowWidth) * 100}%`,
  };
  const pairLabel = isPhone ? pairs[pair]?.label : null;

  return (
    // Stop the click here: the page opens images in a lightbox, but releasing
    // the handle is a click too.
    <div className="cat-ba-wrap" onClick={(event) => event.stopPropagation()}>
      <div className="cat-ba-tabs">
        <button
          className={`cat-ba-tab${activeTab === 'before' ? ' is-active' : ''}`}
          onClick={() => moveTo(100)}
        >
          {text.before}
        </button>
        <button
          className={`cat-ba-tab${activeTab === 'after' ? ' is-active' : ''}`}
          onClick={() => moveTo(0)}
        >
          {text.after}
        </button>
      </div>

      <div
        className="cat-ba-slider"
        style={frameStyle}
        onMouseMove={handlePointerMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="cat-ba-slider__layer" style={beforeStyle}>
          <img
            className="cat-ba-slider__img"
            src={before.src}
            alt={pairLabel ? `${before.alt} (${pairLabel})` : before.alt}
            style={imageStyle}
            draggable={false}
          />
        </div>
        <div className="cat-ba-slider__layer cat-ba-slider__layer--after" style={afterStyle}>
          <img
            className="cat-ba-slider__img"
            src={after.src}
            alt={pairLabel ? `${after.alt} (${pairLabel})` : after.alt}
            style={imageStyle}
            draggable={false}
          />
        </div>
        <div
          className="cat-ba-slider__handle"
          style={handleStyle}
          onMouseDown={(event) => {
            event.preventDefault();
            setAnimated(false);
            setIsDragging(true);
          }}
          onTouchStart={() => {
            setAnimated(false);
            setIsDragging(true);
          }}
        >
          {/* At an edge there is nothing to divide: the line would read as a strip. */}
          <div className={`cat-ba-slider__line${position <= 0 || position >= 100 ? ' is-hidden' : ''}`} />
          <div className="cat-ba-slider__grip" aria-label={text.dragToCompare}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M7 5L2 10L7 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 5L18 10L13 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {isPhone ? (
        <div className="cat-ba-pairs">
          {pairs.map((item, index) => (
            <button
              key={item.label}
              className={`cat-ba-pairs__chip${index === pair ? ' is-active' : ''}`}
              aria-pressed={index === pair}
              onClick={() => setPair(index)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
