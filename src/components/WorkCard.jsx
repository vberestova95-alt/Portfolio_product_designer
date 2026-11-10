import React, { useEffect, useRef, useState } from 'react';
import { useUi } from '../i18n/LanguageContext.jsx';

/*
 * React sets `muted` as a property after mount, which is too late for Safari's
 * autoplay check — it sees an unmuted video on first paint and blocks playback.
 * Setting it on the element itself, then calling play(), makes it reliable.
 */
function CoverMotion({ motion }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    node.muted = true;
    node.defaultMuted = true;

    const start = () => {
      const attempt = node.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {});
      }
    };

    if (node.readyState >= 2) {
      start();
    } else {
      node.addEventListener('loadeddata', start, { once: true });
    }

    return () => node.removeEventListener('loadeddata', start);
  }, []);

  return (
    <div
      className="cover-stage__motion"
      aria-hidden="true"
      style={{
        left: motion.left,
        top: motion.top,
        width: motion.width,
        height: motion.height,
      }}
    >
      <video ref={ref} src={motion.src} autoPlay muted loop playsInline preload="auto" />
      {motion.fade ? (
        <span className="cover-stage__fade" style={{ backgroundImage: motion.fade }} />
      ) : null}
      {motion.overlay ? (
        <img className="cover-stage__overlay" src={motion.overlay} alt="" />
      ) : null}
    </div>
  );
}

// How long a cover frame holds: the beat of the hero's pairs (PAIR_HOLD_MS).
const FRAME_HOLD_MS = 7000;

// Covers whose own picture holds for less before the frames: BetBoom PASS goes
// on to the mobile app 2 s sooner (user's edit, 2026-11-10).
const COVER_HOLD_MS = { 'betboom-pass': 5000 };

/*
 * A cover with `frames` shows them in turn after its own picture: each holds
 * for the hero pairs' beat (the cover itself `coverHold`), then the next fades
 * in over it. The count stands
 * while the card is off screen or the tab is hidden; with reduced motion the
 * first frame stays.
 */
function useFrameTurn(ref, count, coverHold = FRAME_HOLD_MS) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    const node = ref.current;

    if (
      count < 2 ||
      !node ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    let onScreen = false;
    let timer = 0;
    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
    };
    const run = () => {
      stop();

      if (onScreen && !document.hidden) {
        timer = window.setTimeout(() => {
          shownRef.current = (shownRef.current + 1) % count;
          setShown(shownRef.current);
          run();
        }, shownRef.current === 0 ? coverHold : FRAME_HOLD_MS);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      run();
    });

    observer.observe(node);
    document.addEventListener('visibilitychange', run);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', run);
    };
  }, [ref, count, coverHold]);

  return shown;
}

function CoverStage({ item }) {
  return (
    <div
      className="cover-stage"
      style={{ '--stage-w': item.stage.width, '--stage-h': item.stage.height }}
    >
      <img className="cover-stage__base" src={item.image.src} alt={item.image.alt} />
      <CoverMotion motion={item.motion} />
    </div>
  );
}

function CoverFrames({ item }) {
  const ref = useRef(null);
  const frames = [item.image, ...item.frames];
  const shown = useFrameTurn(ref, frames.length, COVER_HOLD_MS[item.id]);

  return (
    <div className="work-card__visual work-card__visual--frames" ref={ref}>
      {frames.map((frame, place) => (
        <div
          key={frame.src}
          className={`work-card__frame${place === 0 && item.motion ? ' work-card__frame--stage' : ''}${
            place === shown ? ' is-shown' : ''
          }`}
          aria-hidden={place === shown ? undefined : true}
        >
          {place === 0 && item.motion ? (
            <CoverStage item={item} />
          ) : (
            <img src={frame.src} alt={frame.alt} />
          )}
        </div>
      ))}
    </div>
  );
}

export function WorkCard({ item, index, total }) {
  const text = useUi().home;

  return (
    <article
      className={`work-card work-card--${item.surface} work-card--${item.id}`}
      style={{
        '--stack-index': index,
        '--stack-total': total,
      }}
    >
      <a className="work-card__hit" href={item.href}>
        <span className="visually-hidden">{`${text.openCase}: ${item.title}`}</span>
      </a>

      <div className="work-card__meta">
        <ul className="work-card__stats">
          {item.metrics.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
        <span className="work-card__kicker">{item.category}</span>
      </div>
      <div className="work-card__body">
        <div className="work-card__copy">
          <h3>{item.title}</h3>
          <p className="work-card__description">{item.description}</p>
          {/* Visual only — the whole card is already the link (work-card__hit). */}
          <span className="work-card__cta" aria-hidden="true">
            {text.viewProject}
            <span className="work-card__cta-arrow">→</span>
          </span>
        </div>
        {item.shots ? (
          <div
            className="work-card__visual work-card__visual--shots"
            role="img"
            aria-label={item.image.alt}
          >
            {item.shots.map((shot) => (
              <span
                key={shot.src}
                className="work-shot"
                style={{ '--shot-ratio': shot.ratio }}
              >
                <img src={shot.src} alt="" loading="lazy" />
              </span>
            ))}
          </div>
        ) : item.frames ? (
          <CoverFrames item={item} />
        ) : (
          <div className={`work-card__visual${item.motion ? ' work-card__visual--stage' : ''}`}>
            {item.motion ? (
              <CoverStage item={item} />
            ) : (
              <img
                src={item.image.src}
                alt={item.image.alt}
                style={
                  item.focus
                    ? {
                        '--zoom': item.focus.zoom,
                        '--fx': item.focus.fx,
                        '--fy': item.focus.fy,
                      }
                    : undefined
                }
              />
            )}
            {item.mobileImage && !item.motion ? (
              <div className="work-card__mobile">
                <img src={item.mobileImage.src} alt={item.mobileImage.alt} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
