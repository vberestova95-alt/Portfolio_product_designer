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
 * for the hero pairs' beat (the cover itself `coverHold`, a frame its own
 * `hold`), then the next fades in over it. The count stands while the card is
 * off screen or the tab is hidden; with reduced motion the first frame stays.
 * `seen` turns on the first time the card comes on screen: a frame's clip is
 * not fetched before that.
 */
function useFrameTurn(ref, holds) {
  const [shown, setShown] = useState(0);
  const [seen, setSeen] = useState(false);
  const shownRef = useRef(0);
  const count = holds.length;
  const beat = holds.join();

  useEffect(() => {
    const node = ref.current;

    if (
      count < 2 ||
      !node ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const holdOf = beat.split(',').map(Number);
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
        }, holdOf[shownRef.current]);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;

      if (onScreen) {
        setSeen(true);
      }

      run();
    });

    observer.observe(node);
    document.addEventListener('visibilitychange', run);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', run);
    };
  }, [ref, count, beat]);

  return { shown, seen };
}

/*
 * A frame that is a clip: its poster until the card has been on screen, then
 * the clip, which starts over each time the frame comes in and stops when it
 * leaves. `sources` in the order to try: HEVC with alpha (.mov) for Safari,
 * VP9 with alpha (WebM) for the rest. Muted is set on the element itself, as
 * in CoverMotion, for Safari's autoplay check.
 */
function FrameClip({ frame, active, load }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    node.muted = true;
    node.defaultMuted = true;

    if (!active) {
      node.pause();
      return undefined;
    }

    node.currentTime = 0;
    const attempt = node.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {});
    }

    return undefined;
  }, [active, load]);

  if (!load) {
    return <img src={frame.src} alt={frame.alt} />;
  }

  return (
    <video
      ref={ref}
      poster={frame.src}
      aria-label={frame.alt}
      muted
      loop
      playsInline
      preload="auto"
    >
      {frame.video.sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
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

/*
 * With `stackFrames` the frames after the cover build up instead of taking
 * turns: each screen comes in next to the ones already shown (the exports
 * share one canvas, every screen in its own place), and all of them leave
 * together when the cover comes back.
 */
function CoverFrames({ item }) {
  const ref = useRef(null);
  const frames = [item.image, ...item.frames];
  const holds = frames.map((frame, place) =>
    place === 0 ? COVER_HOLD_MS[item.id] ?? FRAME_HOLD_MS : frame.hold ?? FRAME_HOLD_MS,
  );
  const { shown, seen } = useFrameTurn(ref, holds);
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const isShown = (place) =>
    item.stackFrames && place > 0 ? place <= shown : place === shown;

  return (
    <div className="work-card__visual work-card__visual--frames" ref={ref}>
      {frames.map((frame, place) => (
        <div
          key={frame.src}
          className={`work-card__frame${place === 0 && item.motion ? ' work-card__frame--stage' : ''}${
            isShown(place) ? ' is-shown' : ''
          }`}
          aria-hidden={isShown(place) ? undefined : true}
        >
          {place === 0 && item.motion ? (
            <CoverStage item={item} />
          ) : frame.video && !reduceMotion ? (
            <FrameClip frame={frame} active={isShown(place)} load={seen} />
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
