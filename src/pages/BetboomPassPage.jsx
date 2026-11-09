import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';

/*
 * `ratio` (e.g. '1600 / 900') reserves the clip's box before anything loads,
 * so the page does not grow under the reader as clips arrive — that shift is
 * what threw Back to the wrong place on this long page.
 */
function LazyVideo({ src, alt, className = '', playbackRate = 1, poster, ratio }) {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = videoRef.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;

    if (!node || !shouldLoad) {
      return undefined;
    }

    node.muted = true;
    node.defaultMuted = true;
    node.playbackRate = playbackRate;

    const play = () => {
      const attempt = node.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {});
      }
    };

    if (node.readyState >= 2) {
      play();
    } else {
      node.addEventListener('loadeddata', play, { once: true });
    }

    return () => node.removeEventListener('loadeddata', play);
  }, [playbackRate, shouldLoad]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={shouldLoad ? src : undefined}
      poster={poster}
      style={ratio ? { aspectRatio: ratio } : undefined}
      aria-label={alt}
      autoPlay
      muted
      loop
      playsInline
      preload={shouldLoad ? 'auto' : 'none'}
    />
  );
}

/*
 * A screen recording in a phone frame. Nothing is fetched up front
 * (preload="none", poster only); the clip plays while it is on screen and
 * pauses when it leaves, so a page of eight clips never streams them all at
 * once. With reduced motion it stays on the poster and offers controls.
 */
function FlowVideo({ clip }) {
  const videoRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    if (!query) {
      return undefined;
    }

    const update = () => setReduceMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const node = videoRef.current;

    if (!node) {
      return undefined;
    }

    node.muted = true;
    node.defaultMuted = true;

    if (reduceMotion) {
      node.pause();
      return undefined;
    }

    const play = () => {
      const attempt = node.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {});
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      play();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
        } else {
          node.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <figure className="case-flow__clip">
      <div className="case-flow__phone">
        <video
          ref={videoRef}
          poster={clip.poster}
          aria-label={clip.alt}
          muted
          loop
          playsInline
          preload="none"
          controls={reduceMotion}
        >
          <source src={clip.src} type="video/mp4" />
          {clip.webm ? <source src={clip.webm} type="video/webm" /> : null}
        </video>
      </div>
      <figcaption>
        {clip.label ? <span>{clip.label}</span> : null}
        {clip.caption}
      </figcaption>
    </figure>
  );
}

/*
 * Key flows: per flow a title, the problem and the answer, two clips with
 * captions and what comes after the release.
 */
function FlowVideos({ part }) {
  return (
    <section className="case-flows">
      {part.label ? <span className="case-flows__label">{part.label}</span> : null}
      {part.intro ? <p className="case-flows__intro">{part.intro}</p> : null}
      {part.flows.map((flow) => (
        <article key={flow.title} className="case-flow">
          <h3>{flow.title}</h3>
          <div className="case-flow__brief">
            {flow.brief.map((item) => (
              <div key={item.heading}>
                <h4>{item.heading}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="case-flow__clips">
            {flow.clips.map((clip) => (
              <FlowVideo key={clip.src} clip={clip} />
            ))}
          </div>
          {flow.next ? (
            <p className="case-flow__next">
              <span>{flow.next.heading}</span>
              {flow.next.text}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function BeforeAfterSlider({ before, after, caption }) {
  const text = useUi().case;
  const [position, setPosition] = useState(50);
  const [animated, setAnimated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const steps = [
      [500, 32],
      [950, 68],
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

  const activeTab = position <= 45 ? 'before' : position >= 55 ? 'after' : null;
  const animationStyle = animated
    ? { transition: 'clip-path 460ms cubic-bezier(0.2, 0.8, 0.2, 1)' }
    : {};
  const handleStyle = animated
    ? {
        left: `${position}%`,
        transition: 'left 460ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }
    : { left: `${position}%` };

  return (
    <div className="case-ba-wrap">
      <div className="case-ba-tabs">
        <button
          className={`case-ba-tab${activeTab === 'before' ? ' is-active' : ''}`}
          onClick={() => {
            setAnimated(true);
            setPosition(4);
            setTimeout(() => setAnimated(false), 480);
          }}
        >
          {text.before}
        </button>
        <button
          className={`case-ba-tab${activeTab === 'after' ? ' is-active' : ''}`}
          onClick={() => {
            setAnimated(true);
            setPosition(96);
            setTimeout(() => setAnimated(false), 480);
          }}
        >
          {text.after}
        </button>
      </div>

      <div
        className="case-ba-slider"
        onMouseMove={handlePointerMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {after.video ? (
          // The after side may play (a scroll through the new page) under the
          // still "before"; the poster holds the frame until it loads.
          <LazyVideo className="case-ba-slider__img" src={after.video} poster={after.src} alt={after.alt} />
        ) : (
          <img className="case-ba-slider__img" src={after.src} alt={after.alt} draggable={false} />
        )}
        <img
          className="case-ba-slider__before"
          src={before.src}
          alt={before.alt}
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, ...animationStyle }}
        />
        <div
          className="case-ba-slider__handle"
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
          <div className="case-ba-slider__line" />
          <div className="case-ba-slider__grip" aria-label={text.dragToCompare}>
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
      <MediaCaption caption={caption} />
    </div>
  );
}

function StatGrid({ items, className = '' }) {
  return (
    <div className={`case-stat-grid${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <div key={`${item.value}-${item.label}`} className="case-stat-card">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/*
 * Hero picture, or an animation over its poster. `video.sources` lists the
 * files in the order the browser should try them — a transparent cover needs
 * WebM (VP9 with alpha) for Chrome and Firefox and HEVC with alpha (.mov) for
 * Safari; H.264 MP4 has no alpha. With reduced motion only the poster shows.
 * `fit: 'contain'` keeps the whole frame instead of cropping it to the slot.
 *
 * `phones` instead lays out a row of phones on one line, each in the same
 * 1080×1440 showcase frame, cropped to the phone (no baked shadow), so all of
 * them share one frame, one scale and one CSS shadow. A phone with `video`
 * plays it over its still.
 */
function HeroMedia({ image }) {
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const className = `case-hero__media${image.fit ? ` case-hero__media--${image.fit}` : ''}`;

  if (image.phones) {
    return (
      <div className="case-hero__media case-hero__media--phones" role="img" aria-label={image.alt}>
        {image.phones.map((phone) => (
          <div key={phone.src} className="case-hero__phone">
            <div className="case-hero__phone-frame">
              {phone.video && !reduceMotion ? (
                <video poster={phone.src} aria-hidden="true" autoPlay muted loop playsInline>
                  {phone.video.sources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                </video>
              ) : (
                <img src={phone.src} alt="" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {image.video && !reduceMotion ? (
        <video poster={image.src} aria-label={image.alt} autoPlay muted loop playsInline>
          {image.video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : (
        <img src={image.src} alt={image.alt} />
      )}
    </div>
  );
}

function HeroMeta({ text, items }) {
  const content = items?.length ? `${text} / ${items.join(' / ')}` : text;
  return <p className="case-hero__meta">{content}</p>;
}

function ContentBlock({ block }) {
  if (block.type === 'list' || block.type === 'ordered-list') {
    const ListTag = block.type === 'ordered-list' ? 'ol' : 'ul';

    return (
      <section className="case-content-block">
        <h3>{block.heading}</h3>
        <ListTag className="case-bullet-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      </section>
    );
  }

  if (block.type === 'stats') {
    return (
      <section className="case-content-block">
        <h3>{block.heading}</h3>
        <StatGrid items={block.stats} className="case-stat-grid--compact" />
      </section>
    );
  }

  return (
    <section className="case-content-block">
      <h3>{block.heading}</h3>
      <div className="case-rich-text">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

/*
 * A bento block: a small grid of interface details cropped out of the full
 * screenshots. Each tile zooms into a focus point (--fx/--fy) so a specific
 * part of the UI can be shown at a readable size.
 */
function BentoTile({ tile }) {
  const style = {
    '--zoom': tile.zoom ?? 1,
    '--fx': tile.fx ?? '50%',
    '--fy': tile.fy ?? '50%',
  };

  return (
    <figure
      className={`bento-tile bento-tile--${tile.span || 'half'}${
        tile.variant ? ` bento-tile--${tile.variant}` : ''
      }`}
    >
      <div className="bento-tile__media" style={style}>
        {tile.type === 'video' || tile.video ? (
          <LazyVideo src={tile.video || tile.src} poster={tile.video ? tile.src : undefined} alt={tile.alt} />
        ) : (
          <img src={tile.src} alt={tile.alt} />
        )}
      </div>
      {tile.caption || tile.credit ? (
        <figcaption>
          {tile.caption}
          {tile.credit ? <span className="case-media-caption__credit">{tile.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

function BentoGrid({ part }) {
  return (
    <section className="case-bento">
      {part.label ? <span className="case-bento__label">{part.label}</span> : null}
      <div className="case-bento__grid">
        {part.tiles.map((tile, index) => (
          <BentoTile key={`${tile.alt}-${index}`} tile={tile} />
        ))}
      </div>
    </section>
  );
}

/*
 * One line under a picture: what changed and why. `credit` names work that is
 * not mine (another designer's UI in the frame) and sits on its own line.
 */
function MediaCaption({ caption, credit }) {
  if (!caption && !credit) {
    return null;
  }

  return (
    <p className="case-media-caption">
      {caption}
      {credit ? <span className="case-media-caption__credit">{credit}</span> : null}
    </p>
  );
}

/*
 * Whole phone screens side by side, each with a short caption — a flow or a
 * set of states. Screens keep their own rounding; the row wraps on a phone.
 */
function PhoneRow({ part }) {
  return (
    <figure className={`case-phone-row case-phone-row--${Math.min(part.items.length, 4)}`}>
      {part.label ? <span className="case-phone-row__label">{part.label}</span> : null}
      <div className="case-phone-row__items">
        {part.items.map((item) => (
          <div key={item.src} className="case-phone-row__item">
            {item.video ? (
              <LazyVideo src={item.video} poster={item.src} alt={item.alt} />
            ) : (
              <img src={item.src} alt={item.alt} loading="lazy" />
            )}
            {item.caption ? <span>{item.caption}</span> : null}
          </div>
        ))}
      </div>
      {part.caption ? (
        <figcaption className="case-media-caption">{part.caption}</figcaption>
      ) : null}
    </figure>
  );
}

// Opens a collapsible block by id (see Collapsible) and scrolls to it.
function openCaseBlock(id) {
  window.dispatchEvent(new CustomEvent('case:open-block', { detail: id }));
}

/*
 * The product as it is now, right under the hero: frames change on their own
 * like a short clip, and each step can be picked by hand. A frame with `video`
 * plays its clip and hands over when it ends; a still frame stays
 * `duration` seconds (3.2 by default). Hover and focus hold the current frame
 * (its clip loops), reduced motion shows the posters only. A frame may tease
 * a block further down the case (`teaser.target` — the id of a collapsible).
 */
function CaseShowcase({ showcase }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const count = showcase.frames.length;
  const videoRefs = useRef([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const advance = useCallback(() => setActive((index) => (index + 1) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    if (!query) {
      return undefined;
    }

    const update = () => setReduceMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Only the active clip plays, from its start.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (index === active && !reduceMotion) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, reduceMotion]);

  const frame = showcase.frames[active];
  const duration = frame.duration ?? 3.2;

  /*
   * A still frame moves on by the timer. For a clip the timer is a backstop
   * in case `ended` never comes (autoplay refused): it waits a little longer
   * than the clip and only fires if the clip is not playing any more.
   */
  useEffect(() => {
    if (paused || reduceMotion) {
      return undefined;
    }

    let timer;
    const check = () => {
      const video = videoRefs.current[active];

      if (frame.video && video && !video.paused && !video.ended) {
        timer = setTimeout(check, 1000);
        return;
      }

      advance();
    };
    timer = setTimeout(check, duration * 1000 + (frame.video ? 1500 : 0));
    return () => clearTimeout(timer);
  }, [active, paused, reduceMotion, frame, duration, advance]);

  // On hold the clip starts over instead of handing over.
  const handleEnded = (event) => {
    if (pausedRef.current) {
      event.currentTarget.currentTime = 0;
      event.currentTarget.play().catch(() => {});
      return;
    }

    advance();
  };

  return (
    /*
     * The class list stays fixed: reveal.js adds `is-revealed` to it straight
     * in the DOM, and a className React recomputes on pause would drop it and
     * hide the whole block again. Pause lives in a data attribute instead.
     */
    <section
      className="case-showcase"
      data-paused={paused || reduceMotion ? '' : undefined}
      data-reveal
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="case-showcase__stage">
        {showcase.frames.map((item, index) => {
          const className = `case-showcase__frame${index === active ? ' is-active' : ''}`;
          const hidden = index === active ? undefined : true;

          return item.video && !reduceMotion ? (
            <video
              key={item.label}
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              className={className}
              poster={item.src}
              aria-label={item.alt}
              aria-hidden={hidden}
              muted
              playsInline
              preload={index === active ? 'auto' : 'metadata'}
              onEnded={index === active ? handleEnded : undefined}
            >
              {item.video.sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
            </video>
          ) : (
            <img key={item.label} className={className} src={item.src} alt={item.alt} aria-hidden={hidden} />
          );
        })}
      </div>

      <div className="case-showcase__copy">
        {showcase.label ? <p className="section-label">{showcase.label}</p> : null}
        {showcase.title ? <h2>{showcase.title}</h2> : null}

        <ol className="case-showcase__steps">
          {showcase.frames.map((item, index) => (
            <li key={item.label} className={index === active ? 'is-active' : undefined}>
              <button type="button" onClick={() => setActive(index)} aria-current={index === active}>
                <span className="case-showcase__step-label">{item.label}</span>
                <span className="case-showcase__step-caption">{item.caption}</span>
                {/* Restarts with each step: the bar shows how long the frame stays. */}
                <span
                  key={`${active}-${index}`}
                  className="case-showcase__progress"
                  style={{ '--showcase-duration': `${item.duration ?? 3.2}s` }}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ol>

        {/* Phones only (CSS): the list shows just the active step there. */}
        <div className="case-showcase__dots">
          {showcase.frames.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              aria-current={index === active}
              onClick={() => setActive(index)}
            />
          ))}
        </div>

        <p className="case-showcase__credit">{frame.credit || '\u00a0'}</p>

        {showcase.frames
          .filter((item) => item.teaser)
          .map((item) => (
            // A teaser either opens a block further down (`target`) or leads
            // to another case (`href`).
            <a
              key={item.teaser.text}
              className="case-showcase__teaser"
              href={item.teaser.href || `#${item.teaser.target}`}
              onClick={
                item.teaser.href
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      openCaseBlock(item.teaser.target);
                    }
              }
            >
              {item.teaser.text}
              <span aria-hidden="true">{item.teaser.href ? '→' : '↓'}</span>
            </a>
          ))}
      </div>
    </section>
  );
}

function CaseMedia({ media, className = '' }) {
  if (media.type === 'video') {
    return (
      <LazyVideo
        className={className}
        src={media.src}
        poster={media.poster}
        alt={media.alt}
        ratio={media.ratio}
      />
    );
  }

  return <img className={className} src={media.src} alt={media.alt} />;
}

/*
 * A block that opens on click. With `id` it can also be opened from elsewhere
 * on the page (openCaseBlock or a #id link on load) and holds whole parts —
 * a mini case folded at the end of a case.
 */
function Collapsible({ part }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const ListTag = part.listType === 'ordered' ? 'ol' : 'ul';

  useEffect(() => {
    if (!part.id) {
      return undefined;
    }

    const open = () => {
      setIsOpen(true);
      // After the open state lands, so the scroll aims at the final layout.
      requestAnimationFrame(() =>
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    };
    const onOpen = (event) => {
      if (event.detail === part.id) {
        open();
      }
    };

    if (window.location.hash === `#${part.id}`) {
      open();
    }

    window.addEventListener('case:open-block', onOpen);
    return () => window.removeEventListener('case:open-block', onOpen);
  }, [part.id]);

  return (
    <div
      ref={rootRef}
      id={part.id}
      className={`case-collapsible${part.parts ? ' case-collapsible--rich' : ''}${
        isOpen ? ' is-open' : ''
      }`}
    >
      <button
        className="case-collapsible__trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span>
          <span className="case-collapsible__title">{part.title}</span>
          {part.subtitle ? (
            <span className="case-collapsible__subtitle">{part.subtitle}</span>
          ) : null}
        </span>
        <svg className="case-collapsible__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="case-collapsible__body">
        {part.items?.length ? (
          <ListTag className="case-bullet-list">
            {part.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ListTag>
        ) : null}

        {part.paragraphs?.length ? (
          <div className="case-rich-text">
            {part.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {part.parts?.map((child, index) => (
          <SectionPart key={`${part.id}-${child.type}-${index}`} part={child} />
        ))}
      </div>
    </div>
  );
}

function PainCards({ part }) {
  return (
    <div className="case-pain-section">
      {part.heading ? <h3>{part.heading}</h3> : null}
      <div className="case-pain-cards">
        {part.items.map((item, index) => (
          <div key={item} className="case-pain-card">
            <span className="case-pain-card__num">{String(index + 1).padStart(2, '0')}</span>
            <p className="case-pain-card__text">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCards({ part }) {
  return (
    <div className="case-insight-section">
      {part.heading ? <h3>{part.heading}</h3> : null}
      <div className="case-insight-cards">
        {part.items.map((item) => (
          <div key={item} className="case-insight-card">
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteCard({ card }) {
  const ListTag = card.listType === 'ordered' ? 'ol' : 'ul';

  const body = (
    <>
      {card.items?.length ? (
        <ListTag className="case-bullet-list">
          {card.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      ) : null}
      {card.paragraphs?.length ? (
        <div className="case-rich-text">
          {card.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div className={`case-note-card${card.compact ? ' case-note-card--compact' : ''}`}>
      {card.title ? <h3>{card.title}</h3> : null}
      {card.icon ? (
        <div className="case-note-card__icon-row">
          <span className="case-note-card__icon" aria-hidden="true">
            {card.icon}
          </span>
          <div>{body}</div>
        </div>
      ) : (
        body
      )}
    </div>
  );
}

import { catAppParts } from '../components/case/catAppParts.js';

function SectionPart({ part }) {
  const text = useUi().case;
  const CatAppPart = catAppParts[part.type];
  if (CatAppPart) return <CatAppPart part={part} />;

  if (part.type === 'richTextLead') {
    return (
      <div className="case-rich-text case-rich-text--lead">
        {part.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  if (part.type === 'blocks') {
    return (
      <div className="case-study-stack">
        {part.blocks.map((block) => (
          <ContentBlock key={`${block.type}-${block.heading}`} block={block} />
        ))}
      </div>
    );
  }

  if (part.type === 'imageBand') {
    return (
      <div
        className={`case-image-band${part.variant ? ` case-image-band--${part.variant}` : ''}`}
      >
        {part.label ? <span>{part.label}</span> : null}
        {part.media.mobileSrc ? (
          // A phone gets its own take on the picture (e.g. screens in a column).
          <picture>
            <source media="(max-width: 640px)" srcSet={part.media.mobileSrc} />
            <CaseMedia media={part.media} />
          </picture>
        ) : (
          <CaseMedia
            media={part.media}
            className={part.media.type === 'video' ? 'case-image-band__video' : ''}
          />
        )}
        <MediaCaption caption={part.caption} credit={part.credit} />
      </div>
    );
  }

  if (part.type === 'featureMedia') {
    return (
      <div className={`case-feature-media${part.wide ? ' case-feature-media--wide' : ''}`}>
        {part.label ? <span className="case-feature-media__label">{part.label}</span> : null}
        <CaseMedia media={part.media} />
        <MediaCaption caption={part.caption} credit={part.credit} />
      </div>
    );
  }

  if (part.type === 'bento') {
    return <BentoGrid part={part} />;
  }

  if (part.type === 'noteCard') {
    return <NoteCard card={part} />;
  }

  if (part.type === 'collapsible') {
    return <Collapsible part={part} />;
  }

  if (part.type === 'painCards') {
    return <PainCards part={part} />;
  }

  if (part.type === 'insightCards') {
    return <InsightCards part={part} />;
  }

  if (part.type === 'phonePair') {
    return (
      <div className="case-image-band">
        {part.label ? <span>{part.label}</span> : null}
        <div className="case-phone-pair">
          {part.items.map((item, index) => (
            <div key={`${item.alt}-${index}`} className="case-phone-pair__item">
              {item.type === 'video' ? (
                <LazyVideo
                  src={item.src}
                  alt={item.alt}
                  playbackRate={0.67}
                />
              ) : (
                <img src={item.src} alt={item.alt} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (part.type === 'mediaPair') {
    // Two takes side by side (e.g. the original clip and its EN re-shoot);
    // stacked on a phone.
    return (
      <div className="case-image-band case-media-pair">
        {part.label ? <span>{part.label}</span> : null}
        <div className="case-media-pair__items">
          {part.items.map((item) => (
            <figure key={item.media.src} className="case-media-pair__item">
              <CaseMedia media={item.media} />
              <MediaCaption caption={item.caption} credit={item.credit} />
            </figure>
          ))}
        </div>
        <MediaCaption caption={part.caption} credit={part.credit} />
      </div>
    );
  }

  if (part.type === 'compareTable') {
    // Two options side by side, row by row (e.g. the business option and mine).
    return (
      <section className="case-compare">
        {part.heading ? <h3>{part.heading}</h3> : null}
        {part.intro ? <p className="case-compare__intro">{part.intro}</p> : null}
        <div className="case-compare__scroll">
          <table>
            <thead>
              <tr>
                <td />
                {part.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {part.rows.map(([label, ...cells]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {cells.map((cell, index) => (
                    // data-label: the column name, shown above each cell on a phone.
                    <td key={`${label}-${index}`} data-label={part.columns[index]}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {part.note ? <p className="case-compare__note">{part.note}</p> : null}
      </section>
    );
  }

  if (part.type === 'caseTeaser') {
    // A card that leads on to a related case.
    return (
      <a className="case-teaser" href={part.href}>
        <span className="case-teaser__copy">
          {part.label ? <span className="case-teaser__label">{part.label}</span> : null}
          <span className="case-teaser__title">{part.title}</span>
          {part.text ? <span className="case-teaser__text">{part.text}</span> : null}
          <span className="case-teaser__cta">
            {part.cta}
            <span aria-hidden="true">→</span>
          </span>
        </span>
        {part.image ? (
          <span className="case-teaser__media">
            <img src={part.image.src} alt={part.image.alt} loading="lazy" />
          </span>
        ) : null}
      </a>
    );
  }

  if (part.type === 'phoneRow') {
    return <PhoneRow part={part} />;
  }

  if (part.type === 'flowVideos') {
    return <FlowVideos part={part} />;
  }

  if (part.type === 'beforeAfterSlider') {
    return <BeforeAfterSlider before={part.before} after={part.after} caption={part.caption} />;
  }

  if (part.type === 'siteLink') {
    return (
      <div className="case-site-link">
        <span>{part.label || text.projectLink}</span>
        <a href={part.href} target="_blank" rel="noopener noreferrer">
          {part.text || part.href}
        </a>
      </div>
    );
  }

  return null;
}

/*
 * Closing block of every case: the rest of the work, so the case is a loop
 * rather than a dead end. Compact tiles without covers — each project is told
 * apart by a dot in its home-card surface colour (keyed by `surface`).
 */
function NextProjects({ items }) {
  const text = useUi().case;

  if (!items.length) {
    return null;
  }

  return (
    <section className="case-next" data-reveal data-track-area="more-work">
      <header className="case-next__header">
        <p className="section-label">{text.moreWork}</p>
        <h2>{text.otherProjects}</h2>
      </header>

      <div className="case-next__grid">
        {items.map((item) => (
          <a
            key={item.id}
            className={`case-next__card case-next__card--${item.surface}`}
            data-case={item.id}
            href={item.href}
          >
            <span className="case-next__dot" aria-hidden="true" />
            <span className="case-next__title">{item.title}</span>
            <span className="case-next__cta">
              {text.openCase}
              <span className="case-next__arrow" aria-hidden="true">
                →
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Lightbox({ src, alt, onClose }) {
  const text = useUi().case;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="case-lightbox" onClick={onClose}>
      <button className="case-lightbox__close" onClick={onClose} aria-label={text.closeImage}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <img
        className="case-lightbox__img"
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function CaseStudyPage({
  caseStudy,
  cases = [],
  profile,
  headerBrandHref,
  showReturnHome = true,
  showSectionBackLink = true,
}) {
  const text = useUi().case;
  const [lightbox, setLightbox] = useState(null);

  const otherCases = cases.filter((item) => item.href !== `/${caseStudy.slug}`);

  const handleImageClick = useCallback((event) => {
    // Covers in the closing block are links, not zoomable case media.
    if (
      event.target.tagName === 'IMG' &&
      !event.target.closest('.case-ba-slider') &&
      !event.target.closest('.case-next') &&
      !event.target.closest('.case-teaser')
    ) {
      setLightbox({
        // currentSrc: the file <picture> actually picked (the phone's take).
        src: event.target.currentSrc || event.target.src,
        alt: event.target.alt,
      });
    }
  }, []);

  return (
    <div className={`case-page case-page--${caseStudy.slug}`} onClick={handleImageClick}>
      {lightbox ? (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      ) : null}

      <div className="case-page__shell">
        {profile ? (
          <SiteHeader
            profile={profile}
            brandHref={headerBrandHref}
            showReturnHome={showReturnHome}
          />
        ) : null}

        <section className="case-hero">
          <div className="case-hero__copy">
            <div className="case-hero__intro">
              <h1>{caseStudy.hero.title}</h1>
              <p className="case-hero__description">{caseStudy.hero.description}</p>
            </div>
            <StatGrid items={caseStudy.hero.stats} className="case-stat-grid--hero" />
            <HeroMeta text={caseStudy.hero.meta} items={caseStudy.hero.points} />
          </div>

          <HeroMedia image={caseStudy.hero.image} />
        </section>

        {caseStudy.showcase ? <CaseShowcase showcase={caseStudy.showcase} /> : null}

        <div className="case-chapters">
          {caseStudy.sections.map((section) => (
            <section key={section.id} id={section.id} className="case-study-section" data-reveal>
              {/*
                * Title first: it has to line up with the top of the chapter's
                * content, and a link above it pushed the title down instead.
                */}
              <div className="case-study-section__intro">
                <h2>{section.title}</h2>
                {showSectionBackLink ? (
                  <a className="case-back-link case-section-back" href={caseStudy.backHref}>
                    <span aria-hidden="true">←</span>
                    {/* Cases opened from a listing other than home lead back to it. */}
                    <span>
                      {caseStudy.backLabel ||
                        (caseStudy.backHref === '/' ? text.allWork : text.back)}
                    </span>
                  </a>
                ) : null}
              </div>

              <div className="case-study-section__content">
                {section.parts.map((part, partIndex) => (
                  <SectionPart key={`${section.id}-${part.type}-${partIndex}`} part={part} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <NextProjects items={otherCases} />
      </div>

      {profile ? <SiteFooter profile={profile} /> : null}
    </div>
  );
}

export const BetboomPassPage = CaseStudyPage;
